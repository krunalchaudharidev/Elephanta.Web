import React, { useState, useEffect } from 'react'
import PageHeader from './component/PageHeader'
import ToggleSwitch from './component/ToggleSwitch'
import RichTextEditor from './component/RichTextEditor'
import FileUpload from './component/FileUpload'
import { usePageTitle } from '../../contexts/PageTitleContext'
import { useParams } from 'react-router-dom'
import { Save } from 'lucide-react'
import { getOffer, updateOffer } from '../../services/offerapi'
import { uploadMedia, deleteMedia } from '../../services/mediaapi'
import { showToast, ToastTypes } from './component/Toast'
import { toDateTimeLocalIST, dateTimeLocalISTToUTC } from '../../utils/date'

function FormField({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export default function OfferDetails() {
  const { id: routeId } = useParams()
  const { setTitle } = usePageTitle()

  const [activeTab, setActiveTab] = useState('general')
  const [offer, setOffer] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'Percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
  })

  const [images, setImages] = useState([])
  const [deletedImageIds, setDeletedImageIds] = useState([])
  const [isSavingImages, setIsSavingImages] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)

  // use toDateTimeLocalIST from utils/date

  useEffect(() => {
    setTitle(offer?.name || 'Offer Details')
    return () => setTitle(null)
  }, [offer?.name, setTitle])

  useEffect(() => {
    // placeholder: in future load offer by id
    if (!routeId) return
    let mounted = true
    async function load() {
      try {
        const res = await getOffer(routeId)
        if (!mounted || !res) return
        const mapped = {
          id: res?.id ?? res?.Id,
          name: res?.name ?? res?.Name ?? '',
          code: res?.code ?? res?.Code ?? '',
          description: res?.description ?? res?.Description ?? '',
          discountType: res?.discountType ?? res?.DiscountType ?? 'Percentage',
          discountValue: res?.discountValue ?? res?.DiscountValue ?? null,
          minimumOrderAmount: res?.minimumOrderAmount ?? res?.MinimumOrderAmount ?? null,
          maximumDiscountAmount: res?.maximumDiscountAmount ?? res?.MaximumDiscountAmount ?? null,
          startDate: toDateTimeLocalIST(res?.startDate ?? res?.StartDate ?? null),
          endDate: toDateTimeLocalIST(res?.endDate ?? res?.EndDate ?? null),
          usageLimit: res?.usageLimit ?? res?.UsageLimit ?? null,
          usageCount: res?.usageCount ?? res?.UsageCount ?? 0,
          isActive: Boolean(res?.isActive ?? res?.IsActive ?? true),
        }
        setOffer(mapped)

        const imageIds = res?.imageIds ?? res?.ImageIds ?? []
        const primaryId = res?.primaryImageId ?? res?.PrimaryImageId ?? null
        if (imageIds && imageIds.length) {
          const imgs = imageIds.map((mid, idx) => ({
            id: mid,
            url: `/api/Media/${mid}`,
            isPrimary: primaryId ? String(mid) === String(primaryId) : idx === 0,
          }))
          setImages(imgs)
        }
      } catch (e) {
        showToast(ToastTypes.ERROR, e?.message || 'Failed to load offer')
      }
    }

    load()
    return () => { mounted = false }
  }, [routeId])

  const handleFileChange = (files) => {
    const list = Array.from(files || [])
    const newImgs = list.map((f) => ({ id: Date.now() + Math.random(), url: URL.createObjectURL(f), file: f, isPrimary: false }))
    setImages((prev) => [...prev, ...newImgs])
  }

  const setPrimary = (id) => setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })))
  const removeImage = (id) => {
    setImages((prev) => {
      const found = prev.find((img) => img.id === id)
      if (found && !found.file) {
        try {
          setDeletedImageIds((s) => [...s, found.id])
          deleteMedia(found.id, 'offer').catch((e) => console.error('Failed to delete media', e))
        } catch (e) {
          console.error(e)
        }
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleSaveImages = async () => {
    const id = offer?.id ?? routeId
    if (!id) {
      showToast(ToastTypes.ERROR, 'Offer id is required to update images.')
      return
    }

    setIsSavingImages(true)
    try {
      // upload local files
      const localImages = images.filter((img) => img.file)
      const uploadResults = await Promise.all(
        localImages.map((img) =>
          uploadMedia({ file: img.file, moduleType: 'offer' })
            .then((res) => ({ tempId: img.id, res }))
            .catch((err) => ({ tempId: img.id, err }))
        )
      )

      const tempToId = {}
      uploadResults.forEach((r) => {
        const body = r.res
        if (!body || r.err) return
        const idVal = body?.id ?? body?.Id ?? body?.mediaId ?? body?.MediaId ?? body?.imageId ?? body?.ImageId ?? null
        if (idVal) tempToId[r.tempId] = idVal
      })

      // determine ordered image ids (primary first, then original order)
      const imgsWithIdx = images.map((img, idx) => ({ ...img, idx }))
      imgsWithIdx.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.idx - b.idx)

      const imageIds = imgsWithIdx
        .map((img) => {
          if (img.file) return tempToId[img.id] ?? null
          return img.id
        })
        .filter((x) => x)

      // determine primary image id
      const primaryImg = imgsWithIdx.find((img) => img.isPrimary) ?? imgsWithIdx[0]
      let primaryId = null
      if (primaryImg) {
        if (primaryImg.file) primaryId = tempToId[primaryImg.id] ?? null
        else primaryId = primaryImg.id
      }

      // call updateOffer with imageIds and primaryImageId
      await updateOffer(id, { imageIds, primaryImageId: primaryId })

      // refresh images state to remote urls
      setImages(
        imageIds.map((mid, idx) => ({
          id: mid,
          url: `/api/Media/${mid}`,
          isPrimary: primaryId ? String(mid) === String(primaryId) : idx === 0,
        }))
      )
      setDeletedImageIds([])
    } catch (e) {
      // updateOffer and uploadMedia show toasts
      console.error(e)
    } finally {
      setIsSavingImages(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="w-full">
        <PageHeader
          title={offer?.name || 'Offer Details'}
          breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Offers', to: '/admin/offers' }, { label: offer?.name || 'Offer Details' }]}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">View and edit offer details and images.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('general')} className={`text-left px-3 py-2 rounded ${activeTab === 'general' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}>General</button>
            <button onClick={() => setActiveTab('images')} className={`text-left px-3 py-2 rounded ${activeTab === 'images' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}>Images</button>
          </nav>
        </aside>

        <main>
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Name" required className="md:col-span-2">
                  <input value={offer.name} onChange={(e) => setOffer((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <FormField label="Code" required>
                  <input value={offer.code} onChange={(e) => setOffer((p) => ({ ...p, code: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <FormField label="Description" className="md:col-span-2">
                  <RichTextEditor value={offer.description} onChange={(v) => setOffer((p) => ({ ...p, description: v }))} minHeight={120} />
                </FormField>

                <FormField label="Discount Type">
                  <select value={offer.discountType} onChange={(e) => setOffer((p) => ({ ...p, discountType: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <input type="number" step="0.01" value={offer.discountValue} onChange={(e) => setOffer((p) => ({ ...p, discountValue: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <FormField label="Start Date">
                  <input type="datetime-local" value={offer.startDate} onChange={(e) => setOffer((p) => ({ ...p, startDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <FormField label="End Date">
                  <input type="datetime-local" value={offer.endDate} onChange={(e) => setOffer((p) => ({ ...p, endDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <FormField label="Usage Limit">
                  <input type="number" value={offer.usageLimit} onChange={(e) => setOffer((p) => ({ ...p, usageLimit: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </FormField>

                <div className="md:col-span-2 flex items-center gap-4">
                  <ToggleSwitch checked={offer.isActive} onChange={(v) => setOffer((p) => ({ ...p, isActive: v }))} />
                  <span className="text-sm">Active</span>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <button onClick={async () => {
                    if (savingGeneral) return
                    try {
                      setSavingGeneral(true)
                      const payload = {
                        name: offer.name,
                        code: offer.code,
                        description: offer.description,
                        discountType: offer.discountType,
                        discountValue: offer.discountValue !== '' && offer.discountValue !== null ? Number(offer.discountValue) : null,
                        minimumOrderAmount: offer.minimumOrderAmount !== '' && offer.minimumOrderAmount !== null ? Number(offer.minimumOrderAmount) : null,
                        maximumDiscountAmount: offer.maximumDiscountAmount !== '' && offer.maximumDiscountAmount !== null ? Number(offer.maximumDiscountAmount) : null,
                        startDate: offer.startDate ? dateTimeLocalISTToUTC(offer.startDate) : null,
                        endDate: offer.endDate ? dateTimeLocalISTToUTC(offer.endDate) : null,
                        usageLimit: offer.usageLimit !== '' && offer.usageLimit !== null ? Number(offer.usageLimit) : null,
                        isActive: Boolean(offer.isActive),
                      }
                      await updateOffer(offer.id ?? routeId, payload)
                      // refresh offer details after save
                      const refreshed = await getOffer(offer.id ?? routeId)
                      if (refreshed) {
                        const mapped = {
                          id: refreshed?.id ?? refreshed?.Id,
                          name: refreshed?.name ?? refreshed?.Name ?? '',
                          code: refreshed?.code ?? refreshed?.Code ?? '',
                          description: refreshed?.description ?? refreshed?.Description ?? '',
                          discountType: refreshed?.discountType ?? refreshed?.DiscountType ?? 'Percentage',
                          discountValue: refreshed?.discountValue ?? refreshed?.DiscountValue ?? null,
                          minimumOrderAmount: refreshed?.minimumOrderAmount ?? refreshed?.MinimumOrderAmount ?? null,
                          maximumDiscountAmount: refreshed?.maximumDiscountAmount ?? refreshed?.MaximumDiscountAmount ?? null,
                          startDate: toDateTimeLocalIST(refreshed?.startDate ?? refreshed?.StartDate ?? null),
                          endDate: toDateTimeLocalIST(refreshed?.endDate ?? refreshed?.EndDate ?? null),
                          usageLimit: refreshed?.usageLimit ?? refreshed?.UsageLimit ?? null,
                          usageCount: refreshed?.usageCount ?? refreshed?.UsageCount ?? 0,
                          isActive: Boolean(refreshed?.isActive ?? refreshed?.IsActive ?? true),
                        }
                        setOffer(mapped)
                      }
                    } catch (e) {
                      // updateOffer shows toasts; nothing extra needed here
                    } finally {
                      setSavingGeneral(false)
                    }
                  }} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" disabled={savingGeneral}>
                    <Save className="h-4 w-4" />
                    <span>{savingGeneral ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div>
                <div className="mb-4">
                  <FileUpload accept="image/*" moduleType="offer" multiple={true} items={images} onChange={(files) => handleFileChange(files)} onRemove={(id) => removeImage(id)} onSetPrimary={(id) => setPrimary(id)} />
                </div>

                <div className="mt-4 flex justify-end">
                  <button onClick={handleSaveImages} disabled={isSavingImages} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    <span>{isSavingImages ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
