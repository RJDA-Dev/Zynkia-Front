import { useState, useRef, useEffect } from 'react'
import { useLang } from '../../context/LangContext'
import { formLabelClass, formPickerButtonClass } from './formStyles'

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

function fmt(hr, min, is12h) {
  if (hr == null) return ''
  const mm = String(min ?? 0).padStart(2, '0')
  if (is12h) return `${hr % 12 || 12}:${mm} ${hr >= 12 ? 'PM' : 'AM'}`
  return `${String(hr).padStart(2, '0')}:${mm}`
}

function TimeGrid({ value, onChange, onClose, es, is12h }) {
  const [h, m] = value ? value.split(':').map(Number) : [null, null]
  const select = (hr, min) => { onChange?.(`${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`); onClose() }

  return (
    <>
      <div className="border-b border-slate-100 bg-[linear-gradient(90deg,_rgba(15,118,110,0.08),_rgba(255,255,255,0.96))] px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="material-symbols-outlined text-primary text-lg">schedule</span>
          {value ? fmt(h, m, is12h) : (es ? 'Selecciona hora' : 'Pick a time')}
        </p>
      </div>
      <div className="p-3 max-h-[320px] sm:max-h-[280px] overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-4 gap-1">
          {HOURS_24.map(hr => MINUTES.map(min => {
            const sel = h === hr && m === min
            const isNight = hr >= 21 || hr < 6
            return (
              <button key={`${hr}:${min}`} type="button" onClick={() => select(hr, min)}
                className={`py-2.5 sm:py-1.5 rounded-xl text-sm sm:text-xs font-medium transition-all
                  ${sel ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                  ${isNight && !sel ? 'bg-slate-50 text-slate-400 hover:bg-slate-100' : ''}
                  ${!sel && !isNight ? 'text-slate-700 hover:bg-slate-100' : ''}
                `}
              >{fmt(hr, min, is12h)}</button>
            )
          }))}
        </div>
      </div>
      <div className="flex justify-between border-t border-slate-100 px-4 py-3">
        {value && (
          <button type="button" onClick={() => { onChange?.(''); onClose() }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            {es ? 'Limpiar' : 'Clear'}
          </button>
        )}
      </div>
    </>
  )
}

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

  const close = () => setOpen(false)

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className={formLabelClass}>{label}</label>}
      <button type="button" onClick={() => setOpen(!open)}
        className={`${formPickerButtonClass} ${open ? 'border-primary ring-4 ring-primary/10' : ''}`}
      >
        <span className={`material-symbols-outlined text-[18px] ${open ? 'text-primary' : 'text-slate-400'}`}>schedule</span>
        <span className={value ? 'font-medium text-slate-900' : 'text-slate-400'}>{fmt(h, m, is12h) || placeholder || (es ? 'Seleccionar hora' : 'Select time')}</span>
        <span className={`material-symbols-outlined ml-auto text-[16px] transition-transform ${open ? 'rotate-180 text-primary' : 'text-slate-300'}`}>expand_more</span>
      </button>

      {open && (
        <>
          <div className="hidden sm:block absolute left-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-[--radius-lg] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] animate-fade-in">
            <TimeGrid value={value} onChange={onChange} onClose={close} es={es} is12h={is12h} />
          </div>

          <div className="sm:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={close} />
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] animate-slide-up max-h-[85vh] overflow-auto">
            <div className="flex justify-center pt-2 pb-1"><div className="h-1 w-10 rounded-full bg-slate-300" /></div>
            <TimeGrid value={value} onChange={onChange} onClose={close} es={es} is12h={is12h} />
          </div>
        </>
      )}
    </div>
  )
}
