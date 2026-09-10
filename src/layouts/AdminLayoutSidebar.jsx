import { Link, useLocation } from 'react-router-dom'

const items = [
  ['/admin/dashboard', 'Dashboard', 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z'],
  ['/admin/products', 'Products', 'M3 7h18M6 21h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'],
  ['/admin/categories', 'Categories', 'M4 6h16M4 12h16M4 18h16'],
  ['/admin/orders', 'Orders', 'M3 7h18M6 7v14a2 2 0 002 2h8a2 2 0 002-2V7'],
  ['/admin/customers', 'Customers', 'M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 0118 0'],
  ['/admin/offers', 'Offers / Coupons', 'M12 2l3 7h7l-5.7 4.1L20 22 12 17.5 4 22l2.7-8.9L1 9h7z'],
  ['/admin/inventory', 'Inventory', 'M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
  ['/admin/reports', 'Reports', 'M3 3v18h18'],
  ['/admin/users', 'Users & Roles', 'M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z M8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z M8 18c-2.67 0-4 1.34-4 3v1h16v-1c0-1.66-1.33-3-4-3H8z'],
  ['/admin/settings', 'Settings', 'M12 8a4 4 0 100 8 4 4 0 000-8z M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 00.12-.64l-2-3.46a.5.5 0 00-.6-.22l-2.49 1a7.027 7.027 0 00-1.7-.98l-.38-2.65A.5.5 0 0013.5 2h-3a.5.5 0 00-.49.42l-.38 2.65c-.59.23-1.14.54-1.7.98l-2.49-1a.5.5 0 00-.6.22l-2 3.46a.5.5 0 00.12.64L4.57 11c-.04.32-.07.65-.07.98s.03.66.07.98L2.46 14.6a.5.5 0 00-.12.64l2 3.46c.14.24.44.34.69.22l2.49-1c.53.42 1.11.77 1.7.99l.38 2.65c.05.28.28.48.55.48h3c.27 0 .5-.2.55-.48l.38-2.65c.59-.22 1.17-.57 1.7-.99l2.49 1c.25.12.55.02.69-.22l2-3.46a.5.5 0 00-.12-.64l-2.11-1.62z'],
]

export default function AdminLayoutSidebar({ collapsed, onCollapseToggle, onSignOut, mobileOpen, onMobileClose }) {
  const loc = useLocation()

  const widthClass = collapsed ? 'w-20' : 'w-[306px]'

  return (
    <aside id="sidebar" className={`fixed inset-y-0 left-0 z-50 flex ${widthClass} flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? '' : '-translate-x-full lg:translate-x-0'}`} aria-label="Primary navigation">

      <div className="flex h-[85px] items-center border-b border-gray-100 px-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 18V9a7 7 0 0 1 14 0v9"/><path d="M5 18h14"/><path d="M8 18v-7a4 4 0 0 1 8 0v7"/></svg>
          </div>
        </div>

        <div className={`ml-4 ${collapsed ? 'hidden' : ''}`}>
          <h1 className="text-[17px] font-semibold leading-tight text-gray-900">Elephanta</h1>
          <p className="mt-0.5 text-sm text-gray-500">Admin</p>
        </div>

        <button onClick={onMobileClose} className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {items.map(([to, label, pathD]) => {
          const active = loc.pathname === to
          return (
            <Link key={to} to={to} onClick={onMobileClose} className={`group mb-1 flex h-11 items-center rounded-lg px-3 ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'} ${collapsed ? 'justify-center' : ''}`}>
              <svg className={`${collapsed ? '' : 'mr-4'} h-5 w-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={pathD} strokeWidth="1.8"/></svg>
              <span className={`${collapsed ? 'hidden' : 'text-[16px]'}`}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button className={`group flex h-12 w-full items-center rounded-lg px-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center' : ''}`} onClick={onSignOut}>
          <svg className={`${collapsed ? '' : 'mr-4'} h-5 w-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" strokeWidth="1.8" strokeLinecap="round"/><path d="M13 8l4 4-4 4M17 12H9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className={`${collapsed ? 'hidden' : 'text-[16px]'}`}>Logout</span>
        </button>
      </div>

    </aside>
  )
}
