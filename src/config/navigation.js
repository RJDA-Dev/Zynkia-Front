import { copyFor } from '../lib/locale'

export const workspaceNavigation = [
  {
    section: { es: 'Panorama ejecutivo', en: 'Executive overview' },
    items: [
      {
        to: '/dashboard',
        icon: 'space_dashboard',
        label: { es: 'Vista general', en: 'Overview' },
        module: 'dashboard',
      },
    ],
  },
  {
    section: { es: 'Contratación', en: 'Hiring' },
    items: [
      {
        to: '/vacancies',
        icon: 'work',
        label: { es: 'Vacantes', en: 'Vacancies' },
        module: 'vacancies',
      },
      {
        to: '/lifecycle/contratacion',
        icon: 'person_search',
        label: { es: 'Selección y entrevistas', en: 'Selection and interviews' },
        module: 'onboarding',
      },
      {
        to: '/employee-files',
        icon: 'folder_managed',
        label: { es: 'Archivos del proceso', en: 'Candidate files' },
        module: 'employee-files',
      },
      {
        to: '/contracts',
        icon: 'contract_edit',
        label: { es: 'Contrato y firma', en: 'Contract and signature' },
        module: 'contracts',
      },
      {
        to: '/onboarding-ops',
        icon: 'how_to_reg',
        label: { es: 'Vinculación', en: 'Employee activation' },
        module: 'onboarding-ops',
      },
    ],
  },
  {
    section: { es: 'Administración', en: 'Administration' },
    items: [
      {
        to: '/lifecycle/administracion',
        icon: 'work_history',
        label: { es: 'Administración', en: 'Administration' },
        module: 'administration',
      },
      {
        to: '/employees',
        icon: 'groups',
        label: { es: 'Empleados', en: 'Employees' },
        module: 'employees',
      },
      {
        to: '/inventory',
        icon: 'inventory_2',
        label: { es: 'Inventario', en: 'Inventory' },
        module: 'inventory',
      },
      {
        to: '/benefits',
        icon: 'savings',
        label: { es: 'Beneficios y gastos', en: 'Benefits and expenses' },
        module: 'benefits',
      },
      {
        to: '/requests',
        icon: 'pending_actions',
        label: { es: 'Novedades y solicitudes', en: 'Incidents and requests' },
        module: 'requests',
      },
      {
        to: '/attendance',
        icon: 'alarm_on',
        label: { es: 'Asistencia', en: 'Attendance' },
        module: 'attendance',
      },
      {
        to: '/payroll/liquidation',
        icon: 'payments',
        label: { es: 'Liquidación', en: 'Liquidation' },
        module: 'payroll',
      },
      {
        to: '/payroll/overtime',
        icon: 'more_time',
        label: { es: 'Horas extra', en: 'Overtime' },
        module: 'payroll',
      },
      {
        to: '/payroll/calculator',
        icon: 'calculate',
        label: { es: 'Calculadora', en: 'Calculator' },
        module: 'calculator',
      },
      {
        to: '/schedule',
        icon: 'calendar_month',
        label: { es: 'Turnos', en: 'Schedule' },
        module: 'schedule',
      },
      {
        to: '/performance',
        icon: 'query_stats',
        label: { es: 'Periodo y desempeño', en: 'Probation and performance' },
        module: 'performance',
      },
      {
        to: '/compliance',
        icon: 'health_and_safety',
        label: { es: 'SST y cumplimiento', en: 'HSE and compliance' },
        module: 'compliance',
      },
      {
        to: '/access',
        icon: 'key_vertical',
        label: { es: 'Accesos y provisionamiento', en: 'Access and provisioning' },
        module: 'access',
      },
      {
        to: '/helpdesk',
        icon: 'support_agent',
        label: { es: 'Mesa RH', en: 'HR helpdesk' },
        module: 'helpdesk',
      },
      {
        to: '/sanctions',
        icon: 'gavel',
        label: { es: 'Sanciones y disciplina', en: 'Discipline and sanctions' },
        module: 'sanctions',
      },
      {
        to: '/org-planning',
        icon: 'apartment',
        label: { es: 'Planeación organizacional', en: 'Org planning' },
        module: 'org-planning',
      },
      {
        to: '/reports',
        icon: 'monitoring',
        label: { es: 'Reportes', en: 'Reports' },
        module: 'reports',
      },
    ],
  },
  {
    section: { es: 'Retiro', en: 'Offboarding' },
    items: [
      {
        to: '/lifecycle/retiro',
        icon: 'badge',
        label: { es: 'Retiro', en: 'Offboarding' },
        module: 'offboarding',
      },
    ],
  },
  {
    section: { es: 'Plataforma', en: 'Platform' },
    items: [
      {
        to: '/workflow-automation',
        icon: 'account_tree',
        label: { es: 'Flujos y aprobaciones', en: 'Workflows and approvals' },
        module: 'workflow-automation',
      },
      {
        to: '/integrations',
        icon: 'integration_instructions',
        label: { es: 'Integraciones', en: 'Integrations' },
        module: 'integrations',
      },
      {
        to: '/departments',
        icon: 'apartment',
        label: { es: 'Departamentos', en: 'Departments' },
        module: 'departments',
      },
    ],
  },
]

