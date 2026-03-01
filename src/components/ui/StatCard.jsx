export default function StatCard({ label, value, change, icon, iconColor = 'text-primary bg-primary/10' }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        {icon && (
          <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${iconColor}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
      </div>
      <p className="text-gray-900 text-2xl font-bold">{value}</p>
      {change && <p className="text-xs text-gray-400 mt-0.5">{change}</p>}
    </div>
  )
}
