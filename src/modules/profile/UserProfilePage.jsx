import { useState } from 'react'
import { auth } from '../../api/services'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Toggle from '../../components/ui/Toggle'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'

export default function UserProfilePage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const toast = useToast()
  const es = lang === 'es'
  const { data: meRaw } = useFetch(() => auth.me(), { key: 'auth-me' })
  const me = meRaw?.data?.data || meRaw?.data || {}

  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }))
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: false })

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const profileName = form.name || me.name || user?.name || ''
  const profileEmail = form.email || me.email || user?.email || ''

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)]">
          <div className="relative overflow-hidden rounded-[--radius-xl] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_24%),linear-gradient(140deg,_#082f2e,_#0f766e_60%,_#14532d)] p-6 text-white shadow-[--shadow-xl]">
            <div className="absolute inset-x-[-35%] top-10 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent opacity-30" />
            <div className="relative flex items-start gap-4">
              <Avatar name={profileName} size="lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                  {es ? 'Perfil de usuario' : 'User profile'}
                </p>
                <h1 className="mt-2 truncate text-3xl font-black tracking-tight">{profileName}</h1>
                <p className="mt-2 truncate text-sm text-white/74">{profileEmail}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge color="primary">{me.role || user?.role || 'employee'}</Badge>
                  <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/82 ring-1 ring-white/12">
                    {me.area || user?.area || (es ? 'Operación RH' : 'HR operations')}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/78">
              {es
                ? 'Aquí solo quedan los datos útiles del usuario y sus alertas. La configuración global ya no aparece en este perfil.'
                : 'Only useful user data and alert preferences live here. Global configuration is no longer mixed into this profile.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: es ? 'Rol actual' : 'Current role',
                value: String(me.role || user?.role || 'employee').toUpperCase(),
                icon: 'badge',
              },
              {
                label: es ? 'Área visible' : 'Visible area',
                value: me.area || user?.area || (es ? 'Sin área' : 'No area'),
                icon: 'apartment',
              },
              {
                label: es ? 'Canales activos' : 'Active channels',
                value: `${Number(notifs.email) + Number(notifs.push) + Number(notifs.weekly)}`,
                icon: 'notifications_active',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[--radius-lg] border border-slate-200 bg-white/92 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{item.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title={es ? 'Datos personales' : 'Personal details'}
          subtitle={es ? 'Edita los datos básicos de tu cuenta.' : 'Edit your account details.'}
          className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
        >
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Input label={t('fullName')} value={form.name} onChange={setField('name')} />
            <Input label={t('email')} type="email" value={profileEmail} disabled />
            <Input label={t('phone')} value={form.phone} onChange={setField('phone')} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200/80 px-6 py-5">
            <Button variant="secondary">{t('cancel')}</Button>
            <Button onClick={() => toast.success(es ? 'Perfil actualizado' : 'Profile updated')}>{t('save')}</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            title={es ? 'Alertas y notificaciones' : 'Alerts and notifications'}
            subtitle={es ? 'Define por dónde recibir avisos del flujo RH.' : 'Choose how to receive HR flow alerts.'}
            className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
          >
            <div className="space-y-5 p-6">
              <Toggle
                label={es ? 'Correo del proceso' : 'Process email'}
                description={es ? 'Entrevistas, firma, sanciones y novedades.' : 'Interviews, signatures, sanctions and incidents.'}
                checked={notifs.email}
                onChange={(value) => setNotifs((current) => ({ ...current, email: value }))}
              />
              <div className="border-t border-slate-100 pt-5">
                <Toggle
                  label={es ? 'Alertas push' : 'Push alerts'}
                  description={es ? 'Recordatorios y cambios de estado en tiempo real.' : 'Reminders and status changes in real time.'}
                  checked={notifs.push}
                  onChange={(value) => setNotifs((current) => ({ ...current, push: value }))}
                />
              </div>
              <div className="border-t border-slate-100 pt-5">
                <Toggle
                  label={es ? 'Resumen semanal' : 'Weekly digest'}
                  description={es ? 'Consolidado de pendientes y actividad.' : 'Digest of pending items and activity.'}
                  checked={notifs.weekly}
                  onChange={(value) => setNotifs((current) => ({ ...current, weekly: value }))}
                />
              </div>
            </div>
          </Card>

          <Card
            title={es ? 'Sesión y seguridad' : 'Session and security'}
            subtitle={es ? 'Referencia rápida del acceso actual.' : 'Quick reference for the current access.'}
            className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
          >
            <div className="space-y-3 p-6">
              <div className="rounded-[--radius-lg] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Método' : 'Method'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{es ? 'Cuenta interna demo / mock' : 'Internal demo / mock account'}</p>
              </div>
              <div className="rounded-[--radius-lg] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Estado' : 'Status'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{es ? 'Sesión activa' : 'Active session'}</p>
              </div>
              <p className="text-sm text-slate-500">
                {es
                  ? 'La configuración global de la empresa ya no aparece aquí para mantener el perfil enfocado en datos del usuario.'
                  : 'Global company settings no longer appear here to keep the profile focused on user data.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
