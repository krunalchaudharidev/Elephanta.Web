import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  Wallet,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import RemoteImage from '../../components/store/RemoteImage'
import {
  applyCartCoupon,
  getCartSessionId,
  getCartSummary,
  normalizeCartSummary,
  removeCartCoupon,
} from '../../services/cartapi'
import { loadCustomerAuth } from '../../services/authapi'
import { searchOffers } from '../../services/offerapi'
import { createUserAddress, getUserAddresses, getUserProfile } from '../../services/userapi'
import { getWebsiteSetting } from '../../services/websitesettingsapi'

const initialItems = [
  {
    id: 1,
    name: 'Royal Kundan Bridal Necklace',
    variant: 'Gold Plated',
    price: 20200,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 2,
    name: 'Pearl Drop Statement Earrings',
    variant: 'Pearl White',
    price: 7700,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 3,
    name: 'Elegant Solitaire Crystal Ring',
    variant: 'Silver Tone',
    price: 4000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=240&q=80',
  },
]

const states = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const paymentOptions = [
  { id: 'card', title: 'Credit / Debit Card', description: 'Visa, Mastercard and other supported cards', icon: CreditCard },
  { id: 'upi', title: 'UPI', description: 'Pay using your UPI app', icon: Wallet },
  { id: 'netbanking', title: 'Net Banking', description: 'Choose your bank at payment', icon: Landmark },
  { id: 'cod', title: 'Cash on Delivery', description: 'Subject to serviceability and order eligibility', icon: ShoppingBag },
]

const initialAddress = {
  fullName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  country: 'India',
  city: '',
  state: '',
  pinCode: '',
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 2000

function mapSavedAddress(address) {
  return {
    id: address?.id ?? address?.Id,
    addressLine1: address?.addressLine1 ?? address?.AddressLine1 ?? '',
    addressLine2: address?.addressLine2 ?? address?.AddressLine2 ?? '',
    city: address?.city ?? address?.City ?? '',
    state: address?.state ?? address?.State ?? '',
    postalCode: address?.postalCode ?? address?.PostalCode ?? '',
    country: address?.country ?? address?.Country ?? '',
    isPrimary: address?.isPrimary ?? address?.IsPrimary ?? address?.isDefault ?? false,
  }
}

function getAddressFormValues(savedAddress) {
  return {
    address1: savedAddress.addressLine1,
    address2: savedAddress.addressLine2,
    city: savedAddress.city,
    state: savedAddress.state,
    pinCode: savedAddress.postalCode,
    country: savedAddress.country || 'India',
  }
}

const inputClass = 'w-full rounded-md border border-[#e6ded4] bg-white px-3 py-3 text-sm text-[#172923] outline-none transition placeholder:text-[#aaa198] focus:border-[#a77b4c] focus:ring-2 focus:ring-[#a77b4c]/10'

const formatPrice = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount)

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a77b4c] text-sm font-medium text-white">
        {number}
      </span>
      <div>
        <h2 className="font-serif text-xl sm:text-2xl">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-[#898177]">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, required, ...props }) {
  const id = `checkout-${name}`

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-[#353a35]">
        {label}{required && <span className="ml-1 text-[#a77b4c]">*</span>}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClass}
        {...props}
      />
    </div>
  )
}

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-[#353a35]">
        {label}<span className="ml-1 text-[#a77b4c]">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          name={id === 'checkout-state' ? 'state' : 'country'}
          value={value}
          onChange={onChange}
          required
          className={`${inputClass} appearance-none pr-9`}
        >
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#898177]" />
      </div>
    </div>
  )
}

