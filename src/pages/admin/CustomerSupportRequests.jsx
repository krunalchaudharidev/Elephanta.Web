import { useEffect, useState } from 'react'
import { Eye, Mail, Phone } from 'lucide-react'
import PageHeader from '../../components/admin/shared/PageHeader'
import { formatToIST } from '../../utils/date'
import { getCustomerSupportRequests } from '../../services/customersupportapi'
import { useLoading } from '../../contexts/LoadingContext'
import CustomerSupportRequestDetailsModal from '../../components/admin/modal/CustomerSupportRequestDetailsModal'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export default function CustomerSupportRequests() {
  const [items, setItems] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const { setLoading } = useLoading()

  useEffect(() => {
    let cancelled = false

    async function loadRequests() {
      setLoading(true)
      setError('')
      try {
        const response = await getCustomerSupportRequests(pageNumber, pageSize)
        if (cancelled) return
        setItems(response?.items ?? response?.Items ?? [])
        setTotalCount(response?.totalCount ?? response?.TotalCount ?? 0)
      } catch (requestError) {
        if (!cancelled) {
          setItems([])
          setTotalCount(0)
          setError(requestError?.message || String(requestError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRequests()
    return () => {
      cancelled = true
      setLoading(false)
    }
  }, [pageNumber, pageSize, setLoading])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstPage = Math.max(1, Math.min(pageNumber - 2, totalPages - 4))
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstPage + index
  )

  return (
    <div className="w-full">
      <PageHeader
        title="Customer Support Requests"
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Customer Support Requests' },
        ]}
      />

      <div className="mb-6">
        <p className="text-sm text-gray-500">View customer enquiries and their resolution status.</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 text-red-600">
          Error: {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Message</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Resolved At</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.length > 0 ? items.map((request) => {
              const isResolved = request.isResolved ?? request.IsResolved ?? false
              const requestId = request.id ?? request.Id
              const phone = request.phone ?? request.Phone ?? ''
              const email = request.email ?? request.Email ?? ''
              const phoneHref = phone ? `tel:${String(phone).replace(/[^\d+]/g, '')}` : ''
              return (
                <tr key={requestId}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                    {request.name ?? request.Name ?? '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div>{request.email ?? request.Email ?? '-'}</div>
                    <div>{request.phone ?? request.Phone ?? '-'}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {request.subject ?? request.Subject ?? '-'}
                  </td>
                  <td className="max-w-md whitespace-pre-wrap px-4 py-4 text-sm text-gray-600">
                    {(() => {
                      const message = request.message ?? request.Message ?? '-'
                      return message.length > 20 ? `${message.slice(0, 20)}...` : message
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {isResolved ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {formatDate(request.resolvedAt ?? request.ResolvedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {formatToIST(request.createdAt ?? request.CreatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRequestId(requestId)}
                        aria-label={`View request from ${request.name ?? request.Name ?? 'customer'}`}
                        title="View full information"
                        className="rounded p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Eye size={18} />
                      </button>
                      {phoneHref ? (
                        <a
                          href={phoneHref}
                          aria-label={`Call ${request.name ?? request.Name ?? 'customer'}`}
                          title="Call customer"
                          className="rounded p-2 text-green-700 hover:bg-green-50"
                        >
                          <Phone size={18} />
                        </a>
                      ) : (
                        <button type="button" disabled title="No phone number" aria-label="No phone number" className="rounded p-2 text-gray-300">
                          <Phone size={18} />
                        </button>
                      )}
                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          aria-label={`Email ${request.name ?? request.Name ?? 'customer'}`}
                          title="Email customer"
                          className="rounded p-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Mail size={18} />
                        </a>
                      ) : (
                        <button type="button" disabled title="No email address" aria-label="No email address" className="rounded p-2 text-gray-300">
                          <Mail size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No customer support requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing page {pageNumber} of {totalPages} — {totalCount} items
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="support-page-size" className="text-sm text-gray-500">Per page</label>
            <select
              id="support-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPageNumber(1)
              }}
              className="rounded border bg-white px-2 py-1 text-sm"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="rounded border bg-white px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="hidden items-center gap-1 sm:flex">
            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPageNumber(page)}
                className={`rounded px-3 py-1 ${page === pageNumber ? 'bg-indigo-600 text-white' : 'border bg-white'}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
            disabled={pageNumber >= totalPages}
            className="rounded border bg-white px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <CustomerSupportRequestDetailsModal
        open={Boolean(selectedRequestId)}
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onResolved={(updatedRequest) => {
          const updatedId = updatedRequest?.id ?? updatedRequest?.Id ?? selectedRequestId
          setItems((current) => current.map((item) => (
            (item.id ?? item.Id) === updatedId ? updatedRequest : item
          )))
        }}
      />
    </div>
  )
}
