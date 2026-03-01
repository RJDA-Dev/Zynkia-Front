export default function Pagination({ current = 1, total = 1, onPage }) {
  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1)
  return (
    <nav className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 py-4">
      <button onClick={() => onPage?.(Math.max(1, current - 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage?.(p)}
          className={`h-9 w-9 rounded-xl transition-colors ${p === current ? 'bg-primary text-white font-bold shadow-sm' : 'hover:bg-gray-100'}`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPage?.(Math.min(total, current + 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </nav>
  )
}
