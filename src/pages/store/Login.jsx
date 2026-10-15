import { useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../../services/authapi'

export default function StoreLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsLoading(true)

    try {
      const body = await apiLogin(form.email, form.password)
      saveAuth({
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        expiresAt: body.expiresAt,
        user: body.user,
      })
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative flex min-h-[590px] items-center justify-center overflow-hidden bg-[#FCFAF7] px-4 py-12 text-[#183129] sm:min-h-[650px] sm:px-6 sm:py-16 lg:min-h-[calc(100vh-260px)] lg:py-20">
        <svg aria-hidden="true" className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-[#D8B98F]/40 sm:block" viewBox="0 0 300 300" fill="none">
          <path d="M300 10C235 38 220 92 175 118S106 160 78 222M234 48C244 83 268 94 290 95M202 79C205 110 222 127 247 135M159 122C192 125 208 145 218 171M126 160C155 174 169 197 171 222M81 218C103 229 118 252 119 280" stroke="currentColor" strokeWidth="1" />
          <path d="M235 49C208 28 199 12 202 0C230 7 245 26 235 49ZM204 80C178 60 164 44 169 29C196 37 212 56 204 80ZM160 123C134 105 123 87 130 74C155 83 170 102 160 123ZM127 160C99 147 84 130 89 116C115 125 132 143 127 160ZM82 218C54 205 42 189 48 175C72 184 88 201 82 218Z" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-12 hidden h-80 w-80 -rotate-12 text-[#D8B98F]/40 sm:block" viewBox="0 0 300 300" fill="none">
          <path d="M10 290C54 250 66 205 102 171S170 117 195 54M45 257C72 268 97 260 117 241M74 219C100 231 124 223 143 205M111 178C137 190 160 181 177 163M149 134C174 147 194 136 208 118M177 93C200 104 219 93 231 76" stroke="currentColor" strokeWidth="1" />
          <path d="M45 257C32 231 36 213 48 204C66 225 66 244 45 257ZM74 219C62 193 68 175 80 168C97 189 96 207 74 219ZM111 178C102 151 110 134 123 129C138 151 135 168 111 178ZM149 134C142 108 150 92 163 87C177 108 173 125 149 134Z" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative w-full max-w-[510px]">
          <div className="rounded-xl border border-[#DCC7AC] bg-white/80 px-6 py-9 shadow-[0_20px_65px_rgba(48,37,22,0.05)] backdrop-blur-sm sm:px-10 sm:py-11 md:px-12">
            <div className="text-center">
              <div className="mx-auto mb-7 mt-9 h-px w-16 bg-[#B89569]" />
              <h1 className="font-serif text-3xl text-[#183129] sm:text-[34px]">Welcome Back</h1>
              <p className="mt-3 text-sm leading-6 text-[#777F7A]">Sign in to your account to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-medium text-[#34423B]">Email Address</label>
                <div className="relative">
                  <Mail size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B8982]" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    maxLength={254}
                    className="h-12 w-full rounded-md border border-[#DEDCD6] bg-transparent pl-11 pr-4 text-sm text-[#183129] outline-none transition placeholder:text-[#9CA39E] focus:border-[#A77B4C] focus:ring-2 focus:ring-[#A77B4C]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-medium text-[#34423B]">Password</label>
                <div className="relative">
                  <LockKeyhole size={17} strokeWidth={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B8982]" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-md border border-[#DEDCD6] bg-transparent pl-11 pr-12 text-sm text-[#183129] outline-none transition placeholder:text-[#9CA39E] focus:border-[#A77B4C] focus:ring-2 focus:ring-[#A77B4C]/10"
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#7B8982] transition hover:text-[#A77B4C]">
                    {showPassword ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#5D6962]">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded accent-[#A77B4C]" />
                  Remember me
                </label>
                <button type="button" onClick={() => { setError(''); setNotice('Password reset is not available yet. Contact our team for assistance.') }} className="text-xs font-medium text-[#99683B] underline decoration-[#C7A47B] underline-offset-4 transition hover:text-[#183129]">
                  Forgot password?
                </button>
              </div>

              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{error}</p>}
              {notice && <p role="status" className="rounded-md border border-[#e5d8c7] bg-[#f8f2e9] px-3 py-2.5 text-xs leading-5 text-[#745a3d]">{notice}</p>}

              <button type="submit" disabled={isLoading} className="group flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#102923] px-5 text-sm font-medium text-white transition duration-300 hover:bg-[#24483B] disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E7E3DC]" />
              <span className="text-[10px] uppercase tracking-wider text-[#8D9790]">Or</span>
              <div className="h-px flex-1 bg-[#E7E3DC]" />
            </div>

            <p className="text-center text-xs text-[#68736C]">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setError(''); setNotice('Account registration is not available yet. Contact our team for assistance.') }} className="font-medium text-[#99683B] underline decoration-[#C7A47B] underline-offset-4 transition hover:text-[#183129]">
                Create Account
              </button>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2.5 text-center text-[10px] leading-5 text-[#849087]">
              <ShieldCheck size={16} className="shrink-0 text-[#A77B4C]" />
              <span>Secure sign-in · Your information is protected</span>
            </div>
          </div>
        </div>
    </section>
  )
}