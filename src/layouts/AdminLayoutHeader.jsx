import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function AdminLayoutHeader({ onToggleSidebar, collapsed, onSignOut, username='Admin', role='Administrator' }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  function titleFromPath(pathname) {
    if (!pathname) return 'Dashboard'
    const parts = pathname.split('/').filter(Boolean)
    // If path is just '/admin' or empty, show Dashboard
    if (parts.length === 0 || (parts.length === 1 && parts[0] === 'admin')) return 'Dashboard'
    // take the last segment
    const last = parts[parts.length - 1]
    // convert kebab or camel to Title Case
    return last.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  }

  const pageTitle = titleFromPath(location.pathname)
  const initials = (username || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(s => s[0].toUpperCase())
    .join('')

  return (
    <header className="flex h-[75px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 lg:px-8">

      <div className="flex items-center">

        <button onClick={onToggleSidebar} className="mr-5 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden" aria-expanded={!collapsed} aria-label="Toggle sidebar">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <button onClick={onToggleSidebar} className="mr-7 hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:block" aria-expanded={!collapsed} aria-label="Toggle sidebar">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <h2 className="text-[22px] font-semibold text-gray-900">{pageTitle}</h2>
      </div>

      <div className="relative">
        <button onClick={()=>setOpen(v=>!v)} className="flex items-center rounded-xl px-2 py-1.5 transition hover:bg-gray-50">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-sm">{initials || 'EA'}</div>

          <div className="ml-3 hidden text-left sm:block">
            <p className="text-[16px] font-semibold leading-tight text-gray-900">{username}</p>
            <p className="mt-1 text-sm text-gray-500">{role}</p>
          </div>

          <svg className="ml-4 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
        </button>

        {open && (
          <div className="absolute right-0 top-14 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{username}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>

            <Link to="/admin/profile" className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">Profile</Link>
            <Link to="/admin/settings" className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">Account Settings</Link>

            <button className="w-full border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50" onClick={onSignOut}>Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}
