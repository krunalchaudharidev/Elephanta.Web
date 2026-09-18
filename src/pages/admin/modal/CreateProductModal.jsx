import { useEffect, useState } from 'react'
import { createProduct, getCategories } from '../../../services/productapi'
import FileUpload from '../component/FileUpload'
import ToggleSwitch from '../component/ToggleSwitch'
import { uploadMedia } from '../../../services/mediaapi'

export default function CreateProductModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
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

  function validate() {
    const e = {}
    if (!name || !name.trim()) e.name = 'Name is required'
    if (!slug || !slug.trim()) e.slug = 'Slug is required'
    if (!sku || !sku.trim()) e.sku = 'SKU is required'
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
            <label className="block text-sm font-medium text-gray-600">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            {errors.slug && <div className="text-red-600 text-sm mt-1">{errors.slug}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">SKU *</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            {errors.sku && <div className="text-red-600 text-sm mt-1">{errors.sku}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
              <option value="">— None —</option>
              {categories.map((c) => (<option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.name ?? c.Name}</option>))}
            </select>
            {errors.categoryId && <div className="text-red-600 text-sm mt-1">{errors.categoryId}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Short Description</label>
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Price *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            {errors.price && <div className="text-red-600 text-sm mt-1">{errors.price}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Compare At Price</label>
            <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Stock Quantity</label>
            <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            {errors.stockQuantity && <div className="text-red-600 text-sm mt-1">{errors.stockQuantity}</div>}
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-3">
              <ToggleSwitch checked={isActive} onChange={(v) => setIsActive(v)} />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
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
