import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import StoreLayout from '../layouts/StoreLayout'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminProfile from '../pages/admin/Profile'
import AdminCategories from '../pages/admin/Categories'
import StoreLogin from '../pages/store/Login'
import StoreHome from '../pages/store/Home'
import StoreProducts from '../pages/store/Products'
import StoreCart from '../pages/store/Cart'
import { loadAuth, clearAuth, refreshToken, saveAuth } from '../services/authapi'
import { useEffect, useState } from 'react'

function RequireAdmin({ children }) {
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function check() {
      const auth = loadAuth()
      if (!auth) {
        navigate('/admin/login', { replace: true })
        return
      }

      // check expiry
      if (auth?.expiresAt) {
        const exp = new Date(auth.expiresAt)
        if (!isNaN(exp) && exp <= new Date()) {
          // attempt refresh
          try {
            const newAuth = await refreshToken(auth.refreshToken)
            saveAuth(newAuth)
            if (mounted) setReady(true)
            return
          } catch (e) {
            clearAuth()
            navigate('/admin/login', { replace: true })
            return
          }
        }
      }

      const roles = auth?.user?.roles || []
      if (!roles.includes('Admin')) {
        clearAuth()
        navigate('/admin/login', { replace: true })
        return
      }

      if (mounted) setReady(true)
    }

    check()
    return () => { mounted = false }
  }, [navigate])

  if (!ready) return null
  return children ? children : <Outlet />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/store" replace />} />

        <Route path="/login" element={<StoreLogin />} />
        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="products" element={<StoreProducts />} />
          <Route path="cart" element={<StoreCart />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Navigate to="/admin/profile" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<div style={{padding:20}}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  )
}
