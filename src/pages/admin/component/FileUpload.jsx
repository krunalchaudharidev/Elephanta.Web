import React, { useRef, useState } from 'react'
import { uploadMedia } from '../../../services/mediaapi'
import { fetchMediaBlob } from '../../../services/mediaapi'

export default function FileUpload({
  onUploadComplete = null,
  onChange = null,
  multiple = false,
  accept = '*/*',
  buttonText = 'Choose files',
  moduleType = 'product',
  isCompress = false,
  fieldName = 'File',
  previewUrl = '',
}) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [previewLocal, setPreviewLocal] = useState('')
  const [remotePreview, setRemotePreview] = useState('')
  const [previewModalSrc, setPreviewModalSrc] = useState('')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const tempPreviewRef = React.useRef('')

  React.useEffect(() => {
    // create object URL for single-file preview and cleanup previous
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setPreviewLocal(url)
      return () => { URL.revokeObjectURL(url); setPreviewLocal('') }
    }
    setPreviewLocal('')
    return undefined
  }, [files])

  React.useEffect(() => {
    // if previewUrl points to protected API (starts with /api/Media), fetch with auth and create blob URL
    let cancelled = false
    async function loadRemote() {
      if (!previewUrl) {
        if (remotePreview) { URL.revokeObjectURL(remotePreview); setRemotePreview('') }
        return
      }

        const blob = await fetchMediaBlob(previewUrl)
        if (!blob) {
          if (remotePreview) { URL.revokeObjectURL(remotePreview); setRemotePreview('') }
          // use the original previewUrl (may be absolute public URL)
          setRemotePreview(previewUrl)
          return
        }
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        if (remotePreview) URL.revokeObjectURL(remotePreview)
        setRemotePreview(url)
    }
    loadRemote()
    return () => { cancelled = true; if (remotePreview) { URL.revokeObjectURL(remotePreview); setRemotePreview('') } }
  }, [previewUrl])

  React.useEffect(() => {
    return () => {
      if (tempPreviewRef.current) {
        try { URL.revokeObjectURL(tempPreviewRef.current) } catch {}
        tempPreviewRef.current = ''
      }
    }
  }, [])

  function handleSelect(e) {
    const chosen = Array.from(e.target.files || [])
    setFiles(chosen)
    onChange?.(chosen)
  }

  function handleDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files || [])
    setFiles(dropped)
    onChange?.(dropped)
  }

  async function uploadFiles(list) {
    const first = list && list.length ? list[0] : null
    if (!first) return

    try {
      const res = await uploadMedia({ file: first, moduleType, isCompress, fieldName })
      onUploadComplete?.(res)
    } catch (err) {
      onUploadComplete?.({ error: err?.message || 'upload_error' })
    }
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="p-3 border-2 border-dashed border-gray-300 rounded-md text-center"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          className="px-3 py-2 bg-white border rounded text-sm"
        >
          {buttonText}
        </button>
        <div className="mt-2 text-sm text-gray-600">or drag & drop files here</div>
      </div>

      {!multiple ? (
        (files.length > 0 || previewUrl) && (
          <div className="mt-4">
            <div className="relative inline-block">
              <img
                src={files.length > 0 ? previewLocal : (remotePreview || previewUrl)}
                alt={files.length > 0 ? files[0].name : 'preview'}
                className="max-w-[180px] max-h-[120px] object-cover rounded-md cursor-pointer"
                onClick={() => inputRef.current && inputRef.current.click()}
              />
              <button
                type="button"
                onClick={() => {
                  const src = files.length > 0 ? previewLocal : (remotePreview || previewUrl)
                  if (!src) return
                  setPreviewModalSrc(src)
                  setPreviewModalOpen(true)
                }}
                className="absolute -top-2 -left-2 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs"
                aria-label="Preview image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s4-7.5 9.5-7.5S21.5 12 21.5 12s-4 7.5-9.5 7.5S2.5 12 2.5 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    // remove selected file
                    setFiles([])
                    onChange?.([])
                    if (previewLocal) { URL.revokeObjectURL(previewLocal); setPreviewLocal('') }
                  }}
                  className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  aria-label="Remove file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        files.length > 0 && (
          <ul className="mt-2 list-none p-0">
            {files.map((f, i) => (
              <li key={i} className="flex gap-2 items-center py-1.5">
                {f.type.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-12 h-12 object-cover rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        // create temp url and open modal
                        if (tempPreviewRef.current) {
                          try { URL.revokeObjectURL(tempPreviewRef.current) } catch {}
                          tempPreviewRef.current = ''
                        }
                        const url = URL.createObjectURL(f)
                        tempPreviewRef.current = url
                        setPreviewModalSrc(url)
                        setPreviewModalOpen(true)
                      }}
                      className="absolute -top-1 -right-1 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                      aria-label="Preview image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s4-7.5 9.5-7.5S21.5 12 21.5 12s-4 7.5-9.5 7.5S2.5 12 2.5 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 grid place-items-center bg-gray-100 rounded-sm">{f.name.split('.').pop()}</div>
                )}
                <div className="flex-1">
                  <div className="text-sm">{f.name}</div>
                  <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Upload is handled externally (e.g. on Save) via selected file and `uploadMedia`. */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => {
            setPreviewModalOpen(false)
            if (tempPreviewRef.current) { try { URL.revokeObjectURL(tempPreviewRef.current) } catch {} tempPreviewRef.current = '' }
          }} />
          <div className="relative z-10 max-w-[90vw] max-h-[90vh] p-4">
            <button onClick={() => {
              setPreviewModalOpen(false)
              if (tempPreviewRef.current) { try { URL.revokeObjectURL(tempPreviewRef.current) } catch {} tempPreviewRef.current = '' }
            }} className="absolute right-2 top-2 z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
            <img src={previewModalSrc} alt="preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
