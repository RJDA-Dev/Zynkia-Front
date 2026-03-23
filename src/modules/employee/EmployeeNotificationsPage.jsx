import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { extractList } from '../../api/response'
import { portal, notifications as notifApi } from '../../api/services'
import Badge from '../../components/ui/Badge'
import NotificationList from '../../components/notifications/NotificationList'
import { useToast } from '../../context/ToastContext'

export default function EmployeeNotificationsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [expandedId, setExpandedId] = useState(null)
  const { data, refetch } = useFetch(() => portal.notifications(), { key: 'emp-notifs' })
  const list = extractList(data)
  const unreadCount = list.filter((item) => !item.read).length

  const markRead = async (id) => {
    try { await notifApi.markRead(id); refetch() } catch { toast.error('Error') }
  }

  const markAll = async () => {
    try { await notifApi.markAllRead(); refetch(); toast.success(es ? 'Todas leidas' : 'All read') } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{es ? 'Notificaciones' : 'Notifications'}</h2>
          <p className="mt-1 text-sm text-slate-500">{es ? 'Alertas, recordatorios y eventos del portal.' : 'Alerts, reminders and portal events.'}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <Badge color="primary">{unreadCount} {es ? 'nuevas' : 'new'}</Badge>}
          {unreadCount > 0 && (
            <button onClick={markAll} className="text-xs font-medium text-primary transition-colors hover:text-primary-hover">
              {es ? 'Marcar todas como leidas' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      <NotificationList
        items={list}
        lang={lang}
        onSelect={(item) => {
          if (!item.read) markRead(item.id)
          setExpandedId((current) => (current === item.id ? null : (item.message ? item.id : null)))
        }}
        expandedId={expandedId}
        variant="page"
      />
    </div>
  )
}
