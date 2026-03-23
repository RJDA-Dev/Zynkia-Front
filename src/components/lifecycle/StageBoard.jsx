import InteractivePanel from '../ui/InteractivePanel'

export default function StageBoard({ lanes, theme }) {
  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {lanes.map((lane) => (
        <section key={lane.title} className={`relative overflow-hidden rounded-[--radius-lg] sm:rounded-[26px] border ${theme.border} bg-white/88 p-3.5 sm:p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)]`}>
          <div className="pointer-events-none absolute inset-x-[-45%] top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-slate-700 truncate">{lane.title}</h3>
            <span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset shrink-0 ${theme.badge}`}>
              {lane.count}
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {lane.items.map((item) => (
              <InteractivePanel key={item.title} className={`border ${theme.border} bg-slate-50/70 p-3 sm:p-4`}>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.12em] text-slate-500">{item.meta}</p>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600">{item.note}</p>
              </InteractivePanel>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
