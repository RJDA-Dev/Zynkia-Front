import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'

const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const tf = localStorage.getItem('timeFormat') || '24h'
  if (tf === '12h') {
    const hr = parseInt(h)
    const ampm = hr >= 12 ? 'PM' : 'AM'
    return `${hr % 12 || 12}:${m} ${ampm}`
  }
  return `${h}:${m}`
}

export default function EmployeeHomePage() {
  const { t, lang } = useLang()
  const { formatCurrency } = useCurrency()
  const es = lang === 'es'
  const navigate = useNavigate()
  const { data: homeData, loading } = useFetch(() => portal.home(), { key: 'portal-home' })
  const { data: vacData } = useFetch(() => portal.vacationBalance(), { key: 'portal-vacation' })
  const home = homeData?.data || homeData || {}
  const vacation = vacData?.data || vacData || {}

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  const nextShift = home.nextShift
  const stats = home.stats || {}
  const isNight = nextShift?.shiftType === 'night'
  const shiftGradient = isNight ? 'from-gray-900 to-gray-800' : 'from-primary to-purple-800'
  const hasShiftToday = nextShift?.date === new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Shift + Check-in */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className={`bg-gradient-to-br ${shiftGradient} p-5 lg:p-6 text-white relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {es ? 'Proximo turno' : 'Next shift'}
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold mt-3">{nextShift ? `${fmtTime(nextShift.startTime)} - ${fmtTime(nextShift.endTime)}` : (es ? 'Sin turnos' : 'No shifts')}</h2>
              {nextShift && <p className="text-white/70 text-sm mt-1 capitalize">{nextShift.shiftType} — {new Date(nextShift.date + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>}
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0">
              <span className="material-symbols-outlined text-[26px]">schedule</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 lg:p-4">
          <button disabled={!hasShiftToday} className={`w-full h-12 ${!hasShiftToday ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isNight ? 'bg-gray-900 hover:bg-black text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'} active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 font-semibold shadow-sm`}>
            <span className="material-symbols-outlined text-xl">fingerprint</span>
            {!hasShiftToday ? (es ? 'Sin turno hoy' : 'No shift today') : (es ? 'Marcar Asistencia' : 'Check In')}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">schedule</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{es ? 'Horas Mes' : 'Monthly Hours'}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.monthlyHours || 0}<span className="text-xs font-medium text-gray-400">/{stats.monthlyTarget || 208}h</span></p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats.monthlyHours || 0) / (stats.monthlyTarget || 208)) * 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">payments</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{es ? 'Salario Base' : 'Base Salary'}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(stats.baseSalary || 0)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{es ? 'Valor hora:' : 'Hourly:'} <span className="font-semibold text-gray-500">{formatCurrency(stats.hourlyRate || 0)}</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">more_time</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{es ? 'Extras Mes' : 'OT Month'}</span>
          </div>
          <p className="text-lg font-bold text-amber-600 truncate">{formatCurrency(stats.overtimeAmount || 0)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.overtimeHours || 0}h {es ? 'registradas' : 'logged'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-600 text-[18px]">price_check</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{es ? 'Extras Pagadas' : 'OT Paid'}</span>
          </div>
          <p className="text-lg font-bold text-green-600 truncate">{formatCurrency(stats.overtimePaid || 0)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{es ? 'Cancelado este mes' : 'Paid this month'}</p>
        </div>
      </div>

      {/* Summary + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">{es ? 'Resumen' : 'Summary'}</h3>
            <Badge color="primary">{new Date().toLocaleDateString(es ? 'es-CO' : 'en-US', { month: 'long', year: 'numeric' })}</Badge>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { icon: 'beach_access', color: 'text-cyan-600 bg-cyan-50', label: es ? 'Vacaciones' : 'Vacation', value: `${vacation.available || 0} ${es ? 'disponibles' : 'available'}` },
              { icon: 'pending_actions', color: 'text-purple-600 bg-purple-50', label: es ? 'Solicitudes Pendientes' : 'Pending Requests', value: `${stats.pendingRequests || 0}` },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="flex-1"><p className="text-sm text-gray-600">{item.label}</p></div>
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{es ? 'Acciones Rapidas' : 'Quick Actions'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: 'receipt_long', label: es ? 'Pagos' : 'Payments', bg: 'bg-green-50 text-green-600', to: '/employee/payments' },
              { icon: 'swap_horiz', label: es ? 'Intercambio' : 'Swap', bg: 'bg-blue-50 text-blue-600', to: '/employee/requests' },
              { icon: 'beach_access', label: es ? 'Vacaciones' : 'Vacation', bg: 'bg-orange-50 text-orange-600', to: '/employee/requests' },
              { icon: 'calendar_month', label: es ? 'Horario' : 'Schedule', bg: 'bg-emerald-50 text-emerald-600', to: '/employee/schedule' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.to)} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.97]">
                <div className={`h-9 w-9 rounded-lg ${a.bg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
