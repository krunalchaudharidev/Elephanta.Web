import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

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
  const [items] = useState(checkoutData?.items ?? initialItems)
  const [address, setAddress] = useState(initialAddress)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [giftWrap, setGiftWrap] = useState(checkoutData?.giftWrap ?? true)
  const [coupon, setCoupon] = useState(checkoutData?.appliedCoupon ?? '')
  const [appliedCoupon, setAppliedCoupon] = useState(checkoutData?.appliedCoupon ?? '')
  const [couponMessage, setCouponMessage] = useState(
    checkoutData?.appliedCoupon ? 'Your coupon has been applied.' : ''
  )
  const [orderMessage, setOrderMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const shipping = subtotal >= 2000 ? 0 : 99
  const expressFee = shippingMethod === 'express' ? 199 : 0
  const giftWrapFee = giftWrap && items.length > 0 ? 99 : 0
  const discount = appliedCoupon === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0
  const total = Math.max(0, subtotal - discount) + shipping + expressFee + giftWrapFee

  function handleAddressChange(event) {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
    setOrderMessage('')
  }

  function handleCoupon() {
    const code = coupon.trim().toUpperCase()
    if (code === 'WELCOME10') {
      setAppliedCoupon(code)
      setCoupon(code)
      setCouponMessage('Welcome! Your 10% discount has been applied.')
    } else {
      setAppliedCoupon('')
      setCouponMessage(code ? 'Invalid coupon code. Please try another.' : 'Enter a coupon code to apply it.')
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault()
    setOrderMessage('')
    if (!items.length) {
      setOrderMessage('Your shopping bag is empty.')
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
      <div className="bg-[#102923] px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white sm:text-[10px]">
        <span className="mx-3 text-[#c5a06e]">-</span>
        Free shipping on orders above {formatPrice(2000)}
        <span className="mx-3 text-[#c5a06e]">-</span>
      </div>

      <section className="relative isolate overflow-hidden border-b border-[#eee5da]">
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f8f1e8] via-[#f8f1e8]/95 to-[#f8f1e8]/40" />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a7047]">Secure Checkout</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Complete Your Order</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#6f6c64]">
            Review your details and choose your preferred payment method to complete your purchase.
          </p>
          <div className="mt-6 h-px w-12 bg-[#a77b4c]" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-10 lg:px-14">
        <div className="mb-8 flex items-center justify-between gap-2 sm:mb-10 sm:gap-4" aria-label="Checkout progress">
          {[
            { number: '1', title: 'Shipping Address', active: true },
            { number: '2', title: 'Payment Method', active: false },
            { number: '3', title: 'Order Confirmation', active: false },
          ].map((step, index) => (
            <div key={step.number} className="contents">
              <div className={`flex shrink-0 items-center gap-2 text-[10px] sm:text-xs ${step.active ? 'font-semibold text-[#9a7047]' : 'text-[#898177]'}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border sm:h-8 sm:w-8 ${step.active ? 'border-[#a77b4c] bg-[#a77b4c] text-white' : 'border-[#d8cbb9]'}`}>
                  {step.number}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {index < 2 && <div className="h-px min-w-3 flex-1 bg-[#ded3c5]" />}
            </div>
          ))}
        </div>

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
                  <SectionHeading number="1" title="Shipping Address" description="Enter your shipping details. We'll use this address to deliver your order." />
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
                </section>

                <div className="border-t border-[#eee6dc]" />

                <section>
                  <SectionHeading number="2" title="Shipping Method" description="Choose how you would like your order delivered." />
                  <div className="overflow-hidden rounded-md border border-[#e7dfd5]">
                    {[
                      { id: 'standard', title: 'Standard Shipping', description: 'Delivery in 5-7 business days', price: shipping === 0 ? 'FREE' : formatPrice(shipping) },
                      { id: 'express', title: 'Express Shipping', description: 'Delivery in 2-3 business days', price: formatPrice(199) },
                    ].map((method, index) => (
                      <label key={method.id} className={`flex cursor-pointer items-center gap-3 p-4 transition hover:bg-[#fcfaf7] ${index ? 'border-t border-[#eee6dc]' : ''}`}>
                        <input type="radio" name="shippingMethod" value={method.id} checked={shippingMethod === method.id} onChange={(event) => setShippingMethod(event.target.value)} className="h-4 w-4 accent-[#a77b4c]" />
                        <Truck size={19} className="shrink-0 text-[#a77b4c]" />
                        <span className="flex-1">
                          <span className="block text-xs font-medium">{method.title}</span>
                          <span className="mt-1 block text-[10px] text-[#898177]">{method.description}</span>
                        </span>
                        <span className={`text-xs font-semibold ${method.price === 'FREE' ? 'text-green-700' : ''}`}>{method.price}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <div className="border-t border-[#eee6dc]" />

                <section>
                  <SectionHeading number="3" title="Payment Method" description="Select your preferred payment method." />
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
                  <Link to="/store/cart" state={{ items, appliedCoupon, giftWrap }} className="inline-flex items-center justify-center gap-2 py-3 text-xs text-[#756d63] transition hover:text-[#a77b4c]">
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
                    <Link to="/store/cart" state={{ items, appliedCoupon, giftWrap }} className="text-[11px] text-[#9a7047] underline underline-offset-4 hover:text-[#172923]">Edit Cart</Link>
                  </div>
                  <div className="mt-5 divide-y divide-[#eee6dc]">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 py-4 first:pt-0">
                        <img src={item.image} alt={item.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-md bg-[#f2ebe2] object-cover" />
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
                    {expressFee > 0 && <div className="flex justify-between gap-3"><span className="text-[#77756e]">Express delivery</span><span>{formatPrice(expressFee)}</span></div>}
                    {discount > 0 && <div className="flex justify-between gap-3 text-green-700"><span>Coupon discount (10%)</span><span>-{formatPrice(discount)}</span></div>}
                    {giftWrap && <div className="flex justify-between gap-3"><span className="text-[#77756e]">Gift wrapping</span><span>{formatPrice(giftWrapFee)}</span></div>}
                  </div>

                  <div className="border-t border-[#e9e1d7] py-5">
                    <label htmlFor="checkout-coupon" className="mb-3 block text-xs font-medium">Have a coupon code?</label>
                    <div className="flex gap-2">
                      <input id="checkout-coupon" value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponMessage('') }} placeholder="Enter coupon code" className="min-w-0 flex-1 rounded-md border border-[#e5dcd1] px-3 py-3 text-xs uppercase outline-none focus:border-[#a77b4c]" />
                      <button type="button" onClick={handleCoupon} className="rounded-md bg-[#a77b4c] px-4 text-xs font-medium text-white transition hover:bg-[#815b36]">Apply</button>
                    </div>
                    {couponMessage && <p role="status" className={`mt-2 text-[10px] leading-5 ${appliedCoupon ? 'text-green-700' : 'text-red-600'}`}>{couponMessage}</p>}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 border-t border-[#e9e1d7] py-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e7d8c4] text-[#a77b4c]"><Gift size={19} /></span>
                    <span className="flex-1">
                      <span className="block text-xs font-medium">Make it a Gift</span>
                      <span className="mt-1 block text-[10px] leading-5 text-[#898177]">Add premium gift wrapping to your order.</span>
                      <span className="mt-2 block text-xs font-medium">{formatPrice(99)}</span>
                    </span>
                    <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="mt-1 h-4 w-4 accent-[#a77b4c]" aria-label="Add gift wrapping" />
                  </label>

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
                    { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹2,000' },
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