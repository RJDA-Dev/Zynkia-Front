export default function Pagination({ current = 1, total = 1, onPage }) {
  if (total <= 1) return null

  const range = []
  const delta = 1
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)

  range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  if (total > 1) range.push(total)

  return (
    <nav className="flex items-center justify-between gap-3 px-2 py-4 sm:justify-center" aria-label="Pagination">
      <button
        onClick={() => onPage?.(Math.max(1, current - 1))}
        disabled={current === 1}
        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none sm:px-2"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        <span className="sm:hidden">{current > 1 ? current - 1 : ''}</span>
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {range.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-1 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage?.(p)}
              className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                p === current
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <span className="text-sm text-slate-500 sm:hidden">
        {current} / {total}
      </span>

      <button
        onClick={() => onPage?.(Math.min(total, current + 1))}
        disabled={current === total}
        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none sm:px-2"
      >
        <span className="sm:hidden">{current < total ? current + 1 : ''}</span>
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </nav>
  )
}
