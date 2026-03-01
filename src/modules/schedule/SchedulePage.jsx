import { useState, useMemo, useCallback, useEffect } from 'react'
import { schedule as scheduleService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Tabs from '../../components/ui/Tabs'
import ShiftGeneratorModal from './ShiftGeneratorModal'
import CreateShiftModal from './CreateShiftModal'

import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

const MO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MO_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DH = ['D','L','M','M','J','V','S']
const DF = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const dot = { blue: 'bg-blue-500', purple: 'bg-purple-500', amber: 'bg-amber-500', gray: 'bg-gray-400', red: 'bg-red-500' }
const cBg = { blue: 'bg-blue-50', purple: 'bg-purple-50', amber: 'bg-amber-50', gray: 'bg-gray-100', red: 'bg-red-50' }
const cBd = { blue: 'border-blue-400', purple: 'border-purple-400', amber: 'border-amber-400', gray: 'border-gray-400', red: 'border-red-400' }
const cTx = { blue: 'text-blue-700', purple: 'text-purple-700', amber: 'text-amber-800', gray: 'text-gray-600', red: 'text-red-700' }
const statusIcon = { leave: 'event_busy', absent: 'person_off', scheduled: '' }
const dk = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function SchedulePage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const months = es ? MO : MO_EN
  const [shifts, setShifts] = useState({})
  const [year, setYear] = useState(2026)
  const [view, setView] = useState('year')
  const [exMonth, setExMonth] = useState(null)
  const [editShift, setEditShift] = useState(null)
  const [selDay, setSelDay] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(), day = d.getDay()
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
    return d
  })

  const loadMonth = (m) => {
    scheduleService.month(year, m + 1).then(data => {
      if (data && typeof data === 'object') setShifts(prev => ({ ...prev, ...data }))
    }).catch(() => {})
  }

  const loadWeek = () => {
    const months = new Set()
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(d.getDate() + i)
      months.add(`${d.getFullYear()}-${d.getMonth()}`)
    }
    months.forEach(k => { const [y, m] = k.split('-').map(Number); scheduleService.month(y, m + 1).then(data => { if (data && typeof data === 'object') setShifts(prev => ({ ...prev, ...data })) }).catch(() => {}) })
  }

  useEffect(() => {
    if (view === 'week') { loadWeek() }
    else if (exMonth !== null) { loadMonth(exMonth) }
    else { for (let m = 0; m < 12; m++) loadMonth(m) }
  }, [year, exMonth, view, weekStart])

  const refreshSchedule = () => {
    if (view === 'week') loadWeek()
    else if (exMonth !== null) loadMonth(exMonth)
    else for (let m = 0; m < 12; m++) loadMonth(m)
  }

  const { data: statsData } = useFetch(() => scheduleService.stats(year), { key: `sched-stats-${year}`, deps: [year] })
  const stats = statsData?.data || statsData || {}

  const total = useMemo(() => Object.values(shifts).reduce((a, b) => a + b.length, 0), [shifts])

  const draggedDays = useMemo(() => {
    if (!dragStart || !dragEnd || exMonth === null) return []
    const y = year, m = exMonth
    const d1 = Math.min(dragStart, dragEnd), d2 = Math.max(dragStart, dragEnd)
    const days = []
    for (let d = d1; d <= d2; d++) days.push(dk(y, m, d))
    return days
  }, [dragStart, dragEnd, year, exMonth])

  const handleDragStart = useCallback((d) => { setDragStart(d); setDragEnd(d); setDragging(true) }, [])
  const handleDragMove = useCallback((d) => { if (dragging) setDragEnd(d) }, [dragging])
  const handleDragEnd = useCallback(() => {
    if (dragging && draggedDays.length > 0) setShowCreate(true)
    setDragging(false)
  }, [dragging, draggedDays])

  const handleShiftsCreated = (newShifts) => {
    setShifts(prev => {
      const copy = { ...prev }
      Object.entries(newShifts).forEach(([key, val]) => {
        copy[key] = [...(copy[key] || []), val]
      })
      return copy
    })
    setDragStart(null)
    setDragEnd(null)
  }

  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  const wEnd = new Date(weekStart); wEnd.setDate(wEnd.getDate() + 6)
  const wLabel = `${weekStart.getDate()} ${months[weekStart.getMonth()].slice(0, 3)} - ${wEnd.getDate()} ${months[wEnd.getMonth()].slice(0, 3)} ${wEnd.getFullYear()}`

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm">
            {view === 'year' && exMonth === null && `Vista anual ${year}`}
            {view === 'year' && exMonth !== null && `${months[exMonth]} ${year}`}
            {view === 'week' && wLabel}
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          {view === 'year' && exMonth === null && <NavBtn value={year} onPrev={() => setYear(y => y - 1)} onNext={() => setYear(y => y + 1)} />}
          {view === 'year' && exMonth !== null && <NavBtn value={months[exMonth]} onPrev={() => { setExMonth(m => m === 0 ? 11 : m - 1); setSelDay(null); setDragStart(null); setDragEnd(null) }} onNext={() => { setExMonth(m => m === 11 ? 0 : m + 1); setSelDay(null); setDragStart(null); setDragEnd(null) }} wide />}
          {view === 'week' && <NavBtn value={wLabel} onPrev={prevWeek} onNext={nextWeek} wide />}
          <Button variant="secondary" icon="download">{t('export')}</Button>
          <button onClick={() => setShowAI(true)} className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.97]">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            {es ? 'Generar con IA' : 'Generate with AI'}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={es ? 'Turnos Asignados' : 'Assigned Shifts'} value={stats.totalShifts ?? 0} icon="event_available" change={`${es ? 'A\u00f1o' : 'Year'} ${year}`} />
        <StatCard label={es ? 'Empleados Activos' : 'Active Employees'} value={stats.activeEmployees ?? 0} icon="group" iconColor="text-primary bg-primary/10" />
        <StatCard label={es ? 'Cobertura' : 'Coverage'} value={stats.coverage ?? '0%'} icon="verified" iconColor="text-success bg-success/10" />
        <StatCard label={es ? 'Sin Cubrir' : 'Uncovered'} value={stats.uncovered ?? 0} icon="event_busy" iconColor="text-danger bg-danger/10" />
      </div>

      <Tabs items={[{ key: 'year', label: 'Año', icon: 'calendar_month' }, { key: 'week', label: 'Semana', icon: 'view_week' }]} active={view} onChange={v => { setView(v); setExMonth(null); setSelDay(null) }} />

      {view === 'year' && exMonth === null && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {Array.from({ length: 12 }).map((_, m) => (
            <MiniMonth key={m} year={year} month={m} shifts={shifts} months={months} onClick={() => { setExMonth(m); setSelDay(null) }} />
          ))}
        </div>
      )}

      {view === 'year' && exMonth !== null && (
        <div className="animate-expand-in relative" onMouseUp={handleDragEnd} onMouseLeave={() => { if (dragging) handleDragEnd() }}>
          <div className={`transition-all duration-300 ${selDay ? 'lg:mr-[360px]' : ''}`}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-white to-purple-50/50 border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setExMonth(null); setSelDay(null); setDragStart(null); setDragEnd(null) }} className="p-2 rounded-xl bg-white border border-gray-200 hover:border-primary/50 hover:shadow-md text-gray-500 hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{months[exMonth]} {year}</h3>
                      <p className="text-xs text-gray-400">Arrastra sobre los días para crear turnos</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs">
                    {[['Mañana','bg-blue-500'],['Tarde','bg-purple-500'],['Noche','bg-amber-500']].map(([l, c]) => (
                      <div key={l} className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${c}`} /><span className="text-gray-500 font-medium">{l}</span></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 select-none">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {DF.map((d, i) => <div key={i} className={`text-[11px] font-bold text-center py-1.5 rounded-lg ${i === 0 ? 'text-gray-300 bg-gray-50' : 'text-gray-400 bg-gray-50/50'}`}>{d}</div>)}
                </div>
                <MonthGrid year={year} month={exMonth} shifts={shifts} selDay={selDay} onDayClick={k => setSelDay(selDay === k ? null : k)} draggedDays={draggedDays} onDragStart={handleDragStart} onDragMove={handleDragMove} />
              </div>
            </div>
          </div>
          {selDay && <SidePanel dk={selDay} shifts={shifts} months={months} onClose={() => setSelDay(null)} onEdit={s => setEditShift(s)} />}
        </div>
      )}

      {view === 'week' && <WeekView weekStart={weekStart} shifts={shifts} onEdit={s => setEditShift(s)} />}

      <ShiftGeneratorModal open={showAI} onClose={() => { setShowAI(false); refreshSchedule() }} />
      <CreateShiftModal open={showCreate} onClose={() => { setShowCreate(false); setDragStart(null); setDragEnd(null); refreshSchedule() }} selectedDays={draggedDays} onCreated={handleShiftsCreated} />
      <EditShiftModal shift={editShift} onClose={() => { setEditShift(null); refreshSchedule() }} />
    </div>
  )
}

function NavBtn({ value, onPrev, onNext, wide }) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
      <button onClick={onPrev} className="p-2.5 hover:bg-gray-50 rounded-l-xl transition-colors">
        <span className="material-symbols-outlined text-[18px] text-gray-400">chevron_left</span>
      </button>
      <span className={`px-4 text-sm font-bold text-gray-900 ${wide ? 'min-w-[120px] text-center whitespace-nowrap' : 'tabular-nums'}`}>{value}</span>
      <button onClick={onNext} className="p-2.5 hover:bg-gray-50 rounded-r-xl transition-colors">
        <span className="material-symbols-outlined text-[18px] text-gray-400">chevron_right</span>
      </button>
    </div>
  )
}

function MiniMonth({ year, month, shifts, onClick, months }) {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const now = new Date()
  const isCur = now.getFullYear() === year && now.getMonth() === month
  const count = useMemo(() => {
    let c = 0
    for (let d = 1; d <= days; d++) c += (shifts[dk(year, month, d)] || []).length
    return c
  }, [year, month, shifts, days])

  return (
    <button onClick={onClick} className="group text-left bg-white rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98]">
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-bold ${isCur ? 'text-primary' : 'text-gray-900'}`}>{months[month]}</h4>
        <div className="flex items-center gap-1.5">
          {count > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{count}</span>}
          <span className="material-symbols-outlined text-[14px] text-gray-300 group-hover:text-primary transition-colors">open_in_full</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px text-center mb-1.5">
        {DH.map((d, i) => <div key={i} className="text-[8px] font-bold text-gray-300">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} className="h-[22px]" />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1, ds = shifts[dk(year, month, d)] || [], isToday = isCur && now.getDate() === d, isSun = new Date(year, month, d).getDay() === 0
          return (
            <div key={d} className={`h-[22px] flex flex-col items-center justify-center rounded-md text-[10px] relative ${isToday ? 'bg-primary text-white font-bold shadow-sm shadow-primary/30' : isSun ? 'text-gray-300' : 'text-gray-500'}`}>
              {d}
              {ds.length > 0 && !isToday && <div className="flex gap-[2px] absolute -bottom-[1px]">{[...new Set(ds.map(s => s.status === 'leave' ? 'gray' : s.status === 'absent' ? 'red' : s.color))].slice(0, 3).map((c, ci) => <div key={ci} className={`h-[3px] w-[3px] rounded-full ${dot[c] || dot.blue}`} />)}</div>}
            </div>
          )
        })}
      </div>
    </button>
  )
}

