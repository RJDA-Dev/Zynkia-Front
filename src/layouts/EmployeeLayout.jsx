import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import Avatar from '../components/ui/Avatar'

const tabs = (es) => [
  { to: '/employee', icon: 'home', label: es ? 'Inicio' : 'Home', end: true },
  { to: '/employee/schedule', icon: 'calendar_month', label: es ? 'Horario' : 'Schedule' },
  { to: '/employee/requests', icon: 'description', label: es ? 'Solicitudes' : 'Requests' },
  { to: '/employee/notifications', icon: 'notifications', label: es ? 'Alertas' : 'Alerts' },
  { to: '/employee/profile', icon: 'person', label: es ? 'Perfil' : 'Profile' },
]

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const es = lang === 'es'
  const now = new Date()
  const dateStr = now.toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
  const items = tabs(es)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex-col z-30">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">psychology_alt</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Zynkia</span>
          </div>
        </div>
        <div className="p-4 mx-3 mt-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={user?.name} size="md" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 mt-6 space-y-1">
          {items.map(tab => (
            <NavLink key={tab.to} to={tab.to} end={tab.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full">
            <span className="material-symbols-outlined text-xl">logout</span>
            {es ? 'Cerrar sesion' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div>
            <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
            <h1 className="text-2xl font-bold text-gray-900">{es ? 'Hola' : 'Hi'}, {user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={user?.name} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden pt-12 px-5 pb-6 flex justify-between items-start bg-gray-50 sticky top-0 z-10">
          <div>
            <p className="text-gray-500 text-sm font-medium tracking-wide capitalize">{dateStr}</p>
            <h1 className="text-gray-900 text-2xl font-bold tracking-tight">{es ? 'Hola' : 'Hi'}, {user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="relative shrink-0">
            <Avatar name={user?.name} size="lg" />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
        </header>

        {/* Content */}
        <main className="px-5 pb-24 lg:px-8 lg:py-6 lg:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)' }}>
        {items.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
