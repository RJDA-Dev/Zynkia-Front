const baseSteps = [
  {
    id: 'receipt',
    icon: 'move_to_inbox',
    title: { es: 'Recepción desde contratación', en: 'Receipt from hiring' },
    description: { es: 'El caso llega desde vinculación con folder, código y checklist previo.', en: 'The case arrives from onboarding with folder, employee code and prior checklist.' },
  },
  {
    id: 'activation',
    icon: 'badge',
    title: { es: 'Activación administrativa', en: 'Administrative activation' },
    description: { es: 'Se habilita ficha, nómina, afiliaciones y arranque operativo.', en: 'Enable record, payroll, affiliations and operational start.' },
  },
  {
    id: 'operations',
    icon: 'inventory_2',
    title: { es: 'Dotación, viáticos y equipos', en: 'Equipment, travel and assets' },
    description: { es: 'Se controla entrega física, soportes y necesidades del cargo.', en: 'Track physical handoff, support docs and role needs.' },
  },
  {
    id: 'payroll',
    icon: 'payments',
    title: { es: 'Nómina y novedades', en: 'Payroll and incidents' },
    description: { es: 'Se registran novedades, preliquidación, DIAN y pago.', en: 'Register incidents, pre-payroll, DIAN submission and payment.' },
  },
  {
    id: 'stability',
    icon: 'workspace_premium',
    title: { es: 'Operación estable', en: 'Steady-state operation' },
    description: { es: 'El colaborador queda activo y listo para seguimiento continuo.', en: 'The employee is active and ready for ongoing follow-up.' },
  },
]

const baseLanes = [
  { id: 'activacion', stages: ['activacion'], title: { es: 'Activación', en: 'Activation' } },
  { id: 'operacion', stages: ['operacion'], title: { es: 'Operación', en: 'Operations' } },
  { id: 'nomina', stages: ['nomina'], title: { es: 'Nómina', en: 'Payroll' } },
  { id: 'estable', stages: ['estable'], title: { es: 'Estable', en: 'Stable' } },
  { id: 'retiro', stages: ['retiro'], title: { es: 'Listos para retiro', en: 'Ready for offboarding' } },
]

const statusOptions = [
  { value: 'pendiente', label: { es: 'Pendiente', en: 'Pending' } },
  { value: 'en_progreso', label: { es: 'En progreso', en: 'In progress' } },
  { value: 'bloqueado', label: { es: 'Bloqueado', en: 'Blocked' } },
  { value: 'cerrado', label: { es: 'Cerrado', en: 'Closed' } },
]

const noveltyTypeOptions = [
  { value: 'horas_extra', label: { es: 'Horas extra', en: 'Overtime' } },
  { value: 'permiso', label: { es: 'Permiso', en: 'Permit' } },
  { value: 'vacaciones', label: { es: 'Vacaciones', en: 'Vacation' } },
  { value: 'licencia', label: { es: 'Licencia', en: 'Leave' } },
  { value: 'beneficio', label: { es: 'Beneficio', en: 'Benefit' } },
]

const travelStatusOptions = [
  { value: 'no_aplica', label: { es: 'No aplica', en: 'Not applicable' } },
  { value: 'pendiente', label: { es: 'Pendiente', en: 'Pending' } },
  { value: 'legalizado', label: { es: 'Legalizado', en: 'Settled' } },
]

function cloneList(items, transform = (item) => item) {
  return items.map((item) => transform(item))
}

function buildChecklist(template, completed = {}) {
  return template.map((item) => ({
    ...item,
    done: Boolean(completed[item.id]),
  }))
}

function buildAssets(template) {
  return template.map((item) => ({
    ...item,
    delivered: false,
    serial: '',
  }))
}

