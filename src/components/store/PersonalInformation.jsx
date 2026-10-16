import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import ProfileField, { inputClass } from './ProfileField'

export default function PersonalInformation() {
  const { profile, setProfile, onProfileSave: onSave, loading } = useOutletContext()

  function update(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Personal Information</h2>
        <p className="mt-1 text-sm text-[#7A857E]">Update your details to keep your account information current.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ProfileField label="First Name" htmlFor="profile-firstName" required>
          <input id="profile-firstName" className={inputClass} name="firstName" value={profile.firstName} onChange={update} placeholder="Enter first name" autoComplete="given-name" maxLength={100} required />
        </ProfileField>
        <ProfileField label="Last Name" htmlFor="profile-lastName" required>
          <input id="profile-lastName" className={inputClass} name="lastName" value={profile.lastName} onChange={update} placeholder="Enter last name" autoComplete="family-name" maxLength={100} required />
        </ProfileField>
        <ProfileField label="Email Address" htmlFor="profile-email" required>
          <input id="profile-email" className={`${inputClass} bg-[#F7F6F3] text-[#7A857E]`} name="email" type="email" value={profile.email} autoComplete="email" maxLength={254} readOnly aria-describedby="profile-email-note" />
          <span id="profile-email-note" className="mt-1.5 block text-[11px] text-[#8A968E]">Contact support to change your email address.</span>
        </ProfileField>
        <ProfileField label="Date of Birth" htmlFor="profile-dateOfBirth">
          <div className="relative">
            <input id="profile-dateOfBirth" className={`${inputClass} pr-10`} type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={update} autoComplete="bday" />
            <CalendarDays size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A968E]" />
          </div>
        </ProfileField>
        <ProfileField label="Phone Number" htmlFor="profile-phoneNumber" required>
          <input id="profile-phoneNumber" className={inputClass} name="phoneNumber" type="tel" value={profile.phoneNumber} onChange={update} placeholder="+91 98765 43210" autoComplete="tel" maxLength={20} required />
        </ProfileField>
        <ProfileField label="Gender" htmlFor="profile-gender">
          <div className="relative">
            <select id="profile-gender" className={`${inputClass} appearance-none pr-10`} name="gender" value={profile.gender} onChange={update}>
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68766E]" />
          </div>
        </ProfileField>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-[#EEE8DF] pt-5 sm:flex-row sm:items-center">
        <p className="text-xs text-[#7A857E]"><span className="text-[#A77B4C]">*</span> Required fields</p>
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-3 rounded-md bg-[#102923] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#24483B] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Changes'}<ArrowRight size={17} />
        </button>
      </div>
    </form>
  )
}