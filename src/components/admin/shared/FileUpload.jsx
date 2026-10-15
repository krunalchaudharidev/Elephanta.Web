import React, { useRef, useState } from 'react'
import { uploadMedia, fetchMediaBlob, deleteMedia } from '../../../services/mediaapi'
import DeleteConfirm from './DeleteConfirm'
import { showToast, ToastTypes } from './Toast'
import RemoteImage from './RemoteImage'

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
  // optional controlled preview items (array of files or {id,url,isPrimary})
  items = null,
  // callbacks for preview actions
  onRemove = null,
  onSetPrimary = null,
}) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [previewLocal, setPreviewLocal] = useState('')
  const [remotePreview, setRemotePreview] = useState('')
  const [previewModalSrc, setPreviewModalSrc] = useState('')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const tempPreviewRef = React.useRef('')
  const [fileUrls, setFileUrls] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      if (fileUrls && fileUrls.length) {
        try { fileUrls.forEach((u) => u && URL.revokeObjectURL(u)) } catch {}
      }
    }
  }, [])

  // create object URLs for File objects in `files` for stable previews
  React.useEffect(() => {
    // cleanup previous
    if (fileUrls && fileUrls.length) {
      try { fileUrls.forEach((u) => u && URL.revokeObjectURL(u)) } catch {}
    }
    if (!files || files.length === 0) {
      setFileUrls([])
      return undefined
    }
    const urls = files.map((f) => (f instanceof File ? URL.createObjectURL(f) : null))
    setFileUrls(urls)
    return () => {
      try { urls.forEach((u) => u && URL.revokeObjectURL(u)) } catch {}
    }
  }, [files])

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
        onClick={() => inputRef.current && inputRef.current.click()}
        className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleSelect}
          className="hidden"
        />

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
            <path d="M21 16v-1a4 4 0 00-4-4h-1.26A6 6 0 106 15" />
            <path d="M12 12v9" />
            <path d="M9 15l3-3 3 3" />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-700">Drag & drop images here</p>
        <p className="mt-1 text-xs text-slate-500">or click to browse</p>
        <p className="mt-3 text-xs text-slate-400">JPG, PNG, JPEG · Maximum 5MB per image</p>
      </div>

      {/* unified preview grid: prefer controlled `items`, otherwise use internal `files` */}
      {(() => {
        const arr = (items && items.length) ? items : files
        if (!arr || !arr.length) return null
        return (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {arr.map((image, idx) => {
              const isRemote = typeof image === 'string' || (image && typeof image === 'object' && (image.url || image.id))
              const url = (typeof image === 'string') ? image : (image && image.url ? image.url : (image && image.previewUrl ? image.previewUrl : null))
              const id = image && (image.id || image.Id) ? (image.id || image.Id) : idx
              const isPrimary = image && image.isPrimary
              return (
                <div key={id} className="group relative">
                  <div className={`aspect-square overflow-hidden rounded-xl bg-slate-100 ${isPrimary ? "border-2 border-blue-500" : "border border-slate-200"}`}>
                    {url ? (
                      <RemoteImage src={url} alt={image && image.name ? image.name : 'image'} className="object-cover h-full w-full" onClick={() => {
                        setPreviewModalSrc(url)
                        setPreviewModalOpen(true)
                      }} />
                      ) : (
                      // fallback: if image is a File object, use generated object URL (from fileUrls) for preview
                      (image && image instanceof File) ? (
                        (() => {
                          const fileIndex = files.indexOf(image)
                          const fileUrl = (fileIndex >= 0 && fileUrls && fileUrls[fileIndex]) ? fileUrls[fileIndex] : null
                          if (fileUrl) {
                            return (
                              <img src={fileUrl} alt={image.name || 'image'} className="object-cover h-full w-full cursor-pointer" onClick={() => {
                                setPreviewModalSrc(fileUrl)
                                setPreviewModalOpen(true)
                              }} />
                            )
                          }
                          return (
                            <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">Preview</div>
                          )
                        })()
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">No image</div>
                      )
                    )}
                  </div>

                  {isPrimary && (
                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Primary</span>
                  )}

                  {!isPrimary && onSetPrimary && (
                    <button onClick={() => onSetPrimary(id)} className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-xs font-medium opacity-0 shadow transition group-hover:opacity-100">Set Primary</button>
                  )}

                  <button onClick={() => {
                    // if displayed item is a local File, remove it from internal files state
                    try {
                      if (image && image instanceof File) {
                        setFiles((prev) => {
                          const next = prev.filter((f) => f !== image)
                          onChange?.(next)
                          return next
                        })
                      }
                    } catch {}
                    // always notify parent
                    try { if (onRemove) onRemove(id) } catch {}
                  }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 opacity-0 shadow transition hover:text-red-700 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 18L18 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              )
            })}
          </div>
        )
      })()}

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
      <DeleteConfirm
        open={showDeleteConfirm}
        title="Delete media"
        message={`This will permanently delete the selected file and its relation. Are you sure you want to continue?`}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null) }}
        onConfirm={async () => {
          if (!deleteTarget?.id) return
          setDeleteLoading(true)
          try {
            await deleteMedia(deleteTarget.id, moduleType)
            // remove matching remote item from files if present
            const newFiles = files.filter((f) => {
              if (!f) return true
              const fUrl = typeof f === 'string' ? f : (f.url || '')
              const fId = f && typeof f === 'object' && f.id ? String(f.id) : null
              if (fId && String(fId) === String(deleteTarget.id)) return false
              if (fUrl && String(deleteTarget.url) && fUrl === deleteTarget.url) return false
              return true
            })
            setFiles(newFiles)
            onChange?.(newFiles)
              // clear remote preview shown by this component
              if (!newFiles.length) setRemotePreview('')
            onUploadComplete?.({ deletedId: deleteTarget.id })
            showToast(ToastTypes.SUCCESS, 'Media deleted')
          } catch (e) {
            showToast(ToastTypes.ERROR, e?.message || String(e))
          } finally {
            setDeleteLoading(false)
            setShowDeleteConfirm(false)
            setDeleteTarget(null)
          }
        }}
        loading={deleteLoading}
      />
    </div>
  )
}
