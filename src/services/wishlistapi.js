import { customerApiGet, customerApiPost, fetchWithCustomerAuth } from './api'

const WISHLIST_ENDPOINT = '/api/wishlist'

export async function getWishlist() {
  return customerApiGet(WISHLIST_ENDPOINT)
}

export async function addToWishlist(productId) {
  if (!productId) throw new Error('productId required')
  return customerApiPost(WISHLIST_ENDPOINT, { productId })
}

export async function removeFromWishlist(productId) {
  if (!productId) throw new Error('productId required')

  const response = await fetchWithCustomerAuth(
    `${WISHLIST_ENDPOINT}/${encodeURIComponent(productId)}`,
    { method: 'DELETE' }
  )

  if (response.status === 204) return null
  if (!response.ok) {
    const body = await response.text()
    const error = new Error(`Request failed: ${response.status} ${body}`)
    error.status = response.status
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : response.text()
}
