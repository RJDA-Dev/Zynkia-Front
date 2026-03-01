import { useState } from 'react'
import { requests as reqService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useLang } from '../../context/LangContext'
import { useMutation } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'

const typeIcons = { overtime: 'more_time', leave: 'assignment_turned_in', medical: 'medical_services', vacation: 'beach_access' }
const typeColors = { overtime: 'warning', leave: 'info', medical: 'danger', vacation: 'purple' }
const surchargeLabels = { diurna: 'Diurna', nocturna: 'Nocturna', dominical_diurna: 'Dominical Diurna', dominical_nocturna: 'Dominical Nocturna', festivo: 'Festivo' }

const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const tf = localStorage.getItem('timeFormat') || '24h'
  if (tf === '12h') { const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }
  return `${h}:${m}`
}

export default function RequestApprovalPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { formatCurrency: fc } = useCurrency()
  const [detail, setDetail] = useState(null)
  const [filter, setFilter] = useState('pending')
  const { data, loading, refetch } = useFetch(() => reqService.list(filter === 'all' ? {} : { status: filter }), { key: `requests-${filter}`, deps: [filter] })
  const { mutate: approve } = useMutation((id) => reqService.approve(id))
  const { mutate: reject } = useMutation((id) => reqService.reject(id))

  const list = data?.data || data || []
  const otCount = list.filter(r => r.type === 'overtime').length
  const otTotal = list.filter(r => r.type === 'overtime').reduce((s, r) => s + (Number(r.overtimeAmount) || 0), 0)

  const handleAction = async (action, id) => {
    try {
      if (action === 'approve') await approve(id)
      else await reject(id)
      toast.success(action === 'approve' ? (es ? 'Aprobada' : 'Approved') : (es ? 'Rechazada' : 'Rejected'))
      setDetail(null)
      refetch()
    } catch { toast.error('Error') }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-gray-500">{es ? 'Gestione las solicitudes pendientes de su equipo.' : "Manage your team's pending requests."}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(list.filter(r => r.status === 'pending').length || list.length)} icon="pending_actions" />
        <StatCard label={es ? 'Horas Extra' : 'Overtime'} value={String(otCount)} icon="more_time" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Costo Extras' : 'OT Cost'} value={fc(otTotal)} icon="payments" iconColor="text-red-600 bg-red-50" />
        <StatCard label={es ? 'Otros' : 'Other'} value={String(list.length - otCount)} icon="description" iconColor="text-blue-600 bg-blue-50" />
      </div>

      <div className="flex gap-2">
        {[
          { key: 'pending', label: es ? 'Pendientes' : 'Pending', icon: 'hourglass_top' },
          { key: 'approved', label: es ? 'Aprobadas' : 'Approved', icon: 'check_circle' },
          { key: 'rejected', label: es ? 'Rechazadas' : 'Rejected', icon: 'cancel' },
          { key: 'all', label: es ? 'Todas' : 'All', icon: 'list' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <span className="material-symbols-outlined text-[14px]">{f.icon}</span>{f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center text-gray-400 py-12">{es ? 'Cargando...' : 'Loading...'}</div> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {list.length === 0 && <p className="text-center text-gray-400 py-12">{es ? 'No hay solicitudes pendientes' : 'No pending requests'}</p>}
          {list.map(r => {
            const isOT = r.type === 'overtime'
            return (
              <div key={r.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={r.employee?.name || '?'} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{r.employee?.name}</span>
                        <span className="text-xs text-gray-400">{r.employee?.roleTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge color={typeColors[r.type] || 'neutral'}>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">{typeIcons[r.type] || 'description'}</span>
                            {r.type}
                          </span>
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">event</span>
                          {r.startDate}
                        </span>
                        {isOT && r.surchargeType && (
                          <Badge color="warning">{surchargeLabels[r.surchargeType] || r.surchargeType} {r.surchargeMultiplier}x</Badge>
                        )}
                      </div>
                      {isOT && r.overtimeHours && (
                        <p className="text-xs text-amber-600 font-semibold mt-1">
                          {fmtTime(r.startTime)}-{fmtTime(r.endTime)} — {r.overtimeHours}h — {fc(Number(r.overtimeAmount) || 0)}
                        </p>
                      )}
                      {r.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{r.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status !== 'pending' && (
                      <Badge color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'neutral'}>
                        {r.status === 'approved' ? (es ? 'Aprobada' : 'Approved') : r.status === 'rejected' ? (es ? 'Rechazada' : 'Rejected') : r.status}
                      </Badge>
                    )}
                    {isOT && (
                      <button onClick={() => setDetail(r)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {es ? 'Detalle' : 'Detail'}
                      </button>
                    )}
                    {r.status === 'pending' && (<>
                      <button onClick={() => handleAction('reject', r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        {t('reject')}
                      </button>
                      <button onClick={() => isOT ? setDetail(r) : handleAction('approve', r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {t('approve')}
                      </button>
                    </>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Overtime cost detail modal */}
      {detail && (
        <Modal open={!!detail} title={es ? 'Aprobar Horas Extra' : 'Approve Overtime'} icon="more_time" onClose={() => setDetail(null)} size="md">
          <div className="p-6 space-y-5">
            {/* Employee header */}
            <div className="flex items-center gap-4">
              <Avatar name={detail.employee?.name} size="lg" />
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{detail.employee?.name}</p>
                <p className="text-sm text-gray-500">{detail.employee?.roleTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Salario' : 'Salary'}</p>
                <p className="text-sm font-bold text-gray-900">{fc(Number(detail.employee?.baseSalary) || 0)}</p>
              </div>
            </div>

            {/* Schedule card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-primary text-lg">event</span>
                <span className="text-sm font-semibold text-gray-900">{new Date(detail.startDate + 'T12:00:00').toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <span className="text-sm font-semibold text-gray-900">{fmtTime(detail.startTime)} — {fmtTime(detail.endTime)}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-amber-600 text-lg">timer</span>
                <span className="text-sm font-bold text-amber-700">{detail.overtimeHours}h</span>
              </div>
            </div>

            {detail.description && (
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <span className="material-symbols-outlined text-gray-400 text-lg shrink-0">chat</span>
                <span>"{detail.description}"</span>
              </div>
            )}

            {/* Cost breakdown — visual */}
            <div className="rounded-xl border border-amber-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-lg">calculate</span>
                <span className="text-sm font-bold text-amber-800">{es ? 'Desglose de Costo' : 'Cost Breakdown'}</span>
              </div>
              <div className="p-4 space-y-3 bg-white">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Valor/Hora' : 'Hourly'}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{fc(Number(detail.hourlyRate) || 0)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-amber-600 uppercase font-bold">{es ? 'Recargo' : 'Surcharge'}</p>
                    <p className="text-sm font-bold text-amber-700 mt-0.5">{surchargeLabels[detail.surchargeType]} {detail.surchargeMultiplier}x</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Horas' : 'Hours'}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{detail.overtimeHours}h</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
                  <span>{fc(Number(detail.hourlyRate) || 0)}</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  <span>{detail.overtimeHours}h</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  <span>{detail.surchargeMultiplier}x</span>
                  <span className="material-symbols-outlined text-[14px]">drag_handle</span>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-center text-white">
                  <p className="text-xs uppercase font-bold text-white/70">{es ? 'Costo Total' : 'Total Cost'}</p>
                  <p className="text-2xl font-bold mt-0.5">{fc(Number(detail.overtimeAmount) || 0)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => handleAction('reject', detail.id)} className="flex-1 h-11 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
                {t('reject')}
              </button>
              <button onClick={() => handleAction('approve', detail.id)} className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-lg">check</span>
                {es ? 'Aprobar Extras' : 'Approve OT'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
