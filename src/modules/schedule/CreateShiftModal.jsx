import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { employees as empService, schedule as scheduleService } from '../../api/services'
import { useToast } from '../../context/ToastContext'
import { useLang } from '../../context/LangContext'

const presets = [
  { value: 'morning', label: { es: 'Mañana', en: 'Morning' }, start: '06:00', end: '14:00', color: 'blue' },
  { value: 'afternoon', label: { es: 'Tarde', en: 'Afternoon' }, start: '14:00', end: '22:00', color: 'purple' },
  { value: 'night', label: { es: 'Noche', en: 'Night' }, start: '22:00', end: '06:00', color: 'amber' },
  { value: 'custom', label: { es: 'Personalizado', en: 'Custom' }, start: '', end: '', color: 'blue' },
]
const dotColor = { blue: 'bg-blue-500', purple: 'bg-purple-500', amber: 'bg-amber-500' }
const MO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function CreateShiftModal({ open, onClose, selectedDays = [], onCreated }) {
  const [employees, setEmployees] = useState([])
  const [employee, setEmployee] = useState('')
  const [preset, setPreset] = useState('morning')
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('14:00')
  const [color, setColor] = useState('blue')
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const { lang } = useLang()
  const es = lang === 'es'

  useEffect(() => {
    if (open) empService.list().then(r => {
      const d = r?.data?.data || r?.data || r || []
      setEmployees(Array.isArray(d) ? d : [])
    }).catch(() => {})
  }, [open])

  const selectPreset = (p) => {
    setPreset(p.value)
    if (p.value !== 'custom') { setStartTime(p.start); setEndTime(p.end); setColor(p.color) }
  }

  const sorted = [...selectedDays].sort()

  const handleCreate = async () => {
    if (!employee) { toast.warning(es ? 'Selecciona un empleado' : 'Select an employee'); return }
    if (!startTime || !endTime) { toast.warning(es ? 'Define las horas' : 'Set the times'); return }
    const emp = employees.find(e => String(e.id) === employee)
    const shiftType = preset === 'custom' ? 'custom' : preset
    setSaving(true)
    try {
      const response = await scheduleService.createShifts({
        employeeId: employee, dates: sorted,
        shiftType, startTime, endTime, color,
      })
      const createdMap = response?.data?.data || response?.data || response
      if (createdMap && typeof createdMap === 'object' && Object.keys(createdMap).length > 0) {
        onCreated?.(createdMap)
      } else {
        const newShifts = {}
        sorted.forEach((dateKey, index) => {
          newShifts[dateKey] = [{
            id: `temp-${Date.now()}-${index}`,
            employee: emp.name,
            role: emp.roleTitle,
            shiftType,
            type: shiftType,
            time: `${startTime} - ${endTime}`,
            startTime,
            endTime,
            color,
            status: 'scheduled',
            date: dateKey,
          }]
        })
        onCreated?.(newShifts)
      }
      toast.success(`${sorted.length} ${es ? 'turno(s) creado(s) para' : 'shift(s) created for'} ${emp.name}`)
      setEmployee(''); setPreset('morning'); setStartTime('06:00'); setEndTime('14:00'); onClose()
    } catch { toast.error(es ? 'Error al crear turnos' : 'Error creating shifts') }
    finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={es ? 'Crear Turno' : 'Create Shift'} icon="add_circle" size="sm"
      subtitle={sorted.length ? `${sorted.length} ${es ? 'día(s)' : 'day(s)'}` : ''}
      footer={<><Button variant="secondary" onClick={onClose}>{es ? 'Cancelar' : 'Cancel'}</Button><Button icon="check" onClick={handleCreate} disabled={saving}>{saving ? '...' : (es ? 'Crear Turno' : 'Create Shift')}</Button></>}>
      <div className="p-6 space-y-5">
        <div className="rounded-[--radius-lg] border border-slate-200 bg-[linear-gradient(145deg,_rgba(15,118,110,0.08),_rgba(255,255,255,0.96))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{es ? 'Bloque seleccionado' : 'Selected block'}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sorted.map(dk => {
              const [, m, d] = dk.split('-').map(Number)
              return <span key={dk} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{d} {MO[m - 1]}</span>
            })}
          </div>
        </div>

        <Select label={es ? 'Empleado' : 'Employee'} value={employee} onChange={e => setEmployee(e.target.value)}
          options={[{ value: '', label: es ? 'Seleccionar...' : 'Select...' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} — ${e.roleTitle || ''}` }))]} />

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">{es ? 'Tipo de Turno' : 'Shift Type'}</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button key={p.value} onClick={() => selectPreset(p)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left text-sm ${preset === p.value ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}>
                {p.value !== 'custom' && <div className={`h-2.5 w-2.5 rounded-full ${dotColor[p.color]}`} />}
                {p.value === 'custom' && <span className="material-symbols-outlined text-[16px]">tune</span>}
                {p.label[lang] || p.label.es}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label={es ? 'Hora inicio' : 'Start time'}
            value={startTime}
            onChange={e => { setStartTime(e.target.value); setPreset('custom') }}
          />
          <Input
            type="time"
            label={es ? 'Hora fin' : 'End time'}
            value={endTime}
            onChange={e => { setEndTime(e.target.value); setPreset('custom') }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{es ? 'Color' : 'Color'}</label>
          <div className="flex gap-2">
            {['blue', 'purple', 'amber'].map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full ${dotColor[c]} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'}`} />
            ))}
          </div>
        </div>

        <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{es ? 'Vista previa del turno' : 'Shift preview'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${dotColor[color]}`} />
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {startTime} - {endTime}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {presets.find((item) => item.value === preset)?.label?.[lang] || presets.find((item) => item.value === preset)?.label?.es}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {sorted.length} {es ? 'día(s)' : 'day(s)'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
