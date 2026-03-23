import { NavLink } from 'react-router-dom'
import { getLocalizedNavigation } from '../config/navigation'
import { useRole } from '../context/RoleContext'
import { useLang } from '../context/LangContext'

function SidebarLink({ to, icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 overflow-hidden rounded-[22px] px-3 py-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-slate-900 text-white shadow-[0_18px_38px_rgba(15,23,42,0.18)]'
            : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]'
        } ${collapsed ? 'justify-center px-2.5' : ''}`
      }
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onNavigate }) {
  const { hasAccess } = useRole()
  const { lang } = useLang()
  const sections = getLocalizedNavigation(lang)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasAccess(item.module)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-5">
      {sections.map((section, index) => (
        <div key={section.section}>
          {!collapsed ? (
            <div className="mb-2 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{section.section}</p>
            </div>
          ) : (
            <div className="mb-3 flex justify-center px-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {index + 1}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            {section.items.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
