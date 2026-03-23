import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { recruitment } from '../../api/services'
import AppLoader from '../../components/ui/AppLoader'
import Button from '../../components/ui/Button'
import FileUpload from '../../components/ui/FileUpload'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Badge from '../../components/ui/Badge'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'

export default function CandidateApplyPage() {
  const { vacancyUid } = useParams()
  const { lang } = useLang()
  const toast = useToast()
  const { formatCurrency } = useCurrency()
  const es = lang === 'es'
  const [resumeFiles, setResumeFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', expectedSalary: '', linkedin: '', portfolio: '', source: 'LinkedIn', notes: '' })

  const { data, loading } = useFetch(() => recruitment.getPublicVacancy(vacancyUid), { key: `public-vacancy-${vacancyUid}`, deps: [vacancyUid] })
  const vacancy = data || null
  const salaryRange = useMemo(() => vacancy ? `${formatCurrency(vacancy.salaryMin, 'COP')} – ${formatCurrency(vacancy.salaryMax, 'COP')}` : '', [formatCurrency, vacancy])
  const set = (k) => (e) => setForm((c) => ({ ...c, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || resumeFiles.length === 0) { toast.error(es ? 'Completa nombre, correo y hoja de vida.' : 'Complete name, email and resume.'); return }
    setSubmitting(true)
    try {
      const r = await recruitment.submitApplicationByUid(vacancyUid, { ...form, expectedSalary: Number(form.expectedSalary) || 0, resumeFileName: resumeFiles[0]?.name || 'CV.pdf' })
      setResult(r)
    } catch { toast.error(es ? 'No fue posible registrar.' : 'Could not submit.') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <main className="min-h-screen bg-[linear-gradient(160deg,_#f8fafc,_#ecfeff_35%,_#fefce8_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl"><AppLoader inline label={es ? 'Cargando vacante' : 'Loading vacancy'} /></div>
    </main>
  )

  if (!vacancy) return (
    <main className="min-h-screen bg-[linear-gradient(160deg,_#f8fafc,_#ecfeff_35%,_#fefce8_100%)] flex items-center justify-center px-4">
      <div className="max-w-sm rounded-[--radius-xl] border border-white/70 bg-white/88 p-8 text-center shadow-[--shadow-md]">
        <span className="material-symbols-outlined text-[44px] text-slate-300">work_off</span>
        <h1 className="mt-4 text-xl font-black text-slate-900">{es ? 'Vacante no disponible' : 'Vacancy not available'}</h1>
        <p className="mt-2 text-sm text-slate-500">{es ? 'El formulario fue cerrado o el UID no existe.' : 'The form was closed or the UID does not exist.'}</p>
        <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-primary">{es ? 'Volver a Zekya HR' : 'Back to Zekya HR'}</Link>
      </div>
    </main>
  )

  const steps = [
    es ? 'Registro y score inicial del CV.' : 'Registration and initial resume scoring.',
    es ? 'Acceso temporal para pruebas y seguimiento.' : 'Temporary access for tests and follow-up.',
    es ? 'Entrevistas, documentos, contrato y vinculación.' : 'Interviews, documents, contract and activation.',
  ]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_28%),linear-gradient(160deg,_#f8fafc,_#ecfeff_32%,_#fff7ed_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{es ? 'Portal de postulaciones' : 'Application portal'}</p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">{vacancy.title}</h1>
          </div>
          <Badge color="primary" size="lg">{vacancy.uid}</Badge>
        </div>

        {result ? (
          <div className="rounded-[--radius-lg] sm:rounded-[32px] border border-emerald-200 bg-emerald-50/90 p-5 sm:p-8 shadow-[0_16px_48px_rgba(15,23,42,0.06)] animate-expand-in">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{es ? 'Postulación recibida' : 'Application received'}</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{result.applicant?.name}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[--radius-md] bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{es ? 'Usuario temporal' : 'Temp username'}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 break-all">{result.credentials?.username}</p>
              </div>
              <div className="rounded-[--radius-md] bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{es ? 'Contraseña temporal' : 'Temp password'}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 break-all">{result.credentials?.temporaryPassword}</p>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-slate-600">{es ? 'Usa estas credenciales para pruebas, seguimiento y carga de documentos.' : 'Use these credentials for tests, tracking and document upload.'}</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-[--radius-lg] sm:rounded-[32px] border border-white/70 bg-white/88 shadow-[--shadow-md]">
              <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,_rgba(15,118,110,0.10),_rgba(255,255,255,0.96))] px-4 py-4 sm:px-6 sm:py-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(vacancy.channels || []).map((ch) => (
                    <span key={ch} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{ch}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm leading-6 text-slate-600">{vacancy.description}</p>
              </div>

              <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
                <Input label={es ? 'Nombre completo' : 'Full name'} value={form.name} onChange={set('name')} />
                <Input label={es ? 'Correo' : 'Email'} type="email" value={form.email} onChange={set('email')} />
                <Input label={es ? 'Celular' : 'Phone'} value={form.phone} onChange={set('phone')} />
                <Input label={es ? 'Aspiración salarial' : 'Expected salary'} type="number" value={form.expectedSalary} onChange={set('expectedSalary')} />
                <Input label="LinkedIn" value={form.linkedin} onChange={set('linkedin')} />
                <Input label={es ? 'Portafolio' : 'Portfolio'} value={form.portfolio} onChange={set('portfolio')} />
                <Input className="sm:col-span-2" label={es ? 'Canal de origen' : 'Source'} value={form.source} onChange={set('source')} />
                <div className="sm:col-span-2">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{es ? 'Hoja de vida' : 'Resume'}</p>
                  <FileUpload onFiles={setResumeFiles} accept=".pdf,.doc,.docx" maxSize="12MB" />
                  {resumeFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {resumeFiles.map((f) => <span key={f.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{f.name}</span>)}
                    </div>
                  )}
                </div>
                <Textarea className="sm:col-span-2" rows={4} label={es ? 'Mensaje' : 'Message'} value={form.notes} onChange={set('notes')} />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-[10px] sm:text-xs text-slate-500">{es ? 'Recibirás un usuario temporal para pruebas y seguimiento.' : 'You will receive a temporary account for tests and tracking.'}</p>
                <Button icon="send" onClick={handleSubmit} loading={submitting} className="w-full sm:w-auto">{es ? 'Enviar postulación' : 'Submit application'}</Button>
              </div>
            </div>

            <div className="space-y-4 lg:order-last">
              <div className="rounded-[--radius-lg] sm:rounded-[--radius-xl] border border-white/70 bg-[linear-gradient(150deg,_#082f2e,_#0f766e_58%,_#14532d)] p-5 text-white shadow-[--shadow-lg]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80">{es ? 'Resumen' : 'Snapshot'}</p>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <p>{vacancy.area} · {vacancy.workMode}</p>
                  <p>{vacancy.contractType}</p>
                  <p className="font-semibold text-white">{salaryRange}</p>
                  <p>{es ? 'Cierre' : 'Closing'} {vacancy.closingDate}</p>
                  <p>{vacancy.openings} {es ? 'cupos' : 'openings'}</p>
                </div>
              </div>

              <div className="rounded-[--radius-lg] sm:rounded-[--radius-xl] border border-slate-200 bg-white/88 p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Qué sigue' : 'What happens next'}</p>
                <div className="mt-3 space-y-2">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-[--radius-sm] bg-slate-50 px-3 py-2.5">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary shrink-0">{i + 1}</span>
                      <p className="text-xs sm:text-sm text-slate-600">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
