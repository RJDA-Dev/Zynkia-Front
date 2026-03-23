import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contracts, recruitment } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatCard from '../../components/ui/StatCard'
import Textarea from '../../components/ui/Textarea'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import Spinner from '../../components/ui/Spinner'

const applicantColorMap = { review: 'warning', interview: 'info', docs_pending: 'warning', contract_signature: 'purple', hired: 'success' }
const stageIcons = { review: 'description', interview: 'groups', docs_pending: 'upload_file', contract_signature: 'draw', hired: 'verified' }

const emptyForm = {
  title: '', area: 'Tecnología', openings: 1, salaryMin: '', salaryMax: '', location: 'Bogotá', workMode: 'Híbrido', contractType: 'Indefinido', openingDate: new Date().toISOString().slice(0, 10), closingDate: new Date().toISOString().slice(0, 10), channels: 'LinkedIn, Magneto', description: '',
}

export default function VacanciesPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const navigate = useNavigate()
  const toast = useToast()
  const { formatCurrency } = useCurrency()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [copiedVacancyId, setCopiedVacancyId] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedVacancy, setExpandedVacancy] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })

  const { data, loading, invalidate } = useFetch(() => recruitment.list({ search, status }), { key: `vacancies-${search}-${status}`, deps: [search, status] })
  const response = data || {}
  const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : response?.data?.data || []
  const stats = response?.stats || response?.data?.stats || { total: 0, open: 0, screening: 0, applicants: 0 }

  const statusOptions = useMemo(() => ([
    { value: '', label: es ? 'Todos' : 'All' },
    { value: 'open', label: es ? 'Abiertas' : 'Open' },
    { value: 'screening', label: es ? 'En filtro' : 'Screening' },
  ]), [es])

  const resetForm = () => setForm({ ...emptyForm })

  const handleCreate = async () => {
    setSaving(true)
    try {
      await recruitment.create({ ...form, openings: Number(form.openings) || 1, salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 })
      toast.success(es ? 'Vacante creada' : 'Vacancy created')
      setOpenCreate(false)
      resetForm()
      invalidate()
    } catch { toast.error(es ? 'No se pudo crear la vacante' : 'Could not create vacancy') }
    finally { setSaving(false) }
  }

  const handleAdvanceApplicant = async (vacancyId, applicant) => {
    try {
      if (applicant.status === 'review') {
        await recruitment.updateApplicantStatus(vacancyId, applicant.id, 'interview', { nextStep: es ? 'Entrevista técnica' : 'Technical interview' })
      } else if (applicant.status === 'interview') {
        await recruitment.updateApplicantStatus(vacancyId, applicant.id, 'docs_pending', { nextStep: es ? 'Subir documentos' : 'Upload documents' })
      } else if (applicant.status === 'docs_pending') {
        await contracts.createFromApplicant(vacancyId, applicant.id)
      }
      toast.success(es ? 'Siguiente paso actualizado' : 'Next step updated')
      invalidate()
    } catch { toast.error(es ? 'No se pudo mover el candidato' : 'Could not move candidate') }
  }

  const getApplicationUrl = (v) => {
    const path = v.applicationPath || `/apply/${v.uid}`
    return typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
  }

  const handleCopyLink = async (vacancy) => {
    try {
      await navigator?.clipboard?.writeText(getApplicationUrl(vacancy))
      setCopiedVacancyId(String(vacancy.id))
      toast.success(es ? 'Link copiado' : 'Link copied')
      setTimeout(() => setCopiedVacancyId(''), 1800)
    } catch { toast.error(es ? 'No se pudo copiar' : 'Could not copy') }
  }

  const stageLabel = (s) => {
    const map = { review: es ? 'Revisión' : 'Review', interview: es ? 'Entrevista' : 'Interview', docs_pending: es ? 'Documentos' : 'Documents', contract_signature: es ? 'Firma' : 'Signature', hired: es ? 'Vinculado' : 'Hired' }
    return map[s] || s
  }

  const actionLabel = (s) => {
    const map = { review: es ? 'Agendar entrevista' : 'Schedule interview', interview: es ? 'Solicitar documentos' : 'Request docs', docs_pending: es ? 'Enviar a firma' : 'Send to signature' }
    return map[s] || ''
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs sm:text-sm text-slate-500">{es ? 'Vacantes con UID, rango salarial y seguimiento de postulantes.' : 'Vacancies with UID, salary range and applicant tracking.'}</p>
        <Button icon="add_circle" onClick={() => setOpenCreate(true)} className="w-full sm:w-auto">{es ? 'Crear vacante' : 'Create vacancy'}</Button>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard label={es ? 'Vacantes' : 'Vacancies'} value={stats.total || 0} icon="work" />
        <StatCard label={es ? 'Abiertas' : 'Open'} value={stats.open || 0} icon="campaign" iconColor="text-primary bg-primary/10" />
        <StatCard label={es ? 'En filtro' : 'Screening'} value={stats.screening || 0} icon="manage_search" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Postulaciones' : 'Applicants'} value={stats.applicants || 0} icon="group_add" iconColor="text-blue-600 bg-blue-50" />
      </div>

      <Card title={es ? 'Banco de vacantes' : 'Vacancy bank'} subtitle={es ? 'Crea requerimientos, publica y sigue a cada postulante.' : 'Create requisitions, publish and track every applicant.'}>
        <div className="grid gap-3 border-b border-slate-200/80 p-4 sm:p-6 sm:grid-cols-[minmax(0,1fr)_180px]">
          <Input icon="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={es ? 'Buscar UID, cargo o área' : 'Search UID, role or area'} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
        </div>

        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl">work_off</span>
            <p className="mt-3 text-sm">{es ? 'No hay vacantes.' : 'No vacancies.'}</p>
          </div>
        ) : (
          <div className="space-y-3 p-3 sm:p-6">
            {list.map((vacancy) => {
              const isExpanded = expandedVacancy === vacancy.id
              return (
                <article key={vacancy.id} className="overflow-hidden rounded-[--radius-lg] sm:rounded-[--radius-xl] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
                  <button type="button" onClick={() => setExpandedVacancy(isExpanded ? null : vacancy.id)} className="w-full text-left px-4 py-4 sm:px-5 sm:py-5 bg-[linear-gradient(135deg,_rgba(15,118,110,0.06),_rgba(255,255,255,0.94))]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge color="primary" size="sm">{vacancy.uid}</Badge>
                          <Badge color={vacancy.status === 'open' ? 'success' : 'warning'} size="sm">
                            {vacancy.status === 'open' ? (es ? 'Abierta' : 'Open') : (es ? 'En filtro' : 'Screening')}
                          </Badge>
                          <Badge color="neutral" size="sm" icon="group_add">{vacancy.applicantsCount}</Badge>
                        </div>
                        <h3 className="mt-2 text-base sm:text-xl font-bold tracking-tight text-slate-900">{vacancy.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[vacancy.area, vacancy.workMode, `${formatCurrency(vacancy.salaryMin)}-${formatCurrency(vacancy.salaryMax)}`].map((t) => (
                            <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-xs font-medium text-slate-600 ring-1 ring-slate-200">{t}</span>
                          ))}
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200/70 animate-fade-in">
                      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs sm:text-sm text-slate-600 leading-5">{vacancy.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[
                            `${es ? 'Apertura' : 'Open'} ${vacancy.openingDate}`,
                            `${es ? 'Cierre' : 'Close'} ${vacancy.closingDate}`,
                            `${vacancy.openings} ${es ? 'cupos' : 'openings'}`,
                            vacancy.recruiter,
                          ].map((t) => (
                            <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Link público' : 'Public link'}</p>
                          <div className="flex gap-1.5">
                            <Button size="xs" variant="secondary" icon={copiedVacancyId === String(vacancy.id) ? 'check' : 'content_copy'} onClick={() => handleCopyLink(vacancy)}>
                              {copiedVacancyId === String(vacancy.id) ? (es ? 'Copiado' : 'Copied') : (es ? 'Copiar' : 'Copy')}
                            </Button>
                            <Button size="xs" variant="ghost" icon="open_in_new" onClick={() => window.open(getApplicationUrl(vacancy), '_blank', 'noopener,noreferrer')} />
                          </div>
                        </div>
                        <p className="break-all text-[11px] font-medium text-slate-500 bg-slate-50 rounded-xl px-3 py-2">{getApplicationUrl(vacancy)}</p>
                        {(vacancy.channels || []).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {vacancy.channels.map((ch) => (
                              <span key={ch} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{ch}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
                          {es ? 'Pipeline de candidatos' : 'Candidate pipeline'} ({(vacancy.applicants || []).length})
                        </p>

                        {(vacancy.applicants || []).length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-6">{es ? 'Sin postulantes aún.' : 'No applicants yet.'}</p>
                        ) : (
                          <div className="space-y-2.5">
                            {(vacancy.applicants || []).map((a) => (
                              <div key={a.id} className="rounded-[--radius-md] border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                                      <Badge color={applicantColorMap[a.status] || 'neutral'} size="sm" icon={stageIcons[a.status]}>
                                        {stageLabel(a.status)}
                                      </Badge>
                                      {a.contractId && <Badge color="success" size="sm">CTR-{String(a.contractId).padStart(3, '0')}</Badge>}
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500 truncate">{a.email}</p>
                                  </div>
                                </div>

                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {[
                                    `${a.source} · ${a.appliedAt}`,
                                    `Score ${a.resumeScore || 0}`,
                                    `${es ? 'Expectativa' : 'Expected'} ${formatCurrency(a.expectedSalary || 0)}`,
                                  ].map((t) => (
                                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{t}</span>
                                  ))}
                                </div>

                                {a.portalAccess && (
                                  <div className="mt-2.5 rounded-[--radius-sm] border border-emerald-200 bg-emerald-50/80 px-3 py-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{es ? 'Acceso temporal' : 'Temp access'}</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                                      <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-emerald-100">{a.portalAccess.username}</span>
                                      <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-emerald-100">{a.portalAccess.temporaryPassword}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <p className="text-[10px] text-slate-400 truncate">{a.nextStep}</p>
                                  {a.status === 'contract_signature' && a.contractId ? (
                                    <Button size="xs" variant="secondary" icon="draw" onClick={() => navigate('/contracts')}>{es ? 'Contrato' : 'Contract'}</Button>
                                  ) : a.status === 'hired' ? (
                                    <Button size="xs" variant="success" icon="verified" onClick={() => navigate('/employees')}>{es ? 'Vinculado' : 'Hired'}</Button>
                                  ) : actionLabel(a.status) ? (
                                    <Button size="xs" icon="arrow_forward" onClick={() => handleAdvanceApplicant(vacancy.id, a)}>{actionLabel(a.status)}</Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={openCreate}
        onClose={() => { setOpenCreate(false); resetForm() }}
        title={es ? 'Crear vacante' : 'Create vacancy'}
        subtitle={es ? 'Define UID y publica.' : 'Define UID and publish.'}
        icon="work"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpenCreate(false); resetForm() }}>{es ? 'Cancelar' : 'Cancel'}</Button>
            <Button icon="publish" onClick={handleCreate} loading={saving}>{es ? 'Publicar' : 'Publish'}</Button>
          </>
        }
      >
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2">
          <Input label={es ? 'Cargo' : 'Role'} value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <Input label={es ? 'Área' : 'Area'} value={form.area} onChange={(e) => setForm((c) => ({ ...c, area: e.target.value }))} />
          <Input label={es ? 'Cupos' : 'Openings'} type="number" value={form.openings} onChange={(e) => setForm((c) => ({ ...c, openings: e.target.value }))} />
          <Input label={es ? 'Ubicación' : 'Location'} value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} />
          <Input label={es ? 'Salario mín' : 'Min salary'} type="number" value={form.salaryMin} onChange={(e) => setForm((c) => ({ ...c, salaryMin: e.target.value }))} />
          <Input label={es ? 'Salario máx' : 'Max salary'} type="number" value={form.salaryMax} onChange={(e) => setForm((c) => ({ ...c, salaryMax: e.target.value }))} />
          <Input label={es ? 'Apertura' : 'Opening'} type="date" value={form.openingDate} onChange={(e) => setForm((c) => ({ ...c, openingDate: e.target.value }))} />
          <Input label={es ? 'Cierre' : 'Closing'} type="date" value={form.closingDate} onChange={(e) => setForm((c) => ({ ...c, closingDate: e.target.value }))} />
          <Input label={es ? 'Modalidad' : 'Work mode'} value={form.workMode} onChange={(e) => setForm((c) => ({ ...c, workMode: e.target.value }))} />
          <Input label={es ? 'Tipo contrato' : 'Contract type'} value={form.contractType} onChange={(e) => setForm((c) => ({ ...c, contractType: e.target.value }))} />
          <Input className="sm:col-span-2" label={es ? 'Canales' : 'Channels'} value={form.channels} onChange={(e) => setForm((c) => ({ ...c, channels: e.target.value }))} />
          <Textarea className="sm:col-span-2" label={es ? 'Descripción' : 'Description'} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
