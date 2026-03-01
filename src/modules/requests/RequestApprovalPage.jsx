import { requests as reqService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import { useLang } from '../../context/LangContext'
import { useMutation } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'

const typeColors = { medical: 'info', vacation: 'purple', personal: 'warning', remote: 'primary', training: 'teal' }

function RequestCard({ request, t, lang, onAction }) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={request.employee?.name || request.name || '?'} size="lg" />
            <div>
              <h3 className="text-gray-900 font-bold text-lg leading-tight">{request.employee?.name || request.name}</h3>
              <p className="text-gray-500 text-sm">{request.employee?.roleTitle || ''}</p>
            </div>
          </div>
          <Badge color={typeColors[request.type] || 'neutral'}>{request.type}</Badge>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="material-symbols-outlined text-gray-400">event</span>
            <span className="text-sm font-medium">{request.startDate} - {request.endDate} ({request.days} {lang === 'es' ? 'días' : 'days'})</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{request.description}</p>
        </div>
      </div>
      {request.status === 'pending' && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button variant="danger" icon="close" className="flex-1" onClick={() => onAction('reject', request.id)}>{t('reject')}</Button>
          <Button variant="success" icon="check" className="flex-1" onClick={() => onAction('approve', request.id)}>{t('approve')}</Button>
        </div>
      )}
      {request.status !== 'pending' && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <Badge color={request.status === 'approved' ? 'success' : 'danger'}>{request.status}</Badge>
        </div>
      )}
    </div>
  )
}

export default function RequestApprovalPage() {
  const { t, lang } = useLang()
  const toast = useToast()
  const { data, loading, refetch } = useFetch(() => reqService.list({ status: 'pending' }), { key: 'requests-pending' })
  const { mutate: approve } = useMutation((id) => reqService.approve(id))
  const { mutate: reject } = useMutation((id) => reqService.reject(id))

  const list = data?.data || data || []

  const handleAction = async (action, id) => {
    try {
      if (action === 'approve') await approve(id)
      else await reject(id)
      toast.success(action === 'approve' ? (lang === 'es' ? 'Aprobada' : 'Approved') : (lang === 'es' ? 'Rechazada' : 'Rejected'))
      refetch()
    } catch { toast.error('Error') }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <p className="text-gray-500">{lang === 'es' ? 'Gestione las solicitudes pendientes de su equipo.' : "Manage your team's pending requests."}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('pending')} value={String(list.length)} icon="pending_actions" />
      </div>
      {loading ? <div className="text-center text-gray-400 py-12">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.map(r => <RequestCard key={r.id} request={r} t={t} lang={lang} onAction={handleAction} />)}
          {list.length === 0 && <p className="col-span-3 text-center text-gray-400 py-12">{lang === 'es' ? 'No hay solicitudes pendientes' : 'No pending requests'}</p>}
        </div>
      )}
    </div>
  )
}
