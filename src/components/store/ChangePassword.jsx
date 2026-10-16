import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import ProfileField, { inputClass } from './ProfileField'

export default function ChangePassword() {
  const { onPasswordSave: onSave, loading } = useOutletContext()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [visible, setVisible] = useState({})
  const [error, setError] = useState('')

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  function submit(event) {
    event.preventDefault()
    if (form.newPassword.length < 8) {
      setError('New password must contain at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    onSave({ oldPassword: form.currentPassword, newPassword: form.newPassword }, () => {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    })
  }

  function passwordField(name, label, placeholder) {
    const visibleField = Boolean(visible[name])
    const id = `password-${name}`
    return (
      <ProfileField key={name} label={label} htmlFor={id} required>
        <div className="relative">
          <input id={id} className={`${inputClass} pr-12`} name={name} type={visibleField ? 'text' : 'password'} value={form[name]} onChange={update} placeholder={placeholder} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} minLength={name === 'currentPassword' ? undefined : 8} required />
          <button type="button" onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))} aria-label={visibleField ? 'Hide password' : 'Show password'} title={visibleField ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#7B8982] hover:text-[#A77B4C]">
            {visibleField ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </ProfileField>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Change Password</h2>
        <p className="mt-1 text-sm text-[#7A857E]">Choose a strong password to keep your account secure.</p>
      </div>
      <div className="max-w-xl space-y-5">
        {passwordField('currentPassword', 'Current Password', 'Enter current password')}
        {passwordField('newPassword', 'New Password', 'At least 8 characters')}
        {passwordField('confirmPassword', 'Confirm New Password', 'Re-enter new password')}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex items-start gap-3 rounded-md border border-[#E9E1D7] bg-[#FCFAF7] p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A77B4C]" />
        <div>
          <p className="text-sm font-medium">Password security</p>
          <p className="mt-1 text-xs leading-5 text-[#7A857E]">Use at least 8 characters. A mix of uppercase letters, lowercase letters, numbers, and symbols is recommended.</p>
        </div>
      </div>
      <div className="border-t border-[#EEE8DF] pt-5">
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-3 rounded-md bg-[#102923] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#24483B] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Updating...' : 'Update Password'}<ArrowRight size={17} />
        </button>
      </div>
    </form>
  )
}