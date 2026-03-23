import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contracts } from '../../api/services'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import FileUpload from '../ui/FileUpload'
import InfoCell from '../ui/InfoCell'
import Input from '../ui/Input'
import InteractivePanel from '../ui/InteractivePanel'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import SidebarList from '../ui/SidebarList'
import SplitLayout from '../ui/SplitLayout'
import Textarea from '../ui/Textarea'
import { useToast } from '../../context/ToastContext'

const statusColorMap = {
  en_revision: 'warning',
  aprobado: 'success',
  rechazado: 'danger',
}

const laneToneMap = {
  vacante: 'bg-amber-50 border-amber-100',
  seleccion: 'bg-sky-50 border-sky-100',
  archivos: 'bg-emerald-50 border-emerald-100',
  vinculacion: 'bg-indigo-50 border-indigo-100',
  cerrados: 'bg-slate-50 border-slate-200',
}

function formatNow() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  return `${day}/${month} · ${hours}:${mins}`
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function createTimelineEntry(title, detail) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: formatNow(),
    title,
    detail,
  }
}

function updateCandidateInList(candidates, candidateId, updater) {
  return candidates.map((candidate) => {
    if (candidate.id !== candidateId) return candidate
    return updater(candidate)
  })
}

function ensureCandidateShape(candidate) {
  const inferredStatus = candidate.contract?.status
    || (candidate.pipelineStage === 'vinculado' ? 'signed' : candidate.folder?.created ? 'pending_signature' : 'draft')

  return {
    ...candidate,
    contract: {
      contractId: null,
      code: candidate.folder?.created ? `CTR-${String(candidate.id).replace(/[^0-9A-Z]/gi, '').slice(-6).toUpperCase()}` : '',
      status: inferredStatus,
      emailSent: inferredStatus !== 'draft',
      signedAt: inferredStatus === 'signed' ? '13 Mar · 10:00' : '',
      signatureName: candidate.name,
      contractType: 'Indefinido',
      startDate: new Date().toISOString().slice(0, 10),
      salary: 0,
      ...(candidate.contract || {}),
    },
  }
}

function getContractStatusLabel(isSpanish, status) {
  if (status === 'pending_signature') return isSpanish ? 'Pendiente firma' : 'Pending signature'
  if (status === 'signed') return isSpanish ? 'Firmado' : 'Signed'
  return isSpanish ? 'Borrador' : 'Draft'
}