const fallbackTitles = {
  '/employees': { es: 'Empleados', en: 'Employees' },
  '/inventory': { es: 'Inventario', en: 'Inventory' },
  '/attendance': { es: 'Asistencia', en: 'Attendance' },
  '/payroll/overtime': { es: 'Horas extra', en: 'Overtime' },
  '/payroll/calculator': { es: 'Calculadora', en: 'Calculator' },
  '/payroll/liquidation': { es: 'Liquidación', en: 'Liquidation' },
  '/requests': { es: 'Solicitudes', en: 'Requests' },
  '/sanctions': { es: 'Sanciones', en: 'Sanctions' },
  '/schedule': { es: 'Calendario', en: 'Schedule' },
  '/reports': { es: 'Reportes', en: 'Reports' },
  '/vacancies': { es: 'Vacantes', en: 'Vacancies' },
  '/contracts': { es: 'Contrato y firma', en: 'Contract and signature' },
  '/employee-files': { es: 'Archivos del proceso', en: 'Candidate files' },
  '/workflow-automation': { es: 'Flujos y aprobaciones', en: 'Workflows and approvals' },
  '/onboarding-ops': { es: 'Vinculación', en: 'Employee activation' },
  '/benefits': { es: 'Beneficios y gastos', en: 'Benefits and expenses' },
  '/compliance': { es: 'SST y cumplimiento', en: 'HSE and compliance' },
  '/performance': { es: 'Periodo y desempeño', en: 'Probation and performance' },
  '/access': { es: 'Accesos y provisionamiento', en: 'Access and provisioning' },
  '/helpdesk': { es: 'Mesa RH', en: 'HR helpdesk' },
  '/org-planning': { es: 'Planeación organizacional', en: 'Org planning' },
  '/integrations': { es: 'Integraciones', en: 'Integrations' },
  '/users': { es: 'Accesos y roles', en: 'Access and roles' },
  '/departments': { es: 'Departamentos', en: 'Departments' },
  '/profile': { es: 'Perfil', en: 'Profile' },
  '/employee': { es: 'Portal del empleado', en: 'Employee portal' },
  '/employee/schedule': { es: 'Mis turnos', en: 'My schedule' },
  '/employee/requests': { es: 'Mis solicitudes', en: 'My requests' },
  '/employee/inventory': { es: 'Mi inventario', en: 'My inventory' },
  '/employee/notifications': { es: 'Notificaciones', en: 'Notifications' },
  '/employee/payments': { es: 'Pagos', en: 'Payments' },
}

function allItems() {
  return workspaceNavigation.flatMap((group) => group.items)
}

export function getLocalizedNavigation(lang) {
  return workspaceNavigation.map((group) => ({
    section: copyFor(lang, group.section),
    items: group.items.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
  }))
}

export function getPageTitle(pathname, lang) {
  const item = allItems().find((entry) => entry.to === pathname)
  if (item) return copyFor(lang, item.label)

  if (pathname.startsWith('/employees/')) return copyFor(lang, { es: 'Detalle del empleado', en: 'Employee detail' })

  const fallback = fallbackTitles[pathname]
  return copyFor(lang, fallback || { es: 'Zekya HR', en: 'Zekya HR' })
}
