import { useEffect, useState } from 'react'
import { Check, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import ProfileField, { inputClass } from './ProfileField'
import { getCountries, getStates } from '../../services/locationapi'

const emptyAddress = {
  id: null,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
}

export default function Addresses() {
  const { addresses, loadingAddresses, onAddressSave: onSave, onAddressDelete: onDelete, loading } = useOutletContext()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyAddress)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [addressToDelete, setAddressToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadLocations() {
      try {
        const [countryResponse, stateResponse] = await Promise.all([
          getCountries(),
          getStates(),
        ])
        if (!Array.isArray(countryResponse) || !Array.isArray(stateResponse)) {
          throw new Error('Unexpected location data response.')
        }
        if (!cancelled) {
          setCountries(countryResponse)
          setStates(stateResponse)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load address locations.', loadError)
          setLocationError(loadError.message || 'Unable to load countries and states.')
        }
      } finally {
        if (!cancelled) setLocationsLoading(false)
      }
    }

    loadLocations()
    return () => {
      cancelled = true
    }
  }, [])

  function startNew() {
    setForm({ ...emptyAddress })
    setEditing('new')
    setError('')
    setErrors({})
  }

  function startEdit(address) {
    setForm({ ...address })
    setEditing(address.id)
    setError('')
    setErrors({})
  }

  function update(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'country' && value !== current.country ? { state: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const nextErrors = {}
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'This field is required.'
    if (!form.city.trim()) nextErrors.city = 'This field is required.'
    if (!form.state.trim()) nextErrors.state = 'This field is required.'
    if (!form.postalCode.trim()) nextErrors.postalCode = 'This field is required.'
    if (!form.country.trim()) nextErrors.country = 'This field is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await onSave(form)
      setEditing(null)
    } catch (saveError) {
      setError(saveError.message || 'Unable to save address.')
    }
  }

  async function confirmDeleteAddress() {
    if (!addressToDelete || loading) return
    setDeleteError('')
    try {
      await onDelete(addressToDelete.id)
      setAddressToDelete(null)
    } catch (deleteError) {
      setDeleteError(deleteError.message || 'Unable to delete this address.')
    }
  }

  if (editing !== null) {
    return (
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">{editing === 'new' ? 'Add New Address' : 'Edit Address'}</h2>
            <p className="mt-1 text-sm text-[#7A857E]">Enter the details for your delivery address.</p>
          </div>
          <button type="button" onClick={() => setEditing(null)} aria-label="Close address form" className="rounded-full border border-[#E9E1D7] p-2 hover:bg-[#FCFAF7]"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><ProfileField label="Address Line 1" htmlFor="address-line1" required><input id="address-line1" className={inputClass} name="addressLine1" value={form.addressLine1} onChange={update} placeholder="House number, building, street" required maxLength={250} autoComplete="address-line1" aria-invalid={Boolean(errors.addressLine1)} aria-describedby={errors.addressLine1 ? 'address-line1-error' : undefined} />{errors.addressLine1 && <p id="address-line1-error" role="alert" className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>}</ProfileField></div>
          <div className="sm:col-span-2"><ProfileField label="Address Line 2" htmlFor="address-line2"><input id="address-line2" className={inputClass} name="addressLine2" value={form.addressLine2} onChange={update} placeholder="Landmark, area (optional)" maxLength={250} autoComplete="address-line2" /></ProfileField></div>
          <ProfileField label="City" htmlFor="address-city" required><input id="address-city" className={inputClass} name="city" value={form.city} onChange={update} required maxLength={100} autoComplete="address-level2" aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'address-city-error' : undefined} />{errors.city && <p id="address-city-error" role="alert" className="mt-1 text-xs text-red-600">{errors.city}</p>}</ProfileField>
          <ProfileField label="State" htmlFor="address-state" required>
            <select id="address-state" className={inputClass} name="state" value={form.state} onChange={update} required disabled={locationsLoading || states.length === 0} autoComplete="address-level1" aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? 'address-state-error' : undefined}>
              <option value="" disabled>Select a state</option>
              {form.state && !states.includes(form.state) && (
                <option value={form.state}>{form.state}</option>
              )}
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            {errors.state && <p id="address-state-error" role="alert" className="mt-1 text-xs text-red-600">{errors.state}</p>}
          </ProfileField>
          <ProfileField label="Postal Code" htmlFor="address-postalCode" required><input id="address-postalCode" className={inputClass} name="postalCode" value={form.postalCode} onChange={update} required maxLength={15} autoComplete="postal-code" aria-invalid={Boolean(errors.postalCode)} aria-describedby={errors.postalCode ? 'address-postalCode-error' : undefined} />{errors.postalCode && <p id="address-postalCode-error" role="alert" className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}</ProfileField>
          <ProfileField label="Country" htmlFor="address-country" required>
            <select id="address-country" className={inputClass} name="country" value={form.country} onChange={update} required disabled={locationsLoading || countries.length === 0} autoComplete="country-name" aria-invalid={Boolean(errors.country)} aria-describedby={errors.country ? 'address-country-error' : undefined}>
              <option value="" disabled>Select a country</option>
              {form.country && !countries.includes(form.country) && (
                <option value={form.country}>{form.country}</option>
              )}
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
            {errors.country && <p id="address-country-error" role="alert" className="mt-1 text-xs text-red-600">{errors.country}</p>}
          </ProfileField>
          <label className="flex cursor-pointer items-center gap-2.5 pt-5 text-sm text-[#526058]">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} className="h-4 w-4 accent-[#A77B4C]" />Set as default address
          </label>
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}
        {locationsLoading && <p role="status" className="text-xs text-[#7A857E]">Loading countries and states...</p>}
        <p className="text-xs text-[#7A857E]">Your address is securely saved to your account.</p>
        <div className="flex flex-wrap gap-3 border-t border-[#EEE8DF] pt-5">
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-md bg-[#102923] px-6 py-3 text-sm font-medium text-white hover:bg-[#24483B] disabled:opacity-60"><Check size={17} />{loading ? 'Saving...' : 'Save Address'}</button>
          <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-[#DEDCD6] px-6 py-3 text-sm hover:bg-[#FCFAF7]">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl">My Addresses</h2>
          <p className="mt-1 text-sm text-[#7A857E]">Manage your shipping and delivery addresses.</p>
        </div>
        <button type="button" onClick={startNew} className="flex items-center justify-center gap-2 rounded-md bg-[#102923] px-5 py-3 text-sm font-medium text-white hover:bg-[#24483B]"><Plus size={17} />Add New Address</button>
      </div>

      {loadingAddresses ? (
        <p role="status" className="mt-7 py-8 text-center text-sm text-[#7A857E]">
          Loading your addresses...
        </p>
      ) : addresses.length === 0 ? (
        <div className="mt-7 rounded-lg border border-dashed border-[#DCCDBB] px-5 py-12 text-center">
          <MapPin size={30} className="mx-auto text-[#A77B4C]" />
          <h3 className="mt-4 font-serif text-xl">No addresses yet</h3>
          <p className="mt-2 text-sm text-[#7A857E]">Add an address for a faster checkout experience.</p>
          <button type="button" onClick={startNew} className="mt-5 text-sm font-medium text-[#99683B] underline underline-offset-4">Add your first address</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-lg border border-[#E5D9C8] p-5 transition hover:border-[#C6A47B]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2"><MapPin size={18} className="text-[#A77B4C]" /><h3 className="font-medium">Delivery Address</h3></div>
                <div className="flex flex-wrap gap-2">
                  {address.isDefault && <span className="rounded-full bg-[#EAF1EB] px-2.5 py-1 text-[10px] font-medium text-[#28553F]">Default</span>}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#68736C]">{address.addressLine1}{address.addressLine2 && <><br />{address.addressLine2}</>}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</p>
              <div className="mt-5 flex gap-4 border-t border-[#EEE8DF] pt-4">
                <button type="button" onClick={() => startEdit(address)} className="text-xs font-medium text-[#99683B] hover:text-[#183129]">Edit Address</button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setDeleteError('')
                    setAddressToDelete(address)
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#9B5147] hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={14} />Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-xs text-[#7A857E]">Your addresses are securely saved to your account.</p>

      {addressToDelete && (
        <DeleteConfirmationDialog
          title="Delete this address?"
          description="This address will be permanently removed from your account. This action cannot be undone."
          itemDetails={[
            addressToDelete.addressLine1,
            addressToDelete.city,
            addressToDelete.state,
          ].filter(Boolean).join(', ')}
          error={deleteError}
          loading={loading}
          onCancel={() => setAddressToDelete(null)}
          onConfirm={confirmDeleteAddress}
          cancelLabel="Keep Address"
          confirmLabel="Delete Address"
          loadingLabel="Deleting..."
        />
      )}
    </div>
  )
}