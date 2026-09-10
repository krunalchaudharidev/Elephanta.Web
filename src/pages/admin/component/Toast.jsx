import { useEffect, useState } from 'react'

const TOAST_DURATION = 5000
const bus = new EventTarget()

export function showToast(type = 'info', message = '') {
  bus.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }))
}

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

function Icon({ type }) {
  if (type === 'success') return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700">🟢</span>
  )
  if (type === 'error') return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-700">🔴</span>
  )
  if (type === 'warning') return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-700">🟡</span>
  )
  return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700">🔵</span>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function onToast(e) {
      const id = Date.now() + Math.random()
      const t = { id, type: e.detail.type || 'info', message: e.detail.message || '' }
      setToasts((s) => [t, ...s])
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id))
      }, TOAST_DURATION)
    }
    bus.addEventListener('toast', onToast)
    return () => bus.removeEventListener('toast', onToast)
  }, [])

  function dismiss(id) {
    setToasts((s) => s.filter((x) => x.id !== id))
  }

  if (!toasts.length) return null

  return (
    <div aria-live="polite" className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg shadow-md border ${t.type === 'success' ? 'bg-white border-green-100' : t.type === 'error' ? 'bg-white border-red-100' : t.type === 'warning' ? 'bg-white border-yellow-100' : 'bg-white border-blue-100'}`}>
          <div className="shrink-0"><Icon type={t.type} /></div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${t.type === 'success' ? 'text-green-800' : t.type === 'error' ? 'text-red-800' : t.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}> 
              {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : t.type === 'warning' ? 'Warning' : 'Info'}
            </div>
            <div className="text-sm text-gray-700 mt-1">{t.message}</div>
          </div>
          <div className="flex items-start">
            <button onClick={() => dismiss(t.id)} className="ml-3 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
