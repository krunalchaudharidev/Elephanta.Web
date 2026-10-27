import { useEffect, useState } from 'react'
import { Check, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import RemoteImage from './RemoteImage'
import { formatPrice } from '../../lib/utils'
import { getWishlist, removeFromWishlist } from '../../services/wishlistapi'

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')
  const [removingProductIds, setRemovingProductIds] = useState([])
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadWishlist() {
      try {
        const response = await getWishlist()
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? []
        if (!Array.isArray(items)) {
          throw new Error('Unexpected wishlist response.')
        }
        if (!cancelled) {
          setProducts(
            items
              .map((item) => {
                const productId = item?.productId ?? item?.ProductId
                const imageIds = item?.imageIds ?? item?.ImageIds ?? []
                return {
                  id: item?.id ?? item?.Id ?? productId,
                  productId,
                  name: item?.productName ?? item?.ProductName ?? '',
                  price: Number(item?.price ?? item?.Price ?? 0),
                  imageId: Array.isArray(imageIds) ? imageIds[0] : null,
                }
              })
              .filter((item) => item.productId)
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load wishlist.', loadError)
          setError(loadError?.message || 'Unable to load your wishlist.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadWishlist()
    return () => {
      cancelled = true
    }
  }, [])

  function showNotification(message) {
    setNotification(message)
    window.setTimeout(() => setNotification(''), 2500)
  }

  async function handleRemove(productId) {
    const key = String(productId)
    if (removingProductIds.includes(key) || clearing) return

    setRemovingProductIds((current) => [...current, key])
    try {
      await removeFromWishlist(productId)
      setProducts((current) =>
        current.filter((product) => String(product.productId) !== key)
      )
      showNotification('Removed from your wishlist.')
    } catch (removeError) {
      console.error('Failed to remove wishlist item.', removeError)
      showNotification(removeError?.message || 'Unable to remove wishlist item.')
    } finally {
      setRemovingProductIds((current) => current.filter((item) => item !== key))
    }
  }

  async function handleClearWishlist() {
    if (clearing) return

    setClearing(true)
    let failedCount = 0
    for (const product of products) {
      try {
        await removeFromWishlist(product.productId)
        setProducts((current) =>
          current.filter((item) => item.productId !== product.productId)
        )
      } catch (removeError) {
        failedCount += 1
        console.error(`Failed to remove wishlist item ${product.productId}.`, removeError)
      }
    }

    setClearing(false)
    showNotification(
      failedCount
        ? `Unable to remove ${failedCount} wishlist item(s).`
        : 'Your wishlist has been cleared.'
    )
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-serif text-2xl">My Wishlist</h2>
          <p className="mt-1 text-sm text-[#7A857E]">Save your favourite jewellery for later.</p>
        </div>
        {products.length > 0 && (
          <button
            type="button"
            onClick={handleClearWishlist}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-[#956336] underline underline-offset-4 hover:text-[#183129] disabled:opacity-50 sm:self-auto"
          >
            <Trash2 size={13} />{clearing ? 'Clearing...' : 'Clear All'}
          </button>
        )}
      </div>

      {loading ? (
        <p role="status" className="mt-6 py-10 text-center text-sm text-[#7A857E]">
          Loading your wishlist...
        </p>
      ) : error ? (
        <p role="alert" className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-[#DCCDBB] px-5 py-12 text-center">
          <Heart size={32} strokeWidth={1.5} className="mx-auto text-[#A77B4C]" />
          <h3 className="mt-4 font-serif text-xl">Your wishlist is waiting</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7A857E]">Save pieces you love and they will be collected here.</p>
          <Link to="/store/products" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#99683B] underline underline-offset-4">Explore jewellery<Heart size={15} /></Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="min-w-0 rounded-md border border-[#EEE8DF] p-2.5 sm:p-3">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-[#F2EEE8]">
                {product.imageId ? (
                  <RemoteImage
                    src={`/api/Media/${encodeURIComponent(product.imageId)}`}
                    alt={product.name || 'Saved jewellery'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#7A857E]">
                    No image available
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(product.productId)}
                  disabled={clearing || removingProductIds.includes(String(product.productId))}
                  aria-label={`Remove ${product.name || 'item'} from wishlist`}
                  title="Remove from wishlist"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#A66A3D] shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <h3 className="mt-2 line-clamp-2 min-h-9 text-xs font-medium leading-4">{product.name || 'Jewellery'}</h3>
              <p className="mt-1 text-xs font-semibold">{formatPrice(product.price)}</p>
              <Link to={`/store/products/${encodeURIComponent(product.productId)}`} className="mt-2 flex min-h-9 items-center justify-center gap-1.5 rounded-sm bg-[#102923] px-2 text-[10px] font-medium text-white transition hover:bg-[#24483B] sm:text-xs"><ShoppingCart size={13} />View Product</Link>
            </article>
          ))}
        </div>
      )}

      {notification && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-lg bg-[#102722] px-5 py-4 text-sm text-white shadow-xl"
        >
          <Check size={18} className="shrink-0 text-[#d4ae62]" />
          {notification}
        </div>
      )}
    </div>
  )
}