export default function Checkout() {
  const location = useLocation()
  const checkoutData = location.state
  const isLoggedIn = Boolean(loadCustomerAuth()?.accessToken)
  const [items] = useState(checkoutData?.items ?? initialItems)
  const [address, setAddress] = useState(initialAddress)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [addressesLoading, setAddressesLoading] = useState(isLoggedIn)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    DEFAULT_FREE_SHIPPING_THRESHOLD
  )
  const [cartSummary, setCartSummary] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [coupon, setCoupon] = useState(checkoutData?.appliedCoupon ?? '')
  const [appliedCoupon, setAppliedCoupon] = useState(checkoutData?.appliedCoupon ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponMessageIsError, setCouponMessageIsError] = useState(false)
  const [couponBusy, setCouponBusy] = useState(false)
  const [couponSummaryLoading, setCouponSummaryLoading] = useState(true)
  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemsSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const subtotal = cartSummary?.subtotal ?? itemsSubtotal
  const shipping = cartSummary?.shippingCharges
    ?? (subtotal >= freeShippingThreshold ? 0 : 99)
  const discount = cartSummary?.couponDiscount ?? 0
  const total = cartSummary?.finalPayableAmount
    ?? Math.max(0, subtotal - discount) + shipping

  useEffect(() => {
    let cancelled = false

    async function loadWebsiteSettings() {
      try {
        const settings = await getWebsiteSetting()
        const threshold =
          settings?.freeShippingOnOrdersAbove ??
          settings?.FreeShippingOnOrdersAbove
        if (threshold !== undefined && threshold !== null) {
          const value = Number(threshold)
          if (!cancelled && Number.isFinite(value) && value >= 0) {
            setFreeShippingThreshold(value)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load website settings for checkout shipping.', error)
        }
      }
    }

    loadWebsiteSettings()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCartSummary() {
      try {
        const summary = normalizeCartSummary(
          await getCartSummary(getCartSessionId())
        )
        if (cancelled) return
        setCartSummary(summary)
        const appliedCode = summary.couponValid ? summary.couponCode : ''
        setAppliedCoupon(appliedCode)
        setCoupon(appliedCode)
        setCouponMessage(summary.couponError)
        setCouponMessageIsError(Boolean(summary.couponError))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load checkout cart summary.', error)
          setCouponMessage(error?.message || 'Unable to load your coupon status.')
          setCouponMessageIsError(true)
        }
      } finally {
        if (!cancelled) setCouponSummaryLoading(false)
      }
    }

    loadCartSummary()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadOffers() {
      setOffersLoading(true)
      setOffersError('')
      try {
        const response = await searchOffers({
          isActive: true,
          includeExpired: false,
          pageNumber: 1,
          pageSize: 100,
        })
        if (!cancelled) setOffers(response?.items ?? response?.Items ?? [])
      } catch (error) {
        if (!cancelled) {
          setOffersError(error?.message || 'Unable to load available offers.')
        }
      } finally {
        if (!cancelled) setOffersLoading(false)
      }
    }

    loadOffers()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return undefined
    let cancelled = false

    async function loadCustomerDetails() {
      setAddressesLoading(true)
      setAddressError('')
      const [addressResult, profileResult] = await Promise.allSettled([
        getUserAddresses(),
        getUserProfile(),
      ])
      if (cancelled) return

      const errors = []
      if (addressResult.status === 'fulfilled') {
        const response = addressResult.value
        const addressList = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? []
        if (Array.isArray(addressList)) {
          const nextAddresses = addressList.map(mapSavedAddress)
          setSavedAddresses(nextAddresses)
          if (nextAddresses.length > 0) {
            const defaultIndex = nextAddresses.findIndex((item) => item.isPrimary)
            const selectedIndex = defaultIndex >= 0 ? defaultIndex : 0
            const defaultAddress = nextAddresses[selectedIndex]
            const selectedId = String(defaultAddress.id ?? selectedIndex)
            setSelectedAddressId(selectedId)
            setAddress((current) => ({
              ...current,
              ...getAddressFormValues(defaultAddress),
            }))
            setIsAddingAddress(false)
          } else {
            setIsAddingAddress(true)
          }
        } else {
          errors.push('Your saved addresses could not be loaded.')
          setIsAddingAddress(true)
        }
      } else {
        errors.push(addressResult.reason?.message || 'Unable to load your saved addresses.')
        setIsAddingAddress(true)
      }

      if (profileResult.status === 'fulfilled') {
        const response = profileResult.value
        const user = response?.user ?? response?.User ?? response ?? {}
        const fullName = [
          user.firstName ?? user.FirstName,
          user.middleName ?? user.MiddleName,
          user.lastName ?? user.LastName,
        ].filter(Boolean).join(' ')
        setAddress((current) => ({
          ...current,
          fullName: fullName || current.fullName,
          email: user.email ?? user.Email ?? current.email,
          phone: user.phoneNumber ?? user.PhoneNumber ?? current.phone,
        }))
      } else {
        errors.push(profileResult.reason?.message || 'Unable to load your profile details.')
      }

      setAddressError(errors.join(' '))
      setAddressesLoading(false)
    }

    loadCustomerDetails()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  function handleAddressChange(event) {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
    setOrderMessage('')
  }

  function selectSavedAddress(savedAddress, index) {
    setSelectedAddressId(String(savedAddress.id ?? index))
    setAddress((current) => ({
      ...current,
      ...getAddressFormValues(savedAddress),
    }))
    setAddressError('')
  }

  function startNewAddress() {
    setAddress((current) => ({
      ...initialAddress,
      fullName: current.fullName,
      email: current.email,
      phone: current.phone,
    }))
    setAddressError('')
    setIsAddingAddress(true)
  }

  function cancelNewAddress() {
    const savedAddress = savedAddresses.find(
      (item, index) => String(item.id ?? index) === selectedAddressId
    )
    if (savedAddress) {
      setAddress((current) => ({
        ...current,
        ...getAddressFormValues(savedAddress),
      }))
      setIsAddingAddress(false)
    }
  }

  async function saveNewAddress() {
    if (
      !address.address1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pinCode.trim() ||
      !address.country.trim()
    ) {
      setAddressError('Complete the required address fields before saving.')
      return
    }
    if (!/^[0-9]{6}$/.test(address.pinCode.trim())) {
      setAddressError('Enter a valid 6-digit PIN code before saving.')
      return
    }

    setIsSavingAddress(true)
    setAddressError('')
    try {
      const response = await createUserAddress({
        addressLine1: address.address1.trim(),
        addressLine2: address.address2.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.pinCode.trim(),
        country: address.country.trim(),
        isPrimary: savedAddresses.length === 0,
      })
      const savedAddress = mapSavedAddress(response)
      if (savedAddress.id === undefined || savedAddress.id === null) {
        throw new Error('The saved address response is invalid.')
      }
      setSavedAddresses((current) => [
        ...current.map((item) => (
          savedAddress.isPrimary ? { ...item, isPrimary: false } : item
        )),
        savedAddress,
      ])
      setSelectedAddressId(String(savedAddress.id))
      setAddress((current) => ({
        ...current,
        ...getAddressFormValues(savedAddress),
      }))
      setIsAddingAddress(false)
    } catch (error) {
      setAddressError(error?.message || 'Unable to save your address.')
    } finally {
      setIsSavingAddress(false)
    }
  }

  async function handleCoupon(event) {
    event?.preventDefault()
    const code = coupon.trim().toUpperCase()
    if (!code) {
      setCouponMessage('Please enter a coupon code.')
      setCouponMessageIsError(true)
      return
    }

    setCouponBusy(true)
    setCouponMessage('')
    setCouponMessageIsError(false)
    try {
      const summary = normalizeCartSummary(
        await applyCartCoupon(code, getCartSessionId())
      )
      setCartSummary(summary)
      const appliedCode = summary.couponValid
        ? summary.couponCode || code
        : ''
      setAppliedCoupon(appliedCode)
      setCoupon(appliedCode || code)
      setCouponMessage(
        summary.couponValid
          ? 'Coupon applied.'
          : summary.couponError || 'This coupon could not be applied.'
      )
      setCouponMessageIsError(!summary.couponValid)
    } catch (error) {
      console.error('Failed to apply checkout coupon.', error)
      setCouponMessage(error?.message || 'Unable to apply this coupon.')
      setCouponMessageIsError(true)
    } finally {
      setCouponBusy(false)
    }
  }

  async function removeCoupon() {
    if (!cartSummary?.couponCode && !appliedCoupon) return

    setCouponBusy(true)
    setCouponMessage('')
    setCouponMessageIsError(false)
    try {
      const summary = normalizeCartSummary(
        await removeCartCoupon(getCartSessionId())
      )
      setCartSummary(summary)
      setAppliedCoupon(summary.couponValid ? summary.couponCode : '')
      setCoupon(summary.couponCode)
      setCouponMessage(summary.couponError || 'Coupon removed.')
      setCouponMessageIsError(Boolean(summary.couponError))
    } catch (error) {
      console.error('Failed to remove checkout coupon.', error)
      setCouponMessage(error?.message || 'Unable to remove this coupon.')
      setCouponMessageIsError(true)
    } finally {
      setCouponBusy(false)
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault()
    setOrderMessage('')
    if (!items.length) {
      setOrderMessage('Your shopping bag is empty.')
      return
    }
    if (
      !address.fullName.trim() ||
      !address.email.trim() ||
      !address.phone.trim() ||
      !address.address1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.country.trim() ||
      !/^[0-9]{6}$/.test(address.pinCode.trim())
    ) {
      setOrderMessage('Complete your shipping address before continuing.')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setOrderMessage('Your details are valid. Connect your checkout API and payment gateway to place the order.')
    } catch {
      setOrderMessage("We couldn't process your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#fcfaf7] text-[#172923]">
      <section className="relative isolate min-h-[220px] overflow-hidden sm:min-h-[255px]">
        <img
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2000&q=90"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f4ece2] via-[#f4ece2]/95 to-[#f4ece2]/10" />
        <div className="mx-auto flex min-h-[220px] max-w-7xl items-center px-5 py-10 sm:min-h-[255px] lg:px-8">
          <div className="max-w-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#956c3e] sm:text-[10px]">Secure Checkout</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Complete Your Order</h1>
            <p className="mt-3 max-w-md text-xs leading-6 text-[#514f49] sm:text-sm">
            Review your details and choose your preferred payment method to complete your purchase.
            </p>
            <div className="mt-4 h-0.5 w-8 bg-[#a78051]" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-[#77766f]">
          <Link to="/" className="hover:text-[#a78051]">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="text-[#172923]">Checkout</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-10 lg:px-14">
        {!items.length ? (
          <div className="mx-auto max-w-lg border border-[#e9e1d7] bg-white px-6 py-14 text-center">
            <ShoppingBag size={30} className="mx-auto text-[#a77b4c]" />
            <h2 className="mt-4 font-serif text-2xl">Your bag is empty</h2>
            <p className="mt-2 text-sm text-[#827b72]">Add something beautiful before continuing to checkout.</p>
            <Link to="/store/products" className="mt-6 inline-flex items-center gap-2 bg-[#102923] px-5 py-3 text-xs font-medium text-white hover:bg-[#a77b4c]">
              Continue Shopping <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid items-start gap-7 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
              <div className="space-y-7 rounded-lg border border-[#e9e1d7] bg-white p-5 sm:p-7 lg:p-8">
                <section>
                  <SectionHeading
                    number="1"
                    title="Shipping Address"
                    description={isLoggedIn && !isAddingAddress
                      ? 'Choose a saved address or add a new delivery address.'
                      : "Enter your shipping details. We'll use this address to deliver your order."}
                  />
                  {isLoggedIn && addressesLoading ? (
                    <p role="status" className="py-5 text-sm text-[#827b72]">Loading your saved addresses...</p>
                  ) : (
                    <>
                      {addressError && (
                        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                          {addressError}
                        </p>
                      )}

                      {isLoggedIn && savedAddresses.length > 0 && !isAddingAddress ? (
                        <>
                          <fieldset className="space-y-3">
                            <legend className="mb-3 text-sm font-medium text-[#353a35]">Choose a saved address</legend>
                            {savedAddresses.map((savedAddress, index) => {
                              const optionId = String(savedAddress.id ?? index)
                              const isSelected = selectedAddressId === optionId
                              return (
                                <label
                                  key={optionId}
                                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition ${
                                    isSelected
                                      ? 'border-[#a77b4c] bg-[#fcfaf7]'
                                      : 'border-[#e6ded4] hover:border-[#c5aa88]'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="savedShippingAddress"
                                    value={optionId}
                                    checked={isSelected}
                                    required
                                    onChange={() => selectSavedAddress(savedAddress, index)}
                                    className="mt-1 h-4 w-4 accent-[#a77b4c]"
                                  />
                                  <MapPin size={17} className="mt-0.5 shrink-0 text-[#a77b4c]" />
                                  <span className="min-w-0 flex-1 text-xs leading-5 text-[#5f625d]">
                                    <span className="block font-medium text-[#183129]">
                                      {savedAddress.addressLine1}
                                      {savedAddress.addressLine2 && `, ${savedAddress.addressLine2}`}
                                    </span>
                                    <span className="block">
                                      {[savedAddress.city, savedAddress.state, savedAddress.postalCode]
                                        .filter(Boolean)
                                        .join(', ')}
                                    </span>
                                    <span className="block">{savedAddress.country}</span>
                                  </span>
                                  {savedAddress.isPrimary && (
                                    <span className="shrink-0 rounded-full bg-[#eaf1eb] px-2 py-1 text-[10px] font-medium text-[#28553f]">
                                      Default
                                    </span>
                                  )}
                                </label>
                              )
                            })}
                          </fieldset>

                          <div className="mt-5 grid gap-4 border-t border-[#eee6dc] pt-5 sm:grid-cols-2">
                            <p className="text-sm font-medium text-[#353a35] sm:col-span-2">Contact details</p>
                            <Field label="Full Name" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Enter your full name" autoComplete="name" required maxLength={100} />
                            <Field label="Email Address" name="email" type="email" value={address.email} onChange={handleAddressChange} placeholder="you@example.com" autoComplete="email" required maxLength={254} />
                            <Field label="Phone Number" name="phone" type="tel" value={address.phone} onChange={handleAddressChange} placeholder="+91 00000 00000" autoComplete="tel" required maxLength={15} pattern="[0-9+\\s()-]{7,15}" />
                          </div>
                          <button
                            type="button"
                            onClick={startNewAddress}
                            className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#956c3e] transition hover:text-[#183129]"
                          >
                            <Plus size={15} />
                            Add a new address
                          </button>
                        </>
                      ) : (
                        <>
                          {isLoggedIn && savedAddresses.length === 0 && (
                            <p className="mb-4 text-sm text-[#827b72]">
                              You don&apos;t have a saved address yet. Add one below to save it to your account.
                            </p>
                          )}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Full Name" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Enter your full name" autoComplete="name" required maxLength={100} />
                            <Field label="Email Address" name="email" type="email" value={address.email} onChange={handleAddressChange} placeholder="you@example.com" autoComplete="email" required maxLength={254} />
                            <Field label="Phone Number" name="phone" type="tel" value={address.phone} onChange={handleAddressChange} placeholder="+91 00000 00000" autoComplete="tel" required maxLength={15} pattern="[0-9+\\s()-]{7,15}" />
                            <Field label="Address Line 1" name="address1" value={address.address1} onChange={handleAddressChange} placeholder="House No, Building Name" autoComplete="address-line1" required maxLength={200} />
                            <Field label="Address Line 2" name="address2" value={address.address2} onChange={handleAddressChange} placeholder="Apartment, Floor, Landmark" autoComplete="address-line2" maxLength={200} />
                            <SelectField id="checkout-country" label="Country" value={address.country} onChange={handleAddressChange}>
                              <option value="India">India</option>
                            </SelectField>
                            <Field label="City" name="city" value={address.city} onChange={handleAddressChange} placeholder="Enter your city" autoComplete="address-level2" required maxLength={100} />
                            <SelectField id="checkout-state" label="State" value={address.state} onChange={handleAddressChange}>
                              <option value="">Select state</option>
                              {states.map((state) => <option key={state} value={state}>{state}</option>)}
                            </SelectField>
                            <Field label="PIN Code" name="pinCode" value={address.pinCode} onChange={handleAddressChange} placeholder="6 digits" autoComplete="postal-code" required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" />
                          </div>
                          <p className="mt-3 text-[10px] leading-5 text-[#898177]">Please ensure your address and PIN code are correct before placing your order.</p>
                          {isLoggedIn && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={saveNewAddress}
                                disabled={isSavingAddress}
                                className="rounded-md bg-[#102923] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#24483b] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isSavingAddress ? 'Saving address...' : 'Save address to my account'}
                              </button>
                              {savedAddresses.length > 0 && (
                                <button
                                  type="button"
                                  onClick={cancelNewAddress}
                                  className="rounded-md border border-[#e6ded4] px-4 py-2.5 text-xs text-[#5f625d] transition hover:bg-[#fcfaf7]"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </section>

                <div className="border-t border-[#eee6dc]" />

                <section>
                  <SectionHeading number="2" title="Payment Method" description="Select your preferred payment method." />
                  <div className="overflow-hidden rounded-md border border-[#e7dfd5]">
                    {paymentOptions.map((option, index) => {
                      const Icon = option.icon
                      return (
                        <label key={option.id} className={`flex cursor-pointer items-center gap-3 p-4 transition hover:bg-[#fcfaf7] ${index ? 'border-t border-[#eee6dc]' : ''}`}>
                          <input type="radio" name="paymentMethod" value={option.id} checked={paymentMethod === option.id} onChange={(event) => setPaymentMethod(event.target.value)} className="h-4 w-4 accent-[#a77b4c]" />
                          <Icon size={19} className="shrink-0 text-[#a77b4c]" />
                          <span className="flex-1">
                            <span className="block text-xs font-medium">{option.title}</span>
                            <span className="mt-1 block text-[10px] leading-4 text-[#898177]">{option.description}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="mt-3 rounded-md bg-[#f7f2eb] p-3 text-[11px] leading-5 text-[#74695c]">
                    {paymentMethod === 'card' && <><LockKeyhole size={14} className="mr-2 inline text-[#a77b4c]" />Card details will be entered securely through your configured payment gateway.</>}
                    {paymentMethod === 'upi' && "You'll complete the UPI payment through your configured payment provider."}
                    {paymentMethod === 'netbanking' && 'Available banks will be displayed by your payment provider.'}
                    {paymentMethod === 'cod' && 'Cash on delivery is subject to delivery-area and order eligibility checks.'}
                  </p>
                </section>

                <div className="flex items-start gap-3 rounded-md bg-[#f5efe5] p-4">
                  <ShieldCheck size={20} className="shrink-0 text-[#a77b4c]" />
                  <div>
                    <p className="text-xs font-medium">Your information is safe and secure</p>
                    <p className="mt-1 text-[10px] leading-5 text-[#898177]">Payment information is handled through your configured payment provider.</p>
                  </div>
                </div>

                {orderMessage && <div role="status" className="rounded-md border border-[#e4d4c0] bg-[#fcf6ed] p-4 text-xs leading-5 text-[#745a3d]">{orderMessage}</div>}

                <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                  <Link to="/store/cart" state={{ items, appliedCoupon }} className="inline-flex items-center justify-center gap-2 py-3 text-xs text-[#756d63] transition hover:text-[#a77b4c]">
                    <ArrowLeft size={15} /> Back to Cart
                  </Link>
                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-3 rounded-md bg-[#102923] px-6 py-4 text-xs font-medium text-white transition hover:bg-[#a77b4c] disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Please wait...' : 'Continue to Payment'}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-6">
                <div className="rounded-lg border border-[#e9e1d7] bg-white p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-2xl">Order Summary</h2>
                    <Link to="/store/cart" state={{ items, appliedCoupon }} className="text-[11px] text-[#9a7047] underline underline-offset-4 hover:text-[#172923]">Edit Cart</Link>
                  </div>
                  <div className="mt-5 divide-y divide-[#eee6dc]">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 py-4 first:pt-0">
                        <RemoteImage src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-md bg-[#f2ebe2] object-cover" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-medium leading-5">{item.name}</h3>
                          <p className="mt-1 text-[10px] text-[#898177]">{item.variant} <span className="mx-1">|</span> {item.quantity} ×</p>
                        </div>
                        <p className="shrink-0 pt-1 text-xs font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 space-y-4 border-t border-[#e9e1d7] py-5 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-[#77756e]">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-[#77756e]">Shipping</span><span className="font-medium text-green-700">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between gap-3 text-green-700">
                        <span>
                          Coupon discount{cartSummary?.couponCode ? ` (${cartSummary.couponCode})` : ''}
                        </span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#e9e1d7] py-5">
                    <label htmlFor="checkout-coupon" className="mb-3 flex items-center gap-2 text-xs font-medium">
                      <Tag size={15} className="text-[#a77b4c]" />
                      Apply Coupon
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="checkout-coupon"
                        value={coupon}
                        disabled={couponSummaryLoading}
                        onChange={(event) => {
                          setCoupon(event.target.value)
                          setCouponMessage('')
                          setCouponMessageIsError(false)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            handleCoupon()
                          }
                        }}
                        placeholder="Enter code"
                        className="min-w-0 flex-1 rounded-md border border-[#e5dcd1] px-3 py-3 text-xs uppercase outline-none focus:border-[#a77b4c]"
                      />
                      <button
                        type="button"
                        onClick={handleCoupon}
                        disabled={couponBusy || couponSummaryLoading}
                        className="rounded-md border border-[#a77b4c] px-4 text-xs font-medium text-[#936b43] transition hover:bg-[#a77b4c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {couponSummaryLoading ? 'Loading...' : couponBusy ? 'Please wait...' : 'Apply'}
                      </button>
                      {cartSummary?.couponCode && (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          disabled={couponBusy || couponSummaryLoading}
                          className="rounded-md border border-[#e5dcd1] px-3 text-xs font-medium text-[#827b72] transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {couponMessage && (
                      <p role={couponMessageIsError ? 'alert' : 'status'} className={`mt-2 text-[10px] leading-5 ${couponMessageIsError ? 'text-red-600' : 'text-green-700'}`}>
                        {couponMessage}
                      </p>
                    )}
                    <fieldset className="mt-4">
                      <legend className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#827b72]">
                        Available offers
                      </legend>
                      {offersLoading ? (
                        <p role="status" className="text-[10px] text-[#827b72]">Loading offers...</p>
                      ) : offersError ? (
                        <p role="alert" className="text-[10px] text-red-600">{offersError}</p>
                      ) : offers.filter((offer) => offer.code ?? offer.Code).length === 0 ? (
                        <p className="text-[10px] text-[#827b72]">No offers available right now.</p>
                      ) : (
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {offers.map((offer) => {
                            const code = offer.code ?? offer.Code
                            if (!code) return null

                            const name = offer.name ?? offer.Name ?? 'Special offer'
                            const discountType = offer.discountType ?? offer.DiscountType
                            const discountValue = offer.discountValue ?? offer.DiscountValue
                            const discountLabel = discountType?.toLowerCase() === 'percentage'
                              ? `${discountValue}% off`
                              : discountValue != null
                                ? `${formatPrice(Number(discountValue))} off`
                                : ''

                            return (
                              <label
                                key={offer.id ?? offer.Id ?? code}
                                className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-[10px] transition ${
                                  coupon.trim().toUpperCase() === String(code).toUpperCase()
                                    ? 'border-[#a77b4c] bg-[#fbf8f4]'
                                    : 'border-[#e5dcd1]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="available-checkout-coupon"
                                  value={code}
                                  checked={coupon.trim().toUpperCase() === String(code).toUpperCase()}
                                  disabled={couponBusy || couponSummaryLoading}
                                  onChange={() => {
                                    setCoupon(String(code))
                                    setCouponMessage('')
                                    setCouponMessageIsError(false)
                                  }}
                                  className="mt-0.5 accent-[#a77b4c]"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block font-medium text-[#17251f]">{name}</span>
                                  <span className="mt-0.5 block text-[#827b72]">
                                    {code}{discountLabel ? ` · ${discountLabel}` : ''}
                                  </span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </fieldset>
                  </div>

                  <div className="border-t border-[#e9e1d7] pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-serif text-xl">Total</span>
                      <span className="text-2xl font-semibold">{formatPrice(total)}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-[#898177]">Final taxes and charges are subject to server validation.</p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e9e1d7] bg-[#f8f2e9] p-5">
                  {[
                    { icon: Truck, title: 'Free Shipping', description: `On orders above ${formatPrice(freeShippingThreshold)}` },
                    { icon: ShieldCheck, title: 'Secure Payments', description: 'Protected payment processing' },
                    { icon: Check, title: 'Easy Returns', description: 'As per our return policy' },
                  ].map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex items-center gap-3 py-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e4d2bb] text-[#a77b4c]"><Icon size={17} /></span>
                      <div><p className="text-xs font-medium">{title}</p><p className="mt-1 text-[10px] text-[#898177]">{description}</p></div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </form>
        )}
      </div>

      <section className="border-y border-[#e9e0d5] bg-[#f4eade]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center sm:px-10 lg:px-14">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7047]">A little luxury, every day</p>
            <h2 className="mt-2 font-serif text-2xl">Find the perfect piece for your next chapter.</h2>
          </div>
          <Link to="/store/collections" className="inline-flex items-center justify-center gap-3 self-start bg-[#a77b4c] px-5 py-3.5 text-xs font-medium text-white transition hover:bg-[#815b36] sm:self-auto">
            Explore Collections <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}