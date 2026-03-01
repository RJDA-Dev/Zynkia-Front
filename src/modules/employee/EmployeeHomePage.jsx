import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'

export default function EmployeeHomePage() {
  const { t, lang } = useLang()
  const { formatCurrency } = useCurrency()
  const es = lang === 'es'
  const navigate = useNavigate()
  const { data: homeData, loading } = useFetch(() => portal.home(), { key: 'portal-home' })
  const { data: vacData } = useFetch(() => portal.vacationBalance(), { key: 'portal-vacation' })
  const home = homeData?.data || {}
  const vacation = vacData?.data || {}

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  const nextShift = home.nextShift
  const stats = home.stats || {}

  return (
    <>
      <section className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="bg-gradient-to-br from-primary to-purple-800 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {es ? 'Tu próximo turno' : 'Your next shift'}
                </span>
                <h2 className="text-xl font-bold mt-3">{nextShift ? `${nextShift.startTime} - ${nextShift.endTime}` : (es ? 'Sin turnos' : 'No shifts')}</h2>
                {nextShift && <p className="text-white/70 text-sm mt-0.5">{new Date(nextShift.date).toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>}
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-[26px]">schedule</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4">
          <button className="w-full h-12 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-white font-semibold shadow-lg">
            <span className="material-symbols-outlined">fingerprint</span>
            <span>{es ? 'Marcar Asistencia' : 'Check In'}</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">schedule</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{t('weeklyHours')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.weeklyHours || 0}<span className="text-sm font-medium text-gray-400">/{stats.weeklyTarget || 48}h</span></p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((stats.weeklyHours || 0) / (stats.weeklyTarget || 48)) * 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">payments</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{es ? 'Salario Base' : 'Base Salary'}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.baseSalary || 0)}</p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">{es ? 'Resumen' : 'Summary'}</h3>
          <Badge color="primary">{new Date().toLocaleDateString(es ? 'es-CO' : 'en-US', { month: 'long', year: 'numeric' })}</Badge>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { icon: 'more_time', color: 'text-amber-600 bg-amber-50', label: t('overtimeHours'), value: `${stats.overtimeHours || 0}h` },
            { icon: 'beach_access', color: 'text-cyan-600 bg-cyan-50', label: t('vacationDays'), value: `${vacation.available || 0} ${es ? 'disponibles' : 'available'}` },
            { icon: 'pending_actions', color: 'text-purple-600 bg-purple-50', label: t('pendingRequests'), value: `${stats.pendingRequests || 0}` },
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
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{es ? 'Acciones Rápidas' : 'Quick Actions'}</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: 'assignment_turned_in', label: es ? 'Permiso' : 'Leave', bg: 'bg-purple-50 text-purple-600', to: '/employee/requests' },
            { icon: 'medical_services', label: es ? 'Médica' : 'Medical', bg: 'bg-red-50 text-red-600', to: '/employee/requests' },
            { icon: 'beach_access', label: es ? 'Vacaciones' : 'Vacation', bg: 'bg-orange-50 text-orange-600', to: '/employee/requests' },
            { icon: 'calendar_month', label: es ? 'Horario' : 'Schedule', bg: 'bg-emerald-50 text-emerald-600', to: '/employee/schedule' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.to)} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.97]">
              <div className={`h-10 w-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
