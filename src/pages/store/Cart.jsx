import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import RemoteImage from '../../components/store/RemoteImage'
import {
  applyCartCoupon,
  deleteCartItem,
  getAllCartItems,
  getCartSessionId,
  getCartSummary,
  removeCartCoupon,
  updateCartItem,
} from '../../services/cartapi'
import { loadCustomerAuth } from '../../services/authapi'
import { searchOffers } from '../../services/offerapi'
import { getProduct } from '../../services/productapi'
import { getWebsiteSetting } from '../../services/websitesettingsapi'
import { addToWishlist } from '../../services/wishlistapi'

const DEFAULT_FREE_SHIPPING_THRESHOLD = 2000

async function mapCartItem(item) {
  const productId = item?.productId ?? item?.ProductId
  let product = null
  if (productId) {
    try {
      product = await getProduct(productId)
    } catch (error) {
      console.error(`Failed to load product details for cart item ${item?.id ?? item?.Id}.`, error)
    }
  }

  const imageIds = product?.imageIds ?? product?.ImageIds ?? []
  const primaryImageId =
    item?.primaryImageId ??
    item?.PrimaryImageId ??
    product?.primaryImageId ??
    product?.PrimaryImageId ??
    imageIds[0] ??
    null
  const price = Number(item?.unitPrice ?? item?.UnitPrice ?? 0)
  const quantity = Number(item?.quantity ?? item?.Quantity ?? 1)
  const rawStockQuantity =
    item?.stockQuantity ??
    item?.StockQuantity ??
    product?.stockQuantity ??
    product?.StockQuantity ??
    0
  const stockQuantity = Number(rawStockQuantity)
  const image =
    item?.image ??
    item?.Image ??
    (primaryImageId
      ? `/api/Media/${encodeURIComponent(primaryImageId)}`
      : '')

  return {
    id: item?.id ?? item?.Id,
    productId,
    name: item?.productName ?? item?.ProductName ?? product?.name ?? product?.Name ?? 'Product',
    category: item?.category ?? item?.Category ?? product?.categoryName ?? product?.CategoryName ?? '',
    variant: item?.variant ?? item?.Variant ?? product?.variant ?? product?.Variant ?? '',
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    stockQuantity: Number.isFinite(stockQuantity) && stockQuantity >= 0 ? stockQuantity : 0,
    image,
    primaryImageId,
  }
}

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price)

function getSummaryAmount(summary, camelCaseName, pascalCaseName) {
  const value = Number(summary?.[camelCaseName] ?? summary?.[pascalCaseName])
  if (!Number.isFinite(value)) {
    throw new Error(`Cart summary response has an invalid ${pascalCaseName}.`)
  }
  return value
}

function normalizeCartSummary(summary) {
  if (!summary || typeof summary !== 'object') {
    throw new Error('Cart summary response is invalid.')
  }

  const couponCode = summary.couponCode ?? summary.CouponCode ?? ''
  const couponError = summary.couponError ?? summary.CouponError ?? ''
  const responseCouponValid = summary.couponValid ?? summary.CouponValid
  if (
    responseCouponValid !== undefined &&
    responseCouponValid !== null &&
    typeof responseCouponValid !== 'boolean'
  ) {
    throw new Error('Cart summary response has an invalid CouponValid.')
  }
  const couponValid =
    responseCouponValid ?? Boolean(couponCode && !couponError)

  return {
    subtotal: getSummaryAmount(summary, 'subtotal', 'Subtotal'),
    couponCode,
    couponValid,
    couponError,
    couponDiscount: getSummaryAmount(summary, 'couponDiscount', 'CouponDiscount'),
    shippingCharges: getSummaryAmount(summary, 'shippingCharges', 'ShippingCharges'),
    finalPayableAmount: getSummaryAmount(
      summary,
      'finalPayableAmount',
      'FinalPayableAmount'
    ),
  }
}

