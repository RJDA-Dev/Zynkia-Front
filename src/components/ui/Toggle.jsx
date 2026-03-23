import { useState } from 'react'

export default function Toggle({ label, description, defaultChecked = false, checked: controlledChecked, disabled = false, onChange }) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const checked = controlledChecked ?? internalChecked

  const toggle = () => {
    if (disabled) return
    if (controlledChecked == null) setInternalChecked(!checked)
    onChange?.(!checked)
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 pr-8">
        {label && <label className="text-sm font-medium text-slate-900">{label}</label>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={`${checked ? 'bg-primary' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200`} />
      </button>
    </div>
  )
}
