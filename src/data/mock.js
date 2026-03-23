import { buildPeopleOpsModules } from './peopleOpsModules'

const CURRENT_YEAR = 2026
const CURRENT_MONTH = 2
const DEFAULT_PASSWORD = 'demo123'

export const mockRoleModules = {
  admin: [
    'dashboard', 'employees', 'attendance', 'payroll', 'requests', 'schedule',
    'reports', 'users', 'departments', 'onboarding', 'settings', 'sanctions',
    'administration', 'offboarding', 'inventory', 'vacancies', 'contracts', 'calculator', 'profile',
    'employee-files', 'workflow-automation', 'onboarding-ops', 'benefits', 'compliance',
    'performance', 'access', 'helpdesk', 'org-planning', 'integrations',
  ],
  coordinator: [
    'dashboard', 'employees', 'attendance', 'payroll', 'requests', 'schedule',
    'reports', 'onboarding', 'administration', 'offboarding', 'inventory', 'vacancies', 'contracts', 'calculator', 'profile', 'sanctions',
    'employee-files', 'workflow-automation', 'onboarding-ops', 'benefits', 'compliance',
    'performance', 'access', 'helpdesk', 'org-planning',
  ],
  employee: ['portal-inicio', 'portal-solicitudes', 'portal-turnos', 'portal-inventory', 'portal-perfil'],
}

export const mockRoleCatalog = [
  {
    id: 1,
    name: 'admin',
    icon: 'shield_person',
    description: 'Control total de la operación HR.',
    modules: mockRoleModules.admin,
    perms: {
      es: ['Gestiona usuarios, configuración, reportes y operación completa.'],
      en: ['Manages users, settings, reports and full operations.'],
    },
  },
  {
    id: 2,
    name: 'coordinator',
    icon: 'supervisor_account',
    description: 'Coordina operación HR, aprobaciones y seguimiento.',
    modules: mockRoleModules.coordinator,
    perms: {
      es: ['Gestiona equipo, aprueba novedades y sigue el ciclo del colaborador.'],
      en: ['Manages teams, approves incidents and tracks the employee lifecycle.'],
    },
  },
  {
    id: 3,
    name: 'employee',
    icon: 'badge',
    description: 'Accede al portal personal de turnos, pagos y solicitudes.',
    modules: mockRoleModules.employee,
    perms: {
      es: ['Consulta turnos, pagos, solicitudes y perfil personal.'],
      en: ['Accesses shifts, payments, requests and personal profile.'],
    },
  },
]

export const mockDemoProfiles = [
  {
    id: 'demo-admin',
    userId: 1,
    role: 'admin',
    email: 'admin@zekya.co',
    password: DEFAULT_PASSWORD,
    route: '/dashboard',
    title: { es: 'Administrador', en: 'Administrator' },
    description: { es: 'Gestiona empresa, talento, reportes y configuración.', en: 'Manages company, talent, reporting and settings.' },
  },
  {
    id: 'demo-coordinator',
    userId: 2,
    role: 'coordinator',
    email: 'coordinador@zekya.co',
    password: DEFAULT_PASSWORD,
    route: '/dashboard',
    title: { es: 'Coordinador', en: 'Coordinator' },
    description: { es: 'Opera contratación, administración y seguimiento del equipo.', en: 'Operates hiring, administration and team follow-up.' },
  },
  {
    id: 'demo-employee',
    userId: 3,
    role: 'employee',
    email: 'empleado@zekya.co',
    password: DEFAULT_PASSWORD,
    route: '/employee',
    title: { es: 'Empleado', en: 'Employee' },
    description: { es: 'Consulta turnos, pagos, solicitudes y alertas personales.', en: 'Checks shifts, payments, requests and personal alerts.' },
  },
]

function isoDate(day) {
  return `${CURRENT_YEAR}-${String(CURRENT_MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function atTime(day, time) {
  return `${isoDate(day)}T${time}:00`
}

function addHtmlPreview(title, body) {
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1 { margin: 0 0 12px; }
          p, li { line-height: 1.6; }
          .box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="box">${body}</div>
      </body>
    </html>
  `

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
}

const departmentSeed = [
  { id: 'hr', name: 'Recursos Humanos', manager: { name: 'Camila Reyes' } },
  { id: 'payroll', name: 'Nómina', manager: { name: 'Valentina Cruz' } },
  { id: 'ops', name: 'Operaciones', manager: { name: 'Andres Mejia' } },
  { id: 'tech', name: 'Tecnología', manager: { name: 'Juan Felipe' } },
  { id: 'care', name: 'Atención al Usuario', manager: { name: 'Daniela Muñoz' } },
]

