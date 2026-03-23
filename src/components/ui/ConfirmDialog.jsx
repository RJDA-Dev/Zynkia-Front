import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger', icon = 'warning', loading }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm bg-white sm:rounded-[--radius-lg] rounded-t-[24px] shadow-[0_-8px_40px_rgba(15,23,42,0.12)] sm:shadow-[0_30px_80px_rgba(15,23,42,0.16)] border border-slate-200/80 overflow-hidden animate-expand-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <span className="material-symbols-outlined text-[28px]">{icon}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {message && <p className="mt-2 text-sm text-slate-500">{message}</p>}
        </div>
        <div className="flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-center sm:gap-3">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">{cancelText || 'Cancelar'}</Button>
          <Button variant={variant} icon={icon} onClick={onConfirm} loading={loading} className="w-full sm:w-auto">{confirmText || 'Confirmar'}</Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
