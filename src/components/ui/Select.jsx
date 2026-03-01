export default function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>}
      <select
        className="block w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm py-2 px-3.5 transition-colors cursor-pointer"
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
