import { useEffect, useState } from 'react'
import ToggleSwitch from '../component/ToggleSwitch'
import RichTextEditor from '../component/RichTextEditor'
import { createOffer } from '../../../services/offerapi'
import { showToast, ToastTypes } from '../component/Toast'
import FileUpload from '../component/FileUpload'
import { uploadMedia } from '../../../services/mediaapi'

export default function CreateOfferModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('Percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('')
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setName('')
    setCode('')
    setDescription('')
    setDiscountType('Percentage')
    setDiscountValue('')
    setMinimumOrderAmount('')
    setMaximumDiscountAmount('')
    setStartDate('')
    setEndDate('')
    setUsageLimit('')
    setIsActive(true)
    setSelectedFiles([])
    setErrors({})
    setSubmitting(false)
  }, [open])

  function validate() {
    const e = {}
    if (!name || !name.trim()) e.name = 'Name is required'
    if (!code || !code.trim()) e.code = 'Code is required'
    const dv = Number(discountValue)
    if (discountValue === '' || Number.isNaN(dv)) e.discountValue = 'Discount value is required'
    if (!startDate) e.startDate = 'Start date is required'
    if (!endDate) e.endDate = 'End date is required'
    if (startDate && endDate) {
      const sd = new Date(startDate)
      const ed = new Date(endDate)
      if (Number.isNaN(sd.getTime())) e.startDate = 'Start date is invalid'
      if (Number.isNaN(ed.getTime())) e.endDate = 'End date is invalid'
      if (!Number.isNaN(sd.getTime()) && !Number.isNaN(ed.getTime()) && ed < sd) e.endDate = 'End date must be after start date'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      // upload files first
      const imageIds = []
      if (selectedFiles && selectedFiles.length > 0) {
        for (const f of selectedFiles) {
          try {
            const up = await uploadMedia({ file: f, moduleType: 'offer' })
            const id = up?.id ?? up?.Id
            if (id) imageIds.push(id)
          } catch (err) {
            // ignore upload error but notify
            showToast(ToastTypes.ERROR, err?.message || 'Failed to upload image')
          }
        }
      }

      const payload = {
        name: name.trim(),
        code: code.trim(),
        description: description || null,
        discountType: discountType || null,
        discountValue: discountValue === '' ? null : Number(discountValue),
        minimumOrderAmount: minimumOrderAmount === '' ? null : Number(minimumOrderAmount),
        maximumDiscountAmount: maximumDiscountAmount === '' ? null : Number(maximumDiscountAmount),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        usageLimit: usageLimit === '' ? null : Number(usageLimit),
        isActive: Boolean(isActive),
      }

      if (imageIds.length) payload.imageIds = imageIds
      if (imageIds.length) payload.primaryImageId = imageIds[0]

      // POST to API (createOffer shows its own success/error toasts)
      const res = await createOffer(payload)
      onCreated && onCreated(res)
      onClose && onClose()
    } catch (err) {
      // keep modal open for correction
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Offer</h3>
          <button type="button" className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500"> *</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Code<span className="text-red-500"> *</span></label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.code && <div className="text-red-600 text-sm mt-1">{errors.code}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="mt-1">
              <RichTextEditor value={description} onChange={(v) => setDescription(v)} minHeight={120} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Type</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Value<span className="text-red-500"> *</span></label>
            <input type="number" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.discountValue && <div className="text-red-600 text-sm mt-1">{errors.discountValue}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Order Amount</label>
            <input type="number" step="0.01" value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Discount Amount</label>
            <input type="number" step="0.01" value={maximumDiscountAmount} onChange={(e) => setMaximumDiscountAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date<span className="text-red-500"> *</span></label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.startDate && <div className="text-red-600 text-sm mt-1">{errors.startDate}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date<span className="text-red-500"> *</span></label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            {errors.endDate && <div className="text-red-600 text-sm mt-1">{errors.endDate}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
            <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
          </div>

          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-3">
              <ToggleSwitch checked={isActive} onChange={(v) => setIsActive(v)} />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <div className="mt-1">
              <FileUpload
                accept="image/*"
                moduleType="offer"
                multiple={true}
                onChange={(files) => setSelectedFiles(files)}
                onRemove={(id) => {
                  setSelectedFiles((prev) => {
                    if (!prev || !prev.length) return []
                    if (typeof id === 'number') return prev.filter((_, idx) => idx !== id)
                    return prev.filter((f) => !(f && (f.id === id || f.Id === id)))
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting ? 'Saving...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  )
}
