import React from 'react'
import { fetchMediaBlob } from '../../../services/mediaapi'

export default function RemoteImage({ src, alt = '', className = '' }) {
  const [url, setUrl] = React.useState('')
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    let objUrl = ''
    async function load() {
      if (!src) {
        setUrl('')
        return
      }

      const blob = await fetchMediaBlob(src)
      if (!blob) {
        // non-protected or fetch failed — use direct URL
        setUrl(src)
        return
      }
      if (cancelled) return
      objUrl = URL.createObjectURL(blob)
      setUrl(objUrl)
    }
    load()
    return () => {
      cancelled = true
      if (objUrl) URL.revokeObjectURL(objUrl)
      setUrl('')
    }
  }, [src])

  if (!src) return null

  return (
    <>
      <img
        src={url || ''}
        alt={alt}
        className={className + ' cursor-pointer'}
        onClick={() => { if (url) setOpen(true) }}
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-10 max-w-[90vw] max-h-[90vh] p-4">
            <button onClick={() => setOpen(false)} className="absolute right-2 top-2 z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
            <img src={url || ''} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-lg" />
          </div>
        </div>
      )}
    </>
  )
}
