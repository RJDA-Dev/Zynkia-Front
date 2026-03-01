import { useState, useEffect } from 'react'
import { settings } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Toggle from '../../components/ui/Toggle'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

export default function LocalizationPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [form, setForm] = useState({ currency: 'COP', numberFormat: 'comma_decimal', timezone: 'America/Bogota', timeFormat: '24h', workHourReduction: 'true', overtimeCalc: 'true' })

  const { data, loading } = useFetch(() => settings.getLocalization(), { key: 'settings-loc' })

  useEffect(() => { if (data) setForm(prev => ({ ...prev, ...data })) }, [data])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? String(e) }))

  const handleSave = async () => {
    try {
      await settings.updateLocalization(form)
      toast.success(es ? 'Guardado' : 'Saved')
    } catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card title={es ? 'Moneda y Formato Regional' : 'Currency & Regional Format'} subtitle={es ? 'Configura la moneda base para reportes y nómina.' : 'Configure base currency for reports and payroll.'} badge={<Badge color="success">{es ? 'Activo: Colombia' : 'Active: Colombia'}</Badge>}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label={es ? 'Moneda Principal' : 'Main Currency'} value={form.currency} onChange={set('currency')} options={[
              { value: 'COP', label: 'Peso Colombiano (COP)' },
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'PEN', label: 'Sol Peruano (PEN)' },
            ]} />
            <Select label={es ? 'Formato de Números' : 'Number Format'} value={form.numberFormat} onChange={set('numberFormat')} options={[
              { value: 'comma_decimal', label: es ? '1.234,56 (Estándar Colombia)' : '1.234,56 (Colombia Standard)' },
              { value: 'dot_decimal', label: '1,234.56' },
            ]} />
          </div>
        </div>
      </Card>

      <Card title={t('timezone')} subtitle={es ? 'Define la hora del sistema para registros de asistencia y cortes.' : 'Set system time for attendance records and cutoffs.'}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label={es ? 'Zona Horaria Predeterminada' : 'Default Timezone'} value={form.timezone} onChange={set('timezone')} options={[
              { value: 'America/Bogota', label: '(GMT-05:00) Bogotá, Lima, Quito' },
              { value: 'America/New_York', label: '(GMT-04:00) Eastern Time (US)' },
              { value: 'America/Mexico_City', label: '(GMT-06:00) Mexico City' },
            ]} />
            <Select label={es ? 'Formato de Hora' : 'Time Format'} value={form.timeFormat} onChange={set('timeFormat')} options={[
              { value: '24h', label: es ? '24 horas (14:30)' : '24 hours (14:30)' },
              { value: '12h', label: es ? '12 horas (2:30 PM)' : '12 hours (2:30 PM)' },
            ]} />
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
            {es ? 'Hora actual' : 'Current time'}: {new Date().toLocaleTimeString(es ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: form.timeFormat === '12h' })}
          </p>
        </div>
      </Card>

      <Card title={es ? 'Cumplimiento Legal y Laboral' : 'Legal & Labor Compliance'} subtitle={es ? 'Ajustes automáticos basados en la legislación laboral vigente.' : 'Automatic adjustments based on current labor legislation.'} badge={<Badge color="primary">{es ? 'Ley Colombiana' : 'Colombian Law'}</Badge>}>
        <div className="p-6 space-y-5">
          <Toggle label={es ? 'Reducción Jornada Laboral (Ley 2101)' : 'Work Hour Reduction (Law 2101)'} description={es ? 'Ajustar automáticamente las horas semanales máximas según el cronograma de reducción gradual.' : 'Automatically adjust maximum weekly hours per gradual reduction schedule.'} checked={form.workHourReduction === 'true'} onChange={(v) => setForm(f => ({ ...f, workHourReduction: String(v) }))} />
          <div className="border-t border-gray-100 pt-5">
            <Toggle label={es ? 'Cálculo Automático de Recargos' : 'Automatic Overtime Calculation'} description={es ? 'Calcular automáticamente recargos nocturnos, dominicales y festivos.' : 'Automatically calculate night, Sunday and holiday surcharges.'} checked={form.overtimeCalc === 'true'} onChange={(v) => setForm(f => ({ ...f, overtimeCalc: String(v) }))} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </div>
  )
}
