export const lifecycleStages = [
  {
    id: 'hiring',
    route: '/lifecycle/contratacion',
    module: 'onboarding',
    icon: 'person_search',
    name: { es: 'Contratación', en: 'Hiring' },
    shortLabel: { es: 'Pipeline', en: 'Pipeline' },
    description: {
      es: 'Desde la vacante hasta la firma digital del contrato con un flujo único de reclutamiento, selección y vinculación.',
      en: 'From the opening of a role to the digital signature of the contract in a single hiring flow.',
    },
    progress: 68,
    stats: [
      { label: { es: 'Vacantes activas', en: 'Open roles' }, value: '18' },
      { label: { es: 'Candidatos en embudo', en: 'Candidates in funnel' }, value: '126' },
    ],
  },
  {
    id: 'administration',
    route: '/lifecycle/administracion',
    module: 'administration',
    icon: 'work_history',
    name: { es: 'Administración', en: 'Administration' },
    shortLabel: { es: 'Operación', en: 'Operations' },
    description: {
      es: 'Control operativo del colaborador ya vinculado: dotación, nómina, viáticos, equipos y seguridad social.',
      en: 'Operational control for active employees: payroll, equipment, travel expenses and social security.',
    },
    progress: 82,
    stats: [
      { label: { es: 'Colaboradores activos', en: 'Active employees' }, value: '248' },
      { label: { es: 'Novedades abiertas', en: 'Open incidents' }, value: '31' },
    ],
  },
  {
    id: 'offboarding',
    route: '/lifecycle/retiro',
    module: 'offboarding',
    icon: 'badge',
    name: { es: 'Retiro', en: 'Offboarding' },
    shortLabel: { es: 'Salida', en: 'Exit' },
    description: {
      es: 'Salida controlada del empleado con checklist legal, financiero, técnico y de transferencia de conocimiento.',
      en: 'Structured employee exit with legal, financial and technical checkpoints.',
    },
    progress: 61,
    stats: [
      { label: { es: 'Retiros del mes', en: 'Departures this month' }, value: '7' },
      { label: { es: 'Paz y salvos pendientes', en: 'Pending clearances' }, value: '5' },
    ],
  },
]

export const lifecycleDashboard = {
  hero: {
    eyebrow: { es: 'Plataforma HR', en: 'HR Platform' },
    title: { es: 'Zekya HR Cloud', en: 'Zekya HR Cloud' },
    description: {
      es: 'Una sola plataforma para reclutar, contratar, administrar y cerrar el ciclo de vida completo del empleado.',
      en: 'A single platform to recruit, hire, operate and close the full employee lifecycle.',
    },
    chips: [
      {
        icon: 'hub',
        label: { es: 'Gestión centralizada del ciclo HR', en: 'Centralized HR lifecycle management' },
      },
      {
        icon: 'palette',
        label: { es: 'Operación unificada por empresa', en: 'Unified operation by company' },
      },
      {
        icon: 'responsive_layout',
        label: { es: 'Experiencia adaptada a cada dispositivo', en: 'Experience adapted to every device' },
      },
    ],
    snapshot: [
      {
        label: { es: 'Procesos activos', en: 'Active processes' },
        value: '56',
        helper: { es: 'Contratación + administración + retiro', en: 'Hiring + administration + offboarding' },
      },
      {
        label: { es: 'Módulos activos', en: 'Active modules' },
        value: '14',
        helper: { es: 'Módulos operativos habilitados', en: 'Enabled operational modules' },
      },
      {
        label: { es: 'Carga operativa semanal', en: 'Weekly workload' },
        value: '92%',
        helper: { es: 'Procesos dentro del SLA interno', en: 'Processes inside internal SLA' },
      },
    ],
  },
  metrics: [
    {
      label: { es: 'Vacantes activas', en: 'Open roles' },
      value: '18',
      change: { es: '+4 esta semana', en: '+4 this week' },
      icon: 'campaign',
    },
    {
      label: { es: 'Novedades de nómina', en: 'Payroll incidents' },
      value: '31',
      change: { es: '12 por aprobar hoy', en: '12 pending approval today' },
      icon: 'receipt_long',
    },
    {
      label: { es: 'Entregas y paz y salvos', en: 'Deliveries and clearances' },
      value: '21',
      change: { es: 'Operación inter-áreas', en: 'Cross-team operation' },
      icon: 'inventory_2',
    },
    {
      label: { es: 'Cumplimiento operativo', en: 'Operational compliance' },
      value: '96%',
      change: { es: 'SLA semanal consolidado', en: 'Weekly consolidated SLA' },
      icon: 'workspace_premium',
    },
  ],
  pillars: [
    {
      icon: 'dataset',
      title: { es: 'Respuestas normalizadas', en: 'Normalized responses' },
      description: {
        es: 'Los nuevos módulos consumen una capa única de datos del ciclo de vida, lista para reemplazar mocks por APIs reales.',
        en: 'New modules consume a single lifecycle data layer, ready to swap mocks for real APIs.',
      },
    },
    {
      icon: 'account_tree',
      title: { es: 'Servicios desacoplados', en: 'Decoupled services' },
      description: {
        es: 'Contratación, administración y retiro quedan como servicios propios en vez de mezclar toda la operación en un solo archivo.',
        en: 'Hiring, administration and offboarding live in their own service instead of one monolithic file.',
      },
    },
    {
      icon: 'design_services',
      title: { es: 'Procesos estandarizados', en: 'Standardized processes' },
      description: {
        es: 'Los procesos de contratación, administración y retiro siguen el mismo estándar operativo.',
        en: 'Hiring, administration and offboarding processes follow the same operational standard.',
      },
    },
  ],
  agenda: [
    {
      time: '08:30',
      title: { es: 'Validar terna final para Coordinador de Nómina', en: 'Validate final shortlist for Payroll Coordinator' },
      detail: { es: 'Contratación · selección técnica', en: 'Hiring · technical screening' },
    },
    {
      time: '11:00',
      title: { es: 'Cierre de novedades para nómina electrónica', en: 'Incident close for electronic payroll' },
      detail: { es: 'Administración · corte semanal', en: 'Administration · weekly cut-off' },
    },
    {
      time: '16:00',
      title: { es: 'Recuperación de activos y accesos de retiro programado', en: 'Asset and access recovery for planned departure' },
      detail: { es: 'Retiro · checklist TI', en: 'Offboarding · IT checklist' },
    },
  ],
}

