import { apiGet, apiPost, fetchWithAuth } from './api'
import { showToast, ToastTypes } from '../pages/admin/component/Toast'

export async function searchOffers({ name, code, isActive, sort, pageNumber = 1, pageSize = 10 } = {}) {
  const q = new URLSearchParams()
  if (name !== undefined && name !== null && String(name).trim() !== '') q.append('name', String(name))
  if (code !== undefined && code !== null && String(code).trim() !== '') q.append('code', String(code))
  if (sort) q.append('sort', String(sort))
  if (isActive !== undefined && isActive !== null) q.append('isActive', String(isActive))
  q.append('pageNumber', String(pageNumber))
  q.append('pageSize', String(pageSize))
  return apiGet(`/api/Offer/offers/search?${q.toString()}`)
}

export async function getOffer(id) {
  if (!id) throw new Error('id required')
  return apiGet(`/api/Offer/offers/${id}`)
}

export async function createOffer(payload) {
  try {
    const res = await apiPost('/api/Offer/offers', payload)
    const success = res?.isSuccess ?? res?.IsSuccess ?? true
    if (success) {
      showToast(ToastTypes.SUCCESS, res?.message || res?.Message || 'Offer created successfully.')
    } else {
      showToast(ToastTypes.ERROR, res?.message || res?.Message || 'Failed to create offer.')
    }
    return res
  } catch (e) {
    showToast(ToastTypes.ERROR, e.message || 'Failed to create offer.')
    throw e
  }
}

export async function updateOffer(id, payload) {
  if (!id) throw new Error('id required')
  try {
    const res = await fetchWithAuth(`/api/Offer/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 204) {
      showToast(ToastTypes.INFO, 'Offer updated successfully.')
      return null
    }
    if (!res.ok) {
      const txt = await res.text()
      const err = new Error(`Update failed: ${res.status} ${txt}`)
      err.status = res.status
      showToast(ToastTypes.ERROR, err.message)
      throw err
    }
    const json = await res.json()
    const success = json?.isSuccess ?? json?.IsSuccess
    if (success) showToast(ToastTypes.INFO, json?.message || json?.Message || 'Offer updated successfully.')
    else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to update offer.')
    return json
  } catch (e) {
    showToast(ToastTypes.ERROR, e.message || 'Failed to update offer.')
    throw e
  }
}

export async function deleteOffer(id) {
  if (!id) throw new Error('id required')
  try {
    const res = await fetchWithAuth(`/api/Offer/offers/${id}`, { method: 'DELETE' })
    if (res.status === 204) {
      showToast(ToastTypes.SUCCESS, 'Offer deleted successfully.')
      return null
    }
    if (!res.ok) {
      const txt = await res.text()
      let apiMsg = txt
      try {
        const parsed = JSON.parse(txt)
        apiMsg = parsed?.message ?? parsed?.Message ?? txt
      } catch {}
      const err = new Error(`Delete failed: ${res.status} ${apiMsg}`)
      err.status = res.status
      err.body = txt
      err.apiMessage = apiMsg
      throw err
    }
    const json = await res.json()
    const success = json?.isSuccess ?? json?.IsSuccess
    if (success) showToast(ToastTypes.SUCCESS, json?.message || json?.Message || 'Offer deleted successfully.')
    else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to delete offer.')
    return json
  } catch (e) {
    throw e
  }
}
