export const BASE = 'http://localhost:81'

const AUTH_STORAGE_KEYS = {
  admin: 'elephanta_admin_auth',
  customer: 'elephanta_customer_auth',
}

function saveScopedAuth(scope, obj) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS[scope], JSON.stringify(obj))
  } catch {}
}

function loadScopedAuth(scope) {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS[scope])
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearScopedAuth(scope) {
  try { localStorage.removeItem(AUTH_STORAGE_KEYS[scope]) } catch {}
}

export const saveAdminAuth = (auth) => saveScopedAuth('admin', auth)
export const loadAdminAuth = () => loadScopedAuth('admin')
export const clearAdminAuth = () => clearScopedAuth('admin')
export const saveCustomerAuth = (auth) => saveScopedAuth('customer', auth)
export const loadCustomerAuth = () => loadScopedAuth('customer')
export const clearCustomerAuth = () => clearScopedAuth('customer')

export async function refreshToken(refreshToken) {
  const res = await fetch(`${BASE}/api/Auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (res.status === 401) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  if (!res.ok) {
    const txt = await res.text()
    const err = new Error(`Refresh failed: ${res.status} ${txt}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

async function parseJsonOrText(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

async function apiGetFor(scope, path, init = {}) {
  const res = await fetchWithAuthFor(scope, path, { method: 'GET', ...init })
  if (res.status === 204) return null
  if (!res.ok) {
    const body = await parseJsonOrText(res)
    const err = new Error(`Request failed: ${res.status} ${JSON.stringify(body)}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return parseJsonOrText(res)
}

async function apiPostFor(scope, path, data, init = {}) {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const body = headers.get('Content-Type')?.includes('application/json') ? JSON.stringify(data) : data
  const res = await fetchWithAuthFor(scope, path, { method: 'POST', ...init, headers, body })
  if (res.status === 204) return null
  if (!res.ok) {
    const bodyErr = await parseJsonOrText(res)
    const err = new Error(`Request failed: ${res.status} ${JSON.stringify(bodyErr)}`)
    err.status = res.status
    err.body = bodyErr
    throw err
  }
  return parseJsonOrText(res)
}

export const adminApiGet = (path, init) => apiGetFor('admin', path, init)
export const adminApiPost = (path, data, init) => apiPostFor('admin', path, data, init)
export const customerApiGet = (path, init) => apiGetFor('customer', path, init)
export const customerApiPost = (path, data, init) => apiPostFor('customer', path, data, init)


export function buildUrl(path) {
  if (!path) return BASE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${BASE}${path}`
  return `${BASE}/${path}`
}

async function fetchWithAuthFor(scope, input, init = {}) {
  const url = buildUrl(input)
  const loadAuth = scope === 'admin' ? loadAdminAuth : loadCustomerAuth
  const saveAuth = scope === 'admin' ? saveAdminAuth : saveCustomerAuth
  const clearAuth = scope === 'admin' ? clearAdminAuth : clearCustomerAuth
  const auth = loadAuth()

  const headers = new Headers(init.headers || {})
  if (auth?.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)

  const res = await fetch(url, { ...init, headers })
  if (res.status !== 401) return res

  // on 401 try refresh once
  if (!auth?.refreshToken) {
    clearAuth()
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  try {
    const newAuth = await refreshToken(auth.refreshToken)
    saveAuth(newAuth)
    const retryHeaders = new Headers(init.headers || {})
    if (newAuth?.accessToken) retryHeaders.set('Authorization', `Bearer ${newAuth.accessToken}`)
    const retry = await fetch(url, { ...init, headers: retryHeaders })
    if (retry.status === 401) {
      clearAuth()
      const err = new Error('Unauthorized')
      err.status = 401
      throw err
    }
    return retry
  } catch (e) {
    clearAuth()
    throw e
  }
}

export const fetchWithAdminAuth = (input, init) => fetchWithAuthFor('admin', input, init)
export const fetchWithCustomerAuth = (input, init) => fetchWithAuthFor('customer', input, init)
