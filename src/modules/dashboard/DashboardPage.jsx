import { Link, useOutletContext } from 'react-router-dom'
import StageHero from '../../components/lifecycle/StageHero'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import AppLoader from '../../components/ui/AppLoader'
import InteractivePanel from '../../components/ui/InteractivePanel'
import { getStageTheme } from '../../config/theme'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { copyFor } from '../../lib/locale'
import { hrLifecycleService } from '../../services/hrLifecycleService'

function localizeDashboard(lang, payload) {
  return {
    hero: {
      eyebrow: copyFor(lang, payload.hero.eyebrow),
      title: copyFor(lang, payload.hero.title),
      description: copyFor(lang, payload.hero.description),
      chips: payload.hero.chips.map((c) => ({ ...c, label: copyFor(lang, c.label) })),
      snapshot: payload.hero.snapshot.map((i) => ({ label: copyFor(lang, i.label), value: i.value, helper: copyFor(lang, i.helper) })),
    },
    company: {
      ...payload.company,
      name: copyFor(lang, payload.company.name),
      legalName: copyFor(lang, payload.company.legalName),
      segment: copyFor(lang, payload.company.segment),
      industry: copyFor(lang, payload.company.industry),
      size: copyFor(lang, payload.company.size),
      footprint: copyFor(lang, payload.company.footprint),
      plan: copyFor(lang, payload.company.plan),
      operatingModel: copyFor(lang, payload.company.operatingModel),
      promise: copyFor(lang, payload.company.promise),
      badges: payload.company.badges.map((b) => ({ ...b, label: copyFor(lang, b.label) })),
      workspace: payload.company.workspace.map((i) => ({ ...i, label: copyFor(lang, i.label) })),
    },
    companyDashboard: {
      title: copyFor(lang, payload.companyDashboard.title),
      description: copyFor(lang, payload.companyDashboard.description),
      lenses: payload.companyDashboard.lenses.map((i) => ({ ...i, title: copyFor(lang, i.title), description: copyFor(lang, i.description) })),
      pulse: payload.companyDashboard.pulse.map((i) => ({ label: copyFor(lang, i.label), value: i.value, status: copyFor(lang, i.status) })),
      modules: payload.companyDashboard.modules.map((i) => ({ ...i, title: copyFor(lang, i.title), description: copyFor(lang, i.description) })),
    },
    metrics: payload.metrics.map((m) => ({ ...m, label: copyFor(lang, m.label), change: copyFor(lang, m.change) })),
    agenda: payload.agenda.map((i) => ({ ...i, title: copyFor(lang, i.title), detail: copyFor(lang, i.detail) })),
    stages: payload.stages.map((s) => ({
      ...s,
      name: copyFor(lang, s.name),
      shortLabel: copyFor(lang, s.shortLabel),
      description: copyFor(lang, s.description),
      stats: s.stats.map((st) => ({ ...st, label: copyFor(lang, st.label) })),
    })),
  }
}

