import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import { requests, portal } from '../../api/services'
import useFetch from '../../hooks/useFetch'

const TYPE_MAP = { permisos: 'leave', incapacidades: 'medical', vacaciones: 'vacation' }

export default function NewRequestPage() {
  const [activeTab, setActiveTab] = useState('permisos')
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ reason: '', startDate: '', endDate: '', comments: '' })

  const { data: vacRaw } = useFetch(() => portal.vacationBalance(), { key: 'portal-vac-req' })
  const { data: histRaw } = useFetch(() => requests.list({ limit: 3 }), { key: 'my-requests-recent' })

  const vac = vacRaw?.data?.data || vacRaw?.data || {}
  const histPayload = histRaw?.data?.data || histRaw?.data || {}
  const history = Array.isArray(histPayload) ? histPayload : (histPayload.data || [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const days = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0

  const handleSubmit = async () => {
    if (!form.reason || !form.startDate || !form.endDate) {
      toast.error(es ? 'Completa los campos requeridos' : 'Fill required fields')
      return
    }
    setSubmitting(true)
    try {
      await requests.create({
        type: TYPE_MAP[activeTab] || 'leave',
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate,
        comments: form.comments || undefined,
        days,
      })
      toast.success(es ? 'Solicitud enviada' : 'Request submitted')
      navigate('/employee')
    } catch (e) {
      toast.error(e?.response?.data?.message || (es ? 'Error al enviar' : 'Error submitting'))
    } finally { setSubmitting(false) }
  }

  const tabs = [
    { key: 'permisos', label: es ? 'Permisos' : 'Leave' },
    { key: 'incapacidades', label: t('medical') },
    { key: 'vacaciones', label: t('vacation') },
  ]

  const reasons = {
    permisos: [es ? 'Asuntos Personales' : 'Personal matters', es ? 'Cita Médica' : 'Medical appointment', es ? 'Trámites Administrativos' : 'Administrative', es ? 'Otro' : 'Other'],
    incapacidades: [es ? 'Enfermedad General' : 'General illness', es ? 'Accidente Laboral' : 'Work accident', es ? 'Maternidad/Paternidad' : 'Maternity/Paternity'],
    vacaciones: [es ? 'Vacaciones Anuales' : 'Annual vacation', es ? 'Días Compensatorios' : 'Compensatory days'],
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('newRequest')}</h1>
        <p className="text-gray-500 mt-1">{es ? 'Seleccione el tipo de solicitud y complete los detalles.' : 'Select the request type and fill in the details.'}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Tabs items={tabs} active={activeTab} onChange={v => { setActiveTab(v); setForm(f => ({ ...f, reason: '' })) }} />
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="text-gray-900 text-sm font-semibold block mb-2">{es ? 'Motivo' : 'Reason'}</label>
                <select value={form.reason} onChange={set('reason')}
                  className="w-full h-12 rounded-lg border-gray-200 bg-gray-50 px-4 focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">{es ? 'Seleccione...' : 'Select...'}</option>
                  {(reasons[activeTab] || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-2">{t('startDate')}</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')}
                    className="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-2">{es ? 'Fecha fin' : 'End date'}</label>
                  <input type="date" value={form.endDate} onChange={set('endDate')} min={form.startDate}
                    className="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              {days > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-sm text-gray-900">{es ? 'Duración:' : 'Duration:'} <span className="font-bold text-primary">{days} {days === 1 ? (es ? 'día' : 'day') : (es ? 'días' : 'days')}</span></p>
                </div>
              )}
              <div>
                <label className="text-gray-900 text-sm font-semibold block mb-2">{es ? 'Comentarios' : 'Comments'} <span className="text-gray-400 font-normal">({es ? 'Opcional' : 'Optional'})</span></label>
                <textarea value={form.comments} onChange={set('comments')}
                  className="w-full min-h-[100px] p-4 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary resize-y outline-none"
                  placeholder={es ? 'Detalles adicionales...' : 'Additional details...'} />
              </div>
            </div>
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>{t('cancel')}</Button>
              <Button icon="send" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '...' : t('submitRequest')}
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-gray-900 font-bold text-lg">{es ? 'Balance de Vacaciones' : 'Vacation Balance'}</h3>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600"><span className="material-symbols-outlined">beach_access</span></div>
              <div>
                <span className="text-2xl font-bold text-gray-900">{vac.available ?? vac.remaining ?? '—'}</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{es ? 'Días Disponibles' : 'Days Available'}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">history</span></div>
              <div>
                <span className="text-2xl font-bold text-gray-900">{vac.used ?? '—'}</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{es ? 'Usados este año' : 'Used this year'}</p>
              </div>
            </div>
          </div>
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
              <h3 className="text-gray-900 font-bold text-lg">{es ? 'Historial Reciente' : 'Recent History'}</h3>
              {history.slice(0, 3).map((req, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="size-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{req.reason || req.type}</p>
                    <p className="text-xs text-gray-400">{req.startDate}</p>
                  </div>
                  <Badge color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}>
                    {req.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : req.status === 'rejected' ? (es ? 'Rechazado' : 'Rejected') : (es ? 'Pendiente' : 'Pending')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
