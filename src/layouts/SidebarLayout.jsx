import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationPanel from '../components/NotificationPanel'
import { useLang } from '../context/LangContext'
import { useRole } from '../context/RoleContext'
import usePresence from '../hooks/usePresence'

const pageTitles = {
  es: {
    '/dashboard': 'Panel Principal', '/employees': 'Empleados', '/attendance': 'Asistencia',
    '/payroll/overtime': 'Horas Extra', '/payroll/liquidation': 'Liquidación',
    '/requests': 'Solicitudes', '/sanctions': 'Sanciones', '/schedule': 'Calendario', '/reports': 'Reportes',
    '/users': 'Usuarios', '/departments': 'Departamentos',
    '/settings/general': 'General', '/profile': 'Mi Perfil',
  },
  en: {
    '/dashboard': 'Dashboard', '/employees': 'Employees', '/attendance': 'Attendance',
    '/payroll/overtime': 'Overtime Rules', '/payroll/liquidation': 'Settlement',
    '/requests': 'Requests', '/sanctions': 'Sanctions', '/schedule': 'Schedule', '/reports': 'Reports',
    '/users': 'Users', '/departments': 'Departments',
    '/settings/general': 'General', '/profile': 'My Profile',
  },
}

export default function SidebarLayout() {
  const { pathname } = useLocation()
  const { lang, setLang } = useLang()
  const { role } = useRole()
  usePresence()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = pageTitles[lang]?.[pathname] || pageTitles.es[pathname] || 'Zynkia'

  return (
    <div className="font-[Inter] bg-background text-gray-900 h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-14 flex items-center px-5 justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Zynkia</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <div className="border-t border-gray-200 p-3">
          <UserMenu collapsed={false} />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
        <div className={`h-14 flex items-center border-b border-gray-100 transition-all duration-300 ${collapsed ? 'px-3 justify-center' : 'px-5 justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
            </div>
            {!collapsed && <span className="text-lg font-bold tracking-tight text-gray-900">Zynkia</span>}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          )}
        </div>
        <Sidebar collapsed={collapsed} />
        <div className={`border-t border-gray-200 transition-all duration-300 ${collapsed ? 'p-2' : 'p-3'}`}>
          <UserMenu collapsed={collapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            {collapsed && (
              <button onClick={() => setCollapsed(false)} className="hidden md:block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            )}
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/50 transition-colors">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <NotificationPanel />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
