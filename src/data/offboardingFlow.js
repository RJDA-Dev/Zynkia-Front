const baseSteps = [
  {
    id: 'notice',
    icon: 'campaign',
    title: { es: 'Preaviso y causal', en: 'Notice and reason' },
    description: { es: 'Se define el motivo, fecha efectiva y responsables del retiro.', en: 'Define the reason, effective date and owners for the exit.' },
  },
  {
    id: 'clearance',
    icon: 'fact_check',
    title: { es: 'Paz y salvo operativo', en: 'Operational clearance' },
    description: { es: 'Se cierran equipos, documentos, accesos y pendientes internos.', en: 'Close equipment, documents, access and internal pending items.' },
  },
  {
    id: 'settlement',
    icon: 'payments',
    title: { es: 'Liquidación y pago', en: 'Settlement and payment' },
    description: { es: 'Se calcula, aprueba y paga el cierre final del caso.', en: 'Calculate, approve and pay the final case close.' },
  },
  {
    id: 'knowledge',
    icon: 'swap_horiz',
    title: { es: 'Transferencia y feedback', en: 'Handoff and feedback' },
    description: { es: 'Se transfiere conocimiento y se agenda la salida formal.', en: 'Transfer knowledge and schedule the formal exit.' },
  },
  {
    id: 'closure',
    icon: 'verified',
    title: { es: 'Cierre final', en: 'Final closure' },
    description: { es: 'El caso se archiva cuando legal, TI, activos y nómina liberan el retiro.', en: 'The case is archived once legal, IT, assets and payroll clear the exit.' },
  },
]

const baseLanes = [
  { id: 'preaviso', stages: ['preaviso'], title: { es: 'Preaviso', en: 'Notice' } },
  { id: 'pazysalvo', stages: ['pazysalvo'], title: { es: 'Paz y salvo', en: 'Clearance' } },
  { id: 'liquidacion', stages: ['liquidacion'], title: { es: 'Liquidación', en: 'Settlement' } },
  { id: 'cierre', stages: ['cierre'], title: { es: 'Cierre', en: 'Closure' } },
]

const statusOptions = [
  { value: 'en_progreso', label: { es: 'En progreso', en: 'In progress' } },
  { value: 'bloqueado', label: { es: 'Bloqueado', en: 'Blocked' } },
  { value: 'cerrado', label: { es: 'Cerrado', en: 'Closed' } },
]

const reasonOptions = [
  { value: 'renuncia', label: { es: 'Renuncia', en: 'Resignation' } },
  { value: 'terminacion', label: { es: 'Terminación', en: 'Termination' } },
  { value: 'mutuo_acuerdo', label: { es: 'Mutuo acuerdo', en: 'Mutual agreement' } },
]

function cloneChecklist(sections) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }))
}

