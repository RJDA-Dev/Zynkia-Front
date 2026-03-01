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

const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const tf = localStorage.getItem('timeFormat') || '24h'
  if (tf === '12h') {
    const hr = parseInt(h)
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }
  return `${h}:${m}`
}

export default function NewRequestPage() {
  const [activeTab, setActiveTab] = useState('permisos')
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ reason: '', startDate: '', endDate: '', comments: '', file: null, startTime: '', endTime: '' })
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
  const myHourlyRate = homeData?.data?.stats?.hourlyRate || homeData?.stats?.hourlyRate || 0

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const days = form.startDate && form.endDate ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1) : 0

  const handleSubmit = async () => {
    if (!form.reason || !form.startDate || !form.endDate) { toast.error(es ? 'Completa los campos requeridos' : 'Fill required fields'); return }
    if (activeTab === 'extras' && (!form.startTime || !form.endTime)) { toast.error(es ? 'Indica hora inicio y fin' : 'Set start and end time'); return }
    setSubmitting(true)
    try {
      const payload = { type: TYPE_MAP[activeTab] || 'leave', reason: form.reason, startDate: form.startDate, endDate: form.endDate, comments: form.comments || undefined, days }
      if (activeTab === 'extras') { payload.startTime = form.startTime; payload.endTime = form.endTime }
      const res = await requests.create(payload)
      const reqId = res?.id || res?.data?.id
      if (form.file && reqId) await requests.uploadAttachment(reqId, form.file)
      toast.success(es ? 'Solicitud enviada' : 'Request submitted')
      setForm({ reason: '', startDate: '', endDate: '', comments: '', file: null, startTime: '', endTime: '' })
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
    { key: 'extras', label: es ? 'Extras' : 'Overtime', icon: 'more_time' },
    { key: 'intercambio', label: es ? 'Intercambio' : 'Swap', icon: 'swap_horiz' },
  ]

  const reasons = {
    permisos: [es ? 'Asuntos Personales' : 'Personal', es ? 'Cita Medica' : 'Medical appt', es ? 'Tramites' : 'Administrative', es ? 'Otro' : 'Other'],
    incapacidades: [es ? 'Enfermedad General' : 'General illness', es ? 'Accidente Laboral' : 'Work accident', es ? 'Maternidad/Paternidad' : 'Maternity/Paternity'],
    vacaciones: [es ? 'Vacaciones Anuales' : 'Annual vacation', es ? 'Dias Compensatorios' : 'Compensatory days'],
    extras: [es ? 'Proyecto urgente' : 'Urgent project', es ? 'Cierre de mes' : 'Month-end', es ? 'Soporte critico' : 'Critical support', es ? 'Otro' : 'Other'],
  }

  const statusConfig = {
    approved: { color: 'success', label: es ? 'Aprobado' : 'Approved' },
    accepted: { color: 'success', label: es ? 'Aceptado' : 'Accepted' },
    rejected: { color: 'danger', label: es ? 'Rechazado' : 'Rejected' },
    declined: { color: 'danger', label: es ? 'Declinado' : 'Declined' },
    cancelled: { color: 'danger', label: es ? 'Cancelado' : 'Cancelled' },
    pending: { color: 'warning', label: es ? 'Pendiente' : 'Pending' },
  }
  const statusBadge = (s) => { const c = statusConfig[s] || statusConfig.pending; return <Badge color={c.color}>{c.label}</Badge> }

  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : ''

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('requests')}</h1>
        <p className="text-gray-400 mt-0.5 text-sm">{es ? 'Gestiona solicitudes e intercambios.' : 'Manage requests and swaps.'}</p>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={v => { setActiveTab(v); setForm(f => ({ ...f, reason: '' })) }} />

      {activeTab === 'intercambio' ? (
        <div className="space-y-4">
          {/* Swap form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/80 to-transparent flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">swap_horiz</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{es ? 'Nuevo Intercambio' : 'New Swap'}</h3>
                <p className="text-[11px] text-gray-400">{es ? 'Selecciona turno y companero' : 'Pick shift and coworker'}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">{es ? 'Tu turno' : 'Your shift'}</label>
                  <select value={swapShift} onChange={e => setSwapShift(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    <option value="">{es ? 'Selecciona...' : 'Select...'}</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{fmtDate(s.date)} {fmtTime(s.startTime)}-{fmtTime(s.endTime)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">{es ? 'Companero' : 'Coworker'}</label>
                  <select value={swapTarget} onChange={e => setSwapTarget(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    <option value="">{es ? 'Selecciona...' : 'Select...'}</option>
                    {coworkerList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">{es ? 'Motivo' : 'Reason'} <span className="text-gray-300 font-normal">({es ? 'opcional' : 'optional'})</span></label>
                  <input value={swapReason} onChange={e => setSwapReason(e.target.value)} placeholder={es ? 'Ej: Cita medica...' : 'E.g.: Medical appt...'} className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <Button icon="send" onClick={handleSwap} disabled={submitting || !swapShift || !swapTarget} className="shrink-0 w-full sm:w-auto">{es ? 'Enviar' : 'Send'}</Button>
              </div>
            </div>
          </div>

          {/* Swap list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">{es ? 'Mis Intercambios' : 'My Swaps'}</h3>
              {swaps.length > 0 && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{swaps.length}</span>}
            </div>
            {swaps.length === 0 ? (
              <div className="p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-200">swap_horiz</span>
                <p className="text-gray-400 text-sm mt-2">{es ? 'No tienes intercambios' : 'No swaps yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {swaps.map(sw => {
                  const isRequester = sw.requesterId === myEmployeeId || sw.requester?.id === myEmployeeId
                  const isTarget = sw.targetId === myEmployeeId || sw.target?.id === myEmployeeId
                  const isPending = sw.status === 'pending'
                  return (
                    <div key={sw.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Left: people + shift */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            {isRequester ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                <span className="material-symbols-outlined text-[11px]">north_east</span>{es ? 'Enviada' : 'Sent'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0">
                                <span className="material-symbols-outlined text-[11px]">south_west</span>{es ? 'Recibida' : 'Received'}
                              </span>
                            )}
                            {statusBadge(sw.status)}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar name={sw.requester?.name} size="xs" />
                            <span className="text-sm font-semibold text-gray-900 truncate">{sw.requester?.name}</span>
                            <span className="material-symbols-outlined text-gray-300 text-sm shrink-0">east</span>
                            <Avatar name={sw.target?.name} size="xs" />
                            <span className="text-sm font-semibold text-gray-900 truncate">{sw.target?.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="material-symbols-outlined text-[13px]">event</span>
                            <span>{fmtDate(sw.requesterShift?.date)}</span>
                            <span className="text-gray-300">|</span>
                            <span>{fmtTime(sw.requesterShift?.startTime)}-{fmtTime(sw.requesterShift?.endTime)}</span>
                            <span className="capitalize text-gray-300">({sw.requesterShift?.shiftType})</span>
                          </div>
                          {sw.reason && <p className="text-xs text-gray-400 mt-1 italic truncate">"{sw.reason}"</p>}
                        </div>
                        {/* Right: actions */}
                        <div className="flex gap-2 shrink-0 sm:flex-col sm:items-end">
                          {isPending && isRequester && (
                            <button onClick={() => handleCancelSwap(sw.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                              {es ? 'Cancelar' : 'Cancel'}
                            </button>
                          )}
                          {isPending && isTarget && (
                            <>
                              <button onClick={() => handleRespondSwap(sw.id, true)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                {es ? 'Aceptar' : 'Accept'}
                              </button>
                              <button onClick={() => handleRespondSwap(sw.id, false)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors">
                                <span className="material-symbols-outlined text-[14px]">close</span>
                                {es ? 'Rechazar' : 'Decline'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 lg:p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Motivo' : 'Reason'}</label>
                  <select value={form.reason} onChange={set('reason')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">{es ? 'Seleccione...' : 'Select...'}</option>
                    {(reasons[activeTab] || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('startDate')}</label>
                    <input type="date" value={form.startDate} onChange={set('startDate')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Fecha fin' : 'End date'}</label>
                    <input type="date" value={form.endDate} onChange={set('endDate')} min={form.startDate} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                {activeTab === 'extras' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Hora inicio' : 'Start time'}</label>
                      <input type="time" value={form.startTime} onChange={set('startTime')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Hora fin' : 'End time'}</label>
                      <input type="time" value={form.endTime} onChange={set('endTime')} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                )}
                {activeTab === 'extras' && form.startTime && form.endTime && form.startDate && (() => {
                  const [sh, sm] = form.startTime.split(':').map(Number)
                  const [eh, em] = form.endTime.split(':').map(Number)
                  let hrs = (eh + em / 60) - (sh + sm / 60); if (hrs < 0) hrs += 24
                  const d = new Date(form.startDate + 'T12:00:00')
                  const isSun = d.getDay() === 0
                  const isNight = sh >= 21 || sh < 6 || eh >= 21
                  const type = isSun && isNight ? 'dominical_nocturna' : isSun ? 'dominical_diurna' : isNight ? 'nocturna' : 'diurna'
                  const mult = { diurna: 1.25, nocturna: 1.75, dominical_diurna: 2.0, dominical_nocturna: 2.5 }[type]
                  const labels = { diurna: es ? 'Diurna' : 'Daytime', nocturna: es ? 'Nocturna' : 'Night', dominical_diurna: es ? 'Dominical Diurna' : 'Sunday Day', dominical_nocturna: es ? 'Dominical Nocturna' : 'Sunday Night' }
                  return (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                        <span className="material-symbols-outlined text-amber-600 text-lg">calculate</span>
                        {es ? 'Calculo de Recargo' : 'Surcharge Calculation'}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><p className="text-amber-600/70 uppercase font-bold">{es ? 'Horas' : 'Hours'}</p><p className="text-sm font-bold text-amber-900">{hrs.toFixed(1)}h</p></div>
                        <div><p className="text-amber-600/70 uppercase font-bold">{es ? 'Tipo' : 'Type'}</p><p className="text-sm font-bold text-amber-900">{labels[type]}</p></div>
                        <div><p className="text-amber-600/70 uppercase font-bold">{es ? 'Recargo' : 'Rate'}</p><p className="text-sm font-bold text-amber-900">{mult}x</p></div>
                        <div><p className="text-amber-600/70 uppercase font-bold">{es ? 'Estimado' : 'Estimate'}</p><p className="text-sm font-bold text-amber-900">~${Math.round(myHourlyRate * hrs * mult).toLocaleString('es-CO')}</p></div>
                      </div>
                    </div>
                  )
                })()}
                {days > 0 && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">info</span>
                    {es ? 'Duracion:' : 'Duration:'} <span className="font-bold text-primary">{days} {days === 1 ? (es ? 'dia' : 'day') : (es ? 'dias' : 'days')}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Comentarios' : 'Comments'} <span className="text-gray-300 font-normal">({es ? 'opcional' : 'optional'})</span></label>
                  <textarea value={form.comments} onChange={set('comments')} rows={2} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-primary" placeholder={es ? 'Detalles adicionales...' : 'Additional details...'} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">{es ? 'Adjunto' : 'Attachment'} <span className="text-gray-300 font-normal">({es ? 'opcional' : 'optional'})</span></label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-gray-300 text-xl">upload_file</span>
                    <div className="flex-1 min-w-0">
                      {form.file ? (
                        <p className="text-sm font-medium text-gray-900 truncate">{form.file.name} <span className="text-gray-400 text-xs">({(form.file.size / 1024).toFixed(0)} KB)</span></p>
                      ) : (
                        <p className="text-sm text-gray-400">{es ? 'PDF o imagen' : 'PDF or image'}</p>
                      )}
                    </div>
                    {form.file && <button type="button" onClick={e => { e.preventDefault(); setForm(f => ({ ...f, file: null })) }} className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))} />
                  </label>
                </div>
              </div>
              <div className="px-5 lg:px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => navigate(-1)}>{t('cancel')}</Button>
                <Button icon="send" onClick={handleSubmit} disabled={submitting}>{submitting ? '...' : (es ? 'Enviar' : 'Submit')}</Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            {activeTab === 'vacaciones' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{es ? 'Balance Vacaciones' : 'Vacation Balance'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0"><span className="material-symbols-outlined text-lg">beach_access</span></div>
                    <div><span className="text-xl font-bold text-gray-900">{vac.available ?? '—'}</span><p className="text-[10px] text-gray-400 uppercase font-semibold">{es ? 'Disponibles' : 'Available'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><span className="material-symbols-outlined text-lg">history</span></div>
                    <div><span className="text-xl font-bold text-gray-900">{vac.used ?? '—'}</span><p className="text-[10px] text-gray-400 uppercase font-semibold">{es ? 'Usados' : 'Used'}</p></div>
                  </div>
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{es ? 'Recientes' : 'Recent'}</h3>
                <div className="space-y-2">
                  {history.slice(0, 4).map((req, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px]">description</span>
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
