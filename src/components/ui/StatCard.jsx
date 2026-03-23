import { getStatToneClass } from '../../config/uiTokens'

export default function StatCard({
  label,
  value,
  change,
  icon,
  tone = '',
  iconColor = 'text-primary bg-primary/10',
  className = '',
  valueClassName = '',
}) {
  const resolvedTone = tone ? getStatToneClass(tone) : iconColor

  return (
    <div className={`relative overflow-hidden rounded-[--radius-lg] sm:rounded-[26px] border border-slate-200/80 bg-white/88 p-4 sm:p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)] ${className}`}>
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 leading-tight">{label}</p>
        {icon && (
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl shrink-0 ${resolvedTone || iconColor}`}>
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
          </div>
        )}
      </div>
      <p className={`mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate ${valueClassName}`}>{value}</p>
      {change && <p className="mt-1 text-xs sm:text-sm text-slate-500">{change}</p>}
    </div>
  )
}
