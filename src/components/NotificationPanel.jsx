import { useState, useEffect, useRef } from 'react'
import { notifications } from '../api/services'
import { extractList, extractUnread } from '../api/response'
import NotificationList from './notifications/NotificationList'
import useFetch from '../hooks/useFetch'
import { initFirebase, requestPushPermission, onForegroundMessage } from '../lib/firebase'
import { useLang } from '../context/LangContext'

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const tokenSent = useRef(false)
  const { lang } = useLang()
  const es = lang === 'es'

  const { data, refetch } = useFetch(() => notifications.list(), { key: 'notifications' })
  const list = extractList(data)
  const unreadCount = extractUnread(data)

  useEffect(() => {
    initFirebase()
    const unsub = onForegroundMessage(() => refetch())
    const onWs = () => refetch()
    window.addEventListener('new-notification', onWs)
    return () => { unsub(); window.removeEventListener('new-notification', onWs) }
  }, [refetch])

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open) {
      setExpandedId(null)
      refetch()
      if (!tokenSent.current) {
        tokenSent.current = true
        const token = await requestPushPermission()
        if (token) {
          try { await notifications.registerToken(token) }
          catch { tokenSent.current = false }
        }
      }
    }
  }

  const handleMarkRead = async (id) => {
    await notifications.markRead(id)
    refetch()
  }

  const handleClick = (n) => {
    if (!n.read) handleMarkRead(n.id)
    setExpandedId((current) => (current === n.id ? null : (n.message ? n.id : null)))
  }

  const handleMarkAll = async () => {
    await notifications.markAllRead()
    refetch()
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative rounded-2xl border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-primary/30 hover:text-primary">
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-12 sm:w-96">
            <div className="max-h-[80vh] sm:max-h-[480px] bg-white sm:rounded-[20px] rounded-t-[20px] shadow-[0_-8px_40px_rgba(15,23,42,0.12)] sm:shadow-[0_24px_60px_rgba(15,23,42,0.14)] border border-slate-200/80 overflow-hidden animate-slide-up sm:animate-fade-in flex flex-col">
              <div className="flex justify-center pt-2 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-slate-300" />
              </div>

              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-slate-900 text-sm">{es ? 'Notificaciones' : 'Notifications'}</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} {es ? 'nuevas' : 'new'}</span>
                      <button onClick={handleMarkAll} className="text-xs text-slate-400 hover:text-primary transition-colors">{es ? 'Leer todas' : 'Read all'}</button>
                    </>
                  )}
                </div>
              </div>

              <div className="app-scrollbar flex-1 overflow-y-auto overscroll-contain">
                <NotificationList
                  items={list}
                  lang={lang}
                  onSelect={handleClick}
                  expandedId={expandedId}
                  variant="panel"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
