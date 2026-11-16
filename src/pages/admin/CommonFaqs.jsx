import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../components/admin/shared/PageHeader'
import DeleteConfirm from '../../components/admin/shared/DeleteConfirm'
import CommonFaqModal from '../../components/admin/modal/CommonFaqModal'
import { showToast, ToastTypes } from '../../components/admin/shared/Toast'
import {
  deleteCommonFaq,
  getCommonFaqs,
} from '../../services/commonfaqsapi'

export default function AdminCommonFaqs() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [deletingFaq, setDeletingFaq] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadFaqs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getCommonFaqs()
      if (!Array.isArray(response)) {
        throw new Error('Common FAQs response is not a list.')
      }
      setFaqs(response)
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load common FAQs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  function openCreateForm() {
    setEditingFaq(null)
    setShowForm(true)
  }

  function openEditForm(faq) {
    setEditingFaq(faq)
    setShowForm(true)
  }

  function handleSaved() {
    setEditingFaq(null)
    loadFaqs()
  }

  async function handleConfirmDelete() {
    if (!deletingFaq) return
    const id = deletingFaq.id ?? deletingFaq.Id
    if (id === undefined || id === null || id === '') {
      showToast(ToastTypes.ERROR, 'Common FAQ id is missing.')
      return
    }

    setDeleteLoading(true)
    try {
      const response = await deleteCommonFaq(id)
      const success = response?.isSuccess ?? response?.IsSuccess
      if (success === false) {
        throw new Error(
          response?.message ?? response?.Message ?? 'Unable to delete common FAQ.'
        )
      }

      setFaqs((current) => current.filter(
        (faq) => String(faq.id ?? faq.Id) !== String(id)
      ))
      setDeletingFaq(null)
      showToast(
        ToastTypes.SUCCESS,
        response?.message ?? response?.Message ?? 'Common FAQ deleted successfully.'
      )
    } catch (deleteError) {
      showToast(
        ToastTypes.ERROR,
        deleteError?.message || 'Unable to delete common FAQ.'
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Common FAQs"
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Common FAQs' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage frequently asked questions</p>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Add FAQ
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 text-sm text-red-600">
          <span>Error: {error}</span>
          <button type="button" onClick={loadFaqs} className="underline">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Question
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Answer
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Display order
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Loading common FAQs...
                </td>
              </tr>
            ) : faqs.length > 0 ? faqs.map((faq, index) => {
              const id = faq.id ?? faq.Id
              const isActive = Boolean(faq.isActive ?? faq.IsActive)
              return (
                <tr key={id ?? index}>
                  <td className="max-w-xs whitespace-normal px-4 py-4 text-sm text-gray-700">
                    {faq.question ?? faq.Question ?? '-'}
                  </td>
                  <td className="max-w-2xl whitespace-pre-wrap px-4 py-4 text-sm text-gray-600">
                    {faq.answer ?? faq.Answer ?? '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                    {faq.displayOrder ?? faq.DisplayOrder ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(faq)}
                        className="rounded p-2 hover:bg-gray-100"
                        aria-label={`Edit FAQ: ${faq.question ?? faq.Question ?? ''}`}
                        title="Edit"
                      >
                        <Pencil className="h-5 w-5 text-yellow-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingFaq(faq)}
                        className="rounded p-2 hover:bg-gray-100"
                        aria-label={`Delete FAQ: ${faq.question ?? faq.Question ?? ''}`}
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No common FAQs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CommonFaqModal
        open={showForm}
        faq={editingFaq}
        onClose={() => {
          setShowForm(false)
          setEditingFaq(null)
        }}
        onSaved={handleSaved}
      />
      <DeleteConfirm
        open={Boolean(deletingFaq)}
        title="Delete common FAQ"
        message={`Delete "${deletingFaq?.question ?? deletingFaq?.Question ?? ''}"?`}
        onClose={() => setDeletingFaq(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
