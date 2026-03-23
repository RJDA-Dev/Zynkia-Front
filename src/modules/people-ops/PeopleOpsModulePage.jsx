import { useMemo, useState } from 'react'
import { peopleOps } from '../../api/services'
import { unwrapResponse } from '../../api/response'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import StatCard from '../../components/ui/StatCard'
import { getSurfaceToneClass } from '../../config/uiTokens'
import { getPeopleOpsStageTheme } from '../../config/theme'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'

const stageLabels = {
  hiring: { es: 'Etapa 1 · Contratacion', en: 'Stage 1 · Hiring' },
  administration: { es: 'Etapa 2 · Administracion', en: 'Stage 2 · Administration' },
  offboarding: { es: 'Etapa 3 · Retiro', en: 'Stage 3 · Offboarding' },
  platform: { es: 'Plataforma', en: 'Platform' },
}

const statusMeta = {
  pending: { color: 'warning', label: { es: 'Pendiente', en: 'Pending' } },
  in_progress: { color: 'info', label: { es: 'En curso', en: 'In progress' } },
  review: { color: 'purple', label: { es: 'Revision', en: 'Review' } },
  scheduled: { color: 'info', label: { es: 'Agendado', en: 'Scheduled' } },
  approved: { color: 'success', label: { es: 'Aprobado', en: 'Approved' } },
  resolved: { color: 'success', label: { es: 'Resuelto', en: 'Resolved' } },
  done: { color: 'success', label: { es: 'Completo', en: 'Done' } },
  live: { color: 'success', label: { es: 'Activo', en: 'Live' } },
}

const severityMeta = {
  info: { color: 'info', label: { es: 'Info', en: 'Info' } },
  warning: { color: 'warning', label: { es: 'Riesgo medio', en: 'Medium risk' } },
  critical: { color: 'danger', label: { es: 'Critico', en: 'Critical' } },
}

function translateNode(value, lang) {
  if (Array.isArray(value)) return value.map((item) => translateNode(item, lang))
  if (!value || typeof value !== 'object') return value

  const keys = Object.keys(value)
  const isLocalizedValue = keys.length > 0 && keys.every((key) => ['es', 'en'].includes(key)) && ('es' in value || 'en' in value)
  if (isLocalizedValue) return value[lang] ?? value.es ?? value.en ?? ''

  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, translateNode(nested, lang)]))
}

function getNextStatus(item) {
  const flow = Array.isArray(item?.statusFlow) ? item.statusFlow : []
  if (!flow.length) return null

  const index = flow.indexOf(item.status)
  if (index < 0 || index === flow.length - 1) return null
  return flow[index + 1]
}

function isFinalStatus(status) {
  return ['done', 'resolved', 'approved', 'live'].includes(String(status || ''))
}

function getActionLabel(nextStatus, lang) {
  if (!nextStatus) return lang === 'es' ? 'Sin acciones' : 'No actions'

  const labels = {
    in_progress: { es: 'Tomar caso', en: 'Start case' },
    review: { es: 'Enviar a revision', en: 'Send to review' },
    scheduled: { es: 'Agendar', en: 'Schedule' },
    approved: { es: 'Aprobar', en: 'Approve' },
    resolved: { es: 'Resolver', en: 'Resolve' },
    done: { es: 'Completar', en: 'Complete' },
    live: { es: 'Activar', en: 'Go live' },
  }

  return labels[nextStatus]?.[lang] || labels[nextStatus]?.es || nextStatus
}

