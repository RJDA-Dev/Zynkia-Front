import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import CompanySwitcher from '../components/company/CompanySwitcher'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationPanel from '../components/NotificationPanel'
import { getPageTitle, workspaceNavigation } from '../config/navigation'
import { shellTheme } from '../config/theme'
import { useLang } from '../context/LangContext'
import { useRole } from '../context/RoleContext'
import { companyProfiles, defaultCompanyId, getCompanyProfile } from '../data/companyProfiles'
import { copyFor } from '../lib/locale'
import usePresence from '../hooks/usePresence'

export default function SidebarLayout() {
  const { pathname } = useLocation()
  const { lang, setLang } = useLang()
  const { hasAccess } = useRole()
  usePresence()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('shell-sidebar-collapsed') === '1')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => localStorage.getItem('active-company-id') || defaultCompanyId)

  const title = getPageTitle(pathname, lang)
  const formattedDate = new Date().toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const selectedCompany = getCompanyProfile(selectedCompanyId)
  const mobileNavItems = workspaceNavigation
    .flatMap((section) => section.items)
    .filter((item) => hasAccess(item.module))
    .filter((item) => ['/dashboard', '/vacancies', '/lifecycle/contratacion', '/lifecycle/administracion', '/lifecycle/retiro'].includes(item.to))

  useEffect(() => {
    localStorage.setItem('active-company-id', selectedCompanyId)
  }, [selectedCompanyId])

  useEffect(() => {
    localStorage.setItem('shell-sidebar-collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-warning/12 blur-3xl" />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[292px] transform flex-col p-4 transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex h-full flex-col rounded-[30px] ${shellTheme.panel}`}>
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <span className="block text-base font-bold tracking-tight text-slate-900">Zekya HR</span>
                <span className="block text-xs text-slate-500">{copyFor(lang, selectedCompany.segment)}</span>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="border-b border-slate-200/70 px-4 py-3">
            <CompanySwitcher companies={companyProfiles} selectedCompanyId={selectedCompanyId} onSelect={setSelectedCompanyId} lang={lang} />
          </div>
          <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-slate-200/70 p-4">
            <UserMenu collapsed={false} />
          </div>
        </div>
      </aside>
      <aside className="relative z-20 hidden md:block shrink-0 p-4 pr-0">
        <div className={`relative flex h-full transition-[width] duration-300 ease-in-out ${collapsed ? 'w-[88px]' : 'w-[300px]'}`}>
          <div className={`flex h-full w-full flex-col overflow-hidden rounded-[28px] transition-all duration-300 ${shellTheme.panel}`}>
            <div className={`flex items-center border-b border-slate-200/70 transition-all duration-300 ${collapsed ? 'justify-center px-3 py-5' : 'px-5 py-5'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div className={`min-w-0 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <span className="block text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">Zekya HR</span>
                  <span className="block text-xs text-slate-500 whitespace-nowrap truncate">{copyFor(lang, selectedCompany.name)}</span>
                </div>
              </div>
            </div>
            <Sidebar collapsed={collapsed} />
            <div className={`border-t border-slate-200/70 transition-all duration-300 ${collapsed ? 'p-3' : 'p-4'}`}>
              <UserMenu collapsed={collapsed} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition-all duration-200 hover:scale-110 hover:text-slate-700 hover:shadow-[0_4px_14px_rgba(15,23,42,0.18)]"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <span className={`material-symbols-outlined text-[15px] transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}>chevron_right</span>
          </button>
        </div>
      </aside>


      <main className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-col gap-3 p-3 sm:gap-4 sm:p-6">
          <header className={`relative z-30 rounded-[24px] sm:rounded-[30px] px-4 py-3 sm:px-6 sm:py-4 ${shellTheme.panel}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setMobileOpen(true)} className="inline-flex rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden shrink-0">
                  <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 hidden sm:block">
                    {lang === 'es' ? 'Suite de talento humano' : 'Talent suite'}
                  </p>
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 truncate">{title}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 capitalize hidden sm:block">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <span className="material-symbols-outlined text-[14px]">{selectedCompany.icon}</span>
                    {copyFor(lang, selectedCompany.segment)}
                  </span>
                </div>
                <CompanySwitcher
                  companies={companyProfiles}
                  selectedCompanyId={selectedCompanyId}
                  onSelect={setSelectedCompanyId}
                  lang={lang}
                />
                <button
                  onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">translate</span>
                  <span className="hidden sm:inline">{lang === 'es' ? 'EN' : 'ES'}</span>
                </button>
                <NotificationPanel />
              </div>
            </div>
          </header>

          <section className={`flex-1 overflow-y-auto rounded-[24px] sm:rounded-[--radius-xl] p-3 pb-24 sm:p-6 md:pb-6 ${shellTheme.mutedPanel}`}>
            <div className="animate-fade-in">
              <Outlet context={{ selectedCompanyId, selectedCompany }} />
            </div>
          </section>
        </div>
      </main>

      {mobileNavItems.length > 0 && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 18px), 18px)' }}
        >
          <div className="mx-auto flex max-w-xl items-center justify-between gap-1">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                    <span className="truncate">{copyFor(lang, item.label)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
