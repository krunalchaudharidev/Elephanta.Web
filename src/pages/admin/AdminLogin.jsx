import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../../services/api'
import '../../login.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = await apiLogin(email, password)
      const roles = body?.user?.roles || []
      if (!roles.includes('Admin')) {
        setError('Account does not have Admin role')
        setLoading(false)
        return
      }
      const auth = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        expiresAt: body.expiresAt,
        user: body.user,
      }
      saveAuth(auth)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="card">
        <div className="brand">Elephanta Admin</div>
        <h1>Admin Sign in</h1>
        <form onSubmit={submit} className="form">
          <label>
            Email
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@elephanta.local or admin" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" required />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="submit" disabled={loading}>{loading? 'Signing in…':'Sign in'}</button>
        </form>
        <div className="hint">Use sample: admin / admin</div>
      </div>
    </div>
  )
}
