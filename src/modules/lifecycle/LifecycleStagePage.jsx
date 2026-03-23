import { useOutletContext } from 'react-router-dom'
import AdministrationOpsStudio from '../../components/administration/AdministrationOpsStudio'
import HiringFlowStudio from '../../components/hiring/HiringFlowStudio'
import OffboardingStudio from '../../components/offboarding/OffboardingStudio'
import AppLoader from '../../components/ui/AppLoader'
import StageHero from '../../components/lifecycle/StageHero'
import WorkstreamCard from '../../components/lifecycle/WorkstreamCard'
import StageBoard from '../../components/lifecycle/StageBoard'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { getStageTheme } from '../../config/theme'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { copyFor } from '../../lib/locale'
import { hrLifecycleService } from '../../services/hrLifecycleService'

function localizeHiringWorkspace(lang, workspace) {
  return {
    title: copyFor(lang, workspace.title),
    subtitle: copyFor(lang, workspace.subtitle),
    steps: workspace.steps.map((step) => ({
      ...step,
      title: copyFor(lang, step.title),
      description: copyFor(lang, step.description),
    })),
    lanes: workspace.lanes.map((lane) => ({
      ...lane,
      title: copyFor(lang, lane.title),
    })),
    statusOptions: workspace.statusOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    interviewModes: workspace.interviewModes.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    profileOptions: workspace.profileOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    handoffTemplate: workspace.handoffTemplate.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
      hint: copyFor(lang, item.hint),
    })),
    candidates: workspace.candidates.map((candidate) => ({
      ...candidate,
      documents: {
        ...candidate.documents,
        required: candidate.documents.required.map((document) => ({
          ...document,
          label: copyFor(lang, document.label),
        })),
      },
      handoff: candidate.handoff ? {
        ...candidate.handoff,
      } : null,
      timeline: candidate.timeline.map((item) => ({
        ...item,
        title: copyFor(lang, item.title),
        detail: copyFor(lang, item.detail),
      })),
      resume: {
        ...candidate.resume,
        summary: copyFor(lang, candidate.resume.summary),
        recommendedProfile: copyFor(lang, candidate.resume.recommendedProfile),
        strengths: candidate.resume.strengths.map((item) => copyFor(lang, item)),
        alerts: candidate.resume.alerts.map((item) => copyFor(lang, item)),
        extractedData: candidate.resume.extractedData.map((item) => ({
          label: copyFor(lang, item.label),
          value: copyFor(lang, item.value),
        })),
      },
    })),
  }
}

function localizeAdministrationWorkspace(lang, workspace) {
  return {
    title: copyFor(lang, workspace.title),
    subtitle: copyFor(lang, workspace.subtitle),
    steps: workspace.steps.map((step) => ({
      ...step,
      title: copyFor(lang, step.title),
      description: copyFor(lang, step.description),
    })),
    lanes: workspace.lanes.map((lane) => ({
      ...lane,
      title: copyFor(lang, lane.title),
    })),
    statusOptions: workspace.statusOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    noveltyTypeOptions: workspace.noveltyTypeOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    travelStatusOptions: workspace.travelStatusOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    employees: workspace.employees.map((employee) => ({
      ...employee,
      handoffChecklist: employee.handoffChecklist.map((item) => ({
        ...item,
        label: copyFor(lang, item.label),
        hint: copyFor(lang, item.hint),
      })),
      activationChecklist: employee.activationChecklist.map((item) => ({
        ...item,
        label: copyFor(lang, item.label),
        hint: copyFor(lang, item.hint),
      })),
      equipment: {
        ...employee.equipment,
        assets: employee.equipment.assets.map((item) => ({
          ...item,
          label: copyFor(lang, item.label),
        })),
      },
      novelties: employee.novelties.map((item) => ({
        ...item,
        label: copyFor(lang, item.label),
        note: copyFor(lang, item.note),
      })),
      payroll: {
        ...employee.payroll,
        earnings: employee.payroll.earnings.map((item) => ({
          ...item,
          label: copyFor(lang, item.label),
        })),
        deductions: employee.payroll.deductions.map((item) => ({
          ...item,
          label: copyFor(lang, item.label),
        })),
      },
      benefits: employee.benefits.map((item) => ({
        ...item,
        label: copyFor(lang, item.label),
      })),
      timeline: employee.timeline.map((item) => ({
        ...item,
        title: copyFor(lang, item.title),
        detail: copyFor(lang, item.detail),
      })),
    })),
  }
}

