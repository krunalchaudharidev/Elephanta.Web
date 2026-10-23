import { useEffect, useState } from 'react'
import {
  getCustomerSupportRequest,
  markCustomerSupportRequestResolved,
} from '../../../services/customersupportapi'
import { formatToIST } from '../../../utils/date'
import { showToast, ToastTypes } from '../shared/Toast'

export default function CustomerSupportRequestDetailsModal({ open, requestId, onClose, onResolved }) {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !requestId) return undefined
    let cancelled = false

    async function loadRequest() {
      setLoading(true)
      setRequest(null)
      setError('')
      try {
        const response = await getCustomerSupportRequest(requestId)
        if (!cancelled) setRequest(response)
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.message || String(requestError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRequest()
    return () => {
      cancelled = true
    }
  }, [open, requestId])

  async function handleMarkResolved() {
    if (!requestId || resolving) return
    setResolving(true)
    setError('')
    try {
      const result = await markCustomerSupportRequestResolved(requestId)
      const success = result?.isSuccess ?? result?.IsSuccess ?? true
      if (!success) {
        throw new Error(
          result?.message ??
            result?.Message ??
            'Unable to mark the support request as resolved.'
        )
      }
      showToast(
        ToastTypes.SUCCESS,
        result?.message ??
          result?.Message ??
          'Customer support request marked as resolved.'
      )
      const resolvedAt = new Date().toISOString()
      const updatedRequest = {
        ...request,
        isResolved: true,
        IsResolved: true,
        resolvedAt,
        ResolvedAt: resolvedAt,
        updatedAt: resolvedAt,
        UpdatedAt: resolvedAt,
      }
      setRequest(updatedRequest)
      onResolved?.(updatedRequest)
    } catch (requestError) {
      setError(requestError?.message || String(requestError))
    } finally {
      setResolving(false)
    }
  }

  if (!open) return null
  const isResolved = request?.isResolved ?? request?.IsResolved ?? false

  const fields = [
    ['Name', request?.name ?? request?.Name],
    ['Email', request?.email ?? request?.Email],
    ['Phone', request?.phone ?? request?.Phone],
    ['Subject', request?.subject ?? request?.Subject],
    ['Status', isResolved ? 'Resolved' : 'Pending'],
    ['Resolved At', formatToIST(request?.resolvedAt ?? request?.ResolvedAt)],
    ['Created At', formatToIST(request?.createdAt ?? request?.CreatedAt)],
    ['Updated At', formatToIST(request?.updatedAt ?? request?.UpdatedAt)],
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-support-details-title"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="customer-support-details-title" className="text-lg font-semibold text-gray-900">
            Customer Support Request
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close request details"
            className="rounded p-2 text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {loading && <p role="status" className="py-6 text-sm text-gray-500">Loading request...</p>}
        {error && <p role="alert" className="py-4 text-sm text-red-600">Unable to load request: {error}</p>}
        {!loading && !error && request && (
          <div className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-gray-900">
                    {label === 'Status' ? (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {value}
                      </span>
                    ) : value || '-'}
                  </dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Message</h3>
              <p className="mt-1 whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                {request.message ?? request.Message ?? '-'}
              </p>
            </div>
            {!isResolved && (
              <button
                type="button"
                onClick={handleMarkResolved}
                disabled={resolving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resolving ? 'Marking as resolved...' : 'Mark as resolved'}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
