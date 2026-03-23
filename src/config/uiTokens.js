export const surfaceToneClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-slate-100 text-slate-700',
  purple: 'bg-violet-50 text-violet-700',
  accent: 'bg-sky-50 text-sky-700',
  teal: 'bg-teal-50 text-teal-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  orange: 'bg-orange-50 text-orange-700',
}

export const badgeToneClasses = {
  primary: 'bg-primary/10 text-primary ring-primary/10',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
  danger: 'bg-danger/10 text-danger ring-danger/20',
  info: 'bg-info/10 text-info ring-info/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/10',
  purple: 'bg-violet-50 text-violet-700 ring-violet-700/10',
  accent: 'bg-sky-50 text-sky-700 ring-sky-700/10',
  teal: 'bg-teal-50 text-teal-700 ring-teal-700/10',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-700/10',
  orange: 'bg-orange-50 text-orange-700 ring-orange-700/10',
}

export const statToneClasses = {
  primary: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-danger bg-danger/10',
  info: 'text-info bg-info/10',
  neutral: 'text-slate-700 bg-slate-100',
  purple: 'text-violet-700 bg-violet-50',
  accent: 'text-sky-700 bg-sky-50',
  teal: 'text-teal-700 bg-teal-50',
  cyan: 'text-cyan-700 bg-cyan-50',
  orange: 'text-orange-700 bg-orange-50',
}

export const notificationTypeMeta = {
  info: { icon: 'info', tone: 'primary' },
  success: { icon: 'check_circle', tone: 'success' },
  warning: { icon: 'warning', tone: 'warning' },
  error: { icon: 'error', tone: 'danger' },
  payroll: { icon: 'payments', tone: 'success' },
  schedule: { icon: 'calendar_month', tone: 'accent' },
  request: { icon: 'description', tone: 'primary' },
  login: { icon: 'login', tone: 'info' },
  security: { icon: 'shield', tone: 'warning' },
}

function getToneClass(map, tone, fallback = 'primary') {
  return map[tone] || map[fallback]
}

export function getSurfaceToneClass(tone) {
  return getToneClass(surfaceToneClasses, tone)
}

export function getBadgeToneClass(tone) {
  return getToneClass(badgeToneClasses, tone, 'neutral')
}

export function getStatToneClass(tone) {
  return getToneClass(statToneClasses, tone)
}
