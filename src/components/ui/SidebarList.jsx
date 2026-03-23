import Badge from './Badge'

export default function SidebarList({ groups, selectedId, onSelect, emptyText }) {
  return (
    <div className="p-3 sm:p-4 space-y-3 max-h-[65vh] overflow-y-auto">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${group.color || 'text-slate-500'}`}>{group.label}</p>
            <span className="text-[10px] font-bold text-slate-400">{group.items.length}</span>
          </div>
          {group.items.length === 0 ? (
            <div className="rounded-[--radius-sm] border border-dashed border-slate-200 px-3 py-3 text-center text-[11px] text-slate-300">—</div>
          ) : (
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = item.id === selectedId
                return (
                  <button key={item.id} type="button" onClick={() => onSelect(item.id)}
                    className="ui-sidebar-item" data-active={active || undefined}
                  >
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className={`text-[11px] truncate ${active ? 'text-white/60' : 'text-slate-500'}`}>{item.subtitle}</p>
                    {(item.meta || item.badge) && (
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        {item.meta && <span className={`text-[10px] ${active ? 'text-white/50' : 'text-slate-400'}`}>{item.meta}</span>}
                        {item.badge && <Badge color={item.badge.color} size="sm">{item.badge.label}</Badge>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
      {emptyText && groups.every((g) => g.items.length === 0) && (
        <div className="rounded-[--radius-sm] border border-dashed border-slate-200 px-4 py-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-slate-300">group_off</span>
          <p className="mt-2 text-sm text-slate-400">{emptyText}</p>
        </div>
      )}
    </div>
  )
}
