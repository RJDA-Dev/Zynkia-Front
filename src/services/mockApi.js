import { createMockDb, getDefaultDemoPassword } from '../data/mock'

const MOCK_DB_KEY = 'zekya-mock-db'
const MOCK_SESSION_KEY = 'zekya-mock-session'
const CURRENT_PERIOD = '2026-03'

export const isMockApiEnabled = import.meta.env.VITE_USE_MOCKS !== 'false'

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function toIsoDate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return new Date(value).toISOString().slice(0, 10)
}

function normalizeTime(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

function minutesFromTime(time) {
  const [hours = 0, minutes = 0] = String(time || '00:00').split(':').map(Number)
  return (hours * 60) + minutes
}

function hoursBetween(startTime, endTime) {
  const start = minutesFromTime(startTime)
  const end = minutesFromTime(endTime)
  const diff = end >= start ? end - start : (24 * 60) - start + end
  return Math.round((diff / 60) * 10) / 10
}

function addMinutes(time, minutes) {
  const total = (minutesFromTime(time) + minutes + (24 * 60)) % (24 * 60)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function nextNumericId(items = []) {
  return items.reduce((max, item) => Math.max(max, Number(item?.id) || 0), 0) + 1
}

function mockError(message, status = 400) {
  return { response: { status, data: { message } } }
}

function buildHtmlPreview(title, body) {
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; background: #f8fafc; }
          h1 { margin: 0 0 12px; font-size: 24px; }
          h2 { margin: 20px 0 8px; font-size: 16px; }
          p, li { line-height: 1.55; margin: 0; }
          .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-top: 16px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .row { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .row:last-child { border-bottom: 0; }
          .muted { color: #64748b; }
          .total { font-size: 20px; font-weight: 700; color: #0f766e; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${body}
      </body>
    </html>
  `

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
}

function readJsonStorage(key) {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function normalizeDb(rawDb) {
  const seed = createMockDb()
  const normalizedRoles = Array.isArray(rawDb?.roles)
    ? [
      ...seed.roles.map((seedRole) => {
        const currentRole = rawDb.roles.find((role) => role.name === seedRole.name)
        return currentRole
          ? {
            ...seedRole,
            ...currentRole,
            modules: Array.from(new Set([...(seedRole.modules || []), ...(currentRole.modules || [])])),
          }
          : seedRole
      }),
      ...rawDb.roles.filter((role) => !seed.roles.some((seedRole) => seedRole.name === role.name)),
    ]
    : seed.roles
  const normalizedUsers = Array.isArray(rawDb?.users)
    ? rawDb.users.map((user) => {
      const roleModules = normalizedRoles.find((role) => role.name === user.role)?.modules || []
      return {
        ...user,
        modules: Array.from(new Set([...(roleModules || []), ...(user.modules || [])])),
      }
    })
    : seed.users

  return {
    ...seed,
    ...(rawDb || {}),
    meta: {
      ...seed.meta,
      ...(rawDb?.meta || {}),
    },
    roles: normalizedRoles,
    demoProfiles: Array.isArray(rawDb?.demoProfiles) ? rawDb.demoProfiles : seed.demoProfiles,
    departments: Array.isArray(rawDb?.departments) ? rawDb.departments : seed.departments,
    users: normalizedUsers,
    employees: Array.isArray(rawDb?.employees) ? rawDb.employees : seed.employees,
    requests: Array.isArray(rawDb?.requests) ? rawDb.requests : seed.requests,
    notifications: Array.isArray(rawDb?.notifications) ? rawDb.notifications : seed.notifications,
    scheduleEntries: Array.isArray(rawDb?.scheduleEntries) ? rawDb.scheduleEntries : seed.scheduleEntries,
    swaps: Array.isArray(rawDb?.swaps) ? rawDb.swaps : seed.swaps,
    inventoryAssets: Array.isArray(rawDb?.inventoryAssets) ? rawDb.inventoryAssets : seed.inventoryAssets,
    vacancies: Array.isArray(rawDb?.vacancies) ? rawDb.vacancies : seed.vacancies,
    contracts: Array.isArray(rawDb?.contracts) ? rawDb.contracts : seed.contracts,
    peopleOps: {
      ...(seed.peopleOps || {}),
      ...(rawDb?.peopleOps || {}),
    },
    overtimeRules: Array.isArray(rawDb?.overtimeRules) ? rawDb.overtimeRules : seed.overtimeRules,
    overtimeBalances: Array.isArray(rawDb?.overtimeBalances) ? rawDb.overtimeBalances : seed.overtimeBalances,
    sanctions: Array.isArray(rawDb?.sanctions) ? rawDb.sanctions : seed.sanctions,
    onboarding: Array.isArray(rawDb?.onboarding) ? rawDb.onboarding : seed.onboarding,
    payrollGenerated: {
      payroll: { ...(rawDb?.payrollGenerated?.payroll || {}) },
      overtime: { ...(rawDb?.payrollGenerated?.overtime || {}) },
    },
    attachments: {
      requests: { ...(rawDb?.attachments?.requests || {}) },
    },
    previews: {
      ...seed.previews,
      ...(rawDb?.previews || {}),
    },
    settings: {
      ...seed.settings,
      ...(rawDb?.settings || {}),
      general: {
        ...seed.settings.general,
        ...(rawDb?.settings?.general || {}),
      },
      localization: {
        ...seed.settings.localization,
        ...(rawDb?.settings?.localization || {}),
      },
      security: {
        ...seed.settings.security,
        ...(rawDb?.settings?.security || {}),
      },
    },
    payrollHistory: {
      ...seed.payrollHistory,
      ...(rawDb?.payrollHistory || {}),
      globalRuns: Array.isArray(rawDb?.payrollHistory?.globalRuns) ? rawDb.payrollHistory.globalRuns : seed.payrollHistory.globalRuns,
      overtimeRuns: Array.isArray(rawDb?.payrollHistory?.overtimeRuns) ? rawDb.payrollHistory.overtimeRuns : [],
      perEmployee: {
        ...seed.payrollHistory.perEmployee,
        ...(rawDb?.payrollHistory?.perEmployee || {}),
      },
    },
  }
}

function readDb() {
  const rawDb = readJsonStorage(MOCK_DB_KEY)
  const db = normalizeDb(rawDb)

  if (!rawDb) writeJsonStorage(MOCK_DB_KEY, db)
  return db
}

function writeDb(db) {
  const nextDb = normalizeDb(db)
  writeJsonStorage(MOCK_DB_KEY, nextDb)
  return nextDb
}

function updateDb(updater) {
  const db = clone(readDb())
  const next = updater(db) || db
  return clone(writeDb(next))
}

function readSession() {
  return readJsonStorage(MOCK_SESSION_KEY)
}

function writeSession(session) {
  writeJsonStorage(MOCK_SESSION_KEY, session)
}

function clearSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(MOCK_SESSION_KEY)
}

function withDepartment(db, employee) {
  if (!employee) return null

  const department = db.departments.find((item) => item.id === employee.departmentId || item.id === employee.department?.id)

  return {
    ...employee,
    departmentId: department?.id || employee.departmentId || employee.department?.id || null,
    department: department ? { id: department.id, name: department.name } : null,
  }
}

function computeEmployeeFields(employee) {
  const monthlyTarget = Number(employee.monthlyTarget) || 176
  const hourlyRate = Math.round((Number(employee.baseSalary) || 0) / monthlyTarget)

  return {
    ...employee,
    workHoursPerWeek: Math.round(monthlyTarget / 4),
    officeLocation: employee.department?.name || 'Sede principal',
    startDate: employee.startDate || '2025-07-01',
    birthDate: employee.birthDate || '1992-05-15',
    address: employee.address || 'Bogotá, Colombia',
    documentType: employee.documentType || 'CC',
    documentNumber: employee.documentNumber || `10${String(employee.id).padStart(8, '0')}`,
    hourlyRate,
  }
}

function getEmployee(db, id) {
  const employee = db.employees.find((item) => String(item.id) === String(id))
  return employee ? computeEmployeeFields(withDepartment(db, employee)) : null
}

function isPeopleOpsClosedStatus(status) {
  return ['done', 'completed', 'resolved', 'approved', 'live'].includes(String(status || ''))
}

function isPeopleOpsInProgressStatus(status) {
  return ['in_progress', 'review', 'scheduled'].includes(String(status || ''))
}

function hydratePeopleOpsModule(module) {
  if (!module) return null

  const queue = Array.isArray(module.queue) ? module.queue : []
  const automations = Array.isArray(module.automations) ? module.automations : []
  const risks = Array.isArray(module.risks) ? module.risks : []
  const templates = Array.isArray(module.templates) ? module.templates : []

  const metrics = {
    queue_total: queue.length,
    open_queue: queue.filter((item) => !isPeopleOpsClosedStatus(item.status)).length,
    in_progress_queue: queue.filter((item) => isPeopleOpsInProgressStatus(item.status)).length,
    closed_queue: queue.filter((item) => isPeopleOpsClosedStatus(item.status)).length,
    enabled_automations: automations.filter((item) => item.enabled).length,
    automations_total: automations.length,
    risk_count: risks.length,
    templates_total: templates.length,
  }

  return {
    ...module,
    stats: (module.stats || []).map((stat) => (
      stat.metric
        ? { ...stat, value: metrics[stat.metric] ?? stat.value ?? 0 }
        : stat
    )),
  }
}

function getUserRecord(db, userId) {
  return db.users.find((item) => String(item.id) === String(userId)) || null
}

function getEmployeeByEmail(db, email) {
  return db.employees.find((item) => item.email?.toLowerCase() === String(email || '').toLowerCase()) || null
}

function buildCurrentUser(db, userId) {
  const user = getUserRecord(db, userId)
  if (!user) return null

  const employee = getEmployee(db, user.employeeId || user.id) || getEmployeeByEmail(db, user.email)

  return {
    sub: String(user.id),
    id: user.id,
    userId: user.id,
    employeeId: employee?.id || null,
    tenantId: user.tenantId || 'health-enterprise',
    role: user.role,
    name: user.name,
    email: user.email,
    phone: employee?.phone || user.phone || '',
    area: user.area || employee?.department?.name || '',
    modules: user.modules || [],
    currency: db.settings.localization.currency,
  }
}

function getCurrentUser(db = readDb()) {
  const session = readSession()
  if (!session?.userId) return null
  return buildCurrentUser(db, session.userId)
}

function requireCurrentUser(db = readDb()) {
  const user = getCurrentUser(db)
  if (!user) throw mockError('Unauthorized', 401)
  return user
}

function getCurrentEmployee(db = readDb()) {
  const user = requireCurrentUser(db)
  const employee = getEmployee(db, user.employeeId || user.userId)
  if (!employee) throw mockError('Employee not found', 404)
  return employee
}

function getToday() {
  return '2026-03-13'
}

function getIsoWeek(dateValue) {
  const date = new Date(`${toIsoDate(dateValue)}T12:00:00`)
  const target = new Date(date)
  const day = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - day + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target - firstThursday
  return 1 + Math.round(diff / 604800000)
}

function getSurchargeData(dateValue, startTime, endTime) {
  const date = new Date(`${toIsoDate(dateValue)}T12:00:00`)
  const isSunday = date.getDay() === 0
  const startHour = Number(String(startTime || '00:00').split(':')[0])
  const endHour = Number(String(endTime || '00:00').split(':')[0])
  const isNight = startHour >= 21 || startHour < 6 || endHour >= 21 || endHour < 6

  if (isSunday && isNight) return { type: 'dominical_nocturna', multiplier: 2.5 }
  if (isSunday) return { type: 'dominical_diurna', multiplier: 2 }
  if (isNight) return { type: 'nocturna', multiplier: 1.75 }
  return { type: 'diurna', multiplier: 1.25 }
}

function ensureNotificationReadMeta(notification) {
  return {
    ...notification,
    readBy: Array.isArray(notification.readBy) ? notification.readBy : [],
  }
}

function notificationIsRead(notification, userId) {
  if (notification.read === true) return true
  return Array.isArray(notification.readBy) && notification.readBy.includes(userId)
}

function getRoleNotifications(db, role, userId) {
  return db.notifications
    .map(ensureNotificationReadMeta)
    .filter((notification) => !notification.audience || notification.audience.includes(role))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((notification) => ({
      ...notification,
      read: notificationIsRead(notification, userId),
    }))
}

function addNotification(db, notification) {
  const nextId = nextNumericId(db.notifications)
  db.notifications.unshift({
    id: nextId,
    read: false,
    readBy: [],
    createdAt: '2026-03-13T11:45:00',
    ...notification,
  })
}

function buildEmployeeSummary(employee, db) {
  const pendingRequests = db.requests.filter((item) => item.employeeId === employee.id && item.status === 'pending').length
  const inventoryCount = db.inventoryAssets.filter((asset) => String(asset.assignedEmployeeId) === String(employee.id)).length

  return {
    monthlyHours: employee.monthlyHours || 0,
    monthlyTarget: employee.monthlyTarget || 176,
    baseSalary: employee.baseSalary || 0,
    hourlyRate: employee.hourlyRate || Math.round((employee.baseSalary || 0) / (employee.monthlyTarget || 176)),
    overtimeAmount: employee.overtimeAmount || 0,
    overtimeHours: employee.overtimeHours || 0,
    overtimePaid: employee.overtimePaid || 0,
    pendingRequests,
    inventoryCount,
  }
}

function getEmployeeScheduleEntries(db, employeeId) {
  return db.scheduleEntries
    .filter((entry) => String(entry.employeeId) === String(employeeId))
    .sort((left, right) => {
      if (left.date === right.date) return left.startTime.localeCompare(right.startTime)
      return left.date.localeCompare(right.date)
    })
}

function buildPortalShift(entry) {
  return {
    id: entry.id,
    employeeId: entry.employeeId,
    employee: entry.employee,
    date: entry.date,
    shiftType: entry.shiftType,
    startTime: entry.startTime,
    endTime: entry.endTime,
    status: entry.status,
    color: entry.color,
  }
}

function buildScheduleCard(entry) {
  return {
    id: entry.id,
    employeeId: entry.employeeId,
    employee: entry.employee?.name || entry.employee || '',
    role: entry.employee?.roleTitle || entry.role || '',
    date: entry.date,
    type: entry.shiftType || entry.type || 'custom',
    shiftType: entry.shiftType || entry.type || 'custom',
    time: entry.startTime && entry.endTime ? `${entry.startTime} - ${entry.endTime}` : entry.time || '',
    startTime: entry.startTime,
    endTime: entry.endTime,
    color: entry.color || 'blue',
    status: entry.status || 'scheduled',
    leaveType: entry.leaveType,
    leaveReason: entry.leaveReason,
  }
}

function groupScheduleByDate(entries) {
  return entries.reduce((accumulator, entry) => {
    if (!accumulator[entry.date]) accumulator[entry.date] = []
    accumulator[entry.date].push(buildScheduleCard(entry))
    return accumulator
  }, {})
}

function computeDeptCounts(db) {
  const departments = db.departments.map((department) => {
    const count = db.employees.filter((employee) => employee.department?.id === department.id || employee.departmentId === department.id).length
    return {
      ...department,
      employeeCount: count,
      count,
    }
  })

  return {
    departments,
    total: db.employees.length,
  }
}

function computeAttendanceStatus(entry) {
  const baseHash = Number(String(entry.employeeId).slice(-2)) + Number(entry.date.slice(-2))
  const isToday = entry.date === getToday()
  const variance = baseHash % 5
  const duration = hoursBetween(entry.startTime, entry.endTime)

  if (entry.status === 'leave') {
    return {
      checkIn: null,
      checkOut: null,
      hoursWorked: 0,
      status: 'absent',
    }
  }

  if (isToday && variance === 2) {
    return {
      checkIn: `${entry.date}T${addMinutes(entry.startTime, 4)}:00`,
      checkOut: null,
      hoursWorked: Math.max(1, Math.round((duration / 2) * 10) / 10),
      status: 'active',
    }
  }

  if (!isToday && variance === 3) {
    return {
      checkIn: null,
      checkOut: null,
      hoursWorked: 0,
      status: 'absent',
    }
  }

  if (variance === 1) {
    return {
      checkIn: `${entry.date}T${addMinutes(entry.startTime, 22)}:00`,
      checkOut: `${entry.date}T${normalizeTime(entry.endTime)}:00`,
      hoursWorked: Math.max(1, Math.round((duration - 0.4) * 10) / 10),
      status: 'late',
    }
  }

  return {
    checkIn: `${entry.date}T${addMinutes(entry.startTime, 3)}:00`,
    checkOut: `${entry.date}T${normalizeTime(entry.endTime)}:00`,
    hoursWorked: duration,
    status: 'on_time',
  }
}

function buildAttendanceByDate(db, date) {
  const entries = db.scheduleEntries
    .filter((entry) => entry.date === date)
    .map((entry) => {
      const employee = getEmployee(db, entry.employeeId)
      return {
        id: `att-${entry.id}`,
        employeeId: entry.employeeId,
        employee: {
          id: entry.employeeId,
          name: employee?.name || entry.employee?.name,
          roleTitle: employee?.roleTitle || entry.employee?.roleTitle || '',
        },
        date: entry.date,
        ...computeAttendanceStatus(entry),
      }
    })

  const stats = entries.reduce((accumulator, entry) => {
    accumulator.total += 1
    accumulator[entry.status === 'on_time' ? 'onTime' : entry.status] += 1
    return accumulator
  }, { total: 0, onTime: 0, active: 0, late: 0, absent: 0 })

  return {
    data: entries,
    stats,
  }
}

function recalculateOvertimeGroups(groups) {
  return groups.map((group) => {
    const records = (group.records || []).map((record) => ({ ...record }))
    const totalHours = records.reduce((sum, record) => sum + (Number(record.hours) || 0), 0)
    const totalAmount = records.reduce((sum, record) => sum + (Number(record.amount) || 0), 0)
    const paid = records
      .filter((record) => record.status === 'paid')
      .reduce((sum, record) => sum + (Number(record.hours) || 0), 0)

    return {
      ...group,
      totalHours,
      totalAmount,
      paid,
      records,
    }
  })
}

function buildPayrollItem(employee, period, status = 'paid') {
  const gross = (employee.baseSalary || 0) + (employee.transportAllowance || 0) + (employee.bonuses || 0) + (employee.overtimeAmount || 0)
  const health = Math.round((employee.baseSalary || 0) * 0.04)
  const pension = Math.round((employee.baseSalary || 0) * 0.04)
  const tax = (employee.baseSalary || 0) > 5000000 ? Math.round((employee.baseSalary || 0) * 0.02) : 0
  const deductions = Number(employee.deductions) || 0
  const net = gross - health - pension - tax - deductions

  return {
    id: Number(`${employee.id}${period.replace('-', '')}`),
    employeeId: employee.id,
    employee: {
      id: employee.id,
      name: employee.name,
      department: employee.department,
    },
    period,
    status,
    baseSalary: employee.baseSalary || 0,
    transportAllowance: employee.transportAllowance || 0,
    transport: employee.transportAllowance || 0,
    bonuses: employee.bonuses || 0,
    overtimeHours: employee.overtimeHours || 0,
    overtimeAmount: employee.overtimeAmount || 0,
    gross,
    health,
    pension,
    tax,
    deductions,
    net,
    paidAt: status === 'paid' ? `${period}-28T18:00:00` : null,
  }
}

function buildPayslipUrl(item) {
  return buildHtmlPreview(
    `Desprendible ${item.employee?.name || ''} ${item.period}`,
    `
      <div class="card">
        <div class="grid">
          <div><p class="muted">Empleado</p><p>${item.employee?.name || '-'}</p></div>
          <div><p class="muted">Periodo</p><p>${item.period}</p></div>
          <div><p class="muted">Salario base</p><p>$${Number(item.baseSalary || 0).toLocaleString('es-CO')}</p></div>
          <div><p class="muted">Transporte</p><p>$${Number(item.transport || item.transportAllowance || 0).toLocaleString('es-CO')}</p></div>
        </div>
      </div>
      <div class="card">
        <h2>Ingresos</h2>
        <div class="row"><span>Bonificaciones</span><strong>$${Number(item.bonuses || 0).toLocaleString('es-CO')}</strong></div>
        <div class="row"><span>Horas extra</span><strong>$${Number(item.overtimeAmount || 0).toLocaleString('es-CO')}</strong></div>
        <div class="row"><span>Bruto</span><strong>$${Number(item.gross || 0).toLocaleString('es-CO')}</strong></div>
      </div>
      <div class="card">
        <h2>Deducciones</h2>
        <div class="row"><span>Salud</span><strong>$${Number(item.health || 0).toLocaleString('es-CO')}</strong></div>
        <div class="row"><span>Pensión</span><strong>$${Number(item.pension || 0).toLocaleString('es-CO')}</strong></div>
        <div class="row"><span>Impuesto</span><strong>$${Number(item.tax || 0).toLocaleString('es-CO')}</strong></div>
        <div class="row"><span>Otros</span><strong>$${Number(item.deductions || 0).toLocaleString('es-CO')}</strong></div>
      </div>
      <div class="card">
        <p class="muted">Total neto</p>
        <p class="total">$${Number(item.net || 0).toLocaleString('es-CO')}</p>
      </div>
    `
  )
}

function buildOvertimeReportUrl(period, items, summary) {
  const rows = items.map((item) => `
    <div class="row">
      <span>${item.employee?.name || '-'}</span>
      <span>${Number(item.overtimeHours || 0).toFixed(1)}h</span>
      <strong>$${Number(item.overtimeAmount || 0).toLocaleString('es-CO')}</strong>
    </div>
  `).join('')

  return buildHtmlPreview(
    `Reporte de horas extra ${period}`,
    `
      <div class="card">
        <div class="grid">
          <div><p class="muted">Periodo</p><p>${period}</p></div>
          <div><p class="muted">Empleados</p><p>${summary.employees || 0}</p></div>
          <div><p class="muted">Valor total</p><p>$${Number(summary.gross || 0).toLocaleString('es-CO')}</p></div>
          <div><p class="muted">Estado</p><p>Liquidado</p></div>
        </div>
      </div>
      <div class="card">
        <h2>Detalle por colaborador</h2>
        ${rows || '<p class="muted">Sin registros.</p>'}
      </div>
    `
  )
}

function getCurrentLiquidation(db, type) {
  const generated = db.payrollGenerated?.[type]?.[CURRENT_PERIOD]
  if (!generated) return { items: [], summary: {} }
  return generated
}

function findPayslip(db, id) {
  const generatedItems = Object.values(db.payrollGenerated?.payroll || {}).flatMap((entry) => entry.items || [])
  const historicalItems = Object.values(db.payrollHistory?.perEmployee || {}).flatMap((entries) => entries || [])
  return [...generatedItems, ...historicalItems].find((item) => String(item.id) === String(id)) || null
}

function hydrateEmployeeRequest(db, request) {
  const employee = getEmployee(db, request.employeeId)

  return {
    ...request,
    employee: request.employee || (employee ? {
      id: employee.id,
      name: employee.name,
      roleTitle: employee.roleTitle,
      baseSalary: employee.baseSalary,
    } : null),
  }
}

function parseEmployeeListResponse(db, params = {}) {
  const { page = 1, limit = 20, departmentId, search } = params
  const source = db.employees.map((employee) => computeEmployeeFields(withDepartment(db, employee)))
  const filtered = source.filter((employee) => {
    if (departmentId && employee.department?.id !== departmentId) return false
    if (search) {
      const query = String(search).toLowerCase()
      return (
        employee.name?.toLowerCase().includes(query)
        || employee.email?.toLowerCase().includes(query)
        || employee.roleTitle?.toLowerCase().includes(query)
      )
    }
    return true
  })
  const total = filtered.length
  const normalizedLimit = Number(limit) || total || 1
  const totalPages = Math.max(1, Math.ceil(total / normalizedLimit))
  const start = (Math.max(1, Number(page) || 1) - 1) * normalizedLimit

  return {
    data: filtered.slice(start, start + normalizedLimit),
    total,
    page: Math.max(1, Number(page) || 1),
    limit: normalizedLimit,
    totalPages,
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeAssetPhotos(photos = [], fallbackLabel = 'Dispositivo') {
  return (photos || []).map((photo, index) => {
    if (typeof photo === 'string') {
      return {
        id: `asset-photo-${index + 1}`,
        label: `Vista ${index + 1}`,
        device: fallbackLabel,
        preview: photo,
        accent: 'from-slate-100 via-white to-slate-100',
      }
    }

    return {
      id: photo.id || `asset-photo-${index + 1}`,
      label: photo.label || `Vista ${index + 1}`,
      device: photo.device || fallbackLabel,
      preview: photo.preview || '',
      accent: photo.accent || 'from-slate-100 via-white to-slate-100',
    }
  })
}

function hydrateInventoryAsset(db, asset) {
  const employee = asset.assignedEmployeeId ? getEmployee(db, asset.assignedEmployeeId) : null

  return {
    ...asset,
    photos: normalizeAssetPhotos(asset.photos, `${asset.type || 'Activo'} ${asset.brand || ''} ${asset.model || ''}`.trim()),
    assignedEmployee: employee ? {
      id: employee.id,
      name: employee.name,
      roleTitle: employee.roleTitle,
      department: employee.department,
    } : null,
  }
}

function buildInventoryStats(db) {
  const assets = db.inventoryAssets || []
  return {
    total: assets.length,
    assigned: assets.filter((asset) => asset.status === 'assigned').length,
    available: assets.filter((asset) => asset.status === 'warehouse').length,
    maintenance: assets.filter((asset) => asset.status === 'maintenance').length,
    totalCost: assets.reduce((sum, asset) => sum + (Number(asset.cost) || 0), 0),
  }
}

function createVacancyUid(db, area) {
  const areaCode = String(area || 'general').slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')
  const currentYear = getToday().slice(0, 4)
  const nextId = nextNumericId((db.vacancies || []).map((vacancy) => ({ id: vacancy.id })))
  return `VAC-${areaCode || 'GEN'}-${currentYear}-${String(nextId).padStart(3, '0')}`
}

function hydrateVacancy(vacancy) {
  const applicants = (vacancy.applicants || []).slice().sort((left, right) => new Date(right.appliedAt || '2026-03-01') - new Date(left.appliedAt || '2026-03-01'))
  const summary = applicants.reduce((accumulator, applicant) => {
    accumulator.total += 1
    accumulator[applicant.status] = (accumulator[applicant.status] || 0) + 1
    return accumulator
  }, { total: 0 })

  return {
    ...vacancy,
    applicants,
    applicantsCount: vacancy.applicantsCount || applicants.length,
    summary,
    applicationPath: `/apply/${vacancy.uid}`,
  }
}

function normalizeAscii(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
}

function escapePdfText(value) {
  return normalizeAscii(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function toBase64(value) {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') return window.btoa(value)
  return btoa(value)
}

function buildPdfDocument(title, lines = []) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 780 Td',
    `(${escapePdfText(title)}) Tj`,
    '/F1 11 Tf',
  ]

  let cursorY = 748
  lines.forEach((line) => {
    content.push(`1 0 0 1 50 ${cursorY} Tm`)
    content.push(`(${escapePdfText(line)}) Tj`)
    cursorY -= 18
  })
  content.push('ET')

  const stream = content.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  const offsets = [0]
  let pdf = '%PDF-1.4\n'
  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return `data:application/pdf;base64,${toBase64(pdf)}`
}

function buildContractDocumentUrl(contract) {
  return buildPdfDocument(
    `Contrato ${contract.code}`,
    [
      `Candidato: ${contract.candidateName}`,
      `Cargo: ${contract.roleTitle}`,
      `Tipo de contrato: ${contract.contractType}`,
      `Fecha de inicio: ${contract.startDate}`,
      `Salario pactado: COP ${Number(contract.salary || 0).toLocaleString('es-CO')}`,
      `Estado: ${contract.status === 'signed' ? 'Firmado' : 'Pendiente firma'}`,
      `Firma digital: ${contract.digitalSignature || 'Pendiente'}`,
      '',
      'Este documento formaliza la vinculacion laboral dentro del flujo de talento humano.',
      'Incluye trazabilidad documental, envio por correo y activacion automatica del expediente.',
    ]
  )
}

function resolveDepartmentForContract(db, contract, vacancy) {
  const area = String(vacancy?.area || contract.roleTitle || '').toLowerCase()

  if (area.includes('tecn')) return db.departments.find((item) => item.id === 'tech') || db.departments[0]
  if (area.includes('nomin')) return db.departments.find((item) => item.id === 'payroll') || db.departments[0]
  if (area.includes('admi') || area.includes('usuario') || area.includes('recep')) {
    return db.departments.find((item) => item.id === 'care') || db.departments[0]
  }
  if (area.includes('oper') || area.includes('clin') || area.includes('enfer') || area.includes('bacter')) {
    return db.departments.find((item) => item.id === 'ops') || db.departments[0]
  }
  return db.departments.find((item) => item.id === 'hr') || db.departments[0]
}

function ensureEmployeeFromContract(db, contract) {
  const existingEmployee = getEmployeeByEmail(db, contract.candidateEmail)
  if (existingEmployee) return computeEmployeeFields(withDepartment(db, existingEmployee))

  const vacancy = (db.vacancies || []).find((item) => item.uid === contract.vacancyUid) || null
  const department = resolveDepartmentForContract(db, contract, vacancy)
  const employeeId = nextNumericId(db.employees)
  const employee = {
    id: employeeId,
    employeeCode: `ZK-${1000 + employeeId}`,
    name: contract.candidateName || 'Nuevo colaborador',
    email: contract.candidateEmail || `empleado${employeeId}@zekya.co`,
    phone: '',
    role: 'employee',
    roleTitle: contract.roleTitle || 'Colaborador',
    departmentId: department?.id || null,
    department: department ? { id: department.id, name: department.name } : null,
    status: 'active',
    contractType: String(contract.contractType || 'Indefinido').toLowerCase(),
    baseSalary: Number(contract.salary) || 2500000,
    transportAllowance: Number(contract.salary || 0) > 3000000 ? 0 : 162000,
    bonuses: 0,
    deductions: 0,
    managerName: department?.manager?.name || 'Camila Reyes',
    vacationAvailable: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    overtimePaid: 0,
    monthlyHours: 0,
    monthlyTarget: 176,
    startDate: contract.startDate || getToday(),
  }

  db.employees.unshift(employee)

  const roleModules = db.roles.find((role) => role.name === 'employee')?.modules || []
  const existingUser = db.users.find((user) => user.email?.toLowerCase() === employee.email.toLowerCase())
  if (!existingUser) {
    db.users.unshift({
      id: employeeId,
      name: employee.name,
      email: employee.email,
      role: 'employee',
      area: department?.name || '',
      status: 'active',
      phone: employee.phone,
      employeeId,
      modules: roleModules,
      tenantId: 'health-enterprise',
    })
  }

  if (!db.onboarding.find((process) => String(process.employeeId) === String(employeeId))) {
    db.onboarding.unshift({
      id: nextNumericId(db.onboarding),
      employeeId,
      employee: { name: employee.name, position: employee.roleTitle },
      startedAt: `${getToday()}T16:10:00`,
      currentStep: 1,
      totalSteps: 5,
      progress: 20,
      status: 'in_progress',
    })
  }

  addNotification(db, {
    title: 'Empleado creado desde contrato',
    message: `${employee.name} quedó activo con código ${employee.employeeCode}.`,
    type: 'success',
    audience: ['admin', 'coordinator'],
  })

  return computeEmployeeFields(withDepartment(db, employee))
}

function hydrateContract(db, contract) {
  const vacancy = (db.vacancies || []).find((item) => item.uid === contract.vacancyUid) || null
  const linkedEmployee = contract.employeeId
    ? getEmployee(db, contract.employeeId)
    : getEmployeeByEmail(db, contract.candidateEmail)

  return {
    ...contract,
    vacancyTitle: vacancy?.title || contract.roleTitle,
    linkedEmployee: linkedEmployee ? {
      id: linkedEmployee.id,
      employeeCode: linkedEmployee.employeeCode,
      name: linkedEmployee.name,
      roleTitle: linkedEmployee.roleTitle,
      department: linkedEmployee.department?.name || '',
    } : null,
    documentUrl: buildContractDocumentUrl(contract),
  }
}

function buildContractStats(db) {
  const contracts = db.contracts || []
  return {
    total: contracts.length,
    pending: contracts.filter((contract) => contract.status === 'pending_signature').length,
    signed: contracts.filter((contract) => contract.status === 'signed').length,
    sent: contracts.filter((contract) => contract.emailSentAt).length,
  }
}

async function fileToDataUrl(file) {
  if (!file) return null

  if (typeof file === 'string') return file

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const mockAuth = {
  async login(email, password) {
    await wait(220)

    const db = readDb()
    const normalizedEmail = String(email || '').toLowerCase()
    const user = db.users.find((item) => item.email?.toLowerCase() === normalizedEmail)

    if (!user || password !== getDefaultDemoPassword()) {
      throw new Error('Credenciales inválidas')
    }

    const accessToken = `mock-access-${user.id}-${Date.now()}`
    const refreshToken = `mock-refresh-${user.id}-${Date.now()}`

    writeSession({
      userId: user.id,
      accessToken,
      refreshToken,
      loggedAt: '2026-03-13T08:00:00',
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: buildCurrentUser(db, user.id),
    }
  },

  async me() {
    await wait(80)

    const db = readDb()
    const user = requireCurrentUser(db)
    return { data: user }
  },

  async refresh() {
    await wait(80)

    const session = readSession()
    if (!session?.userId) throw mockError('Unauthorized', 401)

    const db = readDb()
    const accessToken = `mock-access-${session.userId}-${Date.now()}`
    const refreshToken = `mock-refresh-${session.userId}-${Date.now()}`

    writeSession({
      ...session,
      accessToken,
      refreshToken,
      refreshedAt: '2026-03-13T09:00:00',
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: buildCurrentUser(db, session.userId),
    }
  },

  async logout() {
    await wait(60)
    clearSession()
    return { success: true }
  },

  async register(data) {
    await wait(180)
    return {
      tenant: {
        id: `tenant-${Date.now()}`,
        slug: String(data?.companyName || 'demo').toLowerCase().replace(/\s+/g, '-'),
      },
    }
  },
}

export const mockEmployees = {
  async list(params = {}) {
    await wait()
    return parseEmployeeListResponse(readDb(), params)
  },

  async get(id) {
    await wait()
    return getEmployee(readDb(), id)
  },

  async create(data) {
    await wait(160)

    let createdEmployee = null

    updateDb((db) => {
      const department = db.departments.find((item) => item.id === data.departmentId) || db.departments[0]
      const employeeId = nextNumericId(db.employees)
      const employee = {
        id: employeeId,
        employeeCode: `ZK-${1000 + employeeId}`,
        name: data.name || 'Nuevo colaborador',
        email: data.email || `empleado${employeeId}@zekya.co`,
        phone: data.phone || '',
        role: data.role || 'employee',
        roleTitle: data.roleTitle || 'Colaborador',
        departmentId: department?.id || null,
        department: department ? { id: department.id, name: department.name } : null,
        status: 'active',
        contractType: data.contractType || 'indefinido',
        baseSalary: Number(data.baseSalary) || 2500000,
        transportAllowance: Number(data.transportAllowance) || 162000,
        bonuses: Number(data.bonuses) || 0,
        deductions: Number(data.deductions) || 0,
        managerName: data.managerName || 'Camila Reyes',
        vacationAvailable: 0,
        overtimeHours: 0,
        overtimeAmount: 0,
        overtimePaid: 0,
        monthlyHours: 0,
        monthlyTarget: 176,
      }

      db.employees.unshift(employee)
      db.users.unshift({
        id: employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        area: department?.name || '',
        status: 'active',
        phone: employee.phone,
        employeeId,
        modules: db.roles.find((role) => role.name === employee.role)?.modules || [],
        tenantId: 'health-enterprise',
      })

      createdEmployee = computeEmployeeFields(withDepartment(db, employee))
      return db
    })

    return createdEmployee
  },

  async update(id, data) {
    await wait(140)

    let updatedEmployee = null

    updateDb((db) => {
      db.employees = db.employees.map((employee) => {
        if (String(employee.id) !== String(id)) return employee
        const nextEmployee = { ...employee, ...data }
        updatedEmployee = computeEmployeeFields(withDepartment(db, nextEmployee))
        return nextEmployee
      })
      return db
    })

    return updatedEmployee
  },

  async remove(id) {
    await wait(140)

    updateDb((db) => {
      db.employees = db.employees.filter((employee) => String(employee.id) !== String(id))
      db.users = db.users.filter((user) => String(user.employeeId || user.id) !== String(id))
      return db
    })

    return { success: true }
  },

  async payslips(id) {
    await wait()
    const db = readDb()
    return clone(db.payrollHistory.perEmployee[String(id)] || db.payrollHistory.perEmployee[id] || [])
  },

  async documents(id) {
    await wait()

    const employee = getEmployee(readDb(), id)
    if (!employee) return []

    return [
      { id: `${employee.id}-contract`, name: `Contrato ${employee.name}.pdf`, category: 'Contrato', fileSize: 128000 },
      { id: `${employee.id}-id`, name: `Documento ${employee.name}.pdf`, category: 'Identidad', fileSize: 92000 },
      { id: `${employee.id}-medical`, name: `Examen medico ${employee.name}.pdf`, category: 'Salud ocupacional', fileSize: 110000 },
    ]
  },

  async history(id) {
    await wait()

    const employee = getEmployee(readDb(), id)
    if (!employee) return []

    return [
      { id: `${employee.id}-h1`, action: 'Ingreso', description: `Alta del colaborador en ${employee.department?.name || 'la organización'}`, createdAt: '2026-01-10T09:00:00' },
      { id: `${employee.id}-h2`, action: 'Actualización', description: 'Validación documental completada', createdAt: '2026-02-03T10:30:00' },
      { id: `${employee.id}-h3`, action: 'Nómina', description: 'Primer pago procesado correctamente', createdAt: '2026-02-28T18:20:00' },
    ]
  },

  async byDepartment(departmentId) {
    await wait()
    return parseEmployeeListResponse(readDb(), { departmentId, limit: 999 })
  },

  async deptCounts() {
    await wait()
    return computeDeptCounts(readDb())
  },
}

export const mockInventory = {
  async list(params = {}) {
    await wait()

    const db = readDb()
    const query = String(params.search || '').toLowerCase()
    const assets = db.inventoryAssets
      .map((asset) => hydrateInventoryAsset(db, asset))
      .filter((asset) => {
        if (params.employeeId && String(asset.assignedEmployeeId || '') !== String(params.employeeId)) return false
        if (params.status && asset.status !== params.status) return false
        if (params.area && asset.area !== params.area) return false
        if (query) {
          return [
            asset.assetCode,
            asset.serial,
            asset.type,
            asset.brand,
            asset.model,
            asset.area,
            asset.assignedEmployee?.name,
          ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
        }
        return true
      })
      .sort((left, right) => Number(right.id) - Number(left.id))

    return {
      data: clone(assets),
      stats: buildInventoryStats(db),
    }
  },

  async create(data) {
    await wait(180)

    const photos = Array.isArray(data?.photos)
      ? await Promise.all(data.photos.map(async (photo, index) => ({
        id: `asset-photo-${Date.now()}-${index + 1}`,
        label: photo?.name?.split?.('.')?.[0] || `Vista ${index + 1}`,
        device: `${data.type || 'Activo'} ${data.brand || ''} ${data.model || ''}`.trim(),
        preview: await fileToDataUrl(photo),
        accent: 'from-slate-100 via-white to-slate-100',
      })))
      : []

    let createdAsset = null

    updateDb((db) => {
      const nextId = nextNumericId(db.inventoryAssets)
      const assignedEmployee = data.assignedEmployeeId ? getEmployee(db, data.assignedEmployeeId) : null
      const areaCode = String(data.area || 'general').slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')
      const asset = {
        id: nextId,
        assetCode: `AST-${areaCode || 'GEN'}-${String(nextId).padStart(3, '0')}`,
        area: data.area || assignedEmployee?.department?.name || 'General',
        type: data.type || 'Activo',
        category: data.category || slugify(data.type || 'activo'),
        brand: data.brand || '',
        model: data.model || '',
        serial: data.serial || `SER-${Date.now()}`,
        status: assignedEmployee ? 'assigned' : (data.status || 'warehouse'),
        condition: data.condition || 'good',
        assignedEmployeeId: assignedEmployee?.id || null,
        assignedAt: assignedEmployee ? (data.assignedAt || getToday()) : '',
        location: data.location || assignedEmployee?.department?.name || 'Bodega central',
        purchaseDate: data.purchaseDate || getToday(),
        cost: Number(data.cost) || 0,
        notes: data.notes || '',
        specs: Array.isArray(data.specs) ? data.specs : String(data.specs || '').split(',').map((item) => item.trim()).filter(Boolean),
        photos,
      }

      db.inventoryAssets.unshift(asset)
      createdAsset = hydrateInventoryAsset(db, asset)
      return db
    })

    return createdAsset
  },

  async assign(id, employeeId) {
    await wait(100)

    let updated = null

    updateDb((db) => {
      const employee = employeeId ? getEmployee(db, employeeId) : null
      db.inventoryAssets = db.inventoryAssets.map((asset) => {
        if (String(asset.id) !== String(id)) return asset
        const nextAsset = {
          ...asset,
          assignedEmployeeId: employee?.id || null,
          assignedAt: employee ? getToday() : '',
          status: employee ? 'assigned' : 'warehouse',
          location: employee ? employee.department?.name || asset.location : asset.location,
        }
        updated = hydrateInventoryAsset(db, nextAsset)
        return nextAsset
      })
      return db
    })

    return updated
  },

  async update(id, data) {
    await wait(120)
    let updated = null
    updateDb((db) => {
      db.inventoryAssets = db.inventoryAssets.map((asset) => {
        if (String(asset.id) !== String(id)) return asset
        const specs = Array.isArray(data.specs) ? data.specs : String(data.specs || '').split(',').map((i) => i.trim()).filter(Boolean)
        const assignedEmployee = data.assignedEmployeeId ? getEmployee(db, data.assignedEmployeeId) : null
        const nextAsset = {
          ...asset,
          area: data.area ?? asset.area,
          type: data.type ?? asset.type,
          category: data.category ?? asset.category,
          brand: data.brand ?? asset.brand,
          model: data.model ?? asset.model,
          serial: data.serial ?? asset.serial,
          cost: data.cost != null ? Number(data.cost) : asset.cost,
          location: data.location ?? asset.location,
          condition: data.condition ?? asset.condition,
          purchaseDate: data.purchaseDate ?? asset.purchaseDate,
          notes: data.notes ?? asset.notes,
          specs,
          assignedEmployeeId: assignedEmployee?.id ?? asset.assignedEmployeeId,
          status: assignedEmployee ? 'assigned' : (data.assignedEmployeeId === null ? 'warehouse' : asset.status),
        }
        updated = hydrateInventoryAsset(db, nextAsset)
        return nextAsset
      })
      return db
    })
    return updated
  },

  async delete(id) {
    await wait(80)
    updateDb((db) => {
      db.inventoryAssets = db.inventoryAssets.filter((a) => String(a.id) !== String(id))
      return db
    })
    return { success: true }
  },
}

export const mockAttendance = {
  async byDate(date) {
    await wait()
    return buildAttendanceByDate(readDb(), toIsoDate(date))
  },

  async checkIn(data) {
    await wait(100)
    return {
      id: `checkin-${Date.now()}`,
      ...data,
      createdAt: '2026-03-13T08:05:00',
    }
  },

  async checkOut(id, time) {
    await wait(100)
    return {
      id,
      time,
      status: 'checked_out',
    }
  },
}

export const mockPayroll = {
  async rules() {
    await wait()
    return clone(readDb().overtimeRules)
  },

  async createRule(data) {
    await wait(160)

    let createdRule = null

    updateDb((db) => {
      createdRule = {
        id: nextNumericId(db.overtimeRules),
        status: 'active',
        ...data,
      }
      db.overtimeRules.push(createdRule)
      return db
    })

    return createdRule
  },

  async toggleRule(id) {
    await wait(100)

    updateDb((db) => {
      db.overtimeRules = db.overtimeRules.map((rule) => (
        String(rule.id) === String(id)
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
          : rule
      ))
      return db
    })

    return { success: true }
  },

  async byUser() {
    await wait()
    return clone(recalculateOvertimeGroups(readDb().overtimeBalances))
  },

  async byDept() {
    await wait()

    const db = readDb()
    const aggregation = recalculateOvertimeGroups(db.overtimeBalances).reduce((accumulator, group) => {
      accumulator[group.department] = (accumulator[group.department] || 0) + (group.totalAmount || 0)
      return accumulator
    }, {})

    return Object.entries(aggregation).map(([department, totalAmount]) => ({ department, totalAmount }))
  },

  async liquidation(type = 'payroll') {
    await wait()

    const { items, summary } = getCurrentLiquidation(readDb(), type)
    const payload = clone(items)
    payload.summary = clone(summary)

    return { data: payload }
  },

  async history(type = 'payroll') {
    await wait()

    const db = readDb()
    const history = type === 'overtime'
      ? db.payrollHistory.overtimeRuns || []
      : db.payrollHistory.globalRuns || []

    return { data: clone(history) }
  },

  async run(period = CURRENT_PERIOD) {
    await wait(220)

    let processed = 0

    updateDb((db) => {
      if (db.payrollGenerated.payroll[period]) throw mockError('already exists')

      const employees = db.employees
        .map((employee) => computeEmployeeFields(withDepartment(db, employee)))
        .filter((employee) => employee.status === 'active')

      const items = employees.map((employee) => buildPayrollItem(employee, period))
      const summary = {
        gross: items.reduce((sum, item) => sum + item.gross, 0),
        deductions: items.reduce((sum, item) => sum + item.health + item.pension + item.tax + item.deductions, 0),
        net: items.reduce((sum, item) => sum + item.net, 0),
        employees: items.length,
      }

      db.payrollGenerated.payroll[period] = { items, summary }
      processed = items.length

      if (!db.payrollHistory.globalRuns.find((run) => run.period === period)) {
        db.payrollHistory.globalRuns.unshift({
          period,
          processedAt: `${period}-28T18:00:00`,
          employeeCount: items.length,
          totalNet: summary.net,
          status: 'completed',
        })
      }

      employees.forEach((employee) => {
        const existing = db.payrollHistory.perEmployee[employee.id] || []
        if (!existing.find((item) => item.period === period)) {
          db.payrollHistory.perEmployee[employee.id] = [buildPayrollItem(employee, period), ...existing]
        }
      })

      return db
    })

    return { employees: processed }
  },

  async runOvertime(period = CURRENT_PERIOD) {
    await wait(220)

    let processed = 0

    updateDb((db) => {
      if (db.payrollGenerated.overtime[period]) throw mockError('already exists')

      const groups = recalculateOvertimeGroups(db.overtimeBalances)
      const approvedRecords = groups.flatMap((group) => (
        group.records
          .filter((record) => record.status === 'approved')
          .map((record) => ({ group, record }))
      ))

      if (approvedRecords.length === 0) throw mockError('No approved overtime')

      const groupedByEmployee = approvedRecords.reduce((accumulator, { group, record }) => {
        if (!accumulator[group.employeeId]) {
          const employee = getEmployee(db, group.employeeId)
          accumulator[group.employeeId] = {
            id: `ot-${period}-${group.employeeId}`,
            employeeId: group.employeeId,
            employee: {
              id: group.employeeId,
              name: group.name,
              department: employee?.department || null,
            },
            overtimeHours: 0,
            overtimeAmount: 0,
            status: 'paid',
          }
        }

        accumulator[group.employeeId].overtimeHours += Number(record.hours) || 0
        accumulator[group.employeeId].overtimeAmount += Number(record.amount) || 0
        return accumulator
      }, {})

      const items = Object.values(groupedByEmployee)
      const summary = {
        gross: items.reduce((sum, item) => sum + item.overtimeAmount, 0),
        deductions: 0,
        net: items.reduce((sum, item) => sum + item.overtimeAmount, 0),
        employees: items.length,
      }

      db.overtimeBalances = db.overtimeBalances.map((group) => ({
        ...group,
        records: group.records.map((record) => (
          record.status === 'approved'
            ? { ...record, status: 'paid' }
            : record
        )),
      }))
      db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      db.payrollGenerated.overtime[period] = { items, summary }
      db.previews.overtimeReport = buildOvertimeReportUrl(period, items, summary)
      processed = items.length

      if (!db.payrollHistory.overtimeRuns.find((run) => run.period === period)) {
        db.payrollHistory.overtimeRuns.unshift({
          period,
          processedAt: `${period}-28T19:00:00`,
          employeeCount: items.length,
          totalNet: summary.net,
          status: 'completed',
        })
      }

      db.employees = db.employees.map((employee) => {
        const overtimeItem = items.find((item) => item.employeeId === employee.id)
        if (!overtimeItem) return employee
        return {
          ...employee,
          overtimePaid: (employee.overtimePaid || 0) + overtimeItem.overtimeAmount,
        }
      })

      return db
    })

    return { employees: processed }
  },

  async overtimeForLiquidation(period, week) {
    await wait()

    const balances = recalculateOvertimeGroups(readDb().overtimeBalances)
      .flatMap((group) => group.records.map((record) => ({ ...record, employeeId: group.employeeId, employee: group.name, department: group.department })))
      .filter((record) => !period || record.period?.startsWith(period.slice(0, 4)))
      .filter((record) => !week || String(record.weekNumber) === String(week))

    return clone(balances)
  },

  async approveBalance(id) {
    await wait(100)

    updateDb((db) => {
      db.overtimeBalances = db.overtimeBalances.map((group) => ({
        ...group,
        records: group.records.map((record) => (
          String(record.id) === String(id)
            ? { ...record, status: 'approved' }
            : record
        )),
      }))
      db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      return db
    })

    return { success: true }
  },

  async rejectBalance(id) {
    await wait(100)

    updateDb((db) => {
      db.overtimeBalances = db.overtimeBalances.map((group) => ({
        ...group,
        records: group.records.map((record) => (
          String(record.id) === String(id)
            ? { ...record, status: 'rejected' }
            : record
        )),
      }))
      db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      return db
    })

    return { success: true }
  },

  async overtimeReportView(period = CURRENT_PERIOD) {
    await wait(80)
    const db = readDb()
    const report = db.payrollGenerated.overtime[period]
    if (!report) throw mockError('Reporte no generado')
    return { url: buildOvertimeReportUrl(period, report.items, report.summary) }
  },

  async overtimeReportDownload(period = CURRENT_PERIOD) {
    await wait(80)
    const db = readDb()
    const report = db.payrollGenerated.overtime[period]
    if (!report) throw mockError('Reporte no generado')
    return { url: buildOvertimeReportUrl(period, report.items, report.summary) }
  },

  async generateOvertimeReport(period = CURRENT_PERIOD) {
    await wait(120)

    updateDb((db) => {
      const report = db.payrollGenerated.overtime[period]
      if (!report) throw mockError('Reporte no generado')
      db.previews.overtimeReport = buildOvertimeReportUrl(period, report.items, report.summary)
      return db
    })

    return { generated: true }
  },

  async generatePayslip(id) {
    await wait(100)
    const item = findPayslip(readDb(), id)
    if (!item) throw mockError('Desprendible no encontrado', 404)
    return { url: buildPayslipUrl(item) }
  },

  async viewPayslip(id) {
    await wait(80)
    const item = findPayslip(readDb(), id)
    if (!item) throw mockError('Desprendible no encontrado', 404)
    return { url: buildPayslipUrl(item) }
  },

  async downloadPayslip(id) {
    await wait(80)
    const item = findPayslip(readDb(), id)
    if (!item) throw mockError('Desprendible no encontrado', 404)
    return { url: buildPayslipUrl(item) }
  },

  async generateAllPayslips(period = CURRENT_PERIOD) {
    await wait(120)
    const db = readDb()
    const current = db.payrollGenerated.payroll[period]
    const generated = current?.items?.length || 0
    return { generated }
  },

  async overtimeBalances() {
    await wait()
    return clone(recalculateOvertimeGroups(readDb().overtimeBalances))
  },

  async addOvertimeBalance(data) {
    await wait(140)

    let created = null

    updateDb((db) => {
      const employee = getEmployee(db, data.employeeId)
      if (!employee) throw mockError('Empleado no encontrado', 404)

      let group = db.overtimeBalances.find((item) => item.employeeId === employee.id)
      if (!group) {
        group = {
          employeeId: employee.id,
          name: employee.name,
          department: employee.department?.name || '',
          totalHours: 0,
          totalAmount: 0,
          paid: 0,
          records: [],
        }
        db.overtimeBalances.push(group)
      }

      created = {
        id: nextNumericId(db.overtimeBalances.flatMap((item) => item.records || [])),
        period: data.period || `${CURRENT_PERIOD}-W${String(getIsoWeek(getToday())).padStart(2, '0')}`,
        weekNumber: data.weekNumber || getIsoWeek(getToday()),
        hours: Number(data.hours) || 0,
        amount: Number(data.amount) || 0,
        status: data.status || 'pending',
        notes: data.notes || '',
        employeeId: employee.id,
      }

      group.records.push(created)
      db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      return db
    })

    return created
  },

  async updateBalanceStatus(id, status) {
    await wait(100)

    updateDb((db) => {
      db.overtimeBalances = db.overtimeBalances.map((group) => ({
        ...group,
        records: group.records.map((record) => (
          String(record.id) === String(id)
            ? { ...record, status }
            : record
        )),
      }))
      db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      return db
    })

    return { success: true }
  },

  async calculateOvertime(data = {}) {
    await wait(80)

    const db = readDb()
    const employee = data.employeeId ? getEmployee(db, data.employeeId) : null
    const baseSalary = Number(data.baseSalary) || Number(employee?.baseSalary) || 0
    const monthlyTarget = Number(data.monthlyTarget) || Number(employee?.monthlyTarget) || 176
    const hourlyRate = Math.round(baseSalary / (monthlyTarget || 176))
    const hours = Number(data.hours) || hoursBetween(data.startTime, data.endTime)
    const surcharge = data.multiplier
      ? { type: data.surchargeType || 'manual', multiplier: Number(data.multiplier) }
      : getSurchargeData(data.date || getToday(), data.startTime || '18:00', data.endTime || '21:00')
    const amount = Math.round(hourlyRate * Math.max(hours, 0) * surcharge.multiplier)
    const estimatedEmployerCost = Math.round(amount * 1.09)

    return {
      employee: employee ? { id: employee.id, name: employee.name, roleTitle: employee.roleTitle } : null,
      hourlyRate,
      hours,
      surchargeType: surcharge.type,
      multiplier: surcharge.multiplier,
      amount,
      estimatedEmployerCost,
      breakdown: {
        base: Math.round(hourlyRate * Math.max(hours, 0)),
        recargo: Math.max(0, amount - Math.round(hourlyRate * Math.max(hours, 0))),
      },
    }
  },
}

export const mockRecruitment = {
  async list(params = {}) {
    await wait()

    const db = readDb()
    const query = String(params.search || '').toLowerCase()
    const vacancies = db.vacancies
      .map(hydrateVacancy)
      .filter((vacancy) => {
        if (params.status && vacancy.status !== params.status) return false
        if (params.area && vacancy.area !== params.area) return false
        if (query) {
          return [vacancy.uid, vacancy.title, vacancy.area, vacancy.recruiter, vacancy.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        }
        return true
      })
      .sort((left, right) => new Date(right.openingDate || '2026-03-01') - new Date(left.openingDate || '2026-03-01'))

    return {
      data: clone(vacancies),
      stats: {
        total: vacancies.length,
        open: vacancies.filter((vacancy) => vacancy.status === 'open').length,
        screening: vacancies.filter((vacancy) => vacancy.status === 'screening').length,
        applicants: vacancies.reduce((sum, vacancy) => sum + (vacancy.applicantsCount || 0), 0),
      },
    }
  },

  async create(data) {
    await wait(160)

    let createdVacancy = null

    updateDb((db) => {
      const currentUser = getCurrentUser(db)
      const vacancy = {
        id: nextNumericId(db.vacancies),
        uid: createVacancyUid(db, data.area),
        title: data.title || 'Nueva vacante',
        area: data.area || 'General',
        openings: Number(data.openings) || 1,
        applicantsCount: 0,
        status: data.status || 'open',
        recruiter: data.recruiter || currentUser?.name || 'Equipo talento',
        location: data.location || 'Bogotá',
        workMode: data.workMode || 'Híbrido',
        contractType: data.contractType || 'Indefinido',
        salaryMin: Number(data.salaryMin) || 0,
        salaryMax: Number(data.salaryMax) || 0,
        openingDate: data.openingDate || getToday(),
        closingDate: data.closingDate || getToday(),
        description: data.description || '',
        channels: Array.isArray(data.channels) ? data.channels : String(data.channels || '').split(',').map((item) => item.trim()).filter(Boolean),
        applicants: [],
      }

      db.vacancies.unshift(vacancy)
      addNotification(db, {
        title: 'Nueva vacante publicada',
        message: `${vacancy.title} quedó disponible con UID ${vacancy.uid}.`,
        type: 'info',
        audience: ['admin', 'coordinator'],
      })
      createdVacancy = hydrateVacancy(vacancy)
      return db
    })

    return createdVacancy
  },

  async getPublicVacancy(uid) {
    await wait(90)

    const db = readDb()
    const vacancy = db.vacancies
      .map(hydrateVacancy)
      .find((item) => String(item.uid).toLowerCase() === String(uid || '').toLowerCase())

    if (!vacancy) throw mockError('Vacante no encontrada', 404)

    return {
      uid: vacancy.uid,
      title: vacancy.title,
      area: vacancy.area,
      location: vacancy.location,
      workMode: vacancy.workMode,
      contractType: vacancy.contractType,
      salaryMin: vacancy.salaryMin,
      salaryMax: vacancy.salaryMax,
      openings: vacancy.openings,
      recruiter: vacancy.recruiter,
      closingDate: vacancy.closingDate,
      description: vacancy.description,
      channels: vacancy.channels,
      applicationPath: vacancy.applicationPath,
    }
  },

  async submitApplicationByUid(uid, data) {
    await wait(200)

    let response = null

    updateDb((db) => {
      const vacancy = db.vacancies.find((item) => String(item.uid).toLowerCase() === String(uid || '').toLowerCase())
      if (!vacancy) throw mockError('Vacante no encontrada', 404)

      const applicantSeed = `${slugify(data.name || 'app')}-${String(vacancy.id).padStart(2, '0')}`
      const username = `${applicantSeed || 'applicant'}.${String((vacancy.applicants || []).length + 1).padStart(2, '0')}`
      const temporaryPassword = `Zk!${String(Date.now()).slice(-6)}`
      const applicantId = `APP-${String(vacancy.area || 'GEN').slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'GEN'}-${String((vacancy.applicants || []).length + 1).padStart(3, '0')}`

      const applicant = {
        id: applicantId,
        name: data.name || 'Nuevo postulante',
        email: data.email || '',
        phone: data.phone || '',
        source: data.source || 'Formulario público',
        appliedAt: getToday(),
        expectedSalary: Number(data.expectedSalary) || Number(vacancy.salaryMax) || Number(vacancy.salaryMin) || 0,
        status: 'review',
        interviewScore: null,
        resumeScore: 0,
        nextStep: 'Screening y pruebas iniciales',
        documentsReady: false,
        contractId: null,
        linkedin: data.linkedin || '',
        portfolio: data.portfolio || '',
        notes: data.notes || '',
        resumeFileName: data.resumeFileName || 'Hoja_de_vida.pdf',
        portalAccess: {
          username,
          temporaryPassword,
          expiresAt: `${getToday()}T23:59:00`,
          modules: ['pruebas', 'documentos', 'estado-proceso'],
        },
      }

      vacancy.applicants = [applicant, ...(vacancy.applicants || [])]
      vacancy.applicantsCount = vacancy.applicants.length
      vacancy.status = vacancy.status === 'open' ? vacancy.status : 'screening'

      addNotification(db, {
        title: 'Nueva postulación recibida',
        message: `${applicant.name} ingresó a ${vacancy.title} desde el formulario público.`,
        type: 'info',
        audience: ['admin', 'coordinator'],
      })

      response = {
        applicant: clone(applicant),
        credentials: clone(applicant.portalAccess),
        vacancy: {
          uid: vacancy.uid,
          title: vacancy.title,
          applicationPath: `/apply/${vacancy.uid}`,
        },
      }

      return db
    })

    return response
  },

  async updateApplicantStatus(vacancyId, applicantId, status, patch = {}) {
    await wait(120)

    let updatedApplicant = null

    updateDb((db) => {
      db.vacancies = db.vacancies.map((vacancy) => {
        if (String(vacancy.id) !== String(vacancyId)) return vacancy

        return {
          ...vacancy,
          applicants: (vacancy.applicants || []).map((applicant) => {
            if (String(applicant.id) !== String(applicantId)) return applicant

            updatedApplicant = {
              ...applicant,
              ...patch,
              status,
              nextStep: patch.nextStep || applicant.nextStep,
            }

            return updatedApplicant
          }),
        }
      })
      return db
    })

    return clone(updatedApplicant)
  },
}

export const mockContracts = {
  async list() {
    await wait()
    const db = readDb()
    return {
      data: clone(db.contracts.map((contract) => hydrateContract(db, contract)).sort((left, right) => Number(right.id) - Number(left.id))),
      stats: buildContractStats(db),
    }
  },

  async get(id) {
    await wait(80)
    const db = readDb()
    const contract = db.contracts.find((item) => String(item.id) === String(id))
    return contract ? hydrateContract(db, contract) : null
  },

  async createFromApplicant(vacancyId, applicantId) {
    await wait(140)

    let createdContract = null

    updateDb((db) => {
      const vacancy = db.vacancies.find((item) => String(item.id) === String(vacancyId))
      if (!vacancy) throw mockError('Vacante no encontrada', 404)
      const applicant = (vacancy.applicants || []).find((item) => String(item.id) === String(applicantId))
      if (!applicant) throw mockError('Candidato no encontrado', 404)

      if (applicant.contractId) {
        const existing = db.contracts.find((item) => String(item.id) === String(applicant.contractId))
        createdContract = hydrateContract(db, existing)
        return db
      }

      const nextId = nextNumericId(db.contracts)
      const currentUser = getCurrentUser(db)
      const contract = {
        id: nextId,
        code: `CTR-${getToday().slice(0, 4)}-${String(nextId).padStart(3, '0')}`,
        vacancyUid: vacancy.uid,
        candidateName: applicant.name,
        candidateEmail: applicant.email,
        roleTitle: vacancy.title,
        contractType: vacancy.contractType || 'Indefinido',
        salary: Number(applicant.expectedSalary) || Number(vacancy.salaryMax) || Number(vacancy.salaryMin) || 0,
        startDate: vacancy.closingDate || getToday(),
        generatedAt: `${getToday()}T10:00:00`,
        status: 'pending_signature',
        digitalSignature: '',
        emailSentAt: '',
        signedAt: '',
        employeeId: null,
        sentBy: currentUser?.name || vacancy.recruiter,
        documents: ['Contrato base', 'Cláusula de confidencialidad', 'Anexo de vinculación'],
      }

      db.contracts.unshift(contract)
      db.vacancies = db.vacancies.map((item) => (
        String(item.id) !== String(vacancyId)
          ? item
          : {
            ...item,
            applicants: (item.applicants || []).map((entry) => (
              String(entry.id) !== String(applicantId)
                ? entry
                : {
                  ...entry,
                  status: 'contract_signature',
                  documentsReady: true,
                  contractId: nextId,
                  nextStep: 'Firma de contrato',
                }
            )),
          }
      ))

      addNotification(db, {
        title: 'Contrato generado',
        message: `Se creó contrato para ${applicant.name}.`,
        type: 'info',
        audience: ['admin', 'coordinator'],
      })
      createdContract = hydrateContract(db, contract)
      return db
    })

    return createdContract
  },

  async createFromCandidate(data) {
    await wait(140)

    let createdContract = null

    updateDb((db) => {
      const nextId = nextNumericId(db.contracts)
      const existing = db.contracts.find((contract) => (
        String(contract.candidateEmail || '').toLowerCase() === String(data.email || '').toLowerCase()
        && String(contract.roleTitle || '').toLowerCase() === String(data.roleTitle || data.role || '').toLowerCase()
      ))

      if (existing) {
        createdContract = hydrateContract(db, existing)
        return db
      }

      const currentUser = getCurrentUser(db)
      const contract = {
        id: nextId,
        code: `CTR-${getToday().slice(0, 4)}-${String(nextId).padStart(3, '0')}`,
        vacancyUid: data.vacancyUid || '',
        candidateName: data.name || 'Candidato',
        candidateEmail: data.email || '',
        roleTitle: data.roleTitle || data.role || 'Cargo',
        contractType: data.contractType || 'Indefinido',
        salary: Number(data.salary) || 0,
        startDate: data.startDate || getToday(),
        generatedAt: `${getToday()}T10:30:00`,
        status: 'pending_signature',
        digitalSignature: '',
        emailSentAt: '',
        signedAt: '',
        employeeId: null,
        sentBy: currentUser?.name || data.responsible || 'Equipo HR',
        documents: ['Contrato laboral', 'Autorización de datos', 'Checklist de ingreso'],
      }

      db.contracts.unshift(contract)
      addNotification(db, {
        title: 'Contrato listo para firma',
        message: `${contract.candidateName} pasó a firma digital.`,
        type: 'info',
        audience: ['admin', 'coordinator'],
      })
      createdContract = hydrateContract(db, contract)
      return db
    })

    return createdContract
  },

  async send(id) {
    await wait(100)

    let updated = null

    updateDb((db) => {
      db.contracts = db.contracts.map((contract) => {
        if (String(contract.id) !== String(id)) return contract
        const nextContract = {
          ...contract,
          emailSentAt: `${getToday()}T11:00:00`,
        }
        updated = hydrateContract(db, nextContract)
        return nextContract
      })
      return db
    })

    return updated
  },

  async sign(id, signature) {
    await wait(120)

    let updated = null

    updateDb((db) => {
      db.contracts = db.contracts.map((contract) => {
        if (String(contract.id) !== String(id)) return contract
        const baseContract = {
          ...contract,
          status: 'signed',
          digitalSignature: signature || contract.candidateName,
          signedAt: `${getToday()}T15:45:00`,
        }
        const linkedEmployee = ensureEmployeeFromContract(db, baseContract)
        const nextContract = {
          ...baseContract,
          employeeId: linkedEmployee.id,
        }

        db.vacancies = db.vacancies.map((vacancy) => (
          vacancy.uid !== nextContract.vacancyUid
            ? vacancy
            : {
              ...vacancy,
              applicants: (vacancy.applicants || []).map((applicant) => (
                String(applicant.contractId) !== String(nextContract.id)
                  ? applicant
                  : {
                    ...applicant,
                    status: 'hired',
                    nextStep: 'Vinculado y entregado a administracion',
                    employeeId: linkedEmployee.id,
                  }
              )),
            }
        ))

        addNotification(db, {
          title: 'Contrato firmado',
          message: `${nextContract.candidateName} firmó y ya aparece en empleados.`,
          type: 'success',
          audience: ['admin', 'coordinator'],
        })

        updated = hydrateContract(db, nextContract)
        return nextContract
      })
      return db
    })

    return updated
  },

  async export(id) {
    await wait(80)
    const db = readDb()
    const contract = db.contracts.find((item) => String(item.id) === String(id))
    if (!contract) throw mockError('Contrato no encontrado', 404)
    return { url: buildContractDocumentUrl(contract) }
  },
}

export const mockRequests = {
  async list(params = {}) {
    await wait()

    const db = readDb()
    const currentUser = getCurrentUser(db)
    const scopedList = db.requests
      .map((request) => hydrateEmployeeRequest(db, request))
      .filter((request) => {
        if (currentUser?.role === 'employee' && request.employeeId !== currentUser.employeeId) return false
        if (params.status && request.status !== params.status) return false
        if (params.employeeId && String(request.employeeId) !== String(params.employeeId)) return false
        return true
      })
      .sort((left, right) => new Date(right.createdAt || right.reviewedAt || '2026-03-01') - new Date(left.createdAt || left.reviewedAt || '2026-03-01'))

    const limited = params.limit ? scopedList.slice(0, Number(params.limit)) : scopedList
    return { data: clone(limited) }
  },

  async byEmployee(id) {
    await wait()
    return clone(readDb().requests.filter((request) => String(request.employeeId) === String(id)))
  },

  async create(data) {
    await wait(160)

    let createdRequest = null

    updateDb((db) => {
      const employee = getCurrentEmployee(db)
      const hourlyRate = employee.hourlyRate || Math.round((employee.baseSalary || 0) / (employee.monthlyTarget || 176))
      const nextId = nextNumericId(db.requests)
      const startDate = toIsoDate(data.startDate)
      const endDate = toIsoDate(data.endDate || data.startDate)
      const request = {
        id: nextId,
        employeeId: employee.id,
        employee: {
          id: employee.id,
          name: employee.name,
          roleTitle: employee.roleTitle,
          baseSalary: employee.baseSalary,
        },
        type: data.type || 'leave',
        startDate,
        endDate,
        days: Number(data.days) || 1,
        reason: data.reason || '',
        description: data.comments || data.description || data.reason || '',
        comments: data.comments || '',
        status: 'pending',
        createdAt: '2026-03-13T10:40:00',
      }

      if (request.type === 'overtime') {
        const surcharge = getSurchargeData(startDate, data.startTime, data.endTime)
        const overtimeHours = hoursBetween(data.startTime, data.endTime)
        request.startTime = normalizeTime(data.startTime)
        request.endTime = normalizeTime(data.endTime)
        request.overtimeHours = overtimeHours
        request.surchargeType = surcharge.type
        request.surchargeMultiplier = surcharge.multiplier
        request.overtimeAmount = Math.round(hourlyRate * overtimeHours * surcharge.multiplier)
      }

      db.requests.unshift(request)
      addNotification(db, {
        title: 'Nueva solicitud registrada',
        message: `${employee.name} envió una novedad para revisión.`,
        type: request.type === 'overtime' ? 'payroll' : 'request',
        audience: ['admin', 'coordinator'],
      })
      createdRequest = request
      return db
    })

    return createdRequest
  },

  async approve(id) {
    await wait(100)

    updateDb((db) => {
      const request = db.requests.find((item) => String(item.id) === String(id))
      if (!request) throw mockError('Solicitud no encontrada', 404)

      request.status = 'approved'
      request.reviewedAt = '2026-03-13T11:10:00'

      if (request.type === 'overtime') {
        let group = db.overtimeBalances.find((item) => item.employeeId === request.employeeId)
        if (!group) {
          const employee = getEmployee(db, request.employeeId)
          group = {
            employeeId: employee.id,
            name: employee.name,
            department: employee.department?.name || '',
            totalHours: 0,
            totalAmount: 0,
            paid: 0,
            records: [],
          }
          db.overtimeBalances.push(group)
        }

        const alreadyExists = group.records.some((record) => record.requestId === request.id)
        if (!alreadyExists) {
          group.records.push({
            id: nextNumericId(db.overtimeBalances.flatMap((item) => item.records || [])),
            requestId: request.id,
            period: `${request.startDate.slice(0, 4)}-W${String(getIsoWeek(request.startDate)).padStart(2, '0')}`,
            weekNumber: getIsoWeek(request.startDate),
            hours: request.overtimeHours || 0,
            amount: request.overtimeAmount || 0,
            status: 'approved',
            notes: request.description || request.reason || '',
            employeeId: request.employeeId,
          })
        }

        db.overtimeBalances = recalculateOvertimeGroups(db.overtimeBalances)
      }

      addNotification(db, {
        title: 'Solicitud aprobada',
        message: `La solicitud de ${request.employee?.name || 'un colaborador'} fue aprobada.`,
        type: 'success',
        audience: ['admin', 'coordinator', 'employee'],
      })

      return db
    })

    return { success: true }
  },

  async reject(id) {
    await wait(100)

    updateDb((db) => {
      const request = db.requests.find((item) => String(item.id) === String(id))
      if (!request) throw mockError('Solicitud no encontrada', 404)

      request.status = 'rejected'
      request.reviewedAt = '2026-03-13T11:20:00'

      addNotification(db, {
        title: 'Solicitud rechazada',
        message: `La solicitud de ${request.employee?.name || 'un colaborador'} fue rechazada.`,
        type: 'warning',
        audience: ['admin', 'coordinator', 'employee'],
      })

      return db
    })

    return { success: true }
  },

  async uploadAttachment(id, file) {
    const dataUrl = await fileToDataUrl(file)
    await wait(120)

    updateDb((db) => {
      db.attachments.requests[id] = {
        id,
        name: file?.name || `adjunto-${id}.pdf`,
        size: file?.size || 0,
        url: dataUrl || buildHtmlPreview('Adjunto demo', '<div class="card"><p>Adjunto mock sin archivo real.</p></div>'),
      }

      db.requests = db.requests.map((request) => (
        String(request.id) === String(id)
          ? { ...request, attachmentKey: `requests/${file?.name || `adjunto-${id}.pdf`}` }
          : request
      ))

      return db
    })

    return { success: true }
  },

  async getAttachment(id) {
    await wait(60)

    const db = readDb()
    const stored = db.attachments.requests[id]
    if (stored?.url) return { url: stored.url }

    const request = db.requests.find((item) => String(item.id) === String(id))
    if (!request?.attachmentKey) return { url: null }

    return {
      url: buildHtmlPreview(
        request.attachmentKey.split('/').pop(),
        `<div class="card"><p>Vista mock del adjunto <strong>${request.attachmentKey}</strong>.</p></div>`
      ),
    }
  },
}

export const mockSchedule = {
  async month(year, month) {
    await wait()

    const target = `${year}-${String(month).padStart(2, '0')}`
    const entries = readDb().scheduleEntries.filter((entry) => entry.date.startsWith(target))
    return groupScheduleByDate(entries)
  },

  async day(date) {
    await wait()

    const entries = readDb().scheduleEntries
      .filter((entry) => entry.date === toIsoDate(date))
      .map(buildScheduleCard)

    return clone(entries)
  },

  async stats(year) {
    await wait()

    const db = readDb()
    const yearPrefix = `${year}-`
    const entries = db.scheduleEntries.filter((entry) => entry.date.startsWith(yearPrefix))
    const activeEmployees = new Set(entries.map((entry) => entry.employeeId)).size
    const coveredDays = new Set(entries.map((entry) => entry.date)).size

    return {
      totalShifts: entries.filter((entry) => entry.status === 'scheduled').length,
      activeEmployees,
      coverage: `${Math.min(100, Math.round((coveredDays / 260) * 100))}%`,
      uncovered: Math.max(0, 260 - coveredDays),
    }
  },

  async createShifts(data) {
    await wait(160)
    const createdEntries = []

    updateDb((db) => {
      const employee = getEmployee(db, data.employeeId)
      if (!employee) throw mockError('Empleado no encontrado', 404)

      data.dates.forEach((date) => {
        const dateKey = toIsoDate(date)
        const entryId = `${employee.id}-${dateKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const entry = {
          id: entryId,
          employeeId: employee.id,
          employee: {
            id: employee.id,
            name: employee.name,
            roleTitle: employee.roleTitle,
          },
          role: employee.roleTitle,
          date: dateKey,
          shiftType: data.shiftType || 'custom',
          startTime: normalizeTime(data.startTime),
          endTime: normalizeTime(data.endTime),
          color: data.color || 'blue',
          status: 'scheduled',
        }

        db.scheduleEntries.push(entry)
        createdEntries.push(entry)
      })

      return db
    })

    return groupScheduleByDate(createdEntries)
  },

  async updateShift(id, data) {
    await wait(120)

    updateDb((db) => {
      db.scheduleEntries = db.scheduleEntries.map((entry) => (
        String(entry.id) === String(id)
          ? {
              ...entry,
              shiftType: data.shiftType || entry.shiftType,
              startTime: normalizeTime(data.startTime || entry.startTime),
              endTime: normalizeTime(data.endTime || entry.endTime),
              color: data.color || entry.color,
            }
          : entry
      ))
      return db
    })

    return { success: true }
  },

  async deleteShift(id) {
    await wait(120)

    updateDb((db) => {
      db.scheduleEntries = db.scheduleEntries.filter((entry) => String(entry.id) !== String(id))
      return db
    })

    return { success: true }
  },

  async generateAI(data) {
    await wait(220)

    const db = readDb()
    const dates = []
    const from = new Date(`${toIsoDate(data.weekStart)}T12:00:00`)
    const to = new Date(`${toIsoDate(data.weekEnd)}T12:00:00`)

    for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
      dates.push(cursor.toISOString().slice(0, 10))
    }

    const generated = []
    const presets = [
      { shiftType: 'morning', startTime: '06:00', endTime: '14:00', color: 'blue' },
      { shiftType: 'afternoon', startTime: '14:00', endTime: '22:00', color: 'purple' },
      { shiftType: 'night', startTime: '22:00', endTime: '06:00', color: 'amber' },
    ]

    data.employeeIds.forEach((employeeId, employeeIndex) => {
      const employee = getEmployee(db, employeeId)
      dates.forEach((date, dateIndex) => {
        const preset = presets[(employeeIndex + dateIndex) % presets.length]
        generated.push({
          id: `ai-${employeeId}-${date}`,
          employeeId,
          employee: {
            id: employee.id,
            name: employee.name,
            roleTitle: employee.roleTitle,
          },
          date,
          ...preset,
        })
      })
    })

    return {
      summary: {
        totalEmployees: data.employeeIds.length,
        totalDays: dates.length,
      },
      shifts: generated,
    }
  },
}

