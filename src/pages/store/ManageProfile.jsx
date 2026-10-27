import { useEffect, useState } from 'react'
import {
  Heart,
  LockKeyhole,
  LogOut,
  MapPin,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearCustomerAuth, loadCustomerAuth } from '../../services/api'
import { logout } from '../../services/authapi'
import {
  changeUserPassword,
  createUserAddress,
  deleteUserAddress,
  getUserProfile,
  getUserAddresses,
  updateUserProfile,
  updateUserAddress,
} from '../../services/userapi'

const initialProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
}

const tabs = [
  { id: 'personal', label: 'Personal Information', icon: UserRound, to: '/manage-profile' },
  { id: 'password', label: 'Change Password', icon: LockKeyhole, to: '/manage-profile/change-password' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, to: '/manage-profile/addresses' },
]

function mapUserAddress(address) {
  return {
    id: address?.id ?? address?.Id,
    addressLine1: address?.addressLine1 ?? address?.AddressLine1 ?? '',
    addressLine2: address?.addressLine2 ?? address?.AddressLine2 ?? '',
    city: address?.city ?? address?.City ?? '',
    state: address?.state ?? address?.State ?? '',
    postalCode: address?.postalCode ?? address?.PostalCode ?? '',
    country: address?.country ?? address?.Country ?? '',
    isDefault: address?.isPrimary ?? address?.IsPrimary ?? false,
  }
}

function toUserAddressPayload(address) {
  return {
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim(),
    isPrimary: Boolean(address.isDefault),
  }
}

