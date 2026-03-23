import InteractivePanel from '../ui/InteractivePanel'

export default function WorkstreamCard({ workstream, theme }) {
  return (
    <InteractivePanel className={`h-full border ${theme.border} bg-gradient-to-br ${theme.sectionTint} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${theme.iconWrap}`}>
          <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{workstream.icon}</span>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold ring-1 ring-inset shrink-0 ${theme.badge}`}>
          {workstream.status}
        </span>
      </div>

      <div className="mt-3 sm:mt-4">
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">{workstream.title}</h3>
        <p className="mt-1.5 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">{workstream.description}</p>
      </div>

      <div className={`mt-4 grid gap-2.5 rounded-[--radius-md] p-3 sm:p-4 ${theme.softSurface} grid-cols-2`}>
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Responsable</p>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 truncate">{workstream.owner}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Carga activa</p>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900">{workstream.load}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Avance base</span>
          <span>{workstream.progress}%</span>
        </div>
        <div className={`mt-1.5 h-1.5 sm:h-2 overflow-hidden rounded-full ${theme.progressTrack}`}>
          <div className={`h-full rounded-full transition-all duration-700 ${theme.progressFill}`} style={{ width: `${workstream.progress}%` }} />
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {workstream.items.map((item) => (
          <li key={item} className="flex gap-2 text-xs sm:text-sm text-slate-600">
            <span className={`material-symbols-outlined mt-0.5 text-[16px] shrink-0 ${theme.link}`}>check_circle</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </InteractivePanel>
  )
}
