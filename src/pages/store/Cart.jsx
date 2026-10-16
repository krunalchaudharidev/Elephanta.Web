import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Gift,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const initialItems = [
  {
    id: 1,
    name: 'Royal Kundan Bridal Necklace',
    category: 'Necklaces',
    variant: 'Gold Plated',
    price: 20200,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 2,
    name: 'Pearl Drop Statement Earrings',
    category: 'Earrings',
    variant: 'Pearl White',
    price: 7700,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 3,
    name: 'Elegant Solitaire Crystal Ring',
    category: 'Rings',
    variant: 'Silver Tone',
    price: 4000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=500&q=85',
  },
]

const FREE_SHIPPING_THRESHOLD = 2000

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price)

export default function Cart() {
  const location = useLocation()
  const [items, setItems] = useState(() => location.state?.items ?? initialItems)
  const [savedItems, setSavedItems] = useState([])
  const [coupon, setCoupon] = useState(() => location.state?.appliedCoupon ?? '')
  const [appliedCoupon, setAppliedCoupon] = useState(() => location.state?.appliedCoupon ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const [giftWrap, setGiftWrap] = useState(() => location.state?.giftWrap ?? false)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99
  const discount = appliedCoupon === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0
  const giftWrapPrice = giftWrap && items.length > 0 ? 99 : 0
  const total = Math.max(0, subtotal - discount) + shipping + giftWrapPrice

  function updateQuantity(id, amount) {
    setItems((current) => current.map((item) => (
      item.id === id
        ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + amount)) }
        : item
    )))
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function saveForLater(item) {
    setSavedItems((current) => current.some((saved) => saved.id === item.id)
      ? current
      : [...current, item])
    removeItem(item.id)
  }

  function moveToCart(item) {
    setItems((current) => {
      const existing = current.find((product) => product.id === item.id)
      if (existing) {
        return current.map((product) => product.id === item.id
          ? { ...product, quantity: Math.min(99, product.quantity + item.quantity) }
          : product)
      }
      return [...current, item]
    })
    setSavedItems((current) => current.filter((product) => product.id !== item.id))
  }

  function applyCoupon(event) {
    event.preventDefault()
    const code = coupon.trim().toUpperCase()
    if (!code) {
      setAppliedCoupon('')
      setCouponMessage('Please enter a coupon code.')
    } else if (code === 'WELCOME10') {
      setAppliedCoupon(code)
      setCouponMessage('Welcome! Your 10% discount has been applied.')
    } else {
      setAppliedCoupon('')
      setCouponMessage('Invalid coupon code. Please try again.')
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

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-10 lg:px-14">
        <div className="mb-8 flex items-center justify-between gap-2 sm:mb-10 sm:gap-4" aria-label="Checkout progress">
          {[
            { number: '1', title: 'Shopping Bag', active: true },
            { number: '2', title: 'Checkout', active: false },
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
      </div>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
        {items.length === 0 ? (
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
                    <Link to={`/store/products/${item.id}`} className="block aspect-[4/5] overflow-hidden rounded-md bg-[#f0e8de]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.14em] text-[#a77b4c]">{item.category}</p>
                          <Link to={`/store/products/${item.id}`} className="mt-1 block font-serif text-base leading-snug transition hover:text-[#a77b4c] sm:text-lg">
                            {item.name}
                          </Link>
                          <p className="mt-2 text-[11px] text-[#827b72]">Style: {item.variant}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 p-1 text-[#92887e] transition hover:text-red-600"
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
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="px-2.5 text-[#746a60] hover:text-[#a77b4c] disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= 99}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="px-2.5 text-[#746a60] hover:text-[#a77b4c] disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="text-xs font-semibold sm:text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveForLater(item)}
                        className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-[#827b72] transition hover:text-[#a77b4c]"
                      >
                        <Heart size={13} />
                        Save for later
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-md bg-[#f2eee7] p-4">
                <Truck size={19} className="mt-0.5 shrink-0 text-[#a77b4c]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? "You've unlocked free shipping!"
                      : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.`}
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-[#827b72]">Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2d8cb]">
                    <div className="h-full rounded-full bg-[#a77b4c] transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 border border-[#e9e1d7] bg-white p-4 sm:p-5">
                <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="mt-1 accent-[#a77b4c]" />
                <Gift size={20} className="shrink-0 text-[#a77b4c]" />
                <span className="flex-1">
                  <span className="block text-xs font-medium">Make it a gift</span>
                  <span className="mt-1 block text-[10px] leading-5 text-[#827b72]">Add premium gift wrapping to your order.</span>
                </span>
                <span className="text-xs font-medium">{formatPrice(99)}</span>
              </label>
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
                    <span>Coupon discount (10%)</span>
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
                    }}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-md border border-[#e5dcd1] px-3 py-3 text-xs uppercase outline-none focus:border-[#a77b4c]"
                  />
                  <button type="submit" className="rounded-md border border-[#a77b4c] px-4 text-xs font-medium text-[#936b43] transition hover:bg-[#a77b4c] hover:text-white">Apply</button>
                </div>
                {couponMessage && (
                  <p role="status" className={`mt-2 text-[10px] ${appliedCoupon ? 'text-green-700' : 'text-red-600'}`}>
                    {couponMessage}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-[#92887e]">Demo code: WELCOME10</p>
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

        {savedItems.length > 0 && (
          <section className="mt-14 border-t border-[#e9e1d7] pt-8">
            <h2 className="font-serif text-2xl">Saved for Later</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedItems.map((item) => (
                <article key={item.id} className="flex gap-4 border border-[#e9e1d7] bg-white p-4">
                  <img src={item.image} alt={item.name} className="h-24 w-20 rounded object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <h3 className="text-xs font-medium">{item.name}</h3>
                    <p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p>
                    <button type="button" onClick={() => moveToCart(item)} className="mt-auto inline-flex items-center gap-2 pt-3 text-xs font-medium text-[#9b7044] hover:text-[#17251f]">
                      Move to bag <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  )
}
