import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../../components/admin/shared/PageHeader'
import ToggleSwitch from '../../components/admin/shared/ToggleSwitch'
import { getWebsiteSetting, saveWebsiteSetting } from '../../services/websitesettingsapi'
import { showToast, ToastTypes } from '../../components/admin/shared/Toast'

const initialSettings = {
	siteName: '',
	facebookURL: '',
	instagramURL: '',
	phoneNo: '',
	email: '',
	freeShippingOnOrdersAbove: 0,
	address: '',
	isMaintenanceMode: true,
}

const inputClassName = 'mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100'

function FormField({ id, label, required = false, children }) {
	return (
		<div>
			<label htmlFor={id} className="block text-sm font-medium text-gray-700">
				{label}{required && <span className="text-red-500"> *</span>}
			</label>
			{children}
		</div>
	)
}

export default function WebsiteSettings() {
	const [settings, setSettings] = useState(initialSettings)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		let mounted = true

		async function loadSettings() {
			try {
				const response = await getWebsiteSetting()
				if (!mounted || !response) return

				setSettings({
					siteName: response.siteName ?? response.SiteName ?? '',
					facebookURL: response.facebookURL ?? response.FacebookURL ?? '',
					instagramURL: response.instagramURL ?? response.InstagramURL ?? '',
					phoneNo: response.phoneNo ?? response.PhoneNo ?? '',
					email: response.email ?? response.Email ?? '',
					freeShippingOnOrdersAbove: response.freeShippingOnOrdersAbove ?? response.FreeShippingOnOrdersAbove ?? 0,
					address: response.address ?? response.Address ?? '',
					isMaintenanceMode: Boolean(response.isMaintenanceMode ?? response.IsMaintenanceMode ?? false),
				})
			} catch (error) {
				if (mounted) {
					showToast(ToastTypes.ERROR, error.message || 'Failed to load website settings.')
				}
			} finally {
				if (mounted) setLoading(false)
			}
		}

		loadSettings()
		return () => { mounted = false }
	}, [])

	function updateSetting(field, value) {
		setSettings((current) => ({ ...current, [field]: value }))
	}

	function validate() {
		const nextErrors = {}
		if (!settings.siteName.trim()) nextErrors.siteName = 'Website name is required.'
		if (settings.facebookURL && !isValidUrl(settings.facebookURL)) nextErrors.facebookURL = 'Enter a valid Facebook URL.'
		if (settings.instagramURL && !isValidUrl(settings.instagramURL)) nextErrors.instagramURL = 'Enter a valid Instagram URL.'
		if (!/^(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/.test(settings.phoneNo.trim())) {
			nextErrors.phoneNo = 'Enter a valid 10-digit Indian mobile number.'
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.trim())) nextErrors.email = 'Enter a valid email address.'
		if (settings.freeShippingOnOrdersAbove === '' || !Number.isFinite(Number(settings.freeShippingOnOrdersAbove)) || Number(settings.freeShippingOnOrdersAbove) < 0) {
			nextErrors.freeShippingOnOrdersAbove = 'Enter an amount of 0 or greater.'
		}
		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	function isValidUrl(value) {
		try {
			const url = new URL(value)
			return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
		} catch {
			return false
		}
	}

	async function handleSubmit(event) {
		event.preventDefault()
		if (saving) return
		if (!validate()) return

		setSaving(true)
		try {
			await saveWebsiteSetting({
				...settings,
				freeShippingOnOrdersAbove: Number(settings.freeShippingOnOrdersAbove),
			})
		} catch {
			// The API service displays the save error toast.
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="mx-auto max-w-[1200px]">
			<PageHeader
				title="Website Settings"
				breadcrumbs={[
					{ label: 'Dashboard', to: '/admin/dashboard' },
					{ label: 'Website Settings' },
				]}
			/>

			<form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
				<div className="mb-6">
					<h2 className="text-lg font-semibold text-gray-900">Store information</h2>
					<p className="mt-1 text-sm text-gray-500">Manage your website details and store preferences.</p>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
					<FormField id="siteName" label="Website Name" required>
						<input
							id="siteName"
							name="siteName"
							type="text"
							required
							value={settings.siteName}
							onChange={(event) => updateSetting('siteName', event.target.value)}
							placeholder="Enter website name"
							className={inputClassName}
						/>
						{errors.siteName && <div className="mt-1 text-sm text-red-600">{errors.siteName}</div>}
					</FormField>

					<FormField id="phoneNo" label="Phone Number" required>
						<input
							id="phoneNo"
							name="phoneNo"
							type="tel"
							required
							pattern="(?:[+]91[ -]?|0)?[6-9][0-9]{4}[ -]?[0-9]{5}"
							title="Enter a valid phone number."
							value={settings.phoneNo}
							onChange={(event) => updateSetting('phoneNo', event.target.value)}
							placeholder="+1 (555) 000-0000"
							className={inputClassName}
						/>
						{errors.phoneNo && <div className="mt-1 text-sm text-red-600">{errors.phoneNo}</div>}
					</FormField>

					<FormField id="email" label="Email Address" required>
						<input
							id="email"
							name="email"
							type="email"
							required
							value={settings.email}
							onChange={(event) => updateSetting('email', event.target.value)}
							placeholder="admin@example.com"
							className={inputClassName}
						/>
						{errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
					</FormField>

					<FormField id="freeShippingOnOrdersAbove" label="Free Shipping Minimum" required>
						<input
							id="freeShippingOnOrdersAbove"
							name="freeShippingOnOrdersAbove"
							type="number"
							required
							min="0"
							step="any"
							value={settings.freeShippingOnOrdersAbove}
							onChange={(event) => updateSetting('freeShippingOnOrdersAbove', event.target.value)}
							placeholder="E.g., 50"
							className={inputClassName}
						/>
						{errors.freeShippingOnOrdersAbove && <div className="mt-1 text-sm text-red-600">{errors.freeShippingOnOrdersAbove}</div>}
					</FormField>

					<FormField id="facebookURL" label="Facebook URL">
						<input
							id="facebookURL"
							name="facebookURL"
							type="url"
							value={settings.facebookURL}
							onChange={(event) => updateSetting('facebookURL', event.target.value)}
							placeholder="https://facebook.com"
							className={inputClassName}
						/>
						{errors.facebookURL && <div className="mt-1 text-sm text-red-600">{errors.facebookURL}</div>}
					</FormField>

					<FormField id="instagramURL" label="Instagram URL">
						<input
							id="instagramURL"
							name="instagramURL"
							type="url"
							value={settings.instagramURL}
							onChange={(event) => updateSetting('instagramURL', event.target.value)}
							placeholder="https://instagram.com"
							className={inputClassName}
						/>
						{errors.instagramURL && <div className="mt-1 text-sm text-red-600">{errors.instagramURL}</div>}
					</FormField>

					<div className="md:col-span-2">
						<FormField id="address" label="Business Address">
							<textarea
								id="address"
								name="address"
								rows={4}
								value={settings.address}
								onChange={(event) => updateSetting('address', event.target.value)}
								placeholder="Enter physical business address"
								className={`${inputClassName} resize-y`}
							/>
							{errors.address && <div className="mt-1 text-sm text-red-600">{errors.address}</div>}
						</FormField>
					</div>

					<div className="md:col-span-2">
						<label className="inline-flex cursor-pointer items-center gap-3">
							<ToggleSwitch
								checked={settings.isMaintenanceMode}
								onChange={(value) => updateSetting('isMaintenanceMode', value)}
							/>
							<span className="text-sm font-medium text-gray-700">Enable Maintenance Mode</span>
						</label>
					</div>
				</div>

				<div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
					<button
						type="submit"
						disabled={loading || saving}
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
					>
						<Save className="h-4 w-4" />
						{loading ? 'Loading...' : saving ? 'Saving...' : 'Save Settings'}
					</button>
				</div>
			</form>
		</div>
	)
}
