import { useEffect, useState } from 'react'
import { createProduct, getCategories } from '../../../services/productapi'
import FileUpload from '../component/FileUpload'
import ToggleSwitch from '../component/ToggleSwitch'
import { uploadMedia } from '../../../services/mediaapi'
import RichTextEditor from '../component/RichTextEditor'

export default function CreateProductModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [sku, setSku] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (!open) return
    let mounted = true
    async function loadCats() {
      try {
        const res = await getCategories(1, 1000)
        if (!mounted) return
        const items = res?.items || res?.Items || []
        setCategories(items)
      } catch (e) {}
    }
    loadCats()
    return () => { mounted = false }
  }, [open])

  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setSku('')
      setShortDescription('')
      setDescription('')
      setPrice('')
      setCompareAtPrice('')
      setStockQuantity(0)
      setIsActive(true)
      setIsFeatured(false)
      setCategoryId('')
      setSelectedFiles([])
      setErrors({})
      setApiError(null)
    }
  }, [open])

  function slugify(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function validate() {
    const e = {}
    if (!name || !name.trim()) e.name = 'Name is required'
    if (!slug || !slug.trim()) e.slug = 'Slug is required'
    if (!sku || !sku.trim()) e.sku = 'SKU is required'
    if (!shortDescription || !shortDescription.trim()) e.shortDescription = 'Short Description is required'
    if (price === '' || price === null) {
      e.price = 'Price is required'
    } else {
      const p = Number(price)
      if (Number.isNaN(p) || p < 0) e.price = 'Price must be a number >= 0'
    }
    if (!categoryId) e.categoryId = 'Category is required'
    const sq = Number(stockQuantity)
    if (!Number.isInteger(sq) || sq < 0) e.stockQuantity = 'Stock must be integer >= 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      // upload first selected file if present
      const imageIds = []
      if (selectedFiles && selectedFiles.length > 0) {
        for (const f of selectedFiles) {
          try {
            const up = await uploadMedia({ file: f, moduleType: 'product' })
            const id = up?.id ?? up?.Id
            if (id) imageIds.push(id)
          } catch (err) {
            // ignore single upload failure but record message
            setApiError(err.message || 'Failed to upload image')
          }
        }
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim(),
        shortDescription: shortDescription || null,
        description: description || null,
        price: Number(price) || 0,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stockQuantity: Number(stockQuantity) || 0,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        categoryId: categoryId || null,
      }

      if (imageIds.length) {
        payload.imageIds = imageIds
      }

      const res = await createProduct(payload)
      const created = res
      const id = created?.id ?? created?.Id
      if (id) {
        onCreated && onCreated(id)
        onClose()
      } else {
        // assume response contains created product or success flag
        onCreated && onCreated(created)
        onClose()
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
      <div className="fixed inset-0 bg-black/50" />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Product</h3>
          <button type="button" className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        {apiError && <div className="mb-3 text-red-600">{apiError}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name<span className="text-red-500"> *</span></label>
            <input value={name} onChange={(e) => {
              const v = e.target.value
              setName(v)
              if (!slugTouched) setSlug(slugify(v))
            }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug<span className="text-red-500"> *</span></label>
            <div className="relative">
              <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />

              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => { navigator.clipboard?.writeText(slug || '') }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 012-2h8" />
                </svg>
              </button>

            </div>
            {errors.slug && <div className="text-red-600 text-sm mt-1">{errors.slug}</div>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">SKU<span className="text-red-500"> *</span></label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {errors.sku && <div className="text-red-600 text-sm mt-1">{errors.sku}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Category<span className="text-red-500"> *</span></label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
              <option value="">— None —</option>
              {categories.map((c) => (<option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.name ?? c.Name}</option>))}
            </select>
            {errors.categoryId && <div className="text-red-600 text-sm mt-1">{errors.categoryId}</div>}
          </div>

          <div className="sm:col-span-2">
            <div className="mb-1.5 flex justify-between">
              <label className="block text-sm font-medium text-slate-700">Short Description<span className="text-red-500"> *</span></label>
              <span className="text-xs text-slate-400">{(shortDescription || '').length} / 200</span>
            </div>

            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={4} maxLength={200} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {errors.shortDescription && <div className="text-red-600 text-sm mt-1">{errors.shortDescription}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Description</label>
            <div className="mt-1">
              <RichTextEditor value={description} onChange={(v) => setDescription(v)} minHeight={120} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Price<span className="text-red-500"> *</span></label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {errors.price && <div className="text-red-600 text-sm mt-1">{errors.price}</div>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Compare At Price</label>
            <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock Quantity</label>
            <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {errors.stockQuantity && <div className="text-red-600 text-sm mt-1">{errors.stockQuantity}</div>}
          </div>

          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-3">
              <ToggleSwitch checked={isActive} onChange={(v) => setIsActive(v)} />
              <span className="text-sm">Active</span>
            </label>

            <label className="inline-flex items-center gap-3">
              <ToggleSwitch checked={isFeatured} onChange={(v) => setIsFeatured(v)} />
              <span className="text-sm">Featured</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Image</label>
            <div className="mt-1">
              <FileUpload accept="image/*" moduleType="product" multiple={true} onChange={(files) => setSelectedFiles(files)} />
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