function readStoredItems(key) {
  try {
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export default function ManageProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [addresses, setAddresses] = useState([])
  const [wishlist, setWishlist] = useState(() => readStoredItems('elephanta_wishlist'))
  const [orders] = useState(() => readStoredItems('elephanta_orders'))
  const [loading, setLoading] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [notice, setNotice] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const auth = loadCustomerAuth()
  const routeSection = location.pathname.replace(/^\/manage-profile\/?/, '').split('/')[0]
  const activeTab = ({
    'change-password': 'password',
    addresses: 'addresses',
    orders: 'orders',
    wishlist: 'wishlist',
  })[routeSection] || 'personal'
  const isOrderDetails = activeTab === 'orders' && location.pathname.split('/').filter(Boolean).length > 2

  useEffect(() => {
    let active = true
    if (!auth?.accessToken) {
      navigate('/login', { replace: true, state: { from: '/manage-profile' } })
      return () => { active = false }
    }

    async function loadProfile() {
      try {
        const body = await getUserProfile()
        if (!active) return
        const user = body?.user || body || {}
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || auth.user?.email || '',
          phoneNumber: user.phoneNumber || '',
          dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
          gender: user.gender || '',
        })
      } catch (error) {
        if (!active) return
        if (error.status === 401) {
          navigate('/login', { replace: true, state: { from: '/manage-profile' } })
          return
        }
        setNotice({ type: 'error', message: error.message || 'Unable to load your profile.' })
      } finally {
        if (active) setLoadingProfile(false)
      }
    }

    loadProfile()
    return () => { active = false }
  }, [auth?.accessToken, auth?.user?.email, navigate])

  useEffect(() => {
    if (!auth?.accessToken) return undefined
    let active = true

    async function loadAddresses() {
      setLoadingAddresses(true)
      try {
        const response = await getUserAddresses()
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? []
        if (!Array.isArray(items)) {
          throw new Error('Unexpected addresses response.')
        }
        if (active) setAddresses(items.map(mapUserAddress))
      } catch (error) {
        if (active) {
          setNotice({ type: 'error', message: error.message || 'Unable to load your addresses.' })
        }
      } finally {
        if (active) setLoadingAddresses(false)
      }
    }

    loadAddresses()
    return () => { active = false }
  }, [auth?.accessToken])

  useEffect(() => {
    try {
      localStorage.setItem('elephanta_wishlist', JSON.stringify(wishlist))
    } catch {
      setNotice({ type: 'error', message: 'Unable to save wishlist items in this browser.' })
    }
  }, [wishlist])

  function showNotice(message, type = 'success') {
    setNotice({ type, message })
  }

  async function handleProfileSave(event) {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const body = await updateUserProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phoneNumber: profile.phoneNumber.trim(),
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender,
      })
      showNotice(body?.message || 'Your profile has been updated.')
    } catch (error) {
      showNotice(error.message || 'Unable to update your profile.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSave(passwordData, onSuccess) {
    setLoading(true)
    setNotice(null)
    try {
      const body = await changeUserPassword(passwordData)
      onSuccess()
      showNotice(body?.message || 'Your password has been changed.')
    } catch (error) {
      showNotice(error.message || 'Unable to change your password.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddressSave(form) {
    setLoading(true)
    try {
      const payload = toUserAddressPayload(form)
      if (form.id === null) {
        const response = await createUserAddress(payload)
        const savedAddress = mapUserAddress(response)
        setAddresses((current) => [
          ...current.map((address) =>
            payload.isPrimary ? { ...address, isDefault: false } : address
          ),
          savedAddress,
        ])
      } else {
        await updateUserAddress(form.id, payload)
        setAddresses((current) => current.map((address) => {
          if (address.id === form.id) {
            return {
              ...address,
              addressLine1: payload.addressLine1,
              addressLine2: payload.addressLine2,
              city: payload.city,
              state: payload.state,
              postalCode: payload.postalCode,
              country: payload.country,
              isDefault: payload.isPrimary,
            }
          }
          return payload.isPrimary ? { ...address, isDefault: false } : address
        }))
      }
      showNotice('Address saved successfully.')
    } catch (error) {
      showNotice(error.message || 'Unable to save your address.', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function handleAddressDelete(id) {
    setLoading(true)
    try {
      await deleteUserAddress(id)
      setAddresses((current) => current.filter((item) => item.id !== id))
      showNotice('Address deleted successfully.')
    } catch (error) {
      showNotice(error.message || 'Unable to delete your address.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function removeWishlistItem(id) {
    setWishlist((current) => current.filter((item) => item.id !== id))
  }

  function clearWishlist() {
    setWishlist([])
    showNotice('Your wishlist has been cleared.', 'info')
  }

  async function handleLogout() {
    try {
      if (auth?.refreshToken) await logout(auth.refreshToken, 'customer')
    } catch {
      // Clear local authentication even if the server logout request fails.
    } finally {
      clearCustomerAuth()
      navigate('/login', { replace: true })
    }
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || 'My Account'
  const menuItems = [
    ...tabs,
    { id: 'orders', label: 'Order History', icon: ShoppingCart, to: '/manage-profile/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, to: '/manage-profile/wishlist' },
  ]
  const activeItem = menuItems.find((item) => item.id === activeTab)
  const pageTitle = isOrderDetails ? 'Order Details' : activeTab === 'personal' ? 'Manage Profile' : activeItem?.label
  const pageDescription = activeTab === 'orders'
    ? 'View and track your past orders.'
    : activeTab === 'wishlist'
      ? 'Save your favourite jewellery for later.'
      : 'Update your personal details, manage your addresses and keep your account secure.'

  return (
    <main className="min-h-[calc(100vh-260px)] bg-[#FCFAF7] text-[#183129]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-[#879087]">
          <Link to="/" className="hover:text-[#A77B4C]">Home</Link><span>/</span><span className="text-[#183129]">My Account</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[304px_minmax(0,1fr)] xl:gap-10">
          <aside className="overflow-hidden rounded-lg border border-[#E5D9C8] bg-white">
            <div className="border-b border-[#EEE8DF] p-5 sm:p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2E9DC] text-[#A77B4C]"><UserRound size={30} strokeWidth={1.4} /></div>
              <h2 className="mt-4 break-words font-serif text-xl">{displayName}</h2>
              <p className="mt-1 break-all text-sm text-[#7A857E]">{profile.email || 'Manage your account details'}</p>
            </div>
            <nav aria-label="Account menu" className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:grid-cols-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id
                return (
                  <Link key={item.id} to={item.to} onClick={() => setNotice(null)} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-left text-xs transition sm:text-sm ${active ? 'bg-[#F5EEE4] font-medium text-[#956336] lg:border-l-4 lg:border-[#A77B4C] lg:pl-2' : 'text-[#526058] hover:bg-[#FCFAF7] hover:text-[#183129]'}`}>
                    <Icon size={20} strokeWidth={1.6} className="shrink-0" /><span>{item.label}</span>
                  </Link>
                )
              })}
              <button type="button" onClick={handleLogout} className="col-span-2 flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-left text-xs text-[#526058] transition hover:bg-[#FCFAF7] hover:text-[#9B5147] sm:col-span-1 sm:text-sm lg:col-span-1"><LogOut size={20} strokeWidth={1.6} />Logout</button>
            </nav>
          </aside>

          <section className="min-w-0">
            <div className="mb-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A77B4C]">My Account</p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{pageTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A857E]">{pageDescription}</p>
            </div>

            {tabs.some((tab) => tab.id === activeTab) && (
              <div className="mb-5 overflow-x-auto border-b border-[#DEDCD6]">
                <div className="flex min-w-max">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const active = activeTab === tab.id
                    return <Link key={tab.id} to={tab.to} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2.5 border-b-2 px-4 py-4 text-xs transition sm:px-5 sm:text-sm ${active ? 'border-[#A77B4C] font-medium text-[#956336]' : 'border-transparent text-[#718078] hover:text-[#183129]'}`}><Icon size={19} strokeWidth={1.6} />{tab.label}</Link>
                  })}
                </div>
              </div>
            )}

            {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 flex items-start gap-3 rounded-md border p-4 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : notice.type === 'info' ? 'border-[#E5D9C8] bg-[#F5EEE4] text-[#725332]' : 'border-green-200 bg-green-50 text-green-800'}`}>
              <span className="flex-1">{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button>
            </div>}

            <div className="min-w-0 rounded-lg border border-[#E5D9C8] bg-white p-5 sm:p-7 lg:p-8">
              {loadingProfile
                ? <p role="status" className="py-10 text-center text-sm text-[#7A857E]">Loading your profile...</p>
                : <Outlet context={{
                  profile,
                  setProfile,
                  addresses,
                  loadingAddresses,
                  wishlist,
                  orders,
                  loading,
                  onProfileSave: handleProfileSave,
                  onPasswordSave: handlePasswordSave,
                  onAddressSave: handleAddressSave,
                  onAddressDelete: handleAddressDelete,
                  onRemoveWishlistItem: removeWishlistItem,
                  onClearWishlist: clearWishlist,
                }} />}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}