export const mockReports = {
  async dashboard() {
    await wait()

    const db = readDb()
    const activeEmployees = db.employees.filter((employee) => employee.status === 'active')
    const attendanceToday = buildAttendanceByDate(db, getToday())

    return {
      data: {
        totalEmployees: activeEmployees.length,
        activeToday: attendanceToday.stats.onTime + attendanceToday.stats.active,
        monthlyPayroll: activeEmployees.reduce((sum, employee) => sum + employee.baseSalary + employee.transportAllowance + employee.bonuses, 0),
        pendingRequests: db.requests.filter((request) => request.status === 'pending').length,
      },
    }
  },

  async payroll() {
    await wait()

    const db = readDb()
    const activeEmployees = db.employees
      .map((employee) => computeEmployeeFields(withDepartment(db, employee)))
      .filter((employee) => employee.status === 'active')
    const items = activeEmployees.map((employee) => buildPayrollItem(employee, CURRENT_PERIOD))
    const monthly = (db.payrollHistory.globalRuns || [])
      .slice()
      .reverse()
      .map((run) => ({ name: run.period.slice(5), total: run.totalNet }))
    const byDepartment = computeDeptCounts(db).departments.map((department) => ({
      name: department.name,
      costo: activeEmployees
        .filter((employee) => employee.department?.id === department.id)
        .reduce((sum, employee) => sum + employee.baseSalary + employee.transportAllowance + employee.bonuses, 0),
    }))
    const overtimeTrend = recalculateOvertimeGroups(db.overtimeBalances).map((group, index) => ({
      name: `W${index + 1}`,
      horas: group.records.reduce((sum, record) => sum + (record.hours || 0), 0),
    }))

    return {
      data: {
        gross: items.reduce((sum, item) => sum + item.gross, 0),
        deductions: items.reduce((sum, item) => sum + item.health + item.pension + item.tax + item.deductions, 0),
        net: items.reduce((sum, item) => sum + item.net, 0),
        monthly,
        byDepartment,
        overtimeTrend,
      },
    }
  },

  async attendance() {
    await wait()

    const db = readDb()
    const weekDates = ['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13']
    const weekly = weekDates.map((date) => {
      const day = buildAttendanceByDate(db, date)
      return {
        name: date.slice(8),
        presentes: day.stats.onTime + day.stats.active + day.stats.late,
        ausentes: day.stats.absent,
      }
    })
    const totals = weekly.reduce((accumulator, day) => {
      accumulator.present += day.presentes
      accumulator.absent += day.ausentes
      return accumulator
    }, { present: 0, absent: 0 })
    const lateCount = weekDates.reduce((sum, date) => sum + buildAttendanceByDate(db, date).stats.late, 0)
    const totalEntries = totals.present + totals.absent

    return {
      data: {
        avgRate: totalEntries ? Math.round((totals.present / totalEntries) * 100) : 0,
        lateCount,
        absentCount: totals.absent,
        weekly,
      },
    }
  },

  async requests() {
    await wait()

    const db = readDb()
    const requests = db.requests
    const byTypeMap = requests.reduce((accumulator, request) => {
      accumulator[request.type] = (accumulator[request.type] || 0) + 1
      return accumulator
    }, {})

    return {
      data: {
        total: requests.length,
        approved: requests.filter((request) => request.status === 'approved').length,
        rejected: requests.filter((request) => request.status === 'rejected').length,
        pending: requests.filter((request) => request.status === 'pending').length,
        byType: Object.entries(byTypeMap).map(([name, value]) => ({ name, value })),
      },
    }
  },
}

