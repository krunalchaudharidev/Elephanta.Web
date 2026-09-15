import { fetchWithAuth } from './api'
import { showToast, ToastTypes } from '../pages/admin/component/Toast'

export async function uploadMedia({ file, moduleType = 'product', isCompress = false, fieldName = 'File' }) {
  if (!file) throw new Error('file is required')
  const form = new FormData()
  form.append(fieldName, file)
  form.append('ModuleType', moduleType)
  form.append('IsCompress', isCompress ? 'true' : 'false')

  try {
    const res = await fetchWithAuth('/api/Media/upload', {
      method: 'POST',
      body: form,
    })

    if (res.status === 201 || res.ok) {
      // Created response should contain id and path
      const body = await (res.headers.get('content-type') || '').includes('application/json') ? res.json() : res.text()
      showToast(ToastTypes.SUCCESS, 'File uploaded')
      return body
    }

    const txt = await res.text()
    let parsed = txt
    try { parsed = JSON.parse(txt) } catch {}
    const msg = parsed?.message ?? parsed?.Message ?? txt
    showToast(ToastTypes.ERROR, msg || 'Upload failed')
    throw new Error(msg || `Upload failed: ${res.status}`)
  } catch (e) {
    showToast(ToastTypes.ERROR, e.message || 'Upload failed')
    throw e
  }
}

// Fetch a protected media endpoint and return a Blob, or null if the URL is not a media API or fetch failed.
export async function fetchMediaBlob(src) {
  if (!src) return null
  const isMediaApi = src.startsWith('/api/Media/') || src.includes('/api/Media/')
  if (!isMediaApi) return null

  try {
    const res = await fetchWithAuth(src, { method: 'GET' })
    if (!res.ok) return null
    const blob = await res.blob()
    return blob
  } catch (e) {
    return null
  }
}
