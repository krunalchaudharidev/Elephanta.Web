import { apiGet, apiPost } from './api'
import { showToast, ToastTypes } from '../pages/admin/component/Toast'

export async function getCategories(pageNumber = 1, pageSize = 10) {
	const q = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
	return apiGet(`/api/Product/categories?${q.toString()}`)
}

export async function createCategory(payload) {
	try {
		const res = await apiPost('/api/Product/categories', payload)
		const success = res?.isSuccess ?? res?.IsSuccess
		if (success) {
			showToast(ToastTypes.SUCCESS, res?.message || res?.Message || 'Category added successfully.')
		} else {
			showToast(ToastTypes.ERROR, res?.message || res?.Message || 'Failed to create category.')
		}
		return res
	} catch (e) {
		showToast(ToastTypes.ERROR, e.message || 'Failed to create category.')
		throw e
	}
}

export async function updateCategory(id, payload) {
	if (!id) throw new Error('id required')
	try {
		const res = await fetchWithAuth(`/api/Product/categories/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		if (res.status === 204) {
			showToast(ToastTypes.INFO, 'Category details have been updated.')
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
		if (success) showToast(ToastTypes.INFO, json?.message || json?.Message || 'Category details have been updated.')
		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to update category.')
		return json
	} catch (e) {
		showToast(ToastTypes.ERROR, e.message || 'Failed to update category.')
		throw e
	}
}

import { fetchWithAuth } from './api'

export async function deleteCategory(id) {
	if (!id) throw new Error('id required')
	try {
		const res = await fetchWithAuth(`/api/Product/categories/${id}`, { method: 'DELETE' })
		if (res.status === 204) {
			showToast(ToastTypes.SUCCESS, 'Category deleted successfully.')
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
		if (success) showToast(ToastTypes.SUCCESS, json?.message || json?.Message || 'Category deleted successfully.')
		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to delete category.')
		return json
	} catch (e) {
		throw e
	}
}