const employeeSeed = [
  {
    id: 1,
    employeeCode: 'ZK-1001',
    name: 'Camila Reyes',
    email: 'admin@zekya.co',
    phone: '+57 300 100 1001',
    role: 'admin',
    roleTitle: 'Directora HR',
    departmentId: 'hr',
    status: 'active',
    contractType: 'indefinido',
    baseSalary: 9800000,
    transportAllowance: 0,
    bonuses: 600000,
    deductions: 120000,
    managerName: 'CEO',
    vacationAvailable: 8,
    overtimeHours: 0,
    overtimeAmount: 0,
    overtimePaid: 0,
    monthlyHours: 174,
    monthlyTarget: 176,
  },
  {
    id: 2,
    employeeCode: 'ZK-1002',
    name: 'Valentina Cruz',
    email: 'coordinador@zekya.co',
    phone: '+57 300 100 1002',
    role: 'coordinator',
    roleTitle: 'Coordinadora de Nómina',
    departmentId: 'payroll',
    status: 'active',
    contractType: 'indefinido',
    baseSalary: 6200000,
    transportAllowance: 0,
    bonuses: 350000,
    deductions: 80000,
    managerName: 'Camila Reyes',
    vacationAvailable: 10,
    overtimeHours: 0,
    overtimeAmount: 0,
    overtimePaid: 0,
    monthlyHours: 176,
    monthlyTarget: 176,
  },
  {
    id: 3,
    employeeCode: 'ZK-1003',
    name: 'Mauricio Leon',
    email: 'empleado@zekya.co',
    phone: '+57 300 100 1003',
    role: 'employee',
    roleTitle: 'Auxiliar de Admisiones',
    departmentId: 'care',
    status: 'active',
    contractType: 'indefinido',
    baseSalary: 2850000,
    transportAllowance: 162000,
    bonuses: 0,
    deductions: 25000,
    managerName: 'Daniela Muñoz',
    vacationAvailable: 7,
    overtimeHours: 10,
    overtimeAmount: 224000,
    overtimePaid: 112000,
    monthlyHours: 168,
    monthlyTarget: 176,
  },
  {
    id: 4,
    employeeCode: 'ZK-1004',
    name: 'Daniela Muñoz',
    email: 'daniela.munoz@zekya.co',
    phone: '+57 300 100 1004',
    role: 'coordinator',
    roleTitle: 'Lider de Atencion',
    departmentId: 'care',
    status: 'active',
    contractType: 'indefinido',
    baseSalary: 4700000,
    transportAllowance: 0,
    bonuses: 120000,
    deductions: 60000,
    managerName: 'Camila Reyes',
    vacationAvailable: 9,
    overtimeHours: 6,
    overtimeAmount: 126000,
    overtimePaid: 126000,
    monthlyHours: 176,
    monthlyTarget: 176,
  },
  {
    id: 5,
    employeeCode: 'ZK-1005',
    name: 'Laura Torres',
    email: 'laura.torres@zekya.co',
    phone: '+57 300 100 1005',
    role: 'employee',
    roleTitle: 'Enfermera Jefe',
    departmentId: 'ops',
    status: 'active',
    contractType: 'termino fijo',
    baseSalary: 4300000,
    transportAllowance: 0,
    bonuses: 0,
    deductions: 40000,
    managerName: 'Andres Mejia',
    vacationAvailable: 12,
    overtimeHours: 12,
    overtimeAmount: 252000,
    overtimePaid: 0,
    monthlyHours: 182,
    monthlyTarget: 176,
  },
  {
    id: 6,
    employeeCode: 'ZK-1006',
    name: 'Jhon Castaño',
    email: 'jhon.castano@zekya.co',
    phone: '+57 300 100 1006',
    role: 'employee',
    roleTitle: 'Supervisor de Bodega',
    departmentId: 'ops',
    status: 'active',
    contractType: 'termino fijo',
    baseSalary: 3900000,
    transportAllowance: 0,
    bonuses: 100000,
    deductions: 35000,
    managerName: 'Andres Mejia',
    vacationAvailable: 5,
    overtimeHours: 14,
    overtimeAmount: 294000,
    overtimePaid: 147000,
    monthlyHours: 188,
    monthlyTarget: 176,
  },
  {
    id: 7,
    employeeCode: 'ZK-1007',
    name: 'Sebastian Mora',
    email: 'sebastian.mora@zekya.co',
    phone: '+57 300 100 1007',
    role: 'employee',
    roleTitle: 'Frontend Engineer',
    departmentId: 'tech',
    status: 'active',
    contractType: 'indefinido',
    baseSalary: 8400000,
    transportAllowance: 0,
    bonuses: 400000,
    deductions: 150000,
    managerName: 'Juan Felipe',
    vacationAvailable: 11,
    overtimeHours: 4,
    overtimeAmount: 180000,
    overtimePaid: 0,
    monthlyHours: 171,
    monthlyTarget: 176,
  },
  {
    id: 8,
    employeeCode: 'ZK-1008',
    name: 'Paula Rivas',
    email: 'paula.rivas@zekya.co',
    phone: '+57 300 100 1008',
    role: 'employee',
    roleTitle: 'Bacteriologa Clinica',
    departmentId: 'ops',
    status: 'inactive',
    contractType: 'obra labor',
    baseSalary: 4100000,
    transportAllowance: 0,
    bonuses: 0,
    deductions: 25000,
    managerName: 'Andres Mejia',
    vacationAvailable: 2,
    overtimeHours: 0,
    overtimeAmount: 0,
    overtimePaid: 0,
    monthlyHours: 0,
    monthlyTarget: 176,
  },
]

