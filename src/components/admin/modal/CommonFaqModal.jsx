import { useEffect, useState } from 'react'
import { createCommonFaq, updateCommonFaq } from '../../../services/commonfaqsapi'
import { showToast, ToastTypes } from '../shared/Toast'

const inputClassName = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export default function CommonFaqModal({ open, faq, onClose, onSaved }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [displayOrder, setDisplayOrder] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(faq)

  useEffect(() => {
    if (!open) return
    setQuestion(faq?.question ?? faq?.Question ?? '')
    setAnswer(faq?.answer ?? faq?.Answer ?? '')
    setIsActive(Boolean(faq?.isActive ?? faq?.IsActive ?? true))
    setDisplayOrder(String(faq?.displayOrder ?? faq?.DisplayOrder ?? 0))
    setSubmitting(false)
    setError('')
  }, [open, faq])

  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedQuestion = question.trim()
    const trimmedAnswer = answer.trim()
    const order = Number(displayOrder)
    if (!trimmedQuestion || !trimmedAnswer) {
      setError('Question and answer are required.')
      return
    }
    if (!Number.isInteger(order) || order < 0) {
      setError('Display order must be a whole number of 0 or greater.')
      return
    }

    const payload = {
      question: trimmedQuestion,
      answer: trimmedAnswer,
      isActive,
      displayOrder: order,
    }

    setSubmitting(true)
    try {
      let response
      if (isEditing) {
        const id = faq.id ?? faq.Id
        if (id === undefined || id === null || id === '') {
          throw new Error('Common FAQ id is missing.')
        }
        response = await updateCommonFaq(id, payload)
      } else {
        response = await createCommonFaq(payload)
      }

      const success = response?.isSuccess ?? response?.IsSuccess
      if (success === false) {
        throw new Error(
          response?.message ?? response?.Message ?? 'Unable to save common FAQ.'
        )
      }

      showToast(
        ToastTypes.SUCCESS,
        response?.message ??
          response?.Message ??
          (isEditing ? 'Common FAQ updated successfully.' : 'Common FAQ created successfully.')
      )
      onClose()
      onSaved()
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save common FAQ.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Common FAQ' : 'Add Common FAQ'}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && <div role="alert" className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="common-faq-question" className="block text-sm font-medium text-slate-700">
              Question
            </label>
            <input
              id="common-faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label htmlFor="common-faq-answer" className="block text-sm font-medium text-slate-700">
              Answer
            </label>
            <textarea
              id="common-faq-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className={`${inputClassName} min-h-32 resize-y`}
              rows={5}
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              Active
            </label>
            <label htmlFor="common-faq-display-order" className="flex items-center gap-2 text-sm text-slate-700">
              Display order
              <input
                id="common-faq-display-order"
                type="number"
                min="0"
                step="1"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
                className="w-24 rounded-md border border-slate-200 px-2 py-1.5"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Add FAQ'}
          </button>
        </div>
      </form>
    </div>
  )
}
