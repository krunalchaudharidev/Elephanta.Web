import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../../services/authapi'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    // client-side validation
    const errs = {}
    if (!email || !email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">E</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">Elephanta</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={submit} method="POST" className="space-y-5">

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>

              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {fieldErrors.email && <div className="text-red-600 text-sm mt-2">{fieldErrors.email}</div>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>

              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {error && <div className="text-red-600 font-semibold">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>

          </form>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">© 2026 Elephanta. All rights reserved.</p>

      </div>
    </div>
  )
}
