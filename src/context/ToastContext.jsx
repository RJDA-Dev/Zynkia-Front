import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null)

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) setTimeout(() => removeToast(id), duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300)
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast])
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast])
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast])

  const showConfirm = useCallback(({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) => {
    setConfirm({ title, message, onConfirm, onCancel, confirmText, cancelText, variant })
  }, [])

  const closeConfirm = useCallback(() => setConfirm(null), [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info, showConfirm }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {confirm && <ConfirmDialog {...confirm} onClose={closeConfirm} />}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

const icons = {
  success: { icon: 'check_circle', color: 'text-green-500' },
  error: { icon: 'error', color: 'text-red-500' },
  warning: { icon: 'warning', color: 'text-amber-500' },
  info: { icon: 'info', color: 'text-blue-500' },
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-3 ${t.exiting ? 'animate-slide-out' : 'animate-slide-in'}`}
        >
          <span className={`material-symbols-outlined ${icons[t.type].color} mt-0.5`}>{icons[t.type].icon}</span>
          <p className="text-sm text-gray-700 flex-1">{t.message}</p>
          <button onClick={() => onRemove(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

const confirmVariants = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  primary: 'bg-primary hover:bg-primary-hover text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
}

function ConfirmDialog({ title, message, onConfirm, onCancel, onClose, confirmText, cancelText, variant }) {
  const handleConfirm = () => { onConfirm?.(); onClose() }
  const handleCancel = () => { onCancel?.(); onClose() }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleCancel} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.97]">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-colors cursor-pointer active:scale-[0.97] ${confirmVariants[variant]}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
