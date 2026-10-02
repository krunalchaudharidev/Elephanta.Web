import { apiGet, apiPost } from './api'
import { showToast, ToastTypes } from '../pages/admin/component/Toast'

export async function getCategories(pageNumber = 1, pageSize = 10) {
	const q = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
	return apiGet(`/api/Product/categories?${q.toString()}`)
}

export async function searchProducts({ name, minPrice, maxPrice, categoryId, sort, isActive, pageNumber = 1, pageSize = 10 } = {}) {
	const q = new URLSearchParams()
	if (name !== undefined && name !== null && String(name).trim() !== '') q.append('name', String(name))
	if (minPrice !== undefined && minPrice !== null && String(minPrice).trim() !== '') q.append('minPrice', String(minPrice))
	if (maxPrice !== undefined && maxPrice !== null && String(maxPrice).trim() !== '') q.append('maxPrice', String(maxPrice))
	if (categoryId) q.append('categoryId', String(categoryId))
	if (sort) q.append('sort', String(sort))
	if (isActive !== undefined && isActive !== null) q.append('isActive', String(isActive))
	q.append('pageNumber', String(pageNumber))
	q.append('pageSize', String(pageSize))
	return apiGet(`/api/Product/products/search?${q.toString()}`)
}

export async function getProduct(id) {
	if (!id) throw new Error('id required')
	return apiGet(`/api/Product/products/${id}`)
}

export async function getProductFaqs(productId) {
	if (!productId) throw new Error('productId required')
	return apiGet(`/api/Product/products/${productId}/faqs`)
}

export async function createProductFaq(productId, payload) {
	if (!productId) throw new Error('productId required')
	try {
		const res = await fetchWithAuth(`/api/Product/products/${productId}/faqs`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		if (!res.ok) {
			const txt = await res.text()
			const err = new Error(`Create FAQ failed: ${res.status} ${txt}`)
			err.status = res.status
			showToast(ToastTypes.ERROR, err.message)
			throw err
		}
		const json = await res.json()
		const success = json?.isSuccess ?? json?.IsSuccess ?? true
		if (success) showToast(ToastTypes.SUCCESS, json?.message || json?.Message || 'FAQ added successfully.')
		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to add FAQ.')
		return json
	} catch (e) {
		showToast(ToastTypes.ERROR, e.message || 'Failed to add FAQ.')
		throw e
	}
}

export async function updateProductFaq(id, payload) {
 	if (!id) throw new Error('id required')
 	try {
 		const res = await fetchWithAuth(`/api/Product/products/faqs/${id}`, {
 			method: 'PUT',
 			headers: { 'Content-Type': 'application/json' },
 			body: JSON.stringify(payload),
 		})
 		if (!res.ok) {
 			const txt = await res.text()
 			const err = new Error(`Update FAQ failed: ${res.status} ${txt}`)
 			err.status = res.status
 			showToast(ToastTypes.ERROR, err.message)
 			throw err
 		}
 		const json = await res.json()
 		const success = json?.isSuccess ?? json?.IsSuccess
 		if (success) showToast(ToastTypes.INFO, json?.message || json?.Message || 'FAQ updated successfully.')
 		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to update FAQ.')
 		return json
 	} catch (e) {
 		showToast(ToastTypes.ERROR, e.message || 'Failed to update FAQ.')
 		throw e
 	}
}

export async function deleteProductFaq(id) {
 	if (!id) throw new Error('id required')
 	try {
 		const res = await fetchWithAuth(`/api/Product/products/faqs/${id}`, { method: 'DELETE' })
 		if (!res.ok) {
 			const txt = await res.text()
 			let apiMsg = txt
 			try {
 				const parsed = JSON.parse(txt)
 				apiMsg = parsed?.message ?? parsed?.Message ?? txt
 			} catch {}
 			const err = new Error(`Delete FAQ failed: ${res.status} ${apiMsg}`)
 			err.status = res.status
 			err.body = txt
 			err.apiMessage = apiMsg
 			throw err
 		}
 		const json = await res.json()
 		const success = json?.isSuccess ?? json?.IsSuccess
 		if (success) showToast(ToastTypes.SUCCESS, json?.message || json?.Message || 'FAQ deleted successfully.')
 		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to delete FAQ.')
 		return json
 	} catch (e) {
 		throw e
 	}
}

export async function createProduct(payload) {
	try {
		const res = await apiPost('/api/Product/products', payload)
		const success = res?.isSuccess ?? res?.IsSuccess ?? true
		if (success) {
			showToast(ToastTypes.SUCCESS, res?.message || res?.Message || 'Product created successfully.')
		} else {
			showToast(ToastTypes.ERROR, res?.message || res?.Message || 'Failed to create product.')
		}
		return res
	} catch (e) {
		showToast(ToastTypes.ERROR, e.message || 'Failed to create product.')
		throw e
	}
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

export async function updateProduct(id, payload) {
	if (!id) throw new Error('id required')
	try {
		const res = await fetchWithAuth(`/api/Product/products/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		if (res.status === 204) {
			showToast(ToastTypes.INFO, 'Product details have been updated.')
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
		if (success) showToast(ToastTypes.INFO, json?.message || json?.Message || 'Product details have been updated.')
		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to update product.')
		return json
	} catch (e) {
		showToast(ToastTypes.ERROR, e.message || 'Failed to update product.')
		throw e
	}
}

export async function deleteProduct(id) {
	if (!id) throw new Error('id required')
	try {
		const res = await fetchWithAuth(`/api/Product/products/${id}`, { method: 'DELETE' })
		if (res.status === 204) {
			showToast(ToastTypes.SUCCESS, 'Product deleted successfully.')
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
		if (success) showToast(ToastTypes.SUCCESS, json?.message || json?.Message || 'Product deleted successfully.')
		else showToast(ToastTypes.ERROR, json?.message || json?.Message || 'Failed to delete product.')
		return json
	} catch (e) {
		throw e
	}
}
