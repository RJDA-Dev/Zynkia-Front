import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Toggle from '../../components/ui/Toggle'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import { auth, settings } from '../../api/services'
import useFetch from '../../hooks/useFetch'

export default function UserProfilePage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [tab, setTab] = useState('profile')

  const { data: meRaw } = useFetch(() => auth.me(), { key: 'auth-me' })
  const me = meRaw?.data?.data || meRaw?.data || {}

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: false })

  useEffect(() => {
    if (me?.name || user?.name) setForm({ name: me.name || user?.name || '', email: me.email || user?.email || '', phone: me.phone || '' })
  }, [me, user])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))

  const tabs = [
    { key: 'profile', label: es ? 'Perfil' : 'Profile', icon: 'person' },
    { key: 'localization', label: es ? 'Localización' : 'Localization', icon: 'public' },
    { key: 'security', label: es ? 'Seguridad' : 'Security', icon: 'security' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-6">
        <Avatar name={form.name || user?.name} size="lg" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{form.name || user?.name}</h2>
          <p className="text-gray-500">{form.email || user?.email}</p>
          <Badge color="primary" dot>{me.role || user?.role || 'Admin'}</Badge>
        </div>
      </div>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === 'profile' && (
        <div className="space-y-6">
          <Card title={t('personalInfo')} subtitle={es ? 'Datos básicos de tu cuenta.' : 'Basic account information.'}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('fullName')} value={form.name} onChange={set('name')} />
                <Input label={t('email')} type="email" value={form.email} icon="mail" disabled />
                <Input label={t('phone')} value={form.phone} onChange={set('phone')} icon="phone" placeholder="+57 300 000 0000" />
              </div>
            </div>
          </Card>
          <Card title={t('notifications')} subtitle={es ? 'Configura cómo recibes alertas.' : 'Configure how you receive alerts.'}>
            <div className="p-6 space-y-5">
              <Toggle label={es ? 'Notificaciones por correo' : 'Email notifications'} description={es ? 'Recibir alertas por email.' : 'Receive alerts by email.'} checked={notifs.email} onChange={v => setNotifs(n => ({ ...n, email: v }))} />
              <div className="border-t border-gray-100 pt-5">
                <Toggle label={es ? 'Notificaciones push' : 'Push notifications'} description={es ? 'Alertas en tiempo real.' : 'Real-time alerts.'} checked={notifs.push} onChange={v => setNotifs(n => ({ ...n, push: v }))} />
              </div>
              <div className="border-t border-gray-100 pt-5">
                <Toggle label={es ? 'Resumen semanal' : 'Weekly summary'} description={es ? 'Resumen cada lunes.' : 'Summary every Monday.'} checked={notifs.weekly} onChange={v => setNotifs(n => ({ ...n, weekly: v }))} />
              </div>
            </div>
          </Card>
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="secondary">{t('cancel')}</Button>
            <Button onClick={() => toast.success(es ? 'Perfil actualizado' : 'Profile updated')}>{t('save')}</Button>
          </div>
        </div>
      )}

      {tab === 'localization' && <LocalizationTab es={es} t={t} />}
      {tab === 'security' && <SecurityTab es={es} t={t} />}
    </div>
  )
}

