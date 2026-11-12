import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RemoteImage from '../../components/store/RemoteImage'
import { searchOffers } from '../../services/offerapi'
import { formatToIST } from '../../utils/date'

const PAGE_SIZE = 12

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function StoreOffers() {
  const [offers, setOffers] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadOffers() {
      setLoading(true)
      setError('')
      try {
        const response = await searchOffers({
          isActive: true,
          includeExpired: false,
          pageNumber,
          pageSize: PAGE_SIZE,
        })
        if (cancelled) return
        setOffers(response?.items ?? response?.Items ?? [])
        setTotalCount(response?.totalCount ?? response?.TotalCount ?? 0)
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.message || 'Unable to load offers right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOffers()
    return () => { cancelled = true }
  }, [pageNumber])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <section className="min-h-[60vh] bg-[#F8F5F1]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#A37E58]">A little something special</p>
          <h1 className="mt-3 font-serif text-4xl text-[#1A1919] sm:text-5xl">Current Offers</h1>
          <p className="mt-4 text-sm leading-6 text-[#756D63]">
            Explore our active offers and find a little extra joy in your next purchase.
          </p>
        </div>

        {loading && (
          <p role="status" className="py-12 text-center text-sm text-[#756D63]">Loading offers...</p>
        )}

        {!loading && error && (
          <p role="alert" className="py-12 text-center text-sm text-red-700">{error}</p>
        )}

        {!loading && !error && offers.length === 0 && (
          <div className="rounded-lg border border-[#E6DED5] bg-white px-6 py-12 text-center">
            <p className="font-serif text-2xl text-[#1A1919]">No offers available right now</p>
            <p className="mt-2 text-sm text-[#756D63]">Please check back soon for new offers.</p>
            <Link to="/store/products" className="mt-6 inline-flex text-sm font-medium text-[#99683B] underline underline-offset-4">
              Explore jewellery
            </Link>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => {
                const id = offer.id ?? offer.Id ?? offer.code ?? offer.Code
                const name = offer.name ?? offer.Name ?? 'Special offer'
                const code = offer.code ?? offer.Code
                const discountType = offer.discountType ?? offer.DiscountType
                const discountValue = offer.discountValue ?? offer.DiscountValue
                const minimumOrderAmount = offer.minimumOrderAmount ?? offer.MinimumOrderAmount
                const maximumDiscountAmount = offer.maximumDiscountAmount ?? offer.MaximumDiscountAmount
                const endDate = offer.endDate ?? offer.EndDate
                const primaryImageId = offer.primaryImageId ?? offer.PrimaryImageId
                const discountLabel = discountType?.toLowerCase() === 'percentage'
                  ? `${discountValue}% off`
                  : discountValue != null
                    ? `${formatCurrency(discountValue)} off`
                    : 'Special savings'

                return (
                  <article key={id} className="flex flex-col overflow-hidden rounded-lg border border-[#E6DED5] bg-white p-6 shadow-sm">
                    {primaryImageId != null && (
                      <div className="-mx-6 -mt-6 mb-5 aspect-[4/3] overflow-hidden bg-[#F0E8DE]">
                        <RemoteImage
                          src={`/api/Media/${encodeURIComponent(primaryImageId)}`}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A37E58]">{discountLabel}</p>
                    <h2 className="mt-3 font-serif text-2xl text-[#1A1919]">{name}</h2>
                    {code && (
                      <div className="mt-5 rounded-md border border-dashed border-[#CDB99F] bg-[#FBF8F4] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#827B72]">Use code</p>
                        <p className="mt-1 break-all font-medium tracking-widest text-[#544F4B]">{code}</p>
                      </div>
                    )}
                    <div className="mt-5 space-y-2 text-sm text-[#756D63]">
                      {minimumOrderAmount != null && (
                        <p>Minimum order: {formatCurrency(minimumOrderAmount)}</p>
                      )}
                      {maximumDiscountAmount != null && (
                        <p>Maximum discount: {formatCurrency(maximumDiscountAmount)}</p>
                      )}
                      {endDate && <p>Valid until: {formatToIST(endDate)}</p>}
                    </div>
                    <Link to="/store/products" className="mt-6 inline-flex text-sm font-medium text-[#99683B] underline underline-offset-4">
                      Shop now
                    </Link>
                  </article>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-5 text-sm text-[#756D63]">
                <button
                  type="button"
                  onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                  disabled={pageNumber === 1}
                  className="rounded border border-[#D9D0C6] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {pageNumber} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
                  disabled={pageNumber === totalPages}
                  className="rounded border border-[#D9D0C6] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
