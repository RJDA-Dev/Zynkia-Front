export default function Tabs({ items = [], active, onChange }) {
  return (
    <div className="border-b border-slate-200/80 overflow-x-auto scrollbar-none">
      <ul className="flex -mb-px text-sm font-medium text-slate-500 min-w-max">
        {items.map(item => (
          <li key={item.key}>
            <button
              onClick={() => onChange?.(item.key)}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 border-b-2 transition-all text-sm ${
                active === item.key
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {item.icon && <span className="material-symbols-outlined text-[18px]">{item.icon}</span>}
              {item.label}
              {item.count != null && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active === item.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                  {item.count}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
