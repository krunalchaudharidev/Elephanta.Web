import { useEffect, useState } from 'react'
import { getCategories, createCategory } from '../../../services/productapi'

export default function CreateCategoryModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [parents, setParents] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (!open) return
    let mounted = true
    async function loadParents() {
      setLoadingParents(true)
      try {
        const res = await getCategories(1, 1000)
        if (!mounted) return
        const items = res?.items || res?.Items || []
        setParents(items)
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoadingParents(false)
      }
    }
    loadParents()
    return () => { mounted = false }
  }, [open])

  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
      setDisplayOrder(0)
      setIsActive(true)
      setParentCategoryId('')
      setErrors({})
      setApiError(null)
    }
  }, [open])

  function validate() {
    const e = {}
    if (!name || !name.trim()) e.name = 'Name is required'
    if (!slug || !slug.trim()) e.slug = 'Slug is required'
    if (displayOrder < 0 || Number.isNaN(Number(displayOrder))) e.displayOrder = 'Must be 0 or greater'
    if (imageUrl && imageUrl.trim()) {
      try { new URL(imageUrl) } catch { e.imageUrl = 'Invalid URL' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description || null,
        imageUrl: imageUrl || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: Boolean(isActive),
        parentCategoryId: parentCategoryId || null,
      }
      const res = await createCategory(payload)
      // expect ApiResponse { isSuccess, message, id }
      const success = res?.isSuccess ?? res?.IsSuccess
      if (success) {
        onCreated && onCreated(res?.id ?? res?.Id)
        onClose()
      } else {
        setApiError(res?.message || res?.Message || 'Failed to create')
      }
    } catch (err) {
      setApiError(err.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Category</h3>
          <button type="button" className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        {apiError && <div className="mb-3 text-red-600">{apiError}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.slug && <div className="text-red-600 text-sm mt-1">{errors.slug}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.imageUrl && <div className="text-red-600 text-sm mt-1">{errors.imageUrl}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Display Order</label>
            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.displayOrder && <div className="text-red-600 text-sm mt-1">{errors.displayOrder}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Parent Category</label>
            <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="">— None —</option>
              {parents.map((p) => (
                <option key={p.id || p.Id} value={p.id || p.Id}>{p.name || p.Name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span className="text-sm">Active</span>
            </label>
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
