import api from './client'
import { unwrapResponse } from './response'
import {
  isMockApiEnabled,
  mockAuth,
  mockEmployees,
  mockInventory,
  mockAttendance,
  mockPayroll,
  mockRequests,
  mockSchedule,
  mockReports,
  mockDepartments,
  mockUsers,
  mockOnboarding,
  mockRecruitment,
  mockPeopleOps,
  mockContracts,
  mockSettings,
  mockPortal,
  mockNotifications,
  mockSanctions,
} from '../services/mockApi'

const realAuth = {
  login: (email, password, tenantSlug) => api.post('/auth/login', { email, password, tenantSlug }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  register: (data) => api.post('/tenants/register', data),
}

const realEmployees = {
  list: (params) => api.get('/employees', { params }),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id) => api.delete(`/employees/${id}`),
  payslips: (id) => api.get(`/employees/${id}/payslips`),
  documents: (id) => api.get(`/employees/${id}/documents`),
  history: (id) => api.get(`/employees/${id}/history`),
  byDepartment: (deptId) => api.get('/employees', { params: { departmentId: deptId } }),
  deptCounts: () => api.get('/employees/departments/count'),
}

const realAttendance = {
  byDate: (date) => api.get('/attendance', { params: { date } }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (id, time) => api.patch(`/attendance/${id}/check-out`, { time }),
}

const realInventory = {
  list: (params) => api.get('/inventory', { params }),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  assign: (id, employeeId) => api.patch(`/inventory/${id}/assign`, { employeeId }),
}

const realPayroll = {
  rules: () => api.get('/payroll/overtime/rules'),
  createRule: (data) => api.post('/payroll/overtime/rules', data),
  toggleRule: (id) => api.patch(`/payroll/overtime/rules/${id}/toggle`),
  byUser: () => api.get('/payroll/overtime/by-user'),
  byDept: () => api.get('/payroll/overtime/by-department'),
  liquidation: (type) => api.get('/payroll/liquidation', { params: { type: type || 'payroll' } }),
  history: (type) => api.get('/payroll/history', { params: { type: type || 'payroll' } }),
  run: (period) => api.post('/payroll/run', { period }),
  runOvertime: (period) => api.post('/payroll/run-overtime', { period }),
  overtimeForLiquidation: (period, week) => api.get('/payroll/overtime/for-liquidation', { params: { period, ...(week && { week }) } }),
  approveBalance: (id) => api.patch(`/payroll/overtime/balances/${id}/approve`),
  rejectBalance: (id) => api.patch(`/payroll/overtime/balances/${id}/reject`),
  overtimeReportView: (period) => api.get('/payroll/overtime/report/view', { params: { period } }),
  overtimeReportDownload: (period) => api.get('/payroll/overtime/report/download', { params: { period } }),
  generateOvertimeReport: (period) => api.post('/payroll/overtime/report/generate', { period }),
  generatePayslip: (id) => api.post(`/payroll/payslip/${id}/generate`),
  viewPayslip: (id) => api.get(`/payroll/payslip/${id}/view`),
  downloadPayslip: (id) => api.get(`/payroll/payslip/${id}/download`),
  generateAllPayslips: (period) => api.post('/payroll/payslips/generate-all', { period }),
  overtimeBalances: () => api.get('/payroll/overtime/balances'),
  addOvertimeBalance: (data) => api.post('/payroll/overtime/balances', data),
  updateBalanceStatus: (id, status) => api.patch(`/payroll/overtime/balances/${id}/status`, { status }),
  calculateOvertime: (data) => api.post('/payroll/overtime/calculate', data),
}

const realRequests = {
  list: (params) => api.get('/requests', { params }),
  byEmployee: (id) => api.get(`/requests/employee/${id}`),
  create: (data) => api.post('/requests', data),
  approve: (id) => api.patch(`/requests/${id}/approve`),
  reject: (id) => api.patch(`/requests/${id}/reject`),
  uploadAttachment: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/requests/${id}/attachment`, formData)
  },
  getAttachment: (id) => api.get(`/requests/${id}/attachment`),
}

const realSchedule = {
  month: (year, month) => api.get('/schedule/month', { params: { year, month } }),
  day: (date) => api.get('/schedule/day', { params: { date } }),
  stats: (year) => api.get('/schedule/stats', { params: { year } }),
  createShifts: (data) => api.post('/schedule/shifts', data),
  updateShift: (id, data) => api.patch(`/schedule/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/schedule/shifts/${id}`),
  generateAI: (data) => api.post('/schedule/generate-ai', data),
}

const realReports = {
  dashboard: () => api.get('/reports/dashboard'),
  payroll: (period) => api.get('/reports/payroll', { params: { period } }),
  attendance: (period) => api.get('/reports/attendance', { params: { period } }),
  requests: () => api.get('/reports/requests'),
}

const realDepartments = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  remove: (id) => api.delete(`/departments/${id}`),
}

const realUsers = {
  list: (params) => api.get('/users', { params }),
  roles: () => api.get('/users/roles'),
  createRole: (data) => api.post('/users/roles', data),
  updateRole: (id, data) => api.put(`/users/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/users/roles/${id}`),
  create: (data) => api.post('/users', data),
  assignRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
}

const realOnboarding = {
  list: (params) => api.get('/onboarding', { params }),
  get: (id) => api.get(`/onboarding/${id}`),
  start: (employeeId) => api.post(`/onboarding/${employeeId}`),
  advance: (id) => api.patch(`/onboarding/${id}/advance`),
}

const realRecruitment = {
  list: (params) => api.get('/recruitment/vacancies', { params }),
  create: (data) => api.post('/recruitment/vacancies', data),
  getPublicVacancy: (uid) => api.get(`/recruitment/public/${uid}`),
  submitApplicationByUid: (uid, data) => api.post(`/recruitment/public/${uid}/apply`, data),
  updateApplicantStatus: (vacancyId, applicantId, status, patch) => api.patch(`/recruitment/vacancies/${vacancyId}/applicants/${applicantId}`, { status, ...(patch || {}) }),
}

const realContracts = {
  list: () => api.get('/contracts'),
  get: (id) => api.get(`/contracts/${id}`),
  createFromApplicant: (vacancyId, applicantId) => api.post(`/contracts/from-applicant`, { vacancyId, applicantId }),
  createFromCandidate: (data) => api.post('/contracts/from-candidate', data),
  send: (id) => api.post(`/contracts/${id}/send`),
  sign: (id, signature) => api.post(`/contracts/${id}/sign`, { signature }),
  export: (id) => api.get(`/contracts/${id}/export`),
}

const realPeopleOps = {
  module: (moduleKey) => api.get(`/people-ops/${moduleKey}`),
  setItemStatus: (moduleKey, sectionKey, itemId, status) => api.patch(`/people-ops/${moduleKey}/${sectionKey}/${itemId}`, { status }),
  toggleAutomation: (moduleKey, automationId) => api.patch(`/people-ops/${moduleKey}/automations/${automationId}/toggle`),
}

const realSettings = {
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data) => api.put('/settings/general', data),
  getLocalization: () => api.get('/settings/localization'),
  updateLocalization: (data) => api.put('/settings/localization', data),
  getSecurity: () => api.get('/settings/security'),
  updateSecurity: (data) => api.put('/settings/security', data),
}

const realPortal = {
  home: () => api.get('/employee/home'),
  schedule: () => api.get('/employee/schedule'),
  teamSchedule: () => api.get('/employee/team-schedule'),
  vacationBalance: () => api.get('/employee/vacation-balance'),
  inventory: () => api.get('/employee/inventory'),
  notifications: () => api.get('/employee/notifications'),
  coworkers: () => api.get('/employee/coworkers'),
  swaps: () => api.get('/employee/swaps'),
  createSwap: (data) => api.post('/employee/swaps', data),
  respondSwap: (id, accept) => api.patch(`/employee/swaps/${id}/respond`, { accept }),
  cancelSwap: (id) => api.patch(`/employee/swaps/${id}/cancel`),
  payHistory: () => api.get('/employee/pay-history'),
}

const realNotifications = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  registerToken: (token) => api.post('/notifications/register-token', { token }),
}

const realSanctions = {
  list: (params) => api.get('/sanctions', { params }),
  stats: () => api.get('/sanctions/stats'),
  create: (data) => api.post('/sanctions', data),
  confirm: (id) => api.patch(`/sanctions/${id}/confirm`),
  dismiss: (id) => api.patch(`/sanctions/${id}/dismiss`),
}

function normalizeServiceGroup(serviceGroup) {
  return Object.fromEntries(
    Object.entries(serviceGroup).map(([name, method]) => [
      name,
      async (...args) => unwrapResponse(await method(...args)),
    ])
  )
}

export const auth = normalizeServiceGroup(isMockApiEnabled ? mockAuth : realAuth)
export const employees = normalizeServiceGroup(isMockApiEnabled ? mockEmployees : realEmployees)
export const inventory = normalizeServiceGroup(isMockApiEnabled ? mockInventory : realInventory)
export const attendance = normalizeServiceGroup(isMockApiEnabled ? mockAttendance : realAttendance)
export const payroll = normalizeServiceGroup(isMockApiEnabled ? mockPayroll : realPayroll)
export const requests = normalizeServiceGroup(isMockApiEnabled ? mockRequests : realRequests)
export const schedule = normalizeServiceGroup(isMockApiEnabled ? mockSchedule : realSchedule)
export const reports = normalizeServiceGroup(isMockApiEnabled ? mockReports : realReports)
export const departments = normalizeServiceGroup(isMockApiEnabled ? mockDepartments : realDepartments)
export const users = normalizeServiceGroup(isMockApiEnabled ? mockUsers : realUsers)
export const onboarding = normalizeServiceGroup(isMockApiEnabled ? mockOnboarding : realOnboarding)
export const recruitment = normalizeServiceGroup(isMockApiEnabled ? mockRecruitment : realRecruitment)
export const peopleOps = normalizeServiceGroup(isMockApiEnabled ? mockPeopleOps : realPeopleOps)
export const contracts = normalizeServiceGroup(isMockApiEnabled ? mockContracts : realContracts)
export const settings = normalizeServiceGroup(isMockApiEnabled ? mockSettings : realSettings)
export const portal = normalizeServiceGroup(isMockApiEnabled ? mockPortal : realPortal)
export const notifications = normalizeServiceGroup(isMockApiEnabled ? mockNotifications : realNotifications)
export const sanctions = normalizeServiceGroup(isMockApiEnabled ? mockSanctions : realSanctions)
