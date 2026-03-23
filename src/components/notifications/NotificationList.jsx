import { getSurfaceToneClass, notificationTypeMeta } from '../../config/uiTokens'
import { formatRelativeTime } from '../../lib/formatters'

function resolveType(type) {
  return notificationTypeMeta[type] || notificationTypeMeta.info
}

export default function NotificationList({
  items,
  lang,
  onSelect,
  expandedId = null,
  variant = 'panel',
  emptyLabel,
}) {
  const es = lang === 'es'
  const isPanel = variant === 'panel'

  if (!items.length) {
    return (
      <div className={`${isPanel ? 'p-8' : 'rounded-[--radius-lg] border border-slate-200 bg-white p-8 shadow-sm'} text-center text-slate-400`}>
        <span className="material-symbols-outlined text-4xl">notifications_off</span>
        <p className="mt-2 text-sm">{emptyLabel || (es ? 'Sin notificaciones' : 'No notifications')}</p>
      </div>
    )
  }

  return (
    <div className={isPanel ? 'divide-y divide-slate-50' : 'space-y-2'}>
      {items.map((item) => {
        const meta = resolveType(item.type)
        const expanded = expandedId === item.id
        const unread = !item.read

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item)}
            className={`w-full text-left transition-all ${isPanel
              ? `flex items-start gap-3 px-4 py-3 hover:bg-slate-50 ${unread ? 'bg-primary/[0.04]' : ''}`
              : `flex items-start gap-3 rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${unread ? 'ring-1 ring-primary/10 bg-primary/[0.02]' : ''}`}`}
          >
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getSurfaceToneClass(meta.tone)}`}>
              <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`truncate text-sm font-medium ${unread ? 'text-slate-900' : 'text-slate-600'}`}>{item.title}</p>
                {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
              {item.message && (
                <p className={`mt-1 text-xs leading-5 ${expanded ? 'whitespace-pre-wrap text-slate-600' : 'truncate text-slate-500'}`}>
                  {item.message}
                </p>
              )}
            </div>

            <span className={`mt-0.5 shrink-0 ${isPanel ? 'text-[10px]' : 'text-[11px]'} text-slate-400`}>
              {formatRelativeTime(item.createdAt, lang)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
