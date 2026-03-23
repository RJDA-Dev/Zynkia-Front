import { useState } from 'react'
import { employees, sanctions } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DatePicker from '../../components/ui/DatePicker'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatCard from '../../components/ui/StatCard'
import Textarea from '../../components/ui/Textarea'
import AppLoader from '../../components/ui/AppLoader'
import Avatar from '../../components/ui/Avatar'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'

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
  const { formatCurrency } = useCurrency()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    employeeId: '',
    type: 'tardanza',
    severity: 'leve',
    date: new Date().toISOString().split('T')[0],
    description: '',
    deductionHours: '',
    evidence: '',
  })

  const { data, loading, invalidate } = useFetch(() => sanctions.list(filter === 'all' ? {} : { status: filter }), { key: `sanctions-${filter}`, deps: [filter] })
  const { data: statsData } = useFetch(() => sanctions.stats(), { key: 'sanctions-stats' })
  const { data: empsData } = useFetch(() => employees.list(), { key: 'emps-list' })

  const list = data?.data || data || []
  const stats = statsData?.data || statsData || {}
  const empList = (empsData?.data || empsData || []).map((employee) => ({ value: String(employee.id), label: employee.name }))

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleCreate = async () => {
    if (!form.employeeId || !form.description) {
      toast.error(es ? 'Completa empleado y descripción.' : 'Complete employee and description.')
      return
    }

    setSubmitting(true)
    try {
      await sanctions.create({ ...form, deductionHours: Number(form.deductionHours) || 0 })
      toast.success(es ? 'Caso disciplinario registrado' : 'Disciplinary case created')
      setShowCreate(false)
      setForm({
        employeeId: '',
        type: 'tardanza',
        severity: 'leve',
        date: new Date().toISOString().split('T')[0],
        description: '',
        deductionHours: '',
        evidence: '',
      })
      invalidate()
    } catch {
      toast.error(es ? 'No fue posible registrar la sanción' : 'Could not create sanction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') await sanctions.confirm(id)
      else await sanctions.dismiss(id)
      toast.success(
        action === 'confirm'
          ? (es ? 'Validada por coordinación y notificada por correo' : 'Validated by coordinator and emailed')
          : (es ? 'Sanción desestimada' : 'Sanction dismissed')
      )
      invalidate()
    } catch {
      toast.error(es ? 'No se pudo actualizar el caso' : 'Could not update the case')
    }
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          {es ? 'Gestiona observaciones disciplinarias con validación del coordinador, acta y envío automático al correo del empleado.' : 'Manage disciplinary observations with coordinator validation, letter generation and automatic employee email delivery.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={es ? 'Casos' : 'Cases'} value={String(stats.total || 0)} icon="gavel" />
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(stats.pending || 0)} icon="hourglass_top" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Confirmadas' : 'Confirmed'} value={String(stats.confirmed || 0)} icon="mark_email_read" iconColor="text-red-600 bg-red-50" />
        <StatCard label={es ? 'Descuentos' : 'Deductions'} value={formatCurrency(stats.totalDeduction || 0)} icon="money_off" iconColor="text-red-600 bg-red-50" />
      </div>

      <div className="flex flex-col gap-3 rounded-[--radius-xl] border border-slate-200 bg-white/88 p-4 shadow-[--shadow-md] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: es ? 'Todas' : 'All' },
            { key: 'pending', label: es ? 'Pendientes' : 'Pending' },
            { key: 'confirmed', label: es ? 'Confirmadas' : 'Confirmed' },
            { key: 'dismissed', label: es ? 'Desestimadas' : 'Dismissed' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === item.key ? 'bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button icon="add" onClick={() => setShowCreate(true)}>
          {es ? 'Nuevo caso disciplinario' : 'New disciplinary case'}
        </Button>
      </div>

      {loading ? (
        <AppLoader
          inline
          label={es ? 'Cargando sanciones' : 'Loading sanctions'}
          detail={es ? 'Preparando casos, validaciones y notificaciones.' : 'Preparing cases, validations and notifications.'}
        />
      ) : list.length === 0 ? (
        <div className="rounded-[--radius-xl] border border-dashed border-slate-300 bg-white/88 px-6 py-16 text-center">
          <span className="material-symbols-outlined text-[42px] text-slate-300">gavel</span>
          <p className="mt-4 text-lg font-semibold text-slate-900">{es ? 'No hay sanciones registradas' : 'No sanctions registered'}</p>
          <p className="mt-2 text-sm text-slate-500">{es ? 'Cuando aparezcan casos disciplinarios, aquí verás validación, correo y soporte.' : 'When disciplinary cases appear, validation, email and supporting files will show here.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map((sanction) => {
            const workflow = [
              { label: es ? 'Reporte' : 'Reported', done: true },
              { label: es ? 'Validación coordinador' : 'Coordinator approval', done: Boolean(sanction.coordinatorApprovalAt) },
              { label: es ? 'Correo enviado' : 'Email sent', done: Boolean(sanction.emailSentAt) },
            ]

            return (
              <article key={sanction.id} className="overflow-hidden rounded-[--radius-xl] border border-slate-200 bg-white shadow-[--shadow-md]">
                <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,_rgba(239,68,68,0.08),_rgba(255,255,255,0.96))] px-5 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${sanction.severity === 'grave' ? 'bg-red-100 text-red-600' : sanction.severity === 'moderada' ? 'bg-amber-100 text-amber-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <span className="material-symbols-outlined text-[22px]">{typeIcons[sanction.type] || 'warning'}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Avatar name={sanction.employee?.name || '?'} size="sm" />
                          <p className="truncate text-lg font-bold tracking-tight text-slate-900">{sanction.employee?.name}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{sanction.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={sevColors[sanction.severity] || 'neutral'}>{sanction.severity}</Badge>
                      <Badge color={statusColors[sanction.status] || 'neutral'}>
                        {sanction.status === 'pending'
                          ? (es ? 'Pendiente' : 'Pending')
                          : sanction.status === 'confirmed'
                            ? (es ? 'Confirmada' : 'Confirmed')
                            : sanction.status === 'dismissed'
                              ? (es ? 'Desestimada' : 'Dismissed')
                              : sanction.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        `${typeOpts.find((item) => item.value === sanction.type)?.label || sanction.type} · ${sanction.date}`,
                        `${es ? 'Reportado por' : 'Reported by'} ${sanction.reporter?.name || '-'}`,
                        `${es ? 'Descuento' : 'Deduction'} ${sanction.deductionHours || 0}h / ${formatCurrency(Number(sanction.deductionAmount) || 0)}`,
                      ].map((item) => (
                        <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {es ? 'Flujo disciplinario' : 'Disciplinary workflow'}
                      </p>
                      <div className="mt-4 grid gap-3">
                        {workflow.map((step, index) => (
                          <div key={step.label} className="flex items-center gap-3 rounded-[--radius-md] bg-white px-4 py-3 ring-1 ring-slate-200">
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                              {step.done ? <span className="material-symbols-outlined text-[16px]">check</span> : index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                              {index === 1 && sanction.coordinatorApprovalAt && (
                                <p className="text-xs text-slate-500">{sanction.coordinatorName} · {sanction.coordinatorApprovalAt.slice(0, 16).replace('T', ' · ')}</p>
                              )}
                              {index === 2 && sanction.emailSentAt && (
                                <p className="text-xs text-slate-500">{sanction.emailSentAt.slice(0, 16).replace('T', ' · ')}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[--radius-lg] border border-slate-200 bg-white p-4">
                    <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Soporte disciplinario' : 'Sanction letter'}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {es ? 'Acta lista para exportar o revisar antes de la notificación.' : 'Letter ready to review or export before notification.'}
                      </p>
                    </div>
                    <Button variant="secondary" icon="description" onClick={() => window.open(sanction.letterUrl, '_blank', 'noopener,noreferrer')}>
                      {es ? 'Ver acta' : 'View letter'}
                    </Button>
                    {sanction.status === 'pending' ? (
                      <>
                        <Button variant="danger" icon="close" onClick={() => handleAction(sanction.id, 'dismiss')}>
                          {es ? 'Desestimar' : 'Dismiss'}
                        </Button>
                        <Button icon="mark_email_read" onClick={() => handleAction(sanction.id, 'confirm')}>
                          {es ? 'Validar y enviar correo' : 'Validate and send email'}
                        </Button>
                      </>
                    ) : (
                      <div className="rounded-[--radius-md] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
                        {sanction.emailSentAt
                          ? (es ? 'El empleado ya recibió el correo automático con la sanción.' : 'The employee already received the automatic email with the sanction.')
                          : (es ? 'Caso cerrado.' : 'Case closed.')}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {showCreate && (
        <Modal
          open
          title={es ? 'Nuevo caso disciplinario' : 'New disciplinary case'}
          subtitle={es ? 'Se registra, luego lo valida coordinación y se notifica automáticamente al empleado.' : 'It is recorded first, then validated by the coordinator and emailed to the employee automatically.'}
          icon="gavel"
          onClose={() => setShowCreate(false)}
          size="lg"
        >
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Select label={es ? 'Empleado' : 'Employee'} value={form.employeeId} onChange={setField('employeeId')} options={[{ value: '', label: es ? 'Seleccionar...' : 'Select...' }, ...empList]} />
            <Select label={es ? 'Tipo' : 'Type'} value={form.type} onChange={setField('type')} options={typeOpts} />
            <Select label={es ? 'Gravedad' : 'Severity'} value={form.severity} onChange={setField('severity')} options={sevOpts} />
            <DatePicker label={es ? 'Fecha del incidente' : 'Incident date'} value={form.date} onChange={(nextDate) => setForm((current) => ({ ...current, date: nextDate ? nextDate.toISOString().slice(0, 10) : '' }))} />
            <Input label={es ? 'Horas a descontar' : 'Hours to deduct'} type="number" value={form.deductionHours} onChange={setField('deductionHours')} />
            <Input label={es ? 'Evidencia resumida' : 'Evidence summary'} value={form.evidence} onChange={setField('evidence')} />
            <Textarea className="md:col-span-2" rows={5} label={es ? 'Descripción del caso' : 'Case description'} value={form.description} onChange={setField('description')} />
          </div>
          <div className="flex gap-3 border-t border-slate-200/80 px-6 py-5">
            <Button className="flex-1" variant="secondary" onClick={() => setShowCreate(false)}>{es ? 'Cancelar' : 'Cancel'}</Button>
            <Button className="flex-1" icon="gavel" onClick={handleCreate} disabled={submitting}>{submitting ? '...' : (es ? 'Registrar caso' : 'Create case')}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
