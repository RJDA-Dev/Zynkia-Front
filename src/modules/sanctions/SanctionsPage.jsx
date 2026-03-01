import { useState } from 'react'
import { sanctions, employees } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import DatePicker from '../../components/ui/DatePicker'

const typeOpts = [
  { value: 'tardanza', label: 'Tardanza' },
  { value: 'ausencia', label: 'Ausencia injustificada' },
  { value: 'abandono', label: 'Abandono de puesto' },
  { value: 'conducta', label: 'Conducta inapropiada' },
  { value: 'otro', label: 'Otro' },
]
const sevOpts = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'grave', label: 'Grave' },
]
const sevColors = { leve: 'warning', moderada: 'info', grave: 'danger' }
const statusColors = { pending: 'warning', confirmed: 'danger', appealed: 'info', dismissed: 'neutral' }
const typeIcons = { tardanza: 'schedule', ausencia: 'person_off', abandono: 'exit_to_app', conducta: 'warning', otro: 'info' }

export default function SanctionsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const fc = useCurrency().formatCurrency
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ employeeId: '', type: 'tardanza', severity: 'leve', date: new Date().toISOString().split('T')[0], description: '', deductionHours: '', evidence: '' })

  const { data, loading, invalidate } = useFetch(() => sanctions.list(filter === 'all' ? {} : { status: filter }), { key: `sanctions-${filter}`, deps: [filter] })
  const { data: statsData } = useFetch(() => sanctions.stats(), { key: 'sanctions-stats' })
  const { data: empsData } = useFetch(() => employees.list(), { key: 'emps-list' })

  const list = data?.data || data || []
  const stats = statsData?.data || statsData || {}
  const empList = (empsData?.data || empsData || []).map(e => ({ value: e.id, label: e.name }))

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v?.target?.value ?? v }))

  const handleCreate = async () => {
    if (!form.employeeId || !form.description) return toast.error(es ? 'Complete los campos' : 'Fill required fields')
    try {
      await sanctions.create({ ...form, deductionHours: Number(form.deductionHours) || 0 })
      toast.success(es ? 'Sanción registrada' : 'Sanction created')
      setShowCreate(false)
      setForm({ employeeId: '', type: 'tardanza', severity: 'leve', date: new Date().toISOString().split('T')[0], description: '', deductionHours: '', evidence: '' })
      invalidate()
    } catch { toast.error('Error') }
  }

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') await sanctions.confirm(id)
      else await sanctions.dismiss(id)
      toast.success(action === 'confirm' ? (es ? 'Sanción confirmada' : 'Confirmed') : (es ? 'Sanción desestimada' : 'Dismissed'))
      invalidate()
    } catch { toast.error('Error') }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{es ? 'Sanciones y Descuentos' : 'Sanctions & Deductions'}</h1>
          <p className="text-gray-500 mt-1">{es ? 'Gestión de observaciones, sanciones y descuentos por turno.' : 'Manage observations, sanctions and shift deductions.'}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon="add">{es ? 'Reportar' : 'Report'}</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={es ? 'Total' : 'Total'} value={String(stats.total || 0)} icon="gavel" />
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(stats.pending || 0)} icon="hourglass_top" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Confirmadas' : 'Confirmed'} value={String(stats.confirmed || 0)} icon="check_circle" iconColor="text-red-600 bg-red-50" />
        <StatCard label={es ? 'Total Descuentos' : 'Total Deductions'} value={fc(stats.totalDeduction || 0)} icon="money_off" iconColor="text-red-600 bg-red-50" />
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all', label: es ? 'Todas' : 'All' },
          { key: 'pending', label: es ? 'Pendientes' : 'Pending' },
          { key: 'confirmed', label: es ? 'Confirmadas' : 'Confirmed' },
          { key: 'dismissed', label: es ? 'Desestimadas' : 'Dismissed' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">verified_user</span>
          <p className="text-gray-400">{es ? 'Sin sanciones registradas' : 'No sanctions recorded'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.severity === 'grave' ? 'bg-red-100 text-red-600' : s.severity === 'moderada' ? 'bg-amber-100 text-amber-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  <span className="material-symbols-outlined">{typeIcons[s.type] || 'warning'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{s.employee?.name}</span>
                    <Badge color={sevColors[s.severity] || 'neutral'}>{s.severity}</Badge>
                    <Badge color={statusColors[s.status] || 'neutral'}>
                      {s.status === 'pending' ? (es ? 'Pendiente' : 'Pending') : s.status === 'confirmed' ? (es ? 'Confirmada' : 'Confirmed') : s.status === 'dismissed' ? (es ? 'Desestimada' : 'Dismissed') : s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {typeOpts.find(t => t.value === s.type)?.label || s.type} — {s.date}
                    {s.reporter && <span> — {es ? 'Reportado por' : 'Reported by'} {s.reporter.name}</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                  {(s.deductionHours > 0 || s.deductionAmount > 0) && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[14px]">money_off</span>
                      {es ? 'Descuento' : 'Deduction'}: {s.deductionHours}h — {fc(Number(s.deductionAmount) || 0)}
                    </div>
                  )}
                </div>
                {s.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAction(s.id, 'dismiss')}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors">
                      {es ? 'Desestimar' : 'Dismiss'}
                    </button>
                    <button onClick={() => handleAction(s.id, 'confirm')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition-colors">
                      {es ? 'Confirmar' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal open title={es ? 'Reportar Sanción' : 'Report Sanction'} icon="gavel" onClose={() => setShowCreate(false)} size="md">
          <div className="p-6 space-y-4">
            <Select label={es ? 'Empleado' : 'Employee'} value={form.employeeId} onChange={set('employeeId')} options={[{ value: '', label: es ? 'Seleccionar...' : 'Select...' }, ...empList]} />
            <div className="grid grid-cols-2 gap-4">
              <Select label={es ? 'Tipo' : 'Type'} value={form.type} onChange={set('type')} options={typeOpts} />
              <Select label={es ? 'Gravedad' : 'Severity'} value={form.severity} onChange={set('severity')} options={sevOpts} />
            </div>
            <DatePicker label={es ? 'Fecha del incidente' : 'Incident date'} value={form.date} onChange={set('date')} />
            <Input label={es ? 'Descripción' : 'Description'} value={form.description} onChange={set('description')} placeholder={es ? 'Detalle de la observación...' : 'Observation details...'} />
            <Input label={es ? 'Horas a descontar' : 'Hours to deduct'} value={form.deductionHours} onChange={set('deductionHours')} type="number" placeholder="0" />
            <Input label={es ? 'Evidencia / Notas' : 'Evidence / Notes'} value={form.evidence} onChange={set('evidence')} placeholder={es ? 'Notas adicionales...' : 'Additional notes...'} />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">{es ? 'Cancelar' : 'Cancel'}</Button>
              <Button onClick={handleCreate} className="flex-1" icon="gavel">{es ? 'Registrar Sanción' : 'Submit Sanction'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
