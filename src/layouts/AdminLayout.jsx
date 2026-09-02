import { Outlet } from 'react-router-dom'
import { loadAuth, clearAuth, logout } from '../services/authapi'

export default function AdminLayout() {
  const auth = loadAuth()

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

  return (
    <div>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,borderBottom:'1px solid var(--border)'}}>
        <div>
          <strong>Elephanta Admin</strong>
          <div style={{fontSize:12,color:'var(--text)'}}>{auth?.user?.email}</div>
        </div>
        <div>
          <button onClick={signOut} style={{padding:'8px 12px',borderRadius:8}}>Sign out</button>
        </div>
      </header>
      <main style={{padding:20}}>
        <Outlet />
      </main>
    </div>
  )
}
