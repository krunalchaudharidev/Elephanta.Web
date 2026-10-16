import { ChevronLeft, PackageOpen } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'

export default function OrderDetails() {
  const { orders } = useOutletContext()
  const { orderId } = useParams()
  const order = orders.find((item) => String(item.id ?? item.orderId) === orderId)

  if (!order) {
    return (
      <div className="py-8 text-center">
        <PackageOpen size={32} strokeWidth={1.5} className="mx-auto text-[#A77B4C]" />
        <h2 className="mt-4 font-serif text-2xl">Order not found</h2>
        <p className="mt-2 text-sm text-[#7A857E]">This order is not available in your account.</p>
        <Link to="/manage-profile/orders" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#99683B] underline underline-offset-4"><ChevronLeft size={15} />Back to Order History</Link>
      </div>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []
  const status = String(order.status || 'Processing')
  const statusClass = status.toLowerCase() === 'delivered'
    ? 'bg-[#E4F1E5] text-[#347048]'
    : status.toLowerCase() === 'shipped'
      ? 'bg-[#E4F0F8] text-[#346A91]'
      : 'bg-[#FCF0DE] text-[#98632A]'

  return (
    <div>
      <Link to="/manage-profile/orders" className="inline-flex items-center gap-1 text-xs font-medium text-[#956336] hover:text-[#183129]"><ChevronLeft size={15} />Back to Order History</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-b border-[#EEE8DF] pb-5">
        <div>
          <h2 className="font-serif text-2xl">Order #{order.id ?? order.orderId}</h2>
          <p className="mt-1 text-sm text-[#7A857E]">{order.createdAt || order.orderDate || 'Date unavailable'}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass}`}>{status}</span>
      </div>

      <div className="mt-5 divide-y divide-[#EEE8DF]">
        {items.map((item, index) => (
          <div key={`${item.id || item.name || 'order-item'}-${index}`} className="flex items-center gap-3 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-[#F2EEE8]">{item.image && <img src={item.image} alt={item.name || item.productName || 'Order item'} className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name || item.productName || 'Product'}</p>
              <p className="mt-1 text-xs text-[#7A857E]">Quantity: {item.quantity || 1}</p>
            </div>
            <p className="text-sm font-medium">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#EEE8DF] pt-4">
        <div className="flex justify-between gap-3 text-sm font-semibold"><span>Order total</span><span>{formatPrice(order.total ?? order.totalAmount)}</span></div>
      </div>
    </div>
  )
}