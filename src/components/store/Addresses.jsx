import { useState } from 'react'
import { Check, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import ProfileField, { inputClass } from './ProfileField'

const emptyAddress = {
  id: null,
  fullName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  type: 'Home',
  isDefault: false,
}

export default function Addresses() {
  const { addresses, onAddressSave: onSave, onAddressDelete: onDelete, loading } = useOutletContext()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyAddress)
  const [error, setError] = useState('')

  function startNew() {
    setForm({ ...emptyAddress })
    setEditing('new')
    setError('')
  }

  function startEdit(address) {
    setForm({ ...address })
    setEditing(address.id)
    setError('')
  }

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await onSave(form)
      setEditing(null)
    } catch (saveError) {
      setError(saveError.message || 'Unable to save address.')
    }
  }

  if (editing !== null) {
    return (
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">{editing === 'new' ? 'Add New Address' : 'Edit Address'}</h2>
            <p className="mt-1 text-sm text-[#7A857E]">Enter the details for your delivery address.</p>
          </div>
          <button type="button" onClick={() => setEditing(null)} aria-label="Close address form" className="rounded-full border border-[#E9E1D7] p-2 hover:bg-[#FCFAF7]"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField label="Full Name" htmlFor="address-fullName" required><input id="address-fullName" className={inputClass} name="fullName" value={form.fullName} onChange={update} required maxLength={150} autoComplete="name" /></ProfileField>
          <ProfileField label="Phone Number" htmlFor="address-phoneNumber" required><input id="address-phoneNumber" className={inputClass} name="phoneNumber" type="tel" value={form.phoneNumber} onChange={update} required maxLength={20} autoComplete="tel" /></ProfileField>
          <div className="sm:col-span-2"><ProfileField label="Address Line 1" htmlFor="address-line1" required><input id="address-line1" className={inputClass} name="addressLine1" value={form.addressLine1} onChange={update} placeholder="House number, building, street" required maxLength={250} autoComplete="address-line1" /></ProfileField></div>
          <div className="sm:col-span-2"><ProfileField label="Address Line 2" htmlFor="address-line2"><input id="address-line2" className={inputClass} name="addressLine2" value={form.addressLine2} onChange={update} placeholder="Landmark, area (optional)" maxLength={250} autoComplete="address-line2" /></ProfileField></div>
          <ProfileField label="City" htmlFor="address-city" required><input id="address-city" className={inputClass} name="city" value={form.city} onChange={update} required maxLength={100} autoComplete="address-level2" /></ProfileField>
          <ProfileField label="State" htmlFor="address-state" required><input id="address-state" className={inputClass} name="state" value={form.state} onChange={update} required maxLength={100} autoComplete="address-level1" /></ProfileField>
          <ProfileField label="Postal Code" htmlFor="address-postalCode" required><input id="address-postalCode" className={inputClass} name="postalCode" value={form.postalCode} onChange={update} required maxLength={15} autoComplete="postal-code" /></ProfileField>
          <ProfileField label="Country" htmlFor="address-country" required><input id="address-country" className={inputClass} name="country" value={form.country} onChange={update} required maxLength={100} autoComplete="country-name" /></ProfileField>
          <ProfileField label="Address Type" htmlFor="address-type" required>
            <select id="address-type" className={inputClass} name="type" value={form.type} onChange={update} required><option value="Home">Home</option><option value="Work">Work</option><option value="Other">Other</option></select>
          </ProfileField>
          <label className="flex cursor-pointer items-center gap-2.5 pt-5 text-sm text-[#526058]">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} className="h-4 w-4 accent-[#A77B4C]" />Set as default address
          </label>
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <p className="text-xs text-[#7A857E]">Addresses are currently saved in this browser only.</p>
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

      {addresses.length === 0 ? (
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
                <div className="flex items-center gap-2"><MapPin size={18} className="text-[#A77B4C]" /><h3 className="font-medium">{address.fullName}</h3></div>
                <div className="flex flex-wrap gap-2">
                  {address.isDefault && <span className="rounded-full bg-[#EAF1EB] px-2.5 py-1 text-[10px] font-medium text-[#28553F]">Default</span>}
                  <span className="rounded-full bg-[#F5EFE6] px-2.5 py-1 text-[10px] text-[#8D663D]">{address.type}</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#68736C]">{address.addressLine1}{address.addressLine2 && <><br />{address.addressLine2}</>}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</p>
              <p className="mt-3 text-xs text-[#68736C]">Phone: {address.phoneNumber}</p>
              <div className="mt-5 flex gap-4 border-t border-[#EEE8DF] pt-4">
                <button type="button" onClick={() => startEdit(address)} className="text-xs font-medium text-[#99683B] hover:text-[#183129]">Edit Address</button>
                <button type="button" onClick={() => onDelete(address.id)} className="flex items-center gap-1.5 text-xs text-[#9B5147] hover:text-red-700"><Trash2 size={14} />Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-xs text-[#7A857E]">Addresses are currently saved in this browser only.</p>
    </div>
  )
}