const workspaceByCompany = {
  'health-enterprise': {
    title: { es: 'Mesa administrativa del colaborador', en: 'Employee administration desk' },
    subtitle: { es: 'Continúa el caso desde vinculación hacia dotación, novedades, nómina y estabilidad operativa clínica.', en: 'Continue the case from onboarding into equipment, incidents, payroll and clinical steady-state operations.' },
    intakeTemplate: [
      { id: 'employee-record', icon: 'badge', label: { es: 'Ficha del empleado recibida', en: 'Employee record received' }, hint: { es: 'Código y expediente base creados en contratación.', en: 'Code and base record created in hiring.' } },
      { id: 'payroll-profile', icon: 'payments', label: { es: 'Perfil de nómina preconfigurado', en: 'Payroll profile preconfigured' }, hint: { es: 'Datos bancarios y centro de costo cargados.', en: 'Banking data and cost center loaded.' } },
      { id: 'social-security', icon: 'health_and_safety', label: { es: 'Afiliaciones previas confirmadas', en: 'Initial affiliations confirmed' }, hint: { es: 'EPS, pensión y ARL revisadas.', en: 'Health, pension and risk entities reviewed.' } },
      { id: 'equipment-request', icon: 'inventory_2', label: { es: 'Solicitud de dotación abierta', en: 'Equipment request opened' }, hint: { es: 'El kit inicial ya quedó solicitado.', en: 'Initial kit request is already open.' } },
      { id: 'induction-plan', icon: 'event_upcoming', label: { es: 'Inducción programada', en: 'Induction scheduled' }, hint: { es: 'Se agendó inducción con jefe y SST.', en: 'Induction with manager and HSE has been scheduled.' } },
    ],
    activationTemplate: [
      { id: 'confirm-start-date', icon: 'today', label: { es: 'Confirmar fecha y turno de ingreso', en: 'Confirm start date and shift' }, hint: { es: 'Validar sede, jefe directo y horario.', en: 'Validate site, manager and schedule.' } },
      { id: 'activate-social-security', icon: 'verified_user', label: { es: 'Activar afiliaciones', en: 'Activate affiliations' }, hint: { es: 'Confirmar novedad de ingreso en seguridad social.', en: 'Confirm joiner movement in social security.' } },
      { id: 'deliver-kit', icon: 'checkroom', label: { es: 'Entregar dotación clínica', en: 'Deliver clinical kit' }, hint: { es: 'Uniforme, carné y elementos del rol.', en: 'Uniform, ID and role-specific items.' } },
      { id: 'enable-equipment', icon: 'devices', label: { es: 'Habilitar equipos y accesos locales', en: 'Enable equipment and local access' }, hint: { es: 'Terminal, correo y permisos básicos.', en: 'Terminal, email and baseline permissions.' } },
      { id: 'close-activation', icon: 'task_alt', label: { es: 'Cerrar activación', en: 'Close activation' }, hint: { es: 'El colaborador queda listo para operación y nómina.', en: 'The employee is ready for operations and payroll.' } },
    ],
    assetTemplate: [
      { id: 'kit', label: { es: 'Kit de uniforme clínico', en: 'Clinical uniform kit' } },
      { id: 'id-card', label: { es: 'Carné institucional', en: 'Institutional ID card' } },
      { id: 'terminal', label: { es: 'Terminal de admisiones / estación', en: 'Admissions terminal / station' } },
    ],
    benefitTemplate: [
      { id: 'eps', label: { es: 'EPS Sura', en: 'EPS Sura' }, active: true },
      { id: 'pension', label: { es: 'Protección', en: 'Proteccion' }, active: true },
      { id: 'arl', label: { es: 'ARL Sura', en: 'ARL Sura' }, active: true },
      { id: 'wellbeing', label: { es: 'Programa de bienestar clínico', en: 'Clinical wellbeing program' }, active: false },
    ],
    defaults: {
      site: 'Sede Norte',
      owner: 'Daniela Muñoz',
      contractType: 'Indefinido',
      payrollCycle: 'Quincenal clínica',
      baseSalary: '$ 2.800.000',
      travelStatus: 'no_aplica',
    },
    employees: [
      {
        id: 'adm-health-1',
        name: 'Mauricio León',
        role: 'Auxiliar admisiones',
        employeeCode: 'EMP-CLH-2031',
        email: 'mauricio.leon@empleo.co',
        phone: '+57 316 884 2200',
        stage: 'activacion',
        adminStatus: 'en_progreso',
        site: 'Sede Norte',
        owner: 'Daniela Muñoz',
        startDate: '2026-03-17',
        contractType: 'Indefinido',
        payrollCycle: 'Quincenal clínica',
        folderCode: 'VINC-CLH-032',
        handoffChecklist: [
          { id: 'employee-record', icon: 'badge', label: { es: 'Ficha del empleado recibida', en: 'Employee record received' }, hint: { es: 'Código creado desde contratación.', en: 'Code created in hiring.' }, done: true },
          { id: 'payroll-profile', icon: 'payments', label: { es: 'Perfil de nómina preconfigurado', en: 'Payroll profile preconfigured' }, hint: { es: 'Configuración base lista.', en: 'Base configuration ready.' }, done: false },
          { id: 'social-security', icon: 'health_and_safety', label: { es: 'Afiliaciones previas confirmadas', en: 'Initial affiliations confirmed' }, hint: { es: 'Pendiente novedad final de ingreso.', en: 'Final joiner movement still pending.' }, done: false },
          { id: 'equipment-request', icon: 'inventory_2', label: { es: 'Solicitud de dotación abierta', en: 'Equipment request opened' }, hint: { es: 'Kit solicitado para la sede.', en: 'Kit requested for the site.' }, done: true },
          { id: 'induction-plan', icon: 'event_upcoming', label: { es: 'Inducción programada', en: 'Induction scheduled' }, hint: { es: 'Bloque inicial reservado.', en: 'Initial slot reserved.' }, done: false },
        ],
        activationChecklist: [
          { id: 'confirm-start-date', icon: 'today', label: { es: 'Confirmar fecha y turno de ingreso', en: 'Confirm start date and shift' }, hint: { es: 'Turno tarde confirmado con admisiones.', en: 'Afternoon shift confirmed with admissions.' }, done: true },
          { id: 'activate-social-security', icon: 'verified_user', label: { es: 'Activar afiliaciones', en: 'Activate affiliations' }, hint: { es: 'EPS y ARL listas para ingreso.', en: 'Health and risk entities ready for entry.' }, done: false },
          { id: 'deliver-kit', icon: 'checkroom', label: { es: 'Entregar dotación clínica', en: 'Deliver clinical kit' }, hint: { es: 'Pendiente uniforme y carné.', en: 'Uniform and ID are still pending.' }, done: false },
          { id: 'enable-equipment', icon: 'devices', label: { es: 'Habilitar equipos y accesos locales', en: 'Enable equipment and local access' }, hint: { es: 'Se debe activar estación de admisiones.', en: 'Admissions workstation still needs activation.' }, done: false },
          { id: 'close-activation', icon: 'task_alt', label: { es: 'Cerrar activación', en: 'Close activation' }, hint: { es: 'Solo cuando estén listas afiliaciones y dotación.', en: 'Only after affiliations and kit are ready.' }, done: false },
        ],
        equipment: {
          actaSigned: false,
          assets: [
            { id: 'kit', label: { es: 'Kit de uniforme clínico', en: 'Clinical uniform kit' }, delivered: false, serial: '' },
            { id: 'id-card', label: { es: 'Carné institucional', en: 'Institutional ID card' }, delivered: false, serial: '' },
            { id: 'terminal', label: { es: 'Terminal de admisiones / estación', en: 'Admissions terminal / station' }, delivered: false, serial: '' },
          ],
        },
        travel: {
          status: 'no_aplica',
          amount: '$ 0',
          supports: [],
        },
        novelties: [
          { id: 'nov-health-1', type: 'permiso', label: { es: 'Inducción SST', en: 'HSE induction' }, value: '4 h', status: 'pendiente', note: { es: 'Se paga como tiempo de entrenamiento.', en: 'Paid as training time.' } },
        ],
        payroll: {
          cutOff: '2026-03-28',
          prePayrollValidated: false,
          dianSubmitted: false,
          paid: false,
          earnings: [
            { label: { es: 'Salario base', en: 'Base salary' }, value: '$ 2.800.000' },
            { label: { es: 'Auxilio de transporte', en: 'Transport allowance' }, value: '$ 162.000' },
          ],
          deductions: [
            { label: { es: 'Salud', en: 'Health' }, value: '$ 112.000' },
            { label: { es: 'Pensión', en: 'Pension' }, value: '$ 112.000' },
          ],
        },
        benefits: [
          { id: 'eps', label: { es: 'EPS Sura', en: 'EPS Sura' }, active: true },
          { id: 'pension', label: { es: 'Protección', en: 'Proteccion' }, active: true },
          { id: 'arl', label: { es: 'ARL Sura', en: 'ARL Sura' }, active: true },
          { id: 'wellbeing', label: { es: 'Programa de bienestar clínico', en: 'Clinical wellbeing program' }, active: false },
        ],
        notes: 'Caso recibido desde contratación. Falta cerrar activación antes del primer corte.',
        timeline: [
          { id: 'adm-t1', time: '13 Mar · 10:20', title: 'Caso recibido', detail: 'Contratación entregó folder y código del colaborador.' },
          { id: 'adm-t2', time: '13 Mar · 11:05', title: 'Turno definido', detail: 'Ingreso programado para turno tarde en sede norte.' },
        ],
      },
      {
        id: 'adm-health-2',
        name: 'Paula Rivas',
        role: 'Bacterióloga clínica',
        employeeCode: 'EMP-CLH-2041',
        email: 'paula.rivas@empresa.co',
        phone: '+57 321 118 7730',
        stage: 'nomina',
        adminStatus: 'en_progreso',
        site: 'Sede Sur',
        owner: 'Daniela Muñoz',
        startDate: '2026-03-01',
        contractType: 'Indefinido',
        payrollCycle: 'Quincenal clínica',
        folderCode: 'VINC-CLH-041',
        handoffChecklist: [
          { id: 'employee-record', icon: 'badge', label: { es: 'Ficha del empleado recibida', en: 'Employee record received' }, hint: { es: 'Expediente correcto.', en: 'Record is complete.' }, done: true },
          { id: 'payroll-profile', icon: 'payments', label: { es: 'Perfil de nómina preconfigurado', en: 'Payroll profile preconfigured' }, hint: { es: 'Banco y centro de costo cargados.', en: 'Banking and cost center loaded.' }, done: true },
          { id: 'social-security', icon: 'health_and_safety', label: { es: 'Afiliaciones previas confirmadas', en: 'Initial affiliations confirmed' }, hint: { es: 'Afiliaciones activas.', en: 'Affiliations active.' }, done: true },
          { id: 'equipment-request', icon: 'inventory_2', label: { es: 'Solicitud de dotación abierta', en: 'Equipment request opened' }, hint: { es: 'Todo entregado.', en: 'Everything delivered.' }, done: true },
          { id: 'induction-plan', icon: 'event_upcoming', label: { es: 'Inducción programada', en: 'Induction scheduled' }, hint: { es: 'Completada la semana pasada.', en: 'Completed last week.' }, done: true },
        ],
        activationChecklist: [
          { id: 'confirm-start-date', icon: 'today', label: { es: 'Confirmar fecha y turno de ingreso', en: 'Confirm start date and shift' }, hint: { es: 'Ingreso confirmado.', en: 'Start date confirmed.' }, done: true },
          { id: 'activate-social-security', icon: 'verified_user', label: { es: 'Activar afiliaciones', en: 'Activate affiliations' }, hint: { es: 'Afiliaciones al día.', en: 'Affiliations up to date.' }, done: true },
          { id: 'deliver-kit', icon: 'checkroom', label: { es: 'Entregar dotación clínica', en: 'Deliver clinical kit' }, hint: { es: 'Dotación entregada.', en: 'Kit delivered.' }, done: true },
          { id: 'enable-equipment', icon: 'devices', label: { es: 'Habilitar equipos y accesos locales', en: 'Enable equipment and local access' }, hint: { es: 'Accesos listos.', en: 'Access ready.' }, done: true },
          { id: 'close-activation', icon: 'task_alt', label: { es: 'Cerrar activación', en: 'Close activation' }, hint: { es: 'Activación cerrada.', en: 'Activation closed.' }, done: true },
        ],
        equipment: {
          actaSigned: true,
          assets: [
            { id: 'kit', label: { es: 'Kit de uniforme clínico', en: 'Clinical uniform kit' }, delivered: true, serial: 'KIT-SUR-018' },
            { id: 'id-card', label: { es: 'Carné institucional', en: 'Institutional ID card' }, delivered: true, serial: 'ID-2041' },
            { id: 'terminal', label: { es: 'Terminal de admisiones / estación', en: 'Admissions terminal / station' }, delivered: true, serial: 'LAB-SUR-22' },
          ],
        },
        travel: {
          status: 'pendiente',
          amount: '$ 240.000',
          supports: ['Soporte_viatico_paula.pdf'],
        },
        novelties: [
          { id: 'nov-health-2', type: 'horas_extra', label: { es: 'Horas extra nocturnas', en: 'Night overtime' }, value: '12 h', status: 'pendiente', note: { es: 'Validar con jefe de laboratorio.', en: 'Validate with lab manager.' } },
        ],
        payroll: {
          cutOff: '2026-03-28',
          prePayrollValidated: true,
          dianSubmitted: false,
          paid: false,
          earnings: [
            { label: { es: 'Salario base', en: 'Base salary' }, value: '$ 3.900.000' },
            { label: { es: 'Horas extra', en: 'Overtime' }, value: '$ 210.000' },
          ],
          deductions: [
            { label: { es: 'Salud', en: 'Health' }, value: '$ 156.000' },
            { label: { es: 'Pensión', en: 'Pension' }, value: '$ 156.000' },
          ],
        },
        benefits: [
          { id: 'eps', label: { es: 'EPS Sura', en: 'EPS Sura' }, active: true },
          { id: 'pension', label: { es: 'Protección', en: 'Proteccion' }, active: true },
          { id: 'arl', label: { es: 'ARL Sura', en: 'ARL Sura' }, active: true },
          { id: 'wellbeing', label: { es: 'Programa de bienestar clínico', en: 'Clinical wellbeing program' }, active: true },
        ],
        notes: 'La colaboradora ya opera. Solo queda legalizar viático y enviar nómina electrónica.',
        timeline: [
          { id: 'adm-t3', time: '10 Mar · 08:00', title: 'Ingreso confirmado', detail: 'La colaboradora inició en sede sur.' },
          { id: 'adm-t4', time: '12 Mar · 16:30', title: 'Preliquidación lista', detail: 'Caso subió a mesa de nómina para el corte quincenal.' },
        ],
      },
    ],
  },
  'tech-scaleup': {
    title: { es: 'People Ops workspace', en: 'People Ops workspace' },
    subtitle: { es: 'Orquesta cuentas, beneficios, equipo remoto y preparación de nómina para colaboradores híbridos.', en: 'Orchestrates accounts, perks, remote equipment and payroll preparation for hybrid employees.' },
    intakeTemplate: [
      { id: 'employee-record', icon: 'badge', label: { es: 'Ficha del empleado generada', en: 'Employee record generated' }, hint: { es: 'Employee id listo.', en: 'Employee id ready.' } },
      { id: 'payroll-profile', icon: 'payments', label: { es: 'Alta de nómina y beneficios', en: 'Payroll and benefits enabled' }, hint: { es: 'Compensación y cuenta cargadas.', en: 'Compensation and bank info loaded.' } },
      { id: 'accounts-access', icon: 'admin_panel_settings', label: { es: 'Cuentas y accesos creados', en: 'Accounts and access created' }, hint: { es: 'Suite, correo y repos incluidos.', en: 'Suite, mail and repos included.' } },
      { id: 'equipment-shipment', icon: 'laptop_mac', label: { es: 'Despacho de equipo solicitado', en: 'Equipment shipment requested' }, hint: { es: 'Guía y dirección listos.', en: 'Shipping label and address ready.' } },
      { id: 'welcome-plan', icon: 'waving_hand', label: { es: 'Welcome plan habilitado', en: 'Welcome plan enabled' }, hint: { es: 'Buddy y sesiones iniciales creadas.', en: 'Buddy and onboarding sessions created.' } },
    ],
    activationTemplate: [
      { id: 'enable-benefits', icon: 'redeem', label: { es: 'Activar beneficios', en: 'Activate perks' }, hint: { es: 'Seguro, wellness y flex benefits.', en: 'Insurance, wellness and flex perks.' } },
      { id: 'ship-equipment', icon: 'local_shipping', label: { es: 'Despachar laptop y accesorios', en: 'Ship laptop and accessories' }, hint: { es: 'Tracking remoto y recepción.', en: 'Remote tracking and receipt.' } },
      { id: 'grant-access', icon: 'key', label: { es: 'Confirmar accesos productivos', en: 'Confirm productive access' }, hint: { es: 'Jira, GitHub, correo y VPN.', en: 'Jira, GitHub, email and VPN.' } },
      { id: 'schedule-onboarding', icon: 'event_upcoming', label: { es: 'Agendar onboarding inicial', en: 'Schedule initial onboarding' }, hint: { es: 'Sesiones con manager, buddy y People.', en: 'Manager, buddy and People sessions.' } },
      { id: 'close-activation', icon: 'task_alt', label: { es: 'Cerrar activación', en: 'Close activation' }, hint: { es: 'Queda activo para operación y nómina.', en: 'Ready for operations and payroll.' } },
    ],
    assetTemplate: [
      { id: 'laptop', label: { es: 'Laptop corporativa', en: 'Corporate laptop' } },
      { id: 'monitor', label: { es: 'Monitor externo', en: 'External monitor' } },
      { id: 'token', label: { es: 'Token / llave de seguridad', en: 'Token / security key' } },
    ],
    benefitTemplate: [
      { id: 'health', label: { es: 'Plan complementario', en: 'Supplemental health plan' }, active: true },
      { id: 'wellness', label: { es: 'Wellness wallet', en: 'Wellness wallet' }, active: true },
      { id: 'internet', label: { es: 'Auxilio de internet', en: 'Internet allowance' }, active: true },
      { id: 'stock', label: { es: 'Programa de equity', en: 'Equity program' }, active: false },
    ],
    defaults: {
      site: 'Remote / Bogota',
      owner: 'Paula Tellez',
      contractType: 'Indefinido',
      payrollCycle: 'Mensual',
      baseSalary: '$ 8.400.000',
      travelStatus: 'no_aplica',
    },
    employees: [
      {
        id: 'adm-tech-1',
        name: 'Natalia Acosta',
        role: 'People Operations Specialist',
        employeeCode: 'EMP-FTL-118',
        email: 'natalia.acosta@career.co',
        phone: '+57 313 551 1200',
        stage: 'activacion',
        adminStatus: 'en_progreso',
        site: 'Bogota hub',
        owner: 'Paula Tellez',
        startDate: '2026-03-18',
        contractType: 'Indefinido',
        payrollCycle: 'Mensual',
        folderCode: 'VINC-FTL-118',
        handoffChecklist: [
          { id: 'employee-record', icon: 'badge', label: { es: 'Ficha del empleado generada', en: 'Employee record generated' }, hint: { es: 'OK.', en: 'OK.' }, done: true },
          { id: 'payroll-profile', icon: 'payments', label: { es: 'Alta de nómina y beneficios', en: 'Payroll and benefits enabled' }, hint: { es: 'OK.', en: 'OK.' }, done: true },
          { id: 'accounts-access', icon: 'admin_panel_settings', label: { es: 'Cuentas y accesos creados', en: 'Accounts and access created' }, hint: { es: 'Pendiente activar GitHub.', en: 'GitHub still pending.' }, done: false },
          { id: 'equipment-shipment', icon: 'laptop_mac', label: { es: 'Despacho de equipo solicitado', en: 'Equipment shipment requested' }, hint: { es: 'Guia lista.', en: 'Shipment ready.' }, done: true },
          { id: 'welcome-plan', icon: 'waving_hand', label: { es: 'Welcome plan habilitado', en: 'Welcome plan enabled' }, hint: { es: 'Pendiente buddy final.', en: 'Final buddy confirmation pending.' }, done: false },
        ],
        activationChecklist: [
          { id: 'enable-benefits', icon: 'redeem', label: { es: 'Activar beneficios', en: 'Activate perks' }, hint: { es: 'Plan wellness activo.', en: 'Wellness active.' }, done: true },
          { id: 'ship-equipment', icon: 'local_shipping', label: { es: 'Despachar laptop y accesorios', en: 'Ship laptop and accessories' }, hint: { es: 'Equipo sale hoy.', en: 'Equipment ships today.' }, done: false },
          { id: 'grant-access', icon: 'key', label: { es: 'Confirmar accesos productivos', en: 'Confirm productive access' }, hint: { es: 'Jira y correo listos; GitHub pendiente.', en: 'Jira and email ready; GitHub pending.' }, done: false },
          { id: 'schedule-onboarding', icon: 'event_upcoming', label: { es: 'Agendar onboarding inicial', en: 'Schedule initial onboarding' }, hint: { es: 'Welcome session confirmada para el martes.', en: 'Welcome session confirmed for Tuesday.' }, done: true },
          { id: 'close-activation', icon: 'task_alt', label: { es: 'Cerrar activación', en: 'Close activation' }, hint: { es: 'Falta despacho y accesos.', en: 'Shipment and access still pending.' }, done: false },
        ],
        equipment: {
          actaSigned: false,
          assets: [
            { id: 'laptop', label: { es: 'Laptop corporativa', en: 'Corporate laptop' }, delivered: false, serial: 'MBP-8821' },
            { id: 'monitor', label: { es: 'Monitor externo', en: 'External monitor' }, delivered: false, serial: 'MON-8821' },
            { id: 'token', label: { es: 'Token / llave de seguridad', en: 'Token / security key' }, delivered: false, serial: 'SEC-118' },
          ],
        },
        travel: {
          status: 'no_aplica',
          amount: '$ 0',
          supports: [],
        },
        novelties: [
          { id: 'nov-tech-1', type: 'beneficio', label: { es: 'Asignación wellness wallet', en: 'Wellness wallet allocation' }, value: '$ 200.000', status: 'pendiente', note: { es: 'Queda activa en el primer ciclo.', en: 'Activates in the first cycle.' } },
        ],
        payroll: {
          cutOff: '2026-03-30',
          prePayrollValidated: false,
          dianSubmitted: false,
          paid: false,
          earnings: [
            { label: { es: 'Salario base', en: 'Base salary' }, value: '$ 8.400.000' },
            { label: { es: 'Auxilio de internet', en: 'Internet allowance' }, value: '$ 180.000' },
          ],
          deductions: [
            { label: { es: 'Salud', en: 'Health' }, value: '$ 336.000' },
            { label: { es: 'Pension', en: 'Pension' }, value: '$ 336.000' },
          ],
        },
        benefits: [
          { id: 'health', label: { es: 'Plan complementario', en: 'Supplemental health plan' }, active: true },
          { id: 'wellness', label: { es: 'Wellness wallet', en: 'Wellness wallet' }, active: true },
          { id: 'internet', label: { es: 'Auxilio de internet', en: 'Internet allowance' }, active: true },
          { id: 'stock', label: { es: 'Programa de equity', en: 'Equity program' }, active: false },
        ],
        notes: 'El caso viene desde contratación y ahora necesita cerrar accesos, equipo y beneficios antes del primer payroll.',
        timeline: [
          { id: 'adm-tech-t1', time: '13 Mar · 09:40', title: 'Caso recibido desde contratación', detail: 'People Ops tomó el control del alta administrativa.' },
          { id: 'adm-tech-t2', time: '13 Mar · 12:15', title: 'Welcome plan agendado', detail: 'Se enviaron sesiones de bienvenida y buddy intro.' },
        ],
      },
    ],
  },
}

