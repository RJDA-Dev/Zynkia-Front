import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { shellTheme } from '../config/theme'
import Avatar from '../components/ui/Avatar'

const tabs = (es) => [
  { to: '/employee', icon: 'home', label: es ? 'Inicio' : 'Home', end: true },
  { to: '/employee/schedule', icon: 'calendar_month', label: es ? 'Horario' : 'Schedule' },
  { to: '/employee/requests', icon: 'description', label: es ? 'Solicitudes' : 'Requests' },
  { to: '/employee/inventory', icon: 'inventory_2', label: es ? 'Inventario' : 'Inventory' },
  { to: '/employee/notifications', icon: 'notifications', label: es ? 'Alertas' : 'Alerts' },
  { to: '/employee/profile', icon: 'person', label: es ? 'Perfil' : 'Profile' },
]

function EmployeeNavLink({ to, icon, label, end = false, compact = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${compact
        ? `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all ${isActive ? 'bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`
        : `flex items-center gap-3 rounded-[22px] px-3 py-3 text-sm font-medium transition-all ${isActive ? 'bg-slate-900 text-white shadow-[0_18px_38px_rgba(15,23,42,0.18)]' : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]'}`}`}
    >
      {({ isActive }) => (
        <>
          <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {icon}
          </span>
          <span className={compact ? 'truncate' : ''}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const es = lang === 'es'
  const items = tabs(es)
  const dateStr = new Date().toLocaleDateString(es ? 'es-CO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-5%] h-80 w-80 rounded-full bg-warning/12 blur-3xl" />
      </div>

      <aside className="relative z-20 hidden lg:block shrink-0 p-4 pr-0">
        <div className="flex h-[calc(100vh-2rem)] w-[300px] flex-col overflow-hidden rounded-[28px] transition-all duration-300 ease-in-out">
          <div className={`flex h-full w-full flex-col overflow-hidden rounded-[28px] ${shellTheme.panel}`}>
            <div className="border-b border-slate-200/70 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-base font-bold tracking-tight text-slate-900">Zekya HR</span>
                  <span className="block truncate text-xs text-slate-500">{es ? 'Portal del empleado' : 'Employee portal'}</span>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200/70 px-4 py-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar name={user?.name} size="md" />
                    <span className="ui-success-dot absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="app-scrollbar flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-5">
              <div>
                <div className="mb-2 px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{es ? 'Mi espacio' : 'My workspace'}</p>
                </div>
                <div className="space-y-1.5">
                  {items.map((tab) => (
                    <EmployeeNavLink key={tab.to} {...tab} />
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t border-slate-200/70 p-4">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                {es ? 'Cerrar sesion' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex min-h-screen flex-1 overflow-hidden lg:pl-0">
        <div className="flex h-full w-full flex-col gap-3 p-3 sm:gap-4 sm:p-6">
          <header className={`hidden items-center justify-between gap-3 rounded-[30px] px-6 py-4 lg:flex ${shellTheme.panel}`}>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Portal del empleado' : 'Employee portal'}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{es ? 'Hola' : 'Hi'}, {user?.name?.split(' ')[0]}</h1>
              <p className="text-sm capitalize text-slate-500">{dateStr}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                {es ? 'Autogestion' : 'Self-service'}
              </span>
              <div className="relative shrink-0">
                <Avatar name={user?.name} size="sm" />
                <span className="ui-success-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" />
              </div>
            </div>
          </header>

          <header className={`rounded-[24px] px-4 py-4 lg:hidden ${shellTheme.panel}`} style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Portal del empleado' : 'Employee portal'}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{es ? 'Hola' : 'Hi'}, {user?.name?.split(' ')[0]}</h1>
                <p className="text-sm capitalize text-slate-500">{dateStr}</p>
              </div>
              <div className="relative shrink-0">
                <Avatar name={user?.name} size="lg" />
                <span className="ui-success-dot absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" />
              </div>
            </div>
          </header>

          <section className={`app-scrollbar flex-1 overflow-y-auto rounded-[24px] p-4 pb-24 sm:p-6 lg:pb-6 ${shellTheme.mutedPanel}`}>
            <div className="mx-auto max-w-5xl animate-fade-in">
              <Outlet />
            </div>
          </section>
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 18px), 18px)' }}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-1">
          {items.map((tab) => (
            <EmployeeNavLink key={tab.to} compact {...tab} />
          ))}
        </div>
      </nav>
    </div>
  )
}
