import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from './component/PageHeader'
import { searchProducts } from '../../services/productapi'
import { useLoading } from '../../contexts/LoadingContext'
import RemoteImage from './component/RemoteImage'
import CreateProductModal from './modal/CreateProductModal'
import DeleteConfirm from './component/DeleteConfirm'
import { showToast, ToastTypes } from './component/Toast'
import { deleteProduct } from '../../services/productapi'

export default function AdminProducts() {
  const [items, setItems] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const { isLoading, setLoading: setLoadingContext } = useLoading()
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // filters
  const [name, setName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  async function loadData(pg = pageNumber) {
    try { setLoadingContext?.(true) } catch {}
    setError(null)
    try {
      const res = await searchProducts({ name: name || undefined, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined, pageNumber: pg, pageSize })
      const list = res?.items || res?.Items || []
      setItems(list)
      setTotalCount(res?.totalCount ?? res?.TotalCount ?? 0)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      try { setLoadingContext?.(false) } catch {}
    }
  }

  useEffect(() => { loadData(1) }, [pageSize])

  function handleSearch(e) {
    e?.preventDefault && e.preventDefault()
    setPageNumber(1)
    loadData(1)
  }

  function handleReset() {
    setName('')
    setMinPrice('')
    setMaxPrice('')
    setPageNumber(1)
    loadData(1)
  }

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))

  async function handleConfirmDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteProduct(deleting.id || deleting.Id)
      setShowDelete(false)
      setDeleting(null)
      loadData(pageNumber)
    } catch (e) {
      let msg = e?.apiMessage || e?.message || String(e)
      if (!e?.apiMessage) {
        const m = String(e?.message || '')
        const idx = m.indexOf('{')
        if (idx >= 0) {
          try {
            const parsed = JSON.parse(m.slice(idx))
            msg = parsed?.message || parsed?.Message || m
          } catch {}
        }
      }
      try { showToast(ToastTypes.ERROR, msg) } catch {}
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="w-full">
      <PageHeader title="Products" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Manage products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>
      <CreateProductModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData(1) }} />

      <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by name" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Min Price</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Max Price</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">Search</button>
          <button type="button" onClick={handleReset} className="px-4 py-2 rounded border">Reset</button>
        </div>
      </form>

      {error && <div className="mb-4 text-red-600">Error: {String(error)}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items && items.length ? items.map((p) => {
              const id = p.id ?? p.Id
              const nameVal = p.name ?? p.Name
              const price = p.price ?? p.Price
              const compareAt = p.compareAtPrice ?? p.CompareAtPrice
              const imageIds = p.imageIds ?? p.ImageIds ?? []
              const imgSrc = imageIds && imageIds.length ? `/api/Media/${imageIds[0]}` : ''
              return (
                <tr key={id}>
                  <td className="px-4 py-4 whitespace-nowrap w-28">
                    <div className="h-16 w-24 bg-gray-50 flex items-center justify-center overflow-hidden rounded-md">
                      {imgSrc ? (
                        <RemoteImage src={imgSrc} alt={nameVal} className="object-cover h-full w-full" />
                      ) : (
                        <div className="text-gray-400 text-sm">No image</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-normal max-w-xs text-sm text-gray-500">{nameVal}</td>
                  <td className="px-4 py-4 whitespace-normal max-w-xs text-sm text-gray-500">{p.sku ?? p.SKU ?? '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">₹{Number(price).toFixed(2)}{compareAt ? <span className="ml-2 text-sm text-gray-400 line-through">₹{Number(compareAt).toFixed(2)}</span> : null}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{p.stockQuantity ?? p.StockQuantity ?? 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{p.categoryName ?? p.CategoryName ?? '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${((p.isActive ?? p.IsActive) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700')}`}>{(p.isActive ?? p.IsActive) ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex text-right justify-end gap-2">
                      <Link to={`/admin/products/${id}`} className="p-2 rounded hover:bg-gray-100" aria-label="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M4 13V16h3l8.293-8.293-3-3L4 13z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      <button onClick={() => { setDeleting(p); setShowDelete(true) }} className="p-2 rounded hover:bg-gray-100" aria-label="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 012 0v7a1 1 0 11-2 0V7z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Showing page {pageNumber} of {totalPages} — {totalCount} items</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Per page</label>
            <select
              value={pageSize}
              onChange={(e) => { const v = Number(e.target.value); setPageSize(v); setPageNumber(1); }}
              className="text-sm px-2 py-1 border rounded bg-white"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPageNumber((p) => Math.max(1, p - 1)); loadData(Math.max(1, pageNumber - 1)) }}
            disabled={pageNumber <= 1}
            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
          >Prev</button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).slice(Math.max(0, pageNumber - 3), pageNumber + 2).map((_, idx) => {
              const p = Math.max(1, Math.min(totalPages, pageNumber - 2 + idx))
              return (
                <button
                  key={p}
                  onClick={() => { setPageNumber(p); loadData(p) }}
                  className={`px-3 py-1 rounded ${p === pageNumber ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
                >{p}</button>
              )
            })}
          </div>

          <button
            onClick={() => { setPageNumber((p) => Math.min(totalPages, p + 1)); loadData(Math.min(totalPages, pageNumber + 1)) }}
            disabled={pageNumber >= totalPages}
            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
          >Next</button>
        </div>
      </div>
      <DeleteConfirm
        open={showDelete}
        title="Delete product"
        message={`Delete "${deleting?.name ?? deleting?.Name}"?`}
        onClose={() => { setShowDelete(false); setDeleting(null) }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
