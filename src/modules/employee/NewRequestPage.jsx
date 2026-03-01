import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Avatar from '../../components/ui/Avatar'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import { requests, portal } from '../../api/services'
import useFetch from '../../hooks/useFetch'

const TYPE_MAP = { permisos: 'leave', incapacidades: 'medical', vacaciones: 'vacation', extras: 'overtime' }

export default function NewRequestPage() {
  const [activeTab, setActiveTab] = useState('permisos')
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ reason: '', startDate: '', endDate: '', comments: '', file: null })
  // Swap state
  const [swapShift, setSwapShift] = useState('')
  const [swapTarget, setSwapTarget] = useState('')
  const [swapReason, setSwapReason] = useState('')

  const { data: vacRaw } = useFetch(() => portal.vacationBalance(), { key: 'portal-vac-req' })
  const { data: histRaw } = useFetch(() => requests.list({ limit: 5 }), { key: 'my-requests-recent' })
  const { data: coworkers } = useFetch(() => portal.coworkers(), { key: 'coworkers' })
  const { data: mySchedule } = useFetch(() => portal.schedule(), { key: 'my-schedule-swap' })
  const { data: swapsRaw, refetch: refetchSwaps } = useFetch(() => portal.swaps(), { key: 'my-swaps' })

  const vac = vacRaw?.data?.data || vacRaw?.data || vacRaw || {}
  const histPayload = histRaw?.data?.data || histRaw?.data || histRaw || {}
  const history = Array.isArray(histPayload) ? histPayload : (histPayload.data || [])
  const coworkerList = Array.isArray(coworkers) ? coworkers : (coworkers?.data || [])
  const shifts = Array.isArray(mySchedule) ? mySchedule : (mySchedule?.data || [])
  const swaps = Array.isArray(swapsRaw) ? swapsRaw : (swapsRaw?.data || [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const days = form.startDate && form.endDate ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1) : 0

  const handleSubmit = async () => {
    if (!form.reason || !form.startDate || !form.endDate) { toast.error(es ? 'Completa los campos requeridos' : 'Fill required fields'); return }
    setSubmitting(true)
    try {
      await requests.create({ type: TYPE_MAP[activeTab] || 'leave', reason: form.reason, startDate: form.startDate, endDate: form.endDate, comments: form.comments || undefined, days })
      toast.success(es ? 'Solicitud enviada' : 'Request submitted')
      setForm({ reason: '', startDate: '', endDate: '', comments: '', file: null })
    } catch (e) { toast.error(e?.response?.data?.message || 'Error') }
    finally { setSubmitting(false) }
  }

  const handleSwap = async () => {
    if (!swapShift || !swapTarget) { toast.error(es ? 'Selecciona turno y companero' : 'Select shift and coworker'); return }
    setSubmitting(true)
    try {
      await portal.createSwap({ shiftId: swapShift, targetId: swapTarget, reason: swapReason })
      toast.success(es ? 'Solicitud de intercambio enviada' : 'Swap request sent')
      setSwapShift(''); setSwapTarget(''); setSwapReason('')
      refetchSwaps()
    } catch (e) { toast.error(e?.response?.data?.message || 'Error') }
    finally { setSubmitting(false) }
  }

  const handleRespondSwap = async (id, accept) => {
    try {
      await portal.respondSwap(id, accept)
      toast.success(accept ? (es ? 'Intercambio aceptado' : 'Swap accepted') : (es ? 'Intercambio rechazado' : 'Swap declined'))
      refetchSwaps()
    } catch { toast.error('Error') }
  }

  const tabs = [
    { key: 'permisos', label: es ? 'Permisos' : 'Leave', icon: 'assignment_turned_in' },
    { key: 'incapacidades', label: es ? 'Medica' : 'Medical', icon: 'medical_services' },
    { key: 'vacaciones', label: es ? 'Vacaciones' : 'Vacation', icon: 'beach_access' },
    { key: 'extras', label: es ? 'Horas Extra' : 'Overtime', icon: 'more_time' },
    { key: 'intercambio', label: es ? 'Intercambio' : 'Swap', icon: 'swap_horiz' },
  ]

  const reasons = {
    permisos: [es ? 'Asuntos Personales' : 'Personal', es ? 'Cita Medica' : 'Medical appt', es ? 'Tramites' : 'Administrative', es ? 'Otro' : 'Other'],
    incapacidades: [es ? 'Enfermedad General' : 'General illness', es ? 'Accidente Laboral' : 'Work accident', es ? 'Maternidad/Paternidad' : 'Maternity/Paternity'],
    vacaciones: [es ? 'Vacaciones Anuales' : 'Annual vacation', es ? 'Dias Compensatorios' : 'Compensatory days'],
    extras: [es ? 'Proyecto urgente' : 'Urgent project', es ? 'Cierre de mes' : 'Month-end', es ? 'Soporte critico' : 'Critical support', es ? 'Otro' : 'Other'],
  }

  const statusBadge = (s) => {
    const c = s === 'approved' || s === 'accepted' ? 'success' : s === 'rejected' || s === 'declined' ? 'danger' : 'warning'
    const l = s === 'approved' ? (es ? 'Aprobado' : 'Approved') : s === 'accepted' ? (es ? 'Aceptado' : 'Accepted') : s === 'rejected' ? (es ? 'Rechazado' : 'Rejected') : s === 'declined' ? (es ? 'Declinado' : 'Declined') : (es ? 'Pendiente' : 'Pending')
    return <Badge color={c}>{l}</Badge>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('requests')}</h1>
        <p className="text-gray-500 mt-1 text-sm">{es ? 'Crea solicitudes y gestiona intercambios de turno.' : 'Create requests and manage shift swaps.'}</p>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={v => { setActiveTab(v); setForm(f => ({ ...f, reason: '' })) }} />

      {/* Swap tab */}
      {activeTab === 'intercambio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">{es ? 'Solicitar intercambio' : 'Request swap'}</h3>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{es ? 'Tu turno' : 'Your shift'}</label>
              <select value={swapShift} onChange={e => setSwapShift(e.target.value)} className="w-full h-10 rounded-lg border-gray-200 bg-gray-50 px-3 text-sm">
                <option value="">{es ? 'Selecciona turno...' : 'Select shift...'}</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.date} — {s.startTime?.slice(0,5)}-{s.endTime?.slice(0,5)} ({s.shiftType})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{es ? 'Companero' : 'Coworker'}</label>
              <select value={swapTarget} onChange={e => setSwapTarget(e.target.value)} className="w-full h-10 rounded-lg border-gray-200 bg-gray-50 px-3 text-sm">
                <option value="">{es ? 'Selecciona...' : 'Select...'}</option>
                {coworkerList.map(c => <option key={c.id} value={c.id}>{c.name} — {c.roleTitle}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{es ? 'Motivo' : 'Reason'}</label>
              <textarea value={swapReason} onChange={e => setSwapReason(e.target.value)} rows={2} placeholder={es ? 'Opcional...' : 'Optional...'} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none" />
            </div>
            <Button icon="swap_horiz" onClick={handleSwap} disabled={submitting}>{es ? 'Enviar solicitud' : 'Send request'}</Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{es ? 'Mis intercambios' : 'My swaps'}</h3>
            {swaps.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">{es ? 'Sin intercambios' : 'No swaps'}</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {swaps.map(sw => (
                  <div key={sw.id} className="p-3 rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={sw.requester?.name} size="xs" />
                        <span className="text-sm font-medium">{sw.requester?.name}</span>
                        <span className="material-symbols-outlined text-gray-400 text-sm">swap_horiz</span>
                        <Avatar name={sw.target?.name} size="xs" />
                        <span className="text-sm font-medium">{sw.target?.name}</span>
                      </div>
                      {statusBadge(sw.status)}
                    </div>
                    <p className="text-xs text-gray-500">{sw.requesterShift?.date} — {sw.requesterShift?.startTime?.slice(0,5)}-{sw.requesterShift?.endTime?.slice(0,5)}</p>
                    {sw.status === 'pending' && sw.target?.id && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRespondSwap(sw.id, true)} className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium">{es ? 'Aceptar' : 'Accept'}</button>
                        <button onClick={() => handleRespondSwap(sw.id, false)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">{es ? 'Rechazar' : 'Decline'}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Request form tabs */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Motivo' : 'Reason'}</label>
                  <select value={form.reason} onChange={set('reason')} className="w-full h-11 rounded-lg border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-primary">
                    <option value="">{es ? 'Seleccione...' : 'Select...'}</option>
                    {(reasons[activeTab] || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-900 text-sm font-semibold block mb-1.5">{t('startDate')}</label>
                    <input type="date" value={form.startDate} onChange={set('startDate')} className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Fecha fin' : 'End date'}</label>
                    <input type="date" value={form.endDate} onChange={set('endDate')} min={form.startDate} className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                {days > 0 && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">info</span>
                    {es ? 'Duracion:' : 'Duration:'} <span className="font-bold text-primary">{days} {days === 1 ? (es ? 'dia' : 'day') : (es ? 'dias' : 'days')}</span>
                  </div>
                )}
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Comentarios' : 'Comments'} <span className="text-gray-400 font-normal text-xs">({es ? 'Opcional' : 'Optional'})</span></label>
                  <textarea value={form.comments} onChange={set('comments')} rows={3} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-y outline-none focus:ring-2 focus:ring-primary" placeholder={es ? 'Detalles adicionales...' : 'Additional details...'} />
                </div>
                {/* File attachment */}
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Adjunto' : 'Attachment'} <span className="text-gray-400 font-normal text-xs">({es ? 'Opcional' : 'Optional'})</span></label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-gray-400">upload_file</span>
                    <div className="flex-1">
                      {form.file ? (
                        <p className="text-sm font-medium text-gray-900">{form.file.name} <span className="text-gray-400">({(form.file.size / 1024).toFixed(0)} KB)</span></p>
                      ) : (
                        <p className="text-sm text-gray-500">{es ? 'Haz clic para adjuntar archivo (PDF, imagen)' : 'Click to attach file (PDF, image)'}</p>
                      )}
                    </div>
                    {form.file && <button type="button" onClick={e => { e.preventDefault(); setForm(f => ({ ...f, file: null })) }} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))} />
                  </label>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => navigate(-1)}>{t('cancel')}</Button>
                <Button icon="send" onClick={handleSubmit} disabled={submitting}>{submitting ? '...' : (es ? 'Enviar' : 'Submit')}</Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {activeTab === 'vacaciones' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{es ? 'Balance Vacaciones' : 'Vacation Balance'}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><span className="material-symbols-outlined text-xl">beach_access</span></div>
                  <div><span className="text-2xl font-bold text-gray-900">{vac.available ?? '—'}</span><p className="text-[10px] text-gray-400 uppercase font-semibold">{es ? 'Disponibles' : 'Available'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined text-xl">history</span></div>
                  <div><span className="text-2xl font-bold text-gray-900">{vac.used ?? '—'}</span><p className="text-[10px] text-gray-400 uppercase font-semibold">{es ? 'Usados' : 'Used'}</p></div>
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{es ? 'Recientes' : 'Recent'}</h3>
                <div className="space-y-2">
                  {history.slice(0, 4).map((req, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{req.reason || req.type}</p>
                        <p className="text-[10px] text-gray-400">{req.startDate}</p>
                      </div>
                      {statusBadge(req.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