function withDepartment(employee) {
  const department = departmentSeed.find((item) => item.id === employee.departmentId)
  return {
    ...employee,
    department: department ? { id: department.id, name: department.name } : null,
  }
}

function buildSystemUsers() {
  return employeeSeed.slice(0, 6).map((employee) => ({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    area: departmentSeed.find((item) => item.id === employee.departmentId)?.name || '',
    status: employee.status,
    phone: employee.phone,
    employeeId: employee.id,
    modules: mockRoleModules[employee.role] || mockRoleModules.employee,
    tenantId: 'health-enterprise',
  }))
}

function buildScheduleEntries() {
  const profiles = [
    { employeeId: 3, shiftType: 'morning', color: 'blue', startTime: '07:00', endTime: '15:00' },
    { employeeId: 4, shiftType: 'afternoon', color: 'purple', startTime: '10:00', endTime: '18:00' },
    { employeeId: 5, shiftType: 'night', color: 'amber', startTime: '19:00', endTime: '03:00' },
    { employeeId: 6, shiftType: 'morning', color: 'blue', startTime: '06:00', endTime: '14:00' },
    { employeeId: 7, shiftType: 'afternoon', color: 'purple', startTime: '09:00', endTime: '17:00' },
  ]

  const entries = []

  profiles.forEach((profile, profileIndex) => {
    const employee = withDepartment(employeeSeed.find((item) => item.id === profile.employeeId))

    for (let day = 1; day <= 31; day += 1) {
      const date = new Date(CURRENT_YEAR, CURRENT_MONTH, day)
      const weekday = date.getDay()
      if (weekday === 0) continue
      if ((day + profileIndex) % 5 === 0) continue

      entries.push({
        id: `${profile.employeeId}-${isoDate(day)}`,
        employeeId: employee.id,
        employee: { id: employee.id, name: employee.name, roleTitle: employee.roleTitle },
        role: employee.roleTitle,
        date: isoDate(day),
        shiftType: profile.shiftType,
        startTime: profile.startTime,
        endTime: profile.endTime,
        color: profile.color,
        status: weekday === 6 ? 'leave' : 'scheduled',
      })
    }
  })

  return entries
}

