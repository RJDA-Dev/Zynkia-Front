import { useState, useRef, useEffect } from 'react'
import { useLang } from '../../context/LangContext'
import { formLabelClass, formPickerButtonClass } from './formStyles'

const MO_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MO_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MO_SHORT_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MO_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DH_ES = ['D','L','M','M','J','V','S']
const DH_EN = ['S','M','T','W','T','F','S']

function CalendarContent({ viewing, setViewing, parsed, view, setView, onChange, onClose, es }) {
  const MO = es ? MO_ES : MO_EN
  const MO_S = es ? MO_SHORT_ES : MO_SHORT_EN
  const DH = es ? DH_ES : DH_EN
  const year = viewing.getFullYear()
  const month = viewing.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isSel = (d) => parsed && parsed.getDate() === d && parsed.getMonth() === month && parsed.getFullYear() === year
  const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
  const yearRange = Array.from({ length: 12 }, (_, i) => year - 5 + i)

  const select = (d) => { onChange?.(new Date(year, month, d)); onClose() }

  return (
    <>
      <div className="border-b border-slate-100 bg-[linear-gradient(90deg,_rgba(15,118,110,0.08),_rgba(255,255,255,0.96))] px-4 py-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setViewing(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button type="button" onClick={() => setView(view === 'days' ? 'months' : view === 'months' ? 'years' : 'days')} className="rounded-lg px-3 py-1 text-sm font-bold text-slate-900 hover:bg-white transition-colors">
            {view === 'years' ? `${yearRange[0]}–${yearRange[11]}` : view === 'months' ? year : `${MO[month]} ${year}`}
          </button>
          <button type="button" onClick={() => setViewing(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {view === 'days' && (
          <>
            <div className="grid grid-cols-7 mb-1">
              {DH.map((d, i) => <div key={i} className={`py-1.5 text-center text-[11px] font-bold ${i === 0 ? 'text-slate-300' : 'text-slate-400'}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="h-10 sm:h-9" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const sel = isSel(d)
                const td = isToday(d)
                const isSun = new Date(year, month, d).getDay() === 0
                return (
                  <button key={d} type="button" onClick={() => select(d)}
                    className={`h-10 sm:h-9 w-full flex items-center justify-center rounded-xl text-sm sm:text-xs font-medium transition-all
                      ${sel ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105' : ''}
                      ${td && !sel ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/30' : ''}
                      ${isSun && !sel && !td ? 'text-slate-300' : ''}
                      ${!sel && !td && !isSun ? 'text-slate-700 hover:bg-slate-100' : ''}
                    `}
                  >{d}</button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <button type="button" onClick={() => { onChange?.(new Date()); onClose() }} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                {es ? 'Hoy' : 'Today'}
              </button>
              <button type="button" onClick={() => { onChange?.(null); onClose() }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
                {es ? 'Limpiar' : 'Clear'}
              </button>
            </div>
          </>
        )}

        {view === 'months' && (
          <div className="grid grid-cols-3 gap-2">
            {MO_S.map((m, i) => (
              <button key={i} type="button" onClick={() => { setViewing(new Date(year, i, 1)); setView('days') }}
                className={`py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all
                  ${i === month ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                  ${i === today.getMonth() && year === today.getFullYear() && i !== month ? 'bg-primary/10 text-primary' : ''}
                  ${i !== month && !(i === today.getMonth() && year === today.getFullYear()) ? 'text-slate-700 hover:bg-slate-100' : ''}
                `}
              >{m}</button>
            ))}
          </div>
        )}

        {view === 'years' && (
          <div className="grid grid-cols-3 gap-2">
            {yearRange.map(y => (
              <button key={y} type="button" onClick={() => { setViewing(new Date(y, month, 1)); setView('months') }}
                className={`py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all
                  ${y === year ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                  ${y === today.getFullYear() && y !== year ? 'bg-primary/10 text-primary' : ''}
                  ${y !== year && y !== today.getFullYear() ? 'text-slate-700 hover:bg-slate-100' : ''}
                `}
              >{y}</button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function DatePicker({ label, value, onChange, className = '', placeholder }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('days')
  const parsed = value instanceof Date ? value : value ? new Date(value + (typeof value === 'string' && value.length === 10 ? 'T12:00:00' : '')) : null
  const [viewing, setViewing] = useState(() => parsed || new Date())
  const ref = useRef()
  const langCtx = useLang()
  const es = (langCtx?.lang || 'es') === 'es'
  const MO_S = es ? MO_SHORT_ES : MO_SHORT_EN
  const formatted = parsed ? `${parsed.getDate()} ${MO_S[parsed.getMonth()]} ${parsed.getFullYear()}` : ''

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView('days') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const close = () => { setOpen(false); setView('days') }

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className={formLabelClass}>{label}</label>}
      <button type="button" onClick={() => setOpen(!open)}
        className={`${formPickerButtonClass} ${open ? 'border-primary ring-4 ring-primary/10' : ''}`}
      >
        <span className={`material-symbols-outlined text-[18px] ${open ? 'text-primary' : 'text-slate-400'}`}>calendar_today</span>
        <span className={value ? 'font-medium text-slate-900' : 'text-slate-400'}>{formatted || placeholder || (es ? 'Seleccionar fecha' : 'Select date')}</span>
        <span className={`material-symbols-outlined ml-auto text-[16px] transition-transform ${open ? 'rotate-180 text-primary' : 'text-slate-300'}`}>expand_more</span>
      </button>

      {open && (
        <>
          <div className="hidden sm:block absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-[--radius-lg] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] animate-fade-in">
            <CalendarContent viewing={viewing} setViewing={setViewing} parsed={parsed} view={view} setView={setView} onChange={onChange} onClose={close} es={es} />
          </div>

          <div className="sm:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={close} />
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] animate-slide-up max-h-[85vh] overflow-auto">
            <div className="flex justify-center pt-2 pb-1"><div className="h-1 w-10 rounded-full bg-slate-300" /></div>
            <CalendarContent viewing={viewing} setViewing={setViewing} parsed={parsed} view={view} setView={setView} onChange={onChange} onClose={close} es={es} />
          </div>
        </>
      )}
    </div>
  )
}