export default function HiringFlowStudio({ workspace, theme, lang, onWorkspaceChange, onDeliverToAdministration }) {
  const [candidates, setCandidates] = useState(() => workspace.candidates.map(ensureCandidateShape))
  const [selectedCandidateId, setSelectedCandidateId] = useState(workspace.candidates[0]?.id || '')
  const [resumeOpen, setResumeOpen] = useState(false)
  const isSpanish = lang === 'es'
  const toast = useToast()
  const navigate = useNavigate()

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || candidates[0]

  if (!selectedCandidate) return null

  const commitCandidates = (nextCandidates) => {
    const normalizedCandidates = nextCandidates.map(ensureCandidateShape)
    setCandidates(normalizedCandidates)
    onWorkspaceChange?.({ ...workspace, candidates: normalizedCandidates })
  }

  const commitSelected = (nextCandidate) => {
    commitCandidates(updateCandidateInList(candidates, selectedCandidate.id, () => nextCandidate))
  }

  const updateSelected = (updater) => {
    commitSelected(updater(selectedCandidate))
  }

  const handleProfileChange = (value) => {
    updateSelected((candidate) => ({
      ...candidate,
      profileType: value,
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Perfil definido' : 'Profile assigned',
          isSpanish ? `Se asignó el perfil ${workspace.profileOptions.find((item) => item.value === value)?.label || value}.` : `Assigned profile ${workspace.profileOptions.find((item) => item.value === value)?.label || value}.`
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handleStatusChange = (value) => {
    updateSelected((candidate) => {
      const nextStage = value === 'rechazado'
        ? 'rechazado'
        : candidate.pipelineStage === 'captura'
          ? 'revision'
          : candidate.pipelineStage

      return {
        ...candidate,
        reviewStatus: value,
        pipelineStage: nextStage,
        timeline: [
          createTimelineEntry(
            isSpanish ? 'Estado actualizado' : 'Status updated',
            isSpanish ? `El responsable cambió el estado a ${workspace.statusOptions.find((item) => item.value === value)?.label || value}.` : `The owner changed the status to ${workspace.statusOptions.find((item) => item.value === value)?.label || value}.`
          ),
          ...candidate.timeline,
        ],
      }
    })
  }

  const handleInterviewField = (field, value) => {
    updateSelected((candidate) => ({
      ...candidate,
      interview: {
        ...candidate.interview,
        [field]: value,
      },
    }))
  }

  const handleCreateSession = () => {
    if (!selectedCandidate.interview.date || !selectedCandidate.interview.time || !selectedCandidate.interview.host) return

    updateSelected((candidate) => ({
      ...candidate,
      pipelineStage: 'entrevista',
      reviewStatus: candidate.reviewStatus === 'rechazado' ? 'en_revision' : candidate.reviewStatus,
      interview: {
        ...candidate.interview,
        emailSent: true,
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Sesión creada y correo enviado' : 'Session created and email sent',
          isSpanish
            ? `Se agendó sesión ${candidate.interview.mode} para ${candidate.interview.date} a las ${candidate.interview.time} con ${candidate.interview.host}.`
            : `Scheduled ${candidate.interview.mode} session for ${candidate.interview.date} at ${candidate.interview.time} with ${candidate.interview.host}.`
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handleDecision = (decision) => {
    updateSelected((candidate) => {
      if (decision === 'pass') {
        return {
          ...candidate,
          reviewStatus: 'aprobado',
          pipelineStage: 'contratacion',
          timeline: [
            createTimelineEntry(
              isSpanish ? 'Candidato avanza a contratación' : 'Candidate advanced to contracting',
              isSpanish ? 'Pasó entrevista y quedó habilitado para recepción de documentos.' : 'Passed the interview and moved to document intake.'
            ),
            ...candidate.timeline,
          ],
        }
      }

      if (decision === 'reject') {
        return {
          ...candidate,
          reviewStatus: 'rechazado',
          pipelineStage: 'rechazado',
          timeline: [
            createTimelineEntry(
              isSpanish ? 'Candidato rechazado' : 'Candidate rejected',
              isSpanish ? 'No pasó el filtro final y se cerró el proceso.' : 'Did not pass final review and the process was closed.'
            ),
            ...candidate.timeline,
          ],
        }
      }

      return {
        ...candidate,
        reviewStatus: 'en_revision',
        pipelineStage: 'revision',
        timeline: [
          createTimelineEntry(
            isSpanish ? 'Regresa a revisión' : 'Back to review',
            isSpanish ? 'Quedó en revisión para una segunda validación.' : 'Candidate returned to review for a second validation.'
          ),
          ...candidate.timeline,
        ],
      }
    })
  }

  const handleFiles = (files) => {
    if (!files?.length) return
    const names = files.map((file) => file.name)

    updateSelected((candidate) => ({
      ...candidate,
      documents: {
        ...candidate.documents,
        uploads: Array.from(new Set([...candidate.documents.uploads, ...names])),
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Documentos recibidos' : 'Documents received',
          isSpanish ? `Se cargaron ${names.length} archivo(s) al expediente del candidato.` : `${names.length} file(s) uploaded to the candidate record.`
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handleDocumentToggle = (docId, field) => {
    updateSelected((candidate) => ({
      ...candidate,
      documents: {
        ...candidate.documents,
        required: candidate.documents.required.map((document) => {
          if (document.id !== docId) return document
          const next = !document[field]
          return {
            ...document,
            [field]: next,
            ...(field === 'received' && !next ? { valid: false } : {}),
          }
        }),
      },
    }))
  }

  const documentsReady = selectedCandidate.documents.required.every((document) => document.received && document.valid)
  const canSchedule = selectedCandidate.interview.date && selectedCandidate.interview.time && selectedCandidate.interview.host
  const contractReady = selectedCandidate.contract?.status === 'signed'

  const handleCreateFolder = () => {
    if (!documentsReady) return

    updateSelected((candidate) => ({
      ...candidate,
      folder: {
        created: true,
        code: `VINC-${slugify(candidate.name).slice(0, 8).toUpperCase()}-${String(candidate.documents.uploads.length + 10).padStart(3, '0')}`,
        path: `/talento/vinculacion/${slugify(candidate.name)}`,
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Folder de vinculación creado' : 'Onboarding folder created',
          isSpanish ? 'El expediente quedó listo para seguir a vinculación.' : 'The folder is ready for the final onboarding step.'
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handlePrepareContract = async () => {
    if (!documentsReady || !selectedCandidate.folder.created) return

    try {
      const contract = await contracts.createFromCandidate({
        name: selectedCandidate.name,
        email: selectedCandidate.email,
        roleTitle: selectedCandidate.role,
        responsible: selectedCandidate.responsible,
        contractType: selectedCandidate.contract?.contractType || 'Indefinido',
        startDate: selectedCandidate.contract?.startDate || new Date().toISOString().slice(0, 10),
        salary: selectedCandidate.contract?.salary || 0,
      })

      updateSelected((candidate) => ({
        ...candidate,
        contract: {
          ...candidate.contract,
          contractId: contract.id,
          code: contract.code,
          status: contract.status,
          emailSent: Boolean(contract.emailSentAt),
          signedAt: contract.signedAt || '',
          signatureName: contract.digitalSignature || candidate.contract?.signatureName || candidate.name,
          contractType: contract.contractType,
          startDate: contract.startDate,
          salary: contract.salary || 0,
          linkedEmployee: contract.linkedEmployee || null,
        },
        timeline: [
          createTimelineEntry(
            isSpanish ? 'Contrato enviado a firma' : 'Contract sent to signature',
            isSpanish ? 'Se habilitó el expediente en el módulo de contratos para firma digital.' : 'The record is now available in the contracts module for digital signature.'
          ),
          ...candidate.timeline,
        ],
      }))

      toast.success(isSpanish ? 'Contrato preparado para firma digital' : 'Contract prepared for digital signature')
    } catch {
      toast.error(isSpanish ? 'No fue posible preparar el contrato' : 'Could not prepare the contract')
    }
  }

  const handleSyncContract = async () => {
    if (!selectedCandidate.contract?.contractId) return

    try {
      const contract = await contracts.get(selectedCandidate.contract.contractId)
      if (!contract) return

      updateSelected((candidate) => ({
        ...candidate,
        pipelineStage: contract.status === 'signed' ? 'vinculado' : candidate.pipelineStage,
        reviewStatus: contract.status === 'signed' ? 'aprobado' : candidate.reviewStatus,
        contract: {
          ...candidate.contract,
          contractId: contract.id,
          code: contract.code,
          status: contract.status,
          emailSent: Boolean(contract.emailSentAt),
          signedAt: contract.signedAt || '',
          signatureName: contract.digitalSignature || candidate.contract?.signatureName || candidate.name,
          contractType: contract.contractType,
          startDate: contract.startDate,
          salary: contract.salary || 0,
          linkedEmployee: contract.linkedEmployee || null,
        },
        handoff: contract.linkedEmployee
          ? {
            ...candidate.handoff,
            employeeCode: contract.linkedEmployee.employeeCode,
            tasks: {
              ...candidate.handoff?.tasks,
              'employee-record': true,
            },
          }
          : candidate.handoff,
        timeline: contract.status === 'signed'
          ? [
            createTimelineEntry(
              isSpanish ? 'Contrato firmado y empleado activado' : 'Contract signed and employee activated',
              isSpanish ? 'La firma digital ya quedó registrada y la ficha del empleado se creó automáticamente para continuar a administración.' : 'The digital signature is registered and the employee record was created automatically for the administration handoff.'
            ),
            ...candidate.timeline,
          ]
          : candidate.timeline,
      }))
    } catch {
      toast.error(isSpanish ? 'No se pudo sincronizar el contrato' : 'Could not sync contract')
    }
  }

  const handleLinkCandidate = () => {
    if (!documentsReady || !selectedCandidate.folder.created || !contractReady) return

    updateSelected((candidate) => ({
      ...candidate,
      pipelineStage: 'vinculado',
      reviewStatus: 'aprobado',
      handoff: {
        ...candidate.handoff,
        employeeCode: candidate.contract?.linkedEmployee?.employeeCode
          || candidate.handoff?.employeeCode
          || `EMP-${slugify(candidate.name).slice(0, 6).toUpperCase()}-${String(candidate.documents.uploads.length + 31).padStart(3, '0')}`,
        tasks: {
          ...candidate.handoff?.tasks,
          'employee-record': true,
        },
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Candidato vinculado' : 'Candidate onboarded',
          isSpanish ? 'Se completó la vinculación con contrato firmado y el expediente pasó al proceso posterior.' : 'Onboarding completed with a signed contract and the record moved downstream.'
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handleHandoffTaskToggle = (taskId) => {
    if (!selectedCandidate.handoff || selectedCandidate.pipelineStage !== 'vinculado') return

    updateSelected((candidate) => ({
      ...candidate,
      handoff: {
        ...candidate.handoff,
        tasks: {
          ...candidate.handoff.tasks,
          [taskId]: !candidate.handoff.tasks[taskId],
        },
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Checklist post-vinculación' : 'Post-onboarding checklist',
          isSpanish
            ? `Se actualizó la tarea ${workspace.handoffTemplate.find((item) => item.id === taskId)?.label || taskId}.`
            : `Updated task ${workspace.handoffTemplate.find((item) => item.id === taskId)?.label || taskId}.`
        ),
        ...candidate.timeline,
      ],
    }))
  }

  const handoffReady = selectedCandidate.handoff
    ? workspace.handoffTemplate.every((item) => selectedCandidate.handoff.tasks[item.id])
    : false

  const handoffCompletedCount = selectedCandidate.handoff
    ? workspace.handoffTemplate.filter((item) => selectedCandidate.handoff.tasks[item.id]).length
    : 0

  const handoffProgress = workspace.handoffTemplate.length
    ? Math.round((handoffCompletedCount / workspace.handoffTemplate.length) * 100)
    : 0

  const handleDeliverToAdministration = () => {
    if (!selectedCandidate.handoff || !handoffReady || selectedCandidate.pipelineStage !== 'vinculado') return

    const nextCandidate = {
      ...selectedCandidate,
      handoff: {
        ...selectedCandidate.handoff,
        deliveredToAdministration: true,
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Handoff a administración completado' : 'Administration handoff completed',
          isSpanish ? 'El colaborador ya quedó listo para continuar en la etapa administrativa.' : 'The employee is ready to continue into the administration stage.'
        ),
        ...selectedCandidate.timeline,
      ],
    }

    commitSelected(nextCandidate)
    onDeliverToAdministration?.(nextCandidate)
  }

  return (
    <>
      <Card
        title={workspace.title}
        subtitle={workspace.subtitle}
        className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
      >
        <div className="grid gap-3 p-4 sm:p-5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          {workspace.steps.map((step, index) => (
            <InteractivePanel key={step.id} className={`border ${theme.border} bg-gradient-to-br ${theme.sectionTint} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.iconWrap}`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </InteractivePanel>
          ))}
        </div>
      </Card>

      <SplitLayout
        sidebar={
          <Card title={isSpanish ? 'Pipeline' : 'Pipeline'} subtitle={isSpanish ? 'Vacante → selección → archivos → firma → vinculación.' : 'Vacancy → selection → files → signature → activation.'}>
            <SidebarList
              groups={workspace.lanes.map((lane) => {
                const toneText = { vacante: 'text-amber-600', seleccion: 'text-sky-600', archivos: 'text-emerald-600', vinculacion: 'text-indigo-600', cerrados: 'text-slate-500' }
                return {
                  id: lane.id,
                  label: lane.title,
                  color: toneText[lane.id] || 'text-slate-500',
                  items: candidates.filter((c) => lane.stages.includes(c.pipelineStage)).map((c) => ({
                    id: c.id,
                    title: c.name,
                    subtitle: c.role,
                    meta: c.source,
                    badge: { color: statusColorMap[c.reviewStatus] || 'neutral', label: workspace.statusOptions.find((i) => i.value === c.reviewStatus)?.label || c.reviewStatus },
                  })),
                }
              })}
              selectedId={selectedCandidate.id}
              onSelect={setSelectedCandidateId}
              emptyText={isSpanish ? 'Sin candidatos.' : 'No candidates.'}
            />
          </Card>
        }
      >

        <Card
          title={`${selectedCandidate.name} · ${selectedCandidate.role}`}
          subtitle={isSpanish ? 'Perfil, hoja de vida, entrevista, archivos, firma y vinculación.' : 'Profile, resume, interview, files, signature and activation.'}
          actions={(
            <Badge color={statusColorMap[selectedCandidate.reviewStatus] || 'neutral'}>
              {workspace.statusOptions.find((item) => item.value === selectedCandidate.reviewStatus)?.label || selectedCandidate.reviewStatus}
            </Badge>
          )}
        >
          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <InfoCell label="Email" value={selectedCandidate.email} />
              <InfoCell label={isSpanish ? 'Teléfono' : 'Phone'} value={selectedCandidate.phone} />
              <InfoCell label={isSpanish ? 'Responsable' : 'Owner'} value={selectedCandidate.responsible} />
              <InfoCell label={isSpanish ? 'Fuente' : 'Source'} value={selectedCandidate.source} />
            </div>

            <div className="grid gap-2 grid-cols-3 lg:grid-cols-5">
              {[
                {
                  label: isSpanish ? 'Perfil' : 'Profile',
                  value: workspace.profileOptions.find((item) => item.value === selectedCandidate.profileType)?.label || selectedCandidate.profileType,
                },
                {
                  label: isSpanish ? 'Estado' : 'Status',
                  value: workspace.statusOptions.find((item) => item.value === selectedCandidate.reviewStatus)?.label || selectedCandidate.reviewStatus,
                },
                {
                  label: isSpanish ? 'Checklist docs' : 'Doc checklist',
                  value: `${selectedCandidate.documents.required.filter((item) => item.received && item.valid).length}/${selectedCandidate.documents.required.length}`,
                },
                {
                  label: isSpanish ? 'Contrato' : 'Contract',
                  value: getContractStatusLabel(isSpanish, selectedCandidate.contract?.status),
                },
                {
                  label: isSpanish ? 'Handoff' : 'Handoff',
                  value: `${handoffProgress}%`,
                },
              ].map((item) => (
                <InfoCell key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label={isSpanish ? 'Perfil objetivo' : 'Target profile'}
                    value={selectedCandidate.profileType}
                    options={workspace.profileOptions}
                    onChange={(event) => handleProfileChange(event.target.value)}
                  />
                  <Select
                    label={isSpanish ? 'Estado actual' : 'Current status'}
                    value={selectedCandidate.reviewStatus}
                    options={workspace.statusOptions}
                    onChange={(event) => handleStatusChange(event.target.value)}
                  />
                </div>

                <Textarea
                  className="mt-4"
                  rows={5}
                  label={isSpanish ? 'Notas del responsable' : 'Owner notes'}
                  value={selectedCandidate.notes}
                  onChange={(event) => updateSelected((candidate) => ({ ...candidate, notes: event.target.value }))}
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button icon="smart_toy" variant="secondary" onClick={() => setResumeOpen(true)}>
                    {isSpanish ? 'Ver hoja de vida con IA' : 'Open AI resume viewer'}
                  </Button>
                  <Button
                    icon="outgoing_mail"
                    onClick={handleCreateSession}
                    disabled={!canSchedule}
                  >
                    {isSpanish ? 'Crear sesión y enviar correo' : 'Create session and send email'}
                  </Button>
                </div>
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Agenda de entrevista' : 'Interview scheduling'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Crea la sesión, agenda el día y dispara la invitación al correo registrado.' : 'Create the session, schedule the day and trigger the email invitation.'}
                    </p>
                  </div>
                  {selectedCandidate.interview.emailSent && <Badge color="success">{isSpanish ? 'Correo enviado' : 'Email sent'}</Badge>}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input
                    label={isSpanish ? 'Fecha' : 'Date'}
                    type="date"
                    value={selectedCandidate.interview.date}
                    onChange={(event) => handleInterviewField('date', event.target.value)}
                  />
                  <Input
                    label={isSpanish ? 'Hora' : 'Time'}
                    type="time"
                    value={selectedCandidate.interview.time}
                    onChange={(event) => handleInterviewField('time', event.target.value)}
                  />
                  <Select
                    label={isSpanish ? 'Modalidad' : 'Mode'}
                    value={selectedCandidate.interview.mode}
                    options={workspace.interviewModes}
                    onChange={(event) => handleInterviewField('mode', event.target.value)}
                  />
                  <Input
                    label={isSpanish ? 'Entrevistador' : 'Interviewer'}
                    value={selectedCandidate.interview.host}
                    onChange={(event) => handleInterviewField('host', event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Decisión del proceso' : 'Process decision'}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isSpanish ? 'Después de la entrevista puedes dejarlo en revisión, rechazarlo o pasarlo a contratación.' : 'After the interview you can keep it in review, reject it or move it to contracting.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" icon="history" onClick={() => handleDecision('review')}>
                  {isSpanish ? 'Seguir en revisión' : 'Keep in review'}
                </Button>
                <Button variant="danger" icon="close" onClick={() => handleDecision('reject')}>
                  {isSpanish ? 'No pasó' : 'Did not pass'}
                </Button>
                <Button variant="success" icon="task_alt" onClick={() => handleDecision('pass')}>
                  {isSpanish ? 'Pasar a contratación' : 'Move to contracting'}
                </Button>
              </div>
            </div>

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Archivos del proceso y firma' : 'Process files and signature'}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isSpanish ? 'Recibe documentos, valida cumplimiento, crea folder y deja listo el contrato para firma.' : 'Receive documents, validate compliance, create the folder and get the contract ready for signature.'}
                  </p>
                </div>
                {documentsReady ? <Badge color="success">{isSpanish ? 'Checklist completo' : 'Checklist complete'}</Badge> : <Badge color="warning">{isSpanish ? 'Pendiente' : 'Pending'}</Badge>}
              </div>

              <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                <div>
                  <FileUpload onFiles={handleFiles} accept=".pdf,.png,.jpg,.jpeg" maxSize="10MB" />

                  <div className="mt-4 space-y-3">
                    {selectedCandidate.documents.required.map((document) => (
                      <div key={document.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{document.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{isSpanish ? 'Marca si ya fue recibido y si cumple para contratación.' : 'Mark whether it was received and whether it is valid for contracting.'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleDocumentToggle(document.id, 'received')}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${document.received ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {isSpanish ? 'Recibido' : 'Received'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocumentToggle(document.id, 'valid')}
                              disabled={!document.received}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${document.valid ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'} disabled:opacity-40`}
                            >
                              {isSpanish ? 'Cumple' : 'Valid'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[--radius-md] border border-dashed border-slate-300 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Folder de vinculación' : 'Onboarding folder'}</p>
                    {selectedCandidate.folder.created ? (
                      <>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCandidate.folder.code}</p>
                        <p className="mt-1 text-sm text-slate-500">{selectedCandidate.folder.path}</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">{isSpanish ? 'Aún no creado. Primero completa la validación documental.' : 'Not created yet. Complete document validation first.'}</p>
                    )}
                  </div>

                  <div className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Firma de contrato' : 'Contract signature'}</p>
                      <Badge color={selectedCandidate.contract?.status === 'signed' ? 'success' : selectedCandidate.contract?.status === 'pending_signature' ? 'warning' : 'neutral'}>
                        {getContractStatusLabel(isSpanish, selectedCandidate.contract?.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedCandidate.contract?.code || (isSpanish ? 'Aún no generado' : 'Not generated yet')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCandidate.contract?.signedAt
                        ? `${isSpanish ? 'Firmado' : 'Signed'} · ${selectedCandidate.contract.signedAt}`
                        : selectedCandidate.contract?.status === 'pending_signature'
                          ? (isSpanish ? 'Disponible en módulo de contratos para firma digital.' : 'Available in the contracts module for digital signature.')
                          : (isSpanish ? 'Primero crea folder y luego envía a firma.' : 'Create the folder first, then send to signature.')}
                    </p>
                    {selectedCandidate.contract?.linkedEmployee?.employeeCode && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">
                        {isSpanish
                          ? `Empleado generado automáticamente: ${selectedCandidate.contract.linkedEmployee.employeeCode}`
                          : `Employee created automatically: ${selectedCandidate.contract.linkedEmployee.employeeCode}`}
                      </p>
                    )}
                  </div>

                  <div className="rounded-[--radius-md] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Archivos recibidos' : 'Received files'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCandidate.documents.uploads.map((file) => (
                        <span key={file} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" icon="create_new_folder" disabled={!documentsReady || selectedCandidate.folder.created} onClick={handleCreateFolder}>
                      {isSpanish ? 'Crear folder' : 'Create folder'}
                    </Button>
                    <Button variant="secondary" icon="signature" disabled={!documentsReady || !selectedCandidate.folder.created} onClick={handlePrepareContract}>
                      {isSpanish ? 'Enviar a firma' : 'Send to signature'}
                    </Button>
                    <Button variant="secondary" icon="open_in_new" disabled={selectedCandidate.contract?.status === 'draft'} onClick={() => navigate('/contracts')}>
                      {isSpanish ? 'Abrir contratos' : 'Open contracts'}
                    </Button>
                    <Button variant="secondary" icon="sync" disabled={!selectedCandidate.contract?.contractId} onClick={handleSyncContract}>
                      {isSpanish ? 'Sincronizar firma' : 'Sync signature'}
                    </Button>
                    <Button icon="how_to_reg" disabled={!documentsReady || !selectedCandidate.folder.created || !contractReady} onClick={handleLinkCandidate}>
                      {isSpanish ? 'Completar vinculación' : 'Complete onboarding'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Vinculación y entrega a administración' : 'Activation and administration handoff'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Después de la firma puedes sincronizar la ficha creada y entregar el caso a administración sin ir a empleados.' : 'After signature you can sync the created employee record and hand the case off to administration without visiting employees.'}
                    </p>
                  </div>
                  {selectedCandidate.handoff?.deliveredToAdministration
                    ? <Badge color="success">{isSpanish ? 'Entregado a administración' : 'Handed to administration'}</Badge>
                    : <Badge color={selectedCandidate.pipelineStage === 'vinculado' ? 'warning' : 'neutral'}>{selectedCandidate.pipelineStage === 'vinculado' ? (isSpanish ? 'Pendiente activación' : 'Activation pending') : (isSpanish ? 'Se habilita al vincular' : 'Enabled after onboarding')}</Badge>}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Código empleado' : 'Employee code'}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCandidate.handoff?.employeeCode || (isSpanish ? 'Se genera al vincular' : 'Generated when onboarded')}</p>
                  </div>
                  <div className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Progreso del handoff' : 'Handoff progress'}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{handoffCompletedCount}/{workspace.handoffTemplate.length}</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{handoffProgress}%</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${theme.progressFill}`} style={{ width: `${handoffProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {workspace.handoffTemplate.map((task) => {
                    const active = selectedCandidate.handoff?.tasks?.[task.id]

                    return (
                      <div key={task.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.softSurface}`}>
                              <span className={`material-symbols-outlined text-[18px] ${theme.link}`}>{task.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{task.label}</p>
                              <p className="mt-1 text-sm text-slate-500">{task.hint}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleHandoffTaskToggle(task.id)}
                            disabled={selectedCandidate.pipelineStage !== 'vinculado'}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'} disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {active ? (isSpanish ? 'Hecho' : 'Done') : (isSpanish ? 'Marcar' : 'Mark')}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    icon="arrow_right_alt"
                    onClick={handleDeliverToAdministration}
                    disabled={!handoffReady || selectedCandidate.pipelineStage !== 'vinculado' || selectedCandidate.handoff?.deliveredToAdministration}
                  >
                    {isSpanish ? 'Entregar a administración' : 'Send to administration'}
                  </Button>
                </div>
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Trazabilidad del proceso' : 'Process timeline'}</h3>
                <div className="mt-4 space-y-3">
                  {selectedCandidate.timeline.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${theme.progressFill}`} />
                        <span className="mt-1 h-full w-px bg-slate-200" />
                      </div>
                      <div className="pb-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.time}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </SplitLayout>

      <Modal
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        title={isSpanish ? `Visor IA · ${selectedCandidate.name}` : `AI Viewer · ${selectedCandidate.name}`}
        subtitle={isSpanish ? 'Lectura de hoja de vida, extracción de señales y recomendación de perfil.' : 'Resume review, signal extraction and profile recommendation.'}
        icon="smart_toy"
        size="xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setResumeOpen(false)}>
              {isSpanish ? 'Cerrar' : 'Close'}
            </Button>
            <Button onClick={() => { setResumeOpen(false); handleCreateSession() }} disabled={!canSchedule} icon="event_available">
              {isSpanish ? 'Agendar desde aquí' : 'Schedule from here'}
            </Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="rounded-[--radius-xl] bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">{selectedCandidate.resume.fileName}</p>
                <h3 className="mt-1 text-2xl font-bold">{selectedCandidate.name}</h3>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {selectedCandidate.resume.pages} {isSpanish ? 'páginas' : 'pages'}
              </div>
            </div>

            <div className="mt-5 rounded-[--radius-lg] border border-white/10 bg-white/6 p-5">
              <div className="aspect-[3/4] rounded-[--radius-md] border border-white/10 bg-white/8 p-5">
                <div className="rounded-[--radius-md] bg-white px-4 py-4 text-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{isSpanish ? 'Extracto de CV' : 'Resume excerpt'}</p>
                  <h4 className="mt-2 text-lg font-bold">{selectedCandidate.role}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{selectedCandidate.resume.summary}</p>
                  <div className="mt-4 grid gap-3">
                    {selectedCandidate.resume.extractedData.map((item) => (
                      <div key={item.label} className="rounded-[--radius-sm] border border-slate-200 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-[26px] border ${theme.border} bg-gradient-to-br ${theme.sectionTint} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{isSpanish ? 'Score IA' : 'AI score'}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{selectedCandidate.resume.score}</p>
                </div>
                <Badge color="success">{selectedCandidate.resume.recommendedProfile}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{selectedCandidate.resume.summary}</p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Fortalezas detectadas' : 'Detected strengths'}</h3>
              <div className="mt-3 space-y-3">
                {selectedCandidate.resume.strengths.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[--radius-md] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Alertas y validaciones' : 'Alerts and validations'}</h3>
              <div className="mt-3 space-y-3">
                {selectedCandidate.resume.alerts.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[--radius-md] bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
