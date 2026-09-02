import { BASE, apiPost, saveAuth, loadAuth, clearAuth, refreshToken } from './api'

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

export async function logout(refreshToken) {
  await apiPost('/api/Auth/logout', { refreshToken })
}

export { saveAuth, loadAuth, clearAuth, refreshToken }

export default {
  login,
  saveAuth,
  loadAuth,
  clearAuth,
  logout,
  refreshToken,
}
