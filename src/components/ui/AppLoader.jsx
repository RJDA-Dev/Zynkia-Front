export default function AppLoader({ inline = false, label = 'Cargando', detail = '' }) {
  const wrapperClass = inline
    ? 'min-h-[200px] sm:min-h-[240px] rounded-[--radius-lg] sm:rounded-[--radius-xl] border border-white/70 bg-white/72 backdrop-blur-md shadow-[0_24px_70px_rgba(15,23,42,0.08)]'
    : 'fixed inset-0 z-[9999] bg-slate-950/28 backdrop-blur-sm'

  return (
    <div className={`${wrapperClass} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/15 bg-primary/10 animate-halo-pulse" />
          <div className="absolute inset-1 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
          <span className="material-symbols-outlined relative text-[24px] sm:text-[28px] text-primary">hub</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-slate-700">{label}</p>
          {detail && <p className="max-w-xs text-xs sm:text-sm text-slate-500">{detail}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} className="h-2 w-2 rounded-full bg-primary/70" style={{ animation: `pulse-dot 1s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