const workspaceByCompany = {
  'health-enterprise': {
    title: { es: 'Mesa de retiro regulado', en: 'Regulated offboarding desk' },
    subtitle: { es: 'Controla causal, paz y salvo, liquidación y cierre de activos clínicos por sede.', en: 'Controls reason, clearance, settlement and clinical asset closure by site.' },
    checklistTemplate: [
      {
        id: 'legal',
        label: { es: 'Legal y documental', en: 'Legal and documents' },
        items: [
          { id: 'letter', label: { es: 'Carta y soportes firmados', en: 'Letter and signed supports' }, done: false },
          { id: 'record', label: { es: 'Expediente listo para archivo', en: 'Employee record ready for archive' }, done: false },
        ],
      },
      {
        id: 'assets',
        label: { es: 'Activos y carnés', en: 'Assets and IDs' },
        items: [
          { id: 'uniform', label: { es: 'Dotación recuperada', en: 'Uniform recovered' }, done: false },
          { id: 'id-card', label: { es: 'Carné devuelto', en: 'ID returned' }, done: false },
        ],
      },
      {
        id: 'access',
        label: { es: 'Accesos y sistemas', en: 'Access and systems' },
        items: [
          { id: 'ehr', label: { es: 'Historia clínica revocada', en: 'Clinical record access revoked' }, done: false },
          { id: 'mail', label: { es: 'Correo y apps cerrados', en: 'Mail and apps disabled' }, done: false },
        ],
      },
    ],
    cases: [
      {
        id: 'off-health-1',
        employeeCode: 'EMP-CLH-1882',
        name: 'Sofia Pardo',
        role: 'Terapeuta respiratoria',
        site: 'Sede Norte',
        owner: 'Relaciones Laborales',
        stage: 'pazysalvo',
        status: 'en_progreso',
        reason: 'renuncia',
        effectiveDate: '2026-03-20',
        checklist: [
          {
            id: 'legal',
            label: { es: 'Legal y documental', en: 'Legal and documents' },
            items: [
              { id: 'letter', label: { es: 'Carta y soportes firmados', en: 'Letter and signed supports' }, done: true },
              { id: 'record', label: { es: 'Expediente listo para archivo', en: 'Employee record ready for archive' }, done: false },
            ],
          },
          {
            id: 'assets',
            label: { es: 'Activos y carnés', en: 'Assets and IDs' },
            items: [
              { id: 'uniform', label: { es: 'Dotación recuperada', en: 'Uniform recovered' }, done: true },
              { id: 'id-card', label: { es: 'Carné devuelto', en: 'ID returned' }, done: false },
            ],
          },
          {
            id: 'access',
            label: { es: 'Accesos y sistemas', en: 'Access and systems' },
            items: [
              { id: 'ehr', label: { es: 'Historia clínica revocada', en: 'Clinical record access revoked' }, done: true },
              { id: 'mail', label: { es: 'Correo y apps cerrados', en: 'Mail and apps disabled' }, done: false },
            ],
          },
        ],
        settlement: {
          amount: '$ 4.200.000',
          calculated: true,
          approved: false,
          paid: false,
        },
        exitInterview: {
          date: '2026-03-19',
          sent: true,
        },
        notes: 'Caso regulado. Falta cierre de carné y aprobación final de liquidación.',
        timeline: [
          { id: 'off-h-1', time: '12 Mar · 15:40', title: 'Renuncia recibida', detail: 'Se registró retiro voluntario con fecha efectiva del 20 de marzo.' },
          { id: 'off-h-2', time: '13 Mar · 08:20', title: 'Bloqueo clínico parcial', detail: 'Acceso a historia clínica ya fue revocado.' },
        ],
      },
    ],
  },
  'tech-scaleup': {
    title: { es: 'Offboarding digital y handoff', en: 'Digital offboarding and handoff' },
    subtitle: { es: 'Gestiona accesos, repos, equipo remoto y transferencia de conocimiento en un mismo caso.', en: 'Manage access, repos, remote equipment and knowledge transfer in one case.' },
    checklistTemplate: [
      {
        id: 'knowledge',
        label: { es: 'Handoff de conocimiento', en: 'Knowledge handoff' },
        items: [
          { id: 'docs', label: { es: 'Documentación entregada', en: 'Documentation handed over' }, done: false },
          { id: 'owner', label: { es: 'Nuevo owner asignado', en: 'New owner assigned' }, done: false },
        ],
      },
      {
        id: 'access',
        label: { es: 'Accesos y seguridad', en: 'Access and security' },
        items: [
          { id: 'suite', label: { es: 'Suite corporativa cerrada', en: 'Corporate suite disabled' }, done: false },
          { id: 'repos', label: { es: 'Repositorios revocados', en: 'Repository access revoked' }, done: false },
        ],
      },
      {
        id: 'equipment',
        label: { es: 'Equipo remoto', en: 'Remote equipment' },
        items: [
          { id: 'pickup', label: { es: 'Recolección agendada', en: 'Pickup scheduled' }, done: false },
          { id: 'warehouse', label: { es: 'Equipo recibido en bodega', en: 'Equipment received in warehouse' }, done: false },
        ],
      },
    ],
    cases: [
      {
        id: 'off-tech-1',
        employeeCode: 'EMP-FTL-088',
        name: 'Camilo Vega',
        role: 'Backend Engineer',
        site: 'Remote',
        owner: 'Paula Tellez',
        stage: 'preaviso',
        status: 'en_progreso',
        reason: 'renuncia',
        effectiveDate: '2026-03-28',
        checklist: [
          {
            id: 'knowledge',
            label: { es: 'Handoff de conocimiento', en: 'Knowledge handoff' },
            items: [
              { id: 'docs', label: { es: 'Documentación entregada', en: 'Documentation handed over' }, done: false },
              { id: 'owner', label: { es: 'Nuevo owner asignado', en: 'New owner assigned' }, done: false },
            ],
          },
          {
            id: 'access',
            label: { es: 'Accesos y seguridad', en: 'Access and security' },
            items: [
              { id: 'suite', label: { es: 'Suite corporativa cerrada', en: 'Corporate suite disabled' }, done: false },
              { id: 'repos', label: { es: 'Repositorios revocados', en: 'Repository access revoked' }, done: false },
            ],
          },
          {
            id: 'equipment',
            label: { es: 'Equipo remoto', en: 'Remote equipment' },
            items: [
              { id: 'pickup', label: { es: 'Recolección agendada', en: 'Pickup scheduled' }, done: true },
              { id: 'warehouse', label: { es: 'Equipo recibido en bodega', en: 'Equipment received in warehouse' }, done: false },
            ],
          },
        ],
        settlement: {
          amount: '$ 9.600.000',
          calculated: false,
          approved: false,
          paid: false,
        },
        exitInterview: {
          date: '2026-03-25',
          sent: true,
        },
        notes: 'Se abrió el caso y ya quedó la recolección del laptop programada.',
        timeline: [
          { id: 'off-t-1', time: '13 Mar · 10:15', title: 'Salida notificada', detail: 'El colaborador informó su renuncia y se activó el proceso de retiro.' },
        ],
      },
    ],
  },
}