export const mockDepartments = {
  async list() {
    await wait()
    return clone(computeDeptCounts(readDb()).departments)
  },

  async create(data) {
    await wait(140)

    let createdDepartment = null

    updateDb((db) => {
      createdDepartment = {
        id: String(data.name || 'dept').toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        manager: { name: 'Sin asignar' },
        employeeCount: 0,
      }
      db.departments.push(createdDepartment)
      return db
    })

    return createdDepartment
  },

  async remove(id) {
    await wait(120)

    updateDb((db) => {
      db.departments = db.departments.filter((department) => department.id !== id)
      db.employees = db.employees.map((employee) => (
        employee.departmentId === id || employee.department?.id === id
          ? { ...employee, departmentId: null, department: null }
          : employee
      ))
      return db
    })

    return { success: true }
  },
}

export const mockUsers = {
  async list(params = {}) {
    await wait()

    const db = readDb()
    const query = String(params.search || '').toLowerCase()
    const data = db.users.filter((user) => {
      if (!query) return true
      return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
    })

    return {
      data: clone(data),
      total: data.length,
    }
  },

  async roles() {
    await wait()
    return { data: clone(readDb().roles) }
  },

  async createRole(data) {
    await wait(120)

    let createdRole = null

    updateDb((db) => {
      createdRole = {
        id: nextNumericId(db.roles),
        icon: data.icon || 'badge',
        description: data.description || '',
        perms: data.perms || { es: [], en: [] },
        modules: data.modules || [],
        name: data.name,
      }
      db.roles.push(createdRole)
      return db
    })

    return createdRole
  },

  async updateRole(id, data) {
    await wait(120)

    updateDb((db) => {
      db.roles = db.roles.map((role) => (
        String(role.id) === String(id)
          ? { ...role, ...data }
          : role
      ))

      db.users = db.users.map((user) => {
        const role = db.roles.find((item) => item.name === user.role)
        return role ? { ...user, modules: role.modules || [] } : user
      })

      return db
    })

    return { success: true }
  },

  async deleteRole(id) {
    await wait(120)

    updateDb((db) => {
      const role = db.roles.find((item) => String(item.id) === String(id))
      if (role && ['admin', 'coordinator', 'employee'].includes(role.name)) throw mockError('No se puede eliminar un rol base')
      db.roles = db.roles.filter((item) => String(item.id) !== String(id))
      return db
    })

    return { success: true }
  },

  async create(data) {
    await wait(120)
    return {
      id: Date.now(),
      ...data,
    }
  },

  async assignRole(id, roleName) {
    await wait(100)

    updateDb((db) => {
      const role = db.roles.find((item) => item.name === roleName)
      db.users = db.users.map((user) => (
        String(user.id) === String(id)
          ? { ...user, role: roleName, modules: role?.modules || [] }
          : user
      ))
      db.employees = db.employees.map((employee) => (
        String(employee.id) === String(id)
          ? { ...employee, role: roleName }
          : employee
      ))
      return db
    })

    return { success: true }
  },

  async toggleStatus(id) {
    await wait(100)

    updateDb((db) => {
      db.users = db.users.map((user) => (
        String(user.id) === String(id)
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ))
      db.employees = db.employees.map((employee) => (
        String(employee.id) === String(id)
          ? { ...employee, status: employee.status === 'active' ? 'inactive' : 'active' }
          : employee
      ))
      return db
    })

    return { success: true }
  },
}

