import { useState, useRef, useEffect } from 'react'
import { useLang } from '../../context/LangContext'

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

export default function TimePicker({ label, value, onChange, className = '', placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const langCtx = useLang()
  const es = (langCtx?.lang || 'es') === 'es'
  const is12h = (localStorage.getItem('timeFormat') || '24h') === '12h'

  const [h, m] = value ? value.split(':').map(Number) : [null, null]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fmt = (hr, min) => {
    if (hr == null) return ''
    const mm = String(min ?? 0).padStart(2, '0')
    if (is12h) return `${hr % 12 || 12}:${mm} ${hr >= 12 ? 'PM' : 'AM'}`
    return `${String(hr).padStart(2, '0')}:${mm}`
  }

  const select = (hr, min) => {
    onChange?.(`${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white text-left text-sm shadow-sm transition-all
          ${open ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className={`material-symbols-outlined text-[18px] ${open ? 'text-primary' : 'text-gray-400'}`}>schedule</span>
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>{fmt(h, m) || placeholder || (es ? 'Seleccionar hora' : 'Select time')}</span>
        <span className={`material-symbols-outlined text-[16px] ml-auto transition-transform ${open ? 'rotate-180 text-primary' : 'text-gray-300'}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-200 w-[280px] overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-primary/5 to-purple-50/50 px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">schedule</span>
              {value ? fmt(h, m) : (es ? 'Selecciona hora' : 'Pick a time')}
            </p>
          </div>
          <div className="p-3 max-h-[280px] overflow-y-auto">
            <div className="grid grid-cols-4 gap-1">
              {HOURS_24.map(hr => MINUTES.map(min => {
                const sel = h === hr && m === min
                const isNight = hr >= 21 || hr < 6
                return (
                  <button
                    key={`${hr}:${min}`}
                    onClick={() => select(hr, min)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all
                      ${sel ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                      ${isNight && !sel ? 'text-gray-400 bg-gray-50' : ''}
                      ${!sel && !isNight ? 'text-gray-700 hover:bg-gray-100' : ''}
                      ${!sel && isNight ? 'hover:bg-gray-100' : ''}
                    `}
                  >
                    {fmt(hr, min)}
                  </button>
                )
              }))}
            </div>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 flex justify-between">
            {value && (
              <button onClick={() => { onChange?.(''); setOpen(false) }} className="text-xs font-medium text-gray-400 hover:text-gray-600">
                {es ? 'Limpiar' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
