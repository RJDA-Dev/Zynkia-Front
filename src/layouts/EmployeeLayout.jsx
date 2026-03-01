import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import Avatar from '../components/ui/Avatar'

export default function EmployeeLayout() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const es = lang === 'es'
  const now = new Date()
  const dateStr = now.toLocaleDateString(es ? 'es-CO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const tabs = [
    { to: '/employee', icon: 'home', label: es ? 'Inicio' : 'Home', end: true },
    { to: '/employee/schedule', icon: 'calendar_month', label: t('shifts') },
    { to: '/employee/requests', icon: 'description', label: t('requests') },
    { to: '/employee/profile', icon: 'person', label: t('profile') },
  ]

  return (
    <div className="mx-auto w-full max-w-md min-h-screen flex flex-col relative bg-gray-50 shadow-2xl overflow-hidden font-[Inter]">
      <header className="pt-12 px-5 pb-6 flex justify-between items-start bg-gray-50 z-10 sticky top-0">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-medium tracking-wide capitalize">{dateStr}</p>
          <h1 className="text-gray-900 text-2xl font-bold tracking-tight">{es ? 'Hola' : 'Hi'}, {user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="relative shrink-0">
          <Avatar name={user?.name} size="lg" />
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
      </header>
      <main className="flex-1 px-5 pb-24 overflow-y-auto space-y-6">
        <Outlet />
      </main>
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)' }}>
        {tabs.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
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
