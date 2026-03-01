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
  const [swapShift, setSwapShift] = useState('')
  const [swapTarget, setSwapTarget] = useState('')
  const [swapReason, setSwapReason] = useState('')

  const { data: vacRaw } = useFetch(() => portal.vacationBalance(), { key: 'portal-vac-req' })
  const { data: histRaw } = useFetch(() => requests.list({ limit: 5 }), { key: 'my-requests-recent' })
  const { data: coworkers } = useFetch(() => portal.coworkers(), { key: 'coworkers' })
  const { data: mySchedule } = useFetch(() => portal.schedule(), { key: 'my-schedule-swap' })
  const { data: swapsRaw, refetch: refetchSwaps } = useFetch(() => portal.swaps(), { key: 'my-swaps' })
  const { data: homeData } = useFetch(() => portal.home(), { key: 'portal-home-req' })

  const vac = vacRaw?.data?.data || vacRaw?.data || vacRaw || {}
  const histPayload = histRaw?.data?.data || histRaw?.data || histRaw || {}
  const history = Array.isArray(histPayload) ? histPayload : (histPayload.data || [])
  const coworkerList = Array.isArray(coworkers) ? coworkers : (coworkers?.data || [])
  const shifts = Array.isArray(mySchedule) ? mySchedule : (mySchedule?.data || [])
  const swaps = Array.isArray(swapsRaw) ? swapsRaw : (swapsRaw?.data || [])
  const myEmployeeId = homeData?.employeeId || homeData?.data?.employeeId

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const days = form.startDate && form.endDate ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1) : 0

  const handleSubmit = async () => {
    if (!form.reason || !form.startDate || !form.endDate) { toast.error(es ? 'Completa los campos requeridos' : 'Fill required fields'); return }
    setSubmitting(true)
    try {
      const res = await requests.create({ type: TYPE_MAP[activeTab] || 'leave', reason: form.reason, startDate: form.startDate, endDate: form.endDate, comments: form.comments || undefined, days })
      const reqId = res?.id || res?.data?.id
      if (form.file && reqId) await requests.uploadAttachment(reqId, form.file)
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

  const handleCancelSwap = async (id) => {
    try {
      await portal.cancelSwap(id)
      toast.success(es ? 'Intercambio cancelado' : 'Swap cancelled')
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

  const statusConfig = {
    approved: { color: 'success', label: es ? 'Aprobado' : 'Approved', icon: 'check_circle' },
    accepted: { color: 'success', label: es ? 'Aceptado' : 'Accepted', icon: 'thumb_up' },
    rejected: { color: 'danger', label: es ? 'Rechazado' : 'Rejected', icon: 'cancel' },
    declined: { color: 'danger', label: es ? 'Declinado' : 'Declined', icon: 'thumb_down' },
    cancelled: { color: 'danger', label: es ? 'Cancelado' : 'Cancelled', icon: 'block' },
    pending: { color: 'warning', label: es ? 'Pendiente' : 'Pending', icon: 'hourglass_top' },
  }
  const statusBadge = (s) => { const c = statusConfig[s] || statusConfig.pending; return <Badge color={c.color}>{c.label}</Badge> }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('requests')}</h1>
        <p className="text-gray-500 mt-1 text-sm">{es ? 'Crea solicitudes y gestiona intercambios de turno.' : 'Create requests and manage shift swaps.'}</p>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={v => { setActiveTab(v); setForm(f => ({ ...f, reason: '' })) }} />

      {activeTab === 'intercambio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Create swap form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">swap_horiz</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{es ? 'Solicitar Intercambio' : 'Request Swap'}</h3>
                  <p className="text-xs text-gray-400">{es ? 'Selecciona tu turno y el companero' : 'Select your shift and coworker'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{es ? 'Tu turno' : 'Your shift'}</label>
                <select value={swapShift} onChange={e => setSwapShift(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option value="">{es ? 'Selecciona turno...' : 'Select shift...'}</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.date} — {s.startTime?.slice(0,5)}-{s.endTime?.slice(0,5)} ({s.shiftType})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{es ? 'Companero' : 'Coworker'}</label>
                <select value={swapTarget} onChange={e => setSwapTarget(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option value="">{es ? 'Selecciona...' : 'Select...'}</option>
                  {coworkerList.map(c => <option key={c.id} value={c.id}>{c.name} — {c.roleTitle}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{es ? 'Motivo' : 'Reason'} <span className="text-gray-400 font-normal text-xs">({es ? 'Opcional' : 'Optional'})</span></label>
                <textarea value={swapReason} onChange={e => setSwapReason(e.target.value)} rows={2} placeholder={es ? 'Ej: Tengo una cita medica ese dia...' : 'E.g.: I have a medical appointment...'} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <Button icon="swap_horiz" onClick={handleSwap} disabled={submitting || !swapShift || !swapTarget} className="w-full">{es ? 'Enviar Solicitud' : 'Send Request'}</Button>
            </div>
          </div>

          {/* Swap list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{es ? 'Mis Intercambios' : 'My Swaps'}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{swaps.length}</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {swaps.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-200">swap_horiz</span>
                  <p className="text-gray-400 text-sm mt-2">{es ? 'Sin intercambios' : 'No swaps yet'}</p>
                </div>
              ) : swaps.map(sw => {
                const isRequester = sw.requesterId === myEmployeeId || sw.requester?.id === myEmployeeId
                const isTarget = sw.targetId === myEmployeeId || sw.target?.id === myEmployeeId
                const isPending = sw.status === 'pending'
                return (
                  <div key={sw.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    {/* Direction indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      {isRequester ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                          {es ? 'Enviada' : 'Sent'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
                          {es ? 'Recibida' : 'Received'}
                        </span>
                      )}
                      {statusBadge(sw.status)}
                    </div>
                    {/* People */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={sw.requester?.name} size="xs" />
                      <span className="text-sm font-medium text-gray-900">{sw.requester?.name}</span>
                      <span className="material-symbols-outlined text-gray-300 text-base">east</span>
                      <Avatar name={sw.target?.name} size="xs" />
                      <span className="text-sm font-medium text-gray-900">{sw.target?.name}</span>
                    </div>
                    {/* Shift info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {sw.requesterShift?.date} — {sw.requesterShift?.startTime?.slice(0,5)}-{sw.requesterShift?.endTime?.slice(0,5)}
                      <span className="capitalize text-gray-400">({sw.requesterShift?.shiftType})</span>
                    </div>
                    {sw.reason && <p className="text-xs text-gray-400 italic mb-2">"{sw.reason}"</p>}
                    {/* Actions */}
                    {isPending && isRequester && (
                      <button onClick={() => handleCancelSwap(sw.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        {es ? 'Cancelar' : 'Cancel'}
                      </button>
                    )}
                    {isPending && isTarget && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRespondSwap(sw.id, true)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          {es ? 'Aceptar' : 'Accept'}
                        </button>
                        <button onClick={() => handleRespondSwap(sw.id, false)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          {es ? 'Rechazar' : 'Decline'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Motivo' : 'Reason'}</label>
                  <select value={form.reason} onChange={set('reason')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">{es ? 'Seleccione...' : 'Select...'}</option>
                    {(reasons[activeTab] || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-900 text-sm font-semibold block mb-1.5">{t('startDate')}</label>
                    <input type="date" value={form.startDate} onChange={set('startDate')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Fecha fin' : 'End date'}</label>
                    <input type="date" value={form.endDate} onChange={set('endDate')} min={form.startDate} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                {days > 0 && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">info</span>
                    {es ? 'Duracion:' : 'Duration:'} <span className="font-bold text-primary">{days} {days === 1 ? (es ? 'dia' : 'day') : (es ? 'dias' : 'days')}</span>
                  </div>
                )}
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Comentarios' : 'Comments'} <span className="text-gray-400 font-normal text-xs">({es ? 'Opcional' : 'Optional'})</span></label>
                  <textarea value={form.comments} onChange={set('comments')} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-y outline-none focus:ring-2 focus:ring-primary" placeholder={es ? 'Detalles adicionales...' : 'Additional details...'} />
                </div>
                <div>
                  <label className="text-gray-900 text-sm font-semibold block mb-1.5">{es ? 'Adjunto' : 'Attachment'} <span className="text-gray-400 font-normal text-xs">({es ? 'Opcional' : 'Optional'})</span></label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer transition-colors">
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
          <div className="lg:col-span-4 space-y-4">
            {activeTab === 'vacaciones' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
