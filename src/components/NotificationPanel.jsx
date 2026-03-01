import { useState, useEffect, useRef } from 'react'
import { notifications } from '../api/services'
import useFetch from '../hooks/useFetch'
import { initFirebase, requestPushPermission, onForegroundMessage } from '../lib/firebase'
import { useLang } from '../context/LangContext'

const typeIcons = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error', payroll: 'payments', schedule: 'calendar_month', request: 'description', login: 'login', security: 'shield' }
const typeColors = { info: 'text-primary', success: 'text-success', warning: 'text-warning', error: 'text-danger', payroll: 'text-emerald-500', schedule: 'text-blue-500', request: 'text-purple-500', login: 'text-purple-500', security: 'text-orange-500' }

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const tokenSent = useRef(false)
  const { lang } = useLang()
  const es = lang === 'es'

  const { data, refetch } = useFetch(() => notifications.list(), { key: 'notifications' })
  const list = data?.data?.data || data?.data || []
  const unreadCount = data?.data?.unread ?? data?.unread ?? 0

  useEffect(() => {
    initFirebase()
    const unsub = onForegroundMessage(() => refetch())
    const onWs = () => refetch()
    window.addEventListener('new-notification', onWs)
    return () => { unsub(); window.removeEventListener('new-notification', onWs) }
  }, [])

  // Request push permission only on first panel open (user gesture)
  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open) {
      refetch()
      if (!tokenSent.current) {
        tokenSent.current = true
        const token = await requestPushPermission()
        if (token) try { await notifications.registerToken(token) } catch {}
      }
    }
  }

  const [expanded, setExpanded] = useState(null)

  const handleMarkRead = async (id) => {
    await notifications.markRead(id)
    refetch()
  }

  const handleClick = (n) => {
    if (!n.read) handleMarkRead(n.id)
    setExpanded(expanded === n.id ? null : (n.message ? n.id : null))
  }

  const handleMarkAll = async () => {
    await notifications.markAllRead()
    refetch()
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return es ? 'Ahora' : 'Now'
    if (mins < 60) return es ? `Hace ${mins} min` : `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return es ? `Hace ${hrs}h` : `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return es ? `Hace ${days}d` : `${days}d ago`
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 relative transition-colors">
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" style={{ animation: 'pulse-dot 2s infinite' }} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">{es ? 'Notificaciones' : 'Notifications'}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} {es ? 'nuevas' : 'new'}</span>
                    <button onClick={handleMarkAll} className="text-xs text-gray-400 hover:text-primary">{es ? 'Leer todas' : 'Read all'}</button>
                  </>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {list.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">{es ? 'Sin notificaciones' : 'No notifications'}</div>
              )}
              {list.map(n => (
                <div key={n.id} onClick={() => handleClick(n)} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  <span className={`material-symbols-outlined ${typeColors[n.type] || 'text-gray-400'} mt-0.5`}>{typeIcons[n.type] || 'info'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    {n.message && expanded !== n.id && <p className="text-xs text-gray-500 truncate">{n.message}</p>}
                    {n.message && expanded === n.id && <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{n.message}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
