import { lifecycleDashboard, lifecycleStages, stageBlueprints } from '../data/hrLifecycle'
import { defaultCompanyId, getCompanyProfile } from '../data/companyProfiles'
import { getHiringWorkspace } from '../data/hiringFlow'
import { createAdministrationEmployee, getAdministrationWorkspace } from '../data/administrationFlow'
import { createOffboardingCase as buildOffboardingCase, getOffboardingWorkspace } from '../data/offboardingFlow'
import { invalidateCache } from '../hooks/useFetch'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const STORAGE_PREFIX = 'zekya-lifecycle-workspace'

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function resolveCompanyId(companyId) {
  return companyId || defaultCompanyId
}

function stageCacheKey(stageId, companyId) {
  return `lifecycle-stage-${stageId}-${companyId || 'default'}`
}

function storageKey(stageId, companyId) {
  return `${STORAGE_PREFIX}:${resolveCompanyId(companyId)}:${stageId}`
}

function getStageWorkspace(stageId, companyId) {
  const resolvedCompanyId = resolveCompanyId(companyId)

  if (stageId === 'hiring') return getHiringWorkspace(resolvedCompanyId)
  if (stageId === 'administration') return getAdministrationWorkspace(resolvedCompanyId)
  if (stageId === 'offboarding') return getOffboardingWorkspace(resolvedCompanyId)
  return null
}

function readWorkspace(stageId, companyId) {
  const fallback = getStageWorkspace(stageId, companyId)
  if (!fallback || typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(storageKey(stageId, companyId))
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeWorkspace(stageId, companyId, workspace) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(storageKey(stageId, companyId), JSON.stringify(workspace))
  } catch {
    return
  } finally {
    invalidateCache(stageCacheKey(stageId, companyId))
  }
}

export const hrLifecycleService = {
  async getDashboard(companyId = defaultCompanyId) {
    await wait(140)
    const company = getCompanyProfile(companyId)
    return clone({
      ...lifecycleDashboard,
      company,
      companyDashboard: company.dashboard,
      stages: lifecycleStages,
    })
  },

  async getStage(stageId, companyId = defaultCompanyId) {
    await wait(180)
    const stage = lifecycleStages.find((item) => item.id === stageId)
    const blueprint = stageBlueprints[stageId]
    const company = getCompanyProfile(companyId)
    const companyStage = company.stages?.[stageId]

    if (!stage || !blueprint) {
      throw new Error(`Unknown stage "${stageId}"`)
    }

    return clone({
      stage,
      company,
      companyStage,
      ...(getStageWorkspace(stageId, companyId) ? { workspace: readWorkspace(stageId, companyId) } : {}),
      ...blueprint,
    })
  },

  persistWorkspace(stageId, companyId = defaultCompanyId, workspace) {
    writeWorkspace(stageId, companyId, workspace)
    return clone(workspace)
  },

  deliverCandidateToAdministration(companyId = defaultCompanyId, candidate) {
    const currentWorkspace = readWorkspace('administration', companyId)
    const nextEmployee = createAdministrationEmployee(resolveCompanyId(companyId), candidate)
    const exists = currentWorkspace.employees.some((employee) => employee.employeeCode === nextEmployee.employeeCode)

    if (exists) return clone(currentWorkspace)

    const nextWorkspace = {
      ...currentWorkspace,
      employees: [nextEmployee, ...currentWorkspace.employees],
    }

    writeWorkspace('administration', companyId, nextWorkspace)
    return clone(nextWorkspace)
  },

  createOffboardingCase(companyId = defaultCompanyId, employee) {
    const currentWorkspace = readWorkspace('offboarding', companyId)
    const nextCase = buildOffboardingCase(resolveCompanyId(companyId), employee)
    const exists = currentWorkspace.cases.some((item) => item.employeeCode === nextCase.employeeCode)

    if (exists) return clone(currentWorkspace)

    const nextWorkspace = {
      ...currentWorkspace,
      cases: [nextCase, ...currentWorkspace.cases],
    }

    writeWorkspace('offboarding', companyId, nextWorkspace)
    return clone(nextWorkspace)
  },
}
