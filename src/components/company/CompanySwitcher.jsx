import { useState } from 'react'
import { createPortal } from 'react-dom'
import { copyFor } from '../../lib/locale'

export default function CompanySwitcher({ companies, selectedCompanyId, onSelect, lang }) {
  const [open, setOpen] = useState(false)
  const selected = companies.find((c) => c.id === selectedCompanyId) || companies[0]
  const es = lang === 'es'

  const dropdown = open ? createPortal(
    <>
      <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />

      <div className="fixed inset-x-0 bottom-0 z-[96] sm:hidden animate-slide-up">
        <div className="max-h-[75vh] overflow-y-auto overscroll-contain rounded-t-[--radius-xl] bg-white p-4 pb-8 shadow-[0_-8px_40px_rgba(15,23,42,0.16)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)' }}>
          <div className="flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-slate-300" /></div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">{es ? 'Selecciona empresa' : 'Select company'}</p>
          <div className="space-y-2">
            {companies.map((company) => {
              const active = company.id === selectedCompanyId
              return (
                <button key={company.id} type="button" onClick={() => { onSelect(company.id); setOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-[--radius-md] border p-3 text-left transition-all ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${active ? 'bg-white/15' : 'bg-slate-100'}`}>
                    <span className="material-symbols-outlined text-[20px]">{company.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{copyFor(lang, company.name)}</p>
                    <p className={`text-xs truncate ${active ? 'text-white/60' : 'text-slate-500'}`}>{copyFor(lang, company.segment)}</p>
                  </div>
                  {active && <span className="material-symbols-outlined text-[18px] text-white/70">check</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hidden sm:block fixed inset-0 z-[95]" onClick={() => setOpen(false)}>
        <div className="absolute right-4 top-20 w-[min(600px,calc(100vw-2rem))] rounded-[--radius-lg] bg-white p-4 shadow-[--shadow-xl] border border-slate-200 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{es ? 'Selecciona empresa' : 'Select company'}</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {companies.map((company) => {
              const active = company.id === selectedCompanyId
              return (
                <button key={company.id} type="button" onClick={() => { onSelect(company.id); setOpen(false) }}
                  className={`flex w-full items-start gap-3 rounded-[--radius-md] border p-3.5 text-left transition-all ${active ? 'border-slate-900 bg-slate-900 text-white shadow-[--shadow-active]' : 'border-slate-200 bg-white text-slate-900 hover:border-primary/25 hover:bg-slate-50'}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${active ? 'bg-white/15' : 'bg-slate-100'}`}>
                    <span className="material-symbols-outlined text-[18px]">{company.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{copyFor(lang, company.name)}</p>
                    <p className={`text-xs truncate ${active ? 'text-white/60' : 'text-slate-500'}`}>{copyFor(lang, company.segment)}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className={`text-[10px] ${active ? 'text-white/50' : 'text-slate-400'}`}>{copyFor(lang, company.footprint)}</span>
                      <span className={`text-[10px] ${active ? 'text-white/50' : 'text-slate-400'}`}>·</span>
                      <span className={`text-[10px] ${active ? 'text-white/50' : 'text-slate-400'}`}>{copyFor(lang, company.size)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((c) => !c)}
        className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-primary/25 hover:shadow-md sm:gap-2.5 sm:px-3 sm:py-2"
      >
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0">
          <span className="material-symbols-outlined text-[14px] sm:text-[16px]">{selected.icon}</span>
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="truncate text-xs font-semibold text-slate-900 max-w-[130px]">{copyFor(lang, selected.name)}</p>
        </div>
        <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {dropdown}
    </div>
  )
}
