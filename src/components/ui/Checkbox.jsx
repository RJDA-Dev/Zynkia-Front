import { formCheckboxClass } from './formStyles'

export default function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3 ${disabled ? 'opacity-60' : ''} ${className}`}>
      <div className="min-w-0">
        {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked, event)}
        disabled={disabled}
        className={formCheckboxClass}
      />
    </label>
  )
}
