export default function Card({ title, subtitle, badge, actions, className = '', children }) {
  return (
    <div className={`overflow-hidden rounded-[--radius-lg] sm:rounded-[--radius-xl] border border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/65 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {title && <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="mt-1 text-xs sm:text-sm leading-5 text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