function buildRequests() {
  return [
    {
      id: 1,
      employeeId: 3,
      employee: { id: 3, name: 'Mauricio Leon', roleTitle: 'Auxiliar de Admisiones', baseSalary: 2850000 },
      type: 'vacation',
      startDate: isoDate(24),
      endDate: isoDate(28),
      days: 5,
      description: 'Solicitud de vacaciones familiares ya coordinada con el lider.',
      status: 'pending',
      attachmentKey: 'requests/vacaciones_mauricio.pdf',
      createdAt: atTime(10, '09:15'),
    },
    {
      id: 2,
      employeeId: 5,
      employee: { id: 5, name: 'Laura Torres', roleTitle: 'Enfermera Jefe', baseSalary: 4300000 },
      type: 'medical',
      startDate: isoDate(12),
      endDate: isoDate(13),
      days: 2,
      description: 'Incapacidad por procedimiento ambulatorio.',
      status: 'approved',
      reviewedAt: atTime(11, '15:30'),
      attachmentKey: 'requests/incapacidad_laura.pdf',
      createdAt: atTime(10, '11:20'),
    },
    {
      id: 3,
      employeeId: 6,
      employee: { id: 6, name: 'Jhon Castaño', roleTitle: 'Supervisor de Bodega', baseSalary: 3900000 },
      type: 'leave',
      startDate: isoDate(18),
      endDate: isoDate(18),
      days: 1,
      description: 'Permiso personal para diligencia notarial.',
      status: 'pending',
      createdAt: atTime(12, '08:40'),
    },
    {
      id: 4,
      employeeId: 3,
      employee: { id: 3, name: 'Mauricio Leon', roleTitle: 'Auxiliar de Admisiones', baseSalary: 2850000 },
      type: 'overtime',
      startDate: isoDate(9),
      endDate: isoDate(9),
      startTime: '16:00',
      endTime: '20:00',
      overtimeHours: 4,
      overtimeAmount: 112000,
      surchargeType: 'diurna',
      surchargeMultiplier: 1.25,
      description: 'Cierre extendido por alta demanda de pacientes.',
      status: 'approved',
      reviewedAt: atTime(10, '17:10'),
      createdAt: atTime(9, '20:30'),
    },
    {
      id: 5,
      employeeId: 7,
      employee: { id: 7, name: 'Sebastian Mora', roleTitle: 'Frontend Engineer', baseSalary: 8400000 },
      type: 'overtime',
      startDate: isoDate(11),
      endDate: isoDate(11),
      startTime: '18:00',
      endTime: '21:00',
      overtimeHours: 3,
      overtimeAmount: 180000,
      surchargeType: 'nocturna',
      surchargeMultiplier: 1.75,
      description: 'Soporte a release critico de producto.',
      status: 'pending',
      createdAt: atTime(11, '21:20'),
    },
    {
      id: 6,
      employeeId: 2,
      employee: { id: 2, name: 'Valentina Cruz', roleTitle: 'Coordinadora de Nómina', baseSalary: 6200000 },
      type: 'leave',
      startDate: isoDate(20),
      endDate: isoDate(20),
      days: 1,
      description: 'Permiso de media jornada para asunto personal.',
      status: 'rejected',
      reviewedAt: atTime(13, '10:10'),
      createdAt: atTime(12, '14:15'),
    },
  ]
}

function buildNotifications() {
  return [
    { id: 1, title: 'Novedad aprobada', message: 'Tu solicitud de horas extra fue aprobada.', type: 'success', read: false, createdAt: atTime(13, '08:10'), audience: ['employee', 'coordinator', 'admin'] },
    { id: 2, title: 'Corte de nómina hoy', message: 'Recuerda validar novedades antes de las 5:00 p. m.', type: 'payroll', read: false, createdAt: atTime(13, '07:20'), audience: ['admin', 'coordinator'] },
    { id: 3, title: 'Turno actualizado', message: 'Se ajustó tu horario del viernes por cobertura.', type: 'schedule', read: true, createdAt: atTime(12, '18:40'), audience: ['employee'] },
    { id: 4, title: 'Nuevo candidato entregado', message: 'Contratación entregó un nuevo caso a administración.', type: 'info', read: false, createdAt: atTime(13, '09:35'), audience: ['admin', 'coordinator'] },
    { id: 5, title: 'Acceso reciente', message: 'Se detectó un nuevo acceso al portal desde Bogotá.', type: 'security', read: true, createdAt: atTime(11, '07:05'), audience: ['employee', 'coordinator', 'admin'] },
    { id: 6, title: 'Solicitud pendiente', message: 'Tienes una solicitud pendiente por revisar.', type: 'request', read: false, createdAt: atTime(13, '10:05'), audience: ['coordinator', 'admin'] },
  ]
}

function buildSwaps() {
  return [
    {
      id: 1,
      requesterId: 3,
      requester: { id: 3, name: 'Mauricio Leon' },
      targetId: 5,
      target: { id: 5, name: 'Laura Torres' },
      requesterShift: { date: isoDate(18), startTime: '07:00', endTime: '15:00', shiftType: 'morning' },
      status: 'pending',
      reason: 'Cita medica personal.',
    },
    {
      id: 2,
      requesterId: 5,
      requester: { id: 5, name: 'Laura Torres' },
      targetId: 3,
      target: { id: 3, name: 'Mauricio Leon' },
      requesterShift: { date: isoDate(20), startTime: '19:00', endTime: '03:00', shiftType: 'night' },
      status: 'accepted',
      reason: 'Cobertura de fin de semana.',
    },
  ]
}