function localizeOffboardingWorkspace(lang, workspace) {
  return {
    title: copyFor(lang, workspace.title),
    subtitle: copyFor(lang, workspace.subtitle),
    steps: workspace.steps.map((step) => ({
      ...step,
      title: copyFor(lang, step.title),
      description: copyFor(lang, step.description),
    })),
    lanes: workspace.lanes.map((lane) => ({
      ...lane,
      title: copyFor(lang, lane.title),
    })),
    statusOptions: workspace.statusOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    reasonOptions: workspace.reasonOptions.map((item) => ({
      ...item,
      label: copyFor(lang, item.label),
    })),
    cases: workspace.cases.map((item) => ({
      ...item,
      checklist: item.checklist.map((section) => ({
        ...section,
        label: copyFor(lang, section.label),
        items: section.items.map((check) => ({
          ...check,
          label: copyFor(lang, check.label),
        })),
      })),
      timeline: item.timeline.map((entry) => ({
        ...entry,
        title: copyFor(lang, entry.title),
        detail: copyFor(lang, entry.detail),
      })),
    })),
  }
}

function localizeWorkspace(lang, payload) {
  if (!payload.workspace) return null
  if (payload.stage.id === 'hiring') return localizeHiringWorkspace(lang, payload.workspace)
  if (payload.stage.id === 'administration') return localizeAdministrationWorkspace(lang, payload.workspace)
  if (payload.stage.id === 'offboarding') return localizeOffboardingWorkspace(lang, payload.workspace)
  return payload.workspace
}

function localizeStageData(lang, payload) {
  return {
    company: {
      ...payload.company,
      name: copyFor(lang, payload.company.name),
      segment: copyFor(lang, payload.company.segment),
      size: copyFor(lang, payload.company.size),
      footprint: copyFor(lang, payload.company.footprint),
      operatingModel: copyFor(lang, payload.company.operatingModel),
      badges: payload.company.badges.map((badge) => ({
        ...badge,
        label: copyFor(lang, badge.label),
      })),
    },
    companyStage: payload.companyStage ? {
      title: copyFor(lang, payload.companyStage.title),
      description: copyFor(lang, payload.companyStage.description),
      priorities: payload.companyStage.priorities.map((item) => copyFor(lang, item)),
      checkpoints: payload.companyStage.checkpoints.map((item) => ({
        label: copyFor(lang, item.label),
        value: item.value,
      })),
    } : null,
    workspace: localizeWorkspace(lang, payload),
    stage: {
      ...payload.stage,
      name: copyFor(lang, payload.stage.name),
      shortLabel: copyFor(lang, payload.stage.shortLabel),
      description: copyFor(lang, payload.stage.description),
      stats: payload.stage.stats.map((stat) => ({
        ...stat,
        label: copyFor(lang, stat.label),
      })),
    },
    hero: {
      eyebrow: copyFor(lang, payload.hero.eyebrow),
      title: copyFor(lang, payload.hero.title),
      description: copyFor(lang, payload.hero.description),
      chips: payload.hero.chips.map((chip) => ({
        ...chip,
        label: copyFor(lang, chip.label),
      })),
    },
    metrics: payload.metrics.map((metric) => ({
      ...metric,
      label: copyFor(lang, metric.label),
      change: copyFor(lang, metric.change),
    })),
    workstreams: payload.workstreams.map((workstream) => ({
      ...workstream,
      title: copyFor(lang, workstream.title),
      description: copyFor(lang, workstream.description),
      owner: copyFor(lang, workstream.owner),
      load: copyFor(lang, workstream.load),
      status: copyFor(lang, workstream.status),
      items: workstream.items.map((item) => copyFor(lang, item)),
    })),
    lanes: payload.lanes.map((lane) => ({
      ...lane,
      title: copyFor(lang, lane.title),
      items: lane.items.map((item) => ({
        title: copyFor(lang, item.title),
        meta: copyFor(lang, item.meta),
        note: copyFor(lang, item.note),
      })),
    })),
    controls: {
      title: copyFor(lang, payload.controls.title),
      items: payload.controls.items.map((item) => ({
        title: copyFor(lang, item.title),
        description: copyFor(lang, item.description),
        status: copyFor(lang, item.status),
      })),
    },
    automation: {
      title: copyFor(lang, payload.automation.title),
      items: payload.automation.items.map((item) => copyFor(lang, item)),
    },
  }
}

