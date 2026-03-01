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
  const { data, loading, refetch } = useFetch(() => reqService.list({ status: 'pending' }), { key: 'requests-pending' })
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
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(list.length)} icon="pending_actions" />
        <StatCard label={es ? 'Horas Extra' : 'Overtime'} value={String(otCount)} icon="more_time" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Costo Extras' : 'OT Cost'} value={fc(otTotal)} icon="payments" iconColor="text-red-600 bg-red-50" />
        <StatCard label={es ? 'Otros' : 'Other'} value={String(list.length - otCount)} icon="description" iconColor="text-blue-600 bg-blue-50" />
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
                  <div className="flex gap-2 shrink-0">
                    {isOT && (
                      <button onClick={() => setDetail(r)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {es ? 'Detalle' : 'Detail'}
                      </button>
                    )}
                    <button onClick={() => handleAction('reject', r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      {t('reject')}
                    </button>
                    <button onClick={() => isOT ? setDetail(r) : handleAction('approve', r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      {t('approve')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Overtime cost detail modal */}
      {detail && (
        <Modal open={!!detail} title={es ? 'Detalle de Costo — Horas Extra' : 'Cost Detail — Overtime'} icon="calculate" onClose={() => setDetail(null)} size="md">
          <div className="space-y-5">
            {/* Employee */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <Avatar name={detail.employee?.name} size="md" />
              <div>
                <p className="font-bold text-gray-900">{detail.employee?.name}</p>
                <p className="text-xs text-gray-500">{detail.employee?.roleTitle} — {detail.employee?.department?.name || ''}</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">{es ? 'Horario Solicitado' : 'Requested Schedule'}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">event</span>
                  <span className="text-sm font-semibold text-gray-900">{detail.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                  <span className="text-sm font-semibold text-gray-900">{fmtTime(detail.startTime)} — {fmtTime(detail.endTime)}</span>
                </div>
                <Badge color="warning">{detail.overtimeHours}h</Badge>
              </div>
              {detail.description && <p className="text-xs text-gray-500 italic">"{detail.description}"</p>}
            </div>

            {/* Cost breakdown */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-700 uppercase mb-3">{es ? 'Desglose de Costo' : 'Cost Breakdown'}</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{es ? 'Salario base mensual' : 'Monthly base salary'}</span>
                  <span className="font-semibold text-gray-900">{fc(Number(detail.employee?.baseSalary) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{es ? 'Valor hora ordinaria' : 'Regular hourly rate'}</span>
                  <span className="font-semibold text-gray-900">{fc(Number(detail.hourlyRate) || 0)}</span>
                </div>
                <div className="border-t border-amber-200 pt-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{es ? 'Tipo de recargo' : 'Surcharge type'}</span>
                    <span className="font-bold text-amber-700">{surchargeLabels[detail.surchargeType] || detail.surchargeType}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{es ? 'Multiplicador' : 'Multiplier'}</span>
                    <span className="font-bold text-amber-700">{detail.surchargeMultiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{es ? 'Horas extra' : 'Overtime hours'}</span>
                    <span className="font-bold text-gray-900">{detail.overtimeHours}h</span>
                  </div>
                </div>
                <div className="border-t border-amber-200 pt-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{es ? 'Calculo' : 'Calculation'}</span>
                    <span className="text-xs text-gray-500">{fc(Number(detail.hourlyRate) || 0)} × {detail.overtimeHours}h × {detail.surchargeMultiplier}</span>
                  </div>
                </div>
                <div className="border-t-2 border-amber-300 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">{es ? 'Costo Total' : 'Total Cost'}</span>
                  <span className="text-xl font-bold text-amber-700">{fc(Number(detail.overtimeAmount) || 0)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="danger" icon="close" className="flex-1" onClick={() => handleAction('reject', detail.id)}>{t('reject')}</Button>
              <Button variant="success" icon="check" className="flex-1" onClick={() => handleAction('approve', detail.id)}>{es ? 'Aprobar Extras' : 'Approve OT'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
