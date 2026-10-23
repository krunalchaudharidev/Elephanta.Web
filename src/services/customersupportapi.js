import { adminApiGet, customerApiPost, fetchWithAdminAuth } from './api'

const CUSTOMER_SUPPORT_REQUESTS_ENDPOINT = '/api/CustomerSupport/requests'

export async function getCustomerSupportRequests(pageNumber = 1, pageSize = 10) {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })
  return adminApiGet(`${CUSTOMER_SUPPORT_REQUESTS_ENDPOINT}?${query.toString()}`)
}

export async function getCustomerSupportRequest(id) {
  if (!id) throw new Error('id required')
  return adminApiGet(`${CUSTOMER_SUPPORT_REQUESTS_ENDPOINT}/${encodeURIComponent(id)}`)
}

export async function markCustomerSupportRequestResolved(id) {
  if (!id) throw new Error('id required')
  const response = await fetchWithAdminAuth(
    `${CUSTOMER_SUPPORT_REQUESTS_ENDPOINT}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isResolved: true }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Unable to resolve support request: ${response.status} ${body}`)
  }

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : response.text()
}

export async function createCustomerSupportRequest({
  name,
  subject,
  message,
  email,
  phone,
}) {
  return customerApiPost(CUSTOMER_SUPPORT_REQUESTS_ENDPOINT, {
    name,
    subject,
    message,
    email,
    phone,
  })
}
