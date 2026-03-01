import { useState, useEffect, useMemo, useRef } from 'react'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import { useLang } from '../../context/LangContext'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { useToast } from '../../context/ToastContext'
import { schedule as scheduleService, departments as deptService, employees as empService } from '../../api/services'

const shiftColors = {
  blue: { bg: 'bg-blue-50 border-blue-400', text: 'text-blue-700', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50 border-purple-400', text: 'text-purple-700', dot: 'bg-purple-500' },
  amber: { bg: 'bg-amber-50 border-amber-400', text: 'text-amber-800', dot: 'bg-amber-500' },
}

function getNextWeek() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1) + 7)
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  return [mon.toISOString().split('T')[0], fri.toISOString().split('T')[0]]
}

const DEFAULT_PROMPT = `Instrucciones adicionales para la IA:
- Distribuir turnos de forma equitativa
- Priorizar turnos de mañana para empleados con hijos
- Evitar turnos nocturnos consecutivos`

export default function ShiftGeneratorModal({ open, onClose }) {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()

  // State
  const [step, setStep] = useState(0) // 0=config, 1=preview
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [goal, setGoal] = useState('equity')
  const [restHours, setRestHours] = useState(12)
  const [avoidOT, setAvoidOT] = useState(true)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState(null)

  // Employees
  const [depts, setDepts] = useState([])
  const [allEmps, setAllEmps] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [draggedEmp, setDraggedEmp] = useState(null)

  useEffect(() => {
    if (!open) return
    const [f, t] = getNextWeek()
    setDateFrom(f); setDateTo(t)
    setStep(0); setResult(null); setSelected([]); setSearch('')
    setCustomPrompt(''); setShowPrompt(false)
    // Load departments + all employees
    deptService.list().then(r => {
      const list = r?.data?.data || r?.data || []
      setDepts(list)
    }).catch(() => {})
    empService.list().then(r => {
      const raw = r?.data?.data || r?.data || {}
      const emps = Array.isArray(raw) ? raw : (raw.data || [])
      setAllEmps(emps)
    }).catch(() => {})
  }, [open])

  const available = useMemo(() => {
    const selIds = new Set(selected.map(e => e.id))
    let list = allEmps.filter(e => !selIds.has(e.id))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e => e.name?.toLowerCase().includes(q) || e.department?.name?.toLowerCase().includes(q))
    }
    return list
  }, [allEmps, selected, search])

  const grouped = useMemo(() => {
    const map = {}
    available.forEach(e => {
      const dept = e.department?.name || 'Sin departamento'
      if (!map[dept]) map[dept] = []
      map[dept].push(e)
    })
    return map
  }, [available])

  const addEmp = (emp) => setSelected(prev => [...prev, emp])
  const removeEmp = (id) => setSelected(prev => prev.filter(e => e.id !== id))
  const addAll = () => setSelected(prev => [...prev, ...available])
  const removeAll = () => setSelected([])

  // Drag handlers
  const handleDragStart = (e, emp, from) => {
    setDraggedEmp({ emp, from })
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDropToSelected = (e) => {
    e.preventDefault()
    if (draggedEmp?.from === 'available') addEmp(draggedEmp.emp)
    setDraggedEmp(null)
  }
  const handleDropToAvailable = (e) => {
    e.preventDefault()
    if (draggedEmp?.from === 'selected') removeEmp(draggedEmp.emp.id)
    setDraggedEmp(null)
  }
  const allowDrop = (e) => e.preventDefault()

  // Dates
  const weekDates = useMemo(() => {
    const dates = []
    const start = new Date(dateFrom + 'T12:00:00')
    const end = new Date(dateTo + 'T12:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1))
      dates.push(d.toISOString().split('T')[0])
    return dates
  }, [dateFrom, dateTo])

  const handleGenerate = async () => {
    if (!selected.length) { toast.error(es ? 'Selecciona al menos un empleado' : 'Select at least one employee'); return }
    setGenerating(true); setResult(null)
    try {
      const res = await scheduleService.generateAI({
        goal, minRestHours: restHours, avoidOvertime: avoidOT,
        weekStart: dateFrom, weekEnd: dateTo,
        employeeIds: selected.map(e => e.id),
        customPrompt: customPrompt || undefined,
      })
      const data = res?.data?.data || res?.data || res
      setResult(data)
      setStep(1)
      toast.success(es ? `${data.shifts?.length || 0} turnos generados` : `${data.shifts?.length || 0} shifts generated`)
    } catch { toast.error(es ? 'Error al generar' : 'Error generating') }
    finally { setGenerating(false) }
  }

  const handleApply = async () => {
    if (!result?.shifts?.length) return
    setApplying(true)
    try {
      const grouped = {}
      result.shifts.forEach(s => {
        const k = `${s.employeeId}-${s.shiftType}`
        if (!grouped[k]) grouped[k] = { ...s, dates: [] }
        grouped[k].dates.push(s.date)
      })
      for (const g of Object.values(grouped)) {
        await scheduleService.createShifts({
          employeeId: g.employeeId, dates: g.dates,
          shiftType: g.shiftType, startTime: g.startTime, endTime: g.endTime, color: g.color,
        })
      }
      toast.success(es ? 'Turnos aplicados' : 'Shifts applied')
      onClose()
    } catch { toast.error(es ? 'Error al aplicar' : 'Error applying') }
    finally { setApplying(false) }
  }

  const resultEmps = result?.shifts ? [...new Map(result.shifts.map(s => [s.employeeId, s])).values()] : []

  const goals = [
    { key: 'cost', icon: 'savings', label: es ? 'Costo' : 'Cost', color: 'blue' },
    { key: 'equity', icon: 'balance', label: es ? 'Equidad' : 'Equity', color: 'purple' },
    { key: 'seniority', icon: 'star', label: es ? 'Antigüedad' : 'Seniority', color: 'amber' },
  ]

  return (
    <Modal open={open} onClose={() => { onClose(); setResult(null) }}
      title={es ? 'Generador de Turnos IA' : 'AI Shift Generator'}
      subtitle={step === 0 ? (es ? 'Configura y selecciona empleados' : 'Configure and select employees') : (es ? 'Revisa los turnos generados' : 'Review generated shifts')}
      icon="smart_toy" size="full"
      footer={step === 0 ? (
        <>
          <Button variant="secondary" onClick={() => { onClose(); setResult(null) }}>{es ? 'Cancelar' : 'Cancel'}</Button>
          <button onClick={handleGenerate} disabled={generating || !selected.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-primary px-6 py-2.5 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50">
            {generating ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{es ? 'Generando...' : 'Generating...'}</>
              : <><span className="material-symbols-outlined text-[18px]">auto_awesome</span>{es ? 'Generar Turnos' : 'Generate Shifts'}</>}
          </button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={() => setStep(0)}>{es ? '← Volver' : '← Back'}</Button>
          <Button icon="check" onClick={handleApply} disabled={!result?.shifts?.length || applying}>
            {applying ? (es ? 'Aplicando...' : 'Applying...') : (es ? `Aplicar ${result?.shifts?.length || 0} Turnos` : `Apply ${result?.shifts?.length || 0} Shifts`)}
          </Button>
        </>
      )}>

      {step === 0 ? (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left: Config */}
          <div className="w-full lg:w-[320px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/30 overflow-y-auto p-5 space-y-4">
            {/* Date range */}
            <div>
              <label className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-2 block">
                {es ? 'Rango de Fechas' : 'Date Range'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 mb-0.5 block">{es ? 'Desde' : 'From'}</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-0.5 block">{es ? 'Hasta' : 'To'}</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{weekDates.length} {es ? 'días' : 'days'}</p>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Goal chips */}
            <div>
              <label className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-2 block">{es ? 'Objetivo' : 'Goal'}</label>
              <div className="flex gap-2">
                {goals.map(g => (
                  <button key={g.key} onClick={() => setGoal(g.key)}
                    className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium
                      ${goal === g.key ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <span className="material-symbols-outlined text-[18px]">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Constraints */}
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-700">{es ? 'Descanso mínimo' : 'Min rest'}</span>
                  <span className="text-xs font-bold text-primary">{restHours}h</span>
                </div>
                <input type="range" min="8" max="16" value={restHours} onChange={e => setRestHours(+e.target.value)} className="w-full h-1.5 accent-primary cursor-pointer" />
              </div>
              <Toggle label={es ? 'Evitar horas extra' : 'Avoid overtime'} checked={avoidOT} onChange={() => setAvoidOT(!avoidOT)} />
            </div>

            <div className="h-px bg-gray-200" />

            {/* Custom prompt toggle */}
            <div>
              <button onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-purple-800 transition-colors">
                <span className="material-symbols-outlined text-[16px]">{showPrompt ? 'expand_less' : 'edit_note'}</span>
                {es ? 'Personalizar instrucciones IA' : 'Customize AI instructions'}
              </button>
              {showPrompt && (
                <div className="mt-2">
                  <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                    placeholder={DEFAULT_PROMPT}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none placeholder:text-gray-400" />
                  <p className="text-[10px] text-gray-400 mt-1">{es ? 'La IA mantendrá las restricciones base + tus instrucciones' : 'AI will keep base constraints + your instructions'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Kanban employee selection */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Available pool */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 overflow-hidden"
              onDragOver={allowDrop} onDrop={handleDropToAvailable}>
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">groups</span>
                  <span className="text-sm font-bold text-gray-700">{es ? 'Disponibles' : 'Available'}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{available.length}</span>
                </div>
                {available.length > 0 && (
                  <button onClick={addAll} className="text-[11px] font-semibold text-primary hover:text-purple-800">
                    {es ? 'Agregar todos →' : 'Add all →'}
                  </button>
                )}
              </div>
              <div className="px-4 py-2 border-b border-gray-100 bg-white shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined text-[16px] text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={es ? 'Buscar empleado...' : 'Search employee...'}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {Object.entries(grouped).map(([dept, emps]) => (
                  <div key={dept}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">{dept}</p>
                    <div className="space-y-1">
                      {emps.map(emp => (
                        <div key={emp.id} draggable onDragStart={e => handleDragStart(e, emp, 'available')}
                          onClick={() => addEmp(emp)}
                          className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary/40 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group">
                          <Avatar name={emp.name} size="xs" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{emp.name}</p>
                            <p className="text-[10px] text-gray-400">{emp.roleTitle || emp.position || ''}</p>
                          </div>
                          <span className="material-symbols-outlined text-[14px] text-gray-300 group-hover:text-primary transition-colors">arrow_forward</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {available.length === 0 && (
                  <div className="text-center py-8 text-gray-300">
                    <span className="material-symbols-outlined text-3xl mb-1 block">group_off</span>
                    <p className="text-xs">{es ? 'Todos seleccionados' : 'All selected'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected pool */}
            <div className="flex-1 flex flex-col overflow-hidden bg-primary/[0.02]"
              onDragOver={allowDrop} onDrop={handleDropToSelected}>
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">how_to_reg</span>
                  <span className="text-sm font-bold text-gray-700">{es ? 'Seleccionados' : 'Selected'}</span>
                  <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full">{selected.length}</span>
                </div>
                {selected.length > 0 && (
                  <button onClick={removeAll} className="text-[11px] font-semibold text-red-500 hover:text-red-700">
                    {es ? 'Quitar todos' : 'Remove all'}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {selected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 border-2 border-dashed border-gray-200 rounded-xl p-6">
                    <span className="material-symbols-outlined text-4xl mb-2">drag_indicator</span>
                    <p className="text-xs text-center">{es ? 'Arrastra empleados aquí o haz clic para agregar' : 'Drag employees here or click to add'}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selected.map(emp => (
                      <div key={emp.id} draggable onDragStart={e => handleDragStart(e, emp, 'selected')}
                        className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border-2 border-primary/20 shadow-sm cursor-grab active:cursor-grabbing transition-all group">
                        <Avatar name={emp.name} size="xs" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{emp.name}</p>
                          <p className="text-[10px] text-gray-400">{emp.department?.name || ''}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeEmp(emp.id) }}
                          className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 1: Preview */
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-3 border-b border-gray-200 bg-white gap-2 shrink-0">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">calendar_month</span>
              {dateFrom} → {dateTo}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 font-medium">
                {result?.shifts?.length || 0} {es ? 'turnos' : 'shifts'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {resultEmps.length} {es ? 'empleados' : 'employees'}
              </span>
              {result?.source && (
                <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                  {result.source === 'ai' ? 'Gemini AI' : 'Fallback'}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {result?.shifts?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-gray-400 uppercase font-medium pb-2 pr-3 sticky left-0 bg-gray-50 min-w-[160px] z-10">{es ? 'Empleado' : 'Employee'}</th>
                      {weekDates.map(d => {
                        const dt = new Date(d + 'T12:00:00')
                        const dayName = dt.toLocaleDateString(es ? 'es' : 'en', { weekday: 'short' })
                        return <th key={d} className="text-center p-1.5 min-w-[90px]">
                          <div className="bg-gray-100 rounded-lg p-1.5">
                            <div className="text-[10px] text-gray-500 font-semibold uppercase">{dayName}</div>
                            <div className="text-sm font-bold text-gray-900">{d.split('-')[2]}</div>
                          </div>
                        </th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {resultEmps.map(emp => (
                      <tr key={emp.employeeId} className="group">
                        <td className="py-1.5 pr-3 sticky left-0 bg-gray-50 z-10">
                          <div className="flex items-center gap-2">
                            <Avatar name={emp.employeeName} size="sm" />
                            <p className="text-sm font-medium text-gray-900 truncate">{emp.employeeName}</p>
                          </div>
                        </td>
                        {weekDates.map(d => {
                          const shift = result.shifts.find(s => s.employeeId === emp.employeeId && s.date === d)
                          const c = shift ? (shiftColors[shift.color] || shiftColors.blue) : null
                          return <td key={d} className="p-1">
                            {shift ? (
                              <div className={`${c.bg} border-l-4 p-2 rounded-lg text-xs`}>
                                <span className={`block font-bold ${c.text}`}>{shift.startTime}-{shift.endTime}</span>
                                <span className="text-[10px] text-gray-500">{shift.shiftType}</span>
                              </div>
                            ) : (
                              <div className="border border-dashed border-gray-200 p-2 rounded-lg text-center">
                                <span className="text-[10px] text-gray-300">—</span>
                              </div>
                            )}
                          </td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <span className="material-symbols-outlined text-6xl mb-3">event_busy</span>
                <p className="text-sm text-gray-400">{es ? 'No se generaron turnos' : 'No shifts generated'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
