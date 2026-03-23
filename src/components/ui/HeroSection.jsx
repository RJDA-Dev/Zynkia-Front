export default function HeroSection({ gradient, chips, children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[--radius-xl] sm:rounded-[32px] bg-gradient-to-br ${gradient} p-5 sm:p-7 text-white shadow-[--shadow-xl] ${className}`}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative z-10">
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {chips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ring-white/15">
                {chip.icon && <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>}
                {chip.label}
              </span>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