function buildOvertimeBalances() {
  return [
    {
      employeeId: 3,
      name: 'Mauricio Leon',
      department: 'Atención al Usuario',
      totalHours: 10,
      totalAmount: 224000,
      paid: 4,
      records: [
        { id: 101, period: '2026-W10', weekNumber: 2, hours: 4, amount: 112000, status: 'approved', notes: 'Cierre extendido', employeeId: 3 },
        { id: 102, period: '2026-W11', weekNumber: 3, hours: 6, amount: 112000, status: 'pending', notes: 'Soporte de ingreso', employeeId: 3 },
      ],
    },
    {
      employeeId: 5,
      name: 'Laura Torres',
      department: 'Operaciones',
      totalHours: 12,
      totalAmount: 252000,
      paid: 0,
      records: [
        { id: 103, period: '2026-W10', weekNumber: 2, hours: 12, amount: 252000, status: 'approved', notes: 'Cobertura UCI', employeeId: 5 },
      ],
    },
    {
      employeeId: 7,
      name: 'Sebastian Mora',
      department: 'Tecnología',
      totalHours: 3,
      totalAmount: 180000,
      paid: 0,
      records: [
        { id: 104, period: '2026-W11', weekNumber: 3, hours: 3, amount: 180000, status: 'pending', notes: 'Release critico', employeeId: 7 },
      ],
    },
  ]
}

function buildSanctions() {
  return [
    {
      id: 1,
      employeeId: 6,
      employee: { id: 6, name: 'Jhon Castaño' },
      reporter: { name: 'Angela Nieto' },
      type: 'tardanza',
      severity: 'leve',
      status: 'pending',
      date: isoDate(12),
      description: 'Ingreso 45 minutos tarde sin novedad previa.',
      deductionHours: 1,
      deductionAmount: 32500,
    },
    {
      id: 2,
      employeeId: 5,
      employee: { id: 5, name: 'Laura Torres' },
      reporter: { name: 'Andres Mejia' },
      type: 'conducta',
      severity: 'moderada',
      status: 'confirmed',
      date: isoDate(9),
      description: 'Incumplimiento de protocolo de reporte de turno.',
      deductionHours: 0,
      deductionAmount: 0,
    },
  ]
}

function buildOnboardingProcesses() {
  return [
    {
      id: 1,
      employeeId: 5,
      employee: { name: 'Laura Torres', position: 'Enfermera Jefe' },
      startedAt: atTime(4, '09:00'),
      currentStep: 3,
      totalSteps: 5,
      progress: 60,
      status: 'in_progress',
    },
    {
      id: 2,
      employeeId: 7,
      employee: { name: 'Sebastian Mora', position: 'Frontend Engineer' },
      startedAt: atTime(1, '10:00'),
      currentStep: 5,
      totalSteps: 5,
      progress: 100,
      status: 'completed',
    },
  ]
}