export default function Cart() {
  const location = useLocation()
  const [items, setItems] = useState([])
  const [cartSummary, setCartSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notification, setNotification] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [busyItemIds, setBusyItemIds] = useState([])
  const busyItemIdsRef = useRef(new Set())
  const [wishlistSavingIds, setWishlistSavingIds] = useState([])
  const wishlistSavingIdsRef = useRef(new Set())
  const [guestSaveItem, setGuestSaveItem] = useState(null)
  const [coupon, setCoupon] = useState(() => location.state?.appliedCoupon ?? '')
  const [appliedCoupon, setAppliedCoupon] = useState(() => location.state?.appliedCoupon ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponMessageIsError, setCouponMessageIsError] = useState(false)
  const [couponBusy, setCouponBusy] = useState(false)
  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState('')
  const [giftWrap, setGiftWrap] = useState(() => location.state?.giftWrap ?? false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    DEFAULT_FREE_SHIPPING_THRESHOLD
  )

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
          console.error('Failed to load website settings for cart shipping.', error)
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
        if (!cancelled) {
          setOffers(response?.items ?? response?.Items ?? [])
        }
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
    let cancelled = false

    async function loadCart() {
      setLoading(true)
      setLoadError('')
      try {
        const sessionId = getCartSessionId()
        const [cartItems, summaryResponse] = await Promise.all([
          getAllCartItems(sessionId),
          getCartSummary(sessionId),
        ])
        const mappedItems = await Promise.all(cartItems.map(mapCartItem))
        const summary = normalizeCartSummary(summaryResponse)
        if (!cancelled) {
          setItems(mappedItems)
          setCartSummary(summary)
          setCoupon(summary.couponCode)
          setAppliedCoupon(summary.couponValid ? summary.couponCode : '')
          setCouponMessage(summary.couponError)
          setCouponMessageIsError(Boolean(summary.couponError))
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load cart items.', error)
          setLoadError(error?.message || 'Unable to load your cart.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCart()
    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const subtotal = cartSummary?.subtotal ?? 0
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = cartSummary?.shippingCharges ?? 0
  const hasUnlockedFreeShipping = subtotal >= freeShippingThreshold
  const discount = cartSummary?.couponDiscount ?? 0
  const giftWrapPrice = giftWrap && items.length > 0 ? 99 : 0
  const total = (cartSummary?.finalPayableAmount ?? 0) + giftWrapPrice

  function showCartNotification(message) {
    setNotification(message)
    window.setTimeout(() => setNotification(''), 2500)
  }

  function setItemBusy(id, isBusy) {
    const key = String(id)
    if (isBusy) busyItemIdsRef.current.add(key)
    else busyItemIdsRef.current.delete(key)
    setBusyItemIds(Array.from(busyItemIdsRef.current))
  }

  function updateSummaryState(summaryResponse) {
    const summary = normalizeCartSummary(summaryResponse)
    setCartSummary(summary)
    setAppliedCoupon(summary.couponValid ? summary.couponCode : '')
    return summary
  }

  async function refreshCartSummary() {
    try {
      const summary = updateSummaryState(
        await getCartSummary(getCartSessionId())
      )
      setCouponMessage(summary.couponError)
      setCouponMessageIsError(Boolean(summary.couponError))
    } catch (error) {
      console.error('Failed to refresh cart summary.', error)
      showCartNotification(error?.message || 'Unable to refresh your order summary.')
    }
  }

  async function updateQuantity(id, amount) {
    const item = items.find((current) => String(current.id) === String(id))
    if (!item || busyItemIdsRef.current.has(String(id))) return

    const quantity = Math.max(1, Math.min(99, item.quantity + amount))
    if (quantity === item.quantity) return
    if (amount > 0 && quantity > item.stockQuantity) {
      showCartNotification(`Only ${item.stockQuantity} item(s) are available in stock.`)
      return
    }

    setItemBusy(id, true)
    try {
      const updatedItem = await updateCartItem(id, quantity, getCartSessionId())
      const responseQuantity = Number(
        updatedItem?.quantity ?? updatedItem?.Quantity
      )
      const savedQuantity =
        Number.isFinite(responseQuantity) && responseQuantity > 0
          ? responseQuantity
          : quantity
      setItems((current) => current.map((cartItem) => (
        String(cartItem.id) === String(id)
          ? { ...cartItem, quantity: savedQuantity }
          : cartItem
      )))
      await refreshCartSummary()
    } catch (error) {
      console.error('Failed to update cart item quantity.', error)
      showCartNotification(error?.message || 'Unable to update item quantity.')
    } finally {
      setItemBusy(id, false)
    }
  }

  async function removeItem(id) {
    const item = items.find((current) => String(current.id) === String(id))
    if (!item || busyItemIdsRef.current.has(String(id))) return false

    setItemBusy(id, true)
    try {
      await deleteCartItem(id, getCartSessionId())
      setItems((current) => current.filter(
        (cartItem) => String(cartItem.id) !== String(id)
      ))
      await refreshCartSummary()
      return true
    } catch (error) {
      console.error('Failed to remove cart item.', error)
      showCartNotification(error?.message || 'Unable to remove item from cart.')
      return false
    } finally {
      setItemBusy(id, false)
    }
  }

  async function saveForLater(item) {
    if (!loadCustomerAuth()?.accessToken) {
      setGuestSaveItem(item)
      return
    }

    const lockId = String(item.id)
    if (wishlistSavingIdsRef.current.has(lockId)) return

    wishlistSavingIdsRef.current.add(lockId)
    setWishlistSavingIds(Array.from(wishlistSavingIdsRef.current))
    try {
      await addToWishlist(item.productId)
      if (await removeItem(item.id)) {
        showCartNotification('Item saved to your wishlist and removed from your cart.')
      }
    } catch (error) {
      console.error('Failed to save cart item to wishlist.', error)
      showCartNotification(error?.message || 'Unable to save item to your wishlist.')
    } finally {
      wishlistSavingIdsRef.current.delete(lockId)
      setWishlistSavingIds(Array.from(wishlistSavingIdsRef.current))
    }
  }

  async function removeGuestSaveItem() {
    if (guestSaveItem && await removeItem(guestSaveItem.id)) {
      setGuestSaveItem(null)
    }
  }

  async function applyCoupon(event) {
    event.preventDefault()
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
      const summary = updateSummaryState(
        await applyCartCoupon(code, getCartSessionId())
      )
      const appliedCode = summary.couponValid
        ? summary.couponCode || code
        : ''
      setCoupon(appliedCode || code)
      setCouponMessage(
        summary.couponValid
          ? 'Coupon applied.'
          : summary.couponError || 'This coupon could not be applied.'
      )
      setCouponMessageIsError(!summary.couponValid)
    } catch (error) {
      console.error('Failed to apply cart coupon.', error)
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
      const summary = updateSummaryState(
        await removeCartCoupon(getCartSessionId())
      )
      setCoupon(summary.couponCode)
      setCouponMessage(summary.couponError || 'Coupon removed.')
      setCouponMessageIsError(Boolean(summary.couponError))
    } catch (error) {
      console.error('Failed to remove cart coupon.', error)
      setCouponMessage(error?.message || 'Unable to remove this coupon.')
      setCouponMessageIsError(true)
    } finally {
      setCouponBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#17251f]">
      <section className="relative isolate min-h-[220px] overflow-hidden sm:min-h-[255px]">
        <img
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2000&q=90"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f4ece2] via-[#f4ece2]/95 to-[#f4ece2]/10" />
        <div className="mx-auto flex min-h-[220px] max-w-7xl items-center px-5 py-10 sm:min-h-[255px] lg:px-8">
          <div className="max-w-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#956c3e] sm:text-[10px]">Your Selection</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Shopping Bag</h1>
            <p className="mt-3 max-w-md text-xs leading-6 text-[#514f49] sm:text-sm">
            Review your selected pieces before moving on to secure checkout.
            </p>
            <p className="mt-1 text-[11px] text-[#77766f]">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your bag
            </p>
            <div className="mt-4 h-0.5 w-8 bg-[#a78051]" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-[#77766f]">
          <Link to="/" className="hover:text-[#a78051]">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="text-[#172923]">Shopping Bag</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
        {notification && (
          <p role="status" className="mb-5 rounded-md bg-[#f2eee7] p-3 text-sm text-[#5f574e]">
            {notification}
          </p>
        )}
        {loading ? (
          <p role="status" className="py-16 text-center text-sm text-[#827b72]">
            Loading your cart...
          </p>
        ) : loadError ? (
          <div className="py-16 text-center">
            <p role="alert" className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadCount((current) => current + 1)}
              className="mt-5 rounded-md bg-[#152c24] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#a77b4c]"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f2e9de] text-[#a77b4c]">
              <ShoppingBag size={32} strokeWidth={1.3} />
            </div>
            <h2 className="mt-6 font-serif text-3xl">Your bag is waiting</h2>
            <p className="mt-3 text-sm leading-6 text-[#827b72]">
              Discover something beautiful and find a piece that makes your next moment special.
            </p>
            <Link
              to="/store/collections"
              className="mt-7 inline-flex items-center gap-3 bg-[#152c24] px-6 py-3.5 text-xs font-medium text-white transition hover:bg-[#a77b4c]"
            >
              Explore Collections
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_370px] lg:gap-10">
            <div>
              <div className="mb-4 hidden grid-cols-[1fr_100px_100px] border-b border-[#e9e1d7] pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#827b72] sm:grid">
                <span>Product Details</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
              </div>

              <div className="divide-y divide-[#e9e1d7] border-y border-[#e9e1d7]">
                {items.map((item) => (
                  <article key={item.id} className="grid grid-cols-[88px_1fr] gap-4 py-5 sm:grid-cols-[120px_1fr] sm:gap-5 sm:py-6">
                    <Link to={`/store/products/${encodeURIComponent(item.productId)}`} className="block aspect-[4/5] overflow-hidden rounded-md bg-[#f0e8de]">
                      <RemoteImage
                        src={item.primaryImageId
                          ? `/api/Media/${encodeURIComponent(item.primaryImageId)}`
                          : item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.category && (
                            <p className="text-[9px] uppercase tracking-[0.14em] text-[#a77b4c]">{item.category}</p>
                          )}
                          <Link to={`/store/products/${encodeURIComponent(item.productId)}`} className="mt-1 block font-serif text-base leading-snug transition hover:text-[#a77b4c] sm:text-lg">
                            {item.name}
                          </Link>
                          {item.variant && (
                            <p className="mt-2 text-[11px] text-[#827b72]">Style: {item.variant}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={busyItemIds.includes(String(item.id))}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 p-1 text-[#92887e] transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="mt-3 text-sm font-semibold">{formatPrice(item.price)}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex h-9 items-center rounded-md border border-[#e5dcd1]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1 || busyItemIds.includes(String(item.id))}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="px-2.5 text-[#746a60] hover:text-[#a77b4c] disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= Math.min(99, item.stockQuantity) || busyItemIds.includes(String(item.id))}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="px-2.5 text-[#746a60] hover:text-[#a77b4c] disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="text-xs font-semibold sm:text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-[10px] text-[#827b72]">
                        {item.stockQuantity} available in stock
                      </p>
                      <button
                        type="button"
                        onClick={() => saveForLater(item)}
                        disabled={wishlistSavingIds.includes(String(item.id)) || busyItemIds.includes(String(item.id))}
                        className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-[#827b72] transition hover:text-[#a77b4c] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Heart size={13} />
                        {wishlistSavingIds.includes(String(item.id)) ? 'Saving...' : 'Save for later'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-md bg-[#f2eee7] p-4">
                <Truck size={19} className="mt-0.5 shrink-0 text-[#a77b4c]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">
                    {hasUnlockedFreeShipping
                      ? "You've unlocked free shipping!"
                      : `Add ${formatPrice(freeShippingThreshold - subtotal)} more for free shipping.`}
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-[#827b72]">Free shipping on orders above {formatPrice(freeShippingThreshold)}.</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2d8cb]">
                    <div className="h-full rounded-full bg-[#a77b4c] transition-all" style={{ width: `${freeShippingThreshold === 0 ? 100 : Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }} />
                  </div>
                </div>
              </div>

            </div>

            <aside className="rounded-lg border border-[#e9e1d7] bg-white p-5 sm:p-7 lg:sticky lg:top-24">
              <h2 className="font-serif text-2xl">Order Summary</h2>
              <div className="mt-6 space-y-4 border-b border-[#e9e1d7] pb-5 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-[#827b72]">Subtotal ({totalQuantity} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#827b72]">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? <span className="text-[#548365]">FREE</span> : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between gap-3 text-[#548365]">
                    <span>
                      Coupon discount{cartSummary?.couponCode ? ` (${cartSummary.couponCode})` : ''}
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {giftWrapPrice > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#827b72]">Gift wrapping</span>
                    <span>{formatPrice(giftWrapPrice)}</span>
                  </div>
                )}
              </div>

              <form onSubmit={applyCoupon} className="mt-5">
                <label htmlFor="coupon" className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <Tag size={15} className="text-[#a77b4c]" />
                  Apply Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(event) => {
                      setCoupon(event.target.value)
                      setCouponMessage('')
                      setCouponMessageIsError(false)
                    }}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-md border border-[#e5dcd1] px-3 py-3 text-xs uppercase outline-none focus:border-[#a77b4c]"
                  />
                  <button
                    type="submit"
                    disabled={couponBusy}
                    className="rounded-md border border-[#a77b4c] px-4 text-xs font-medium text-[#936b43] transition hover:bg-[#a77b4c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponBusy ? 'Please wait...' : 'Apply'}
                  </button>
                  {cartSummary?.couponCode && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      disabled={couponBusy}
                      className="rounded-md border border-[#e5dcd1] px-3 text-xs font-medium text-[#827b72] transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p role="status" className={`mt-2 text-[10px] ${couponMessageIsError ? 'text-red-600' : 'text-green-700'}`}>
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
                              name="available-coupon"
                              value={code}
                              checked={coupon.trim().toUpperCase() === String(code).toUpperCase()}
                              disabled={couponBusy}
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
              </form>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#e9e1d7] pt-5">
                <span className="font-serif text-lg">Total</span>
                <span className="text-xl font-semibold">{formatPrice(total)}</span>
              </div>
              <p className="mt-2 text-right text-[10px] text-[#92887e]">Taxes included where applicable.</p>

              <Link
                to="/store/checkout"
                state={{ items, appliedCoupon, giftWrap }}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-[#142a23] px-5 py-4 text-xs font-medium text-white transition hover:bg-[#a77b4c]"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>
              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#827b72]">
                <ShieldCheck size={15} className="text-[#a77b4c]" />
                Secure and protected checkout
              </div>
              <Link to="/store/products" className="mt-5 flex items-center justify-center gap-2 text-xs text-[#827b72] transition hover:text-[#a77b4c]">
                <ArrowLeft size={13} />
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}

        {guestSaveItem && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={() => setGuestSaveItem(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="guest-save-dialog-title"
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setGuestSaveItem(null)
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="guest-save-dialog-title" className="font-serif text-2xl">Save for later</h2>
                  <p className="mt-2 text-sm leading-6 text-[#827b72]">
                    Sign in to save this item to your wishlist, or remove it from your cart.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setGuestSaveItem(null)}
                  className="shrink-0 rounded p-1 text-[#827b72] hover:bg-[#f2eee7]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/login"
                  className="flex min-h-11 items-center justify-center rounded-md bg-[#142a23] px-4 py-3 text-xs font-medium text-white transition hover:bg-[#a77b4c]"
                >
                  Login
                </Link>
                <button
                  type="button"
                  onClick={removeGuestSaveItem}
                  disabled={busyItemIds.includes(String(guestSaveItem.id))}
                  className="min-h-11 rounded-md border border-[#e5dcd1] px-4 py-3 text-xs font-medium text-[#5f574e] transition hover:bg-[#f8f5f1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove from cart
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  )
}
