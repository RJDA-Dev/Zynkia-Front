export default function StageHero({ eyebrow, title, description, chips = [], snapshot = [], icon = 'hub', theme }) {
  return (
    <section className={`relative overflow-hidden rounded-[--radius-lg] sm:rounded-[32px] border ${theme.heroBorder} bg-gradient-to-br ${theme.heroGradient} p-5 sm:p-8 lg:p-10 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]`}>
      <div className="absolute inset-0 opacity-40 sm:opacity-50 pointer-events-none">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-40 w-40 rounded-full bg-amber-200/10 blur-3xl" />
      </div>

      <div className="relative grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)]">
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] ${theme.heroChip}`}>
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">layers</span>
            <span className="truncate">{eyebrow}</span>
          </div>

          <div className="space-y-3">
            <div className={`flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl ${theme.heroIcon}`}>
              <span className="material-symbols-outlined text-[22px] sm:text-[28px]">{icon}</span>
            </div>
            <h2 className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/78">{description}</p>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <div key={`${chip.icon}-${chip.label}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs sm:text-sm ${theme.heroChip}`}>
                  <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {snapshot.length > 0 && (
          <div className="grid gap-2.5 grid-cols-3 lg:grid-cols-1 self-end">
            {snapshot.map((item) => (
              <div key={item.label} className="rounded-[--radius-md] sm:rounded-[--radius-lg] border border-white/12 bg-white/10 p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-[9px] sm:text-xs uppercase tracking-[0.14em] text-white/60 truncate">{item.label}</p>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold">{item.value}</p>
                {item.helper && <p className="mt-1 text-[11px] sm:text-sm text-white/72 hidden sm:block">{item.helper}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