function buildHealthCase(employee) {
  return {
    id: `off-${employee.id}`,
    employeeCode: employee.employeeCode,
    name: employee.name,
    role: employee.role,
    site: employee.site || 'Sede Norte',
    owner: employee.owner || 'Relaciones Laborales',
    stage: 'preaviso',
    status: 'en_progreso',
    reason: 'mutuo_acuerdo',
    effectiveDate: '',
    checklist: cloneChecklist(workspaceByCompany['health-enterprise'].checklistTemplate),
    settlement: {
      amount: '$ 0',
      calculated: false,
      approved: false,
      paid: false,
    },
    exitInterview: {
      date: '',
      sent: false,
    },
    notes: 'Caso creado automáticamente desde administración.',
    timeline: [
      { id: `off-${employee.id}-1`, time: '13 Mar · 14:10', title: 'Caso iniciado desde administración', detail: 'El colaborador quedó marcado para retiro y se abrió el checklist inter-áreas.' },
    ],
  }
}

function buildTechCase(employee) {
  return {
    id: `off-${employee.id}`,
    employeeCode: employee.employeeCode,
    name: employee.name,
    role: employee.role,
    site: employee.site || 'Remote',
    owner: employee.owner || 'Paula Tellez',
    stage: 'preaviso',
    status: 'en_progreso',
    reason: 'mutuo_acuerdo',
    effectiveDate: '',
    checklist: cloneChecklist(workspaceByCompany['tech-scaleup'].checklistTemplate),
    settlement: {
      amount: '$ 0',
      calculated: false,
      approved: false,
      paid: false,
    },
    exitInterview: {
      date: '',
      sent: false,
    },
    notes: 'Caso creado automáticamente desde administración.',
    timeline: [
      { id: `off-${employee.id}-1`, time: '13 Mar · 14:10', title: 'Caso iniciado desde administración', detail: 'Se abrió el retiro con controles de accesos y knowledge handoff.' },
    ],
  }
}

export function createOffboardingCase(companyId, employee) {
  if (companyId === 'tech-scaleup') return buildTechCase(employee)
  return buildTechCase(employee)
  return buildHealthCase(employee)
}

export function getOffboardingWorkspace(companyId) {
  return {
    steps: baseSteps,
    lanes: baseLanes,
    statusOptions,
    reasonOptions,
    ...(workspaceByCompany[companyId] || workspaceByCompany['health-enterprise']),
  }
}
