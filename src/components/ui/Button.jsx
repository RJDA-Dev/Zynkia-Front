const variants = {
  primary: 'bg-slate-900 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)] hover:bg-slate-800',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary/30 hover:bg-slate-50',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  success: 'bg-success text-white shadow-[0_18px_34px_rgba(21,128,61,0.18)] hover:brightness-[0.96]',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-primary',
}

const sizes = {
  xs: 'px-2.5 py-1 text-[11px] gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

const iconSizes = { xs: 'text-[14px]', sm: 'text-[16px]', md: 'text-[18px]', lg: 'text-[20px]' }

export default function Button({ variant = 'primary', size = 'md', icon, iconRight, loading: isLoading, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded-[--radius-md] font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !isLoading && <span className={`material-symbols-outlined ${iconSizes[size]}`}>{iconRight}</span>}
    </button>
  )
}
