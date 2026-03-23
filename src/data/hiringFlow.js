const baseSteps = [
  {
    id: 'vacancy',
    icon: 'work',
    title: { es: 'Vacante publicada', en: 'Published vacancy' },
    description: { es: 'El requerimiento se publica con UID, rango salarial, canales y formulario único.', en: 'The requisition goes live with UID, salary range, channels and a single intake form.' },
  },
  {
    id: 'capture',
    icon: 'person_add',
    title: { es: 'Postulación y registro', en: 'Application and intake' },
    description: { es: 'La persona deja sus datos, sube la hoja de vida y queda registrada con acceso temporal.', en: 'The candidate submits their data, uploads the resume and gets temporary access.' },
  },
  {
    id: 'selection',
    icon: 'fact_check',
    title: { es: 'Selección y entrevistas', en: 'Selection and interviews' },
    description: { es: 'La persona encargada valida perfil, revisa CV con IA y agenda entrevistas o pruebas.', en: 'The owner validates the profile, reviews the resume with AI and schedules interviews or tests.' },
  },
  {
    id: 'decision',
    icon: 'rule',
    title: { es: 'Resultado del proceso', en: 'Process outcome' },
    description: { es: 'Se define si pasó, sigue en revisión o se rechaza el proceso.', en: 'Define whether the candidate passed, remains under review or is rejected.' },
  },
  {
    id: 'files',
    icon: 'folder_managed',
    title: { es: 'Archivos y validación', en: 'Files and validation' },
    description: { es: 'Se reciben documentos, se valida cumplimiento y se crea el folder del proceso.', en: 'Documents are received, validated and turned into the process folder.' },
  },
  {
    id: 'contract',
    icon: 'event_available',
    title: { es: 'Contrato y firma', en: 'Contract and signature' },
    description: { es: 'Se genera el contrato, se envía al correo y se firma digitalmente en PDF.', en: 'The contract is generated, emailed and digitally signed as a PDF.' },
  },
  {
    id: 'activation',
    icon: 'badge',
    title: { es: 'Vinculación y entrega', en: 'Employee activation and handoff' },
    description: { es: 'La firma activa la ficha del empleado y deja listo el caso para administración.', en: 'The signed contract activates the employee record and prepares the handoff to administration.' },
  },
]

const baseLanes = [
  { id: 'vacante', stages: ['captura'], title: { es: 'Vacante y registro', en: 'Vacancy and intake' } },
  { id: 'seleccion', stages: ['revision', 'entrevista'], title: { es: 'Selección', en: 'Selection' } },
  { id: 'archivos', stages: ['contratacion'], title: { es: 'Archivos', en: 'Files' } },
  { id: 'vinculacion', stages: ['vinculado'], title: { es: 'Vinculación', en: 'Activation' } },
  { id: 'cerrados', stages: ['rechazado'], title: { es: 'No pasó', en: 'Not passed' } },
]

const statusOptions = [
  { value: 'en_revision', label: { es: 'En revisión', en: 'In review' } },
  { value: 'rechazado', label: { es: 'Rechazado', en: 'Rejected' } },
  { value: 'aprobado', label: { es: 'Aprobado', en: 'Approved' } },
]

const interviewModes = [
  { value: 'virtual', label: { es: 'Virtual', en: 'Virtual' } },
  { value: 'presencial', label: { es: 'Presencial', en: 'On site' } },
  { value: 'hibrida', label: { es: 'Híbrida', en: 'Hybrid' } },
]

