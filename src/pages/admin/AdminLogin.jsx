import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../../services/authapi'
import '../../styles/login.css'

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
      <div className="card login-card" role="main" aria-labelledby="elephanta-signin">
        <div className="logo-row">
          <svg className="logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="#6f7bff" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="64" height="64" rx="12" fill="url(#g1)" opacity="0.08" />
            <g transform="translate(8,12) scale(0.7)" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 26c0-9 8-14 16-14 8 0 16 5 16 14v8H6v-8z" />
              <path d="M28 24c3 0 5-2 5-5s-2-5-5-5" />
              <circle cx="16" cy="20" r="1.5" fill="var(--accent)" stroke="none" />
            </g>
          </svg>
          <div className="brand">
            <div className="app-name">Elephanta</div>
            <div className="app-sub">Admin</div>
          </div>
        </div>

        <h2 id="elephanta-signin">Sign in to your admin account</h2>

        <form onSubmit={submit} className="form" noValidate>
          <label htmlFor="email">
            Email Address
            <input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </label>

          <label htmlFor="password">
            Password
            <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </label>

          {error && <div className="error" role="alert">{error}</div>}

          <button className="submit" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </form>

        <div className="hint muted">Your credentials are secured. Use an Admin account to continue.</div>
      </div>
    </div>
  )
}
