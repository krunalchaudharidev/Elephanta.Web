import {
  adminApiGet as apiGet,
  adminApiPost as apiPost,
  fetchWithAdminAuth,
} from './api'

const COMMON_FAQS_ENDPOINT = '/api/CommonFaqs'

export async function getCommonFaqs() {
  return apiGet(COMMON_FAQS_ENDPOINT)
}

export async function getCommonFaq(id) {
  if (!id) throw new Error('id required')
  return apiGet(`${COMMON_FAQS_ENDPOINT}/${encodeURIComponent(id)}`)
}

export async function createCommonFaq(payload) {
  return apiPost(COMMON_FAQS_ENDPOINT, payload)
}

export async function updateCommonFaq(id, payload) {
  if (!id) throw new Error('id required')
  const response = await fetchWithAdminAuth(
    `${COMMON_FAQS_ENDPOINT}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Unable to update common FAQ: ${response.status} ${body}`)
  }

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? response.json()
    : response.text()
}

export async function deleteCommonFaq(id) {
  if (!id) throw new Error('id required')
  const response = await fetchWithAdminAuth(
    `${COMMON_FAQS_ENDPOINT}/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Unable to delete common FAQ: ${response.status} ${body}`)
  }

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? response.json()
    : response.text()
}
