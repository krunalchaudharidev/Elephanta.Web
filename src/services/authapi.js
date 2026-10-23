import {
  BASE,
  saveAdminAuth,
  loadAdminAuth,
  clearAdminAuth,
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
  refreshToken,
  fetchWithAdminAuth,
  fetchWithCustomerAuth,
} from './api'

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (res.status === 401) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  if (!res.ok) {
    const txt = await res.text()
    const err = new Error(`Server error: ${res.status} ${txt}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

export async function register({
  firstName,
  middleName,
  lastName,
  email,
  phoneNumber,
  role,
  password,
}) {
  const res = await fetch(`${BASE}/api/Auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      role,
      password,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    const err = new Error(`Registration failed: ${res.status} ${body}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

export async function logout(refreshToken, scope) {
  const fetchWithAuth = scope === 'admin' ? fetchWithAdminAuth : fetchWithCustomerAuth
  const res = await fetchWithAuth('/api/Auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) throw new Error(`Logout failed: ${res.status}`)
}

export {
  saveAdminAuth,
  loadAdminAuth,
  clearAdminAuth,
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
  refreshToken,
}

export default {
  login,
  register,
  saveAdminAuth,
  loadAdminAuth,
  clearAdminAuth,
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
  logout,
  refreshToken,
}
