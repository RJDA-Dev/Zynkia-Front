const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm',
  danger: 'bg-white border border-red-200 text-red-600 hover:bg-red-50',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
  ghost: 'text-gray-500 hover:text-primary hover:bg-gray-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

const iconSizes = { sm: 'text-[16px]', md: 'text-[18px]', lg: 'text-[20px]' }

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className={`material-symbols-outlined ${iconSizes[size]}`}>{icon}</span>}
      {children}
    </button>
  )
}
