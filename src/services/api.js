export const BASE = 'http://localhost:81'

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

export async function apiGet(path, init = {}) {
  const res = await fetchWithAuth(path, { method: 'GET', ...init })
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

export async function apiPost(path, data, init = {}) {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const body = headers.get('Content-Type')?.includes('application/json') ? JSON.stringify(data) : data
  const res = await fetchWithAuth(path, { method: 'POST', ...init, headers, body })
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


function buildUrl(path) {
  if (!path) return BASE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${BASE}${path}`
  return `${BASE}/${path}`
}

export async function fetchWithAuth(input, init = {}) {
  const url = buildUrl(input)
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
