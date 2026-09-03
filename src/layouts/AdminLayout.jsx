import { Outlet } from 'react-router-dom'
import { loadAuth, clearAuth, logout } from '../services/authapi'
import Sidebar from './AdminLayoutSidebar'
import Header from './AdminLayoutHeader'
import '../styles/admin.css'
import { useState } from 'react'

export default function AdminLayout() {
  const auth = loadAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function signOut() {
    const auth = loadAuth()
    try {
      if (auth?.refreshToken) await logout(auth.refreshToken)
    } catch (e) {
      // ignore logout errors, still clear local auth
    } finally {
      clearAuth()
      window.location.href = '/admin/login'
    }
  }

  function toggleCollapse() { setCollapsed(v => !v) }
  function toggleMobile() { setMobileOpen(v => !v) }
  function closeMobile() { setMobileOpen(false) }

  function handleToggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      toggleMobile()
    } else {
      toggleCollapse()
    }
  }

  return (
    <div className="admin-root">
      <Sidebar collapsed={collapsed} onCollapseToggle={toggleCollapse} onSignOut={signOut} mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div className="admin-main" data-collapsed={collapsed}>
        <Header onToggleSidebar={handleToggleSidebar} collapsed={collapsed} onSignOut={signOut} username={auth?.user?.name || auth?.user?.email || 'Admin'} role={auth?.user?.role || 'Administrator'} />

        <main className="admin-content">
          <Outlet />
        </main>

        <footer className="admin-footer">© {new Date().getFullYear()} Elephanta — Admin panel</footer>
      </div>
    </div>
  )
}
