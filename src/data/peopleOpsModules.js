const t = (es, en) => ({ es, en })

function ownerName(person, fallback) {
  return person?.name || fallback
}

function assetLabel(asset, fallback) {
  if (!asset) return fallback
  return `${asset.brand || ''} ${asset.model || ''}`.trim() || fallback
}

export function buildPeopleOpsModules({
  employees = [],
  inventoryAssets = [],
  vacancies = [],
  contracts = [],
  departments = [],
} = {}) {
  const [hrLead, payrollLead, employeeA, employeeB, employeeC, employeeD] = employees
  const assignedAsset = inventoryAssets.find((item) => item.status === 'assigned')
  const availableAsset = inventoryAssets.find((item) => item.status === 'warehouse')
  const openVacancy = vacancies.find((item) => item.status === 'open') || vacancies[0]
  const pendingContract = contracts.find((item) => item.status !== 'signed') || contracts[0]
  const techDept = departments.find((item) => item.id === 'tech')
  const careDept = departments.find((item) => item.id === 'care')
  const opsDept = departments.find((item) => item.id === 'ops')

  return {
    'employee-files': {
      key: 'employee-files',
      stage: 'hiring',
      icon: 'folder_managed',
      eyebrow: t('Backoffice documental', 'Document back office'),
      title: t('Expediente digital del colaborador', 'Employee digital file'),
      description: t(
        'Centraliza documentos, firmas, vencimientos y evidencia legal desde el proceso de vinculacion hasta el retiro.',
        'Centralize documents, signatures, expirations and legal evidence from hiring through offboarding.'
      ),
      promise: t(
        'Todo lo que RH necesita para auditar, renovar o entregar un expediente sin buscar entre carpetas sueltas.',
        'Everything HR needs to audit, renew or hand over a file without searching across loose folders.'
      ),
      stats: [
        { id: 'files-open', label: t('Expedientes abiertos', 'Open files'), metric: 'open_queue', icon: 'folder_open', tone: 'warning', change: t('Pendientes con accion hoy', 'Need action today') },
        { id: 'files-progress', label: t('En validacion', 'In validation'), metric: 'in_progress_queue', icon: 'manage_search', tone: 'accent', change: t('Validaciones activas', 'Active reviews') },
        { id: 'files-rules', label: t('Automatizaciones', 'Automations'), metric: 'enabled_automations', icon: 'smart_toy', tone: 'primary', change: t('Reglas encendidas', 'Rules enabled') },
        { id: 'files-risk', label: t('Alertas documentales', 'Document alerts'), metric: 'risk_count', icon: 'warning', tone: 'danger', change: t('Riesgos de vencimiento', 'Expiry risks') },
      ],
      queue: [
        {
          id: 'file-1',
          title: t(`Completar expediente de ${ownerName(employeeA, 'Mauricio Leon')}`, `Complete file for ${ownerName(employeeA, 'Mauricio Leon')}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 17:00',
          status: 'pending',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('2 documentos faltantes', '2 missing documents'),
          detail: t('Cedula ampliada, habeas data y soporte de afiliacion pendientes por cargar.', 'ID copy, data consent and enrollment proof still missing.'),
        },
        {
          id: 'file-2',
          title: t(`Verificar firma de contrato de ${ownerName(employeeB, 'Daniela Munoz')}`, `Verify contract signature for ${ownerName(employeeB, 'Daniela Munoz')}`),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Manana · 09:30',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Contrato enviado', 'Contract sent'),
          detail: t('El contrato ya fue emitido y solo falta confirmar sello de firma digital.', 'The contract has been issued and only needs digital signature confirmation.'),
        },
        {
          id: 'file-3',
          title: t('Crear carpeta maestra de retiro y paz y salvo', 'Create offboarding master folder and clearance pack'),
          owner: ownerName(employeeD, 'Daniela Munoz'),
          due: 'Viernes · 14:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Salida voluntaria', 'Voluntary exit'),
          detail: t('Compilar acta de salida, paz y salvo de activos y soporte de liquidacion.', 'Compile exit minute, asset clearance and settlement support.'),
        },
      ],
      automations: [
        {
          id: 'file-auto-1',
          name: t('Check de vencimientos documentales', 'Document expiration monitoring'),
          trigger: t('Cuando un documento vence en menos de 30 dias', 'When a document expires in under 30 days'),
          outcome: t('Crea tarea, notifica al lider y marca el expediente en riesgo.', 'Creates a task, notifies the manager and flags the file at risk.'),
          enabled: true,
          coverage: '91%',
        },
        {
          id: 'file-auto-2',
          name: t('Folder automatico por nueva vinculacion', 'Automatic folder on new hire'),
          trigger: t('Cuando el candidato pasa a contrato', 'When a candidate moves to contract'),
          outcome: t('Abre estructura documental, checklist legal y responsable por area.', 'Opens document structure, legal checklist and area owners.'),
          enabled: true,
          coverage: '100%',
        },
        {
          id: 'file-auto-3',
          name: t('Seguimiento de firmas pendientes', 'Pending signature follow-up'),
          trigger: t('48 horas sin firma del colaborador', '48 hours without employee signature'),
          outcome: t('Envia recordatorio y escala a coordinacion.', 'Sends reminder and escalates to coordination.'),
          enabled: false,
          coverage: '0%',
        },
      ],
      templates: [
        {
          id: 'file-template-1',
          icon: 'description',
          title: t('Pack juridico de ingreso', 'Hiring legal pack'),
          description: t('Contrato, autorizaciones, tratamiento de datos y formato de confidencialidad.', 'Contract, authorizations, data processing and confidentiality form.'),
          metric: t('8 documentos base', '8 base documents'),
        },
        {
          id: 'file-template-2',
          icon: 'folder_zip',
          title: t('Checklist expediente 360', '360 file checklist'),
          description: t('Documento unico para saber si el expediente esta completo por frente legal, medico y operativo.', 'Single document to know whether the file is complete across legal, medical and operational fronts.'),
          metric: t('RH + SST + IT', 'HR + HSE + IT'),
        },
        {
          id: 'file-template-3',
          icon: 'history_edu',
          title: t('Paquete de retiro', 'Offboarding bundle'),
          description: t('Acta de entrega, paz y salvo, revocacion de accesos y carta final.', 'Handover minute, clearance, access revocation and final letter.'),
          metric: t('Cierre en 1 envio', 'Close in 1 package'),
        },
      ],
      risks: [
        {
          id: 'file-risk-1',
          severity: 'critical',
          title: t('Tres contratos siguen sin firma despues de 72 horas', 'Three contracts remain unsigned after 72 hours'),
          detail: t('Impacta fecha de ingreso y aprovisionamiento del nuevo colaborador.', 'This impacts start date and employee provisioning.'),
        },
        {
          id: 'file-risk-2',
          severity: 'warning',
          title: t('Examen medico ocupacional de seguimiento proximo a vencer', 'Occupational medical follow-up exam close to expiration'),
          detail: t(`Caso asociado a ${ownerName(employeeC, 'Mauricio Leon')}.`, `Case linked to ${ownerName(employeeC, 'Mauricio Leon')}.`),
        },
      ],
      cadence: [
        { id: 'file-cadence-1', slot: '08:00', icon: 'folder_shared', title: t('Barrido documental', 'Document sweep'), detail: t('Revisar vencimientos y pendientes de firma.', 'Review expirations and missing signatures.') },
        { id: 'file-cadence-2', slot: '11:30', icon: 'approval', title: t('Validacion legal', 'Legal validation'), detail: t('Liberar expedientes listos para contrato u onboarding.', 'Release files ready for contract or onboarding.') },
        { id: 'file-cadence-3', slot: '16:00', icon: 'archive', title: t('Cierre del dia', 'Day-end closure'), detail: t('Archivar soportes y dejar trazabilidad del caso.', 'Archive supports and leave case traceability.') },
      ],
    },
    'workflow-automation': {
      key: 'workflow-automation',
      stage: 'hiring',
      icon: 'account_tree',
      eyebrow: t('Orquestacion RH', 'HR orchestration'),
      title: t('Flujos y aprobaciones RH', 'HR workflows and approvals'),
      description: t(
        'Diseña reglas entre reclutamiento, aprobaciones de headcount, oferta, documentos, alta y retiro.',
        'Design rules across recruiting, headcount approvals, offer, documents, onboarding and offboarding.'
      ),
      promise: t(
        'Menos seguimiento manual y mas procesos con estado, SLA, escalamiento y responsables visibles.',
        'Less manual follow-up and more processes with visible state, SLA, escalation and owners.'
      ),
      stats: [
        { id: 'workflow-open', label: t('Flujos activos', 'Active flows'), metric: 'queue_total', icon: 'lan', tone: 'primary', change: t('En ejecucion hoy', 'Running today') },
        { id: 'workflow-progress', label: t('Esperando aprobacion', 'Awaiting approval'), metric: 'in_progress_queue', icon: 'approval', tone: 'accent', change: t('Con SLA corriendo', 'With active SLA') },
        { id: 'workflow-enabled', label: t('Reglas encendidas', 'Rules enabled'), metric: 'enabled_automations', icon: 'electric_bolt', tone: 'success', change: t('Automatizacion vigente', 'Automation running') },
        { id: 'workflow-risks', label: t('Bloqueos', 'Blockers'), metric: 'risk_count', icon: 'crisis_alert', tone: 'danger', change: t('Cuellos de botella', 'Bottlenecks') },
      ],
      queue: [
        {
          id: 'workflow-1',
          title: t(`Aprobar headcount para ${openVacancy?.title || 'Desarrollador Frontend'}`, `Approve headcount for ${openVacancy?.title || 'Frontend Developer'}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 15:30',
          status: 'pending',
          statusFlow: ['pending', 'review', 'approved'],
          chip: t('Requiere finanzas', 'Needs finance'),
          detail: t('El flujo detiene publicacion hasta confirmar cupo, banda y presupuesto.', 'The flow blocks publishing until headcount, band and budget are confirmed.'),
        },
        {
          id: 'workflow-2',
          title: t('Escalar oferta sin respuesta', 'Escalate unanswered offer'),
          owner: ownerName(employeeB, 'Daniela Munoz'),
          due: 'Hoy · 18:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('48 horas sin respuesta', '48 hours without response'),
          detail: t('Debe cambiar responsable y abrir seguimiento con el recruiter.', 'It must switch owner and open follow-up with the recruiter.'),
        },
        {
          id: 'workflow-3',
          title: t('Disparar flujo de retiro y revocacion', 'Trigger exit and revocation workflow'),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Viernes · 10:00',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Salida programada', 'Scheduled exit'),
          detail: t('Coordina paz y salvo, accesos, activos y liquidacion final.', 'Coordinates clearance, accesses, assets and final settlement.'),
        },
      ],
      automations: [
        { id: 'workflow-auto-1', name: t('SLA por etapa de vinculacion', 'Hiring stage SLA'), trigger: t('Cuando una aprobacion supera el tiempo objetivo', 'When an approval exceeds target time'), outcome: t('Escala automaticamente a coordinacion y gerencia.', 'Automatically escalates to coordination and management.'), enabled: true, coverage: '88%' },
        { id: 'workflow-auto-2', name: t('Puente contrato -> onboarding', 'Contract to onboarding bridge'), trigger: t('Firma digital confirmada', 'Digital signature confirmed'), outcome: t('Abre tareas de ingreso, accesos, dotacion y bienvenida.', 'Opens entry tasks, accesses, equipment and welcome plan.'), enabled: true, coverage: '100%' },
        { id: 'workflow-auto-3', name: t('Aprobaciones por banda salarial', 'Salary band approvals'), trigger: t('Oferta supera el rango recomendado', 'Offer exceeds recommended band'), outcome: t('Solicita doble validacion de HR y finanzas.', 'Requests dual validation from HR and finance.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'workflow-template-1', icon: 'schema', title: t('Flujo de headcount', 'Headcount workflow'), description: t('Solicitud, presupuesto, aprobacion y salida a vacante.', 'Request, budget, approval and move to vacancy.'), metric: t('4 pasos base', '4 base steps') },
        { id: 'workflow-template-2', icon: 'conversion_path', title: t('Embudo de candidato', 'Candidate funnel'), description: t('Revision, entrevistas, documentos, contrato y alta.', 'Review, interviews, documents, contract and activation.'), metric: t('Reclutamiento -> ingreso', 'Recruitment to hire') },
        { id: 'workflow-template-3', icon: 'logout', title: t('Flujo de retiro', 'Offboarding flow'), description: t('Notificacion, activos, accesos, liquidacion y cierre.', 'Notification, assets, accesses, settlement and closure.'), metric: t('Retiro sin huecos', 'Gap-free exit') },
      ],
      risks: [
        { id: 'workflow-risk-1', severity: 'warning', title: t('Dos solicitudes dependen de una aprobacion financiera', 'Two requests depend on financial approval'), detail: t('Si no avanza hoy, se corre la fecha de publicacion.', 'If it does not move today, publishing date will slip.') },
        { id: 'workflow-risk-2', severity: 'critical', title: t('No existe escalamiento automatico para ofertas premium', 'No automatic escalation for premium offers'), detail: t('Riesgo de fuga de talento por lentitud de validacion.', 'Risk of talent loss due to slow validation.') },
      ],
      cadence: [
        { id: 'workflow-cadence-1', slot: '09:00', icon: 'sync_alt', title: t('Revision de flujos trabados', 'Blocked flow review'), detail: t('Destrabar aprobaciones con mas de 24 horas.', 'Unblock approvals older than 24 hours.') },
        { id: 'workflow-cadence-2', slot: '13:30', icon: 'campaign', title: t('Salidas automaticas', 'Automation releases'), detail: t('Activar reglas y validar logs del dia.', 'Enable rules and validate the day logs.') },
        { id: 'workflow-cadence-3', slot: '17:30', icon: 'flag', title: t('Cierre SLA', 'SLA closure'), detail: t('Listar vencidos y escalamientos generados.', 'List overdue items and generated escalations.') },
      ],
    },
    'onboarding-ops': {
      key: 'onboarding-ops',
      stage: 'hiring',
      icon: 'how_to_reg',
      eyebrow: t('Preboarding + ingreso', 'Preboarding + go-live'),
      title: t('Preboarding y onboarding por tareas', 'Preboarding and onboarding tasks'),
      description: t(
        'Coordina tareas para RH, lider, TI, SST, compras y el propio colaborador con dependencias y fechas.',
        'Coordinate tasks for HR, managers, IT, HSE, procurement and the employee with dependencies and dates.'
      ),
      promise: t(
        'Cada ingreso avanza con checklist visible y nadie olvida dotacion, accesos, induccion o bienvenida.',
        'Every hire moves through a visible checklist so no one forgets equipment, access, induction or welcome.'
      ),
      stats: [
        { id: 'onboarding-open', label: t('Ingresos activos', 'Active onboardings'), metric: 'queue_total', icon: 'badge', tone: 'primary', change: t('Casos en curso', 'Cases in progress') },
        { id: 'onboarding-pending', label: t('Pendientes hoy', 'Pending today'), metric: 'open_queue', icon: 'assignment', tone: 'warning', change: t('Tareas por liberar', 'Tasks to release') },
        { id: 'onboarding-auto', label: t('Reglas prendidas', 'Rules enabled'), metric: 'enabled_automations', icon: 'auto_awesome', tone: 'success', change: t('Automatizaciones listas', 'Automations ready') },
        { id: 'onboarding-risk', label: t('Bloqueos', 'Blockers'), metric: 'risk_count', icon: 'priority_high', tone: 'danger', change: t('Dependencias criticas', 'Critical dependencies') },
      ],
      queue: [
        {
          id: 'onboarding-1',
          title: t(`Preparar primer dia de ${ownerName(employeeC, 'Mauricio Leon')}`, `Prepare day one for ${ownerName(employeeC, 'Mauricio Leon')}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 12:00',
          status: 'pending',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Bienvenida + agenda', 'Welcome + agenda'),
          detail: t('Confirmar agenda, buddy, induccion y correo de bienvenida.', 'Confirm agenda, buddy, induction and welcome email.'),
        },
        {
          id: 'onboarding-2',
          title: t(`Entregar ${assetLabel(assignedAsset, 'portatil')} y kit de trabajo`, `Deliver ${assetLabel(assignedAsset, 'laptop')} and work kit`),
          owner: techDept?.manager?.name || 'Juan Felipe',
          due: 'Manana · 08:30',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Inventario asignado', 'Inventory assigned'),
          detail: t('Solo falta subir foto de entrega y firma de recibido.', 'Only the delivery photo and signed receipt are missing.'),
        },
        {
          id: 'onboarding-3',
          title: t('Cierre de semana 1 y feedback del lider', 'Week one closure and manager feedback'),
          owner: careDept?.manager?.name || 'Daniela Munoz',
          due: 'Viernes · 16:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Seguimiento 7 dias', '7-day follow-up'),
          detail: t('Evaluar integracion, dudas operativas y entrenamiento pendiente.', 'Assess integration, operational questions and pending training.'),
        },
      ],
      automations: [
        { id: 'onboarding-auto-1', name: t('Checklist por area de ingreso', 'Area-based entry checklist'), trigger: t('Cuando el contrato queda firmado', 'When the contract is signed'), outcome: t('Crea tareas por RH, lider, TI, SST y compras.', 'Creates tasks for HR, manager, IT, HSE and procurement.'), enabled: true, coverage: '100%' },
        { id: 'onboarding-auto-2', name: t('Correo automatico de bienvenida', 'Automatic welcome email'), trigger: t('24 horas antes del ingreso', '24 hours before start date'), outcome: t('Envia agenda, mapa del primer dia y responsable de acompanamiento.', 'Sends agenda, day-one map and onboarding buddy.'), enabled: true, coverage: '95%' },
        { id: 'onboarding-auto-3', name: t('Encuesta 30-60-90', '30-60-90 survey'), trigger: t('Cumplimiento de hitos de ingreso', 'Completion of onboarding milestones'), outcome: t('Programa pulse checks para colaborador y lider.', 'Schedules pulse checks for employee and manager.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'onboarding-template-1', icon: 'task', title: t('Plan de primer dia', 'First-day plan'), description: t('Agenda, accesos, presentación, recorrido e induccion.', 'Agenda, accesses, introductions, walkthrough and induction.'), metric: t('1 click por ingreso', '1 click per hire') },
        { id: 'onboarding-template-2', icon: 'groups', title: t('Ruta por rol', 'Role-based route'), description: t('Tareas distintas para operativo, administrativo o tecnico.', 'Different tasks for operational, administrative or technical roles.'), metric: t('Segmentado por cargo', 'Segmented by role') },
        { id: 'onboarding-template-3', icon: 'checklist', title: t('Semana 1 y 30-60-90', 'Week one and 30-60-90'), description: t('Seguimiento inicial de adaptacion y productividad.', 'Initial adaptation and productivity follow-up.'), metric: t('Cierra periodo de prueba', 'Closes probation') },
      ],
      risks: [
        { id: 'onboarding-risk-1', severity: 'warning', title: t('Dos ingresos no tienen buddy asignado', 'Two hires do not have a buddy assigned'), detail: t('Puede afectar experiencia del primer dia.', 'This may affect the day-one experience.') },
        { id: 'onboarding-risk-2', severity: 'critical', title: t('No se ha confirmado entrega de equipo para manana', 'Equipment handover has not been confirmed for tomorrow'), detail: t('Riesgo de ingreso incompleto y baja productividad el primer dia.', 'Risk of incomplete onboarding and low day-one productivity.') },
      ],
      cadence: [
        { id: 'onboarding-cadence-1', slot: '08:30', icon: 'today', title: t('Control de ingresos del dia', 'Daily onboarding check'), detail: t('Validar tareas de bienvenida y documentos listos.', 'Validate welcome tasks and ready documents.') },
        { id: 'onboarding-cadence-2', slot: '12:30', icon: 'devices', title: t('Estado de accesos y dotacion', 'Access and equipment status'), detail: t('Revisar entregas de TI y compras.', 'Review IT and procurement deliveries.') },
        { id: 'onboarding-cadence-3', slot: '17:00', icon: 'feedback', title: t('Cierre de seguimiento', 'Follow-up closure'), detail: t('Registrar feedback del lider y del nuevo colaborador.', 'Record manager and new employee feedback.') },
      ],
    },
    'benefits-expenses': {
      key: 'benefits-expenses',
      stage: 'administration',
      icon: 'savings',
      eyebrow: t('Compensacion ampliada', 'Extended compensation'),
      title: t('Beneficios, viaticos y reembolsos', 'Benefits, travel expenses and reimbursements'),
      description: t(
        'Administra auxilios, beneficios flexibles, legalizacion de gastos y politicas internas por area o sede.',
        'Manage allowances, flexible benefits, expense legalization and internal policies by area or site.'
      ),
      promise: t(
        'RH y coordinacion pueden aprobar, rastrear soportes y ver el costo por colaborador sin hojas externas.',
        'HR and coordination can approve, track supports and view employee cost without external spreadsheets.'
      ),
      stats: [
        { id: 'benefits-pending', label: t('Legalizaciones pendientes', 'Pending settlements'), metric: 'open_queue', icon: 'receipt_long', tone: 'warning', change: t('Por revisar hoy', 'To review today') },
        { id: 'benefits-progress', label: t('En analisis', 'In analysis'), metric: 'in_progress_queue', icon: 'travel_explore', tone: 'accent', change: t('Casos activos', 'Active cases') },
        { id: 'benefits-auto', label: t('Reglas de politica', 'Policy rules'), metric: 'enabled_automations', icon: 'gpp_good', tone: 'success', change: t('Controles automaticos', 'Automatic controls') },
        { id: 'benefits-risk', label: t('Alertas de costo', 'Cost alerts'), metric: 'risk_count', icon: 'account_balance_wallet', tone: 'danger', change: t('Casos por desvio', 'Outlier cases') },
      ],
      queue: [
        {
          id: 'benefit-1',
          title: t(`Legalizar viaticos de ${ownerName(employeeB, 'Daniela Munoz')}`, `Settle travel expenses for ${ownerName(employeeB, 'Daniela Munoz')}`),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Hoy · 13:00',
          status: 'pending',
          statusFlow: ['pending', 'review', 'approved'],
          chip: t('3 soportes cargados', '3 receipts uploaded'),
          detail: t('Validar hotel, transporte local y politica de topes.', 'Validate hotel, local transport and policy limits.'),
        },
        {
          id: 'benefit-2',
          title: t('Aprobar beneficio flexible de bienestar', 'Approve wellness flexible benefit'),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Manana · 11:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'approved'],
          chip: t('Bolsa anual', 'Annual pool'),
          detail: t('El colaborador solicito usar saldo para certificacion medica.', 'The employee requested to use balance for a medical certification.'),
        },
        {
          id: 'benefit-3',
          title: t('Actualizar politica de kilometraje', 'Update mileage policy'),
          owner: opsDept?.manager?.name || 'Andres Mejia',
          due: 'Viernes · 09:00',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Version 2026', '2026 version'),
          detail: t('Ajustar topes para equipos que viajan entre sedes.', 'Adjust limits for teams traveling across sites.'),
        },
      ],
      automations: [
        { id: 'benefit-auto-1', name: t('Topes automaticos por politica', 'Automatic policy thresholds'), trigger: t('Cuando un gasto supera el monto permitido', 'When an expense exceeds the allowed threshold'), outcome: t('Bloquea aprobacion directa y solicita justificacion.', 'Blocks direct approval and requests justification.'), enabled: true, coverage: '92%' },
        { id: 'benefit-auto-2', name: t('Conciliacion de soportes', 'Receipt reconciliation'), trigger: t('Se cargan soportes sin categoria o sin centro de costo', 'Receipts are uploaded without category or cost center'), outcome: t('Devuelve al colaborador con checklist de correccion.', 'Returns to the employee with a correction checklist.'), enabled: true, coverage: '85%' },
        { id: 'benefit-auto-3', name: t('Renovacion de bolsa de beneficios', 'Benefit wallet renewal'), trigger: t('Inicio de mes o cambio de politica', 'Month start or policy change'), outcome: t('Actualiza saldo y comunica cambios por rol.', 'Updates balance and communicates changes by role.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'benefit-template-1', icon: 'credit_card', title: t('Catalogo de beneficios', 'Benefits catalog'), description: t('Visualizar beneficios fijos, flexibles y por convenio.', 'View fixed, flexible and agreement-based benefits.'), metric: t('Por sede y nivel', 'By site and level') },
        { id: 'benefit-template-2', icon: 'request_quote', title: t('Formato de legalizacion', 'Expense settlement format'), description: t('Adjuntos, centro de costo, aprobador y observaciones.', 'Attachments, cost center, approver and observations.'), metric: t('Reduce reprocesos', 'Reduces rework') },
        { id: 'benefit-template-3', icon: 'analytics', title: t('Costo por colaborador', 'Cost by employee'), description: t('Tablero de impacto por persona, area o politica.', 'Impact dashboard by employee, area or policy.'), metric: t('Vista mensual', 'Monthly view') },
      ],
      risks: [
        { id: 'benefit-risk-1', severity: 'warning', title: t('Un reembolso supera el tope de politica', 'One reimbursement exceeds the policy threshold'), detail: t('Requiere excepcion antes de cerrar la nomina.', 'Requires exception before payroll closes.') },
        { id: 'benefit-risk-2', severity: 'warning', title: t('Faltan dos soportes fiscales por clasificar', 'Two fiscal receipts still need classification'), detail: t('Podria impactar centro de costo y cierres internos.', 'It may impact cost center tracking and internal closing.') },
      ],
      cadence: [
        { id: 'benefit-cadence-1', slot: '09:30', icon: 'payments', title: t('Revision diaria de legalizaciones', 'Daily settlement review'), detail: t('Separar aprobables, devueltos y excepciones.', 'Separate approvable, returned and exception cases.') },
        { id: 'benefit-cadence-2', slot: '14:00', icon: 'policy', title: t('Control de politica', 'Policy control'), detail: t('Medir desviaciones y patrones de gasto.', 'Measure deviations and spending patterns.') },
        { id: 'benefit-cadence-3', slot: '17:15', icon: 'mail', title: t('Cierre y notificaciones', 'Closure and notifications'), detail: t('Enviar estados a lideres y colaboradores.', 'Send statuses to managers and employees.') },
      ],
    },
    'compliance-sst': {
      key: 'compliance-sst',
      stage: 'administration',
      icon: 'health_and_safety',
      eyebrow: t('Legal + SST', 'Legal + HSE'),
      title: t('SST y cumplimiento', 'HSE and compliance'),
      description: t(
        'Controla examenes medicos, cursos obligatorios, dotacion EPP, restricciones y cumplimiento por colaborador.',
        'Control medical exams, mandatory training, PPE deliveries, restrictions and compliance per employee.'
      ),
      promise: t(
        'Reduce riesgos operativos con alertas tempranas y trazabilidad visible para RH, lideres y SST.',
        'Reduce operational risks with early alerts and visible traceability for HR, managers and HSE.'
      ),
      stats: [
        { id: 'compliance-open', label: t('Casos abiertos', 'Open cases'), metric: 'open_queue', icon: 'shield_person', tone: 'warning', change: t('Pendientes regulatorios', 'Regulatory pending items') },
        { id: 'compliance-progress', label: t('Seguimientos', 'Follow-ups'), metric: 'in_progress_queue', icon: 'monitor_heart', tone: 'accent', change: t('Casos bajo control', 'Cases under control') },
        { id: 'compliance-auto', label: t('Controles activos', 'Active controls'), metric: 'enabled_automations', icon: 'verified_user', tone: 'success', change: t('Reglas de renovacion', 'Renewal rules') },
        { id: 'compliance-risk', label: t('Riesgos', 'Risks'), metric: 'risk_count', icon: 'emergency_home', tone: 'danger', change: t('Alerta de auditoria', 'Audit alert') },
      ],
      queue: [
        {
          id: 'compliance-1',
          title: t(`Programar examen ocupacional para ${ownerName(employeeD, 'Daniela Munoz')}`, `Schedule occupational exam for ${ownerName(employeeD, 'Daniela Munoz')}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 11:00',
          status: 'pending',
          statusFlow: ['pending', 'scheduled', 'done'],
          chip: t('Vence en 12 dias', 'Expires in 12 days'),
          detail: t('Renovacion obligatoria para mantener cobertura operativa.', 'Renewal is mandatory to keep operational coverage.'),
        },
        {
          id: 'compliance-2',
          title: t('Cerrar entrega de EPP en sede principal', 'Close PPE delivery at main site'),
          owner: opsDept?.manager?.name || 'Andres Mejia',
          due: 'Manana · 10:30',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('7 colaboradores', '7 employees'),
          detail: t('Falta firma de recibido y evidencia fotografica.', 'Signed receipt and photo evidence are still missing.'),
        },
        {
          id: 'compliance-3',
          title: t('Actualizar matriz de capacitacion obligatoria', 'Update mandatory training matrix'),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Viernes · 15:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Curso de trabajo seguro', 'Safe work course'),
          detail: t('Debe reflejar renovaciones para personal en campo y lideres.', 'It must reflect renewals for field staff and managers.'),
        },
      ],
      automations: [
        { id: 'compliance-auto-1', name: t('Alerta previa a vencimiento medico', 'Medical exam pre-expiry alert'), trigger: t('30, 15 y 7 dias antes del vencimiento', '30, 15 and 7 days before expiry'), outcome: t('Notifica a RH, lider y colaborador.', 'Notifies HR, manager and employee.'), enabled: true, coverage: '100%' },
        { id: 'compliance-auto-2', name: t('Bloqueo de alta sin SST minima', 'Go-live block without minimum HSE'), trigger: t('Onboarding sin curso o examen obligatorio', 'Onboarding without mandatory training or exam'), outcome: t('Impide cierre de ingreso y escala el caso.', 'Prevents hire closure and escalates the case.'), enabled: true, coverage: '93%' },
        { id: 'compliance-auto-3', name: t('Seguimiento a restricciones medicas', 'Medical restriction follow-up'), trigger: t('Carga de concepto medico con restriccion', 'Medical concept upload with restriction'), outcome: t('Abre seguimiento con lider, RH y SST.', 'Opens follow-up with manager, HR and HSE.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'compliance-template-1', icon: 'fact_check', title: t('Matriz legal', 'Legal matrix'), description: t('Mapa de examenes, cursos y evidencia obligatoria.', 'Map of mandatory exams, courses and evidence.'), metric: t('Auditoria lista', 'Audit ready') },
        { id: 'compliance-template-2', icon: 'medical_information', title: t('Ficha de seguimiento medico', 'Medical follow-up card'), description: t('Control de restricciones, seguimiento y aptitud laboral.', 'Restriction tracking, follow-up and work fitness.'), metric: t('Por colaborador', 'Per employee') },
        { id: 'compliance-template-3', icon: 'construction', title: t('Entrega de EPP y dotacion', 'PPE and equipment delivery'), description: t('Seriales, talla, fecha, evidencia y responsable.', 'Serials, size, date, evidence and owner.'), metric: t('Firma digital incluida', 'Digital sign-off included') },
      ],
      risks: [
        { id: 'compliance-risk-1', severity: 'critical', title: t('Hay personal activo con curso obligatorio vencido', 'There are active employees with expired mandatory training'), detail: t('Riesgo de auditoria y operacion en campo.', 'Risk for audits and field operations.') },
        { id: 'compliance-risk-2', severity: 'warning', title: t('La matriz de SST no esta alineada con nuevos cargos', 'The HSE matrix is not aligned with new roles'), detail: t('Puede dejar huecos de cumplimiento en vinculaciones nuevas.', 'This may leave compliance gaps for new hires.') },
      ],
      cadence: [
        { id: 'compliance-cadence-1', slot: '08:15', icon: 'warning', title: t('Panel de vencimientos', 'Expiry panel'), detail: t('Revisar proximos vencimientos y acciones urgentes.', 'Review upcoming expirations and urgent actions.') },
        { id: 'compliance-cadence-2', slot: '13:00', icon: 'school', title: t('Seguimiento de cursos', 'Training follow-up'), detail: t('Confirmar asistencia y renovaciones.', 'Confirm attendance and renewals.') },
        { id: 'compliance-cadence-3', slot: '16:45', icon: 'done_all', title: t('Cierre regulatorio', 'Regulatory closure'), detail: t('Actualizar evidencia y dejar comentarios del caso.', 'Update evidence and leave case comments.') },
      ],
    },
    'performance-probation': {
      key: 'performance-probation',
      stage: 'administration',
      icon: 'query_stats',
      eyebrow: t('30-60-90 + feedback', '30-60-90 + feedback'),
      title: t('Periodo de prueba y desempeno', 'Probation and performance'),
      description: t(
        'Gestiona objetivos, feedback inicial, pulses y decision de continuidad durante el ingreso y vida del colaborador.',
        'Manage goals, early feedback, pulses and continuation decisions during hiring ramp-up and employee lifecycle.'
      ),
      promise: t(
        'RH gana visibilidad sobre adaptacion, riesgo de desercion y desempeno temprano sin procesos dispersos.',
        'HR gains visibility into adaptation, attrition risk and early performance without scattered processes.'
      ),
      stats: [
        { id: 'performance-open', label: t('Evaluaciones activas', 'Active reviews'), metric: 'queue_total', icon: 'grading', tone: 'primary', change: t('Pulso del periodo de prueba', 'Probation pulse') },
        { id: 'performance-pending', label: t('Pendientes', 'Pending'), metric: 'open_queue', icon: 'pending_actions', tone: 'warning', change: t('Por cerrar esta semana', 'To close this week') },
        { id: 'performance-auto', label: t('Disparadores', 'Triggers'), metric: 'enabled_automations', icon: 'auto_graph', tone: 'success', change: t('Seguimiento automatico', 'Automatic follow-up') },
        { id: 'performance-risk', label: t('Riesgos de rotacion', 'Attrition risks'), metric: 'risk_count', icon: 'person_alert', tone: 'danger', change: t('Casos sensibles', 'Sensitive cases') },
      ],
      queue: [
        {
          id: 'performance-1',
          title: t(`Check 30 dias de ${ownerName(employeeC, 'Mauricio Leon')}`, `30-day check for ${ownerName(employeeC, 'Mauricio Leon')}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 16:00',
          status: 'pending',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Pulso RH + lider', 'HR + manager pulse'),
          detail: t('Revisar adaptacion al rol, acompanamiento y brechas iniciales.', 'Review role adaptation, support and early gaps.'),
        },
        {
          id: 'performance-2',
          title: t('Decision de continuidad de periodo de prueba', 'Probation continuation decision'),
          owner: ownerName(employeeB, 'Daniela Munoz'),
          due: 'Jueves · 12:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'approved'],
          chip: t('Comite de talento', 'Talent committee'),
          detail: t('Alinear feedback del lider, HR y resultados del primer mes.', 'Align manager feedback, HR view and first-month results.'),
        },
        {
          id: 'performance-3',
          title: t('Alinear metas 60-90 para equipo de servicio', 'Align 60-90 goals for service team'),
          owner: careDept?.manager?.name || 'Daniela Munoz',
          due: 'Viernes · 11:30',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('4 colaboradores', '4 employees'),
          detail: t('Crear metas con indicador, fecha y acompanamiento del lider.', 'Create goals with KPI, date and manager support.'),
        },
      ],
      automations: [
        { id: 'performance-auto-1', name: t('Recordatorios 30-60-90', '30-60-90 reminders'), trigger: t('Cumplimiento de hitos de antiguedad', 'Tenure milestones are reached'), outcome: t('Agenda feedback y tareas para lider y RH.', 'Schedules feedback and tasks for manager and HR.'), enabled: true, coverage: '100%' },
        { id: 'performance-auto-2', name: t('Pulso de riesgo de rotacion', 'Attrition risk pulse'), trigger: t('Baja participacion o feedback critico', 'Low participation or critical feedback'), outcome: t('Marca el caso, sugiere intervencion y escala a HRBP.', 'Flags the case, suggests intervention and escalates to HRBP.'), enabled: true, coverage: '82%' },
        { id: 'performance-auto-3', name: t('Liberacion automatica de objetivos', 'Automatic goal release'), trigger: t('Cambio de rol o cierre de onboarding', 'Role change or onboarding closure'), outcome: t('Publica metas base por cargo y seniority.', 'Publishes base goals by role and seniority.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'performance-template-1', icon: 'looks_one', title: t('Plantilla 30 dias', '30-day template'), description: t('Adaptacion, cultura, herramientas y support needed.', 'Adaptation, culture, tools and support needed.'), metric: t('Lider + RH', 'Manager + HR') },
        { id: 'performance-template-2', icon: 'target', title: t('Objetivos 60-90', '60-90 goals'), description: t('Objetivos por rol con evidencia y fecha de cierre.', 'Role-based goals with evidence and due date.'), metric: t('Por banda y cargo', 'By band and role') },
        { id: 'performance-template-3', icon: 'forum', title: t('Feedback de continuidad', 'Continuation feedback'), description: t('Decision de continuidad, extension o desvinculacion.', 'Continuation, extension or exit decision.'), metric: t('Cierra prueba', 'Closes probation') },
      ],
      risks: [
        { id: 'performance-risk-1', severity: 'warning', title: t('Dos lideres no han cargado feedback de su nuevo ingreso', 'Two managers have not uploaded feedback for their new hires'), detail: t('Riesgo de cerrar tarde el periodo de prueba.', 'Risk of closing probation late.') },
        { id: 'performance-risk-2', severity: 'critical', title: t('Un colaborador muestra baja adaptacion y sobrecarga', 'One employee shows low adaptation and overload'), detail: t('Se recomienda intervencion temprana de RH y lider.', 'Early intervention from HR and the manager is recommended.') },
      ],
      cadence: [
        { id: 'performance-cadence-1', slot: '09:00', icon: 'notifications_active', title: t('Hitos del dia', 'Daily milestones'), detail: t('Ver 30-60-90 que vencen en la semana.', 'See 30-60-90 items due this week.') },
        { id: 'performance-cadence-2', slot: '14:30', icon: 'co_present', title: t('Comite de seguimiento', 'Follow-up committee'), detail: t('Revisar casos en riesgo y decisiones de continuidad.', 'Review risk cases and continuation decisions.') },
        { id: 'performance-cadence-3', slot: '17:30', icon: 'track_changes', title: t('Actualizacion de metas', 'Goal update'), detail: t('Cerrar feedback y activar siguientes hitos.', 'Close feedback and activate next milestones.') },
      ],
    },
    'access-provisioning': {
      key: 'access-provisioning',
      stage: 'administration',
      icon: 'key_vertical',
      eyebrow: t('IT + seguridad', 'IT + security'),
      title: t('Accesos y provisionamiento', 'Access and provisioning'),
      description: t(
        'Gestiona correos, licencias, herramientas, roles, equipos y revocacion de accesos al ingreso o salida.',
        'Manage email, licenses, tools, roles, devices and access revocation on entry or exit.'
      ),
      promise: t(
        'Cada alta o retiro deja un rastro claro de quien activo, asigno o retiro accesos y activos.',
        'Every onboarding or exit leaves a clear trace of who activated, assigned or revoked accesses and assets.'
      ),
      stats: [
        { id: 'access-open', label: t('Provisionamientos', 'Provisioning jobs'), metric: 'queue_total', icon: 'workspace_premium', tone: 'primary', change: t('Altas y bajas activas', 'Active joins and exits') },
        { id: 'access-pending', label: t('Pendientes', 'Pending'), metric: 'open_queue', icon: 'key', tone: 'warning', change: t('Acciones por ejecutar', 'Actions to execute') },
        { id: 'access-auto', label: t('Flujos automaticos', 'Automatic flows'), metric: 'enabled_automations', icon: 'settings_suggest', tone: 'success', change: t('Provisioning rules', 'Provisioning rules') },
        { id: 'access-risk', label: t('Riesgos de seguridad', 'Security risks'), metric: 'risk_count', icon: 'shield_locked', tone: 'danger', change: t('Accesos sensibles', 'Sensitive access') },
      ],
      queue: [
        {
          id: 'access-1',
          title: t(`Crear correo, SSO y rol para ${ownerName(employeeA, 'Mauricio Leon')}`, `Create email, SSO and role for ${ownerName(employeeA, 'Mauricio Leon')}`),
          owner: techDept?.manager?.name || 'Juan Felipe',
          due: 'Hoy · 11:30',
          status: 'pending',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Ingreso manana', 'Starts tomorrow'),
          detail: t('Provisionar M365, Slack y modulo operativo segun cargo.', 'Provision M365, Slack and the operational module according to role.'),
        },
        {
          id: 'access-2',
          title: t(`Revocar accesos y recuperar ${assetLabel(availableAsset, 'equipo disponible')}`, `Revoke accesses and recover ${assetLabel(availableAsset, 'available device')}`),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Hoy · 18:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Retiro en curso', 'Exit in progress'),
          detail: t('Cerrar correo, VPN, CRM y confirmar paz y salvo de activos.', 'Close email, VPN, CRM and confirm asset clearance.'),
        },
        {
          id: 'access-3',
          title: t(`Asignar permisos de lider a ${ownerName(employeeB, 'Daniela Munoz')}`, `Assign manager permissions to ${ownerName(employeeB, 'Daniela Munoz')}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Viernes · 09:30',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Cambio de rol', 'Role change'),
          detail: t('Actualizar permisos, tableros y visibilidad de equipo.', 'Update permissions, dashboards and team visibility.'),
        },
      ],
      automations: [
        { id: 'access-auto-1', name: t('Provisioning por rol', 'Role-based provisioning'), trigger: t('Alta aprobada y fecha de ingreso confirmada', 'Approved hire and confirmed start date'), outcome: t('Crea usuarios, grupos, accesos y checklist de IT.', 'Creates users, groups, accesses and IT checklist.'), enabled: true, coverage: '96%' },
        { id: 'access-auto-2', name: t('Revocacion en retiro', 'Offboarding revocation'), trigger: t('Cambio de estado a retiro', 'Status changes to offboarding'), outcome: t('Genera revocacion, ticket IT y seguimiento de activos.', 'Generates revocation, IT ticket and asset follow-up.'), enabled: true, coverage: '100%' },
        { id: 'access-auto-3', name: t('Conciliacion usuario vs activo', 'User vs asset reconciliation'), trigger: t('Equipo sin custodio o licencias sin usuario', 'Device without custodian or licenses without user'), outcome: t('Marca inconsistencia y notifica a RH + IT.', 'Flags inconsistency and notifies HR + IT.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'access-template-1', icon: 'mail_lock', title: t('Paquete de alta', 'Joiner pack'), description: t('Correo, identidad, apps, grupos y equipo inicial.', 'Email, identity, apps, groups and starter device.'), metric: t('Por rol', 'By role') },
        { id: 'access-template-2', icon: 'shield', title: t('Matriz de accesos', 'Access matrix'), description: t('Permisos por cargo, lider y area.', 'Permissions by role, manager and area.'), metric: t('Evita sobreacceso', 'Prevents over-access') },
        { id: 'access-template-3', icon: 'devices_other', title: t('Paz y salvo digital', 'Digital clearance'), description: t('Activos, credenciales y confirmacion final del retiro.', 'Assets, credentials and final exit confirmation.'), metric: t('Cierra salida', 'Closes exit') },
      ],
      risks: [
        { id: 'access-risk-1', severity: 'critical', title: t('Existe una licencia premium sin custodio asignado', 'There is a premium license without an assigned owner'), detail: t('Puede implicar costo o acceso no controlado.', 'This may imply cost or uncontrolled access.') },
        { id: 'access-risk-2', severity: 'warning', title: t('Un retiro sigue con acceso a herramienta critica', 'One offboarded employee still has access to a critical tool'), detail: t('Requiere cierre inmediato del caso.', 'Immediate case closure is required.') },
      ],
      cadence: [
        { id: 'access-cadence-1', slot: '08:45', icon: 'person_add', title: t('Altas del dia', 'Daily joiners'), detail: t('Crear identidades y validar equipos asignados.', 'Create identities and validate assigned equipment.') },
        { id: 'access-cadence-2', slot: '13:15', icon: 'person_remove', title: t('Bajas y revocaciones', 'Offboardings and revocations'), detail: t('Cerrar accesos y confirmar paz y salvo.', 'Close accesses and confirm clearance.') },
        { id: 'access-cadence-3', slot: '17:45', icon: 'sync_problem', title: t('Conciliacion final', 'Final reconciliation'), detail: t('Cruzar accesos vs equipos vs estado del empleado.', 'Cross-check accesses vs devices vs employee status.') },
      ],
    },
    'hr-helpdesk': {
      key: 'hr-helpdesk',
      stage: 'administration',
      icon: 'support_agent',
      eyebrow: t('Autoservicio + casos', 'Self-service + cases'),
      title: t('Mesa de ayuda RH', 'HR helpdesk'),
      description: t(
        'Centraliza PQRS, certificados, cartas, actualizacion de datos, dudas de nomina y solicitudes internas de empleados.',
        'Centralize requests, certificates, letters, profile changes, payroll questions and internal employee cases.'
      ),
      promise: t(
        'RH ordena el volumen operativo con colas, SLA y base de conocimiento en vez de depender de correo y chat.',
        'HR organizes operational volume with queues, SLA and knowledge base instead of relying on email and chat.'
      ),
      stats: [
        { id: 'helpdesk-open', label: t('Tickets abiertos', 'Open tickets'), metric: 'open_queue', icon: 'mark_email_unread', tone: 'warning', change: t('Pendientes de respuesta', 'Awaiting response') },
        { id: 'helpdesk-progress', label: t('En gestion', 'In progress'), metric: 'in_progress_queue', icon: 'forum', tone: 'accent', change: t('Con agente asignado', 'With assigned agent') },
        { id: 'helpdesk-auto', label: t('Atajos automatizados', 'Automated shortcuts'), metric: 'enabled_automations', icon: 'smart_toy', tone: 'success', change: t('Respuestas y enrutamiento', 'Replies and routing') },
        { id: 'helpdesk-risk', label: t('SLA en riesgo', 'SLA at risk'), metric: 'risk_count', icon: 'timer_off', tone: 'danger', change: t('Casos sensibles', 'Sensitive cases') },
      ],
      queue: [
        {
          id: 'helpdesk-1',
          title: t('Generar certificacion laboral', 'Generate employment certificate'),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 10:00',
          status: 'pending',
          statusFlow: ['pending', 'in_progress', 'resolved'],
          chip: ownerName(employeeC, 'Mauricio Leon'),
          detail: t('El colaborador la necesita para tramite bancario y requiere firma digital.', 'The employee needs it for a bank process and requires digital signing.'),
        },
        {
          id: 'helpdesk-2',
          title: t('Ajustar datos de contacto del empleado', 'Update employee contact details'),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Hoy · 15:45',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'resolved'],
          chip: t('Portal empleado', 'Employee portal'),
          detail: t('Cambio de direccion y telefono con soporte adjunto.', 'Address and phone change with attached support.'),
        },
        {
          id: 'helpdesk-3',
          title: t('Resolver inquietud por desprendible y novedades', 'Resolve payslip and incident question'),
          owner: ownerName(employeeB, 'Daniela Munoz'),
          due: 'Jueves · 09:15',
          status: 'review',
          statusFlow: ['pending', 'review', 'resolved'],
          chip: t('Caso sensible', 'Sensitive case'),
          detail: t('El colaborador reporta diferencia entre horas extra aprobadas y pago recibido.', 'The employee reports a mismatch between approved overtime and paid amount.'),
        },
      ],
      automations: [
        { id: 'helpdesk-auto-1', name: t('Clasificacion automatica del caso', 'Automatic case classification'), trigger: t('Se crea ticket desde portal o correo', 'A ticket is created from the portal or email'), outcome: t('Asigna categoria, prioridad y responsable sugerido.', 'Assigns category, priority and suggested owner.'), enabled: true, coverage: '90%' },
        { id: 'helpdesk-auto-2', name: t('Base de conocimiento sugerida', 'Suggested knowledge base'), trigger: t('Caso repetitivo o pregunta frecuente', 'Repetitive case or frequent question'), outcome: t('Sugiere respuesta y articulo base antes de escalar.', 'Suggests a reply and base article before escalating.'), enabled: true, coverage: '78%' },
        { id: 'helpdesk-auto-3', name: t('Escalamiento por SLA', 'SLA escalation'), trigger: t('Tiempo sin respuesta de RH o lider', 'Time without response from HR or manager'), outcome: t('Marca el caso y avisa al coordinador.', 'Flags the case and notifies the coordinator.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'helpdesk-template-1', icon: 'article', title: t('Biblioteca de cartas', 'Letter library'), description: t('Certificacion laboral, carta salarial, vacaciones y constancias.', 'Employment, salary, vacation and general certificates.'), metric: t('Descarga inmediata', 'Immediate download') },
        { id: 'helpdesk-template-2', icon: 'help_center', title: t('FAQ operativa', 'Operational FAQ'), description: t('Respuestas listas para pagos, beneficios y portal.', 'Ready answers for payments, benefits and portal questions.'), metric: t('Menos friccion', 'Less friction') },
        { id: 'helpdesk-template-3', icon: 'person_edit', title: t('Cambio de datos personales', 'Personal data change'), description: t('Formato y validacion de soporte para actualizar ficha del empleado.', 'Format and support validation to update the employee profile.'), metric: t('Trazable', 'Traceable') },
      ],
      risks: [
        { id: 'helpdesk-risk-1', severity: 'warning', title: t('Hay tickets repetidos por certificados laborales', 'There are repeated tickets for employment certificates'), detail: t('Conviene moverlo a autoservicio completo.', 'It should be moved to full self-service.') },
        { id: 'helpdesk-risk-2', severity: 'warning', title: t('Dos casos de nomina estan a punto de incumplir SLA', 'Two payroll cases are about to miss SLA'), detail: t('Afecta experiencia del colaborador y confianza en RH.', 'This affects employee experience and trust in HR.') },
      ],
      cadence: [
        { id: 'helpdesk-cadence-1', slot: '08:00', icon: 'inbox', title: t('Triaging inicial', 'Initial triage'), detail: t('Clasificar tickets nuevos y definir prioridad.', 'Classify new tickets and define priority.') },
        { id: 'helpdesk-cadence-2', slot: '12:00', icon: 'quickreply', title: t('Respuesta rapida', 'Quick response'), detail: t('Resolver casos de certificado, datos y portal.', 'Resolve certificate, profile and portal cases.') },
        { id: 'helpdesk-cadence-3', slot: '17:00', icon: 'schedule_send', title: t('Control SLA', 'SLA control'), detail: t('Escalar y dejar siguiente accion comprometida.', 'Escalate and leave the next committed action.') },
      ],
    },
    'org-planning': {
      key: 'org-planning',
      stage: 'administration',
      icon: 'apartment',
      eyebrow: t('Estructura organizacional', 'Organization design'),
      title: t('Planeacion organizacional', 'Organizational planning'),
      description: t(
        'Administra headcount, bandas, sedes, centros de costo, estructura por area y capacidad del negocio.',
        'Manage headcount, salary bands, sites, cost centers, area structure and business capacity.'
      ),
      promise: t(
        'Da visibilidad a crecimiento, gaps de capacidad y decisiones de estructura antes de contratar.',
        'Provides visibility into growth, capacity gaps and structure decisions before hiring.'
      ),
      stats: [
        { id: 'org-open', label: t('Solicitudes de estructura', 'Structure requests'), metric: 'queue_total', icon: 'hub', tone: 'primary', change: t('Cambios en evaluacion', 'Changes under review') },
        { id: 'org-pending', label: t('Pendientes', 'Pending'), metric: 'open_queue', icon: 'group_work', tone: 'warning', change: t('Headcount por definir', 'Headcount to define') },
        { id: 'org-auto', label: t('Reglas activas', 'Active rules'), metric: 'enabled_automations', icon: 'rule', tone: 'success', change: t('Politicas de estructura', 'Structure policies') },
        { id: 'org-risk', label: t('Alertas de capacidad', 'Capacity alerts'), metric: 'risk_count', icon: 'query_builder', tone: 'danger', change: t('Riesgos organizacionales', 'Organizational risks') },
      ],
      queue: [
        {
          id: 'org-1',
          title: t(`Aprobar headcount extra para ${techDept?.name || 'Tecnologia'}`, `Approve additional headcount for ${techDept?.name || 'Technology'}`),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Hoy · 16:30',
          status: 'pending',
          statusFlow: ['pending', 'review', 'approved'],
          chip: t('2 cupos nuevos', '2 new openings'),
          detail: t('Necesario para cubrir backlog y soporte de producto.', 'Required to cover backlog and product support.'),
        },
        {
          id: 'org-2',
          title: t('Revisar banda salarial de coordinadores', 'Review coordinator salary band'),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Jueves · 10:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'done'],
          chip: t('Benchmark 2026', '2026 benchmark'),
          detail: t('Alinear banda, seniority y tope de oferta para nuevas vacantes.', 'Align band, seniority and offer cap for new vacancies.'),
        },
        {
          id: 'org-3',
          title: t(`Actualizar organigrama de ${careDept?.name || 'Servicio'}`, `Update org chart for ${careDept?.name || 'Service'}`),
          owner: careDept?.manager?.name || 'Daniela Munoz',
          due: 'Viernes · 14:00',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'done'],
          chip: t('Cambio de liderazgo', 'Leadership change'),
          detail: t('Reflejar nueva coordinacion y lineas de reporte.', 'Reflect new coordination and reporting lines.'),
        },
      ],
      automations: [
        { id: 'org-auto-1', name: t('Control de headcount vs presupuesto', 'Headcount vs budget control'), trigger: t('Nueva solicitud de cupo', 'New headcount request'), outcome: t('Cruza presupuesto, banda y centro de costo antes de aprobar.', 'Cross-checks budget, band and cost center before approval.'), enabled: true, coverage: '94%' },
        { id: 'org-auto-2', name: t('Publicacion de organigrama activo', 'Live org chart publishing'), trigger: t('Cambio de manager, area o sede', 'Manager, area or site change'), outcome: t('Actualiza la estructura visible para RH y liderazgo.', 'Updates the visible structure for HR and leadership.'), enabled: true, coverage: '86%' },
        { id: 'org-auto-3', name: t('Alertas de span of control', 'Span-of-control alerts'), trigger: t('Un lider supera o queda por debajo del rango sugerido', 'A manager exceeds or falls below the suggested range'), outcome: t('Marca riesgo de estructura y sugiere rediseno.', 'Flags structure risk and suggests redesign.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'org-template-1', icon: 'groups_3', title: t('Mapa de capacidad', 'Capacity map'), description: t('Vista por area, sede y lider para entender saturacion.', 'View by area, site and manager to understand saturation.'), metric: t('Listo para planeacion', 'Ready for planning') },
        { id: 'org-template-2', icon: 'attach_money', title: t('Bandas salariales', 'Salary bands'), description: t('Catalogo por cargo, seniority y limite de oferta.', 'Catalog by role, seniority and offer limit.'), metric: t('Apoya vacantes', 'Supports vacancies') },
        { id: 'org-template-3', icon: 'account_tree', title: t('Org chart editable', 'Editable org chart'), description: t('Cambios de lider, reasignaciones y vacios operativos.', 'Manager changes, reassignments and operational gaps.'), metric: t('Versionado', 'Versioned') },
      ],
      risks: [
        { id: 'org-risk-1', severity: 'warning', title: t('Tecnologia opera con carga superior al plan', 'Technology is operating above planned capacity'), detail: t('Puede impactar hiring y tiempos de entrega.', 'This may impact hiring and delivery times.') },
        { id: 'org-risk-2', severity: 'warning', title: t('Hay un centro de costo sin owner actualizado', 'There is a cost center without an updated owner'), detail: t('Afecta aprobaciones y trazabilidad de solicitudes.', 'This affects approvals and request traceability.') },
      ],
      cadence: [
        { id: 'org-cadence-1', slot: '09:45', icon: 'insights', title: t('Revision de capacidad', 'Capacity review'), detail: t('Medir carga por equipo y backlog asociado.', 'Measure load by team and related backlog.') },
        { id: 'org-cadence-2', slot: '14:15', icon: 'request_page', title: t('Comite de headcount', 'Headcount committee'), detail: t('Priorizar solicitudes nuevas y excepciones.', 'Prioritize new requests and exceptions.') },
        { id: 'org-cadence-3', slot: '17:10', icon: 'schema', title: t('Actualizacion estructural', 'Structural update'), detail: t('Publicar cambios aprobados en la semana.', 'Publish approved changes in the week.') },
      ],
    },
    integrations: {
      key: 'integrations',
      stage: 'platform',
      icon: 'integration_instructions',
      eyebrow: t('Conectividad e integraciones', 'Connectivity and integrations'),
      title: t('Integraciones y conectores', 'Integrations and connectors'),
      description: t(
        'Administra conexiones con firma digital, correo, calendarios, biometria, almacenamiento y herramientas externas.',
        'Manage connections with digital signature, email, calendars, biometrics, storage and external tools.'
      ),
      promise: t(
        'La operacion RH crece mejor cuando los puntos criticos ya estan listos para sincronizar y monitorear.',
        'HR operations scale better when critical touchpoints are already ready to sync and monitor.'
      ),
      stats: [
        { id: 'integrations-open', label: t('Conectores por activar', 'Connectors to activate'), metric: 'open_queue', icon: 'hub', tone: 'warning', change: t('Backlog tecnico', 'Technical backlog') },
        { id: 'integrations-progress', label: t('En implementacion', 'In implementation'), metric: 'in_progress_queue', icon: 'lan', tone: 'accent', change: t('Despliegues activos', 'Active rollouts') },
        { id: 'integrations-enabled', label: t('Conectores listos', 'Ready connectors'), metric: 'enabled_automations', icon: 'link', tone: 'success', change: t('Puntos sincronizados', 'Sync points live') },
        { id: 'integrations-risk', label: t('Alertas tecnicas', 'Technical alerts'), metric: 'risk_count', icon: 'sync_problem', tone: 'danger', change: t('Monitoreo pendiente', 'Pending monitoring') },
      ],
      queue: [
        {
          id: 'integration-1',
          title: t(`Conectar firma digital para ${pendingContract?.employeeName || 'contratos nuevos'}`, `Connect digital signing for ${pendingContract?.employeeName || 'new contracts'}`),
          owner: techDept?.manager?.name || 'Juan Felipe',
          due: 'Hoy · 18:00',
          status: 'pending',
          statusFlow: ['pending', 'in_progress', 'live'],
          chip: t('Contrato + anexos', 'Contract + annexes'),
          detail: t('Prioridad alta para cerrar contratacion sin descarga manual.', 'High priority to close hiring without manual downloads.'),
        },
        {
          id: 'integration-2',
          title: t('Sincronizar calendarios de entrevistas', 'Sync interview calendars'),
          owner: ownerName(hrLead, 'Camila Reyes'),
          due: 'Manana · 11:00',
          status: 'in_progress',
          statusFlow: ['pending', 'in_progress', 'live'],
          chip: t('Recruiting ops', 'Recruiting ops'),
          detail: t('Crear eventos automaticos y envio de invitaciones al candidato.', 'Create automatic events and send invites to the candidate.'),
        },
        {
          id: 'integration-3',
          title: t('Monitorear webhook de inventario y portal empleado', 'Monitor inventory and employee portal webhook'),
          owner: ownerName(payrollLead, 'Valentina Cruz'),
          due: 'Viernes · 13:00',
          status: 'review',
          statusFlow: ['pending', 'review', 'live'],
          chip: t('Salud de sincronizacion', 'Sync health'),
          detail: t('Validar que cambios de asignacion se reflejen en tiempo real.', 'Validate that assignment changes appear in real time.'),
        },
      ],
      automations: [
        { id: 'integration-auto-1', name: t('Conector de firma digital', 'Digital signature connector'), trigger: t('Contrato listo para firma', 'Contract is ready for signature'), outcome: t('Envia paquete, captura evidencia y devuelve estado.', 'Sends package, captures evidence and returns status.'), enabled: true, coverage: '74%' },
        { id: 'integration-auto-2', name: t('Correo y calendario', 'Email and calendar'), trigger: t('Agenda de entrevista o onboarding', 'Interview or onboarding schedule'), outcome: t('Crea invitaciones y recordatorios sin intervencion manual.', 'Creates invites and reminders without manual intervention.'), enabled: true, coverage: '81%' },
        { id: 'integration-auto-3', name: t('Storage documental', 'Document storage'), trigger: t('Se sube un documento o soporte nuevo', 'A new document or attachment is uploaded'), outcome: t('Sincroniza carpeta externa y versiona evidencia.', 'Syncs external folder and versions the evidence.'), enabled: false, coverage: '0%' },
      ],
      templates: [
        { id: 'integration-template-1', icon: 'signature', title: t('Firma digital', 'Digital signature'), description: t('Conecta contratos, anexos y certificados con evidencia.', 'Connect contracts, annexes and certificates with evidence.'), metric: t('Prioridad alta', 'High priority') },
        { id: 'integration-template-2', icon: 'calendar_clock', title: t('Calendario y correo', 'Calendar and email'), description: t('Entrevistas, onboarding, pruebas y recordatorios.', 'Interviews, onboarding, tests and reminders.'), metric: t('Ops recruiting', 'Recruiting ops') },
        { id: 'integration-template-3', icon: 'database', title: t('Storage y BI', 'Storage and BI'), description: t('Versionado documental y salidas analiticas para reportes.', 'Document versioning and analytics outputs for reports.'), metric: t('Escalable', 'Scalable') },
      ],
      risks: [
        { id: 'integration-risk-1', severity: 'warning', title: t('La firma digital aun depende de exportacion manual', 'Digital signing still depends on manual export'), detail: t('Afecta velocidad del cierre de contrato.', 'This affects contract closure speed.') },
        { id: 'integration-risk-2', severity: 'warning', title: t('No hay monitoreo activo para los webhooks de inventario', 'There is no active monitoring for inventory webhooks'), detail: t('Puede dejar al portal del empleado desactualizado.', 'It may leave the employee portal outdated.') },
      ],
      cadence: [
        { id: 'integration-cadence-1', slot: '09:15', icon: 'monitoring', title: t('Salud de conectores', 'Connector health'), detail: t('Validar errores, latencia y ultimas sincronizaciones.', 'Validate errors, latency and latest syncs.') },
        { id: 'integration-cadence-2', slot: '14:45', icon: 'deployed_code', title: t('Despliegues y pruebas', 'Deployments and tests'), detail: t('Revisar cambios de integracion y sandbox.', 'Review integration and sandbox changes.') },
        { id: 'integration-cadence-3', slot: '18:00', icon: 'summarize', title: t('Cierre tecnico', 'Technical closeout'), detail: t('Consolidar alertas y conectores por siguiente etapa.', 'Consolidate alerts and connectors for the next stage.') },
      ],
    },
  }
}
