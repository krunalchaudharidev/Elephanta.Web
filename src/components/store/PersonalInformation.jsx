import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import ProfileField, { inputClass } from './ProfileField'

function parseDateValue(value) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PersonalInformation() {
  const { profile, setProfile, onProfileSave: onSave, loading } = useOutletContext()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const selectedDate = parseDateValue(profile.dateOfBirth)
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  function update(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!profile.firstName.trim()) {
      nextErrors.firstName = 'This field is required.'
    }
    if (!profile.lastName.trim()) {
      nextErrors.lastName = 'This field is required.'
    }
    if (!profile.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'This field is required.'
    } else if (!/^\+?[0-9\- ]{7,20}$/.test(profile.phoneNumber.trim())) {
      nextErrors.phoneNumber = 'Enter a valid phone number.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSave(event)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Personal Information</h2>
        <p className="mt-1 text-sm text-[#7A857E]">Update your details to keep your account information current.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ProfileField label="First Name" htmlFor="profile-firstName" required>
          <input id="profile-firstName" className={inputClass} name="firstName" value={profile.firstName} onChange={update} placeholder="Enter first name" autoComplete="given-name" maxLength={100} required aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'profile-firstName-error' : undefined} />
          {errors.firstName && <p id="profile-firstName-error" role="alert" className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </ProfileField>
        <ProfileField label="Last Name" htmlFor="profile-lastName" required>
          <input id="profile-lastName" className={inputClass} name="lastName" value={profile.lastName} onChange={update} placeholder="Enter last name" autoComplete="family-name" maxLength={100} required aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'profile-lastName-error' : undefined} />
          {errors.lastName && <p id="profile-lastName-error" role="alert" className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </ProfileField>
        <ProfileField label="Email Address" htmlFor="profile-email" required>
          <input id="profile-email" className={`${inputClass} bg-[#F7F6F3] text-[#7A857E]`} name="email" type="email" value={profile.email} autoComplete="email" maxLength={254} readOnly aria-describedby="profile-email-note" />
          <span id="profile-email-note" className="mt-1.5 block text-[11px] text-[#8A968E]">Contact support to change your email address.</span>
        </ProfileField>
        <ProfileField label="Date of Birth" htmlFor="profile-dateOfBirth">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger
              id="profile-dateOfBirth"
              type="button"
              aria-label="Choose date of birth"
              className={`${inputClass} flex items-center justify-between gap-3 text-left`}
            >
              <span className={selectedDate ? '' : 'text-[#8A968E]'}>
                {formattedDate || 'Select date'}
              </span>
              <CalendarDays size={16} className="shrink-0 text-[#8A968E]" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={(date) => {
                  setProfile((current) => ({
                    ...current,
                    dateOfBirth: date ? formatDateValue(date) : '',
                  }))
                  setDatePickerOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </ProfileField>
        <ProfileField label="Phone Number" htmlFor="profile-phoneNumber" required>
          <input id="profile-phoneNumber" className={inputClass} name="phoneNumber" type="tel" value={profile.phoneNumber} onChange={update} placeholder="+91 98765 43210" autoComplete="tel" maxLength={20} required aria-invalid={Boolean(errors.phoneNumber)} aria-describedby={errors.phoneNumber ? 'profile-phoneNumber-error' : undefined} />
          {errors.phoneNumber && <p id="profile-phoneNumber-error" role="alert" className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
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