export default function LifecycleStagePage({ stageId }) {
  const { lang } = useLang()
  const outletContext = useOutletContext()
  const selectedCompanyId = outletContext?.selectedCompanyId
  const { data, loading } = useFetch(() => hrLifecycleService.getStage(stageId, selectedCompanyId), {
    key: `lifecycle-stage-${stageId}-${selectedCompanyId || 'default'}`,
    deps: [stageId, selectedCompanyId],
  })

  if (loading || !data) {
    return (
      <AppLoader
        inline
        label={lang === 'es' ? 'Cargando etapa' : 'Loading stage'}
        detail={lang === 'es' ? 'Generando la vista centralizada del flujo.' : 'Generating the centralized lifecycle view.'}
        icon={stageId === 'hiring' ? 'person_search' : stageId === 'administration' ? 'work_history' : 'badge'}
      />
    )
  }

  const localized = localizeStageData(lang, data)
  const theme = getStageTheme(stageId)
  const isSpanish = lang === 'es'
  const persistWorkspace = (nextWorkspace) => hrLifecycleService.persistWorkspace(stageId, selectedCompanyId, nextWorkspace)
  const handleDeliverToAdministration = (candidate) => hrLifecycleService.deliverCandidateToAdministration(selectedCompanyId, candidate)
  const handleCreateOffboardingCase = (employee) => hrLifecycleService.createOffboardingCase(selectedCompanyId, employee)

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
      <StageHero
        eyebrow={`${localized.stage.name} · ${localized.company.segment}`}
        title={localized.hero.title}
        description={localized.hero.description}
        chips={localized.hero.chips}
        snapshot={localized.metrics.slice(0, 3).map((metric) => ({
          label: metric.label,
          value: metric.value,
          helper: metric.change,
        }))}
        icon={localized.stage.icon}
        theme={theme}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card
          title={isSpanish ? 'Modo empresa' : 'Company mode'}
          subtitle={isSpanish ? 'La etapa se adapta al tipo de compañía.' : 'The stage adapts to the company type.'}
          actions={<span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.badge}`}>{localized.company.segment}</span>}
        >
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-[--radius-lg] bg-slate-900 text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{localized.company.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">{localized.company.name}</h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{localized.company.operatingModel}</p>
              </div>
            </div>

            <div className="grid gap-2 grid-cols-2">
              <div className="rounded-[--radius-sm] sm:rounded-[--radius-lg] border border-slate-200 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{isSpanish ? 'Escala' : 'Scale'}</p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900">{localized.company.size}</p>
              </div>
              <div className="rounded-[--radius-sm] sm:rounded-[--radius-lg] border border-slate-200 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{isSpanish ? 'Cobertura' : 'Footprint'}</p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900">{localized.company.footprint}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {localized.company.badges.map((badge) => (
                <span key={badge.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <span className="material-symbols-outlined text-[12px]">{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {localized.companyStage && (
          <Card title={localized.companyStage.title} subtitle={localized.companyStage.description}>
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-2.5">
                {localized.companyStage.priorities.map((item) => (
                  <div key={item} className={`flex gap-2.5 rounded-[--radius-md] border ${theme.border} p-3 ${theme.softSurface}`}>
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${theme.link}`}>check_circle</span>
                    <p className="text-xs sm:text-sm leading-5 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {localized.companyStage.checkpoints.map((item) => (
                  <div key={item.label} className="rounded-[--radius-md] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {stageId === 'hiring' && localized.workspace && (
        <HiringFlowStudio
          key={`${selectedCompanyId || 'default'}-${stageId}`}
          workspace={localized.workspace}
          theme={theme}
          lang={lang}
          onWorkspaceChange={persistWorkspace}
          onDeliverToAdministration={handleDeliverToAdministration}
        />
      )}

      {stageId === 'administration' && localized.workspace && (
        <AdministrationOpsStudio
          key={`${selectedCompanyId || 'default'}-${stageId}`}
          workspace={localized.workspace}
          theme={theme}
          lang={lang}
          onWorkspaceChange={persistWorkspace}
          onCreateOffboardingCase={handleCreateOffboardingCase}
        />
      )}

      {stageId === 'offboarding' && localized.workspace && (
        <OffboardingStudio
          key={`${selectedCompanyId || 'default'}-${stageId}`}
          workspace={localized.workspace}
          theme={theme}
          lang={lang}
          onWorkspaceChange={persistWorkspace}
        />
      )}

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {localized.metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            iconColor={theme.metricIcon}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {localized.workstreams.map((workstream) => (
          <WorkstreamCard key={workstream.title} workstream={workstream} theme={theme} />
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <Card
          title={isSpanish ? 'Backlog del proceso' : 'Process backlog'}
          subtitle={isSpanish ? 'Cada lane corresponde a un frente operativo.' : 'Each lane maps to an operational track.'}
        >
          <div className="p-4 sm:p-5">
            <StageBoard lanes={localized.lanes} theme={theme} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title={localized.controls.title} subtitle={isSpanish ? 'Checks mínimos del flujo.' : 'Minimum flow checks.'}>
            <div className="space-y-2.5 p-4 sm:p-5">
              {localized.controls.items.map((item) => (
                <article key={item.title} className={`rounded-[--radius-md] border ${theme.border} p-3 sm:p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-xs sm:text-sm leading-5 text-slate-600">{item.description}</p>
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${theme.badge}`}>{item.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </Card>

          <Card title={localized.automation.title} subtitle={isSpanish ? 'Piezas listas para escalar.' : 'Pieces ready to scale.'}>
            <div className="space-y-2 p-4 sm:p-5">
              {localized.automation.items.map((item) => (
                <div key={item} className={`flex gap-2.5 rounded-[--radius-md] border ${theme.border} p-3 ${theme.softSurface}`}>
                  <span className={`material-symbols-outlined text-[18px] shrink-0 ${theme.link}`}>bolt</span>
                  <p className="text-xs sm:text-sm leading-5 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