export const mockOnboarding = {
  async list() {
    await wait()
    return clone(readDb().onboarding)
  },

  async get(id) {
    await wait()
    return clone(readDb().onboarding.find((item) => String(item.id) === String(id)) || null)
  },

  async start(employeeId) {
    await wait(140)

    let createdProcess = null

    updateDb((db) => {
      const employee = getEmployee(db, employeeId)
      if (!employee) throw mockError('Empleado no encontrado', 404)

      createdProcess = {
        id: nextNumericId(db.onboarding),
        employeeId: employee.id,
        employee: {
          name: employee.name,
          position: employee.roleTitle,
        },
        startedAt: '2026-03-13T09:00:00',
        currentStep: 1,
        totalSteps: 5,
        progress: 20,
        status: 'in_progress',
      }

      db.onboarding.unshift(createdProcess)
      return db
    })

    return createdProcess
  },

  async advance(id) {
    await wait(100)

    updateDb((db) => {
      db.onboarding = db.onboarding.map((process) => {
        if (String(process.id) !== String(id)) return process
        const currentStep = Math.min(process.totalSteps, process.currentStep + 1)
        const completed = currentStep === process.totalSteps
        return {
          ...process,
          currentStep,
          progress: Math.round((currentStep / process.totalSteps) * 100),
          status: completed ? 'completed' : 'in_progress',
        }
      })
      return db
    })

    return { success: true }
  },
}