function buildHealthEmployee(candidate) {
  return {
    id: `adm-${candidate.id}`,
    name: candidate.name,
    role: candidate.role,
    employeeCode: candidate.handoff?.employeeCode || `EMP-${candidate.id.toUpperCase()}`,
    email: candidate.email,
    phone: candidate.phone,
    stage: 'activacion',
    adminStatus: 'pendiente',
    site: 'Sede Norte',
    owner: 'Daniela Muñoz',
    startDate: '',
    contractType: 'Indefinido',
    payrollCycle: 'Quincenal clínica',
    folderCode: candidate.folder?.code || '',
    handoffChecklist: buildChecklist(workspaceByCompany['health-enterprise'].intakeTemplate, candidate.handoff?.tasks),
    activationChecklist: workspaceByCompany['health-enterprise'].activationTemplate.map((item) => ({ ...item, done: false })),
    equipment: {
      actaSigned: false,
      assets: buildAssets(workspaceByCompany['health-enterprise'].assetTemplate),
    },
    travel: {
      status: 'no_aplica',
      amount: '$ 0',
      supports: [],
    },
    novelties: [],
    payroll: {
      cutOff: '',
      prePayrollValidated: false,
      dianSubmitted: false,
      paid: false,
      earnings: [
        { label: { es: 'Salario base', en: 'Base salary' }, value: '$ 2.800.000' },
      ],
      deductions: [
        { label: { es: 'Salud', en: 'Health' }, value: '$ 112.000' },
      ],
    },
    benefits: cloneList(workspaceByCompany['health-enterprise'].benefitTemplate),
    notes: 'Caso creado automáticamente desde contratación.',
    timeline: [
      { id: `adm-${candidate.id}-1`, time: '13 Mar · 13:10', title: 'Recibido desde contratación', detail: 'El colaborador llegó al módulo administrativo con folder y checklist base.' },
    ],
  }
}

