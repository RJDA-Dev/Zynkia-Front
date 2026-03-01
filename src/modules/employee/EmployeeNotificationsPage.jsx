import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { portal, notifications as notifApi } from '../../api/services'
import { useToast } from '../../context/ToastContext'

const typeIcons = { login: 'login', info: 'info', warning: 'warning', success: 'check_circle' }
const typeColors = { login: 'text-blue-600 bg-blue-50', info: 'text-primary bg-primary/10', warning: 'text-amber-600 bg-amber-50', success: 'text-green-600 bg-green-50' }

function timeAgo(date, es) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return es ? 'ahora' : 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function EmployeeNotificationsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { data, refetch } = useFetch(() => portal.notifications(), { key: 'emp-notifs' })
  const list = Array.isArray(data) ? data : (data?.data || [])

  const markRead = async (id) => {
    try { await notifApi.markRead(id); refetch() } catch { toast.error('Error') }
  }

  const markAll = async () => {
    try { await notifApi.markAllRead(); refetch(); toast.success(es ? 'Todas leidas' : 'All read') } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{es ? 'Notificaciones' : 'Notifications'}</h2>
        {list.some(n => !n.read) && (
          <button onClick={markAll} className="text-xs text-primary hover:underline font-medium">{es ? 'Marcar todas como leidas' : 'Mark all read'}</button>
        )}
      </div>
      {list.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
          <p className="mt-2 text-sm text-gray-500">{es ? 'Sin notificaciones' : 'No notifications'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {list.map(n => (
            <button key={n.id} onClick={() => !n.read && markRead(n.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary/[0.02]' : ''}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeColors[n.type] || typeColors.info}`}>
                <span className="material-symbols-outlined text-lg">{typeIcons[n.type] || 'notifications'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 truncate">{n.message}</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt, es)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
