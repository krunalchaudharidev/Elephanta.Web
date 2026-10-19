import React from 'react'
import { fetchMediaBlob } from '../../services/mediaapi'

export default function RemoteImage({ src, alt = '', className = '' }) {
  const [url, setUrl] = React.useState('')
  const [errored, setErrored] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    let objUrl = ''
    async function load() {
      if (!src) {
        setUrl('')
        return
      }

      const blob = await fetchMediaBlob(src, 'customer')
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

  const showFallback = !src || errored

  return (
    <>
      {showFallback ? (
        <div className={(className || '') + ' flex items-center justify-center text-gray-400 text-sm'}>No Image</div>
      ) : (
        <img
          src={url || ''}
          alt={alt}
          className={className}
          onError={() => setErrored(true)}
        />
      )}
    </>
  )
}
