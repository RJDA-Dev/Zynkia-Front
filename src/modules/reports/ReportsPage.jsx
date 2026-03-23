import { useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { contracts, inventory, recruitment, reports } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Tabs from '../../components/ui/Tabs'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import { exportReportCSV, exportReportPDF } from '../../utils/reportPdf'
import Spinner from '../../components/ui/Spinner'

const PALETTE = ['#0f766e', '#0ea5e9', '#f59e0b', '#10b981', '#334155']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-[--radius-md] border border-slate-200 bg-white px-3 py-2 shadow-[0_18px_35px_rgba(15,23,42,0.10)]">
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p> : null}
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name || entry.dataKey}
            </span>
            <strong className="text-slate-900">{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function parseModuleResponse(response) {
  if (!response) return { list: [], stats: {} }
  if (Array.isArray(response?.data)) return { list: response.data, stats: response.stats || {} }
  if (Array.isArray(response)) return { list: response, stats: {} }
  return {
    list: response?.data?.data || [],
    stats: response?.stats || response?.data?.stats || {},
  }
}

export default function ReportsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const [activeTab, setActiveTab] = useState('general')
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef(null)

  const { data: dashData, loading: dashLoading } = useFetch(() => reports.dashboard(), { key: 'rpt-dash' })
  const { data: payData, loading: payLoading } = useFetch(() => reports.payroll(), { key: 'rpt-pay', enabled: activeTab === 'nomina' || activeTab === 'general' })
  const { data: attData, loading: attLoading } = useFetch(() => reports.attendance(), { key: 'rpt-att', enabled: activeTab === 'asistencia' || activeTab === 'general' })
  const { data: reqData, loading: reqLoading } = useFetch(() => reports.requests(), { key: 'rpt-req', enabled: activeTab === 'solicitudes' || activeTab === 'general' })
  const { data: invData } = useFetch(() => inventory.list({}), { key: 'rpt-inventory', enabled: activeTab === 'general' })
  const { data: vacData } = useFetch(() => recruitment.list({}), { key: 'rpt-vacancies', enabled: activeTab === 'general' })
  const { data: ctrData } = useFetch(() => contracts.list(), { key: 'rpt-contracts', enabled: activeTab === 'general' })

  const dash = dashData?.data || {}
  const pay = payData?.data || {}
  const att = attData?.data || {}
  const req = reqData?.data || {}
  const inventoryModule = parseModuleResponse(invData)
  const vacancyModule = parseModuleResponse(vacData)
  const contractModule = parseModuleResponse(ctrData)

  const monthlyPayroll = pay.monthly || []
  const deptCost = pay.byDepartment || []
  const attendanceWeek = att.weekly || []
  const requestsByType = req.byType || []
  const overtimeTrend = pay.overtimeTrend || []
  const talentFlow = [
    { name: es ? 'Vacantes abiertas' : 'Open vacancies', value: vacancyModule.stats.open || 0 },
    { name: es ? 'Pendientes firma' : 'Pending signature', value: contractModule.stats.pending || 0 },
    { name: es ? 'Equipos asignados' : 'Assigned assets', value: inventoryModule.stats.assigned || 0 },
  ]
  const inventoryByArea = Object.values(
    inventoryModule.list.reduce((accumulator, asset) => {
      const key = asset.area || 'General'
      if (!accumulator[key]) accumulator[key] = { name: key, total: 0 }
      accumulator[key].total += 1
      return accumulator
    }, {})
  )

  const tabs = [
    { key: 'general', label: 'General', icon: 'analytics' },
    { key: 'nomina', label: es ? 'Nómina' : 'Payroll', icon: 'payments' },
    { key: 'asistencia', label: es ? 'Asistencia' : 'Attendance', icon: 'schedule' },
    { key: 'solicitudes', label: es ? 'Solicitudes' : 'Requests', icon: 'pending_actions' },
  ]
  const tabLabel = tabs.find((tab) => tab.key === activeTab)?.label || ''

  const reportData = { dash, pay, att, req }
  const exportOptions = [
    { key: 'pdf', label: es ? 'Exportar PDF' : 'Export PDF', icon: 'picture_as_pdf', desc: es ? `Reporte ${tabLabel} en PDF` : `${tabLabel} report as PDF`, action: () => exportReportPDF(activeTab, reportData) },
    { key: 'csv', label: es ? 'Exportar CSV' : 'Export CSV', icon: 'table_chart', desc: es ? `Datos ${tabLabel} en CSV` : `${tabLabel} data as CSV`, action: () => exportReportCSV(activeTab, reportData) },
  ]

  const loading = dashLoading || payLoading || attLoading || reqLoading
  if (loading && !dashData) return <Spinner />

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,118,110,0.12),_rgba(255,255,255,0.96),_rgba(14,165,233,0.10))] p-6 shadow-[--shadow-md]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge color="primary">{es ? 'Centro de inteligencia HR' : 'HR intelligence hub'}</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {es ? 'Reportes operativos con talento, contratos, inventario y nómina en una sola vista.' : 'Operational reporting for talent, contracts, inventory and payroll in one place.'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {es ? 'El módulo ahora mezcla operación HR con pulso de contratación, firma digital e inventario para que la lectura ejecutiva sea más útil.' : 'The module now mixes HR operations with hiring, digital signature and inventory signals for more useful executive visibility.'}
            </p>
          </div>

          <div className="relative" ref={exportRef}>
            <Button variant="secondary" icon="download" onClick={() => setShowExport((current) => !current)}>
              {es ? 'Exportar' : 'Export'}
            </Button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[--radius-lg] border border-slate-200 bg-white shadow-[0_22px_48px_rgba(15,23,42,0.12)]">
                  {exportOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => { option.action(); setShowExport(false) }}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary">{option.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-[11px] text-slate-400">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={es ? 'Empleados activos' : 'Active employees'} value={dash.totalEmployees || 0} icon="groups" className="bg-white/90" />
          <StatCard label={es ? 'Contratos pendientes' : 'Pending contracts'} value={contractModule.stats.pending || 0} icon="signature" iconColor="text-amber-600 bg-amber-50" className="bg-white/90" />
          <StatCard label={es ? 'Activos asignados' : 'Assigned assets'} value={inventoryModule.stats.assigned || 0} icon="inventory_2" iconColor="text-blue-600 bg-blue-50" className="bg-white/90" />
          <StatCard label={es ? 'Vacantes abiertas' : 'Open vacancies'} value={vacancyModule.stats.open || 0} icon="work" iconColor="text-success bg-success/10" className="bg-white/90" />
        </div>
      </section>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title={es ? 'Evolución de nómina neta' : 'Net payroll trend'} subtitle={es ? 'Lectura mensual del costo neto procesado.' : 'Monthly readout of processed net payroll.'}>
              <div className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPayroll}>
                    <defs>
                      <linearGradient id="payrollTrend" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0f766e" stopOpacity={0.34} />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="total" name={es ? 'Total neto' : 'Net total'} stroke="#0f766e" strokeWidth={3} fill="url(#payrollTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title={es ? 'Costo por departamento' : 'Cost by department'} subtitle={es ? 'Comparativo actual por frente operativo.' : 'Current comparison by operating unit.'}>
              <div className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptCost} layout="vertical" barSize={18}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="costo" radius={[0, 12, 12, 0]} fill="#0ea5e9" name={es ? 'Costo' : 'Cost'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card title={es ? 'Pulso de talento y operaciones' : 'Talent and operations pulse'} subtitle={es ? 'Vacantes, contratos e inventario sobre una sola lectura de avance.' : 'Vacancies, contracts and inventory in a single progress readout.'}>
              <div className="grid gap-6 p-6 xl:grid-cols-2">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={talentFlow} barSize={34}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} name={es ? 'Volumen' : 'Volume'}>
                        {talentFlow.map((entry, index) => <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryByArea} layout="vertical" barSize={18}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" width={110} type="category" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="total" radius={[0, 12, 12, 0]} fill="#334155" name={es ? 'Activos' : 'Assets'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card title={es ? 'Solicitudes por tipo' : 'Requests by type'} subtitle={es ? 'Distribución de novedades reportadas este mes.' : 'Distribution of requests reported this month.'}>
              <div className="flex h-80 items-center justify-center gap-8 p-6">
                <ResponsiveContainer width="48%" height="100%">
                  <PieChart>
                    <Pie data={requestsByType} innerRadius={56} outerRadius={86} dataKey="value" strokeWidth={0}>
                      {requestsByType.map((item, index) => <Cell key={item.name} fill={PALETTE[index % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {requestsByType.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
                      <span className="w-28 text-slate-500">{item.name}</span>
                      <strong className="text-slate-900">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'nomina' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label={es ? 'Nómina bruta' : 'Gross payroll'} value={`$${((pay.gross || 0) / 1e6).toFixed(1)}M`} icon="payments" />
            <StatCard label={es ? 'Deducciones' : 'Deductions'} value={`$${((pay.deductions || 0) / 1e6).toFixed(1)}M`} icon="remove_circle" iconColor="text-red-600 bg-red-50" />
            <StatCard label={es ? 'Neta' : 'Net payroll'} value={`$${((pay.net || 0) / 1e6).toFixed(1)}M`} icon="account_balance" iconColor="text-success bg-success/10" />
          </div>

          <Card title={es ? 'Tendencia de horas extra' : 'Overtime trend'} subtitle={es ? 'Horas consolidadas por semana operativa.' : 'Consolidated hours by operating week.'}>
            <div className="h-80 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overtimeTrend}>
                  <defs>
                    <linearGradient id="otFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="horas" name={es ? 'Horas' : 'Hours'} stroke="#f59e0b" strokeWidth={3} fill="url(#otFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'asistencia' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label={es ? 'Asistencia promedio' : 'Avg attendance'} value={`${att.avgRate || 0}%`} icon="task_alt" iconColor="text-success bg-success/10" />
            <StatCard label={es ? 'Tardanzas' : 'Late arrivals'} value={att.lateCount || 0} icon="schedule" iconColor="text-amber-600 bg-amber-50" />
            <StatCard label={es ? 'Ausencias' : 'Absences'} value={att.absentCount || 0} icon="person_off" iconColor="text-red-600 bg-red-50" />
          </div>

          <Card title={es ? 'Asistencia semanal' : 'Weekly attendance'} subtitle={es ? 'Comparativo presentes vs ausentes.' : 'Present versus absent comparison.'}>
            <div className="h-80 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceWeek} barSize={22}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="presentes" fill="#10b981" radius={[10, 10, 0, 0]} name={es ? 'Presentes' : 'Present'} />
                  <Bar dataKey="ausentes" fill="#ef4444" radius={[10, 10, 0, 0]} name={es ? 'Ausentes' : 'Absent'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label={es ? 'Total mes' : 'Monthly total'} value={req.total || 0} icon="description" />
            <StatCard label={es ? 'Aprobadas' : 'Approved'} value={req.approved || 0} icon="check_circle" iconColor="text-success bg-success/10" />
            <StatCard label={es ? 'Rechazadas' : 'Rejected'} value={req.rejected || 0} icon="cancel" iconColor="text-red-600 bg-red-50" />
            <StatCard label={es ? 'Pendientes' : 'Pending'} value={req.pending || 0} icon="pending_actions" iconColor="text-amber-600 bg-amber-50" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card title={es ? 'Participación por tipo' : 'Share by request type'} subtitle={es ? 'Distribución general de las novedades.' : 'Overall distribution of requests.'}>
              <div className="flex h-80 items-center justify-center gap-8 p-6">
                <ResponsiveContainer width="48%" height="100%">
                  <PieChart>
                    <Pie data={requestsByType} innerRadius={56} outerRadius={86} dataKey="value" strokeWidth={0}>
                      {requestsByType.map((item, index) => <Cell key={item.name} fill={PALETTE[index % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {requestsByType.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
                      <span className="w-28 text-slate-500">{item.name}</span>
                      <strong className="text-slate-900">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title={es ? 'Pulso del backlog' : 'Backlog pulse'} subtitle={es ? 'Estado general del flujo de solicitudes.' : 'Overall state of the request workflow.'}>
              <div className="space-y-4 p-6">
                {[
                  { label: es ? 'Pendientes' : 'Pending', value: req.pending || 0, color: 'bg-amber-500' },
                  { label: es ? 'Aprobadas' : 'Approved', value: req.approved || 0, color: 'bg-success' },
                  { label: es ? 'Rechazadas' : 'Rejected', value: req.rejected || 0, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[--radius-lg] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-slate-600">{item.label}</span>
                      </div>
                      <strong className="text-lg text-slate-900">{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
