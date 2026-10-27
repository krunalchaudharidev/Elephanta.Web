import { customerApiGet, fetchWithCustomerAuth } from './api'

const USER_ADDRESSES_ENDPOINT = '/api/User/addresses'

export async function getUserProfile() {
  return customerApiGet('/api/User/me')
}

export async function updateUserProfile(payload) {
  return sendUserRequest('/api/User/profile', 'PUT', payload)
}

export async function changeUserPassword(payload) {
  return sendUserRequest('/api/User/change-password', 'POST', payload)
}

export async function getUserAddresses() {
  return customerApiGet(USER_ADDRESSES_ENDPOINT)
}

export async function getUserAddress(id) {
  if (!id) throw new Error('id required')
  return customerApiGet(`${USER_ADDRESSES_ENDPOINT}/${encodeURIComponent(id)}`)
}

async function sendUserRequest(path, method, payload) {
  const headers = new Headers()
  const init = { method, headers }
  if (payload !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(payload)
  }

  const response = await fetchWithCustomerAuth(path, init)
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok || body?.isSuccess === false || body?.IsSuccess === false) {
    const message = body?.message || body?.Message || body
    const error = new Error(
      typeof message === 'string'
        ? message
        : response.ok
          ? 'The request was not successful.'
          : `Request failed: ${response.status} ${JSON.stringify(message)}`
    )
    error.status = response.status
    error.body = body
    throw error
  }

  return body
}

export async function createUserAddress(payload) {
  return sendUserRequest(USER_ADDRESSES_ENDPOINT, 'POST', payload)
}

export async function updateUserAddress(id, payload) {
  if (!id) throw new Error('id required')
  return sendUserRequest(
    `${USER_ADDRESSES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PUT',
    payload
  )
}

export async function deleteUserAddress(id) {
  if (!id) throw new Error('id required')
  return sendUserRequest(
    `${USER_ADDRESSES_ENDPOINT}/${encodeURIComponent(id)}`,
    'DELETE'
  )
}
