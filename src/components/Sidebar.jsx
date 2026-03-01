import { NavLink } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { useLang } from '../context/LangContext'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', labelKey: 'dashboard', module: 'dashboard' },
  { to: '/employees', icon: 'groups', labelKey: 'employees', module: 'employees' },
  { to: '/attendance', icon: 'fingerprint', labelKey: 'attendance', module: 'attendance' },
  { to: '/payroll/overtime', icon: 'more_time', labelKey: 'overtime', module: 'payroll' },
  { to: '/payroll/liquidation', icon: 'account_balance', labelKey: 'liquidation', module: 'payroll' },
  { to: '/requests', icon: 'pending_actions', labelKey: 'requests', module: 'requests' },
  { to: '/sanctions', icon: 'gavel', labelKey: 'sanctions', module: 'sanctions' },
  { to: '/schedule', icon: 'calendar_month', labelKey: 'schedule', module: 'schedule' },
  { to: '/reports', icon: 'analytics', labelKey: 'reports', module: 'reports' },
  { to: '/users', icon: 'manage_accounts', labelKey: 'users', module: 'users' },
]

const settingsItems = [
  { to: '/departments', icon: 'domain', labelKey: 'departments', module: 'departments' },
  { to: '/settings/general', icon: 'settings', labelKey: 'general', module: 'settings' },
]

function SidebarLink({ to, icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg group transition-all duration-200 ${
          isActive ? 'bg-purple-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onNavigate }) {
  const { hasAccess } = useRole()
  const { t } = useLang()

  const visibleNav = navItems.filter(i => hasAccess(i.module))
  const visibleSettings = settingsItems.filter(i => hasAccess(i.module))

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
      {visibleNav.map(item => <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.labelKey)} collapsed={collapsed} onClick={onNavigate} />)}
      {visibleSettings.length > 0 && (
        <>
          {!collapsed && (
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('settings')}</p>
            </div>
          )}
          {collapsed && <div className="pt-4 pb-2"><div className="h-px bg-gray-200 mx-2" /></div>}
          {visibleSettings.map(item => <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.labelKey)} collapsed={collapsed} onClick={onNavigate} />)}
        </>
      )}
    </nav>
  )
}
