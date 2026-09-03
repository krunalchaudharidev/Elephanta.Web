import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminLayoutHeader({ onToggleSidebar, collapsed, onSignOut, username='Admin', role='Administrator' }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar} aria-expanded={!collapsed} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="page-title">Dashboard</div>
      </div>

      <div className="header-right">
        <div className="user-menu">
          <button className="user-btn" onClick={()=>setOpen(v=>!v)} aria-haspopup="true" aria-expanded={open}>
            <div className="avatar" aria-hidden>EA</div>
            <div className="user-info">
              <div className="name">{username}</div>
              <div className="role">{role}</div>
            </div>
            <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {open && (
            <div className="user-dropdown" role="menu">
              <Link to="/admin/profile" className="dd-item" onClick={()=>setOpen(false)}>Profile</Link>
              <Link to="/admin/settings" className="dd-item" onClick={()=>setOpen(false)}>Settings</Link>
              <button className="dd-item" onClick={onSignOut}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
