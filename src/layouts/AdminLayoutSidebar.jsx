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

  return (
    <aside className={["admin-sidebar", collapsed ? 'collapsed' : '', mobileOpen ? 'open' : ''].join(' ')} aria-label="Primary navigation">
      <div className="sidebar-inner">
        <div className="sidebar-top">
          <Link to="/admin" className="brand-link" onClick={onMobileClose}>
            <div className="logo-sm" aria-hidden>
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="var(--accent)" opacity="0.08"/><path d="M8 18c0-6 5-9 10-9s10 3 10 9v5H8v-5z" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {!collapsed && <div className="brand-text"><div className="app">Elephanta</div><div className="role">Admin</div></div>}
          </Link>

          
        </div>

        <nav className="nav-list">
          {items.map(([to, label, pathD]) => {
            const active = loc.pathname === to || (!collapsed && loc.pathname.startsWith(to) && to !== '/')
            return (
              <Link key={to} to={to} className={["nav-item", active ? 'active' : ''].join(' ')} onClick={onMobileClose}>
                <span className="nav-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={pathD}></path></svg>
                </span>
                {!collapsed && <span className="nav-label">{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout" onClick={onSignOut}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </div>
      <div className="sidebar-backdrop" onClick={onMobileClose} />
    </aside>
  )
}