function LocalizationTab({ es, t }) {
  const toast = useToast()
  const [form, setForm] = useState({ currency: 'COP', numberFormat: 'comma_decimal', timezone: 'America/Bogota', timeFormat: '24h', workHourReduction: 'true', overtimeCalc: 'true' })
  const { data, loading } = useFetch(() => settings.getLocalization(), { key: 'settings-loc' })

  useEffect(() => { if (data) setForm(prev => ({ ...prev, ...data })) }, [data])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? String(e) }))

  const handleSave = async () => {
    try { await settings.updateLocalization(form); toast.success(es ? 'Guardado' : 'Saved') }
    catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div>

  return (
    <div className="space-y-6">
      <Card title={es ? 'Moneda y Formato Regional' : 'Currency & Regional Format'} badge={<Badge color="success">{es ? 'Activo: Colombia' : 'Active: Colombia'}</Badge>}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select label={es ? 'Moneda Principal' : 'Main Currency'} value={form.currency} onChange={set('currency')} options={[
            { value: 'COP', label: 'Peso Colombiano (COP)' }, { value: 'USD', label: 'US Dollar (USD)' }, { value: 'PEN', label: 'Sol Peruano (PEN)' },
          ]} />
          <Select label={es ? 'Formato de Números' : 'Number Format'} value={form.numberFormat} onChange={set('numberFormat')} options={[
            { value: 'comma_decimal', label: es ? '1.234,56 (Colombia)' : '1.234,56 (Colombia)' }, { value: 'dot_decimal', label: '1,234.56' },
          ]} />
        </div>
      </Card>
      <Card title={es ? 'Zona Horaria y Hora' : 'Timezone & Time'}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label={es ? 'Zona Horaria' : 'Timezone'} value={form.timezone} onChange={set('timezone')} options={[
              { value: 'America/Bogota', label: '(GMT-05:00) Bogotá, Lima' }, { value: 'America/New_York', label: '(GMT-04:00) Eastern Time' }, { value: 'America/Mexico_City', label: '(GMT-06:00) Mexico City' },
            ]} />
            <Select label={es ? 'Formato de Hora' : 'Time Format'} value={form.timeFormat} onChange={set('timeFormat')} options={[
              { value: '24h', label: es ? '24 horas (14:30)' : '24 hours (14:30)' }, { value: '12h', label: es ? '12 horas (2:30 PM)' : '12 hours (2:30 PM)' },
            ]} />
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
            {es ? 'Hora actual' : 'Current time'}: {new Date().toLocaleTimeString(es ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: form.timeFormat === '12h' })}
          </p>
        </div>
      </Card>
      <Card title={es ? 'Cumplimiento Legal' : 'Legal Compliance'} badge={<Badge color="primary">{es ? 'Ley Colombiana' : 'Colombian Law'}</Badge>}>
        <div className="p-6 space-y-5">
          <Toggle label={es ? 'Reducción Jornada (Ley 2101)' : 'Work Hour Reduction (Law 2101)'} description={es ? 'Ajustar horas semanales máximas según reducción gradual.' : 'Adjust max weekly hours per gradual reduction.'} checked={form.workHourReduction === 'true'} onChange={v => setForm(f => ({ ...f, workHourReduction: String(v) }))} />
          <div className="border-t border-gray-100 pt-5">
            <Toggle label={es ? 'Cálculo Automático de Recargos' : 'Automatic Overtime Calculation'} description={es ? 'Recargos nocturnos, dominicales y festivos.' : 'Night, Sunday and holiday surcharges.'} checked={form.overtimeCalc === 'true'} onChange={v => setForm(f => ({ ...f, overtimeCalc: String(v) }))} />
          </div>
        </div>
      </Card>
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="secondary">{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </div>
  )
}

function SecurityTab({ es, t }) {
  const toast = useToast()
  const [form, setForm] = useState({ twoFactor: 'false', lockOnFailed: 'true', sessionTimeout: '30' })
  const { data, loading } = useFetch(() => settings.getSecurity(), { key: 'settings-sec' })

  useEffect(() => { if (data) setForm(prev => ({ ...prev, ...data })) }, [data])

  const handleSave = async () => {
    try { await settings.updateSecurity(form); toast.success(es ? 'Guardado' : 'Saved') }
    catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div>

  return (
    <div className="space-y-6">
      <Card title={es ? 'Autenticación' : 'Authentication'} subtitle={es ? 'Políticas de seguridad de acceso.' : 'Access security policies.'}>
        <div className="p-6 space-y-5">
          <Toggle label={t('twoFactorAuth')} description={es ? 'Segundo factor de verificación al iniciar sesión.' : 'Second verification factor when signing in.'} checked={form.twoFactor === 'true'} onChange={v => setForm(f => ({ ...f, twoFactor: String(v) }))} />
          <div className="border-t border-gray-100 pt-5">
            <Toggle label={es ? 'Bloqueo por intentos fallidos' : 'Lock on failed attempts'} description={es ? 'Bloquear cuenta después de 5 intentos fallidos.' : 'Lock account after 5 failed attempts.'} checked={form.lockOnFailed === 'true'} onChange={v => setForm(f => ({ ...f, lockOnFailed: String(v) }))} />
          </div>
          <div className="border-t border-gray-100 pt-5">
            <Input label={`${t('sessionTimeout')} (${es ? 'minutos' : 'minutes'})`} type="number" value={form.sessionTimeout} onChange={e => setForm(f => ({ ...f, sessionTimeout: e.target.value }))} className="max-w-xs" />
          </div>
        </div>
      </Card>
      <Card title={es ? 'Contraseña' : 'Password'}>
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-gray-400">lock</span>
            <p className="text-sm text-gray-600">{es ? 'La contraseña se gestiona desde el proveedor de identidad. Contacta al administrador.' : 'Password is managed by the identity provider. Contact your administrator.'}</p>
          </div>
        </div>
      </Card>
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="secondary">{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </div>
  )
}
