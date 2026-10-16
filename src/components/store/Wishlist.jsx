import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'

export default function Wishlist() {
  const { wishlist: products, onRemoveWishlistItem: onRemove, onClearWishlist: onClear } = useOutletContext()
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-serif text-2xl">My Wishlist</h2>
          <p className="mt-1 text-sm text-[#7A857E]">Save your favourite jewellery for later.</p>
        </div>
        {products.length > 0 && <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-[#956336] underline underline-offset-4 hover:text-[#183129] sm:self-auto"><Trash2 size={13} />Clear All</button>}
      </div>

      {products.length === 0 ? (
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
                {product.image && <img src={product.image} alt={product.name || 'Saved jewellery'} className="h-full w-full object-cover" loading="lazy" />}
                <button type="button" onClick={() => onRemove(product.id)} aria-label={`Remove ${product.name || 'item'} from wishlist`} title="Remove from wishlist" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#A66A3D] shadow-sm transition hover:bg-white"><Heart size={16} fill="currentColor" /></button>
              </div>
              <h3 className="mt-2 line-clamp-2 min-h-9 text-xs font-medium leading-4">{product.name || 'Jewellery'}</h3>
              <p className="mt-1 text-xs font-semibold">{formatPrice(product.price)}</p>
              <Link to={`/store/products/${product.id}`} className="mt-2 flex min-h-9 items-center justify-center gap-1.5 rounded-sm bg-[#102923] px-2 text-[10px] font-medium text-white transition hover:bg-[#24483B] sm:text-xs"><ShoppingCart size={13} />View Product</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}