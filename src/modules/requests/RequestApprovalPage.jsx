import { useState } from 'react'
import { requests as reqService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Select from '../../components/ui/Select'
import { useLang } from '../../context/LangContext'
import { useMutation } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'

const typeIcons = { overtime: 'more_time', leave: 'assignment_turned_in', medical: 'medical_services', vacation: 'beach_access' }
const typeColors = { overtime: 'warning', leave: 'info', medical: 'danger', vacation: 'purple' }
const typeLabels = { overtime: { es: 'Horas Extra', en: 'Overtime' }, leave: { es: 'Personal', en: 'Leave' }, medical: { es: 'Médica', en: 'Medical' }, vacation: { es: 'Vacaciones', en: 'Vacation' } }
const surchargeLabels = { diurna: 'Diurna', nocturna: 'Nocturna', dominical_diurna: 'Dom. Diurna', dominical_nocturna: 'Dom. Nocturna', festivo: 'Festivo' }

const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const tf = localStorage.getItem('timeFormat') || '24h'
  if (tf === '12h') { const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }
  return `${h}:${m}`
}

const fmtDate = (d, es) => {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' })
}

export default function RequestApprovalPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { formatCurrency: fc } = useCurrency()
  const [detail, setDetail] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data, loading, refetch } = useFetch(() => reqService.list(filter === 'all' ? {} : { status: filter }), { key: `requests-${filter}`, deps: [filter] })
  const { data: allData, refetch: refetchAll } = useFetch(() => reqService.list({}), { key: 'requests-all-stats' })
  const { mutate: approve } = useMutation((id) => reqService.approve(id))
  const { mutate: reject } = useMutation((id) => reqService.reject(id))

  const raw = data?.data || data || []
  const allRaw = allData?.data || allData || []
  const list = raw.filter(r => {
    if (search && !r.employee?.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && r.type !== typeFilter) return false
    return true
  })

  const today = new Date().toISOString().slice(0, 10)
  const pendingCount = allRaw.filter(r => r.status === 'pending').length
  const approvedToday = allRaw.filter(r => r.status === 'approved' && r.reviewedAt?.startsWith(today)).length
  const rejectedToday = allRaw.filter(r => r.status === 'rejected' && r.reviewedAt?.startsWith(today)).length
  const teamSize = new Set(allRaw.map(r => r.employeeId)).size

  const handleAction = async (action, id) => {
    try {
      if (action === 'approve') await approve(id)
      else await reject(id)
      toast.success(action === 'approve' ? (es ? 'Aprobada' : 'Approved') : (es ? 'Rechazada' : 'Rejected'))
      setDetail(null)
      refetch()
      refetchAll()
    } catch { toast.error('Error') }
  }

  const viewAttachment = async (id) => {
    try {
      const res = await reqService.getAttachment(id)
      const url = res?.url || res?.data?.url || res
      if (url) window.open(url, '_blank')
      else toast.error(es ? 'No se pudo obtener el archivo' : 'Could not get file')
    } catch { toast.error(es ? 'Error al abrir adjunto' : 'Error opening attachment') }
  }

  const typeOpts = [
    { value: '', label: es ? 'Todos los tipos' : 'All types' },
    { value: 'vacation', label: es ? 'Vacaciones' : 'Vacation' },
    { value: 'leave', label: es ? 'Personal' : 'Leave' },
    { value: 'medical', label: es ? 'Médica' : 'Medical' },
    { value: 'overtime', label: es ? 'Horas Extra' : 'Overtime' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-gray-500">{es ? 'Gestione las solicitudes pendientes de su equipo de manera eficiente.' : "Manage your team's pending requests efficiently."}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(pendingCount)} icon="pending_actions" />
        <StatCard label={es ? 'Aprobadas Hoy' : 'Approved Today'} value={String(approvedToday)} icon="check_circle" iconColor="text-emerald-600 bg-emerald-50" />
        <StatCard label={es ? 'Rechazadas Hoy' : 'Rejected Today'} value={String(rejectedToday)} icon="cancel" iconColor="text-red-600 bg-red-50" />
        <StatCard label={es ? 'Total Equipo' : 'Team Total'} value={String(teamSize)} icon="group" iconColor="text-blue-600 bg-blue-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-500 mb-1 block">{es ? 'Buscar por empleado' : 'Search by employee'}</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">person_search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={es ? 'Nombre...' : 'Name...'}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label className="text-xs font-medium text-gray-500 mb-1 block">{es ? 'Filtrar por tipo' : 'Filter by type'}</label>
          <Select value={typeFilter} onChange={setTypeFilter} options={typeOpts} />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'pending', label: es ? 'Pendientes' : 'Pending' },
            { key: 'approved', label: es ? 'Aprobadas' : 'Approved' },
            { key: 'rejected', label: es ? 'Rechazadas' : 'Rejected' },
            { key: 'all', label: es ? 'Todas' : 'All' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">inbox</span>
          <p className="text-gray-400">{es ? 'No hay solicitudes' : 'No requests'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(r => {
            const isOT = r.type === 'overtime'
            const days = r.days || (r.startDate && r.endDate ? Math.max(1, Math.round((new Date(r.endDate) - new Date(r.startDate)) / 86400000) + 1) : 1)
            return (
              <div key={r.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col ${detail?.id === r.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.employee?.name || '?'} size="md" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{r.employee?.name}</p>
                        <p className="text-xs text-gray-400">{r.employee?.roleTitle}</p>
                      </div>
                    </div>
                    <Badge color={typeColors[r.type] || 'neutral'}>
                      {typeLabels[r.type]?.[es ? 'es' : 'en'] || r.type}
                    </Badge>
                  </div>
                </div>

                <div className="px-5 pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="material-symbols-outlined text-gray-400 text-lg">event</span>
                    <span className="font-medium">
                      {fmtDate(r.startDate, es)}{r.endDate && r.endDate !== r.startDate ? ` - ${fmtDate(r.endDate, es)}` : ''}
                      <span className="text-gray-400 ml-1">({days} {days === 1 ? (es ? 'día' : 'day') : (es ? 'días' : 'days')})</span>
                    </span>
                  </div>
                  {isOT && r.startTime && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span className="font-semibold">{fmtTime(r.startTime)} - {fmtTime(r.endTime)} ({r.overtimeHours}h)</span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-3 flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">{r.description || (es ? 'Sin descripción' : 'No description')}</p>
                  {isOT && r.surchargeType && (
                    <button onClick={() => setDetail(detail?.id === r.id ? null : r)}
                      className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      {surchargeLabels[r.surchargeType]} {r.surchargeMultiplier}x — {fc(Number(r.overtimeAmount) || 0)}
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  )}
                </div>

                {/* Attachment */}
                <div className="px-5 pb-3">
                  {r.attachmentKey ? (
                    <button onClick={() => viewAttachment(r.id)}
                      className="w-full flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm transition-colors text-left">
                      <span className="material-symbols-outlined text-primary text-lg">attach_file</span>
                      <span className="text-primary font-medium truncate flex-1">{r.attachmentKey.split('/').pop()}</span>
                      <span className="material-symbols-outlined text-gray-400 text-lg">visibility</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-300 italic">
                      <span className="material-symbols-outlined text-[16px]">attach_file</span>
                      {es ? 'Sin archivos adjuntos' : 'No attachments'}
                    </div>
                  )}
                </div>

                {r.status !== 'pending' && (
                  <div className="px-5 pb-3">
                    <Badge color={r.status === 'approved' ? 'success' : 'danger'}>
                      {r.status === 'approved' ? (es ? 'Aprobada' : 'Approved') : (es ? 'Rechazada' : 'Rejected')}
                    </Badge>
                  </div>
                )}

                {r.status === 'pending' && (
                  <div className="px-5 pb-5 pt-1 flex gap-3">
                    <button onClick={() => handleAction('reject', r.id)}
                      className="flex-1 h-10 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                      {es ? 'Rechazar' : 'Reject'}
                    </button>
                    <button onClick={() => handleAction('approve', r.id)}
                      className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-lg">check</span>
                      {es ? 'Aprobar' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* OT Cost Side Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${detail ? 'translate-x-0' : 'translate-x-full'}`}>
        {detail && (() => {
          const r = detail
          return (
            <div className="h-full flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">more_time</span>
                  <h3 className="text-lg font-bold text-gray-900">{es ? 'Detalle Horas Extra' : 'Overtime Detail'}</h3>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="material-symbols-outlined text-gray-400">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Employee */}
                <div className="flex items-center gap-4">
                  <Avatar name={r.employee?.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">{r.employee?.name}</p>
                    <p className="text-sm text-gray-500">{r.employee?.roleTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{es ? 'Salario' : 'Salary'}</p>
                    <p className="text-sm font-bold text-gray-900">{fc(Number(r.employee?.baseSalary) || 0)}</p>
                  </div>
                </div>

                {/* Schedule pills */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary text-lg">event</span>
                    <span className="text-sm font-semibold">{fmtDate(r.startDate, es)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                    <span className="text-sm font-semibold">{fmtTime(r.startTime)} — {fmtTime(r.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-amber-600 text-lg">timer</span>
                    <span className="text-sm font-bold text-amber-700">{r.overtimeHours}h</span>
                  </div>
                </div>

                {/* Reason */}
                {r.description && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <span className="material-symbols-outlined text-gray-400 text-lg shrink-0 mt-0.5">chat</span>
                    <span className="leading-relaxed">"{r.description}"</span>
                  </div>
                )}

                {/* Cost breakdown */}
                <div className="rounded-xl border border-amber-200 overflow-hidden">
                  <div className="bg-amber-50 px-4 py-2.5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-lg">calculate</span>
                    <span className="text-sm font-bold text-amber-800">{es ? 'Desglose de Costo' : 'Cost Breakdown'}</span>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    {/* 3 columns */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Valor/Hora' : 'Hourly'}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{fc(Number(r.hourlyRate) || 0)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-amber-600 uppercase font-bold">{es ? 'Recargo' : 'Surcharge'}</p>
                        <p className="text-sm font-bold text-amber-700 mt-0.5">{surchargeLabels[r.surchargeType]} {r.surchargeMultiplier}x</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Horas' : 'Hours'}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{r.overtimeHours}h</p>
                      </div>
                    </div>

                    {/* Formula */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
                      <span>{fc(Number(r.hourlyRate) || 0)}</span>
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      <span>{r.overtimeHours}h</span>
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      <span>{r.surchargeMultiplier}x</span>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-center text-white">
                      <p className="text-xs uppercase font-bold text-white/70">{es ? 'Costo Total' : 'Total Cost'}</p>
                      <p className="text-2xl font-bold mt-0.5">{fc(Number(r.overtimeAmount) || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Attachment in panel */}
                {r.attachmentKey && (
                  <button onClick={() => viewAttachment(r.id)}
                    className="w-full flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 text-sm transition-colors text-left">
                    <span className="material-symbols-outlined text-primary text-lg">attach_file</span>
                    <span className="text-primary font-medium truncate flex-1">{r.attachmentKey.split('/').pop()}</span>
                    <span className="material-symbols-outlined text-gray-400 text-lg">open_in_new</span>
                  </button>
                )}
              </div>

              {/* Panel actions */}
              {r.status === 'pending' && (
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => handleAction('reject', r.id)}
                    className="flex-1 h-11 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                    {es ? 'Rechazar' : 'Reject'}
                  </button>
                  <button onClick={() => handleAction('approve', r.id)}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-lg">check</span>
                    {es ? 'Aprobar Extras' : 'Approve OT'}
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* Backdrop */}
      {detail && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDetail(null)} />}
    </div>
  )
}
