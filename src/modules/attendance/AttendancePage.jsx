import { useState, useMemo, useRef } from 'react'
import { attendance } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import Tabs from '../../components/ui/Tabs'
import DatePicker from '../../components/ui/DatePicker'
import { useLang } from '../../context/LangContext'

const statusColors = { on_time: 'success', active: 'info', late: 'warning', absent: 'danger' }

function weekDays(startDate) {
  const d = new Date(startDate + 'T12:00:00')
  const day = d.getDay()
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon); dd.setDate(mon.getDate() + i)
    return dd.toISOString().split('T')[0]
  })
}

function exportCSV(records, date) {
  const rows = [['Empleado', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado']]
  records.forEach(r => {
    rows.push([
      r.employee?.name || '-', r.date,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      r.hoursWorked || '0', r.status
    ])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `asistencia_${date}.csv`; a.click()
}

export default function AttendancePage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('daily')
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef(null)

  const { data, loading } = useFetch(() => attendance.byDate(date), { key: `att-${date}`, deps: [date] })
  const records = data?.data || []
  const stats = data?.stats || {}

  // Week data
  const week = useMemo(() => weekDays(date), [date])
  const { data: weekData } = useFetch(() => {
    if (tab !== 'week') return Promise.resolve(null)
    return Promise.all(week.map(d => attendance.byDate(d)))
  }, { key: `att-week-${week[0]}`, deps: [tab, week[0]] })

  const weekRecords = useMemo(() => {
    if (!weekData || !Array.isArray(weekData)) return {}
    const map = {}
    weekData.forEach((dayData, i) => {
      const d = week[i]
      const recs = dayData?.data || []
      recs.forEach(r => {
        const eid = r.employee?.id || r.employeeId
        if (!map[eid]) map[eid] = { name: r.employee?.name || '?', days: {} }
        map[eid].days[d] = r
      })
    })
    return map
  }, [weekData, week])

  const statusLabel = { on_time: es ? 'A tiempo' : 'On time', active: es ? 'En turno' : 'On Shift', late: es ? 'Tarde' : 'Late', absent: es ? 'Ausente' : 'Absent' }
  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter)

  const fmtTime = (v) => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
  const dayLabel = (d) => { const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString(es ? 'es-CO' : 'en', { weekday: 'short', day: 'numeric' }) }
  const isToday = (d) => d === new Date().toISOString().split('T')[0]
  const isPast = (d) => d < new Date().toISOString().split('T')[0]
  const isWeekend = (d) => { const dow = new Date(d + 'T12:00:00').getDay(); return dow === 0 || dow === 6 }

  const navWeek = (dir) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + dir * 7)
    setDate(d.toISOString().split('T')[0])
  }

  const columns = [
    { key: 'employee', label: t('employee'), render: (_, row) => (
      <div className="flex items-center gap-3"><Avatar name={row.employee?.name || '-'} size="sm" /><span className="text-sm font-medium text-gray-900">{row.employee?.name || '-'}</span></div>
    )},
    { key: 'checkIn', label: t('checkIn'), render: (v) => <span className={!v ? 'text-gray-300' : 'font-medium text-gray-900'}>{fmtTime(v)}</span> },
    { key: 'checkOut', label: t('checkOut'), render: (v) => <span className={!v ? 'text-gray-300' : 'font-medium text-gray-900'}>{fmtTime(v)}</span> },
    { key: 'hoursWorked', label: t('hours'), render: (v) => <span className="font-medium">{v ? `${v}h` : '-'}</span> },
    { key: 'status', label: t('status'), render: (v) => <Badge color={statusColors[v] || 'neutral'} dot>{statusLabel[v] || v}</Badge> },
  ]

  const tabs = [
    { key: 'daily', label: es ? 'Diario' : 'Daily', icon: 'today' },
    { key: 'week', label: es ? 'Semana' : 'Week', icon: 'date_range' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <p className="text-gray-500">{es ? 'Control de entrada y salida de empleados.' : 'Employee check-in and check-out control.'}</p>
        <div className="flex gap-3 items-center">
          {tab === 'daily' && <DatePicker value={date} onChange={setDate} />}
          <div className="relative" ref={exportRef}>
            <Button variant="secondary" icon="download" onClick={() => setShowExport(!showExport)}>{t('export')}</Button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-36">
                <button onClick={() => { exportCSV(records, date); setShowExport(false) }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">table_chart</span> CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('present')} value={String((stats.onTime || 0) + (stats.active || 0))} icon="check_circle" iconColor="text-success bg-success/10" change={`${es ? 'de' : 'of'} ${stats.total || 0}`} />
        <StatCard label={es ? 'En Turno' : 'On Shift'} value={String(stats.active || 0)} icon="work" iconColor="text-primary bg-primary/10" />
        <StatCard label={es ? 'Tardanzas' : 'Late'} value={String(stats.late || 0)} icon="schedule" iconColor="text-warning bg-warning/10" />
        <StatCard label={t('absent')} value={String(stats.absent || 0)} icon="person_off" iconColor="text-danger bg-danger/10" />
      </div>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {/* Daily view */}
      {tab === 'daily' && (
        <Card title={`${es ? 'Registros' : 'Records'} — ${new Date(date + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en', { weekday: 'long', day: 'numeric', month: 'long' })}`} actions={
          <Select value={filter} onChange={e => setFilter(e.target.value)} options={[
            { value: 'all', label: es ? 'Todos' : 'All' },
            { value: 'on_time', label: es ? 'A tiempo' : 'On time' },
            { value: 'absent', label: es ? 'Ausente' : 'Absent' },
            { value: 'late', label: es ? 'Tarde' : 'Late' },
          ]} />
        }>
          {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
            filtered.length === 0
              ? <div className="p-8 text-center text-gray-400"><span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">event_busy</span>{es ? 'Sin registros' : 'No records'}</div>
              : <Table columns={columns} data={filtered} />
          )}
        </Card>
      )}

      {/* Week view */}
      {tab === 'week' && (
        <Card>
          <div className="p-4">
            {/* Week nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navWeek(-1)} className="p-1.5 rounded-lg hover:bg-gray-100"><span className="material-symbols-outlined">chevron_left</span></button>
              <span className="text-sm font-semibold text-gray-700">
                {new Date(week[0] + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short' })} — {new Date(week[6] + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button onClick={() => navWeek(1)} className="p-1.5 rounded-lg hover:bg-gray-100"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium w-40">{t('employee')}</th>
                    {week.map(d => (
                      <th key={d} className={`text-center px-2 py-2 text-xs font-medium min-w-[80px] ${isToday(d) ? 'text-primary' : isWeekend(d) ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className={`${isToday(d) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-0.5' : ''}`}>
                          {new Date(d + 'T12:00:00').getDate()}
                        </div>
                        <span className="capitalize">{new Date(d + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en', { weekday: 'short' })}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(weekRecords).map(([eid, emp]) => (
                    <tr key={eid} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} size="xs" />
                          <span className="font-medium text-gray-900 text-xs truncate">{emp.name}</span>
                        </div>
                      </td>
                      {week.map(d => {
                        const r = emp.days[d]
                        const we = isWeekend(d)
                        if (we) return <td key={d} className="text-center px-2 py-2"><span className="text-gray-200 text-[10px]">--</span></td>
                        if (!r && isPast(d)) return <td key={d} className="text-center px-2 py-2"><span className="text-gray-300 text-[10px]">--</span></td>
                        if (!r) return <td key={d} className="text-center px-2 py-2" />
                        const color = r.status === 'on_time' ? 'bg-green-100 text-green-700' : r.status === 'late' ? 'bg-amber-100 text-amber-700' : r.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        return (
                          <td key={d} className="text-center px-1 py-2">
                            <div className={`rounded-md px-1 py-1 ${color}`}>
                              <div className="text-[10px] font-bold">{r.hoursWorked ? `${r.hoursWorked}h` : (r.status === 'absent' ? 'X' : '--')}</div>
                              <div className="text-[9px] opacity-70">{r.checkIn ? fmtTime(r.checkIn) : ''}</div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {Object.keys(weekRecords).length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">{es ? 'Sin datos esta semana' : 'No data this week'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