function buildInventoryAssets() {
  return [
    {
      id: 1,
      assetCode: 'AST-TECH-001',
      area: 'Tecnología',
      type: 'Portátil',
      category: 'laptop',
      brand: 'Dell',
      model: 'Latitude 7440',
      serial: 'DL7440-93KFJ2',
      status: 'assigned',
      condition: 'excellent',
      assignedEmployeeId: 7,
      assignedAt: '2026-02-20',
      location: 'Bogotá · Torre 2',
      purchaseDate: '2025-11-18',
      cost: 7800000,
      notes: 'Equipo principal para desarrollo frontend con docking.',
      specs: ['Intel i7', '32 GB RAM', 'SSD 1 TB', 'Windows 11 Pro'],
      photos: [
        { id: '1-front', label: 'Vista frontal', device: 'Portátil Dell abierto', accent: 'from-slate-200 via-slate-100 to-white' },
        { id: '1-serial', label: 'Sticker serial', device: 'Serial visible', accent: 'from-emerald-100 via-white to-emerald-50' },
      ],
    },
    {
      id: 2,
      assetCode: 'AST-TECH-002',
      area: 'Tecnología',
      type: 'Monitor',
      category: 'monitor',
      brand: 'LG',
      model: 'UltraWide 29"',
      serial: 'LG29-UW-2JH71',
      status: 'assigned',
      condition: 'good',
      assignedEmployeeId: 7,
      assignedAt: '2026-02-21',
      location: 'Bogotá · Torre 2',
      purchaseDate: '2025-11-18',
      cost: 1450000,
      notes: 'Monitor secundario para tareas de QA y diseño responsivo.',
      specs: ['Panel IPS', '29 pulgadas', 'HDMI/USB-C'],
      photos: [
        { id: '2-front', label: 'Escritorio', device: 'Monitor ultrawide', accent: 'from-cyan-100 via-white to-slate-100' },
      ],
    },
    {
      id: 3,
      assetCode: 'AST-CARE-003',
      area: 'Atención al Usuario',
      type: 'Equipo de mesa',
      category: 'desktop',
      brand: 'HP',
      model: 'ProDesk 400',
      serial: 'HP400-K2M18',
      status: 'assigned',
      condition: 'good',
      assignedEmployeeId: 3,
      assignedAt: '2026-01-15',
      location: 'Recepción principal',
      purchaseDate: '2025-09-10',
      cost: 3900000,
      notes: 'Equipo de atención con periféricos y acceso a admisiones.',
      specs: ['Intel i5', '16 GB RAM', 'SSD 512 GB'],
      photos: [
        { id: '3-front', label: 'Puesto activo', device: 'CPU y monitor recepción', accent: 'from-amber-50 via-white to-slate-100' },
      ],
    },
    {
      id: 4,
      assetCode: 'AST-OPS-004',
      area: 'Operaciones',
      type: 'Escáner',
      category: 'scanner',
      brand: 'Honeywell',
      model: '8675i',
      serial: 'HN8675-44B7',
      status: 'warehouse',
      condition: 'new',
      assignedEmployeeId: null,
      assignedAt: '',
      location: 'Bodega central',
      purchaseDate: '2026-02-28',
      cost: 980000,
      notes: 'Disponible para nueva vinculación operativa.',
      specs: ['Bluetooth', 'Uso industrial'],
      photos: [
        { id: '4-front', label: 'Caja sellada', device: 'Escáner nuevo', accent: 'from-sky-100 via-white to-slate-100' },
      ],
    },
    {
      id: 5,
      assetCode: 'AST-TECH-005',
      area: 'Tecnología',
      type: 'Teclado mecánico',
      category: 'keyboard',
      brand: 'Logitech',
      model: 'MX Mechanical',
      serial: 'LGMX-90Z1',
      status: 'assigned',
      condition: 'excellent',
      assignedEmployeeId: 7,
      assignedAt: '2026-02-20',
      location: 'Bogotá · Torre 2',
      purchaseDate: '2025-11-18',
      cost: 760000,
      notes: 'Periférico asignado al kit del desarrollador.',
      specs: ['Bluetooth', 'Low profile', 'Retroiluminado'],
      photos: [
        { id: '5-front', label: 'Periférico', device: 'Teclado mecánico', accent: 'from-violet-100 via-white to-slate-100' },
      ],
    },
  ]
}

