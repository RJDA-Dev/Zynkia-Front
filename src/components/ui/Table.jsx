export default function Table({ columns = [], data = [], onRowClick, emptyIcon, emptyText }) {
  if (data.length === 0 && emptyText) {
    return (
      <div className="px-6 py-16 text-center text-slate-400">
        {emptyIcon && <span className="material-symbols-outlined text-5xl">{emptyIcon}</span>}
        <p className="mt-3 text-sm">{emptyText}</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 border-b border-slate-200/80">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-5 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-primary/[0.03]' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-5 py-3.5 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-slate-100">
        {data.map((row, i) => (
          <div
            key={row.id ?? i}
            onClick={() => onRowClick?.(row)}
            className={`p-4 space-y-2 ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
          >
            {columns.map(col => (
              <div key={col.key} className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">{col.label}</span>
                <span className="text-sm text-slate-900 text-right truncate">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
