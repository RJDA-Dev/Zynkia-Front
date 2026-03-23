import Button from './Button'

export default function EmptyState({ icon = 'inbox', title, description, actionLabel, actionIcon, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <span className="material-symbols-outlined text-[32px] text-slate-400">{icon}</span>
      </div>
      {title && <p className="text-base font-semibold text-slate-700">{title}</p>}
      {description && <p className="mt-1 max-w-xs text-sm text-slate-400">{description}</p>}
      {actionLabel && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" icon={actionIcon} onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
