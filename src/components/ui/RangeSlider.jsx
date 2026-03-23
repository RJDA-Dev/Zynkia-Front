import { formLabelClass, formRangeClass } from './formStyles'

export default function RangeSlider({
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  helper,
  className = '',
  onChange,
}) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : min
  const percent = max === min ? 0 : ((safeValue - min) * 100) / (max - min)

  return (
    <div className={`rounded-[--radius-lg] border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}>
      {(label || helper) && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {label && <label className={`${formLabelClass} mb-0`}>{label}</label>}
            {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {safeValue}
            {suffix}
          </span>
        </div>
      )}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(event) => onChange?.(event)}
        className={formRangeClass}
        style={{
          background: `linear-gradient(90deg, rgba(15,118,110,0.96) 0%, rgba(15,118,110,0.96) ${percent}%, rgba(226,232,240,1) ${percent}%, rgba(226,232,240,1) 100%)`,
        }}
      />
    </div>
  )
}
