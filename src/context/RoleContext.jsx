/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { users as usersService } from '../api/services'
import { mockRoleModules } from '../data/mock'

const RoleContext = createContext(null)

const defaultModules = mockRoleModules

export function RoleProvider({ children }) {
  const { user } = useAuth()
  const role = user?.role || 'employee'
  const [roleModules, setRoleModules] = useState(null)

  useEffect(() => {
    if (!user) return
    usersService.roles().then(r => {
      const roles = r?.data?.data || r?.data || r || []
      const map = {}
      roles.forEach(r2 => { map[r2.name] = r2.modules || [] })
      setRoleModules(map)
    }).catch(() => {})
  }, [user])

  const modules = Array.from(new Set([
    ...(defaultModules[role] || []),
    ...((roleModules?.[role]) || []),
  ]))
  const hasAccess = useCallback((mod) => modules.includes(mod), [modules])

  return (
    <RoleContext.Provider value={{ role, hasAccess, modules }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
