import { useState, useEffect } from 'react'
import { settings } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import Toggle from '../../components/ui/Toggle'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

export default function SecurityPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [form, setForm] = useState({ twoFactor: 'false', lockOnFailed: 'true', sessionTimeout: '30' })

  const { data, loading } = useFetch(() => settings.getSecurity(), { key: 'settings-sec' })

  useEffect(() => { if (data) setForm(prev => ({ ...prev, ...data })) }, [data])

  const handleSave = async () => {
    try {
      await settings.updateSecurity(form)
      toast.success(es ? 'Guardado' : 'Saved')
    } catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card title={es ? 'Autenticación' : 'Authentication'} subtitle={es ? 'Configura las políticas de seguridad de acceso.' : 'Configure access security policies.'}>
        <div className="p-6 space-y-5">
          <Toggle label={t('twoFactorAuth')} description={es ? 'Requiere un segundo factor de verificación al iniciar sesión.' : 'Requires a second verification factor when signing in.'} checked={form.twoFactor === 'true'} onChange={(v) => setForm(f => ({ ...f, twoFactor: String(v) }))} />
          <div className="border-t border-gray-100 pt-5">
            <Toggle label={es ? 'Bloqueo por intentos fallidos' : 'Lock on failed attempts'} description={es ? 'Bloquear cuenta después de 5 intentos fallidos de inicio de sesión.' : 'Lock account after 5 failed login attempts.'} checked={form.lockOnFailed === 'true'} onChange={(v) => setForm(f => ({ ...f, lockOnFailed: String(v) }))} />
          </div>
          <div className="border-t border-gray-100 pt-5">
            <Input label={`${t('sessionTimeout')} (${es ? 'minutos' : 'minutes'})`} type="number" value={form.sessionTimeout} onChange={e => setForm(f => ({ ...f, sessionTimeout: e.target.value }))} className="max-w-xs" />
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
