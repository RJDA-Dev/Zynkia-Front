export default function ProgressBar({ value = 0, max = 100, label, showPercent = true }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div>
          {label && <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500">/ {max}</span>
          </div>
        </div>
        {showPercent && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{pct}%</span>}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
