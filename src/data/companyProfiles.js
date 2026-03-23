export const defaultCompanyId = 'health-enterprise'

export const companyProfiles = [
  {
    id: 'health-enterprise',
    icon: 'local_hospital',
    name: { es: 'Clínica Horizonte', en: 'Horizon Care' },
    legalName: { es: 'Clínica Horizonte S.A.S.', en: 'Horizon Care LLC' },
    segment: { es: 'Salud multi-sede', en: 'Multi-site healthcare' },
    industry: { es: 'Hospitalario y diagnóstico', en: 'Hospital and diagnostics' },
    size: { es: '1.250 colaboradores', en: '1,250 employees' },
    footprint: { es: '12 sedes operativas', en: '12 operating sites' },
    plan: { es: 'Plan Enterprise', en: 'Enterprise plan' },
    operatingModel: { es: 'Turnos 24/7 con alta rotación clínica', en: '24/7 shifts with high clinical rotation' },
    promise: {
      es: 'La experiencia se ajusta a sedes, turnos, proveedores de nómina y cumplimiento para operación clínica.',
      en: 'The experience adapts to sites, shifts, payroll providers and compliance for clinical operations.',
    },
    badges: [
      { icon: 'schedule', label: { es: 'Operación por turnos', en: 'Shift-based operation' } },
      { icon: 'verified_user', label: { es: 'Cumplimiento regulado', en: 'Regulated compliance' } },
      { icon: 'groups', label: { es: 'Alta densidad de personal', en: 'High workforce density' } },
    ],
    workspace: [
      { icon: 'domain', label: { es: 'Sedes', en: 'Sites' }, value: '12' },
      { icon: 'badge', label: { es: 'Turnos por semana', en: 'Weekly shifts' }, value: '430' },
      { icon: 'emergency', label: { es: 'Cobertura crítica', en: 'Critical coverage' }, value: '96%' },
    ],
    dashboard: {
      title: { es: 'Vista segmentada para operación clínica', en: 'Segmented view for clinical operations' },
      description: {
        es: 'Prioriza dotación, cobertura de turnos, contrataciones asistenciales y cierres con trazabilidad por sede.',
        en: 'Prioritizes staffing, shift coverage, healthcare hiring and traceable closes by site.',
      },
      lenses: [
        {
          icon: 'medical_information',
          title: { es: 'Atracción asistencial', en: 'Clinical talent acquisition' },
          description: { es: 'Vacantes asistenciales con screening rápido y validación documental reforzada.', en: 'Clinical roles with faster screening and stronger document validation.' },
        },
        {
          icon: 'acute',
          title: { es: 'Cobertura 24/7', en: '24/7 coverage' },
          description: { es: 'La administración se enfoca en novedades, horas extra y continuidad de servicio.', en: 'Administration focuses on incidents, overtime and service continuity.' },
        },
        {
          icon: 'rule',
          title: { es: 'Salida sin riesgo legal', en: 'Low-risk offboarding' },
          description: { es: 'El retiro coordina activos clínicos, accesos y soporte legal por sede.', en: 'Offboarding coordinates clinical assets, access and legal support by site.' },
        },
      ],
      pulse: [
        { label: { es: 'Aperturas clínicas críticas', en: 'Critical clinical openings' }, value: '7', status: { es: 'Alta prioridad', en: 'High priority' } },
        { label: { es: 'Nómina por validar', en: 'Payroll pending validation' }, value: '2 cortes', status: { es: 'En ventana', en: 'In window' } },
        { label: { es: 'Retiros con paz y salvo TI', en: 'Leavers with IT clearance' }, value: '100%', status: { es: 'Controlado', en: 'Controlled' } },
      ],
      modules: [
        { icon: 'partner_exchange', title: { es: 'Matriz por sede', en: 'Site matrix' }, description: { es: 'Cada sede ve carga HR, cobertura y backlog.' , en: 'Each site sees HR load, coverage and backlog.' } },
        { icon: 'lan', title: { es: 'Empresa visible', en: 'Active company' }, description: { es: 'La plataforma muestra claramente qué empresa está activa.', en: 'The platform clearly shows which company is active.' } },
        { icon: 'splitscreen', title: { es: 'Procesos por tipo de empresa', en: 'Processes by company type' }, description: { es: 'Los flujos se adaptan al tipo de operación.', en: 'Workflows adapt to the operating model.' } },
      ],
    },
    stages: {
      hiring: {
        title: { es: 'Contratación clínica acelerada', en: 'Accelerated clinical hiring' },
        description: { es: 'Se priorizan cargos asistenciales, licencias, certificados y disponibilidad por sede.', en: 'Clinical roles, licenses, certificates and site availability are prioritized.' },
        priorities: [
          { es: 'Validar RETHUS, soportes y experiencia clínica antes de entrevista final.', en: 'Validate licenses, credentials and clinical background before final interview.' },
          { es: 'Mantener terna por sede para no afectar cobertura hospitalaria.', en: 'Keep shortlist per site to protect hospital coverage.' },
          { es: 'Integrar firma digital y exámenes médicos en un único cierre.', en: 'Combine digital signature and medical exams into one close.' },
        ],
        checkpoints: [
          { label: { es: 'Documentación regulatoria', en: 'Regulatory docs' }, value: '94%' },
          { label: { es: 'Cobertura de vacantes críticas', en: 'Critical role coverage' }, value: '81%' },
        ],
      },
      administration: {
        title: { es: 'Administración con foco en continuidad de atención', en: 'Administration focused on care continuity' },
        description: { es: 'La nómina y la operación se priorizan por turno, sede y carga crítica.', en: 'Payroll and operations are prioritized by shift, site and critical load.' },
        priorities: [
          { es: 'Consolidar novedades por turno antes del corte semanal.', en: 'Consolidate incidents by shift before weekly cut-off.' },
          { es: 'Controlar dotación clínica y equipos biomédicos asignados.', en: 'Track clinical uniforms and assigned medical equipment.' },
          { es: 'Mantener visibilidad de ausentismos y reemplazos urgentes.', en: 'Keep visibility of absences and urgent replacements.' },
        ],
        checkpoints: [
          { label: { es: 'Cobertura operativa', en: 'Operational coverage' }, value: '96%' },
          { label: { es: 'Novedades conciliadas', en: 'Incidents reconciled' }, value: '88%' },
        ],
      },
      offboarding: {
        title: { es: 'Retiro seguro en entorno regulado', en: 'Safe exit in regulated environment' },
        description: { es: 'El retiro protege accesos clínicos, inventario y archivo legal del expediente.', en: 'Offboarding protects clinical access, inventory and employee legal records.' },
        priorities: [
          { es: 'Revocar accesos a historia clínica y sistemas sensibles el mismo día.', en: 'Revoke clinical record and sensitive system access on the same day.' },
          { es: 'Cerrar paz y salvo por sede, TI y coordinación clínica.', en: 'Close clearance by site, IT and clinical coordination.' },
          { es: 'Alinear liquidación con novedades asistenciales pendientes.', en: 'Align settlement with any pending attendance incidents.' },
        ],
        checkpoints: [
          { label: { es: 'Accesos revocados en SLA', en: 'Access revoked in SLA' }, value: '100%' },
          { label: { es: 'Activos clínicos recuperados', en: 'Clinical assets recovered' }, value: '92%' },
        ],
      },
    },
  },
  {
    id: 'tech-scaleup',
    icon: 'memory',
    name: { es: 'Nuvex Labs', en: 'Nuvex Labs' },
    legalName: { es: 'Nuvex Labs S.A.S.', en: 'Nuvex Labs Inc.' },
    segment: { es: 'Scaleup tecnológica', en: 'Tech scaleup' },
    industry: { es: 'Software y producto digital', en: 'Software and digital product' },
    size: { es: '180 colaboradores', en: '180 employees' },
    footprint: { es: '3 sedes + remoto', en: '3 offices + remote' },
    plan: { es: 'Plan Growth', en: 'Growth plan' },
    operatingModel: { es: 'Squads remotos con oficinas hub', en: 'Remote squads with hub offices' },
    promise: {
      es: 'El diseño prioriza onboarding técnico, accesos, equipos remotos y cultura de producto.',
      en: 'The design prioritizes technical onboarding, access, remote equipment and product culture.',
    },
    badges: [
      { icon: 'code', label: { es: 'Producto digital', en: 'Digital product' } },
      { icon: 'home_work', label: { es: 'Híbrido / remoto', en: 'Hybrid / remote' } },
      { icon: 'rocket_launch', label: { es: 'Crecimiento acelerado', en: 'Fast growth' } },
    ],
    workspace: [
      { icon: 'groups', label: { es: 'Squads activos', en: 'Active squads' }, value: '12' },
      { icon: 'trending_up', label: { es: 'Crecimiento anual', en: 'Annual growth' }, value: '42%' },
      { icon: 'laptop_mac', label: { es: 'Remoto', en: 'Remote' }, value: '68%' },
    ],
    dashboard: {
      title: { es: 'Vista segmentada para operación tech', en: 'Segmented view for tech operations' },
      description: {
        es: 'Se concentra en hiring técnico, onboarding de accesos, equipos remotos y retención de talento.',
        en: 'Focuses on technical hiring, access onboarding, remote equipment and talent retention.',
      },
      lenses: [
        {
          icon: 'person_search',
          title: { es: 'Hiring técnico', en: 'Technical hiring' },
          description: { es: 'Pipeline con pruebas técnicas, code review y fit cultural.', en: 'Pipeline with technical tests, code review and cultural fit.' },
        },
        {
          icon: 'devices',
          title: { es: 'Onboarding digital', en: 'Digital onboarding' },
          description: { es: 'Accesos, repos, equipos y buddy asignados antes del día 1.', en: 'Access, repos, equipment and buddy assigned before day 1.' },
        },
        {
          icon: 'psychology',
          title: { es: 'Retención y cultura', en: 'Retention and culture' },
          description: { es: 'El retiro se analiza con data de engagement y 1:1s.', en: 'Offboarding is analyzed with engagement data and 1:1s.' },
        },
      ],
      pulse: [
        { label: { es: 'Posiciones tech abiertas', en: 'Open tech positions' }, value: '9', status: { es: 'En pipeline', en: 'In pipeline' } },
        { label: { es: 'Equipos por despachar', en: 'Equipment to ship' }, value: '4', status: { es: 'En proceso', en: 'In process' } },
        { label: { es: 'Onboardings esta semana', en: 'Onboardings this week' }, value: '3', status: { es: 'Agendados', en: 'Scheduled' } },
      ],
      modules: [
        { icon: 'hub', title: { es: 'Squads y ownership', en: 'Squads and ownership' }, description: { es: 'Cada squad ve su carga HR y backlog de hiring.', en: 'Each squad sees its HR load and hiring backlog.' } },
        { icon: 'badge', title: { es: 'Empresa activa', en: 'Active company' }, description: { es: 'La empresa activa siempre queda visible.', en: 'The active company is always visible.' } },
        { icon: 'tune', title: { es: 'Procesos por segmento', en: 'Segment processes' }, description: { es: 'Las etapas se adaptan a operación tech.', en: 'Stages adapt to tech operations.' } },
      ],
    },
    stages: {
      hiring: {
        title: { es: 'Hiring técnico con pruebas y fit', en: 'Technical hiring with tests and fit' },
        description: { es: 'Pipeline orientado a pruebas técnicas, code challenge y entrevista de cultura.', en: 'Pipeline oriented to technical tests, code challenge and culture interview.' },
        priorities: [
          { es: 'Incluir code challenge y revisión técnica antes de oferta.', en: 'Include code challenge and technical review before offer.' },
          { es: 'Validar fit cultural con el squad antes de cerrar.', en: 'Validate cultural fit with the squad before closing.' },
          { es: 'Preparar accesos, repos y equipo antes del día 1.', en: 'Prepare access, repos and equipment before day 1.' },
        ],
        checkpoints: [
          { label: { es: 'Tiempo promedio de cierre', en: 'Average close time' }, value: '14 días' },
          { label: { es: 'Tasa de aceptación de oferta', en: 'Offer acceptance rate' }, value: '88%' },
        ],
      },
      administration: {
        title: { es: 'Administración con foco en producto', en: 'Product-focused administration' },
        description: { es: 'Nómina, beneficios y novedades se gestionan por squad y tipo de contrato.', en: 'Payroll, benefits and incidents are managed by squad and contract type.' },
        priorities: [
          { es: 'Consolidar novedades por squad antes del corte.', en: 'Consolidate incidents by squad before cut-off.' },
          { es: 'Controlar equipos remotos y licencias de software.', en: 'Track remote equipment and software licenses.' },
          { es: 'Mantener beneficios competitivos para retención.', en: 'Keep competitive benefits for retention.' },
        ],
        checkpoints: [
          { label: { es: 'Equipos entregados a tiempo', en: 'Equipment delivered on time' }, value: '94%' },
          { label: { es: 'Satisfacción de onboarding', en: 'Onboarding satisfaction' }, value: '91%' },
        ],
      },
      offboarding: {
        title: { es: 'Retiro con análisis de retención', en: 'Offboarding with retention analysis' },
        description: { es: 'El retiro incluye exit interview, recuperación de equipos y análisis de causa raíz.', en: 'Offboarding includes exit interview, equipment recovery and root cause analysis.' },
        priorities: [
          { es: 'Revocar accesos a repos, cloud y herramientas el mismo día.', en: 'Revoke repo, cloud and tool access on the same day.' },
          { es: 'Recuperar laptop y periféricos con tracking.', en: 'Recover laptop and peripherals with tracking.' },
          { es: 'Documentar causa de salida para mejorar retención.', en: 'Document exit reason to improve retention.' },
        ],
        checkpoints: [
          { label: { es: 'Accesos revocados en SLA', en: 'Access revoked in SLA' }, value: '100%' },
          { label: { es: 'Equipos recuperados', en: 'Equipment recovered' }, value: '96%' },
        ],
      },
    },
  },
]

export function getCompanyProfile(companyId) {
  return companyProfiles.find((company) => company.id === companyId) || companyProfiles[0]
}
