const colorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

export default function ProgressBar({ value = 0, max = 100, label, showPercent = true, color = 'primary', size = 'md' }) {
  const pct = Math.round((value / max) * 100)
  const barHeight = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div>
      <div className="flex justify-between items-end mb-2 gap-2">
        <div className="min-w-0">
          {label && <h3 className="text-xs sm:text-sm font-medium text-slate-500 mb-0.5">{label}</h3>}
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{value}</span>
            <span className="text-xs sm:text-sm text-slate-500">/ {max}</span>
          </div>
        </div>
        {showPercent && <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">{pct}%</span>}
      </div>
      <div className={`w-full bg-slate-100 rounded-full ${barHeight} overflow-hidden`}>
        <div className={`${colorMap[color] || colorMap.primary} ${barHeight} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
