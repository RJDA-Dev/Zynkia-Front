export default function Input({ label, icon, type = 'text', className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </span>
        )}
        <input
          type={type}
          className={`block w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm py-2 transition-colors ${icon ? 'pl-10' : 'px-3.5'}`}
          {...props}
        />
      </div>
    </div>
  )
}
