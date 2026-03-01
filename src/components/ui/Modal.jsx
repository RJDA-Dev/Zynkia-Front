export default function Modal({ open, onClose, title, subtitle, icon = 'smart_toy', size = 'lg', children, footer }) {
  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${sizes[size]} bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[90vh] animate-fade-in`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  )
}
