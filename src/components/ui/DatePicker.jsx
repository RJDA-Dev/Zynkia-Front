import { useState, useRef, useEffect } from 'react'
import { useLang } from '../../context/LangContext'

const MO_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MO_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MO_SHORT_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MO_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DH_ES = ['D','L','M','M','J','V','S']
const DH_EN = ['S','M','T','W','T','F','S']

export default function DatePicker({ label, value, onChange, className = '', placeholder }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('days')
  const parsed = value instanceof Date ? value : value ? new Date(value + (typeof value === 'string' && value.length === 10 ? 'T12:00:00' : '')) : null
  const [viewing, setViewing] = useState(() => parsed || new Date())
  const ref = useRef()
  const langCtx = useLang()
  const lang = langCtx?.lang || 'es'
  const es = lang === 'es'

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

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView('days') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const select = (d) => { onChange?.(new Date(year, month, d)); setOpen(false); setView('days') }
  const formatted = parsed ? `${parsed.getDate()} ${MO_S[parsed.getMonth()]} ${parsed.getFullYear()}` : ''

  const yearRange = Array.from({ length: 12 }, (_, i) => year - 5 + i)

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white text-left text-sm shadow-sm transition-all
          ${open ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className={`material-symbols-outlined text-[18px] ${open ? 'text-primary' : 'text-gray-400'}`}>calendar_today</span>
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>{formatted || placeholder || (es ? 'Seleccionar fecha' : 'Select date')}</span>
        <span className={`material-symbols-outlined text-[16px] ml-auto transition-transform ${open ? 'rotate-180 text-primary' : 'text-gray-300'}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-200 w-[300px] overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-primary/5 to-purple-50/50 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <button onClick={() => setViewing(new Date(year, month - 1, 1))} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button onClick={() => setView(view === 'days' ? 'months' : view === 'months' ? 'years' : 'days')} className="px-3 py-1 rounded-lg hover:bg-white text-sm font-bold text-gray-900 transition-colors">
                {view === 'years' ? `${yearRange[0]} - ${yearRange[11]}` : view === 'months' ? year : `${MO[month]} ${year}`}
              </button>
              <button onClick={() => setViewing(new Date(year, month + 1, 1))} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="p-3">
            {view === 'days' && (
              <>
                <div className="grid grid-cols-7 mb-1">
                  {DH.map((d, i) => <div key={i} className={`text-[10px] font-bold text-center py-1.5 ${i === 0 ? 'text-gray-300' : 'text-gray-400'}`}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="h-9" />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1
                    const sel = isSel(d)
                    const td = isToday(d)
                    const isSun = new Date(year, month, d).getDay() === 0
                    return (
                      <button
                        key={d}
                        onClick={() => select(d)}
                        className={`h-9 w-full flex items-center justify-center rounded-lg text-xs font-medium transition-all
                          ${sel ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105' : ''}
                          ${td && !sel ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/30' : ''}
                          ${isSun && !sel && !td ? 'text-gray-300' : ''}
                          ${!sel && !td && !isSun ? 'text-gray-700 hover:bg-gray-100' : ''}
                        `}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button onClick={() => { const t = new Date(); setViewing(t); onChange?.(t); setOpen(false) }} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                    {es ? 'Hoy' : 'Today'}
                  </button>
                  {value && (
                    <button onClick={() => { onChange?.(null); setOpen(false) }} className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                      {es ? 'Limpiar' : 'Clear'}
                    </button>
                  )}
                </div>
              </>
            )}

            {view === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {MO_S.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => { setViewing(new Date(year, i, 1)); setView('days') }}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all
                      ${i === month ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                      ${i === today.getMonth() && year === today.getFullYear() && i !== month ? 'bg-primary/10 text-primary' : ''}
                      ${i !== month && !(i === today.getMonth() && year === today.getFullYear()) ? 'text-gray-700 hover:bg-gray-100' : ''}
                    `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {view === 'years' && (
              <div className="grid grid-cols-3 gap-2">
                {yearRange.map(y => (
                  <button
                    key={y}
                    onClick={() => { setViewing(new Date(y, month, 1)); setView('months') }}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all
                      ${y === year ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : ''}
                      ${y === today.getFullYear() && y !== year ? 'bg-primary/10 text-primary' : ''}
                      ${y !== year && y !== today.getFullYear() ? 'text-gray-700 hover:bg-gray-100' : ''}
                    `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
