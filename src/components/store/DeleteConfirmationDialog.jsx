import { useEffect, useId } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteConfirmationDialog({
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  itemDetails,
  error,
  loading = false,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting...',
}) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (loading) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, onCancel])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-xl border border-[#E5D9C8] bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBEDEA] text-[#A64F45]">
          <Trash2 size={21} />
        </div>
        <h2 id={titleId} className="mt-5 font-serif text-2xl text-[#183129]">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-[#68736C]">
          {description}
        </p>
        {itemDetails && (
          <p className="mt-4 rounded-md bg-[#FCFAF7] p-3 text-sm leading-6 text-[#526058]">
            {itemDetails}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={loading}
            onClick={onCancel}
            className="rounded-md border border-[#DEDCD6] px-5 py-3 text-sm font-medium text-[#526058] transition hover:bg-[#FCFAF7] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-md bg-[#9B5147] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#803D35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={15} />
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
