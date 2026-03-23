import { useState } from 'react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Checkbox from '../ui/Checkbox'
import FileUpload from '../ui/FileUpload'
import InfoCell from '../ui/InfoCell'
import Input from '../ui/Input'
import InteractivePanel from '../ui/InteractivePanel'
import Select from '../ui/Select'
import SidebarList from '../ui/SidebarList'
import SplitLayout from '../ui/SplitLayout'
import Textarea from '../ui/Textarea'

const statusColorMap = {
  pendiente: 'warning',
  en_progreso: 'info',
  bloqueado: 'danger',
  cerrado: 'success',
}

const laneToneMap = {
  activacion: 'bg-amber-50 border-amber-100',
  operacion: 'bg-sky-50 border-sky-100',
  nomina: 'bg-emerald-50 border-emerald-100',
  estable: 'bg-indigo-50 border-indigo-100',
  retiro: 'bg-rose-50 border-rose-100',
}

const stageLabels = {
  es: {
    activacion: 'Activación',
    operacion: 'Operación',
    nomina: 'Nómina',
    estable: 'Estable',
    retiro: 'Listo para retiro',
  },
  en: {
    activacion: 'Activation',
    operacion: 'Operations',
    nomina: 'Payroll',
    estable: 'Stable',
    retiro: 'Ready for offboarding',
  },
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

function updateEmployeeInList(employees, employeeId, updater) {
  return employees.map((employee) => {
    if (employee.id !== employeeId) return employee
    return updater(employee)
  })
}

function parseMoney(value) {
  return Number(String(value || '').replace(/[^\d-]/g, '')) || 0
}

export default function AdministrationOpsStudio({
  workspace,
  theme,
  lang,
  onWorkspaceChange,
  onCreateOffboardingCase,
}) {
  const [employees, setEmployees] = useState(() => workspace.employees)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(workspace.employees[0]?.id || '')
  const [noveltyDraft, setNoveltyDraft] = useState({
    type: workspace.noveltyTypeOptions[0]?.value || '',
    value: '',
    note: '',
  })
  const isSpanish = lang === 'es'

  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) || employees[0]

  if (!selectedEmployee) return null

  const commitEmployees = (nextEmployees) => {
    setEmployees(nextEmployees)
    onWorkspaceChange?.({ ...workspace, employees: nextEmployees })
  }

  const commitSelected = (nextEmployee) => {
    commitEmployees(updateEmployeeInList(employees, selectedEmployee.id, () => nextEmployee))
  }

  const updateSelected = (updater) => {
    commitSelected(updater(selectedEmployee))
  }

  const activationReady = selectedEmployee.activationChecklist.every((item) => item.done) && selectedEmployee.equipment.actaSigned
  const deliveredAssetsCount = selectedEmployee.equipment.assets.filter((item) => item.delivered).length
  const payrollReady = selectedEmployee.payroll.prePayrollValidated && selectedEmployee.payroll.dianSubmitted && selectedEmployee.payroll.paid
  const grossProjection = selectedEmployee.payroll.earnings.reduce((sum, item) => sum + parseMoney(item.value), 0)
  const deductionsProjection = selectedEmployee.payroll.deductions.reduce((sum, item) => sum + parseMoney(item.value), 0)
  const netProjection = grossProjection - deductionsProjection
  const currencyFormatter = new Intl.NumberFormat(isSpanish ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  const moveToStage = (stage, title, detail, status = selectedEmployee.adminStatus) => {
    commitSelected({
      ...selectedEmployee,
      stage,
      adminStatus: status,
      timeline: [createTimelineEntry(title, detail), ...selectedEmployee.timeline],
    })
  }

  const handleChecklistToggle = (listKey, itemId) => {
    updateSelected((employee) => ({
      ...employee,
      [listKey]: employee[listKey].map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Checklist actualizado' : 'Checklist updated',
          isSpanish ? `Se actualizó ${employee[listKey].find((item) => item.id === itemId)?.label || itemId}.` : `Updated ${employee[listKey].find((item) => item.id === itemId)?.label || itemId}.`
        ),
        ...employee.timeline,
      ],
    }))
  }

  const handleAssetToggle = (assetId, field) => {
    updateSelected((employee) => ({
      ...employee,
      equipment: {
        ...employee.equipment,
        assets: employee.equipment.assets.map((asset) => {
          if (asset.id !== assetId) return asset
          return {
            ...asset,
            [field]: field === 'delivered' ? !asset.delivered : asset[field],
          }
        }),
      },
    }))
  }

  const handleAssetSerial = (assetId, value) => {
    updateSelected((employee) => ({
      ...employee,
      equipment: {
        ...employee.equipment,
        assets: employee.equipment.assets.map((asset) => asset.id === assetId ? { ...asset, serial: value } : asset),
      },
    }))
  }

  const handleTravelField = (field, value) => {
    updateSelected((employee) => ({
      ...employee,
      travel: {
        ...employee.travel,
        [field]: value,
      },
    }))
  }

  const handleTravelFiles = (files) => {
    if (!files?.length) return
    const names = files.map((file) => file.name)

    updateSelected((employee) => ({
      ...employee,
      travel: {
        ...employee.travel,
        supports: Array.from(new Set([...employee.travel.supports, ...names])),
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Soportes de viáticos cargados' : 'Travel supports uploaded',
          isSpanish ? `Se cargaron ${names.length} soporte(s) al caso.` : `Uploaded ${names.length} support file(s) to the case.`
        ),
        ...employee.timeline,
      ],
    }))
  }

  const handleAddNovelty = () => {
    if (!noveltyDraft.type || !noveltyDraft.value || !noveltyDraft.note) return

    const option = workspace.noveltyTypeOptions.find((item) => item.value === noveltyDraft.type)

    updateSelected((employee) => ({
      ...employee,
      stage: employee.stage === 'activacion' ? 'operacion' : employee.stage,
      adminStatus: employee.adminStatus === 'pendiente' ? 'en_progreso' : employee.adminStatus,
      novelties: [
        {
          id: `${employee.id}-${Date.now()}`,
          type: noveltyDraft.type,
          label: option?.label || noveltyDraft.type,
          value: noveltyDraft.value,
          status: 'pendiente',
          note: noveltyDraft.note,
        },
        ...employee.novelties,
      ],
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Novedad registrada' : 'Incident created',
          isSpanish ? `Se agregó ${option?.label || noveltyDraft.type} para el colaborador.` : `Added ${option?.label || noveltyDraft.type} to the employee.`
        ),
        ...employee.timeline,
      ],
    }))

    setNoveltyDraft({
      type: workspace.noveltyTypeOptions[0]?.value || '',
      value: '',
      note: '',
    })
  }

  const handlePayrollToggle = (field) => {
    updateSelected((employee) => ({
      ...employee,
      stage: field === 'prePayrollValidated' ? 'nomina' : employee.stage,
      payroll: {
        ...employee.payroll,
        [field]: !employee.payroll[field],
      },
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Paso de nómina actualizado' : 'Payroll step updated',
          isSpanish ? `Se cambió ${field}.` : `Updated ${field}.`
        ),
        ...employee.timeline,
      ],
    }))
  }

  const handleBenefitToggle = (benefitId) => {
    updateSelected((employee) => ({
      ...employee,
      benefits: employee.benefits.map((benefit) => benefit.id === benefitId ? { ...benefit, active: !benefit.active } : benefit),
    }))
  }

  const handleCreateOffboarding = () => {
    const nextEmployee = {
      ...selectedEmployee,
      stage: 'retiro',
      adminStatus: 'bloqueado',
      timeline: [
        createTimelineEntry(
          isSpanish ? 'Caso enviado a retiro' : 'Case sent to offboarding',
          isSpanish ? 'Se abrió la transición hacia la etapa de retiro.' : 'The case moved into the offboarding stage.'
        ),
        ...selectedEmployee.timeline,
      ],
    }

    commitSelected(nextEmployee)
    onCreateOffboardingCase?.(nextEmployee)
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
          <Card title={isSpanish ? 'Casos' : 'Cases'} subtitle={isSpanish ? 'Activación → operación → nómina → retiro.' : 'Activation → operations → payroll → offboarding.'}>
            <SidebarList
              groups={workspace.lanes.map((lane) => {
                const toneText = { activacion: 'text-amber-600', operacion: 'text-sky-600', nomina: 'text-emerald-600', retiro: 'text-rose-600', cerrados: 'text-slate-500' }
                return {
                  id: lane.id,
                  label: lane.title,
                  color: toneText[lane.id] || 'text-slate-500',
                  items: employees.filter((e) => lane.stages.includes(e.stage)).map((e) => ({
                    id: e.id,
                    title: e.name,
                    subtitle: e.role,
                    meta: `${e.employeeCode} · ${e.site}`,
                    badge: { color: statusColorMap[e.adminStatus] || 'neutral', label: workspace.statusOptions.find((i) => i.value === e.adminStatus)?.label || e.adminStatus },
                  })),
                }
              })}
              selectedId={selectedEmployee.id}
              onSelect={setSelectedEmployeeId}
            />
          </Card>
        }
      >

        <Card
          title={`${selectedEmployee.name} · ${selectedEmployee.role}`}
          subtitle={isSpanish ? 'Caso desde vinculación hasta nómina o retiro.' : 'Case from activation through payroll or offboarding.'}
          actions={(
            <Badge color={statusColorMap[selectedEmployee.adminStatus] || 'neutral'}>
              {workspace.statusOptions.find((item) => item.value === selectedEmployee.adminStatus)?.label || selectedEmployee.adminStatus}
            </Badge>
          )}
        >
          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
              <InfoCell label={isSpanish ? 'Código' : 'Code'} value={selectedEmployee.employeeCode} />
              <InfoCell label={isSpanish ? 'Etapa' : 'Stage'} value={stageLabels[lang]?.[selectedEmployee.stage] || selectedEmployee.stage} />
              <InfoCell label="Site" value={selectedEmployee.site} />
              <InfoCell label={isSpanish ? 'Responsable' : 'Owner'} value={selectedEmployee.owner} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label={isSpanish ? 'Estado administrativo' : 'Administrative status'}
                value={selectedEmployee.adminStatus}
                options={workspace.statusOptions}
                onChange={(event) => updateSelected((employee) => ({ ...employee, adminStatus: event.target.value }))}
              />
              <Input
                label={isSpanish ? 'Fecha de ingreso' : 'Start date'}
                type="date"
                value={selectedEmployee.startDate}
                onChange={(event) => updateSelected((employee) => ({ ...employee, startDate: event.target.value }))}
              />
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Recibido desde contratación' : 'Received from hiring'}</h3>
                <div className="mt-4 space-y-3">
                  {selectedEmployee.handoffChecklist.map((item) => (
                    <div key={item.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.softSurface}`}>
                            <span className={`material-symbols-outlined text-[18px] ${theme.link}`}>{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                          </div>
                        </div>
                        <Badge color={item.done ? 'success' : 'warning'}>{item.done ? (isSpanish ? 'Recibido' : 'Received') : (isSpanish ? 'Pendiente' : 'Pending')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Checklist de activación' : 'Activation checklist'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Cierra dotación, afiliaciones y alistamiento del colaborador.' : 'Close equipment, affiliations and readiness steps for the employee.'}
                    </p>
                  </div>
                  <Badge color={activationReady ? 'success' : 'warning'}>
                    {activationReady ? (isSpanish ? 'Listo' : 'Ready') : (isSpanish ? 'Pendiente' : 'Pending')}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedEmployee.activationChecklist.map((item) => (
                    <div key={item.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.softSurface}`}>
                            <span className={`material-symbols-outlined text-[18px] ${theme.link}`}>{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle('activationChecklist', item.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.done ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {item.done ? (isSpanish ? 'Hecho' : 'Done') : (isSpanish ? 'Marcar' : 'Mark')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Dotación y equipos' : 'Equipment and assets'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Entrega activos, registra seriales y deja acta firmada.' : 'Deliver assets, register serials and keep the signed handoff record.'}
                    </p>
                  </div>
                  <Badge color={deliveredAssetsCount === selectedEmployee.equipment.assets.length ? 'success' : 'warning'}>
                    {deliveredAssetsCount}/{selectedEmployee.equipment.assets.length}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedEmployee.equipment.assets.map((asset) => (
                    <div key={asset.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{asset.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{isSpanish ? 'Activa entrega y captura serial si aplica.' : 'Toggle delivery and capture serial if needed.'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssetToggle(asset.id, 'delivered')}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${asset.delivered ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {asset.delivered ? (isSpanish ? 'Entregado' : 'Delivered') : (isSpanish ? 'Pendiente' : 'Pending')}
                          </button>
                        </div>
                        <Input
                          label="Serial"
                          value={asset.serial}
                          onChange={(event) => handleAssetSerial(asset.id, event.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Checkbox
                  className="mt-4"
                  label={isSpanish ? 'Acta de entrega firmada' : 'Signed handoff record'}
                  checked={selectedEmployee.equipment.actaSigned}
                  onChange={() => updateSelected((employee) => ({
                    ...employee,
                    equipment: {
                      ...employee.equipment,
                      actaSigned: !employee.equipment.actaSigned,
                    },
                  }))}
                />
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Viáticos y soportes' : 'Travel expenses and supports'}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Select
                    label={isSpanish ? 'Estado' : 'Status'}
                    value={selectedEmployee.travel.status}
                    options={workspace.travelStatusOptions}
                    onChange={(event) => handleTravelField('status', event.target.value)}
                  />
                  <Input
                    label={isSpanish ? 'Monto' : 'Amount'}
                    value={selectedEmployee.travel.amount}
                    onChange={(event) => handleTravelField('amount', event.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <FileUpload onFiles={handleTravelFiles} accept=".pdf,.png,.jpg,.jpeg" maxSize="10MB" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedEmployee.travel.supports.map((file) => (
                    <span key={file} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                      <span className="material-symbols-outlined text-[14px]">description</span>
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Novedades de nómina' : 'Payroll incidents'}</h3>
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,1fr)_auto]">
                <Select
                  label={isSpanish ? 'Tipo' : 'Type'}
                  value={noveltyDraft.type}
                  options={workspace.noveltyTypeOptions}
                  onChange={(event) => setNoveltyDraft((current) => ({ ...current, type: event.target.value }))}
                />
                <Input
                  label={isSpanish ? 'Valor / horas' : 'Value / hours'}
                  value={noveltyDraft.value}
                  onChange={(event) => setNoveltyDraft((current) => ({ ...current, value: event.target.value }))}
                />
                <Input
                  label={isSpanish ? 'Detalle' : 'Detail'}
                  value={noveltyDraft.note}
                  onChange={(event) => setNoveltyDraft((current) => ({ ...current, note: event.target.value }))}
                />
                <div className="flex items-end">
                  <Button icon="add" onClick={handleAddNovelty}>
                    {isSpanish ? 'Agregar' : 'Add'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedEmployee.novelties.map((item) => (
                  <div key={item.id} className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.note}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color="warning">{item.status}</Badge>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Cierre de nómina' : 'Payroll close'}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSpanish ? 'Consolida preliquidación, DIAN y pago final del ciclo.' : 'Consolidate pre-payroll, DIAN submission and final payment for the cycle.'}
                    </p>
                  </div>
                  <Badge color={payrollReady ? 'success' : 'warning'}>
                    {payrollReady ? (isSpanish ? 'Cerrado' : 'Closed') : (isSpanish ? 'Pendiente' : 'Pending')}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    ['prePayrollValidated', isSpanish ? 'Preliquidación validada' : 'Pre-payroll validated'],
                    ['dianSubmitted', isSpanish ? 'Nómina electrónica enviada a DIAN' : 'Electronic payroll sent to DIAN'],
                    ['paid', isSpanish ? 'Pago ejecutado' : 'Payment executed'],
                  ].map(([field, label]) => (
                    <Checkbox
                      key={field}
                      label={label}
                      checked={selectedEmployee.payroll[field]}
                      onChange={() => handlePayrollToggle(field)}
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Ingresos' : 'Earnings'}</p>
                    <div className="mt-3 space-y-2">
                      {selectedEmployee.payroll.earnings.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                          <span>{item.label}</span>
                          <span className="font-semibold text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[--radius-md] border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Descuentos' : 'Deductions'}</p>
                    <div className="mt-3 space-y-2">
                      {selectedEmployee.payroll.deductions.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                          <span>{item.label}</span>
                          <span className="font-semibold text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[--radius-md] border border-dashed border-slate-300 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {isSpanish ? 'Calculadora interna' : 'Internal calculator'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isSpanish ? 'Estimación interna sin conexión DIAN.' : 'Internal estimate without DIAN connectivity.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      {selectedEmployee.novelties.length} {isSpanish ? 'novedades' : 'incidents'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Bruto estimado' : 'Estimated gross'}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(grossProjection)}</p>
                    </div>
                    <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Descuentos' : 'Deductions'}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{currencyFormatter.format(deductionsProjection)}</p>
                    </div>
                    <div className="rounded-[--radius-md] bg-slate-900 px-4 py-3 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{isSpanish ? 'Neto proyectado' : 'Projected net'}</p>
                      <p className="mt-1 text-sm font-semibold">{currencyFormatter.format(netProjection)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Beneficios y afiliaciones' : 'Benefits and affiliations'}</h3>
                <div className="mt-4 space-y-3">
                  {selectedEmployee.benefits.map((benefit) => (
                    <Checkbox
                      key={benefit.id}
                      label={benefit.label}
                      checked={benefit.active}
                      onChange={() => handleBenefitToggle(benefit.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon="play_circle"
                onClick={() => moveToStage('operacion', isSpanish ? 'Caso movido a operación' : 'Case moved to operations', isSpanish ? 'La activación quedó lista y el caso pasó a operación.' : 'Activation is ready and the case moved into operations.', 'en_progreso')}
                disabled={!activationReady || selectedEmployee.stage === 'operacion' || selectedEmployee.stage === 'nomina' || selectedEmployee.stage === 'estable' || selectedEmployee.stage === 'retiro'}
              >
                {isSpanish ? 'Pasar a operación' : 'Move to operations'}
              </Button>
              <Button
                variant="secondary"
                icon="payments"
                onClick={() => moveToStage('nomina', isSpanish ? 'Caso movido a nómina' : 'Case moved to payroll', isSpanish ? 'El colaborador quedó listo para el siguiente corte de nómina.' : 'The employee is ready for the next payroll cut-off.', 'en_progreso')}
              >
                {isSpanish ? 'Enviar a nómina' : 'Send to payroll'}
              </Button>
              <Button
                variant="success"
                icon="verified"
                onClick={() => moveToStage('estable', isSpanish ? 'Caso estabilizado' : 'Case stabilized', isSpanish ? 'La administración quedó cerrada y el colaborador está estable.' : 'Administration is closed and the employee is stable.', 'cerrado')}
                disabled={!payrollReady}
              >
                {isSpanish ? 'Marcar estable' : 'Mark stable'}
              </Button>
              <Button
                variant="danger"
                icon="exit_to_app"
                onClick={handleCreateOffboarding}
                disabled={selectedEmployee.stage === 'retiro'}
              >
                {isSpanish ? 'Crear caso de retiro' : 'Create offboarding case'}
              </Button>
            </div>

            <Textarea
              rows={4}
              label={isSpanish ? 'Notas operativas' : 'Operational notes'}
              value={selectedEmployee.notes}
              onChange={(event) => updateSelected((employee) => ({ ...employee, notes: event.target.value }))}
            />

            <div className="rounded-[--radius-lg] border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{isSpanish ? 'Trazabilidad administrativa' : 'Administrative timeline'}</h3>
              <div className="mt-4 space-y-3">
                {selectedEmployee.timeline.map((item) => (
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
