import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAuth, BASE } from '../../services/api'
import { fetchWithAuth } from '../../services/api'

export default function AdminProfile() {
  const auth = loadAuth()
  const user = auth?.user || {}

  const [tab, setTab] = useState('profile')

  // Profile fields
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [middleName, setMiddleName] = useState(user.middleName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [originalUser, setOriginalUser] = useState(user)
  const [loadingUser, setLoadingUser] = useState(false)

  // Loading / UI state
  const [saving, setSaving] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Visibility toggles
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Validation and toast
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    // Load fresh user data from API and bind to fields
    let mounted = true
    async function load() {
      setLoadingUser(true)
      try {
        // Use a single-shot fetch with the current access token to avoid triggering
        // the global refresh/clearAuth logic in fetchWithAuth which can redirect.
        const authLocal = loadAuth()
        if (authLocal?.accessToken) {
          const r = await fetch(`${BASE}/api/User/me`, { headers: { Authorization: `Bearer ${authLocal.accessToken}` } })
          if (!mounted) return
          if (r.ok) {
            const body = await r.json()
            const u = body || {}
            setOriginalUser(u)
            setFirstName(u.firstName || '')
            setMiddleName(u.middleName || '')
            setLastName(u.lastName || '')
            setPhoneNumber(u.phoneNumber || '')
          }
        }
      } catch (err) {
        // ignore - keep auth user fallback
      } finally {
        if (mounted) setLoadingUser(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  function validateProfile() {
    const e = {}
    if (!firstName || !firstName.trim()) e.firstName = 'First name is required.'
    if (!lastName || !lastName.trim()) e.lastName = 'Last name is required.'
    if (phoneNumber && !/^\+?[0-9\- ]{7,20}$/.test(phoneNumber)) e.phoneNumber = 'Enter a valid phone number.'
    return e
  }

  async function saveProfile(e) {
    e.preventDefault()
    setErrors({})
    const evalid = validateProfile()
    if (Object.keys(evalid).length) {
      setErrors(evalid)
      return
    }
    setSaving(true)
    try {
      const res = await fetchWithAuth('/api/User/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, middleName, lastName, phoneNumber }),
      })
      const body = await res.json()
      if (body?.isSuccess) {
        setToast({ type: 'success', text: body.message || 'Profile updated successfully.' })
      } else {
        setToast({ type: 'error', text: body?.message || 'Update failed.' })
      }
    } catch (err) {
      setToast({ type: 'error', text: err?.message || 'Network request failed.' })
    } finally {
      setSaving(false)
    }
  }

  function resetProfile() {
    const u = originalUser || user || {}
    setFirstName(u.firstName || '')
    setMiddleName(u.middleName || '')
    setLastName(u.lastName || '')
    setPhoneNumber(u.phoneNumber || '')
    setErrors({})
  }

  function validatePassword() {
    const e = {}
    if (!oldPassword) e.oldPassword = 'Old password is required.'
    if (!newPassword) e.newPassword = 'New password is required.'
    if (!confirmPassword) e.confirmPassword = 'Confirm password is required.'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match.'
    // Example policy: min 8 chars, at least one number and letter (adapt if backend requires stricter)
    if (newPassword && !/(?=.{8,})(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) e.newPassword = 'Password must be 8+ characters and include letters and numbers.'
    return e
  }

  async function changePassword(e) {
    e.preventDefault()
    setErrors({})
    const evalid = validatePassword()
    if (Object.keys(evalid).length) {
      setErrors(evalid)
      return
    }
    setPwLoading(true)
    try {
      const res = await fetchWithAuth('/api/User/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      const body = await res.json()
      if (body?.isSuccess) {
        setToast({ type: 'success', text: body.message || 'Password changed successfully.' })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setToast({ type: 'error', text: body?.message || 'Change failed.' })
      }
    } catch (err) {
      setToast({ type: 'error', text: err?.message || 'Network request failed.' })
    } finally {
      setPwLoading(false)
    }
  }

  function clearPasswords() {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div>
            <div className="text-sm text-gray-500 mt-2">
              <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:underline">
                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Dashboard</span>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span>Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'profile' ? 'bg-gradient-to-r from-indigo-600 to-indigo-400 text-white' : 'border border-gray-200 text-gray-700'}`}>
            User Profile
          </button>
          <button onClick={() => setTab('password')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'password' ? 'bg-gradient-to-r from-indigo-600 to-indigo-400 text-white' : 'border border-gray-200 text-gray-700'}`}>
            Change Password
          </button>
        </div>

        {toast && (
          <div className={`mb-4 rounded-md px-4 py-2 ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            {toast.text}
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {errors.firstName && <div className="text-red-600 text-sm mt-1">{errors.firstName}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name <span className="text-xs text-gray-400">(optional)</span></label>
                <input value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Enter middle name" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {errors.middleName && <div className="text-red-600 text-sm mt-1">{errors.middleName}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {errors.lastName && <div className="text-red-600 text-sm mt-1">{errors.lastName}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {errors.phoneNumber && <div className="text-red-600 text-sm mt-1">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                <div className="relative mt-1">
                  <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Enter old password" className="block w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <button type="button" aria-label="Toggle old password" onClick={() => setShowOld(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                    {showOld ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                {errors.oldPassword && <div className="text-red-600 text-sm mt-1">{errors.oldPassword}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-1">
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="block w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <button type="button" aria-label="Toggle new password" onClick={() => setShowNew(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                    {showNew ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">Password must be 8+ characters and include letters and numbers.</div>
                {errors.newPassword && <div className="text-red-600 text-sm mt-1">{errors.newPassword}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative mt-1">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="block w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <button type="button" aria-label="Toggle confirm password" onClick={() => setShowConfirm(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                    {showConfirm ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <div className="text-red-600 text-sm mt-1">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={pwLoading} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
                {pwLoading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