export const mockPeopleOps = {
  async module(moduleKey) {
    await wait(110)

    const module = readDb().peopleOps?.[moduleKey]
    if (!module) throw mockError('Modulo no encontrado', 404)

    return clone(hydratePeopleOpsModule(module))
  },

  async setItemStatus(moduleKey, sectionKey, itemId, status) {
    await wait(120)

    let nextModule = null

    updateDb((db) => {
      const module = db.peopleOps?.[moduleKey]
      if (!module) throw mockError('Modulo no encontrado', 404)

      const section = Array.isArray(module?.[sectionKey]) ? module[sectionKey] : []
      module[sectionKey] = section.map((item) => (
        String(item.id) === String(itemId)
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      ))

      nextModule = hydratePeopleOpsModule(module)
      return db
    })

    return clone(nextModule)
  },

  async toggleAutomation(moduleKey, automationId) {
    await wait(120)

    let nextModule = null

    updateDb((db) => {
      const module = db.peopleOps?.[moduleKey]
      if (!module) throw mockError('Modulo no encontrado', 404)

      module.automations = (module.automations || []).map((item) => (
        String(item.id) === String(automationId)
          ? { ...item, enabled: !item.enabled, updatedAt: new Date().toISOString() }
          : item
      ))

      nextModule = hydratePeopleOpsModule(module)
      return db
    })

    return clone(nextModule)
  },
}

