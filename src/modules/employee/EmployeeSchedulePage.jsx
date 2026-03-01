import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'
import Avatar from '../../components/ui/Avatar'
import Tabs from '../../components/ui/Tabs'

const shiftColors = {
  morning: { bg: 'bg-blue-100 border-l-4 border-blue-500', text: 'text-blue-700', sub: 'text-blue-600/70' },
  afternoon: { bg: 'bg-purple-100 border-l-4 border-purple-500', text: 'text-purple-700', sub: 'text-purple-600/70' },
  night: { bg: 'bg-gray-900 border-l-4 border-gray-700', text: 'text-white', sub: 'text-gray-300' },
}

function weekDays(base) {
  const d = new Date(base + 'T12:00:00')
  const day = d.getDay()
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => { const dd = new Date(mon); dd.setDate(mon.getDate() + i); return dd.toISOString().split('T')[0] })
}

export default function EmployeeSchedulePage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const [tab, setTab] = useState('mine')
  const { data, loading } = useFetch(() => portal.schedule(), { key: 'portal-schedule' })
  const { data: teamData } = useFetch(() => portal.teamSchedule(), { key: 'portal-team-schedule' })
  const shifts = Array.isArray(data) ? data : (data?.data || [])
  const teamShifts = Array.isArray(teamData) ? teamData : (teamData?.data || [])

  const dayLabels = es ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().toISOString().split('T')[0]
  const week = weekDays(shifts[0]?.date || today)

  // Group team shifts by employee
  const teamByEmp = {}
  teamShifts.forEach(s => {
    const name = s.employee?.name || 'Unknown'
    if (!teamByEmp[name]) teamByEmp[name] = []
    teamByEmp[name].push(s)
  })

  // Group my shifts by week
  const myByWeek = {}
  shifts.forEach(s => {
    const w = weekDays(s.date)
    const wk = w[0]
    if (!myByWeek[wk]) myByWeek[wk] = {}
    const dayIdx = (new Date(s.date + 'T12:00:00').getDay() + 6) % 7
    myByWeek[wk][dayIdx] = s
  })
  const weeks = Object.keys(myByWeek).sort()

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  const tabs = [
    { key: 'mine', label: es ? 'Mi Horario' : 'My Schedule', icon: 'calendar_month' },
    { key: 'team', label: es ? 'Mi Equipo' : 'My Team', icon: 'groups' },
  ]

  return (
    <div className="space-y-4">
      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === 'mine' && (
        <>
          {shifts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
              <p className="mt-2 text-sm text-gray-500">{es ? 'No tienes turnos asignados' : 'No shifts assigned'}</p>
            </div>
          ) : (
            <>
              {/* Desktop: week grid */}
              <div className="hidden lg:block space-y-6">
                {weeks.map(wk => {
                  const w = weekDays(wk)
                  const mon = new Date(w[0] + 'T12:00:00')
                  const sun = new Date(w[6] + 'T12:00:00')
                  return (
                    <div key={wk} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">date_range</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {mon.toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short' })} — {sun.toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-7 divide-x divide-gray-100">
                        {w.map((d, i) => {
                          const shift = myByWeek[wk]?.[i]
                          const isToday = d === today
                          const colors = shift ? (shiftColors[shift.shiftType] || shiftColors.morning) : null
                          return (
                            <div key={d} className={`p-3 min-h-[100px] ${isToday ? 'bg-primary/5' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-400">{dayLabels[i]}</span>
                                <span className={`text-xs font-bold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-500'}`}>{new Date(d + 'T12:00:00').getDate()}</span>
                              </div>
                              {shift ? (
                                <div className={`${colors.bg} p-2 rounded-lg`}>
                                  <p className={`text-sm font-bold ${colors.text}`}>{shift.startTime?.slice(0,5)} - {shift.endTime?.slice(0,5)}</p>
                                  <p className={`text-[11px] capitalize ${colors.sub}`}>{shift.shiftType}</p>
                                </div>
                              ) : <div className="flex items-center justify-center h-12 text-gray-300 text-xs">--</div>}
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
                {shifts.map((s, i) => {
                  const d = new Date(s.date + 'T12:00:00')
                  const dayIdx = (d.getDay() + 6) % 7
                  const colors = shiftColors[s.shiftType] || shiftColors.morning
                  return (
                    <div key={s.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">{dayLabels[dayIdx]} {d.toLocaleDateString()}</p>
                      <div className={`${colors.bg} p-3 rounded`}>
                        <span className={`block font-bold ${colors.text}`}>{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</span>
                        <span className={`text-xs ${colors.sub}`}>{s.shiftType}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'team' && (
        <div className="space-y-4">
          {Object.keys(teamByEmp).length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300">groups</span>
              <p className="mt-2 text-sm text-gray-500">{es ? 'Sin turnos de equipo' : 'No team shifts'}</p>
            </div>
          ) : (
            Object.entries(teamByEmp).map(([name, empShifts]) => (
              <div key={name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                  <Avatar name={name} size="xs" />
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                  <span className="text-xs text-gray-400">{empShifts.length} {es ? 'turnos' : 'shifts'}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {empShifts.map((s, i) => {
                    const colors = shiftColors[s.shiftType] || shiftColors.morning
                    const d = new Date(s.date + 'T12:00:00')
                    const dayIdx = (d.getDay() + 6) % 7
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-xs text-gray-400 w-20">{dayLabels[dayIdx]} {d.getDate()}/{d.getMonth()+1}</span>
                        <div className={`flex-1 ${colors.bg} px-3 py-1.5 rounded`}>
                          <span className={`text-sm font-bold ${colors.text}`}>{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</span>
                          <span className={`text-xs ml-2 ${colors.sub}`}>{s.shiftType}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
