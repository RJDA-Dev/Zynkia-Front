import { useState, useEffect } from 'react'
import { settings } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

export default function GeneralPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [form, setForm] = useState({ companyName: '', nit: '', address: '', phone: '' })

  const { data, loading } = useFetch(() => settings.getGeneral(), { key: 'settings-general' })

  useEffect(() => { if (data) setForm(prev => ({ ...prev, ...data })) }, [data])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      await settings.updateGeneral(form)
      toast.success(es ? 'Guardado' : 'Saved')
    } catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card title={es ? 'Información de la Empresa' : 'Company Information'} subtitle={es ? 'Datos generales de tu organización.' : 'General organization data.'}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('companyName')} value={form.companyName} onChange={set('companyName')} />
            <Input label="NIT" value={form.nit} onChange={set('nit')} />
            <Input label={t('address')} value={form.address} onChange={set('address')} />
            <Input label={t('phone')} value={form.phone} onChange={set('phone')} />
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
