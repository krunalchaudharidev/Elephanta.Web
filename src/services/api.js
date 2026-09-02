const BASE = 'http://localhost:81'

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

export function saveAuth(obj) {
  try {
    localStorage.setItem('elephanta_auth', JSON.stringify(obj))
  } catch {}
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem('elephanta_auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  try { localStorage.removeItem('elephanta_auth') } catch {}
}
