import { useState } from 'react'

export default function Toggle({ label, description, defaultChecked = false, onChange }) {
  const [checked, setChecked] = useState(defaultChecked)

  const toggle = () => {
    setChecked(!checked)
    onChange?.(!checked)
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 pr-8">
        {label && <label className="text-sm font-medium text-gray-900">{label}</label>}
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        className={`${checked ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
      >
        <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200`} />
      </button>
    </div>
  )
}
