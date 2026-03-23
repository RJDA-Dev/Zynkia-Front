import { formLabelClass, formSelectClass } from './formStyles'

export default function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className={formLabelClass}>{label}</label>}
      <div className="relative">
        <select
          className={formSelectClass}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </span>
      </div>
    </div>
  )
}