function buildVacancies() {
  return [
    {
      id: 1,
      uid: 'VAC-TECH-2026-001',
      title: 'Frontend Engineer',
      area: 'Tecnología',
      openings: 2,
      applicantsCount: 14,
      status: 'open',
      recruiter: 'Camila Reyes',
      location: 'Bogotá',
      workMode: 'Híbrido',
      contractType: 'Indefinido',
      salaryMin: 7000000,
      salaryMax: 9500000,
      openingDate: '2026-03-01',
      closingDate: '2026-03-28',
      description: 'Responsable de construir interfaces de la plataforma HR, módulos de producto y experiencia de usuario.',
      channels: ['LinkedIn', 'Magneto', 'Referidos'],
      applicants: [
        {
          id: 'APP-TECH-001',
          name: 'Natalia Acosta',
          email: 'natalia.acosta@talento.co',
          source: 'LinkedIn',
          appliedAt: '2026-03-04',
          expectedSalary: 8800000,
          status: 'contract_signature',
          interviewScore: 94,
          resumeScore: 91,
          nextStep: 'Firma de contrato',
          documentsReady: true,
          contractId: 1,
        },
        {
          id: 'APP-TECH-002',
          name: 'David Murcia',
          email: 'david.murcia@talento.co',
          source: 'Magneto',
          appliedAt: '2026-03-07',
          expectedSalary: 8200000,
          status: 'interview',
          interviewScore: 86,
          resumeScore: 88,
          nextStep: 'Entrevista final',
          documentsReady: false,
          contractId: null,
        },
      ],
    },
    {
      id: 2,
      uid: 'VAC-OPS-2026-014',
      title: 'Auxiliar de Admisiones',
      area: 'Atención al Usuario',
      openings: 3,
      applicantsCount: 27,
      status: 'screening',
      recruiter: 'Valentina Cruz',
      location: 'Bogotá',
      workMode: 'Presencial',
      contractType: 'Término fijo',
      salaryMin: 2400000,
      salaryMax: 3100000,
      openingDate: '2026-03-05',
      closingDate: '2026-03-22',
      description: 'Gestión de ingresos, autorizaciones, caja y atención al usuario en recepción principal.',
      channels: ['Computrabajo', 'Magneto'],
      applicants: [
        {
          id: 'APP-OPS-001',
          name: 'María José Ortega',
          email: 'maria.ortega@talento.co',
          source: 'Computrabajo',
          appliedAt: '2026-03-08',
          expectedSalary: 2850000,
          status: 'review',
          interviewScore: null,
          resumeScore: 82,
          nextStep: 'Preselección IA',
          documentsReady: false,
          contractId: null,
        },
        {
          id: 'APP-OPS-002',
          name: 'Felipe Roldán',
          email: 'felipe.roldan@talento.co',
          source: 'Magneto',
          appliedAt: '2026-03-09',
          expectedSalary: 2950000,
          status: 'docs_pending',
          interviewScore: 89,
          resumeScore: 84,
          nextStep: 'Subir documentos',
          documentsReady: false,
          contractId: null,
        },
      ],
    },
  ]
}

function buildContractPreview(contract) {
  return addHtmlPreview(
    `Contrato ${contract.candidateName}`,
    `
      <p><strong>Código:</strong> ${contract.code}</p>
      <p><strong>Cargo:</strong> ${contract.roleTitle}</p>
      <p><strong>Tipo:</strong> ${contract.contractType}</p>
      <p><strong>Inicio:</strong> ${contract.startDate}</p>
      <p><strong>Salario:</strong> $${Number(contract.salary).toLocaleString('es-CO')} COP</p>
      <p style="margin-top:12px;">Se pacta la vinculación de <strong>${contract.candidateName}</strong> para desempeñar el cargo de <strong>${contract.roleTitle}</strong>, bajo condiciones de confidencialidad, cumplimiento operativo y firma digital.</p>
    `
  )
}

function buildContracts() {
  const contracts = [
    {
      id: 1,
      code: 'CTR-2026-001',
      vacancyUid: 'VAC-TECH-2026-001',
      candidateName: 'Natalia Acosta',
      candidateEmail: 'natalia.acosta@talento.co',
      roleTitle: 'Frontend Engineer',
      contractType: 'Indefinido',
      salary: 8800000,
      startDate: '2026-03-25',
      generatedAt: '2026-03-12T14:10:00',
      status: 'pending_signature',
      digitalSignature: '',
      emailSentAt: '2026-03-12T14:20:00',
      signedAt: '',
      sentBy: 'Camila Reyes',
      documents: ['Contrato base', 'Anexo de confidencialidad', 'Política de equipos'],
    },
    {
      id: 2,
      code: 'CTR-2026-002',
      vacancyUid: 'VAC-OPS-2026-014',
      candidateName: 'Mauricio León',
      candidateEmail: 'mauricio.leon@empleo.co',
      roleTitle: 'Auxiliar de Admisiones',
      contractType: 'Término fijo',
      salary: 2950000,
      startDate: '2026-03-18',
      generatedAt: '2026-03-11T16:20:00',
      status: 'signed',
      digitalSignature: 'Mauricio León',
      emailSentAt: '2026-03-11T16:25:00',
      signedAt: '2026-03-12T08:02:00',
      sentBy: 'Valentina Cruz',
      documents: ['Contrato fijo', 'Consentimiento de tratamiento de datos', 'Carta de ingreso'],
    },
  ]

  return contracts.map((contract) => ({
    ...contract,
    documentUrl: buildContractPreview(contract),
  }))
}

