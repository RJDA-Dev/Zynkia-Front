import api from './client'

export const auth = {
  login: (email, password, tenantSlug) => api.post('/auth/login', { email, password, tenantSlug }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  register: (data) => api.post('/tenants/register', data),
}

export const employees = {
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

export const attendance = {
  byDate: (date) => api.get('/attendance', { params: { date } }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (id, time) => api.patch(`/attendance/${id}/check-out`, { time }),
}

export const payroll = {
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
}

export const requests = {
  list: (params) => api.get('/requests', { params }),
  byEmployee: (id) => api.get(`/requests/employee/${id}`),
  create: (data) => api.post('/requests', data),
  approve: (id) => api.patch(`/requests/${id}/approve`),
  reject: (id) => api.patch(`/requests/${id}/reject`),
}

export const schedule = {
  month: (year, month) => api.get('/schedule/month', { params: { year, month } }),
  day: (date) => api.get('/schedule/day', { params: { date } }),
  stats: (year) => api.get('/schedule/stats', { params: { year } }),
  createShifts: (data) => api.post('/schedule/shifts', data),
  updateShift: (id, data) => api.patch(`/schedule/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/schedule/shifts/${id}`),
  generateAI: (data) => api.post('/schedule/generate-ai', data),
}

export const reports = {
  dashboard: () => api.get('/reports/dashboard'),
  payroll: (period) => api.get('/reports/payroll', { params: { period } }),
  attendance: (period) => api.get('/reports/attendance', { params: { period } }),
  requests: () => api.get('/reports/requests'),
}

export const departments = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  remove: (id) => api.delete(`/departments/${id}`),
}

export const users = {
  list: (params) => api.get('/users', { params }),
  roles: () => api.get('/users/roles'),
  createRole: (data) => api.post('/users/roles', data),
  updateRole: (id, data) => api.put(`/users/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/users/roles/${id}`),
  create: (data) => api.post('/users', data),
  assignRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
}

export const onboarding = {
  list: (params) => api.get('/onboarding', { params }),
  get: (id) => api.get(`/onboarding/${id}`),
  start: (employeeId) => api.post(`/onboarding/${employeeId}`),
  advance: (id) => api.patch(`/onboarding/${id}/advance`),
}

export const settings = {
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data) => api.put('/settings/general', data),
  getLocalization: () => api.get('/settings/localization'),
  updateLocalization: (data) => api.put('/settings/localization', data),
  getSecurity: () => api.get('/settings/security'),
  updateSecurity: (data) => api.put('/settings/security', data),
}

export const portal = {
  home: () => api.get('/employee/home'),
  schedule: () => api.get('/employee/schedule'),
  vacationBalance: () => api.get('/employee/vacation-balance'),
  notifications: () => api.get('/employee/notifications'),
  coworkers: () => api.get('/employee/coworkers'),
  swaps: () => api.get('/employee/swaps'),
  createSwap: (data) => api.post('/employee/swaps', data),
  respondSwap: (id, accept) => api.patch(`/employee/swaps/${id}/respond`, { accept }),
}

export const notifications = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  registerToken: (token) => api.post('/notifications/register-token', { token }),
}
