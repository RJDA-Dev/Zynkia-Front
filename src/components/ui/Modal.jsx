import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

export default function Modal({ open, onClose, title, subtitle, icon = 'smart_toy', size = 'lg', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`w-full ${sizes[size]} bg-white sm:rounded-[--radius-lg] rounded-t-[24px] shadow-[0_-8px_40px_rgba(15,23,42,0.12)] sm:shadow-[0_30px_80px_rgba(15,23,42,0.16)] border border-slate-200/80 flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[85vh] animate-expand-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        {title && (
          <div className="px-5 py-4 sm:px-6 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-100 transition-colors shrink-0 ml-2" aria-label="Close">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto overscroll-contain">{children}</div>
        {footer && (
          <div className="px-5 py-3 sm:px-6 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}
