import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'

const shiftColors = {
  morning: { bg: 'bg-blue-100 border-l-4 border-blue-500', text: 'text-blue-700', sub: 'text-blue-600/70', dot: 'bg-blue-500' },
  afternoon: { bg: 'bg-purple-100 border-l-4 border-purple-500', text: 'text-purple-700', sub: 'text-purple-600/70', dot: 'bg-purple-500' },
  night: { bg: 'bg-amber-100 border-l-4 border-amber-500', text: 'text-amber-800', sub: 'text-amber-700/70', dot: 'bg-amber-500' },
}

export default function EmployeeSchedulePage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const { data, loading } = useFetch(() => portal.schedule(), { key: 'portal-schedule' })
  const shifts = data?.data || []

  const dayLabels = es ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayLabelsFull = es ? ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  // Group by week for desktop
  const byWeek = {}
  shifts.forEach(s => {
    const d = new Date(s.date + 'T12:00:00')
    const day = d.getDay()
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    const weekKey = mon.toISOString().split('T')[0]
    if (!byWeek[weekKey]) byWeek[weekKey] = {}
    const dayIdx = (day + 6) % 7
    byWeek[weekKey][dayIdx] = s
  })
  const weeks = Object.keys(byWeek).sort()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{t('mySchedule')}</h2>

      {shifts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
          <p className="mt-2 text-sm text-gray-500">{es ? 'No hay turnos asignados' : 'No shifts assigned'}</p>
        </div>
      ) : (
        <>
          {/* Desktop: week grid */}
          <div className="hidden lg:block space-y-6">
            {weeks.map(weekStart => {
              const mon = new Date(weekStart + 'T12:00:00')
              const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
              const weekShifts = byWeek[weekStart]
              return (
                <div key={weekStart} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">date_range</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {mon.toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short' })} — {sun.toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 divide-x divide-gray-100">
                    {dayLabelsFull.map((label, i) => {
                      const shift = weekShifts[i]
                      const cellDate = new Date(mon); cellDate.setDate(mon.getDate() + i)
                      const isToday = cellDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                      const colors = shift ? (shiftColors[shift.shiftType] || shiftColors.morning) : null
                      return (
                        <div key={i} className={`p-3 min-h-[100px] ${isToday ? 'bg-primary/5' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400">{dayLabels[i]}</span>
                            <span className={`text-xs font-bold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-500'}`}>
                              {cellDate.getDate()}
                            </span>
                          </div>
                          {shift ? (
                            <div className={`${colors.bg} p-2 rounded-lg`}>
                              <p className={`text-sm font-bold ${colors.text}`}>{shift.startTime} - {shift.endTime}</p>
                              <p className={`text-[11px] capitalize ${colors.sub}`}>{shift.shiftType}</p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-12 text-gray-300 text-xs">--</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: list */}
          <div className="lg:hidden space-y-3">
            {shifts.map((shift, i) => {
              const d = new Date(shift.date + 'T12:00:00')
              const dayIdx = (d.getDay() + 6) % 7
              const colors = shiftColors[shift.shiftType] || shiftColors.morning
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
        </>
      )}
    </div>
  )
}
