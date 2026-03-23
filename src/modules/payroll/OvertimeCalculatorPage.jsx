import { useEffect, useMemo, useState } from 'react'
import { employees, payroll } from '../../api/services'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import StatCard from '../../components/ui/StatCard'
import Textarea from '../../components/ui/Textarea'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'

const multipliers = [
  { value: '', label: 'Auto' },
  { value: '1.25', label: 'Diurna 1.25x' },
  { value: '1.75', label: 'Nocturna 1.75x' },
  { value: '2', label: 'Dominical 2.0x' },
  { value: '2.5', label: 'Dominical nocturna 2.5x' },
]

export default function OvertimeCalculatorPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { formatCurrency } = useCurrency()
  const [form, setForm] = useState({
    employeeId: '',
    baseSalary: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '21:00',
    hours: '',
    multiplier: '',
    notes: '',
  })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data: employeesData } = useFetch(() => employees.list({ limit: 999 }), { key: 'calculator-employees' })
  const employeeList = useMemo(() => (
    Array.isArray(employeesData?.data) ? employeesData.data : Array.isArray(employeesData) ? employeesData : employeesData?.data?.data || []
  ), [employeesData])

  const employeeOptions = useMemo(() => [
    { value: '', label: es ? 'Selecciona un empleado' : 'Select employee' },
    ...employeeList.map((employee) => ({ value: String(employee.id), label: `${employee.name} · ${employee.roleTitle}` })),
  ], [employeeList, es])

  useEffect(() => {
    if (!form.employeeId) return
    const employee = employeeList.find((item) => String(item.id) === String(form.employeeId))
    if (!employee) return
    setForm((current) => ({
      ...current,
      baseSalary: String(employee.baseSalary || ''),
    }))
  }, [employeeList, form.employeeId])

  const handleCalculate = async () => {
    try {
      const nextResult = await payroll.calculateOvertime({
        ...form,
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        baseSalary: Number(form.baseSalary) || 0,
        hours: Number(form.hours) || 0,
        multiplier: form.multiplier ? Number(form.multiplier) : undefined,
      })
      setResult(nextResult)
    } catch {
      toast.error(es ? 'No fue posible calcular las horas extra' : 'Could not calculate overtime')
    }
  }

  const handleSave = async () => {
    if (!result || !form.employeeId) return
    setSaving(true)
    try {
      await payroll.addOvertimeBalance({
        employeeId: Number(form.employeeId),
        hours: result.hours,
        amount: result.amount,
        notes: form.notes || (es ? 'Registrado desde calculadora de horas extra.' : 'Registered from overtime calculator.'),
      })
      toast.success(es ? 'Registro enviado al balance de horas extra' : 'Record added to overtime balance')
    } catch {
      toast.error(es ? 'No se pudo guardar el registro' : 'Could not save record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          {es
            ? 'Calcula internamente horas extra, recargos estimados y costo empresa sin depender de integración DIAN.'
            : 'Calculate overtime internally, estimate surcharges and employer cost without DIAN integration.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={es ? 'Valor hora' : 'Hourly rate'} value={result ? formatCurrency(result.hourlyRate || 0) : formatCurrency(0)} icon="schedule" />
        <StatCard label={es ? 'Horas calculadas' : 'Calculated hours'} value={result ? `${result.hours}h` : '0h'} icon="timer" iconColor="text-blue-600 bg-blue-50" />
        <StatCard label={es ? 'Pago extra' : 'Overtime pay'} value={result ? formatCurrency(result.amount || 0) : formatCurrency(0)} icon="payments" iconColor="text-amber-600 bg-amber-50" valueClassName="text-2xl" />
        <StatCard label={es ? 'Costo empresa' : 'Employer cost'} value={result ? formatCurrency(result.estimatedEmployerCost || 0) : formatCurrency(0)} icon="account_balance_wallet" iconColor="text-success bg-success/10" valueClassName="text-2xl" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_360px]">
        <Card
          title={es ? 'Calculadora operativa' : 'Operational calculator'}
          subtitle={es ? 'Usa salario base, horario y fecha para estimar recargo y pago.' : 'Use base salary, schedule and date to estimate surcharge and payment.'}
        >
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Select label={es ? 'Empleado' : 'Employee'} value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} options={employeeOptions} />
            <Input label={es ? 'Salario base' : 'Base salary'} type="number" value={form.baseSalary} onChange={(event) => setForm((current) => ({ ...current, baseSalary: event.target.value }))} />
            <Input label={es ? 'Fecha' : 'Date'} type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <Select label={es ? 'Multiplicador' : 'Multiplier'} value={form.multiplier} onChange={(event) => setForm((current) => ({ ...current, multiplier: event.target.value }))} options={multipliers} />
            <Input label={es ? 'Hora inicio' : 'Start time'} type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
            <Input label={es ? 'Hora fin' : 'End time'} type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
            <Input className="md:col-span-2" label={es ? 'Horas manuales (opcional)' : 'Manual hours (optional)'} type="number" value={form.hours} onChange={(event) => setForm((current) => ({ ...current, hours: event.target.value }))} placeholder={es ? 'Déjalo vacío para calcular por horario' : 'Leave empty to calculate from schedule'} />
            <Textarea className="md:col-span-2" label={es ? 'Notas' : 'Notes'} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200/80 px-6 py-4">
            <Button icon="calculate" onClick={handleCalculate}>
              {es ? 'Calcular' : 'Calculate'}
            </Button>
            <Button variant="secondary" icon="playlist_add" onClick={handleSave} disabled={!result || !form.employeeId || saving}>
              {saving ? '...' : (es ? 'Registrar en balance' : 'Register in balance')}
            </Button>
          </div>
        </Card>

        <Card
          title={es ? 'Resultado y referencias' : 'Result and references'}
          subtitle={es ? 'El cálculo usa reglas internas y sugiere el costo estimado de empresa.' : 'The calculation uses internal rules and suggests estimated employer cost.'}
        >
          <div className="space-y-4 p-5">
            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{es ? 'Recargo detectado' : 'Detected surcharge'}</p>
              <p className="mt-2 text-3xl font-bold">{result ? `${result.multiplier}x` : '0x'}</p>
              <p className="mt-2 text-sm text-white/70">{result ? result.surchargeType : (es ? 'Calcula para ver detalle' : 'Calculate to view detail')}</p>
            </div>

            <div className="rounded-[--radius-lg] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{es ? 'Desglose' : 'Breakdown'}</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{es ? 'Base horas' : 'Base hours'}</span>
                  <strong className="text-slate-900">{result ? formatCurrency(result.breakdown.base || 0) : formatCurrency(0)}</strong>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{es ? 'Recargo' : 'Surcharge'}</span>
                  <strong className="text-slate-900">{result ? formatCurrency(result.breakdown.recargo || 0) : formatCurrency(0)}</strong>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{es ? 'Total' : 'Total'}</span>
                  <strong className="text-slate-900">{result ? formatCurrency(result.amount || 0) : formatCurrency(0)}</strong>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { title: es ? 'Diurna' : 'Day', value: '1.25x', desc: es ? 'Horas extra fuera de jornada diurna.' : 'Extra hours outside the day shift.' },
                { title: es ? 'Nocturna' : 'Night', value: '1.75x', desc: es ? 'Aplica cuando toca horario nocturno.' : 'Applies when the schedule reaches night hours.' },
                { title: es ? 'Dominical' : 'Sunday', value: '2.0x', desc: es ? 'Usa el domingo como fecha del cálculo.' : 'Use a Sunday date in the calculator.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[--radius-md] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{item.value}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
