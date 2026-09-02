import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import StoreLayout from '../layouts/StoreLayout'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/Dashboard'
import StoreLogin from '../pages/store/Login'
import StoreHome from '../pages/store/Home'
import StoreProducts from '../pages/store/Products'
import StoreCart from '../pages/store/Cart'
import { loadAuth } from '../services/api'

function RequireAdmin({ children }) {
  const auth = loadAuth()
  const navigate = useNavigate()
  if (!auth) {
    navigate('/admin/login', { replace: true })
    return null
  }
  const roles = auth?.user?.roles || []
  if (!roles.includes('Admin')) {
    navigate('/admin/login', { replace: true })
    return null
  }
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
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<div style={{padding:20}}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  )
}
