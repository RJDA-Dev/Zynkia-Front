import { formControlClass, formLabelClass } from './formStyles'

export default function Input({ label, icon, type = 'text', className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className={formLabelClass}>{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </span>
        )}
        <input
          type={type}
          className={`${formControlClass} ${icon ? 'pl-10 pr-3.5' : 'px-3.5'}`}
          {...props}
        />
      </div>
    </div>
  )
}
