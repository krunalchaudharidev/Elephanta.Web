import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../services/productapi'
import CreateCategoryModal from './modal/CreateCategoryModal'
import EditCategoryModal from './modal/EditCategoryModal'
import DeleteConfirm from './component/DeleteConfirm'
import { showToast, ToastTypes } from './component/Toast'
import { deleteCategory } from '../../services/productapi'

export default function AdminCategories() {
  const [items, setItems] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function loadData(pg = pageNumber) {
    setLoading(true)
    setError(null)
    try {
      const res = await getCategories(pg, pageSize)
      setItems(res?.items || res?.Items || [])
      setTotalCount(res?.totalCount ?? res?.TotalCount ?? 0)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData(pageNumber) }, [pageNumber, pageSize])

  async function handleConfirmDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteCategory(deleting.id || deleting.Id)
      setShowDelete(false)
      setDeleting(null)
      loadData(pageNumber)
    } catch (e) {
      let msg = e?.apiMessage || e?.message || String(e)
      // message may include JSON; try to extract parsed message if present
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

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div>
            <div className="text-sm text-gray-500 mt-2">
              <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:underline">
                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Dashboard</span>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span>Categories</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          {/* empty placeholder to keep spacing consistent with previous header layout */}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-600">Error: {String(error)}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-white rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items && items.length ? items.map((c) => (
                  <tr key={c.id || c.Id}>
                    <td className="px-4 py-4 whitespace-nowrap w-28">
                      <div className="h-16 w-24 bg-gray-50 flex items-center justify-center overflow-hidden rounded-md">
                        { (c.imageUrl || c.ImageUrl) ? (
                          <img src={c.imageUrl || c.ImageUrl} alt={c.name || c.Name} className="object-cover h-full w-full" />
                        ) : (
                          <div className="text-gray-400 text-sm">No image</div>
                        ) }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal max-w-xs text-sm text-gray-500">{c.name || c.Name}</td>
                    <td className="px-4 py-4 whitespace-normal max-w-xs text-sm text-gray-500">{c.slug || c.Slug}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.parentCategoryName || c.ParentCategoryName || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.displayOrder ?? c.DisplayOrder ?? 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${((c.isActive ?? c.IsActive) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')}`}>{(c.isActive ?? c.IsActive) ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex text-right justify-end gap-2">
                        <button onClick={() => { setEditing(c); setShowEdit(true) }} className="p-2 rounded hover:bg-gray-100" aria-label="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M4 13V16h3l8.293-8.293-3-3L4 13z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button onClick={() => { setDeleting(c); setShowDelete(true) }} className="p-2 rounded hover:bg-gray-100" aria-label="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 012 0v7a1 1 0 11-2 0V7z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing page {pageNumber} of {totalPages} — {totalCount} items</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >Prev</button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(Math.max(0, pageNumber - 3), pageNumber + 2).map((_, idx) => {
                  const p = Math.max(1, Math.min(totalPages, pageNumber - 2 + idx))
                  return (
                    <button
                      key={p}
                      onClick={() => setPageNumber(p)}
                      className={`px-3 py-1 rounded ${p === pageNumber ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
                    >{p}</button>
                  )
                })}
              </div>

              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </>
      )}

      <CreateCategoryModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => loadData(1)} />
      <EditCategoryModal open={showEdit} onClose={() => setShowEdit(false)} category={editing} onUpdated={() => { setShowEdit(false); loadData(pageNumber) }} />
      <DeleteConfirm
        open={showDelete}
        title="Delete category"
        message={`Delete "${deleting?.name ?? deleting?.Name}"?`}
        onClose={() => { setShowDelete(false); setDeleting(null) }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
