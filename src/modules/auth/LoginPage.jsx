import { useState } from 'react'
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
  const { login } = useAuth()
  const { t, lang } = useLang()
  const loader = useLoader()
  const navigate = useNavigate()
  const es = lang === 'es'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    loader.show(es ? 'Iniciando sesión...' : 'Signing in...')
    try {
      const user = await login(email, password)
      if (user) navigate(user.role === 'employee' ? '/employee' : '/dashboard')
    } catch (err) {
      setError(err.message || (es ? 'Credenciales inválidas' : 'Invalid credentials'))
    } finally {
      setLoading(false)
      loader.hide()
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left — branding */}
      <div className="relative lg:w-[55%] flex-shrink-0 min-h-[320px] lg:min-h-screen">
        <div className="absolute inset-0 bg-purple-700" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-16 py-10 lg:py-0 text-white lg:pr-28">
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="material-symbols-outlined text-2xl">psychology_alt</span>
            </div>
            <span className="text-2xl lg:text-3xl font-bold tracking-tight">Zynkia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
            {es ? 'Gestión de talento humano simplificada' : 'Simplified HR management'}
          </h1>
          <p className="text-sm lg:text-base text-purple-200 leading-relaxed max-w-lg">
            {es ? 'Nómina, asistencia, solicitudes y más. Todo en un solo lugar.' : 'Payroll, attendance, requests and more. All in one place.'}
          </p>
          <div className="mt-8 lg:mt-10 grid grid-cols-2 gap-2.5 max-w-md">
            {[
              { icon: 'groups', label: es ? 'Empleados' : 'Employees' },
              { icon: 'payments', label: es ? 'Nómina' : 'Payroll' },
              { icon: 'schedule', label: es ? 'Asistencia' : 'Attendance' },
              { icon: 'task_alt', label: es ? 'Solicitudes' : 'Requests' },
            ].map(f => (
              <div key={f.icon} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                <span className="material-symbols-outlined text-lg text-purple-200">{f.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* S-curve desktop — right edge */}
        <div className="hidden lg:block absolute top-0 -right-[1px] w-[100px] h-full z-20">
          <svg viewBox="0 0 100 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 0 L 60 0 C 20 300, 80 600, 40 900 L 0 900 Z" fill="#7e22ce" />
            <path d="M 60 0 L 100 0 L 100 900 L 40 900 C 80 600, 20 300, 60 0 Z" fill="#f9fafb" />
          </svg>
        </div>

        {/* S-curve mobile — bottom edge */}
        <div className="lg:hidden absolute -bottom-[1px] left-0 w-full h-[60px] z-20">
          <svg viewBox="0 0 900 60" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 0 L 900 0 L 900 20 C 600 60, 300 10, 0 40 Z" fill="#7e22ce" />
            <path d="M 0 40 C 300 10, 600 60, 900 20 L 900 60 L 0 60 Z" fill="#f9fafb" />
          </svg>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-gray-900">{es ? 'Bienvenido' : 'Welcome back'}</h2>
            <p className="mt-1 text-sm text-gray-500">{es ? 'Ingresa a tu cuenta' : 'Sign in to your account'}</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-shake">
              <span className="material-symbols-outlined text-lg text-red-500">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">mail</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@zynkia.co" required autoFocus autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{es ? 'Contraseña' : 'Password'}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">lock</span>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all mt-6">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{es ? 'Ingresando...' : 'Signing in...'}</>
              ) : (
                <><span className="material-symbols-outlined text-lg">login</span>{es ? 'Iniciar sesión' : 'Sign in'}</>
              )}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            {es ? 'Protegido con MFA si está habilitado' : 'Protected with MFA if enabled'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}
