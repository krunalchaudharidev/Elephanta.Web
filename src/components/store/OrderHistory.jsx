import { useState } from 'react'
import { ChevronRight, PackageOpen } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'

const orderFilters = [
  { id: 'all', label: 'All Orders' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
]

export default function OrderHistory() {
  const { orders } = useOutletContext()
  const [filter, setFilter] = useState('all')
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => String(order.status || '').toLowerCase() === filter)

  function orderDate(value) {
    if (!value) return 'Date unavailable'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? String(value)
      : `Placed on ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)}`
  }

  return (
    <div>
      <div>
        <h2 className="font-serif text-2xl">Order History</h2>
        <p className="mt-1 text-sm text-[#7A857E]">View and track your past orders.</p>
      </div>

      <div className="mt-5 overflow-x-auto border-b border-[#DEDCD6]">
        <div className="flex min-w-max">
          {orderFilters.map((item) => {
            const count = item.id === 'all'
              ? orders.length
              : orders.filter((order) => String(order.status || '').toLowerCase() === item.id).length
            const active = filter === item.id
            return <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={active} className={`border-b-2 px-4 py-3 text-xs transition ${active ? 'border-[#A77B4C] font-medium text-[#956336]' : 'border-transparent text-[#718078] hover:text-[#183129]'}`}>{item.label} ({count})</button>
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-[#DCCDBB] px-5 py-12 text-center">
          <PackageOpen size={32} strokeWidth={1.5} className="mx-auto text-[#A77B4C]" />
          <h3 className="mt-4 font-serif text-xl">{orders.length ? 'No orders in this status' : 'No orders yet'}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7A857E]">{orders.length ? 'Try another status to find your order.' : 'Your purchases will appear here after you place an order.'}</p>
          {!orders.length && <Link to="/store/products" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#99683B] underline underline-offset-4">Explore jewellery<ChevronRight size={15} /></Link>}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredOrders.map((order) => {
            const orderId = order.id ?? order.orderId
            const items = Array.isArray(order.items) ? order.items : []
            const firstItem = items[0]
            const status = String(order.status || 'Processing')
            const statusClass = status.toLowerCase() === 'delivered'
              ? 'bg-[#E4F1E5] text-[#347048]'
              : status.toLowerCase() === 'shipped'
                ? 'bg-[#E4F0F8] text-[#346A91]'
                : 'bg-[#FCF0DE] text-[#98632A]'
            return (
              <article key={orderId} className="rounded-md border border-[#E9E1D7] px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEE8DF] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold">Order #{orderId || '—'}</h3>
                    <p className="mt-1 text-[11px] text-[#879087]">{orderDate(order.createdAt || order.orderDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-medium capitalize ${statusClass}`}>{status}</span>
                    <Link to={`/manage-profile/orders/${orderId}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#956336] hover:text-[#183129]">View Details<ChevronRight size={14} /></Link>
                  </div>
                </div>
                {firstItem && (
                  <div className="flex items-center gap-3 pt-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-[#F2EEE8]">{firstItem.image && <img src={firstItem.image} alt={firstItem.name || 'Order item'} className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{firstItem.name || firstItem.productName || 'Product'}</p>
                      <p className="mt-1 text-[10px] text-[#7A857E]">{formatPrice(firstItem.price)}</p>
                    </div>
                    <p className="shrink-0 text-[10px] text-[#879087]">Qty: {firstItem.quantity || 1}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}