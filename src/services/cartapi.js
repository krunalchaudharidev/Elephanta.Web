import {
  customerApiGet,
  customerApiPost,
  fetchWithCustomerAuth,
} from './api'

const CART_ENDPOINT = '/api/Cart'
const CART_ITEMS_ENDPOINT = '/api/Cart/items'
const CART_SUMMARY_ENDPOINT = '/api/Cart/summary'
const CART_APPLY_COUPON_ENDPOINT = '/api/Cart/apply-coupon'
const CART_REMOVE_COUPON_ENDPOINT = '/api/Cart/remove-coupon'
const GUEST_CART_SESSION_STORAGE_KEY = 'elephanta_guest_cart_session_id'
export const CART_UPDATED_EVENT = 'elephanta:cart-updated'

function notifyCartUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  }
}

function getApiErrorMessage(body) {
  const message = body?.message ?? body?.Message
  if (typeof message === 'string' && message.trim()) return message
  if (typeof body === 'string' && body.trim()) return body
  return null
}

function getSummaryAmount(summary, camelCaseName, pascalCaseName) {
  const value = Number(summary?.[camelCaseName] ?? summary?.[pascalCaseName])
  if (!Number.isFinite(value)) {
    throw new Error(`Cart summary response has an invalid ${pascalCaseName}.`)
  }
  return value
}

export function normalizeCartSummary(summary) {
  if (!summary || typeof summary !== 'object') {
    throw new Error('Cart summary response is invalid.')
  }

  const couponCode = summary.couponCode ?? summary.CouponCode ?? ''
  const couponError = summary.couponError ?? summary.CouponError ?? ''
  const responseCouponValid = summary.couponValid ?? summary.CouponValid
  if (
    responseCouponValid !== undefined &&
    responseCouponValid !== null &&
    typeof responseCouponValid !== 'boolean'
  ) {
    throw new Error('Cart summary response has an invalid CouponValid.')
  }
  const couponValid =
    responseCouponValid ?? Boolean(couponCode && !couponError)

  return {
    subtotal: getSummaryAmount(summary, 'subtotal', 'Subtotal'),
    couponCode,
    couponValid,
    couponError,
    couponDiscount: getSummaryAmount(summary, 'couponDiscount', 'CouponDiscount'),
    shippingCharges: getSummaryAmount(summary, 'shippingCharges', 'ShippingCharges'),
    finalPayableAmount: getSummaryAmount(
      summary,
      'finalPayableAmount',
      'FinalPayableAmount'
    ),
  }
}

function normalizeCartApiError(error) {
  const body = error?.body
  const message =
    getApiErrorMessage(body) ||
    (typeof error?.message === 'string' && error.message) ||
    'Cart request failed.'
  const normalizedError = new Error(message)
  normalizedError.name = 'CartApiError'
  if (error?.status !== undefined) normalizedError.status = error.status
  if (body !== undefined) normalizedError.body = body
  return normalizedError
}

async function cartApiRequest(request) {
  try {
    const response = await request()
    if (response?.isSuccess === false || response?.IsSuccess === false) {
      const error = new Error(getApiErrorMessage(response) || 'Cart request failed.')
      error.body = response
      throw error
    }
    return response
  } catch (error) {
    throw normalizeCartApiError(error)
  }
}

export function getCartSessionId() {
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

  const items = await getAllCartItems(sessionId)
  for (const item of items) {
    const productId = item?.productId ?? item?.ProductId
    if (productId === undefined || productId === null) continue

    const key = String(productId).toLowerCase()
    if (remainingProductIds.delete(key)) foundItems.set(key, item)
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

export async function getCart(sessionId = getCartSessionId()) {
  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  return cartApiRequest(() =>
    customerApiGet(`${CART_ENDPOINT}${queryString ? `?${queryString}` : ''}`)
  )
}

export async function getCartSummary(sessionId = getCartSessionId()) {
  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  return cartApiRequest(() =>
    customerApiGet(
      `${CART_SUMMARY_ENDPOINT}${queryString ? `?${queryString}` : ''}`
    )
  )
}

export async function applyCartCoupon(
  couponCode,
  sessionId = getCartSessionId()
) {
  if (typeof couponCode !== 'string' || !couponCode.trim()) {
    throw new Error('couponCode required')
  }

  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  const response = await cartApiRequest(() =>
    customerApiPost(
      `${CART_APPLY_COUPON_ENDPOINT}${queryString ? `?${queryString}` : ''}`,
      { couponCode: couponCode.trim() }
    )
  )
  notifyCartUpdated()
  return response
}

export async function removeCartCoupon(sessionId = getCartSessionId()) {
  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  const response = await cartApiRequest(() =>
    sendCartRequest(
      `${CART_REMOVE_COUPON_ENDPOINT}${queryString ? `?${queryString}` : ''}`,
      { method: 'DELETE' }
    )
  )
  notifyCartUpdated()
  return response
}

export async function getCartItems(
  pageNumber = 1,
  pageSize = 10,
  sessionId = getCartSessionId()
) {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  return cartApiRequest(() =>
    customerApiGet(`${CART_ITEMS_ENDPOINT}?${query.toString()}`)
  )
}

export async function getCartItem(id, sessionId = getCartSessionId()) {
  if (!id) throw new Error('id required')

  return cartApiRequest(() =>
    customerApiGet(getCartItemPath(id, sessionId))
  )
}

export async function addCartItem(
  productId,
  quantity,
  sessionId = getCartSessionId()
) {
  const response = await cartApiRequest(() =>
    customerApiPost(CART_ITEMS_ENDPOINT, { productId, quantity, sessionId })
  )
  notifyCartUpdated()
  return response
}

export async function updateCartItem(
  id,
  quantity,
  sessionId = getCartSessionId()
) {
  if (!id) throw new Error('id required')

  const response = await cartApiRequest(() =>
    sendCartRequest(getCartItemPath(id, sessionId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
  )
  notifyCartUpdated()
  return response
}

export async function deleteCartItem(id, sessionId = getCartSessionId()) {
  if (!id) throw new Error('id required')

  const response = await cartApiRequest(() =>
    sendCartRequest(getCartItemPath(id, sessionId), { method: 'DELETE' })
  )
  notifyCartUpdated()
  return response
}

function getCartItemPath(id, sessionId) {
  const query = new URLSearchParams()
  if (sessionId !== null && sessionId !== undefined) {
    query.set('sessionId', sessionId)
  }
  const queryString = query.toString()
  return `${CART_ITEMS_ENDPOINT}/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ''}`
}

async function sendCartRequest(path, init) {
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
