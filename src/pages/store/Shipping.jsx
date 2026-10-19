import { ArrowRight, Clock3, MapPin, PackageCheck, ShieldCheck, Truck, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const shippingHighlights = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary delivery on orders above ₹2,000.',
  },
  {
    icon: Clock3,
    title: 'Timely Delivery',
    description: 'Estimated delivery within 3–7 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Packaging',
    description: 'Your jewellery is carefully packed for safe transit.',
  },
  {
    icon: MapPin,
    title: 'Order Tracking',
    description: 'Track your shipment using your order details.',
  },
]

const shippingSections = [
  {
    number: '01',
    title: 'Order Processing',
    paragraphs: [
      'Orders are generally processed within 1–2 business days after payment confirmation. Orders placed on Sundays or public holidays may be processed on the next business day.',
      'During sale events or festive seasons, processing may take a little longer. You will receive an update when your order is dispatched.',
    ],
  },
  {
    number: '02',
    title: 'Shipping Charges',
    paragraphs: [
      'We offer free standard shipping on orders above ₹2,000. For orders below ₹2,000, shipping charges, if applicable, will be displayed at checkout before you place your order.',
      'Any applicable additional delivery charges will be communicated clearly during checkout.',
    ],
  },
  {
    number: '03',
    title: 'Estimated Delivery',
    paragraphs: [
      'Standard delivery is estimated at 3–7 business days after dispatch for most serviceable locations in India.',
      'Delivery timelines are estimates and may vary depending on your location, courier availability, weather conditions, and public holidays. Remote locations may require additional time.',
    ],
  },
  {
    number: '04',
    title: 'Order Tracking',
    paragraphs: [
      'Once your order is shipped, we will share the available tracking information through your registered contact details.',
      'You can use the tracking details to follow your shipment. If tracking information is not available or has not updated for an extended period, please contact our customer support team.',
    ],
  },
  {
    number: '05',
    title: 'Delivery Address',
    paragraphs: [
      'Please verify your complete delivery address, phone number, postal code, and other relevant details before placing your order.',
      'If you need to change your address after placing an order, contact us as soon as possible. Address changes may not be possible after dispatch.',
    ],
  },
  {
    number: '06',
    title: 'Delayed or Failed Delivery',
    paragraphs: [
      'Delivery may be delayed due to courier disruptions, adverse weather, operational issues, or circumstances outside our control.',
      'If a delivery attempt fails, the courier may make another attempt according to its delivery policy. Please ensure that someone is available to receive the package at the delivery address.',
    ],
  },
]

export default function Shipping() {
  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#183129]">
      <section className="border-b border-[#E9E1D7] bg-[#F5EEE4]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#A77B4C]">Customer Care</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">Shipping Policy</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#68736C] sm:text-base">
              Every Elephanta creation deserves a special journey. Learn about our shipping process, delivery timelines, and how we ensure your jewellery reaches you safely.
            </p>
            <div className="mx-auto mt-7 h-px w-16 bg-[#B89569]" />
            <Link to="/manage-profile/orders" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#956336] transition hover:text-[#183129]">
              Track Your Order <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Shipping highlights" className="border-b border-[#E9E1D7] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#E9E1D7] px-5 sm:grid-cols-2 sm:divide-y-0 sm:px-8 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {shippingHighlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 py-6 sm:px-5 lg:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#EADCC9] bg-[#FCFAF7] text-[#A77B4C]">
                <Icon size={21} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.07em]">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-[#7A857E]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)] lg:gap-14">
          <div>
            <div className="mb-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A77B4C]">Everything You Need to Know</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Shipping &amp; Delivery</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7A857E]">
                Please review the following information before placing your order. It explains how we process, ship, and deliver your purchases.
              </p>
            </div>

            <div className="divide-y divide-[#E9E1D7] border-y border-[#E9E1D7]">
              {shippingSections.map((section, index) => (
                <details key={section.number} open={index === 0} className="group py-5 sm:py-6">
                  <summary className="grid cursor-pointer list-none grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 [&::-webkit-details-marker]:hidden sm:grid-cols-[52px_minmax(0,1fr)_20px] sm:gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5EEE4] font-serif text-sm text-[#956336]">{section.number}</span>
                    <span className="font-serif text-lg sm:text-xl">{section.title}</span>
                    <ChevronDown size={18} className="text-[#956336] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="ml-[55px] mt-4 space-y-3 text-sm leading-7 text-[#68736C] sm:ml-[68px]">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-lg border border-[#E5D9C8] bg-white p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EEE4] text-[#A77B4C]">
                <PackageCheck size={23} strokeWidth={1.5} />
              </div>
              <h2 className="mt-5 font-serif text-2xl">Need help with your delivery?</h2>
              <p className="mt-3 text-sm leading-6 text-[#7A857E]">
                Our customer care team is here to help with shipping questions, delivery updates, and order concerns.
              </p>
              <Link to="/contact" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#102923] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24483B]">
                Contact Us <ArrowRight size={16} />
              </Link>
              <div className="mt-7 flex items-start gap-3 border-t border-[#E9E1D7] pt-6">
                <ShieldCheck size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#A77B4C]" />
                <div>
                  <h3 className="text-xs font-semibold">Safe &amp; Secure</h3>
                  <p className="mt-1 text-xs leading-5 text-[#7A857E]">Your order is protected and handled with the utmost care.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <p className="mt-10 border-t border-[#E9E1D7] pt-5 text-xs leading-6 text-[#8A928B]">
          Shipping charges, processing times, and delivery estimates are subject to Elephanta’s fulfilment arrangements and will be confirmed at checkout where applicable.
        </p>
      </section>
    </div>
  )
}
