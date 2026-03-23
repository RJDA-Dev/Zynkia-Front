import { useState } from 'react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import InteractivePanel from '../ui/InteractivePanel'
import Select from '../ui/Select'
import SidebarList from '../ui/SidebarList'
import SplitLayout from '../ui/SplitLayout'
import Textarea from '../ui/Textarea'

const statusColorMap = {
  en_progreso: 'warning',
  bloqueado: 'danger',
  cerrado: 'success',
}

const laneToneMap = {
  preaviso: 'bg-amber-50 border-amber-100',
  pazysalvo: 'bg-sky-50 border-sky-100',
  liquidacion: 'bg-emerald-50 border-emerald-100',
  cierre: 'bg-slate-50 border-slate-200',
}

function formatNow() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  return `${day}/${month} · ${hours}:${mins}`
}

function createTimelineEntry(title, detail) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: formatNow(),
    title,
    detail,
  }
}

function updateCaseInList(cases, caseId, updater) {
  return cases.map((item) => {
    if (item.id !== caseId) return item
    return updater(item)
  })
}

function parseMoney(value) {
  return Number(String(value || '').replace(/[^\d-]/g, '')) || 0
}

export default function OffboardingStudio({ workspace, theme, lang, onWorkspaceChange }) {
  const [cases, setCases] = useState(() => workspace.cases)
  const [selectedCaseId, setSelectedCaseId] = useState(workspace.cases[0]?.id || '')
  const isSpanish = lang === 'es'

  const selectedCase = cases.find((item) => item.id === selectedCaseId) || cases[0]

  if (!selectedCase) return null

  const commitCases = (nextCases) => {
    setCases(nextCases)
    onWorkspaceChange?.({ ...workspace, cases: nextCases })
  }

  const commitSelected = (nextCase) => {
    commitCases(updateCaseInList(cases, selectedCase.id, () => nextCase))
  }

  const updateSelected = (updater) => {
    commitSelected(updater(selectedCase))
  }

  const checklistDone = selectedCase.checklist.every((section) => section.items.every((item) => item.done))
  const settlementReady = selectedCase.settlement.calculated && selectedCase.settlement.approved && selectedCase.settlement.paid
  const pendingClearanceCount = selectedCase.checklist.reduce((total, section) => total + section.items.filter((item) => !item.done).length, 0)
  const settlementAmount = parseMoney(selectedCase.settlement.amount)
  const currencyFormatter = new Intl.NumberFormat(isSpanish ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  const moveStage = (stage, title, detail, status = selectedCase.status) => {
    commitSelected({
      ...selectedCase,
      stage,
      status,
      timeline: [createTimelineEntry(title, detail), ...selectedCase.timeline],
    })
  }

  const handleChecklistToggle = (sectionId, itemId) => {
    updateSelected((currentCase) => ({
      ...currentCase,
      checklist: currentCase.checklist.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          items: section.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
        }
      }),
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Checklist actualizado' : 'Checklist updated',
          isSpanish ? `Se actualizó ${currentCase.checklist.find((section) => section.id === sectionId)?.items.find((item) => item.id === itemId)?.label || itemId}.` : `Updated ${currentCase.checklist.find((section) => section.id === sectionId)?.items.find((item) => item.id === itemId)?.label || itemId}.`
        ),
        ...currentCase.timeline,
      ],
    }))
  }

  const handleSettlementToggle = (field) => {
    updateSelected((currentCase) => ({
      ...currentCase,
      stage: field === 'calculated' ? 'liquidacion' : currentCase.stage,
      settlement: {
        ...currentCase.settlement,
        [field]: !currentCase.settlement[field],
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Liquidación actualizada' : 'Settlement updated',
          isSpanish ? `Se cambió ${field} del caso.` : `Updated ${field} for the case.`
        ),
        ...currentCase.timeline,
      ],
    }))
  }

  const handleSendInterview = () => {
    if (!selectedCase.exitInterview.date) return

    updateSelected((currentCase) => ({
      ...currentCase,
      exitInterview: {
        ...currentCase.exitInterview,
        sent: true,
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Entrevista de salida agendada' : 'Exit interview scheduled',
          isSpanish ? `Se agendó la salida para ${currentCase.exitInterview.date}.` : `Scheduled the exit interview for ${currentCase.exitInterview.date}.`
        ),
        ...currentCase.timeline,
      ],
    }))
  }

  const handleCloseCase = () => {
    if (!checklistDone || !settlementReady) return

    moveStage(
      'cierre',
      isSpanish ? 'Caso cerrado' : 'Case closed',
      isSpanish ? 'Todas las áreas liberaron el retiro y el expediente quedó archivado.' : 'All teams cleared the exit and the record was archived.',
      'cerrado'
    )
  }

  return (
    <>
      <Card
        title={workspace.title}
        subtitle={workspace.subtitle}
        className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
      >
        <div className="grid gap-3 p-4 sm:p-5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
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
          <Card title={isSpanish ? 'Casos' : 'Cases'} subtitle={isSpanish ? 'Preaviso → paz y salvo → liquidación → cierre.' : 'Notice → clearance → settlement → close.'}>
            <SidebarList
              groups={workspace.lanes.map((lane) => {
                const toneText = { preaviso: 'text-amber-600', paz_y_salvo: 'text-sky-600', liquidacion: 'text-emerald-600', cierre: 'text-slate-500' }
                return {
                  id: lane.id,
                  label: lane.title,
                  color: toneText[lane.id] || 'text-slate-500',
                  items: cases.filter((c) => lane.stages.includes(c.stage)).map((c) => ({
                    id: c.id,
                    title: c.name,
                    subtitle: c.role,
                    meta: c.employeeCode,
                    badge: { color: statusColorMap[c.status] || 'neutral', label: workspace.statusOptions.find((o) => o.value === c.status)?.label || c.status },
                  })),
                }
              })}
              selectedId={selectedCase.id}
              onSelect={setSelectedCaseId}
            />
          </Card>
        }
      >

        <Card
          title={`${selectedCase.name} · ${selectedCase.role}`}
          subtitle={isSpanish ? 'Causal, paz y salvo, liquidación y cierre.' : 'Reason, clearance, settlement and close.'}
          actions={(
            <Badge color={statusColorMap[selectedCase.status] || 'neutral'}>
              {workspace.statusOptions.find((item) => item.value === selectedCase.status)?.label || selectedCase.status}
            </Badge>
          )}
        >
          <div className="space-y-5 p-5">
            <div className={`rounded-[--radius-lg] border ${theme.border} bg-gradient-to-br ${theme.sectionTint} p-4`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">{selectedCase.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedCase.role}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.iconWrap}`}>
                  <span className="material-symbols-outlined text-[22px]">exit_to_app</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[--radius-md] bg-white/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Código' : 'Code'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedCase.employeeCode}</p>
                </div>
                <div className="rounded-[--radius-md] bg-white/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Site</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedCase.site}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label={isSpanish ? 'Causal' : 'Reason'}
                value={selectedCase.reason}
                options={workspace.reasonOptions}
                onChange={(event) => updateSelected((currentCase) => ({ ...currentCase, reason: event.target.value }))}
              />
              <Select
                label={isSpanish ? 'Estado' : 'Status'}
                value={selectedCase.status}
                options={workspace.statusOptions}
                onChange={(event) => updateSelected((currentCase) => ({ ...currentCase, status: event.target.value }))}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={isSpanish ? 'Fecha efectiva' : 'Effective date'}
                type="date"
                value={selectedCase.effectiveDate}
                onChange={(event) => updateSelected((currentCase) => ({ ...currentCase, effectiveDate: event.target.value }))}
              />
              <Input
                label={isSpanish ? 'Responsable' : 'Owner'}
                value={selectedCase.owner}
                onChange={(event) => updateSelected((currentCase) => ({ ...currentCase, owner: event.target.value }))}
              />
            </div>

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Paz y salvo integral' : 'Full clearance checklist'}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isSpanish ? 'Legal, activos, accesos y pendientes deben quedar liberados.' : 'Legal, assets, access and pending items must all be cleared.'}
                  </p>
                </div>
                <Badge color={checklistDone ? 'success' : 'warning'}>
                  {checklistDone ? (isSpanish ? 'Completo' : 'Complete') : (isSpanish ? 'Pendiente' : 'Pending')}
                </Badge>
              </div>

              <div className="mt-4 space-y-4">
                {selectedCase.checklist.map((section) => (
                  <div key={section.id} className="rounded-[--radius-md] border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-semibold text-slate-900">{section.label}</h4>
                    <div className="mt-3 space-y-3">
                      {section.items.map((item) => (
                        <Checkbox
                          key={item.id}
                          label={item.label}
                          checked={item.done}
                          onChange={() => handleChecklistToggle(section.id, item.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Entrevista de salida' : 'Exit interview'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Agenda la sesión y deja trazabilidad del envío.' : 'Schedule the session and keep traceability of the invitation.'}
                    </p>
                  </div>
                  {selectedCase.exitInterview.sent && <Badge color="success">{isSpanish ? 'Enviada' : 'Sent'}</Badge>}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    label={isSpanish ? 'Fecha' : 'Date'}
                    type="date"
                    value={selectedCase.exitInterview.date}
                    onChange={(event) => updateSelected((currentCase) => ({
                      ...currentCase,
                      exitInterview: {
                        ...currentCase.exitInterview,
                        date: event.target.value,
                      },
                    }))}
                  />
                  <div className="flex items-end">
                    <Button icon="send" onClick={handleSendInterview} disabled={!selectedCase.exitInterview.date}>
                      {isSpanish ? 'Enviar' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Liquidación final' : 'Final settlement'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Calcula, aprueba y paga para habilitar el cierre del expediente.' : 'Calculate, approve and pay to enable final record closure.'}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{selectedCase.settlement.amount}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    ['calculated', isSpanish ? 'Liquidación calculada' : 'Settlement calculated'],
                    ['approved', isSpanish ? 'Liquidación aprobada' : 'Settlement approved'],
                    ['paid', isSpanish ? 'Pago ejecutado' : 'Payment executed'],
                  ].map(([field, label]) => (
                    <Checkbox
                      key={field}
                      label={label}
                      checked={selectedCase.settlement[field]}
                      onChange={() => handleSettlementToggle(field)}
                    />
                  ))}
                </div>

                <div className="mt-4 rounded-[--radius-md] border border-dashed border-slate-300 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {isSpanish ? 'Calculadora interna' : 'Internal calculator'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isSpanish ? 'Simulación de salida sin integraciones externas.' : 'Exit simulation without external integrations.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      {pendingClearanceCount} {isSpanish ? 'pendientes' : 'pending'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Reserva' : 'Reserve'}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(settlementAmount)}</p>
                    </div>
                    <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Liberación' : 'Release status'}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{checklistDone ? (isSpanish ? 'Lista' : 'Ready') : (isSpanish ? 'En curso' : 'In progress')}</p>
                    </div>
                    <div className="rounded-[--radius-md] bg-slate-900 px-4 py-3 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{isSpanish ? 'Pago final' : 'Final payment'}</p>
                      <p className="mt-1 text-sm font-semibold">{settlementReady ? (isSpanish ? 'Habilitado' : 'Enabled') : (isSpanish ? 'Pendiente' : 'Pending')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon="fact_check"
                onClick={() => moveStage('pazysalvo', isSpanish ? 'Caso movido a paz y salvo' : 'Case moved to clearance', isSpanish ? 'El retiro ya está en revisión inter-áreas.' : 'The case moved into cross-team clearance.', 'en_progreso')}
                disabled={selectedCase.stage === 'pazysalvo' || selectedCase.stage === 'liquidacion' || selectedCase.stage === 'cierre'}
              >
                {isSpanish ? 'Pasar a paz y salvo' : 'Move to clearance'}
              </Button>
              <Button
                variant="secondary"
                icon="payments"
                onClick={() => moveStage('liquidacion', isSpanish ? 'Caso movido a liquidación' : 'Case moved to settlement', isSpanish ? 'El checklist ya permite preparar liquidación.' : 'The checklist now allows settlement preparation.', 'en_progreso')}
              >
                {isSpanish ? 'Enviar a liquidación' : 'Send to settlement'}
              </Button>
              <Button
                variant="success"
                icon="verified"
                onClick={handleCloseCase}
                disabled={!checklistDone || !settlementReady}
              >
                {isSpanish ? 'Cerrar retiro' : 'Close offboarding'}
              </Button>
            </div>

            <Textarea
              rows={4}
              label={isSpanish ? 'Notas del caso' : 'Case notes'}
              value={selectedCase.notes}
              onChange={(event) => updateSelected((currentCase) => ({ ...currentCase, notes: event.target.value }))}
            />

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Trazabilidad del retiro' : 'Offboarding timeline'}</h3>
              <div className="mt-4 space-y-3">
                {selectedCase.timeline.map((item) => (
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
        </Card>
      </SplitLayout>
    </>
  )
}