export const mockSettings = {
  async getGeneral() {
    await wait(60)
    return clone(readDb().settings.general)
  },

  async updateGeneral(data) {
    await wait(80)

    updateDb((db) => {
      db.settings.general = { ...db.settings.general, ...data }
      return db
    })

    return clone(readDb().settings.general)
  },

  async getLocalization() {
    await wait(60)
    return clone(readDb().settings.localization)
  },

  async updateLocalization(data) {
    await wait(80)

    updateDb((db) => {
      db.settings.localization = { ...db.settings.localization, ...data }
      return db
    })

    if (typeof window !== 'undefined') {
      if (data.currency) window.localStorage.setItem('currency', data.currency)
      if (data.timeFormat) window.localStorage.setItem('timeFormat', data.timeFormat)
    }

    return clone(readDb().settings.localization)
  },

  async getSecurity() {
    await wait(60)
    return clone(readDb().settings.security)
  },

  async updateSecurity(data) {
    await wait(80)

    updateDb((db) => {
      db.settings.security = { ...db.settings.security, ...data }
      return db
    })

    return clone(readDb().settings.security)
  },
}

export const mockPortal = {
  async home() {
    await wait()

    const db = readDb()
    const employee = getCurrentEmployee(db)
    const nextShift = getEmployeeScheduleEntries(db, employee.id)
      .map(buildPortalShift)
      .find((entry) => entry.date >= getToday()) || null

    return {
      employeeId: employee.id,
      employee: {
        id: employee.id,
        name: employee.name,
        roleTitle: employee.roleTitle,
      },
      nextShift,
      stats: buildEmployeeSummary(employee, db),
    }
  },

  async schedule() {
    await wait()
    const db = readDb()
    const employee = getCurrentEmployee(db)
    return getEmployeeScheduleEntries(db, employee.id).map(buildPortalShift)
  },

  async teamSchedule() {
    await wait()

    const db = readDb()
    const employee = getCurrentEmployee(db)
    return db.scheduleEntries
      .filter((entry) => entry.employeeId !== employee.id)
      .filter((entry) => getEmployee(db, entry.employeeId)?.department?.id === employee.department?.id)
      .map(buildPortalShift)
  },

  async vacationBalance() {
    await wait(60)

    const db = readDb()
    const employee = getCurrentEmployee(db)
    const pending = db.requests
      .filter((request) => request.employeeId === employee.id && request.type === 'vacation' && request.status === 'pending')
      .reduce((sum, request) => sum + (request.days || 0), 0)

    return {
      available: employee.vacationAvailable || 0,
      pending,
      used: Math.max(0, 15 - (employee.vacationAvailable || 0)),
    }
  },

  async notifications() {
    await wait(60)
    const db = readDb()
    const user = requireCurrentUser(db)
    return getRoleNotifications(db, user.role, user.userId)
  },

  async coworkers() {
    await wait(60)

    const db = readDb()
    const employee = getCurrentEmployee(db)
    return db.employees
      .map((item) => computeEmployeeFields(withDepartment(db, item)))
      .filter((item) => item.id !== employee.id)
      .filter((item) => item.status === 'active')
      .filter((item) => item.department?.id === employee.department?.id)
      .map((item) => ({ id: item.id, name: item.name, roleTitle: item.roleTitle }))
  },

  async swaps() {
    await wait()

    const db = readDb()
    const employee = getCurrentEmployee(db)
    return db.swaps
      .filter((swap) => swap.requesterId === employee.id || swap.targetId === employee.id)
      .sort((left, right) => Number(right.id) - Number(left.id))
  },

  async createSwap(data) {
    await wait(140)

    let createdSwap = null

    updateDb((db) => {
      const employee = getCurrentEmployee(db)
      const target = getEmployee(db, data.targetId)
      const shift = db.scheduleEntries.find((entry) => String(entry.id) === String(data.shiftId))
      if (!target || !shift) throw mockError('Datos incompletos')

      createdSwap = {
        id: nextNumericId(db.swaps),
        requesterId: employee.id,
        requester: { id: employee.id, name: employee.name },
        targetId: target.id,
        target: { id: target.id, name: target.name },
        requesterShift: {
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          shiftType: shift.shiftType,
        },
        status: 'pending',
        reason: data.reason || '',
      }

      db.swaps.unshift(createdSwap)
      return db
    })

    return createdSwap
  },

  async respondSwap(id, accept) {
    await wait(100)

    updateDb((db) => {
      db.swaps = db.swaps.map((swap) => (
        String(swap.id) === String(id)
          ? { ...swap, status: accept ? 'accepted' : 'declined' }
          : swap
      ))
      return db
    })

    return { success: true }
  },

  async cancelSwap(id) {
    await wait(100)

    updateDb((db) => {
      db.swaps = db.swaps.map((swap) => (
        String(swap.id) === String(id)
          ? { ...swap, status: 'cancelled' }
          : swap
      ))
      return db
    })

    return { success: true }
  },

  async payHistory() {
    await wait()
    const db = readDb()
    const employee = getCurrentEmployee(db)
    return clone(db.payrollHistory.perEmployee[String(employee.id)] || db.payrollHistory.perEmployee[employee.id] || [])
  },

  async inventory() {
    await wait(80)
    const db = readDb()
    const employee = getCurrentEmployee(db)
    return clone(
      db.inventoryAssets
        .filter((asset) => String(asset.assignedEmployeeId) === String(employee.id))
        .map((asset) => hydrateInventoryAsset(db, asset))
    )
  },
}

