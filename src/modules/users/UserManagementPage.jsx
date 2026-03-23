import { useEffect, useState } from 'react'
import { users as usersService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import usePresence from '../../hooks/usePresence'
import Table from '../../components/ui/Table'
import Avatar from '../../components/ui/Avatar'
import { useLang } from '../../context/LangContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import Pagination from '../../components/ui/Pagination'
import Toggle from '../../components/ui/Toggle'
import { useToast } from '../../context/ToastContext'

const ALL_MODULES = [
  'dashboard','employees','attendance','payroll','requests','schedule',
  'reports','users','departments','onboarding','settings','sanctions',
  'administration','offboarding','inventory','vacancies','contracts','calculator','profile',
  'employee-files','workflow-automation','onboarding-ops','benefits','compliance',
  'performance','access','helpdesk','org-planning','integrations',
  'portal-inicio','portal-solicitudes','portal-turnos','portal-inventory','portal-perfil',
]

const moduleLabels = {
  es: { dashboard:'Panel','employees':'Empleados','attendance':'Asistencia','payroll':'Nómina','requests':'Solicitudes','schedule':'Turnos','reports':'Reportes','users':'Usuarios','departments':'Departamentos','onboarding':'Onboarding','settings':'Ajustes','sanctions':'Sanciones','administration':'Administración','offboarding':'Retiro','inventory':'Inventario','vacancies':'Vacantes','contracts':'Contratos','calculator':'Calculadora','profile':'Perfil','employee-files':'Expediente digital','workflow-automation':'Flujos y aprobaciones','onboarding-ops':'Preboarding y onboarding','benefits':'Beneficios y gastos','compliance':'SST y cumplimiento','performance':'Periodo y desempeño','access':'Accesos y provisionamiento','helpdesk':'Mesa RH','org-planning':'Planeación organizacional','integrations':'Integraciones','portal-inicio':'Portal Inicio','portal-solicitudes':'Portal Solicitudes','portal-turnos':'Portal Turnos','portal-inventory':'Portal Inventario','portal-perfil':'Portal Perfil' },
  en: { dashboard:'Dashboard','employees':'Employees','attendance':'Attendance','payroll':'Payroll','requests':'Requests','schedule':'Schedule','reports':'Reports','users':'Users','departments':'Departments','onboarding':'Onboarding','settings':'Settings','sanctions':'Sanctions','administration':'Administration','offboarding':'Offboarding','inventory':'Inventory','vacancies':'Vacancies','contracts':'Contracts','calculator':'Calculator','profile':'Profile','employee-files':'Digital files','workflow-automation':'Workflows and approvals','onboarding-ops':'Preboarding and onboarding','benefits':'Benefits and expenses','compliance':'HSE and compliance','performance':'Probation and performance','access':'Access and provisioning','helpdesk':'HR helpdesk','org-planning':'Org planning','integrations':'Integrations','portal-inicio':'Portal Home','portal-solicitudes':'Portal Requests','portal-turnos':'Portal Schedule','portal-inventory':'Portal Inventory','portal-perfil':'Portal Profile' },
}

const roleBadgeColor = { admin: 'purple', coordinator: 'info', employee: 'neutral' }

export default function UserManagementPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('roles')
  const [search, setSearch] = useState('')
  const { isOnline } = usePresence()
  const { data, loading } = useFetch(() => usersService.list({ search }), { deps: [search], key: `users-${search}` })
  const { data: rolesData, refetch: refetchRoles } = useFetch(() => usersService.roles(), { key: 'roles' })
  const [usersList, setUsersList] = useState([])
  const [roleLoadingId, setRoleLoadingId] = useState(null)
  const [statusLoadingId, setStatusLoadingId] = useState(null)

  const roles = rolesData?.data || rolesData || []

  useEffect(() => {
    const nextUsers = data?.data || data || []
    setUsersList(Array.isArray(nextUsers) ? nextUsers : [])
  }, [data])

  // ── Edit role state ──
  const [editing, setEditing] = useState(null) // role object being edited
  const [editForm, setEditForm] = useState({})

  const startEdit = (r) => {
    setEditing(r.id)
    setEditForm({ name: r.name, icon: r.icon, description: r.description, modules: [...(r.modules || [])], perms: { ...r.perms } })
  }

  const toggleModule = (mod) => {
    setEditForm(f => ({
      ...f,
      modules: f.modules.includes(mod) ? f.modules.filter(m => m !== mod) : [...f.modules, mod],
    }))
  }

  const saveRole = async (id) => {
    try {
      await usersService.updateRole(id, editForm)
      toast.success(es ? 'Rol actualizado' : 'Role updated')
      setEditing(null)
      refetchRoles()
    } catch { toast.error(es ? 'Error al guardar' : 'Error saving') }
  }

  const deleteRole = async (id) => {
    if (!confirm(es ? '¿Eliminar este rol?' : 'Delete this role?')) return
    try {
      await usersService.deleteRole(id)
      toast.success(es ? 'Rol eliminado' : 'Role deleted')
      refetchRoles()
    } catch { toast.error(es ? 'Error al eliminar' : 'Error deleting') }
  }

  // ── New role ──
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', icon: 'badge', description: '', modules: [], perms: { es: [], en: [] } })

  const createRole = async () => {
    if (!newForm.name.trim()) return
    try {
      await usersService.createRole(newForm)
      toast.success(es ? 'Rol creado' : 'Role created')
      setShowNew(false)
      setNewForm({ name: '', icon: 'badge', description: '', modules: [], perms: { es: [], en: [] } })
      refetchRoles()
    } catch { toast.error(es ? 'Error al crear' : 'Error creating') }
  }

  // ── Assign role to user ──
  const assignRole = async (userId, role) => {
    setRoleLoadingId(userId)
    try {
      await usersService.assignRole(userId, role)
      setUsersList(prev => prev.map(user => (
        String(user.id) === String(userId)
          ? { ...user, role }
          : user
      )))
      toast.success(es ? 'Rol asignado' : 'Role assigned')
    } catch { toast.error(es ? 'Error' : 'Error') }
    finally { setRoleLoadingId(null) }
  }

  const toggleStatus = async (userId) => {
    setStatusLoadingId(userId)
    try {
      await usersService.toggleStatus(userId)
      setUsersList(prev => prev.map(user => (
        String(user.id) === String(userId)
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )))
      toast.success(es ? 'Estado actualizado' : 'Status updated')
    } catch { toast.error(es ? 'Error' : 'Error') }
    finally { setStatusLoadingId(null) }
  }

  const columns = [
    { key: 'name', label: es ? 'Usuario' : 'User', render: (val, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} />
        <div>
          <p className="text-sm font-semibold text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: es ? 'Rol' : 'Role', render: (val, row) => (
      <Select
        className="min-w-[150px]"
        value={val}
        disabled={roleLoadingId === row.id}
        onChange={e => assignRole(row.id, e.target.value)}
        options={[
          ...roles.map(r => ({ value: r.name, label: r.name })),
          ...(!roles.find(r2 => r2.name === val) ? [{ value: val, label: val }] : []),
        ]}
      />
    )},
    { key: 'status', label: es ? 'Estado' : 'Status', render: (val, row) => {
      const online = isOnline(row.id)
      return (
        <div className="flex items-center gap-2">
          <Toggle checked={val === 'active'} disabled={statusLoadingId === row.id} onChange={() => toggleStatus(row.id)} />
          <span className="text-xs text-gray-600">
            {statusLoadingId === row.id
              ? (es ? 'Actualizando...' : 'Updating...')
              : online
                ? 'Online'
                : val === 'active'
                  ? (es ? 'Activo' : 'Active')
                  : (es ? 'Inactivo' : 'Inactive')}
          </span>
        </div>
      )
    }},
  ]

  const tabItems = [
    { key: 'users', label: es ? 'Accesos' : 'Access', icon: 'group' },
    { key: 'roles', label: 'Roles', icon: 'verified_user' },
  ]

  const mLabels = moduleLabels[lang] || moduleLabels.es

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{es ? 'Esta vista administra accesos, estados y roles del sistema. La ficha laboral vive en Empleados.' : 'This view manages system access, status and roles. The employment record lives in Employees.'}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabs items={tabItems} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'users' && (
          <>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <Input icon="search" placeholder={es ? 'Buscar usuarios...' : 'Search users...'} className="w-full md:w-96" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : <Table columns={columns} data={usersList} />}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
              <p className="text-sm text-gray-700">{data?.total || 0} {es ? 'usuarios' : 'users'}</p>
              <Pagination current={1} total={Math.ceil((data?.total || 0) / 20) || 1} />
            </div>
          </>
        )}

        {activeTab === 'roles' && (
          <div className="p-6 space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <Button icon="add" size="sm" onClick={() => setShowNew(true)}>{es ? 'Nuevo Rol' : 'New Role'}</Button>
            </div>

            {/* New role form */}
            {showNew && (
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-5 bg-purple-50/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder={es ? 'Nombre del rol' : 'Role name'} />
                  <Input value={newForm.icon} onChange={e => setNewForm(f => ({ ...f, icon: e.target.value }))} placeholder="Icon (Material)" />
                  <Input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder={es ? 'Descripción' : 'Description'} />
                </div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">{es ? 'Módulos' : 'Modules'}</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_MODULES.map(m => (
                    <button key={m} onClick={() => setNewForm(f => ({ ...f, modules: f.modules.includes(m) ? f.modules.filter(x => x !== m) : [...f.modules, m] }))}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${newForm.modules.includes(m) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                      {mLabels[m] || m}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={createRole}>{es ? 'Crear' : 'Create'}</Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowNew(false)}>{es ? 'Cancelar' : 'Cancel'}</Button>
                </div>
              </div>
            )}

            {roles.map(r => (
              <div key={r.id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${roleBadgeColor[r.name] === 'purple' ? 'bg-purple-100 text-purple-600' : roleBadgeColor[r.name] === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    <span className="material-symbols-outlined">{r.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{r.name}</h4>
                    <p className="text-xs text-gray-500">{r.description}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {editing === r.id ? (
                      <>
                        <Button size="sm" onClick={() => saveRole(r.id)}>{es ? 'Guardar' : 'Save'}</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>{es ? 'Cancelar' : 'Cancel'}</Button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => deleteRole(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {(r.perms?.[lang] || r.perms?.es || []).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                      {p}
                    </div>
                  ))}
                </div>

                {/* Modules — view or edit */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">{es ? 'Módulos con acceso' : 'Module access'}</p>
                  {editing === r.id ? (
                    <div className="flex flex-wrap gap-2">
                      {ALL_MODULES.map(m => (
                        <button key={m} onClick={() => toggleModule(m)}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${editForm.modules.includes(m) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                          {mLabels[m] || m}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(r.modules || []).map(m => (
                        <span key={m} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">{mLabels[m] || m}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