function buildTechEmployee(candidate) {
  return {
    id: `adm-${candidate.id}`,
    name: candidate.name,
    role: candidate.role,
    employeeCode: candidate.handoff?.employeeCode || `EMP-${candidate.id.toUpperCase()}`,
    email: candidate.email,
    phone: candidate.phone,
    stage: 'activacion',
    adminStatus: 'pendiente',
    site: 'Remote / Bogota',
    owner: 'Paula Tellez',
    startDate: '',
    contractType: 'Indefinido',
    payrollCycle: 'Mensual',
    folderCode: candidate.folder?.code || '',
    handoffChecklist: buildChecklist(workspaceByCompany['tech-scaleup'].intakeTemplate, candidate.handoff?.tasks),
    activationChecklist: workspaceByCompany['tech-scaleup'].activationTemplate.map((item) => ({ ...item, done: false })),
    equipment: {
      actaSigned: false,
      assets: buildAssets(workspaceByCompany['tech-scaleup'].assetTemplate),
    },
    travel: {
      status: 'no_aplica',
      amount: '$ 0',
      supports: [],
    },
    novelties: [],
    payroll: {
      cutOff: '',
      prePayrollValidated: false,
      dianSubmitted: false,
      paid: false,
      earnings: [
        { label: { es: 'Salario base', en: 'Base salary' }, value: '$ 8.400.000' },
      ],
      deductions: [
        { label: { es: 'Salud', en: 'Health' }, value: '$ 336.000' },
      ],
    },
    benefits: cloneList(workspaceByCompany['tech-scaleup'].benefitTemplate),
    notes: 'Caso creado automáticamente desde contratación.',
    timeline: [
      { id: `adm-${candidate.id}-1`, time: '13 Mar · 13:10', title: 'Recibido desde contratación', detail: 'People Ops recibió el caso para activación remota.' },
    ],
  }
}

export function createAdministrationEmployee(companyId, candidate) {
  if (companyId === 'tech-scaleup') return buildTechEmployee(candidate)
  return buildTechEmployee(candidate)
  return buildHealthEmployee(candidate)
}

export function getAdministrationWorkspace(companyId) {
  return {
    steps: baseSteps,
    lanes: baseLanes,
    statusOptions,
    noveltyTypeOptions,
    travelStatusOptions,
    ...(workspaceByCompany[companyId] || workspaceByCompany['health-enterprise']),
  }
}
