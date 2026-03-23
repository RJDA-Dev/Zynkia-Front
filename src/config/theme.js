export const shellTheme = {
  panel: 'bg-white/86 backdrop-blur-md border border-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.08)]',
  mutedPanel: 'bg-white/70 border border-slate-200/70',
}

export const stageThemes = {
  dashboard: {
    heroGradient: 'from-slate-950 via-teal-950 to-amber-500',
    heroBorder: 'border-slate-900/10',
    heroChip: 'bg-white/12 text-white ring-1 ring-white/15',
    heroIcon: 'bg-white/14 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]',
    iconWrap: 'bg-teal-100 text-teal-800',
    badge: 'bg-teal-50 text-teal-700 ring-teal-700/10',
    border: 'border-teal-100',
    softSurface: 'bg-teal-50/70',
    sectionTint: 'from-teal-50 via-white to-amber-50',
    progressTrack: 'bg-white/15',
    progressFill: 'bg-white',
    metricIcon: 'text-teal-800 bg-teal-100',
    link: 'text-teal-700',
  },
  hiring: {
    heroGradient: 'from-emerald-950 via-teal-800 to-lime-500',
    heroBorder: 'border-emerald-900/10',
    heroChip: 'bg-white/12 text-white ring-1 ring-white/15',
    heroIcon: 'bg-white/14 text-white shadow-[0_18px_40px_rgba(6,78,59,0.25)]',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10',
    border: 'border-emerald-100',
    softSurface: 'bg-emerald-50/70',
    sectionTint: 'from-emerald-50 via-white to-lime-50',
    progressTrack: 'bg-emerald-100',
    progressFill: 'bg-emerald-600',
    metricIcon: 'text-emerald-700 bg-emerald-100',
    link: 'text-emerald-700',
  },
  administration: {
    heroGradient: 'from-sky-950 via-cyan-800 to-amber-400',
    heroBorder: 'border-sky-900/10',
    heroChip: 'bg-white/12 text-white ring-1 ring-white/15',
    heroIcon: 'bg-white/14 text-white shadow-[0_18px_40px_rgba(12,74,110,0.25)]',
    iconWrap: 'bg-sky-100 text-sky-700',
    badge: 'bg-sky-50 text-sky-700 ring-sky-700/10',
    border: 'border-sky-100',
    softSurface: 'bg-sky-50/70',
    sectionTint: 'from-sky-50 via-white to-amber-50',
    progressTrack: 'bg-sky-100',
    progressFill: 'bg-sky-600',
    metricIcon: 'text-sky-700 bg-sky-100',
    link: 'text-sky-700',
  },
  offboarding: {
    heroGradient: 'from-slate-950 via-slate-800 to-rose-500',
    heroBorder: 'border-slate-900/10',
    heroChip: 'bg-white/12 text-white ring-1 ring-white/15',
    heroIcon: 'bg-white/14 text-white shadow-[0_18px_40px_rgba(15,23,42,0.25)]',
    iconWrap: 'bg-rose-100 text-rose-700',
    badge: 'bg-rose-50 text-rose-700 ring-rose-700/10',
    border: 'border-rose-100',
    softSurface: 'bg-rose-50/70',
    sectionTint: 'from-rose-50 via-white to-slate-50',
    progressTrack: 'bg-rose-100',
    progressFill: 'bg-rose-600',
    metricIcon: 'text-rose-700 bg-rose-100',
    link: 'text-rose-700',
  },
}

export function getStageTheme(stageId) {
  return stageThemes[stageId] || stageThemes.dashboard
}

export const peopleOpsStageThemes = {
  hiring: {
    hero: 'from-slate-950 via-primary to-amber-500',
    surfaceTone: 'primary',
    chip: 'bg-white/14 text-white ring-white/20',
  },
  administration: {
    hero: 'from-slate-950 via-sky-700 to-primary',
    surfaceTone: 'accent',
    chip: 'bg-white/14 text-white ring-white/20',
  },
  offboarding: {
    hero: 'from-slate-950 via-red-700 to-orange-500',
    surfaceTone: 'danger',
    chip: 'bg-white/14 text-white ring-white/20',
  },
  platform: {
    hero: 'from-slate-950 via-slate-700 to-primary',
    surfaceTone: 'neutral',
    chip: 'bg-white/14 text-white ring-white/20',
  },
}

export function getPeopleOpsStageTheme(stageId) {
  return peopleOpsStageThemes[stageId] || peopleOpsStageThemes.administration
}