export const stageBlueprints = {
  hiring: {
    hero: {
      eyebrow: { es: 'Contratación', en: 'Hiring' },
      title: { es: 'Contratación y onboarding', en: 'Hiring and onboarding' },
      description: {
        es: 'Este módulo agrupa reclutamiento, selección y contratación para que el frente de RR. HH. siga un solo flujo desde la vacante hasta la firma digital.',
        en: 'This stage groups recruiting, selection and contracting into a single workflow from job post to digital signature.',
      },
      chips: [
        { icon: 'newspaper', label: { es: 'LinkedIn, Magneto y Computrabajo', en: 'LinkedIn, Magneto and Computrabajo' } },
        { icon: 'psychology_alt', label: { es: 'Entrevistas y pruebas centralizadas', en: 'Centralized interviews and tests' } },
        { icon: 'draw', label: { es: 'Documentos, exámenes y firma digital', en: 'Documents, medical exams and digital signature' } },
      ],
    },
    metrics: [
      { label: { es: 'Vacantes activas', en: 'Open roles' }, value: '18', change: { es: '5 nuevas en 7 días', en: '5 new in 7 days' }, icon: 'campaign' },
      { label: { es: 'Hojas de vida', en: 'Resumes' }, value: '126', change: { es: '54 ya preseleccionadas', en: '54 already screened' }, icon: 'description' },
      { label: { es: 'Tiempo promedio', en: 'Average cycle' }, value: '11 días', change: { es: 'Desde vacante hasta oferta', en: 'From job post to offer' }, icon: 'timer' },
      { label: { es: 'Contratos listos', en: 'Contracts ready' }, value: '9', change: { es: 'Pendientes de firma', en: 'Pending signature' }, icon: 'history_edu' },
    ],
    workstreams: [
      {
        icon: 'campaign',
        title: { es: 'Reclutamiento', en: 'Recruitment' },
        description: {
          es: 'Publicación y abastecimiento de candidatos para cada requerimiento abierto.',
          en: 'Job posting and candidate sourcing for every open requisition.',
        },
        owner: { es: 'Atracción de talento', en: 'Talent acquisition' },
        load: { es: '18 vacantes activas', en: '18 active vacancies' },
        status: { es: 'En cobertura', en: 'Covering' },
        progress: 74,
        items: [
          { es: 'Publicación de vacantes en portales y red propia.', en: 'Post vacancies across job boards and internal channels.' },
          { es: 'Consecución de hojas de vida por fuente y perfil.', en: 'Source resumes by channel and profile.' },
          { es: 'Preselección inicial con criterios mínimos y scoring.', en: 'Run initial screening with baseline criteria and scoring.' },
        ],
      },
      {
        icon: 'psychology_alt',
        title: { es: 'Selección', en: 'Selection' },
        description: {
          es: 'Entrevistas, pruebas y ranking de terna para toma de decisión final.',
          en: 'Interviews, tests and shortlist ranking for final decision making.',
        },
        owner: { es: 'HRBP + líder del área', en: 'HRBP + hiring manager' },
        load: { es: '27 candidatos en evaluación', en: '27 candidates under review' },
        status: { es: 'Curva crítica', en: 'Critical lane' },
        progress: 63,
        items: [
          { es: 'Entrevistas psicológicas y técnicas con evidencia.', en: 'Psychological and technical interviews with evidence.' },
          { es: 'Pruebas específicas y matriz comparativa.', en: 'Specific tests and comparative scoring matrix.' },
          { es: 'Ranking de terna y entrevista final de cierre.', en: 'Shortlist ranking and final wrap-up interview.' },
        ],
      },
      {
        icon: 'draw',
        title: { es: 'Contratación', en: 'Contracting' },
        description: {
          es: 'Vinculación documental, validaciones previas y formalización del contrato.',
          en: 'Pre-hire validations, document collection and contract formalization.',
        },
        owner: { es: 'Gestión humana', en: 'People operations' },
        load: { es: '9 contratos en mesa', en: '9 contracts in progress' },
        status: { es: 'Cierre inmediato', en: 'Immediate close' },
        progress: 81,
        items: [
          { es: 'Exámenes médicos y visitas domiciliarias.', en: 'Medical exams and home visits.' },
          { es: 'Solicitud de documentos y validación de soportes.', en: 'Document request and support validation.' },
          { es: 'Contrato, anexos y firma digital.', en: 'Contract, addendums and digital signature.' },
        ],
      },
    ],
    lanes: [
      {
        title: { es: 'Vacantes publicadas', en: 'Published roles' },
        count: '18',
        items: [
          { title: { es: 'Coordinador de nómina', en: 'Payroll coordinator' }, meta: { es: 'LinkedIn · Magneto', en: 'LinkedIn · Magneto' }, note: { es: '23 postulaciones calificadas', en: '23 qualified applicants' } },
          { title: { es: 'Analista de selección', en: 'Selection analyst' }, meta: { es: 'Computrabajo', en: 'Computrabajo' }, note: { es: '17 hojas de vida recibidas', en: '17 resumes received' } },
        ],
      },
      {
        title: { es: 'Preselección', en: 'Screening' },
        count: '54',
        items: [
          { title: { es: 'Auxiliar de nómina', en: 'Payroll assistant' }, meta: { es: '8 perfiles shortlist', en: '8 shortlisted profiles' }, note: { es: 'Filtro por experiencia DIAN', en: 'Filtered by DIAN experience' } },
          { title: { es: 'Generalista SR', en: 'Senior HR generalist' }, meta: { es: '6 perfiles shortlist', en: '6 shortlisted profiles' }, note: { es: 'Validación de salario objetivo', en: 'Target salary validated' } },
        ],
      },
      {
        title: { es: 'Entrevistas y pruebas', en: 'Interviews and tests' },
        count: '27',
        items: [
          { title: { es: 'Líder de bienestar', en: 'Wellbeing lead' }, meta: { es: 'Entrevista técnica mañana 9:00', en: 'Technical interview tomorrow 9:00' }, note: { es: 'Prueba psicométrica completada', en: 'Psychometric test completed' } },
          { title: { es: 'Business partner', en: 'Business partner' }, meta: { es: 'Terna final', en: 'Final shortlist' }, note: { es: 'Esperando entrevista final', en: 'Awaiting final interview' } },
        ],
      },
      {
        title: { es: 'Oferta y firma', en: 'Offer and signature' },
        count: '9',
        items: [
          { title: { es: 'Abogado laboral', en: 'Labor attorney' }, meta: { es: 'Exámenes médicos listos', en: 'Medical exams ready' }, note: { es: 'Pendiente firma digital', en: 'Pending digital signature' } },
          { title: { es: 'Asistente SG-SST', en: 'OHS assistant' }, meta: { es: 'Documentación al 100%', en: 'Documentation at 100%' }, note: { es: 'Inicio programado para lunes', en: 'Start date scheduled for Monday' } },
        ],
      },
    ],
    controls: {
      title: { es: 'Controles de la etapa', en: 'Stage controls' },
      items: [
        {
          title: { es: 'SLA de preselección', en: 'Screening SLA' },
          description: { es: 'Mantener respuesta inicial por vacante en menos de 48 horas.', en: 'Keep first response per vacancy under 48 hours.' },
          status: { es: '36 h promedio', en: '36 h average' },
        },
        {
          title: { es: 'Evidencias de entrevistas', en: 'Interview evidence' },
          description: { es: 'Cada entrevista debe quedar con scorecard y recomendación.', en: 'Every interview must leave a scorecard and recommendation.' },
          status: { es: '92% completo', en: '92% complete' },
        },
        {
          title: { es: 'Checklist de contratación', en: 'Contracting checklist' },
          description: { es: 'Exámenes, documentos, visitas y firma en un solo cierre.', en: 'Medicals, documents, home visits and signature in one close.' },
          status: { es: '9 casos activos', en: '9 active cases' },
        },
      ],
    },
    automation: {
      title: { es: 'Qué gestiona la plataforma', en: 'What the platform manages' },
      items: [
        { es: 'Estados homogéneos por candidato y por vacante.', en: 'Homogeneous statuses by candidate and requisition.' },
        { es: 'Pipeline, evaluaciones y checklist integrados en un solo flujo.', en: 'Pipeline, assessments and checklists integrated into one flow.' },
        { es: 'Listo para cambiar mocks por servicios reales sin tocar la UI.', en: 'Ready to swap mocks for real services without redoing the UI.' },
      ],
    },
  },
  administration: {
    hero: {
      eyebrow: { es: 'Administración', en: 'Administration' },
      title: { es: 'Administración del empleado', en: 'Employee administration' },
      description: {
        es: 'La operación diaria queda dividida por frentes de servicio para controlar dotación, viáticos, equipos y todo el ciclo de nómina.',
        en: 'Day-to-day operations are split into service tracks for payroll, equipment, travel expenses and employee administration.',
      },
      chips: [
        { icon: 'inventory_2', label: { es: 'Dotación y equipos', en: 'Equipment and assets' } },
        { icon: 'payments', label: { es: 'Nómina y DIAN', en: 'Payroll and DIAN' } },
        { icon: 'security', label: { es: 'Prestaciones y seguridad social', en: 'Benefits and social security' } },
      ],
    },
    metrics: [
      { label: { es: 'Colaboradores activos', en: 'Active employees' }, value: '248', change: { es: '18 sedes cubiertas', en: '18 locations covered' }, icon: 'groups' },
      { label: { es: 'Novedades abiertas', en: 'Open incidents' }, value: '31', change: { es: 'Corte semanal en progreso', en: 'Weekly cut-off in progress' }, icon: 'edit_calendar' },
      { label: { es: 'Cumplimiento DIAN', en: 'DIAN compliance' }, value: '98%', change: { es: 'Proveedor tecnológico autorizado', en: 'Authorized technology provider' }, icon: 'verified_user' },
      { label: { es: 'Pendientes operativos', en: 'Operational pending items' }, value: '12', change: { es: 'Viáticos, entregas y soportes', en: 'Travel, delivery and support docs' }, icon: 'pending_actions' },
    ],
    workstreams: [
      {
        icon: 'checkroom',
        title: { es: 'Dotación', en: 'Uniforms and gear' },
        description: { es: 'Control de entrega y reposición por cargo, sede y fecha.', en: 'Track issue and replacement by role, site and due date.' },
        owner: { es: 'Operaciones + SST', en: 'Operations + HSE' },
        load: { es: '46 entregas este mes', en: '46 deliveries this month' },
        status: { es: 'En curso', en: 'In progress' },
        progress: 77,
        items: [
          { es: 'Kit inicial por tipo de cargo.', en: 'Starter kit by role type.' },
          { es: 'Reposición por desgaste o novedad.', en: 'Replacement by wear or incident.' },
          { es: 'Control de recibido y responsable.', en: 'Receipt and ownership tracking.' },
        ],
      },
      {
        icon: 'flight_takeoff',
        title: { es: 'Viáticos', en: 'Travel expenses' },
        description: { es: 'Solicitud, aprobación y legalización de gastos de viaje.', en: 'Request, approval and legalization of travel expenses.' },
        owner: { es: 'Finanzas + talento', en: 'Finance + people ops' },
        load: { es: '8 legalizaciones pendientes', en: '8 pending settlements' },
        status: { es: 'Seguimiento', en: 'Follow-up' },
        progress: 66,
        items: [
          { es: 'Anticipo según política interna.', en: 'Advance payment based on policy.' },
          { es: 'Carga de soportes y conciliación.', en: 'Upload receipts and reconcile.' },
          { es: 'Aprobación final y cierre contable.', en: 'Final approval and accounting close.' },
        ],
      },
      {
        icon: 'laptop_mac',
        title: { es: 'Entrega de equipos', en: 'Asset handoff' },
        description: { es: 'Inventario y trazabilidad de laptop, celular y accesorios.', en: 'Inventory and traceability for laptops, phones and accessories.' },
        owner: { es: 'TI + gestión humana', en: 'IT + people ops' },
        load: { es: '17 activos en mesa', en: '17 assets in queue' },
        status: { es: 'Controlado', en: 'Controlled' },
        progress: 84,
        items: [
          { es: 'Asignación según rol y sede.', en: 'Assign by role and site.' },
          { es: 'Acta de entrega firmada.', en: 'Signed handoff record.' },
          { es: 'Seriales y garantías centralizados.', en: 'Serials and warranties centralized.' },
        ],
      },
      {
        icon: 'request_quote',
        title: { es: 'Novedades de nómina', en: 'Payroll changes' },
        description: { es: 'Horas extra, permisos, vacaciones, licencias y beneficios.', en: 'Overtime, leave, vacations, permits and benefits.' },
        owner: { es: 'Nómina', en: 'Payroll team' },
        load: { es: '31 novedades abiertas', en: '31 open incidents' },
        status: { es: 'Punto crítico', en: 'Critical point' },
        progress: 59,
        items: [
          { es: 'Captura y validación por empleado.', en: 'Capture and validate per employee.' },
          { es: 'Trazabilidad de aprobación.', en: 'Approval traceability.' },
          { es: 'Corte antes de liquidación.', en: 'Cut-off before payroll run.' },
        ],
      },
      {
        icon: 'payments',
        title: { es: 'Nómina y DIAN', en: 'Payroll and DIAN' },
        description: { es: 'Liquidar, pagar y presentar nómina electrónica a la DIAN.', en: 'Run, pay and submit electronic payroll to DIAN.' },
        owner: { es: 'Nómina + proveedor tecnológico', en: 'Payroll + tech provider' },
        load: { es: '2 corridas activas', en: '2 active runs' },
        status: { es: 'Alta prioridad', en: 'High priority' },
        progress: 91,
        items: [
          { es: 'Preliquidación y validación.', en: 'Pre-payroll and validation.' },
          { es: 'Presentación de nómina electrónica.', en: 'Electronic payroll submission.' },
          { es: 'Pago y soportes por empleado.', en: 'Payment and employee support docs.' },
        ],
      },
      {
        icon: 'account_balance_wallet',
        title: { es: 'Ingresos y descuentos', en: 'Earnings and deductions' },
        description: { es: 'Detalle individual de conceptos que componen la nómina.', en: 'Individual detail of earnings and deductions per employee.' },
        owner: { es: 'Nómina + contabilidad', en: 'Payroll + accounting' },
        load: { es: '248 colaboradores auditados', en: '248 employees audited' },
        status: { es: 'Normalizado', en: 'Standardized' },
        progress: 88,
        items: [
          { es: 'Conceptos fijos y variables.', en: 'Fixed and variable concepts.' },
          { es: 'Deducciones legales y voluntarias.', en: 'Legal and voluntary deductions.' },
          { es: 'Consulta histórica por periodo.', en: 'Historical lookup by period.' },
        ],
      },
      {
        icon: 'health_and_safety',
        title: { es: 'Prestaciones y seguridad social', en: 'Benefits and social security' },
        description: { es: 'Cesantías, primas, vacaciones, aportes y novedades de afiliación.', en: 'Severance, bonuses, vacations, contributions and affiliation changes.' },
        owner: { es: 'Compensación', en: 'Compensation team' },
        load: { es: '14 casos con seguimiento', en: '14 tracked cases' },
        status: { es: 'En monitoreo', en: 'Monitored' },
        progress: 79,
        items: [
          { es: 'Control de prestaciones sociales.', en: 'Social benefit tracking.' },
          { es: 'Aportes a salud, pensión y ARL.', en: 'Health, pension and risk contributions.' },
          { es: 'Novedades de ingreso y retiro.', en: 'Joiner and leaver updates.' },
        ],
      },
    ],
    lanes: [
      {
        title: { es: 'Captura operativa', en: 'Operational capture' },
        count: '31',
        items: [
          { title: { es: 'Horas extra regional norte', en: 'North region overtime' }, meta: { es: '12 empleados', en: '12 employees' }, note: { es: 'Pendiente revisión coordinador', en: 'Pending coordinator review' } },
          { title: { es: 'Vacaciones marzo', en: 'March vacations' }, meta: { es: '6 solicitudes', en: '6 requests' }, note: { es: 'Cierre hoy 5:00 p. m.', en: 'Closing today 5:00 pm' } },
        ],
      },
      {
        title: { es: 'Preliquidación', en: 'Pre-payroll' },
        count: '2',
        items: [
          { title: { es: 'Quincena administrativa', en: 'Administrative payroll' }, meta: { es: '248 empleados', en: '248 employees' }, note: { es: 'En conciliación contable', en: 'Under accounting reconciliation' } },
          { title: { es: 'Horas extra febrero', en: 'February overtime' }, meta: { es: 'Reporte consolidado', en: 'Consolidated report' }, note: { es: 'Listo para aprobación', en: 'Ready for approval' } },
        ],
      },
      {
        title: { es: 'DIAN y pago', en: 'DIAN and payment' },
        count: '1',
        items: [
          { title: { es: 'Nómina electrónica febrero', en: 'February e-payroll' }, meta: { es: 'Validación OK', en: 'Validation OK' }, note: { es: 'En ventana de transmisión', en: 'In transmission window' } },
        ],
      },
      {
        title: { es: 'Soportes y cierre', en: 'Support docs and close' },
        count: '8',
        items: [
          { title: { es: 'Legalización de viáticos comercial', en: 'Sales travel settlement' }, meta: { es: '4 soportes faltantes', en: '4 missing receipts' }, note: { es: 'Requiere carga documental', en: 'Needs document upload' } },
          { title: { es: 'Entrega de equipos nuevos ingresos', en: 'New hire equipment handoff' }, meta: { es: '3 sedes', en: '3 sites' }, note: { es: 'Pendiente serial en inventario', en: 'Pending asset serial in inventory' } },
        ],
      },
    ],
    controls: {
      title: { es: 'Controles de la etapa', en: 'Stage controls' },
      items: [
        {
          title: { es: 'Corte de novedades', en: 'Payroll cut-off' },
          description: { es: 'Todas las novedades deben quedar cerradas antes de preliquidar.', en: 'Every payroll change must be closed before pre-payroll.' },
          status: { es: 'Cierre hoy 17:00', en: 'Closing today 17:00' },
        },
        {
          title: { es: 'Trazabilidad de activos', en: 'Asset traceability' },
          description: { es: 'Cada entrega debe conservar acta, serial y responsable.', en: 'Each handoff keeps signed record, serial and owner.' },
          status: { es: '84% al día', en: '84% on track' },
        },
        {
          title: { es: 'Nómina electrónica', en: 'Electronic payroll' },
          description: { es: 'El envío a DIAN queda visible como un paso del flujo administrativo.', en: 'DIAN submission is visible as a first-class step in the admin flow.' },
          status: { es: '98% de cumplimiento', en: '98% compliance' },
        },
      ],
    },
    automation: {
      title: { es: 'Base del módulo administrativo', en: 'Administration module foundation' },
      items: [
        { es: 'Cards operativas por frente: dotación, viáticos, equipos, nómina y prestaciones.', en: 'Operational cards by track: uniforms, travel, assets, payroll and benefits.' },
        { es: 'Estados homogéneos para corte, validación, pago y cierre.', en: 'Consistent statuses for cut-off, validation, payment and close.' },
        { es: 'Seguimiento semanal de casos y novedades pendientes.', en: 'Weekly case and incident tracking.' },
      ],
    },
  },
  offboarding: {
    hero: {
      eyebrow: { es: 'Retiro', en: 'Offboarding' },
      title: { es: 'Retiro y cierre de vínculo', en: 'Offboarding and closure' },
      description: {
        es: 'La salida del colaborador queda organizada como proceso, no como un conjunto de tareas sueltas entre áreas.',
        en: 'Employee exit is handled as a process rather than a loose set of cross-team tasks.',
      },
      chips: [
        { icon: 'gavel', label: { es: 'Desvinculación legal y documental', en: 'Legal and document closure' } },
        { icon: 'computer', label: { es: 'Recuperación de equipos y accesos', en: 'Asset and access recovery' } },
        { icon: 'rule', label: { es: 'Liquidación y paz y salvo', en: 'Settlement and clearance' } },
      ],
    },
    metrics: [
      { label: { es: 'Retiros programados', en: 'Planned departures' }, value: '7', change: { es: '4 voluntarios, 3 terminaciones', en: '4 voluntary, 3 terminations' }, icon: 'badge' },
      { label: { es: 'Equipos por recuperar', en: 'Assets to recover' }, value: '4', change: { es: '2 laptops y 2 celulares', en: '2 laptops and 2 phones' }, icon: 'devices' },
      { label: { es: 'Liquidaciones pendientes', en: 'Pending settlements' }, value: '3', change: { es: '1 con novedad salarial', en: '1 with salary incident' }, icon: 'request_quote' },
      { label: { es: 'Checklist completado', en: 'Checklist completed' }, value: '92%', change: { es: 'Promedio por caso', en: 'Average per case' }, icon: 'fact_check' },
    ],
    workstreams: [
      {
        icon: 'assignment_late',
        title: { es: 'Desvinculación y causal', en: 'Separation and reason' },
        description: { es: 'Registro del motivo, fecha efectiva y responsables de cierre.', en: 'Track reason, effective date and owners for the exit.' },
        owner: { es: 'Relaciones laborales', en: 'Employee relations' },
        load: { es: '7 casos en seguimiento', en: '7 tracked cases' },
        status: { es: 'Priorizado', en: 'Prioritized' },
        progress: 72,
        items: [
          { es: 'Tipo de retiro y soporte legal.', en: 'Departure type and legal support.' },
          { es: 'Comunicación formal y fecha efectiva.', en: 'Formal communication and effective date.' },
          { es: 'Asignación de responsables por área.', en: 'Cross-team ownership assignment.' },
        ],
      },
      {
        icon: 'inventory',
        title: { es: 'Paz y salvo operativo', en: 'Operational clearance' },
        description: { es: 'Chequeo de activos, documentos y cierres internos.', en: 'Check assets, documents and internal sign-offs.' },
        owner: { es: 'TI + operaciones + SST', en: 'IT + operations + HSE' },
        load: { es: '5 paz y salvos abiertos', en: '5 open clearances' },
        status: { es: 'Pendiente', en: 'Pending' },
        progress: 61,
        items: [
          { es: 'Recuperación de equipos y carnés.', en: 'Recover devices and IDs.' },
          { es: 'Desactivación de accesos y cuentas.', en: 'Disable accounts and accesses.' },
          { es: 'Validación de pendientes administrativos.', en: 'Validate remaining admin obligations.' },
        ],
      },
      {
        icon: 'payments',
        title: { es: 'Liquidación final', en: 'Final settlement' },
        description: { es: 'Cálculo, aprobación y pago de liquidación con soportes.', en: 'Calculate, approve and pay final settlement with support docs.' },
        owner: { es: 'Nómina + finanzas', en: 'Payroll + finance' },
        load: { es: '3 casos por cerrar', en: '3 cases to close' },
        status: { es: 'Cierre financiero', en: 'Financial close' },
        progress: 69,
        items: [
          { es: 'Cálculo de prestaciones y descuentos.', en: 'Calculate benefits and deductions.' },
          { es: 'Aprobación de montos y soportes.', en: 'Approve amounts and support docs.' },
          { es: 'Pago y archivo del cierre.', en: 'Pay and archive closure.' },
        ],
      },
      {
        icon: 'history_edu',
        title: { es: 'Transferencia y feedback', en: 'Knowledge transfer and feedback' },
        description: { es: 'Salida ordenada con entrega de funciones y aprendizaje del caso.', en: 'Orderly exit with handoff and case learning.' },
        owner: { es: 'Líder de área', en: 'Area lead' },
        load: { es: '4 handoffs activos', en: '4 active handoffs' },
        status: { es: 'En transición', en: 'In transition' },
        progress: 64,
        items: [
          { es: 'Transferencia de pendientes y conocimiento.', en: 'Handoff of pending work and know-how.' },
          { es: 'Encuesta o entrevista de salida.', en: 'Exit interview or survey.' },
          { es: 'Cierre documental del expediente.', en: 'Archive full employee record.' },
        ],
      },
    ],
    lanes: [
      {
        title: { es: 'Preaviso', en: 'Notice' },
        count: '7',
        items: [
          { title: { es: 'Renuncia analista senior', en: 'Senior analyst resignation' }, meta: { es: 'Salida efectiva 22 mar', en: 'Effective exit Mar 22' }, note: { es: 'Handoff con equipo de nómina', en: 'Payroll team handoff' } },
          { title: { es: 'Terminación coordinador regional', en: 'Regional coordinator termination' }, meta: { es: 'Documentación legal lista', en: 'Legal docs ready' }, note: { es: 'Pendiente reunión final', en: 'Final meeting pending' } },
        ],
      },
      {
        title: { es: 'Checklist operativo', en: 'Operational checklist' },
        count: '5',
        items: [
          { title: { es: 'Retiro auxiliar SST', en: 'HSE assistant offboarding' }, meta: { es: 'Falta portátil', en: 'Laptop missing' }, note: { es: 'TI coordina recuperación', en: 'IT coordinating recovery' } },
          { title: { es: 'Retiro comercial zona centro', en: 'Central region sales departure' }, meta: { es: 'Carné y celular recibidos', en: 'ID and phone returned' }, note: { es: 'Accesos pendientes', en: 'Access revocation pending' } },
        ],
      },
      {
        title: { es: 'Liquidación', en: 'Settlement' },
        count: '3',
        items: [
          { title: { es: 'Caso con variable salarial', en: 'Case with variable salary' }, meta: { es: 'Revisión con compensación', en: 'Compensation review' }, note: { es: 'Recalcular vacaciones', en: 'Recalculate vacation payout' } },
        ],
      },
      {
        title: { es: 'Cierre final', en: 'Final close' },
        count: '4',
        items: [
          { title: { es: 'Encuestas de salida enviadas', en: 'Exit surveys sent' }, meta: { es: '4 colaboradores', en: '4 employees' }, note: { es: '2 respuestas recibidas', en: '2 responses received' } },
        ],
      },
    ],
    controls: {
      title: { es: 'Controles de la etapa', en: 'Stage controls' },
      items: [
        {
          title: { es: 'Paz y salvo inter-áreas', en: 'Cross-team clearance' },
          description: { es: 'Nadie sale del flujo si TI, operaciones y nómina no liberan su paso.', en: 'No case exits the flow until IT, operations and payroll clear their step.' },
          status: { es: '5 activos', en: '5 active' },
        },
        {
          title: { es: 'Bloqueo de accesos', en: 'Access revocation' },
          description: { es: 'La revocación queda visible como evento del proceso, no como tarea oculta.', en: 'Access revocation becomes a visible process event, not a hidden task.' },
          status: { es: '2 pendientes', en: '2 pending' },
        },
        {
          title: { es: 'Liquidación final', en: 'Final settlement' },
          description: { es: 'El cierre financiero convive con el resto del checklist del retiro.', en: 'Financial close lives inside the same offboarding checklist.' },
          status: { es: '3 por pagar', en: '3 to pay' },
        },
      ],
    },
    automation: {
      title: { es: 'Base del módulo de retiro', en: 'Offboarding module foundation' },
      items: [
        { es: 'Checklist único para legal, TI, activos y finanzas.', en: 'Single checklist for legal, IT, assets and finance.' },
        { es: 'Backlog visual por caso de retiro con estados estándar.', en: 'Visual backlog per offboarding case with standard states.' },
        { es: 'Listo para integrar firma de paz y salvo y cálculo real de liquidación.', en: 'Ready to integrate real clearance signatures and settlement calculations.' },
      ],
    },
  },
}
