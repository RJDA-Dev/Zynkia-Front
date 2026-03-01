import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { users as usersService } from '../api/services'

const RoleContext = createContext(null)

// Fallback while API loads
const defaultModules = {
  admin: ['dashboard','employees','attendance','payroll','requests','schedule','reports','users','departments','onboarding','settings'],
  coordinator: ['dashboard','employees','attendance','requests','schedule','reports'],
  employee: ['portal-inicio','portal-solicitudes','portal-turnos','portal-perfil'],
}

export function RoleProvider({ children }) {
  const { user } = useAuth()
  const role = user?.role || 'employee'
  const [roleModules, setRoleModules] = useState(null)

  useEffect(() => {
    if (!user) return
    usersService.roles().then(r => {
      const roles = r?.data?.data || r?.data || []
      const map = {}
      roles.forEach(r2 => { map[r2.name] = r2.modules || [] })
      setRoleModules(map)
    }).catch(() => {})
  }, [user])

  const modules = roleModules?.[role] || defaultModules[role] || []
  const hasAccess = useCallback((mod) => modules.includes(mod), [modules])

  return (
    <RoleContext.Provider value={{ role, hasAccess, modules }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
