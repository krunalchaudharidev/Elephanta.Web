import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import StoreLayout from '../layouts/StoreLayout'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/Dashboard'
import AccountSettings from '../pages/admin/AccountSettings'
import AdminCategories from '../pages/admin/Categories'
import AdminProducts from '../pages/admin/Products'
import ProductDetails from '../pages/admin/ProductDetails'
import AdminOffers from '../pages/admin/Offers'
import OfferDetails from '../pages/admin/OfferDetails'
import WebsiteSettings from '../pages/admin/WebsiteSettings'
import StoreLogin from '../pages/store/Login'
import StoreRegister from '../pages/store/Register'
import ManageProfile from '../pages/store/ManageProfile'
import PersonalInformation from '../components/store/PersonalInformation'
import ChangePassword from '../components/store/ChangePassword'
import Addresses from '../components/store/Addresses'
import OrderHistory from '../components/store/OrderHistory'
import OrderDetails from '../components/store/OrderDetails'
import Wishlist from '../components/store/Wishlist'
import StoreHome from '../pages/store/Home'
import StoreAbout from '../pages/store/About'
import StoreProducts from '../pages/store/Products'
import StoreCart from '../pages/store/Cart'
import StoreCheckout from '../pages/store/Checkout'
import StoreProductDetails from '../pages/store/ProductDetails'
import StoreCollections from '../pages/store/Collections'
import StoreContact from '../pages/store/Contact'
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
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="about" element={<StoreAbout />} />
          <Route path="contact" element={<StoreContact />} />
          <Route path="login" element={<StoreLogin />} />
          <Route path="register" element={<StoreRegister />} />
          <Route path="manage-profile" element={<ManageProfile />}>
            <Route index element={<PersonalInformation />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
        </Route>

        <Route path="/store/login" element={<Navigate to="/login" replace />} />
        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="about" element={<Navigate to="/about" replace />} />
          <Route path="products" element={<StoreProducts />} />
          <Route path="collections" element={<StoreCollections />} />
          <Route path="contact" element={<Navigate to="/contact" replace />} />
          <Route path="products/:id" element={<StoreProductDetails />} />
          <Route path="cart" element={<StoreCart />} />
          <Route path="checkout" element={<StoreCheckout />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Navigate to="/admin/account-settings" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="offers/:id" element={<OfferDetails />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="website-settings" element={<WebsiteSettings />} />
        </Route>

        <Route path="*" element={<div style={{padding:20}}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  )
}
