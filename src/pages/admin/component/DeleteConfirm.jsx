export default function DeleteConfirm({ open, title = 'Confirm delete', message = 'Are you sure you want to delete this item?', onClose, onConfirm, loading = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">{loading ? 'Deleting...' : 'Yes'}</button>
        </div>
      </div>
    </div>
  )
}
