import { apiGet, apiPost } from './api'
import { showToast, ToastTypes } from '../pages/admin/component/Toast'

const WEBSITE_SETTING_ENDPOINT = '/api/WebsiteSetting'

export async function getWebsiteSetting() {
  return apiGet(WEBSITE_SETTING_ENDPOINT)
}

export async function saveWebsiteSetting(payload) {
  try {
    const response = await apiPost(WEBSITE_SETTING_ENDPOINT, payload)
    const success = response?.isSuccess ?? response?.IsSuccess ?? true

    if (success) {
      showToast(
        ToastTypes.SUCCESS,
        response?.message || response?.Message || 'Website settings saved successfully.'
      )
    } else {
      showToast(
        ToastTypes.ERROR,
        response?.message || response?.Message || 'Failed to save website settings.'
      )
    }

    return response
  } catch (error) {
    showToast(ToastTypes.ERROR, error.message || 'Failed to save website settings.')
    throw error
  }
}
