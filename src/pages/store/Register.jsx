import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const inputClass = 'h-11 w-full rounded-md border border-[#DEDCD6] bg-white px-3.5 text-sm text-[#183129] outline-none transition placeholder:text-[#A0A49F] focus:border-[#A77B4C] focus:ring-2 focus:ring-[#A77B4C]/10'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#34423B]'

export default function StoreRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions to continue.')
      return
    }

    setError('Account registration is not available yet. Please try again later.')
  }

  return (
    <section className="relative flex min-h-[590px] items-center justify-center overflow-hidden bg-[#FCFAF7] px-4 py-10 text-[#183129] sm:min-h-[650px] sm:px-6 sm:py-14 lg:min-h-[calc(100vh-260px)]">
      <svg aria-hidden="true" className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-[#D8B98F]/40 sm:block" viewBox="0 0 300 300" fill="none">
        <path d="M300 10C235 38 220 92 175 118S106 160 78 222M234 48C244 83 268 94 290 95M202 79C205 110 222 127 247 135M159 122C192 125 208 145 218 171M126 160C155 174 169 197 171 222M81 218C103 229 118 252 119 280" stroke="currentColor" />
        <path d="M235 49C208 28 199 12 202 0C230 7 245 26 235 49ZM204 80C178 60 164 44 169 29C196 37 212 56 204 80ZM160 123C134 105 123 87 130 74C155 83 170 102 160 123ZM127 160C99 147 84 130 89 116C115 125 132 143 127 160ZM82 218C54 205 42 189 48 175C72 184 88 201 82 218Z" stroke="currentColor" />
      </svg>
      <svg aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-12 hidden h-80 w-80 -rotate-12 text-[#D8B98F]/40 sm:block" viewBox="0 0 300 300" fill="none">
        <path d="M10 290C54 250 66 205 102 171S170 117 195 54M45 257C72 268 97 260 117 241M74 219C100 231 124 223 143 205M111 178C137 190 160 181 177 163M149 134C174 147 194 136 208 118M177 93C200 104 219 93 231 76" stroke="currentColor" />
        <path d="M45 257C32 231 36 213 48 204C66 225 66 244 45 257ZM74 219C62 193 68 175 80 168C97 189 96 207 74 219ZM111 178C102 151 110 134 123 129C138 151 135 168 111 178ZM149 134C142 108 150 92 163 87C177 108 173 125 149 134Z" stroke="currentColor" />
      </svg>

      <div className="relative w-full max-w-[540px]">
        <div className="rounded-lg border border-[#DCC7AC] bg-white/80 px-5 py-8 shadow-[0_20px_65px_rgba(48,37,22,0.05)] backdrop-blur-sm sm:px-9 sm:py-9">
          <div className="text-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A77B4C]">Join the inner circle</span>
            <h1 className="mt-2 font-serif text-3xl text-[#183129] sm:text-[34px]">Create Account</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777F7A]">
              Create your account to save your favourites and enjoy a seamless jewellery shopping experience.
            </p>
            <div className="mx-auto mt-5 h-px w-12 bg-[#B89569]" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="register-firstName" className={labelClass}>First Name <span className="text-red-500">*</span></label>
                <input id="register-firstName" name="firstName" type="text" autoComplete="given-name" placeholder="Enter first name" value={form.firstName} onChange={handleChange} required maxLength={100} className={inputClass} />
              </div>
              <div>
                <label htmlFor="register-lastName" className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                <input id="register-lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Enter last name" value={form.lastName} onChange={handleChange} required maxLength={100} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className={labelClass}>Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B948D]" />
                <input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required maxLength={254} className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label htmlFor="register-phoneNumber" className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B948D]" />
                <input id="register-phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" placeholder="Enter phone number" value={form.phoneNumber} onChange={handleChange} required maxLength={20} className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className={labelClass}>Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <LockKeyhole size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B948D]" />
                  <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimum 8 characters" value={form.password} onChange={handleChange} required minLength={8} className={`${inputClass} pl-10 pr-11`} />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7B8982] hover:text-[#A77B4C]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="register-confirmPassword" className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <LockKeyhole size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B948D]" />
                  <input id="register-confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required className={`${inputClass} pl-10 pr-11`} />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7B8982] hover:text-[#A77B4C]">
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-5 text-[#69736C]">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => { setAcceptedTerms(event.target.checked); setError('') }} className="mt-1 h-4 w-4 shrink-0 accent-[#A77B4C]" />
              <span>I agree to the <Link to="/terms" className="font-medium text-[#99683B] underline underline-offset-2">Terms &amp; Conditions</Link> and <Link to="/privacy-policy" className="font-medium text-[#99683B] underline underline-offset-2">Privacy Policy</Link>.</span>
            </label>

            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{error}</p>}

            <button type="submit" className="group flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#102923] px-5 text-sm font-medium text-white transition duration-300 hover:bg-[#24483B]">
              Create Account <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E7E3DC]" />
            <span className="text-[10px] uppercase tracking-wider text-[#8D9790]">Or</span>
            <div className="h-px flex-1 bg-[#E7E3DC]" />
          </div>

          <p className="text-center text-xs text-[#68736C]">Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#99683B] underline decoration-[#C7A47B] underline-offset-4 transition hover:text-[#183129]">Sign In</Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-[#EEE8DF] pt-4 text-center text-[10px] leading-5 text-[#849087]">
            <ShieldCheck size={16} className="shrink-0 text-[#A77B4C]" />
            <span>Your personal information is kept secure.</span>
          </div>
        </div>
      </div>
    </section>
  )
}