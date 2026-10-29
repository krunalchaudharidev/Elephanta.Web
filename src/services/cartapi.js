import {
  customerApiGet,
  customerApiPost,
  fetchWithCustomerAuth,
  loadCustomerAuth,
} from './api'

const CART_ITEMS_ENDPOINT = '/api/Cart/items'
const GUEST_CART_SESSION_STORAGE_KEY = 'elephanta_guest_cart_session_id'

export function getCartSessionId() {
  if (loadCustomerAuth()?.accessToken) return undefined

  const existingSessionId = window.localStorage.getItem(
    GUEST_CART_SESSION_STORAGE_KEY
  )
  if (existingSessionId) return existingSessionId

  const cryptoApi = window.crypto
  let sessionId
  if (cryptoApi?.randomUUID) {
    sessionId = cryptoApi.randomUUID()
  } else if (cryptoApi?.getRandomValues) {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    sessionId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } else {
    throw new Error('Unable to create a guest cart session in this browser.')
  }

  window.localStorage.setItem(GUEST_CART_SESSION_STORAGE_KEY, sessionId)
  return sessionId
}

export async function getCartItemsForProducts(productIds, sessionId) {
  const remainingProductIds = new Set(
    productIds.map((productId) => String(productId).toLowerCase())
  )
  const foundItems = new Map()
  if (remainingProductIds.size === 0) return foundItems

  const requestedPageSize = 10
  let pageNumber = 1

  while (remainingProductIds.size > 0) {
    const response = await getCartItems(pageNumber, requestedPageSize, sessionId)
    const items = response?.items ?? response?.Items ?? []

    for (const item of items) {
      const productId = item?.productId ?? item?.ProductId
      if (productId === undefined || productId === null) continue

      const key = String(productId).toLowerCase()
      if (remainingProductIds.delete(key)) foundItems.set(key, item)
    }

    const totalCount = Number(response?.totalCount ?? response?.TotalCount)
    const responsePageNumber = Number(
      response?.pageNumber ?? response?.PageNumber ?? pageNumber
    )
    const responsePageSize = Number(
      response?.pageSize ?? response?.PageSize ?? requestedPageSize
    )
    const currentPageSize =
      Number.isFinite(responsePageSize) && responsePageSize > 0
        ? responsePageSize
        : requestedPageSize
    const currentPageNumber =
      Number.isFinite(responsePageNumber) && responsePageNumber > 0
        ? responsePageNumber
        : pageNumber
    const hasMorePages =
      items.length >= currentPageSize &&
      (!Number.isFinite(totalCount) ||
        currentPageNumber * currentPageSize < totalCount)

    if (items.length === 0 || !hasMorePages) return foundItems
    pageNumber = currentPageNumber + 1
  }

  return foundItems
}

export async function getAllCartItems(sessionId) {
  const pageSize = 10
  const allItems = []
  let pageNumber = 1

  while (true) {
    const response = await getCartItems(pageNumber, pageSize, sessionId)
    const items = response?.items ?? response?.Items ?? []
    allItems.push(...items)

    const totalCount = Number(response?.totalCount ?? response?.TotalCount)
    const responsePageNumber = Number(
      response?.pageNumber ?? response?.PageNumber ?? pageNumber
    )
    const responsePageSize = Number(
      response?.pageSize ?? response?.PageSize ?? pageSize
    )
    const currentPageSize =
      Number.isFinite(responsePageSize) && responsePageSize > 0
        ? responsePageSize
        : pageSize
    const currentPageNumber =
      Number.isFinite(responsePageNumber) && responsePageNumber > 0
        ? responsePageNumber
        : pageNumber
    const hasMorePages =
      items.length >= currentPageSize &&
      (!Number.isFinite(totalCount) ||
        currentPageNumber * currentPageSize < totalCount)

    if (items.length === 0 || !hasMorePages) return allItems
    pageNumber = currentPageNumber + 1
  }
}

export async function getCartItems(pageNumber = 1, pageSize = 10, sessionId = null) {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  return customerApiGet(`${CART_ITEMS_ENDPOINT}?${query.toString()}`)
}

export async function getCartItem(id, sessionId = null) {
  if (!id) throw new Error('id required')

  return customerApiGet(getCartItemPath(id, sessionId))
}

export async function addCartItem(productId, quantity, sessionId) {
  return customerApiPost(CART_ITEMS_ENDPOINT, { productId, quantity, sessionId })
}

export async function updateCartItem(id, quantity, sessionId = null) {
  if (!id) throw new Error('id required')

  return sendCartItemRequest(getCartItemPath(id, sessionId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
}

export async function deleteCartItem(id, sessionId = null) {
  if (!id) throw new Error('id required')

  return sendCartItemRequest(getCartItemPath(id, sessionId), { method: 'DELETE' })
}

function getCartItemPath(id, sessionId) {
  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  return `${CART_ITEMS_ENDPOINT}/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ''}`
}

async function sendCartItemRequest(path, init) {
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
