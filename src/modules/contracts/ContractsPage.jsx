import { useMemo, useState } from 'react'
import { extractList, extractStats } from '../../api/response'
import { contracts } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import InfoCell from '../../components/ui/InfoCell'
import Input from '../../components/ui/Input'
import SidebarList from '../../components/ui/SidebarList'
import SplitLayout from '../../components/ui/SplitLayout'
import StatCard from '../../components/ui/StatCard'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import Spinner from '../../components/ui/Spinner'

export default function ContractsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { formatCurrency } = useCurrency()
  const [selectedId, setSelectedId] = useState('')
  const [signatureDraft, setSignatureDraft] = useState({ contractId: '', value: '' })
  const [showViewer, setShowViewer] = useState(false)

  const { data, loading, invalidate } = useFetch(() => contracts.list(), { key: 'contracts-list' })
  const list = useMemo(() => extractList(data), [data])
  const stats = useMemo(() => extractStats(data, { total: 0, pending: 0, signed: 0, sent: 0 }), [data])
  const effectiveSelectedId = selectedId || list[0]?.id || null
  const selected = useMemo(() => list.find((i) => String(i.id) === String(effectiveSelectedId)) || null, [effectiveSelectedId, list])
  const signature = signatureDraft.contractId === String(effectiveSelectedId) ? signatureDraft.value : (selected?.digitalSignature || selected?.candidateName || '')

  const handleSend = async () => {
    if (!selected) return
    try { await contracts.send(selected.id); toast.success(es ? 'Contrato enviado' : 'Contract sent'); invalidate() }
    catch { toast.error(es ? 'Error al enviar' : 'Send error') }
  }

  const handleSign = async () => {
    if (!selected) return
    try {
      const c = await contracts.sign(selected.id, signature)
      toast.success(c?.linkedEmployee?.employeeCode ? (es ? `Firmado · Empleado ${c.linkedEmployee.employeeCode}` : `Signed · Employee ${c.linkedEmployee.employeeCode}`) : (es ? 'Contrato firmado' : 'Contract signed'))
      invalidate()
    } catch { toast.error(es ? 'Error al firmar' : 'Sign error') }
  }

  const handleExport = async () => {
    if (!selected) return
    try { const r = await contracts.export(selected.id); const u = r?.url; if (u) window.open(u, '_blank') }
    catch { toast.error(es ? 'Error al exportar' : 'Export error') }
  }

  const selectContract = (c) => {
    setSelectedId(String(c.id))
    setSignatureDraft({ contractId: String(c.id), value: c.digitalSignature || c.candidateName || '' })
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 sm:space-y-6">
      <p className="text-xs sm:text-sm text-slate-500">{es ? 'Visualiza, envía, firma y exporta contratos.' : 'View, send, sign and export contracts.'}</p>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard label={es ? 'Contratos' : 'Contracts'} value={stats.total || 0} icon="contract_edit" />
        <StatCard label={es ? 'Pendientes' : 'Pending'} value={stats.pending || 0} icon="signature" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label={es ? 'Firmados' : 'Signed'} value={stats.signed || 0} icon="task_alt" iconColor="text-success bg-success/10" />
        <StatCard label={es ? 'Enviados' : 'Sent'} value={stats.sent || 0} icon="outgoing_mail" iconColor="text-blue-600 bg-blue-50" />
      </div>

      <SplitLayout
        sidebar={
          <Card title={es ? 'Bandeja' : 'Inbox'} subtitle={es ? 'Selecciona un contrato.' : 'Select a contract.'}>
            {loading ? (
              <Spinner />
            ) : (
              <SidebarList
                groups={[{ id: 'all', label: es ? 'Contratos' : 'Contracts', color: 'text-slate-500', items: list.map((c) => ({
                  id: c.id,
                  title: c.candidateName,
                  subtitle: c.roleTitle,
                  meta: c.code,
                  badge: { color: c.status === 'signed' ? 'success' : 'warning', label: c.status === 'signed' ? (es ? 'Firmado' : 'Signed') : (es ? 'Pendiente' : 'Pending') },
                })) }]}
                selectedId={selected?.id}
                onSelect={(id) => selectContract(list.find((c) => c.id === id || String(c.id) === String(id)))}
              />
            )}
          </Card>
        }
      >

        {!selected ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-[48px]">contract_edit</span>
              <p className="mt-3 text-sm">{es ? 'Selecciona un contrato de la bandeja.' : 'Select a contract from the inbox.'}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card
              title={selected.candidateName}
              subtitle={`${selected.roleTitle} · ${selected.code}`}
              actions={<Badge color={selected.status === 'signed' ? 'success' : 'warning'}>{selected.status === 'signed' ? (es ? 'Firmado' : 'Signed') : (es ? 'Pendiente' : 'Pending')}</Badge>}
            >
              <div className="p-4 sm:p-5 space-y-4">
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                  {[
                    { k: es ? 'Salario' : 'Salary', v: formatCurrency(selected.salary || 0) },
                    { k: es ? 'Inicio' : 'Start', v: selected.startDate },
                    { k: es ? 'Tipo' : 'Type', v: selected.contractType },
                    { k: 'Email', v: selected.candidateEmail },
                  ].map((i) => (
                    <InfoCell key={i.k} label={i.k} value={i.v} />
                  ))}
                </div>

                {(selected.documents || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.documents.map((d) => <span key={d} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{d}</span>)}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3 text-center text-xs">
                  {[
                    { k: es ? 'Generado' : 'Generated', v: selected.generatedAt?.slice(0, 10) || '—' },
                    { k: es ? 'Enviado' : 'Sent', v: selected.emailSentAt ? selected.emailSentAt.slice(0, 16).replace('T', ' · ') : (es ? 'Pendiente' : 'Pending') },
                    { k: es ? 'Firmado' : 'Signed', v: selected.signedAt ? selected.signedAt.slice(0, 16).replace('T', ' · ') : (es ? 'Pendiente' : 'Pending') },
                  ].map((i) => (
                    <InfoCell key={i.k} label={i.k} value={i.v} className="text-center" />
                  ))}
                </div>

                <div className="rounded-[--radius-md] border border-slate-200 bg-slate-50/70 p-4">
                  <Input label={es ? 'Firma digital' : 'Digital signature'} value={signature} onChange={(e) => setSignatureDraft({ contractId: String(effectiveSelectedId || ''), value: e.target.value })} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" icon="mail" onClick={handleSend}>{selected.emailSentAt ? (es ? 'Reenviar' : 'Resend') : (es ? 'Enviar' : 'Send')}</Button>
                    <Button size="sm" variant="secondary" icon="download" onClick={handleExport}>{es ? 'Exportar' : 'Export'}</Button>
                    <Button size="sm" variant="secondary" icon="picture_as_pdf" onClick={() => setShowViewer(true)}>{es ? 'Ver PDF' : 'View PDF'}</Button>
                    <Button size="sm" icon="draw" onClick={handleSign} disabled={selected.status === 'signed'}>{selected.status === 'signed' ? (es ? 'Firmado' : 'Signed') : (es ? 'Firmar' : 'Sign')}</Button>
                  </div>
                </div>

                {selected.linkedEmployee && (
                  <div className="rounded-[--radius-md] border border-emerald-200 bg-emerald-50/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{es ? 'Empleado creado' : 'Employee created'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge color="success" icon="badge">{selected.linkedEmployee.employeeCode}</Badge>
                      <Badge color="neutral">{selected.linkedEmployee.roleTitle}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{es ? 'La firma activó el colaborador en empleados.' : 'Signing activated the employee record.'}</p>
                  </div>
                )}
              </div>
            </Card>

            {selected.documentUrl && (
              <Card title={es ? 'Documento' : 'Document'} subtitle={selected.code}>
                <div className="p-3 sm:p-4">
                  <div className="rounded-[--radius-md] border border-slate-200 bg-slate-950 p-2 sm:p-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                    <div className="relative overflow-hidden rounded-[--radius-sm] bg-white">
                      <object data={selected.documentUrl} type="application/pdf" className="h-[400px] sm:h-[520px] lg:h-[600px] w-full">
                        <iframe title={selected.code} src={selected.documentUrl} className="h-[400px] sm:h-[520px] lg:h-[600px] w-full" />
                      </object>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <Button size="sm" variant="ghost" icon="zoom_in" onClick={() => setShowViewer(true)}>{es ? 'Pantalla completa' : 'Fullscreen'}</Button>
                    <Button size="sm" variant="ghost" icon="download" onClick={handleExport}>{es ? 'Descargar' : 'Download'}</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </SplitLayout>

      {showViewer && selected?.documentUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col animate-fade-in" onClick={() => setShowViewer(false)}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 shrink-0">
            <div className="flex items-center gap-3 text-white min-w-0">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span className="text-sm font-semibold truncate">{selected.code} — {selected.candidateName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" icon="download" onClick={(e) => { e.stopPropagation(); handleExport() }} className="text-white hover:bg-white/10">{es ? 'Descargar' : 'Download'}</Button>
              <button onClick={() => setShowViewer(false)} className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 px-3 pb-3 sm:px-8 sm:pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="h-full rounded-[--radius-sm] sm:rounded-[--radius-md] overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
              <iframe title={selected.code} src={selected.documentUrl} className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
