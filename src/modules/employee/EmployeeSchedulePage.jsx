import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'

const shiftColors = {
  morning: { bg: 'bg-blue-100 border-l-4 border-blue-500', text: 'text-blue-700', sub: 'text-blue-600/70' },
  afternoon: { bg: 'bg-purple-100 border-l-4 border-purple-500', text: 'text-purple-700', sub: 'text-purple-600/70' },
  night: { bg: 'bg-amber-100 border-l-4 border-amber-500', text: 'text-amber-800', sub: 'text-amber-700/70' },
}

export default function EmployeeSchedulePage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const { data, loading } = useFetch(() => portal.schedule(), { key: 'portal-schedule' })
  const shifts = data?.data || []

  const dayLabels = es ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{t('mySchedule')}</h2>
      {shifts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
          <p className="mt-2 text-sm text-gray-500">{es ? 'No hay turnos asignados' : 'No shifts assigned'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift, i) => {
            const d = new Date(shift.date)
            const dayIdx = (d.getDay() + 6) % 7
            const colorKey = shift.shiftType || 'morning'
            const colors = shiftColors[colorKey] || shiftColors.morning
            return (
              <div key={shift.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">{dayLabels[dayIdx]} {d.toLocaleDateString()}</p>
                <div className={`${colors.bg} p-3 rounded`}>
                  <span className={`block font-bold ${colors.text}`}>{shift.startTime} - {shift.endTime}</span>
                  <span className={`text-xs ${colors.sub}`}>{shift.shiftType || shift.notes || ''}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
