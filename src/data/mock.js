export const users = [
  { id: 1, name: 'Sofia Martinez', email: 'sofia.martinez@company.com', role: 'Admin', area: 'Management', status: 'Active' },
  { id: 2, name: 'Liam Thompson', email: 'liam.t@company.com', role: 'Coordinator', area: 'Operations', status: 'Active' },
  { id: 3, name: 'Olivia Chen', email: 'olivia.c@company.com', role: 'Employee', area: 'Engineering', status: 'Active' },
  { id: 4, name: 'James Doe', email: 'james.doe@company.com', role: 'Employee', area: 'Sales', status: 'Inactive' },
  { id: 5, name: 'Ava Wilson', email: 'ava.w@company.com', role: 'Coordinator', area: 'Human Resources', status: 'Active' },
]

export const overtimeRules = [
  { id: 1, name: 'Hora Extra Diurna', code: 'HED-001', multiplier: '1.25x', shiftType: 'Daytime (6AM - 9PM)', status: 'Active' },
  { id: 2, name: 'Hora Extra Nocturna', code: 'HEN-002', multiplier: '1.75x', shiftType: 'Night (9PM - 6AM)', status: 'Active' },
  { id: 3, name: 'Dominical / Festivo', code: 'DOM-101', multiplier: '2.00x', shiftType: 'Sundays & Holidays', status: 'Inactive' },
  { id: 4, name: 'Recargo Nocturno', code: 'REN-003', multiplier: '0.35x', shiftType: 'Night Shift Surcharge', status: 'Active' },
]

export const requests = [
  { id: 1, name: 'Laura Torres', role: 'UX Designer', type: 'Médica', typeColor: 'info', dates: '12 Nov - 15 Nov (3 días)', description: 'Incapacidad por cirugía menor ambulatoria. Requiero reposo post-operatorio.', attachment: 'Certificado_Medico.pdf' },
  { id: 2, name: 'Carlos Pérez', role: 'Desarrollador Backend', type: 'Vacaciones', typeColor: 'purple', dates: '20 Dic - 05 Ene (15 días)', description: 'Solicitud de vacaciones anuales para pasar las fiestas con la familia.', attachment: null },
  { id: 3, name: 'Ana García', role: 'Product Manager', type: 'Personal', typeColor: 'warning', dates: '18 Nov (1 día)', description: 'Trámites bancarios y notariales urgentes que requieren presencia personal.', attachment: null },
  { id: 4, name: 'Miguel Rodríguez', role: 'Data Analyst', type: 'Remoto', typeColor: 'primary', dates: '19 Nov - 20 Nov (2 días)', description: 'Solicitud para trabajar desde casa debido a reparaciones en el hogar.', attachment: null },
  { id: 5, name: 'Sofía Martínez', role: 'HR Specialist', type: 'Médica', typeColor: 'info', dates: '10 Nov - 11 Nov (2 días)', description: 'Gripe estacional severa. Adjunto constancia médica.', attachment: 'Constancia_SM.pdf' },
  { id: 6, name: 'Julián Ruiz', role: 'DevOps Engineer', type: 'Capacitación', typeColor: 'teal', dates: '25 Nov (1 día)', description: 'Asistencia a conferencia AWS Summit.', attachment: 'Ticket_Conferencia.pdf' },
]

export const employees = [
  { id: 1, name: 'Sarah Miller', role: 'Enfermera Jefa', area: 'Salud', status: 'Active' },
  { id: 2, name: 'David Chen', role: 'Residente', area: 'Salud', status: 'Active' },
  { id: 3, name: 'Maria Garcia', role: 'Auxiliar', area: 'Salud', status: 'Active' },
  { id: 4, name: 'Laura Torres', role: 'UX Designer', area: 'Diseño', status: 'Active' },
  { id: 5, name: 'Carlos Pérez', role: 'Desarrollador Backend', area: 'Engineering', status: 'Active' },
]

export const scheduleData = [
  { employee: 'Sarah Miller', role: 'Enfermera Jefa', shifts: [
    { time: '08:00 - 16:00', type: 'Mañana', color: 'blue' },
    { time: '08:00 - 16:00', type: 'Mañana', color: 'blue' },
    null,
    { time: '08:00 - 16:00', type: 'Mañana', color: 'blue' },
    { time: '08:00 - 16:00', type: 'Mañana', color: 'blue' },
  ]},
  { employee: 'David Chen', role: 'Residente', shifts: [
    { time: '14:00 - 22:00', type: 'Tarde', color: 'purple' },
    { time: '14:00 - 22:00', type: 'Tarde', color: 'purple' },
    { time: '14:00 - 22:00', type: 'Tarde', color: 'purple' },
    null,
    { time: '14:00 - 22:00', type: 'Tarde', color: 'purple' },
  ]},
  { employee: 'Maria Garcia', role: 'Auxiliar', shifts: [
    { time: '22:00 - 06:00', type: 'Noche', color: 'amber' },
    null,
    null,
    { time: '22:00 - 06:00', type: 'Noche', color: 'amber' },
    { time: '22:00 - 06:00', type: 'Noche', color: 'amber' },
  ]},
]

const shiftTypes = [
  { type: 'Mañana', time: '06:00 - 14:00', color: 'blue' },
  { type: 'Tarde', time: '14:00 - 22:00', color: 'purple' },
  { type: 'Noche', time: '22:00 - 06:00', color: 'amber' },
]

const empNames = [
  { name: 'Sarah Miller', role: 'Enfermera Jefa' },
  { name: 'David Chen', role: 'Residente' },
  { name: 'Maria Garcia', role: 'Auxiliar' },
  { name: 'Laura Torres', role: 'UX Designer' },
  { name: 'Carlos Pérez', role: 'Backend Dev' },
]

function generateYearShifts(year) {
  const map = {}
  empNames.forEach((emp, ei) => {
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, m, d).getDay()
        if (dow === 0) continue
        if ((d + ei) % 3 === 0) continue
        const s = shiftTypes[ei % shiftTypes.length]
        const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        if (!map[key]) map[key] = []
        map[key].push({ employee: emp.name, role: emp.role, ...s })
      }
    }
  })
  return map
}

export const yearShifts = generateYearShifts(2026)