const workspaceByCompany = {
  'health-enterprise': {
    title: { es: 'Vinculación clínica de candidatos', en: 'Clinical candidate onboarding' },
    subtitle: { es: 'Flujo completo desde postulación hasta vinculación para cargos asistenciales y administrativos críticos.', en: 'Full flow from application to onboarding for clinical and administrative critical roles.' },
    profileOptions: [
      { value: 'asistencial-senior', label: { es: 'Asistencial senior', en: 'Senior clinical' } },
      { value: 'apoyo-clinico', label: { es: 'Apoyo clínico', en: 'Clinical support' } },
      { value: 'administrativo', label: { es: 'Administrativo salud', en: 'Healthcare admin' } },
    ],
    handoffTemplate: [
      { id: 'employee-record', icon: 'badge', label: { es: 'Crear ficha del empleado', en: 'Create employee record' }, hint: { es: 'Crear código interno y ficha base.', en: 'Create internal code and base employee record.' } },
      { id: 'payroll-profile', icon: 'payments', label: { es: 'Configurar perfil de nómina', en: 'Set payroll profile' }, hint: { es: 'Enviar datos a nómina y parametrización.', en: 'Send data to payroll and initial setup.' } },
      { id: 'social-security', icon: 'health_and_safety', label: { es: 'Afiliaciones y seguridad social', en: 'Social security affiliations' }, hint: { es: 'EPS, pensión, ARL y soportes.', en: 'Health, pension, risk and support docs.' } },
      { id: 'equipment-request', icon: 'inventory_2', label: { es: 'Solicitar dotación / equipo', en: 'Request gear / equipment' }, hint: { es: 'Abrir requerimiento para sede y rol.', en: 'Open request for site and role.' } },
      { id: 'induction-plan', icon: 'event_upcoming', label: { es: 'Programar inducción', en: 'Schedule induction' }, hint: { es: 'Inducción clínica, SST y jefe directo.', en: 'Clinical induction, HSE and line manager.' } },
    ],
    candidates: [
      {
        id: 'cand-health-1',
        name: 'Laura Torres',
        role: 'Enfermera jefe UCI',
        email: 'laura.torres@talento.co',
        phone: '+57 310 221 9974',
        source: 'LinkedIn',
        responsible: 'Camila Reyes',
        pipelineStage: 'revision',
        reviewStatus: 'en_revision',
        profileType: 'asistencial-senior',
        notes: 'Buen ajuste para sede norte. Pendiente validar disponibilidad para turno nocturno.',
        interview: {
          date: '',
          time: '',
          mode: 'virtual',
          host: 'Sara Gómez',
          emailSent: false,
        },
        resume: {
          fileName: 'CV_Laura_Torres.pdf',
          pages: 4,
          score: 93,
          summary: 'Perfil con 8 años de experiencia en UCI, liderazgo de turnos y manejo de indicadores de seguridad del paciente.',
          recommendedProfile: 'Asistencial senior con foco UCI y urgencias',
          strengths: [
            'Experiencia comprobada en UCI y coordinación de equipo clínico.',
            'Certificaciones vigentes y rotación reciente en entornos de alta complejidad.',
            'Buen ajuste para sede de alta presión operativa.',
          ],
          alerts: [
            'Validar disponibilidad de fines de semana y esquema nocturno.',
            'Confirmar fecha de retiro en empresa actual.',
          ],
          extractedData: [
            { label: 'Experiencia', value: '8 años en UCI y urgencias' },
            { label: 'Último cargo', value: 'Enfermera jefe UCI' },
            { label: 'Disponibilidad', value: '15 días' },
            { label: 'Ubicación', value: 'Bogotá' },
          ],
        },
        documents: {
          uploads: ['CV_Laura_Torres.pdf'],
          required: [
            { id: 'cv', label: 'Hoja de vida actualizada', received: true, valid: true },
            { id: 'id', label: 'Cédula ampliada', received: false, valid: false },
            { id: 'license', label: 'Soporte profesional / RETHUS', received: false, valid: false },
            { id: 'eps', label: 'Soporte EPS y pensión', received: false, valid: false },
          ],
        },
        folder: {
          created: false,
          code: '',
          path: '',
        },
        handoff: {
          employeeCode: '',
          deliveredToAdministration: false,
          tasks: {
            'employee-record': false,
            'payroll-profile': false,
            'social-security': false,
            'equipment-request': false,
            'induction-plan': false,
          },
        },
        timeline: [
          { id: 't1', time: '13 Mar · 08:15', title: 'Registro inicial', detail: 'La candidata completó formulario y dejó correo / teléfono.' },
          { id: 't2', time: '13 Mar · 08:40', title: 'Asignación', detail: 'Camila Reyes quedó responsable de revisar el perfil.' },
        ],
      },
      {
        id: 'cand-health-2',
        name: 'Daniela Pérez',
        role: 'Bacterióloga clínica',
        email: 'daniela.perez@laboral.co',
        phone: '+57 315 440 7801',
        source: 'Computrabajo',
        responsible: 'Camila Reyes',
        pipelineStage: 'entrevista',
        reviewStatus: 'aprobado',
        profileType: 'apoyo-clinico',
        notes: 'Ya pasó screening y requiere entrevista técnica con laboratorio.',
        interview: {
          date: '2026-03-16',
          time: '10:30',
          mode: 'presencial',
          host: 'Andrés Mejía',
          emailSent: true,
        },
        resume: {
          fileName: 'HV_Daniela_Perez.pdf',
          pages: 3,
          score: 88,
          summary: 'Experiencia en laboratorio clínico, procesamiento de muestras y control de calidad interno.',
          recommendedProfile: 'Apoyo clínico para laboratorio central',
          strengths: [
            'Buena permanencia laboral y continuidad en laboratorio.',
            'Experiencia reciente en toma y procesamiento de muestras.',
          ],
          alerts: [
            'Confirmar disponibilidad para sede sur.',
          ],
          extractedData: [
            { label: 'Experiencia', value: '5 años en laboratorio' },
            { label: 'Último cargo', value: 'Bacterióloga clínica' },
            { label: 'Ubicación', value: 'Soacha' },
          ],
        },
        documents: {
          uploads: ['HV_Daniela_Perez.pdf', 'Cedula_Daniela.pdf'],
          required: [
            { id: 'cv', label: 'Hoja de vida actualizada', received: true, valid: true },
            { id: 'id', label: 'Cédula ampliada', received: true, valid: true },
            { id: 'license', label: 'Soporte profesional / tarjeta', received: false, valid: false },
            { id: 'eps', label: 'Soporte EPS y pensión', received: false, valid: false },
          ],
        },
        folder: {
          created: false,
          code: '',
          path: '',
        },
        handoff: {
          employeeCode: '',
          deliveredToAdministration: false,
          tasks: {
            'employee-record': false,
            'payroll-profile': false,
            'social-security': false,
            'equipment-request': false,
            'induction-plan': false,
          },
        },
        timeline: [
          { id: 't1', time: '12 Mar · 15:00', title: 'Preselección aprobada', detail: 'Se validó experiencia específica para laboratorio clínico.' },
          { id: 't2', time: '13 Mar · 09:10', title: 'Sesión agendada', detail: 'Entrevista técnica enviada por correo a la candidata.' },
        ],
      },
      {
        id: 'cand-health-3',
        name: 'Mauricio León',
        role: 'Auxiliar admisiones',
        email: 'mauricio.leon@empleo.co',
        phone: '+57 316 884 2200',
        source: 'Magneto',
        responsible: 'Valentina Cruz',
        pipelineStage: 'contratacion',
        reviewStatus: 'aprobado',
        profileType: 'administrativo',
        notes: 'Aprobado por el líder. Ya inició recepción de documentos.',
        interview: {
          date: '2026-03-14',
          time: '15:00',
          mode: 'virtual',
          host: 'Valentina Cruz',
          emailSent: true,
        },
        resume: {
          fileName: 'CV_Mauricio_Leon.pdf',
          pages: 2,
          score: 84,
          summary: 'Perfil administrativo con experiencia en admisiones, caja y atención al usuario en IPS.',
          recommendedProfile: 'Administrativo salud con alta orientación al servicio',
          strengths: [
            'Buen ajuste con atención al usuario.',
            'Experiencia previa en admisiones y autorizaciones.',
          ],
          alerts: [
            'Verificar referencias finales.',
          ],
          extractedData: [
            { label: 'Experiencia', value: '4 años en admisiones' },
            { label: 'Último cargo', value: 'Auxiliar admisiones' },
            { label: 'Ubicación', value: 'Bogotá' },
          ],
        },
        documents: {
          uploads: ['CV_Mauricio_Leon.pdf', 'Cedula_Mauricio.pdf', 'EPS_Mauricio.pdf'],
          required: [
            { id: 'cv', label: 'Hoja de vida actualizada', received: true, valid: true },
            { id: 'id', label: 'Cédula ampliada', received: true, valid: true },
            { id: 'eps', label: 'Soporte EPS y pensión', received: true, valid: true },
            { id: 'background', label: 'Antecedentes y referencias', received: true, valid: true },
          ],
        },
        folder: {
          created: true,
          code: 'VINC-CLH-032',
          path: '/talento/clinica-horizonte/vinculacion/mauricio-leon',
        },
        handoff: {
          employeeCode: 'EMP-CLH-2031',
          deliveredToAdministration: false,
          tasks: {
            'employee-record': true,
            'payroll-profile': false,
            'social-security': false,
            'equipment-request': true,
            'induction-plan': false,
          },
        },
        timeline: [
          { id: 't1', time: '11 Mar · 11:45', title: 'Entrevista aprobada', detail: 'El líder del área confirmó ajuste al cargo.' },
          { id: 't2', time: '12 Mar · 17:00', title: 'Documentos recibidos', detail: 'Expediente documental completo y validado.' },
          { id: 't3', time: '13 Mar · 09:30', title: 'Folder creado', detail: 'Se generó el folder de vinculación y quedó listo para ingreso.' },
        ],
      },
    ],
  },
  'tech-scaleup': {
    title: { es: 'Hiring studio para equipos híbridos', en: 'Hiring studio for hybrid teams' },
    subtitle: { es: 'Secuencia digital desde aplicación, revisión con IA, entrevista y vinculación remota.', en: 'Digital sequence from application, AI review, interview and remote onboarding.' },
    profileOptions: [
      { value: 'tech-senior', label: { es: 'Tech senior', en: 'Senior tech' } },
      { value: 'product-ops', label: { es: 'Product / Ops', en: 'Product / Ops' } },
      { value: 'people', label: { es: 'People team', en: 'People team' } },
    ],
    handoffTemplate: [
      { id: 'employee-record', icon: 'badge', label: { es: 'Crear ficha del colaborador', en: 'Create employee record' }, hint: { es: 'Asignar employee id y owner del proceso.', en: 'Assign employee id and process owner.' } },
      { id: 'payroll-profile', icon: 'payments', label: { es: 'Alta de nómina y beneficios', en: 'Enable payroll and benefits' }, hint: { es: 'Compensación, beneficios y datos bancarios.', en: 'Compensation, perks and banking data.' } },
      { id: 'accounts-access', icon: 'admin_panel_settings', label: { es: 'Crear cuentas y accesos', en: 'Create accounts and access' }, hint: { es: 'Correo, suite, repos y herramientas.', en: 'Email, suite, repos and tools.' } },
      { id: 'equipment-shipment', icon: 'laptop_mac', label: { es: 'Despachar equipo', en: 'Ship equipment' }, hint: { es: 'Laptop, accesorios y tracking remoto.', en: 'Laptop, accessories and remote tracking.' } },
      { id: 'welcome-plan', icon: 'waving_hand', label: { es: 'Programar welcome plan', en: 'Schedule welcome plan' }, hint: { es: 'Onboarding, buddy y sesiones iniciales.', en: 'Onboarding, buddy and first sessions.' } },
    ],
    candidates: [
      {
        id: 'cand-tech-1',
        name: 'Sebastián Mora',
        role: 'Frontend Engineer',
        email: 'sebastian.mora@candidate.dev',
        phone: '+57 301 922 2100',
        source: 'LinkedIn',
        responsible: 'Paula Téllez',
        pipelineStage: 'revision',
        reviewStatus: 'en_revision',
        profileType: 'tech-senior',
        notes: 'Buen ajuste técnico. Falta definir seniority final y expectativa salarial.',
        interview: {
          date: '',
          time: '',
          mode: 'virtual',
          host: 'Juan Felipe',
          emailSent: false,
        },
        resume: {
          fileName: 'CV_Sebastian_Mora.pdf',
          pages: 5,
          score: 91,
          summary: 'Experiencia en React, diseño de sistemas frontend y ownership de módulos de producto.',
          recommendedProfile: 'Tech senior para squad core',
          strengths: ['Experiencia fuerte en React y diseño de sistemas.', 'Ha liderado releases y adopción de buenas prácticas.'],
          alerts: ['Validar nivel de inglés conversacional.', 'Alinear rango salarial final.'],
          extractedData: [
            { label: 'Experiencia', value: '7 años en frontend' },
            { label: 'Último cargo', value: 'Senior Frontend Engineer' },
          ],
        },
        documents: {
          uploads: ['CV_Sebastian_Mora.pdf'],
          required: [
            { id: 'cv', label: 'Hoja de vida actualizada', received: true, valid: true },
            { id: 'id', label: 'Documento identidad', received: false, valid: false },
            { id: 'bank', label: 'Certificación bancaria', received: false, valid: false },
            { id: 'contract', label: 'Soporte contractual previo', received: false, valid: false },
          ],
        },
        folder: { created: false, code: '', path: '' },
        handoff: {
          employeeCode: '',
          deliveredToAdministration: false,
          tasks: {
            'employee-record': false,
            'payroll-profile': false,
            'accounts-access': false,
            'equipment-shipment': false,
            'welcome-plan': false,
          },
        },
        timeline: [
          { id: 't1', time: '13 Mar · 09:00', title: 'Aplicación registrada', detail: 'Candidato ingresó por LinkedIn y completó datos.' },
          { id: 't2', time: '13 Mar · 09:20', title: 'CV procesada con IA', detail: 'Se extrajeron seniority, stack y señales de liderazgo.' },
        ],
      },
      {
        id: 'cand-tech-2',
        name: 'Natalia Acosta',
        role: 'People Operations Specialist',
        email: 'natalia.acosta@career.co',
        phone: '+57 313 551 1200',
        source: 'Referido',
        responsible: 'Paula Téllez',
        pipelineStage: 'contratacion',
        reviewStatus: 'aprobado',
        profileType: 'people',
        notes: 'Oferta aceptada. En etapa de documentación y creación de expediente.',
        interview: {
          date: '2026-03-14',
          time: '14:00',
          mode: 'virtual',
          host: 'Paula Téllez',
          emailSent: true,
        },
        resume: {
          fileName: 'HV_Natalia_Acosta.pdf',
          pages: 3,
          score: 90,
          summary: 'Experiencia en People Ops, onboarding digital, compensación básica y soporte a líderes.',
          recommendedProfile: 'People team para crecimiento y onboarding',
          strengths: ['Ha montado procesos de onboarding.', 'Buen ajuste a entornos híbridos y crecimiento.'],
          alerts: ['Confirmar disponibilidad para hubs presenciales 2 veces al mes.'],
          extractedData: [
            { label: 'Experiencia', value: '5 años en People Ops' },
            { label: 'Último cargo', value: 'People Operations Specialist' },
          ],
        },
        documents: {
          uploads: ['HV_Natalia_Acosta.pdf', 'Cedula_Natalia.pdf', 'Banco_Natalia.pdf'],
          required: [
            { id: 'cv', label: 'Hoja de vida actualizada', received: true, valid: true },
            { id: 'id', label: 'Documento identidad', received: true, valid: true },
            { id: 'bank', label: 'Certificación bancaria', received: true, valid: true },
            { id: 'contract', label: 'Documentos contractuales', received: true, valid: true },
          ],
        },
        folder: {
          created: true,
          code: 'VINC-FTL-118',
          path: '/people/fintia/vinculacion/natalia-acosta',
        },
        handoff: {
          employeeCode: 'EMP-FTL-118',
          deliveredToAdministration: false,
          tasks: {
            'employee-record': true,
            'payroll-profile': true,
            'accounts-access': false,
            'equipment-shipment': true,
            'welcome-plan': false,
          },
        },
        timeline: [
          { id: 't1', time: '11 Mar · 18:20', title: 'Oferta aceptada', detail: 'La candidata confirmó ingreso y fecha de inicio.' },
          { id: 't2', time: '12 Mar · 10:15', title: 'Documentos aprobados', detail: 'Todos los soportes cumplen para vinculación.' },
        ],
      },
    ],
  },
}

export function getHiringWorkspace(companyId) {
  return {
    steps: baseSteps,
    lanes: baseLanes,
    statusOptions,
    interviewModes,
    ...(workspaceByCompany[companyId] || workspaceByCompany['health-enterprise']),
  }
}
