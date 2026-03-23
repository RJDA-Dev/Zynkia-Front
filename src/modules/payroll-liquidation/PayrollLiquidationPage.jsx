import { useState } from 'react'
import { payroll } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import Table from '../../components/ui/Table'
import Tabs from '../../components/ui/Tabs'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import useCurrency from '../../hooks/useCurrency'

export default function PayrollLiquidationPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const { formatCurrency: fc } = useCurrency()
  const toast = useToast()
  const [mode, setMode] = useState(null)
  const [subTab, setSubTab] = useState('liquidacion')
  const [running, setRunning] = useState(false)
  const [generating, setGenerating] = useState(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewName, setPreviewName] = useState('')
  const [otPeriod, setOtPeriod] = useState(() => new Date().toISOString().slice(0, 7))
  const [otWeek, setOtWeek] = useState('')
  const currentPeriod = new Date().toISOString().slice(0, 7)
  const isOT = mode === 'overtime'

  const { data: liqRaw, loading: liqLoading, refetch: refetchLiq } = useFetch(
    () => mode ? payroll.liquidation(mode) : null, { key: `liq-${mode}`, deps: [mode], enabled: !!mode }
  )
  const { data: histRaw, loading: histLoading, refetch: refetchHist } = useFetch(
    () => mode ? payroll.history(mode) : null, { key: `hist-${mode}`, deps: [mode], enabled: !!mode }
  )
  const { data: otBalRaw, refetch: refetchOt } = useFetch(
    () => payroll.overtimeBalances(), { key: 'ot-bal', enabled: isOT }
  )

  const liqPayload = liqRaw?.data?.data || liqRaw?.data || {}
  const items = Array.isArray(liqPayload) ? liqPayload : (liqPayload.data || [])
  const summary = liqPayload.summary || {}
  const histPayload = histRaw?.data?.data || histRaw?.data || []
  const history = Array.isArray(histPayload) ? histPayload : []
  const otGroups = Array.isArray(otBalRaw?.data || otBalRaw) ? (otBalRaw?.data || otBalRaw) : []
  const otPending = otGroups.flatMap(e => (e.records || []).filter(r => r.status === 'pending' || r.status === 'approved').map(r => ({ ...r, empName: e.name, dept: e.department })))

  // --- handlers ---
  const handleRun = async () => {
    setRunning(true)
    try {
      const r = await (isOT ? payroll.runOvertime : payroll.run)(currentPeriod)
      const d = r?.data?.data || r?.data || r
      toast.success(es ? `Procesado: ${d.employees} empleados` : `Processed: ${d.employees} employees`)
      refetchLiq(); refetchHist(); if (isOT) refetchOt()
    } catch (e) {
      const msg = e?.response?.data?.message || ''
      if (msg.includes('already exists')) toast.warning(es ? `Ya procesado para ${currentPeriod}` : `Already processed for ${currentPeriod}`)
      else if (msg.includes('No approved') || msg.includes('No pending')) toast.warning(es ? 'No hay horas extra aprobadas' : 'No approved overtime')
      else toast.error(msg || (es ? 'Error' : 'Error'))
    } finally { setRunning(false) }
  }

  const handleView = async (id, name) => {
    setGenerating(id)
    try { const r = await payroll.viewPayslip(id); const u = r?.url || r?.data?.url; if (u) { setPreviewUrl(u); setPreviewName(name || '') } }
    catch { toast.error(es ? 'Error' : 'Error') } finally { setGenerating(null) }
  }
  const handleDownload = async (id) => {
    setGenerating(id)
    try { const r = await payroll.downloadPayslip(id); const u = r?.url || r?.data?.url; if (u) { const a = document.createElement('a'); a.href = u; a.download = ''; a.click() } }
    catch { toast.error(es ? 'Error' : 'Error') } finally { setGenerating(null) }
  }
  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    try { const r = await payroll.generateAllPayslips(currentPeriod); toast.success(es ? `${(r?.data || r).generated} generados` : `${(r?.data || r).generated} generated`) }
    catch { toast.error(es ? 'Error' : 'Error') } finally { setGeneratingAll(false) }
  }
  const handleApprove = async (id) => { try { await payroll.approveBalance(id); toast.success(es ? 'Aprobado' : 'Approved'); refetchOt() } catch { toast.error('Error') } }
  const handleReject = async (id) => { try { await payroll.rejectBalance(id); toast.success(es ? 'Rechazado' : 'Rejected'); refetchOt() } catch { toast.error('Error') } }
  const handleOtView = async () => {
    try { const r = await payroll.overtimeReportView(otPeriod); const u = r?.url || r?.data?.url; if (u) { setPreviewUrl(u); setPreviewName(`Horas Extra ${otPeriod}`) } }
    catch { toast.error(es ? 'Genera el reporte primero' : 'Generate report first') }
  }
  const handleOtDownload = async () => {
    try { const r = await payroll.overtimeReportDownload(otPeriod); const u = r?.url || r?.data?.url; if (u) { const a = document.createElement('a'); a.href = u; a.download = ''; a.click() } }
    catch { toast.error('Error') }
  }

  // --- MODE SELECTOR ---
  if (!mode) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <p className="text-gray-500 text-sm">{es ? 'Selecciona el tipo de liquidación' : 'Select settlement type'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { key: 'payroll', icon: 'account_balance', t: es ? 'Liquidación Salarial' : 'Salary Settlement', d: es ? 'Salarios, transporte, deducciones salud y pensión' : 'Salaries, transport, health & pension deductions', c: 'from-purple-600 to-primary' },
          { key: 'overtime', icon: 'more_time', t: es ? 'Liquidación Horas Extra' : 'Overtime Settlement', d: es ? 'Horas extra aprobadas por el director' : 'Director-approved overtime hours', c: 'from-amber-500 to-orange-500' },
        ].map(o => (
          <button key={o.key} onClick={() => { setMode(o.key); setSubTab(o.key === 'overtime' ? 'pendientes' : 'liquidacion') }}
            className="group text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${o.c} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-white text-[24px]">{o.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{o.t}</h3>
            <p className="text-sm text-gray-500">{o.d}</p>
          </button>
        ))}
      </div>
    </div>
  )

  // --- SUB MODULE ---
  const subTabs = isOT
    ? [{ key: 'pendientes', label: es ? 'Aprobación' : 'Approval', icon: 'pending_actions' }, { key: 'liquidacion', label: es ? 'Liquidados' : 'Settled', icon: 'payments' }, { key: 'historial', label: es ? 'Historial' : 'History', icon: 'history' }]
    : [{ key: 'liquidacion', label: es ? 'Liquidación' : 'Settlement', icon: 'payments' }, { key: 'historial', label: es ? 'Historial' : 'History', icon: 'history' }, { key: 'desprendibles', label: es ? 'Desprendibles' : 'Pay Stubs', icon: 'receipt_long' }]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode(null)} className="p-2 rounded-xl bg-white border border-gray-200 hover:border-primary/50 text-gray-500 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[20px] ${isOT ? 'text-amber-500' : 'text-primary'}`}>{isOT ? 'more_time' : 'account_balance'}</span>
            <p className="text-gray-500 text-sm">{isOT ? (es ? 'Horas extra — solo aprobadas por director' : 'Overtime — director approved only') : (es ? 'Liquidación salarial' : 'Salary settlement')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isOT && items.length > 0 && <>
            <Button variant="secondary" icon="visibility" onClick={handleOtView}>{es ? 'Ver PDF' : 'View PDF'}</Button>
            <Button variant="secondary" icon="download" onClick={handleOtDownload}>{es ? 'Descargar' : 'Download'}</Button>
          </>}
          {!isOT && items.length > 0 && <Button variant="secondary" icon="picture_as_pdf" onClick={handleGenerateAll} disabled={generatingAll}>{generatingAll ? '...' : (es ? 'Generar PDFs' : 'Generate PDFs')}</Button>}
          <Button icon="calculate" disabled={running} onClick={handleRun}>{running ? '...' : (es ? 'Liquidar' : 'Process')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOT ? <>
          <StatCard label={es ? 'Total Horas Extra' : 'Total Overtime'} value={fc(summary.gross || 0)} icon="more_time" />
          <StatCard label={es ? 'Empleados' : 'Employees'} value={String(summary.employees || 0)} icon="groups" iconColor="text-amber-600 bg-amber-100" />
          <StatCard label={es ? 'Pendientes' : 'Pending'} value={String(otPending.filter(r => r.status === 'pending').length)} icon="pending_actions" iconColor="text-warning bg-warning/10" />
          <StatCard label={es ? 'Aprobados' : 'Approved'} value={String(otPending.filter(r => r.status === 'approved').length)} icon="check_circle" iconColor="text-success bg-success/10" />
        </> : <>
          <StatCard label={es ? 'Bruto' : 'Gross'} value={fc(summary.gross || 0)} icon="payments" />
          <StatCard label={es ? 'Deducciones' : 'Deductions'} value={fc(summary.deductions || 0)} icon="remove_circle" iconColor="text-danger bg-danger/10" />
          <StatCard label={es ? 'Neto' : 'Net'} value={fc(summary.net || 0)} icon="account_balance" iconColor="text-success bg-success/10" />
          <StatCard label={es ? 'Empleados' : 'Employees'} value={String(summary.employees || 0)} icon="groups" />
        </>}
      </div>

      <Tabs items={subTabs} active={subTab} onChange={setSubTab} />

      {/* OT: Approval tab */}
      {subTab === 'pendientes' && isOT && (
        <Card>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <Input label={es ? 'Mes' : 'Month'} type="month" value={otPeriod} onChange={e => setOtPeriod(e.target.value)} className="min-w-[180px]" />
            <Select
              label={es ? 'Semana' : 'Week'}
              value={otWeek}
              onChange={e => setOtWeek(e.target.value)}
              className="min-w-[180px]"
              options={[
                { value: '', label: es ? 'Todas' : 'All' },
                ...[1, 2, 3, 4, 5].map(w => ({ value: w, label: es ? `Semana ${w}` : `Week ${w}` })),
              ]}
            />
          </div>
          {otPending.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">more_time</span>
              <p>{es ? 'Sin horas extra pendientes' : 'No pending overtime'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {otPending.filter(r => !otWeek || String(r.weekNumber) === otWeek).map((r, i) => (
                <div key={r.id || i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.empName || '?'} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.empName}</p>
                      <p className="text-xs text-gray-500">{r.dept}{r.weekNumber ? ` — Sem ${r.weekNumber}` : ''} — {r.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{Number(r.hours).toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">{fc(r.amount)}</p>
                    </div>
                    <Badge color={r.status === 'approved' ? 'success' : 'warning'}>{r.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : (es ? 'Pendiente' : 'Pending')}</Badge>
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(r.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"><span className="material-symbols-outlined text-[18px]">check_circle</span></button>
                        <button onClick={() => handleReject(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><span className="material-symbols-outlined text-[18px]">cancel</span></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Settlement tab */}
      {subTab === 'liquidacion' && (
        <Card>
          {liqLoading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
            items.length === 0
              ? <div className="p-8 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">{isOT ? 'more_time' : 'payments'}</span>
                  <p>{isOT ? (es ? 'Sin horas extra liquidadas. Aprueba y luego liquida.' : 'No settled overtime. Approve then process.') : (es ? 'Sin datos. Ejecuta "Liquidar".' : 'No data. Run "Process".')}</p>
                </div>
              : <Table columns={isOT ? [
                  { key: 'employee', label: es ? 'Empleado' : 'Employee', render: (_, r) => <div className="flex items-center gap-3"><Avatar name={r.employee?.name || '?'} size="sm" /><div><p className="text-sm font-semibold text-gray-900">{r.employee?.name || '-'}</p><p className="text-xs text-gray-500">{r.employee?.department?.name || ''}</p></div></div> },
                  { key: 'overtimeHours', label: es ? 'Horas' : 'Hours', render: v => <span className="font-medium">{Number(v).toFixed(1)}h</span> },
                  { key: 'overtimeAmount', label: es ? 'Valor' : 'Amount', render: v => <span className="font-bold">{fc(v)}</span> },
                  { key: 'status', label: '', render: v => <Badge color={v === 'paid' ? 'success' : 'warning'}>{v === 'paid' ? 'OK' : '...'}</Badge> },
                ] : [
                  { key: 'employee', label: es ? 'Empleado' : 'Employee', render: (_, r) => <div className="flex items-center gap-3"><Avatar name={r.employee?.name || '?'} size="sm" /><div><p className="text-sm font-semibold text-gray-900">{r.employee?.name || '-'}</p><p className="text-xs text-gray-500">{r.employee?.department?.name || ''}</p></div></div> },
                  { key: 'baseSalary', label: es ? 'Base' : 'Base', render: v => fc(v) },
                  { key: 'transportAllowance', label: es ? 'Transporte' : 'Transport', render: v => fc(v || 0) },
                  { key: 'gross', label: es ? 'Bruto' : 'Gross', render: v => <span className="font-medium">{fc(v)}</span> },
                  { key: 'ded', label: es ? 'Ded.' : 'Ded.', render: (_, r) => <span className="text-danger font-medium">-{fc(Number(r.health||0)+Number(r.pension||0)+Number(r.tax||0)+Number(r.deductions||0))}</span> },
                  { key: 'net', label: es ? 'Neto' : 'Net', render: v => <span className="font-bold">{fc(v)}</span> },
                  { key: 'status', label: '', render: v => <Badge color={v === 'paid' ? 'success' : 'warning'}>{v === 'paid' ? 'OK' : '...'}</Badge> },
                  { key: 'actions', label: '', render: (_, r) => <div className="flex gap-1">
                    <button onClick={() => handleView(r.id, r.employee?.name)} disabled={generating === r.id} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">{generating === r.id ? 'hourglass_empty' : 'visibility'}</span></button>
                    <button onClick={() => handleDownload(r.id)} disabled={generating === r.id} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">download</span></button>
                  </div> },
                ]} data={items} />
          )}
        </Card>
      )}

      {/* History tab */}
      {subTab === 'historial' && (
        <Card>
          {histLoading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
            history.length === 0
              ? <div className="p-8 text-center text-gray-400">{es ? 'Sin historial' : 'No history'}</div>
              : <div className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${isOT ? 'bg-amber-100' : 'bg-primary/10'} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined ${isOT ? 'text-amber-600' : 'text-primary'} text-[18px]`}>{isOT ? 'more_time' : 'calendar_month'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{h.period}</p>
                          <p className="text-xs text-gray-500">{h.employeeCount || 0} {es ? 'empleados' : 'employees'} — {new Date(h.processedAt || h.createdAt).toLocaleDateString('es-CO')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-gray-900">{fc(h.totalNet || 0)}</p>
                        <Badge color={h.status === 'completed' ? 'success' : 'warning'}>{h.status === 'completed' ? (es ? 'Procesado' : 'Processed') : (es ? 'Borrador' : 'Draft')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
          )}
        </Card>
      )}

      {/* Pay stubs tab (payroll only) */}
      {subTab === 'desprendibles' && !isOT && (
        <Card>
          {items.length === 0
            ? <div className="p-8 text-center text-gray-400"><span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">receipt_long</span><p>{es ? 'Procesa primero.' : 'Process first.'}</p></div>
            : <div className="divide-y divide-gray-100">
                <div className="px-6 py-3 flex justify-end"><Button variant="secondary" icon="download" onClick={handleGenerateAll} disabled={generatingAll}>{generatingAll ? '...' : (es ? 'Generar Todos' : 'Generate All')}</Button></div>
                {items.map((item, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={item.employee?.name || '?'} size="sm" />
                      <div><p className="text-sm font-semibold text-gray-900">{item.employee?.name || '-'}</p><p className="text-xs text-gray-500">{item.employee?.department?.name || ''}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex gap-4 text-xs">
                        <div className="text-right"><p className="text-gray-400">{es ? 'Bruto' : 'Gross'}</p><p className="font-semibold">{fc(item.gross)}</p></div>
                        <div className="text-right"><p className="text-gray-400">{es ? 'Neto' : 'Net'}</p><p className="font-bold">{fc(item.net)}</p></div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleView(item.id, item.employee?.name)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200"><span className="material-symbols-outlined text-[16px]">visibility</span>{es ? 'Ver' : 'View'}</button>
                        <button onClick={() => handleDownload(item.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"><span className="material-symbols-outlined text-[16px]">download</span>PDF</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] mx-4 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] ${isOT ? 'text-amber-500' : 'text-primary'}`}>description</span>
                <p className="text-sm font-semibold text-gray-900">{previewName || (es ? 'Documento' : 'Document')}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewUrl} download className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">download</span></a>
                <button onClick={() => setPreviewUrl(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><span className="material-symbols-outlined text-[18px]">close</span></button>
              </div>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="PDF" />
          </div>
        </div>
      )}
    </div>
  )
}