function buildPayrollHistory(employees) {
  const periods = ['2026-01', '2026-02', '2026-03']

  const globalRuns = periods.map((period, index) => ({
    period,
    processedAt: `${period}-28T18:00:00`,
    employeeCount: employees.filter((employee) => employee.status === 'active').length,
    totalNet: employees.filter((employee) => employee.status === 'active').reduce((sum, employee) => sum + employee.baseSalary + employee.transportAllowance + employee.bonuses - employee.deductions, 0) + (index * 250000),
    status: 'completed',
  }))

  const perEmployee = {}

  employees.forEach((employee) => {
    perEmployee[employee.id] = periods.map((period, index) => {
      const overtimeAmount = index === 2 ? employee.overtimeAmount : Math.round(employee.overtimeAmount / 2)
      const overtimeHours = index === 2 ? employee.overtimeHours : Math.round(employee.overtimeHours / 2)
      const gross = employee.baseSalary + employee.transportAllowance + employee.bonuses + overtimeAmount
      const health = Math.round(employee.baseSalary * 0.04)
      const pension = Math.round(employee.baseSalary * 0.04)
      const tax = employee.baseSalary > 5000000 ? Math.round(employee.baseSalary * 0.02) : 0
      const other = employee.deductions
      const net = gross - health - pension - tax - other

      return {
        id: Number(`${employee.id}${index + 1}`),
        employeeId: employee.id,
        period,
        status: index === 2 ? 'approved' : 'paid',
        paidAt: index === 2 ? null : `${period}-28T18:00:00`,
        baseSalary: employee.baseSalary,
        transport: employee.transportAllowance,
        overtimeAmount,
        overtimeHours,
        bonuses: employee.bonuses,
        gross,
        health,
        pension,
        tax,
        deductions: other,
        net,
      }
    })
  })

  return { globalRuns, perEmployee }
}

export function createMockDb() {
  const employees = employeeSeed.map(withDepartment)
  const users = buildSystemUsers()
  const scheduleEntries = buildScheduleEntries()
  const payrollHistory = buildPayrollHistory(employees)
  const inventoryAssets = buildInventoryAssets()
  const vacancies = buildVacancies()
  const contracts = buildContracts()
  const peopleOps = buildPeopleOpsModules({
    employees,
    inventoryAssets,
    vacancies,
    contracts,
    departments: departmentSeed,
  })

  return {
    meta: {
      useMocks: true,
      generatedAt: `${CURRENT_YEAR}-03-13T00:00:00`,
    },
    roles: mockRoleCatalog,
    demoProfiles: mockDemoProfiles,
    departments: departmentSeed.map((department) => ({
      ...department,
      employeeCount: employees.filter((employee) => employee.department?.id === department.id).length,
    })),
    users,
    employees,
    requests: buildRequests(employees),
    notifications: buildNotifications(),
    scheduleEntries,
    swaps: buildSwaps(),
    inventoryAssets,
    vacancies,
    contracts,
    peopleOps,
    overtimeRules: [
      { id: 1, name: 'Hora Extra Diurna', code: 'HED-001', multiplier: 1.25, shiftType: 'Diurna', status: 'active' },
      { id: 2, name: 'Hora Extra Nocturna', code: 'HEN-002', multiplier: 1.75, shiftType: 'Nocturna', status: 'active' },
      { id: 3, name: 'Dominical / Festivo', code: 'DOM-101', multiplier: 2.0, shiftType: 'Dominical', status: 'inactive' },
      { id: 4, name: 'Recargo Nocturno', code: 'REN-003', multiplier: 0.35, shiftType: 'Recargo', status: 'active' },
    ],
    overtimeBalances: buildOvertimeBalances(),
    sanctions: buildSanctions(),
    onboarding: buildOnboardingProcesses(),
    payrollHistory,
    settings: {
      general: {
        companyName: 'Zekya HR Demo',
        defaultLanguage: 'es',
      },
      localization: {
        currency: 'COP',
        numberFormat: 'comma_decimal',
        timezone: 'America/Bogota',
        timeFormat: '24h',
        workHourReduction: 'true',
        overtimeCalc: 'true',
      },
      security: {
        twoFactor: 'false',
        lockOnFailed: 'true',
        sessionTimeout: '30',
      },
    },
    previews: {
      overtimeReport: addHtmlPreview('Reporte de Horas Extra', '<p>Reporte demo generado desde mock centralizado.</p>'),
    },
  }
}

export function getDemoProfileByEmail(email) {
  return mockDemoProfiles.find((profile) => profile.email.toLowerCase() === String(email).toLowerCase())
}

export function getDefaultDemoPassword() {
  return DEFAULT_PASSWORD
}
