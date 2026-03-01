export default function Tabs({ items = [], active, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-gray-500">
        {items.map(item => (
          <li key={item.key} className="mr-1">
            <button
              onClick={() => onChange?.(item.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm ${
                active === item.key
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              {item.icon && <span className="material-symbols-outlined text-[18px]">{item.icon}</span>}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
