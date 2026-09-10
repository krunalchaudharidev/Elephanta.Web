import { Outlet } from 'react-router-dom'
import { loadAuth, clearAuth, logout } from '../services/authapi'
import Sidebar from './AdminLayoutSidebar'
import Header from './AdminLayoutHeader'
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
    <div className="flex h-screen overflow-hidden bg-gray-50">

      <Sidebar
        collapsed={collapsed}
        onCollapseToggle={toggleCollapse}
        onSignOut={signOut}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      <div id="sidebarOverlay" onClick={closeMobile} className={`fixed inset-0 z-40 ${mobileOpen ? '' : 'hidden'} bg-black/30 backdrop-blur-[1px] lg:hidden`} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={handleToggleSidebar} collapsed={collapsed} onSignOut={signOut} username={auth?.user?.name || auth?.user?.email || 'Admin'} role={auth?.user?.role || 'Administrator'} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 lg:px-8">
            <Outlet />
          </div>
        </main>

        <footer className="flex h-15 shrink-0 items-center justify-center border-t border-gray-200 bg-white px-5">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} <span className="font-medium text-gray-600">Elephanta</span> — Admin panel</p>
        </footer>
      </div>
    </div>
  )
}
