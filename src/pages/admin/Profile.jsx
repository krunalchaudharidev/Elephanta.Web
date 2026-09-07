import { useEffect, useState } from 'react'
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
      <div style={{ marginBottom: 14, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4.8vw, 44px)', lineHeight: 1 }}>{'Profile'}</h1>
        <div style={{ color: 'var(--text)', marginTop: 8, fontSize: 14 }}>Dashboard / Profile</div>
        
      </div>

      <div className="card" style={{ width: '100%', margin: '18px 0', padding: 32, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTab('profile')}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: tab === 'profile' ? 'none' : '1px solid var(--border)',
                background: tab === 'profile' ? 'linear-gradient(90deg, var(--accent), #6f7bff)' : 'transparent',
                color: tab === 'profile' ? 'white' : 'inherit',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              User Profile
            </button>
            <button
              onClick={() => setTab('password')}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: tab === 'password' ? 'none' : '1px solid var(--border)',
                background: tab === 'password' ? 'linear-gradient(90deg, var(--accent), #6f7bff)' : 'transparent',
                color: tab === 'password' ? 'white' : 'inherit',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Change Password
            </button>
          </div>
        </div>

        {toast && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ padding: 10, borderRadius: 10, background: toast.type === 'error' ? '#fff1f0' : '#f0fff4', border: `1px solid ${toast.type === 'error' ? '#f5c2c7' : '#d1f3dc'}`, color: toast.type === 'error' ? '#7a1a1f' : '#065f46' }}>
              {toast.text}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="form" noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              <div>
                <label>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" />
                {errors.firstName && <div className="error">{errors.firstName}</div>}
              </div>
              <div>
                <label>Middle Name <span style={{ color: 'var(--text)', fontSize: 13, marginLeft: 6 }}>(optional)</span></label>
                <input value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Enter middle name" />
                {errors.middleName && <div className="error">{errors.middleName}</div>}
              </div>

              <div>
                <label>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" />
                {errors.lastName && <div className="error">{errors.lastName}</div>}
              </div>
              <div>
                <label>Phone Number</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" />
                {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button type="submit" className="submit" disabled={saving} style={{ width: 140, padding: '10px 14px' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className="form" noValidate style={{ marginTop: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, width: '100%', maxWidth: 720 }}>
              <div style={{ position: 'relative' }}>
                <label>Old Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Enter old password" />
                  <button type="button" aria-label="Toggle old password" onClick={() => setShowOld(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
                    {showOld ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                {errors.oldPassword && <div className="error">{errors.oldPassword}</div>}
              </div>

              <div style={{ position: 'relative' }}>
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
                  <button type="button" aria-label="Toggle new password" onClick={() => setShowNew(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
                    {showNew ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8 }}>Password must be 8+ characters and include letters and numbers.</div>
                {errors.newPassword && <div className="error">{errors.newPassword}</div>}
              </div>

              <div style={{ position: 'relative' }}>
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                  <button type="button" aria-label="Toggle confirm password" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-6 0-10-7-10-7a20.42 20.42 0 014.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="submit" className="submit" disabled={pwLoading} style={{ width: 140, padding: '10px 14px' }}>
                {pwLoading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