export const mockNotifications = {
  async list() {
    await wait(60)

    const db = readDb()
    const user = requireCurrentUser(db)
    const data = getRoleNotifications(db, user.role, user.userId)

    return {
      data,
      unread: data.filter((notification) => !notification.read).length,
    }
  },

  async markRead(id) {
    await wait(60)

    updateDb((db) => {
      const user = requireCurrentUser(db)
      db.notifications = db.notifications.map((notification) => {
        if (String(notification.id) !== String(id)) return notification
        const nextNotification = ensureNotificationReadMeta(notification)
        if (!nextNotification.readBy.includes(user.userId)) nextNotification.readBy.push(user.userId)
        return nextNotification
      })
      return db
    })

    return { success: true }
  },

  async markAllRead() {
    await wait(60)

    updateDb((db) => {
      const user = requireCurrentUser(db)
      db.notifications = db.notifications.map((notification) => {
        const nextNotification = ensureNotificationReadMeta(notification)
        if (!nextNotification.readBy.includes(user.userId)) nextNotification.readBy.push(user.userId)
        return nextNotification
      })
      return db
    })

    return { success: true }
  },

  async registerToken(token) {
    await wait(40)
    return { token, registered: true }
  },
}

function buildSanctionLetterUrl(sanction) {
  return buildHtmlPreview(
    `Acta de sancion ${sanction.employee?.name || ''}`,
    `
      <div class="card">
        <div class="grid">
          <div><p class="muted">Empleado</p><p>${sanction.employee?.name || 'N/A'}</p></div>
          <div><p class="muted">Fecha</p><p>${sanction.date}</p></div>
          <div><p class="muted">Tipo</p><p>${sanction.type}</p></div>
          <div><p class="muted">Gravedad</p><p>${sanction.severity}</p></div>
        </div>
      </div>
      <div class="card">
        <p>${sanction.description || ''}</p>
        <p style="margin-top:12px;"><strong>Coordinador:</strong> ${sanction.coordinatorName || 'Pendiente validacion'}</p>
        <p><strong>Correo enviado:</strong> ${sanction.emailSentAt || 'Pendiente'}</p>
      </div>
    `
  )
}