export default function DashboardPage() {
  const { lang } = useLang()
  const outletContext = useOutletContext()
  const selectedCompanyId = outletContext?.selectedCompanyId

  const { data, loading } = useFetch(() => hrLifecycleService.getDashboard(selectedCompanyId), {
    key: `lifecycle-dashboard-${selectedCompanyId || 'default'}`,
    deps: [selectedCompanyId],
  })

  if (loading || !data) {
    return (
      <AppLoader
        inline
        label={lang === 'es' ? 'Cargando dashboard' : 'Loading dashboard'}
        detail={lang === 'es' ? 'Generando la vista principal.' : 'Generating the main view.'}
      />
    )
  }

  const l = localizeDashboard(lang, data)
  const dt = getStageTheme('dashboard')
  const es = lang === 'es'

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
      <StageHero
        eyebrow={`${l.hero.eyebrow} · ${l.company.segment}`}
        title={l.hero.title}
        description={l.hero.description}
        chips={l.hero.chips}
        snapshot={l.hero.snapshot}
        icon="hub"
        theme={dt}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card
          title={es ? 'Empresa activa' : 'Active company'}
          subtitle={es ? 'Contexto de la empresa activa.' : 'Active company context.'}
          actions={<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{l.company.plan}</span>}
        >
          <div className="grid gap-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-[--radius-lg] bg-slate-900 text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{l.company.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">{l.company.name}</h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">{l.company.legalName}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {l.company.badges.map((b) => (
                    <span key={b.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-5 text-slate-600">{l.company.promise}</p>

            <div className="grid gap-2.5 grid-cols-3">
              {l.company.workspace.map((item) => (
                <InteractivePanel key={item.label} className="border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-slate-700 shadow-sm">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{item.icon}</span>
                  </div>
                  <p className="mt-2 sm:mt-4 text-lg sm:text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-0.5 text-[9px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 truncate">{item.label}</p>
                </InteractivePanel>
              ))}
            </div>

            <div className="grid gap-2 grid-cols-2">
              {[
                { k: es ? 'Industria' : 'Industry', v: l.company.industry },
                { k: es ? 'Escala' : 'Scale', v: l.company.size },
                { k: es ? 'Cobertura' : 'Footprint', v: l.company.footprint },
                { k: es ? 'Modelo' : 'Model', v: l.company.operatingModel },
              ].map((item) => (
                <div key={item.k} className="rounded-[--radius-sm] sm:rounded-[--radius-lg] border border-slate-200 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.k}</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 truncate">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title={l.companyDashboard.title} subtitle={l.companyDashboard.description}>
          <div className="grid gap-3 p-4 sm:p-5 sm:grid-cols-3">
            {l.companyDashboard.lenses.map((lens) => (
              <InteractivePanel key={lens.title} className="border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-primary/5 p-3 sm:p-4">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 text-white">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{lens.icon}</span>
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-semibold text-slate-900">{lens.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-5 text-slate-600">{lens.description}</p>
              </InteractivePanel>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {l.metrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} change={m.change} icon={m.icon} iconColor={dt.metricIcon} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {l.stages.map((stage) => {
          const theme = getStageTheme(stage.id)
          return (
            <InteractivePanel key={stage.id} className={`border ${theme.border} bg-white/82 p-4 sm:p-5 backdrop-blur-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${theme.iconWrap}`}>
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{stage.icon}</span>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ring-1 ring-inset ${theme.badge}`}>
                  {stage.shortLabel}
                </span>
              </div>

              <div className="mt-3 sm:mt-5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{stage.name}</h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-5 text-slate-600">{stage.description}</p>
              </div>

              <div className="mt-3 sm:mt-5 space-y-2">
                {stage.stats.map((stat) => (
                  <div key={stat.label} className={`flex items-center justify-between rounded-[--radius-sm] sm:rounded-[--radius-md] border ${theme.border} px-3 py-2.5`}>
                    <span className="text-xs sm:text-sm text-slate-500 truncate">{stat.label}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 shrink-0 ml-2">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 sm:mt-5">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <span>{es ? 'Madurez' : 'Maturity'}</span>
                  <span>{stage.progress}%</span>
                </div>
                <div className={`mt-1.5 h-1.5 sm:h-2 overflow-hidden rounded-full ${theme.progressTrack}`}>
                  <div className={`h-full rounded-full transition-all duration-700 ${theme.progressFill}`} style={{ width: `${stage.progress}%` }} />
                </div>
              </div>

              <Link to={stage.route} className={`mt-3 sm:mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${theme.link}`}>
                <span>{es ? 'Abrir etapa' : 'Open stage'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </InteractivePanel>
          )
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card title={es ? 'Pulso operativo' : 'Operational pulse'} subtitle={es ? 'Indicadores clave.' : 'Key indicators.'}>
          <div className="space-y-2.5 p-4 sm:p-5">
            {l.companyDashboard.pulse.map((item) => (
              <div key={item.label} className="rounded-[--radius-md] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.label}</p>
                    <p className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-[0.12em] text-slate-400">{item.status}</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 shrink-0">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={es ? 'Agenda operativa' : 'Operational agenda'} subtitle={es ? 'Prioridades del equipo HR.' : 'HR team priorities.'}>
          <div className="space-y-2.5 p-4 sm:p-5">
            {l.agenda.map((item) => (
              <div key={`${item.time}-${item.title}`} className="flex gap-3 rounded-[--radius-md] border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4">
                <div className="min-w-12 sm:min-w-16 rounded-xl sm:rounded-2xl bg-slate-900 px-2 py-1.5 sm:px-3 sm:py-2 text-center text-xs sm:text-sm font-semibold text-white shrink-0">
                  {item.time}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={es ? 'Módulos activos' : 'Active modules'} subtitle={es ? 'Módulos de la operación.' : 'Operation modules.'}>
          <div className="space-y-2.5 p-4 sm:p-5">
            {l.companyDashboard.modules.map((item) => (
              <article key={item.title} className="rounded-[--radius-md] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-slate-700 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{item.icon}</span>
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