function MonthGrid({ year, month, shifts, selDay, onDayClick, draggedDays, onDragStart, onDragMove }) {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const now = new Date()
  const isCur = now.getFullYear() === year && now.getMonth() === month

  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
      {Array.from({ length: days }).map((_, i) => {
        const d = i + 1
        const key = dk(year, month, d)
        const ds = shifts[key] || []
        const isToday = isCur && now.getDate() === d
        const isSun = new Date(year, month, d).getDay() === 0
        const isSel = selDay === key
        const isDragged = draggedDays.includes(key)

        return (
          <div
            key={d}
            onMouseDown={e => { e.preventDefault(); onDragStart(d) }}
            onMouseEnter={() => onDragMove(d)}
            onClick={() => { if (draggedDays.length <= 1) onDayClick(key) }}
            className={`min-h-[90px] rounded-xl border-2 p-2 text-left transition-all duration-150 group cursor-pointer
              ${isDragged ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30 scale-[1.01]' : ''}
              ${isSel && !isDragged ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : ''}
              ${!isSel && !isDragged && ds.length > 0 ? 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md' : ''}
              ${!isSel && !isDragged && ds.length === 0 && !isSun ? 'border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200' : ''}
              ${isSun && !isSel && !isDragged ? 'border-gray-50 bg-gray-50/50' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-bold inline-flex items-center justify-center h-6 w-6 rounded-lg transition-colors
                ${isToday ? 'bg-primary text-white shadow-sm shadow-primary/30' : ''}
                ${(isSel || isDragged) && !isToday ? 'bg-primary/10 text-primary' : ''}
                ${isSun && !isToday && !isSel && !isDragged ? 'text-gray-300' : ''}
                ${!isToday && !isSel && !isDragged && !isSun ? 'text-gray-600 group-hover:text-gray-900' : ''}
              `}>{d}</span>
              {ds.length > 0 && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isSel ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-400'}`}>{ds.length}</span>}
              {isDragged && ds.length === 0 && <span className="material-symbols-outlined text-primary text-[14px]">add</span>}
            </div>
            <div className="space-y-1">
              {ds.slice(0, 3).map((s, si) => {
                const sc = s.status === 'leave' ? 'gray' : s.status === 'absent' ? 'red' : s.color
                return (
                <div key={si} className={`flex items-center gap-1 px-1.5 py-[3px] rounded-md border-l-2 ${cBg[sc]} ${cBd[sc]}`}>
                  {s.status !== 'scheduled' && <span className="material-symbols-outlined text-[10px]">{statusIcon[s.status]}</span>}
                  <span className={`text-[9px] font-semibold truncate ${cTx[sc]}`}>{s.employee.split(' ')[0]}</span>
                </div>
                )
              })}
              {ds.length > 3 && <span className="text-[9px] text-gray-400 pl-1 font-medium">+{ds.length - 3}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SidePanel({ dk: dateKey, shifts, onClose, months, onEdit }) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const ds = shifts[dateKey] || []

  return (
    <div className="hidden lg:block fixed right-0 top-0 h-full w-[350px] z-40 animate-slide-in">
      <div className="h-full bg-white border-l border-gray-200 shadow-2xl shadow-gray-300/50 flex flex-col">
        <div className="bg-gradient-to-b from-primary to-purple-800 px-6 py-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Detalle del día</span>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
            </div>
            <p className="text-2xl font-bold">{d}</p>
            <p className="text-sm text-white/80">{DF[date.getDay()]}, {months[m - 1]} {y}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100">
          {[{ l: 'Turnos', v: ds.filter(s => s.status === 'scheduled').length, i: 'event_available' }, { l: 'Personas', v: new Set(ds.map(s => s.employee)).size, i: 'group' }, { l: 'Permisos', v: ds.filter(s => s.status === 'leave').length, i: 'event_busy' }].map((s, i) => (
            <div key={i} className="text-center py-4 border-r last:border-r-0 border-gray-100">
              <span className="material-symbols-outlined text-[16px] text-gray-400 block mb-1">{s.i}</span>
              <p className="text-lg font-bold text-gray-900">{s.v}</p>
              <p className="text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {ds.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
              <p className="text-sm font-medium text-gray-400">Sin turnos</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Turnos asignados</p>
              {ds.map((s, i) => {
                const sc = s.status === 'leave' ? 'gray' : s.status === 'absent' ? 'red' : s.color
                const canEdit = s.status === 'scheduled' && s.id
                return (
                <div key={i} onClick={() => canEdit && onEdit(s)} className={`${cBg[sc]} rounded-xl p-4 border-l-4 ${cBd[sc]} transition-all relative ${canEdit ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''}`}>
                  {s.status === 'leave' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-bold rounded-full">
                      <span className="material-symbols-outlined text-[12px]">event_busy</span>
                      {s.leaveType === 'vacation' ? 'Vacaciones' : s.leaveType === 'medical' ? 'Incapacidad' : 'Permiso'}
                    </div>
                  )}
                  {s.status === 'absent' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full">
                      <span className="material-symbols-outlined text-[12px]">person_off</span>
                      Ausente
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">edit</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={s.employee} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${cTx[sc]}`}>{s.employee}</p>
                      <p className="text-[11px] text-gray-400">{s.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">{s.status === 'leave' ? 'event_busy' : 'schedule'}</span>
                      <span className={`text-xs font-bold ${cTx[sc]}`}>{s.status === 'leave' && !s.time ? (s.leaveReason || 'Permiso aprobado') : s.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${dot[sc]}`} />
                      <span className="text-[11px] font-medium text-gray-500">{s.type}</span>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WeekView({ weekStart, shifts, onEdit }) {
  const weekDays = Array.from({ length: 7 }).map((_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d })
  const allEmp = new Set()
  weekDays.forEach(d => { (shifts[dk(d.getFullYear(), d.getMonth(), d.getDate())] || []).forEach(s => allEmp.add(s.employee)) })
  const empList = [...allEmp]

  if (empList.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
      <div className="p-5 overflow-x-auto">
        <div className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 mb-3 min-w-[900px]">
          <div className="text-[10px] font-bold text-gray-400 uppercase self-end pb-1">Empleado</div>
          {weekDays.map((d, i) => {
            const isToday = new Date().toDateString() === d.toDateString()
            return (
              <div key={i} className={`text-center p-2.5 rounded-xl ${isToday ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-gray-50'}`}>
                <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-gray-400'}`}>{DF[d.getDay()]}</div>
                <div className={`text-base font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>
        <div className="py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block">event_busy</span>
          <p className="text-gray-500 font-medium">Sin turnos esta semana</p>
          <p className="text-xs text-gray-400 mt-1">Navega con las flechas para ver otras semanas</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden animate-fade-in">
      <div className="p-5 overflow-x-auto">
        <div className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 mb-3 min-w-[900px]">
          <div className="text-[10px] font-bold text-gray-400 uppercase self-end pb-1">Empleado</div>
          {weekDays.map((d, i) => {
            const isToday = new Date().toDateString() === d.toDateString()
            return (
              <div key={i} className={`text-center p-2.5 rounded-xl ${isToday ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-gray-50'}`}>
                <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-gray-400'}`}>{DF[d.getDay()]}</div>
                <div className={`text-base font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>
        <div className="space-y-2 min-w-[900px]">
          {empList.map(emp => (
            <div key={emp} className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 items-center">
              <div className="flex items-center gap-2.5">
                <Avatar name={emp} size="sm" />
                <p className="text-xs font-semibold text-gray-900 truncate">{emp}</p>
              </div>
              {weekDays.map((d, j) => {
                const key = dk(d.getFullYear(), d.getMonth(), d.getDate())
                const s = (shifts[key] || []).find(x => x.employee === emp)
                if (!s) return <div key={j} className="border-2 border-dashed border-gray-100 p-2.5 rounded-lg text-center"><span className="text-[10px] text-gray-300 font-medium">Libre</span></div>
                const sc = s.status === 'leave' ? 'gray' : s.status === 'absent' ? 'red' : s.color
                const canEdit = s.status === 'scheduled' && s.id
                return (
                  <div key={j} onClick={() => canEdit && onEdit(s)} className={`${cBg[sc]} border-l-[3px] ${cBd[sc]} p-2.5 rounded-lg text-xs transition-all ${canEdit ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}>
                    {s.status === 'leave' ? (
                      <>
                        <span className="flex items-center gap-1 font-bold text-gray-500"><span className="material-symbols-outlined text-[12px]">event_busy</span>Permiso</span>
                        <span className="text-[10px] text-gray-400">{s.leaveReason || s.leaveType}</span>
                      </>
                    ) : s.status === 'absent' ? (
                      <>
                        <span className="flex items-center gap-1 font-bold text-red-600"><span className="material-symbols-outlined text-[12px]">person_off</span>Ausente</span>
                        <span className="text-[10px] text-gray-400">{s.type}</span>
                      </>
                    ) : (
                      <>
                        <span className={`block font-bold ${cTx[sc]}`}>{s.time}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{s.type}</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditShiftModal({ shift, onClose }) {
  const [type, setType] = useState('morning')
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('14:00')
  const [color, setColor] = useState('blue')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (shift) {
      setType(shift.type || 'custom')
      setStartTime(shift.startTime?.slice(0, 5) || '06:00')
      setEndTime(shift.endTime?.slice(0, 5) || '14:00')
      setColor(shift.color || 'blue')
    }
  }, [shift])

  if (!shift) return null

  const presets = [
    { v: 'morning', l: 'Mañana', s: '06:00', e: '14:00', c: 'blue' },
    { v: 'afternoon', l: 'Tarde', s: '14:00', e: '22:00', c: 'purple' },
    { v: 'night', l: 'Noche', s: '22:00', e: '06:00', c: 'amber' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await scheduleService.updateShift(shift.id, { shiftType: type, startTime, endTime, color })
      toast.success('Turno actualizado')
      onClose()
    } catch { toast.error('Error al actualizar') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await scheduleService.deleteShift(shift.id)
      toast.success('Turno eliminado')
      onClose()
    } catch { toast.error('Error al eliminar') }
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary to-purple-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Editar Turno</h3>
              <p className="text-sm text-white/70">{shift.employee}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Tipo de Turno</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map(p => (
                <button key={p.v} onClick={() => { setType(p.v); setStartTime(p.s); setEndTime(p.e); setColor(p.c) }}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${type === p.v ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${dot[p.c]}`} />
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hora inicio</label>
              <input type="time" value={startTime} onChange={e => { setStartTime(e.target.value); setType('custom') }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hora fin</label>
              <input type="time" value={endTime} onChange={e => { setEndTime(e.target.value); setType('custom') }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Color</label>
            <div className="flex gap-2">
              {['blue', 'purple', 'amber'].map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ${dot[c]} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[16px]">delete</span>
            {deleting ? '...' : 'Eliminar'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all">
              {saving ? '...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