function hydrateSanction(db, sanction) {
  const employee = getEmployee(db, sanction.employeeId)

  return {
    ...sanction,
    employee: sanction.employee || (employee ? { id: employee.id, name: employee.name, email: employee.email } : null),
    coordinatorName: sanction.coordinatorName || '',
    coordinatorApprovalAt: sanction.coordinatorApprovalAt || '',
    emailSentAt: sanction.emailSentAt || '',
    letterUrl: sanction.letterUrl || buildSanctionLetterUrl({
      ...sanction,
      employee: sanction.employee || (employee ? { id: employee.id, name: employee.name } : null),
    }),
  }
}

export const mockSanctions = {
  async list(params = {}) {
    await wait()

    const db = readDb()
    const list = db.sanctions
      .filter((sanction) => !params.status || sanction.status === params.status)
      .map((sanction) => hydrateSanction(db, sanction))
      .sort((left, right) => new Date(right.date) - new Date(left.date))

    return { data: clone(list) }
  },

  async stats() {
    await wait(60)

    const sanctions = readDb().sanctions
    return {
      total: sanctions.length,
      pending: sanctions.filter((item) => item.status === 'pending').length,
      confirmed: sanctions.filter((item) => item.status === 'confirmed').length,
      totalDeduction: sanctions.reduce((sum, item) => sum + (Number(item.deductionAmount) || 0), 0),
    }
  },

  async create(data) {
    await wait(140)

    let createdSanction = null

    updateDb((db) => {
      const employee = getEmployee(db, data.employeeId)
      const reporter = requireCurrentUser(db)
      if (!employee) throw mockError('Empleado no encontrado', 404)

      const hourlyRate = employee.hourlyRate || Math.round((employee.baseSalary || 0) / (employee.monthlyTarget || 176))

      createdSanction = {
        id: nextNumericId(db.sanctions),
        employeeId: employee.id,
        employee: { id: employee.id, name: employee.name },
        reporter: { name: reporter.name },
        type: data.type,
        severity: data.severity,
        status: 'pending',
        date: toIsoDate(data.date || getToday()),
        description: data.description,
        deductionHours: Number(data.deductionHours) || 0,
        deductionAmount: Math.round((Number(data.deductionHours) || 0) * hourlyRate),
        evidence: data.evidence || '',
        coordinatorName: '',
        coordinatorApprovalAt: '',
        emailSentAt: '',
      }

      db.sanctions.unshift(createdSanction)
      return db
    })

    return createdSanction
  },

  async confirm(id) {
    await wait(100)

    updateDb((db) => {
      const currentUser = requireCurrentUser(db)
      db.sanctions = db.sanctions.map((sanction) => (
        String(sanction.id) === String(id)
          ? {
            ...sanction,
            status: 'confirmed',
            coordinatorName: currentUser.name,
            coordinatorApprovalAt: `${getToday()}T14:10:00`,
            emailSentAt: `${getToday()}T14:12:00`,
          }
          : sanction
      ))
      const confirmed = db.sanctions.find((sanction) => String(sanction.id) === String(id))
      if (confirmed) {
        addNotification(db, {
          title: 'Sancion notificada',
          message: `${confirmed.employee?.name || 'Empleado'} recibio comunicacion automatica de la sancion.`,
          type: 'warning',
          audience: ['admin', 'coordinator'],
        })
      }
      return db
    })

    return { success: true }
  },

  async dismiss(id) {
    await wait(100)

    updateDb((db) => {
      db.sanctions = db.sanctions.map((sanction) => (
        String(sanction.id) === String(id)
          ? { ...sanction, status: 'dismissed' }
          : sanction
      ))
      return db
    })

    return { success: true }
  },
}

export function getMockSessionUser() {
  return getCurrentUser(readDb())
}