export default function PeopleOpsModulePage({ moduleKey }) {
  const { lang } = useLang()
  const toast = useToast()
  const [moduleOverride, setModuleOverride] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const { data, loading } = useFetch(() => peopleOps.module(moduleKey), {
    key: `people-ops-${moduleKey}`,
    deps: [moduleKey],
  })

  const moduleState = moduleOverride || unwrapResponse(data)
  const localized = useMemo(() => (moduleState ? translateNode(moduleState, lang) : null), [lang, moduleState])
  const theme = getPeopleOpsStageTheme(localized?.stage)

  const handleAdvanceItem = async (item) => {
    const nextStatus = getNextStatus(item)
    if (!nextStatus) return

    setBusyId(`queue-${item.id}`)
    try {
      const response = await peopleOps.setItemStatus(moduleKey, 'queue', item.id, nextStatus)
      setModuleOverride(unwrapResponse(response))
      toast.success(lang === 'es' ? 'Estado actualizado' : 'Status updated')
    } catch {
      toast.error(lang === 'es' ? 'No fue posible mover el caso' : 'Could not move the case')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleAutomation = async (automationId) => {
    setBusyId(`automation-${automationId}`)
    try {
      const response = await peopleOps.toggleAutomation(moduleKey, automationId)
      setModuleOverride(unwrapResponse(response))
      toast.success(lang === 'es' ? 'Automatizacion actualizada' : 'Automation updated')
    } catch {
      toast.error(lang === 'es' ? 'No fue posible actualizar la regla' : 'Could not update the rule')
    } finally {
      setBusyId(null)
    }
  }

  const handleUseTemplate = (title) => {
    toast.info(lang === 'es' ? `Plantilla lista: ${title}` : `Template ready: ${title}`)
  }

  if ((loading && !moduleState) || !localized) {
    return <Spinner className="min-h-[320px]" />
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
      <section className={`relative overflow-hidden rounded-[--radius-lg] sm:rounded-[32px] bg-gradient-to-br ${theme.hero} px-5 py-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:px-8 sm:py-7`}>
        <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/6 blur-3xl pointer-events-none" />
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset ${theme.chip}`}>
                <span className="material-symbols-outlined text-[14px]">{localized.icon}</span>
                {localized.eyebrow}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset ${theme.chip}`}>
                {stageLabels[localized.stage]?.[lang] || localized.stage}
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">{localized.title}</h1>
            <p className="mt-3 text-xs sm:text-sm leading-6 text-white/78">{localized.description}</p>
          </div>

          <div className="rounded-[--radius-md] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">{lang === 'es' ? 'Propuesta operativa' : 'Operating promise'}</p>
            <p className="mt-2 text-xs leading-5 text-white/86">{localized.promise}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: lang === 'es' ? 'Cola' : 'Queue', v: localized.queue?.length || 0 },
                { k: lang === 'es' ? 'Autom.' : 'Autom.', v: localized.automations?.length || 0 },
                { k: lang === 'es' ? 'Plantillas' : 'Templates', v: localized.templates?.length || 0 },
              ].map((s) => (
                <div key={s.k} className="rounded-[--radius-sm] bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{s.v}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/56">{s.k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {(localized.stats || []).map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value ?? 0}
            change={stat.change}
            icon={stat.icon}
            tone={stat.tone}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card
          title={lang === 'es' ? 'Operacion pendiente' : 'Pending operation'}
          subtitle={lang === 'es' ? 'Casos que deben avanzar.' : 'Cases that must move.'}
          badge={<Badge color="info">{localized.queue?.length || 0}</Badge>}
        >
          <div className="app-scrollbar max-h-[600px] space-y-3 overflow-y-auto p-4 sm:p-5">
            {(localized.queue || []).map((item) => {
              const status = statusMeta[item.status] || statusMeta.pending
              const nextStatus = getNextStatus(item)

              return (
                <article key={item.id} className="rounded-[--radius-md] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                    </div>
                    <Badge color={status.color} size="sm">{status.label[lang] || status.label.es}</Badge>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${getSurfaceToneClass(theme.surfaceTone)}`}>
                      <span className="material-symbols-outlined text-[12px]">person</span>
                      {item.owner}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {item.due}
                    </span>
                    {item.chip && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{item.chip}</span>}
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <Button
                      size="xs"
                      variant={nextStatus && !isFinalStatus(nextStatus) ? 'primary' : 'secondary'}
                      onClick={() => handleAdvanceItem(item)}
                      loading={busyId === `queue-${item.id}`}
                      disabled={!nextStatus}
                    >
                      {getActionLabel(nextStatus, lang)}
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </Card>

        <Card
          title={lang === 'es' ? 'Automatizaciones' : 'Automations'}
          subtitle={lang === 'es' ? 'Reglas para reducir seguimiento manual.' : 'Rules to reduce manual follow-up.'}
          badge={<Badge color="success">{(localized.automations || []).filter((item) => item.enabled).length}</Badge>}
        >
          <div className="app-scrollbar max-h-[600px] space-y-3 overflow-y-auto p-4 sm:p-5">
            {(localized.automations || []).map((automation) => (
              <article key={automation.id} className="rounded-[--radius-md] border border-slate-200 bg-slate-50/75 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{automation.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{automation.trigger}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={automation.enabled}
                    disabled={busyId === `automation-${automation.id}`}
                    onClick={() => handleToggleAutomation(automation.id)}
                    className={`${automation.enabled ? 'bg-primary' : 'bg-slate-200'} relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50`}
                  >
                    <span className={`${automation.enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200`} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-slate-500">{automation.coverage}</span>
                  <Badge color={automation.enabled ? 'success' : 'neutral'} size="sm">
                    {automation.enabled ? (lang === 'es' ? 'Activa' : 'On') : (lang === 'es' ? 'Pausada' : 'Off')}
                  </Badge>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card
          title={lang === 'es' ? 'Plantillas y playbooks' : 'Templates and playbooks'}
          subtitle={lang === 'es' ? 'Bases reutilizables para RH.' : 'Reusable foundations for HR.'}
        >
          <div className="grid gap-3 p-4 sm:p-5 sm:grid-cols-2 xl:grid-cols-3">
            {(localized.templates || []).map((template) => (
              <article key={template.id} className="rounded-[--radius-md] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <span className="material-symbols-outlined text-[18px]">{template.icon}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{template.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{template.description}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{template.metric}</span>
                  <Button size="xs" variant="secondary" onClick={() => handleUseTemplate(template.title)}>{lang === 'es' ? 'Usar' : 'Use'}</Button>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card
          title={lang === 'es' ? 'Alertas y cadencia' : 'Alerts and cadence'}
          subtitle={lang === 'es' ? 'Vigilancia y rutina sugerida.' : 'Monitoring and suggested rhythm.'}
        >
          <div className="space-y-4 p-4 sm:p-5">
            <div className="space-y-2.5">
              {(localized.risks || []).map((risk) => {
                const severity = severityMeta[risk.severity] || severityMeta.warning
                return (
                  <article key={risk.id} className="rounded-[--radius-sm] border border-slate-200 bg-slate-50/75 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{risk.detail}</p>
                      </div>
                      <Badge color={severity.color} size="sm">{severity.label[lang] || severity.label.es}</Badge>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="h-px bg-slate-200" />

            <div className="space-y-2.5">
              {(localized.cadence || []).map((step) => (
                <div key={step.id} className="flex gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                  </div>
                  <div className="min-w-0 rounded-[--radius-sm] border border-slate-200 bg-white px-3 py-2.5 shadow-sm flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{step.slot}</p>
                      <span className="h-1 w-1 rounded-full bg-primary/45" />
                      <p className="text-xs font-semibold text-slate-900">{step.title}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
