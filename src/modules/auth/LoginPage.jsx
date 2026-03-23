import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { useLoader } from '../../context/LoaderContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login, user } = useAuth()
  const { t, lang } = useLang()
  const loader = useLoader()
  const navigate = useNavigate()
  const es = lang === 'es'

  useEffect(() => {
    if (user) navigate(user.role === 'employee' ? '/employee' : '/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    loader.show({ label: es ? 'Iniciando sesión...' : 'Signing in...', icon: 'shield' })
    try {
      const u = await login(email, password)
      if (u) navigate(u.role === 'employee' ? '/employee' : '/dashboard')
    } catch (err) {
      setError(err.message || (es ? 'Credenciales inválidas' : 'Invalid credentials'))
    } finally {
      setLoading(false)
      loader.hide()
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="hidden lg:flex lg:w-[50%] relative bg-[linear-gradient(145deg,_#082f2e,_#0f766e_55%,_#14532d)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-between h-full p-14 w-full">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Zekya HR</span>
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.1] max-w-lg">
              {es ? 'Gestiona el ciclo completo del colaborador.' : 'Manage the full employee lifecycle.'}
            </h1>
            <p className="mt-5 text-base text-white/60 max-w-md leading-relaxed">
              {es ? 'Contratación, administración y retiro en una sola operación.' : 'Hiring, administration and offboarding in one operation.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'person_search', label: es ? 'Contratación' : 'Hiring' },
              { icon: 'payments', label: es ? 'Administración' : 'Administration' },
              { icon: 'badge', label: es ? 'Retiro' : 'Offboarding' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/8 px-3 py-3 text-center">
                <span className="material-symbols-outlined text-lg text-white/70">{f.icon}</span>
                <p className="mt-1 text-[11px] font-semibold text-white/50">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 lg:items-start">
            <div className="flex items-center gap-3 mb-5 lg:hidden">
              <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[22px]">hub</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Zekya HR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-center lg:text-left">
              {es ? 'Iniciar sesión' : 'Sign in'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 text-center lg:text-left">
              {es ? 'Ingresa con tu cuenta corporativa.' : 'Use your corporate account.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{es ? 'Contraseña' : 'Password'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">lock</span>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-[18px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <span className="material-symbols-outlined text-[18px]">login</span>
              )}
              {loading ? (es ? 'Ingresando...' : 'Signing in...') : (es ? 'Entrar' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <button type="button" className="hover:text-primary transition-colors">{es ? 'Olvidé mi contraseña' : 'Forgot password'}</button>
            <span className="h-3 w-px bg-slate-200" />
            <button type="button" className="hover:text-primary transition-colors">{es ? 'Registrar empresa' : 'Register company'}</button>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            {es ? 'Protegido con MFA si está habilitado.' : 'Protected with MFA if enabled.'}
          </p>
        </div>
      </div>
    </div>
  )
}
