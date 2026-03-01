import { useState, useRef } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import { useLang } from '../../context/LangContext'
import Tabs from '../../components/ui/Tabs'
import useFetch from '../../hooks/useFetch'
import { reports } from '../../api/services'
import { exportReportPDF, exportReportCSV } from '../../utils/reportPdf'

const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#06b6d4']

export default function ReportsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const [activeTab, setActiveTab] = useState('general')
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef(null)

  const { data: dashData, loading: l1 } = useFetch(() => reports.dashboard(), { key: 'rpt-dash' })
  const { data: payData, loading: l2 } = useFetch(() => reports.payroll(), { key: 'rpt-pay', enabled: activeTab === 'nomina' || activeTab === 'general' })
  const { data: attData, loading: l3 } = useFetch(() => reports.attendance(), { key: 'rpt-att', enabled: activeTab === 'asistencia' })
  const { data: reqData, loading: l4 } = useFetch(() => reports.requests(), { key: 'rpt-req', enabled: activeTab === 'solicitudes' })

  const dash = dashData?.data || {}
  const pay = payData?.data || {}
  const att = attData?.data || {}
  const req = reqData?.data || {}

  const tabs = [
    { key: 'general', label: 'General', icon: 'analytics' },
    { key: 'nomina', label: es ? 'Nómina' : 'Payroll', icon: 'payments' },
    { key: 'asistencia', label: es ? 'Asistencia' : 'Attendance', icon: 'schedule' },
    { key: 'solicitudes', label: es ? 'Solicitudes' : 'Requests', icon: 'pending_actions' },
  ]

  const tabLabel = tabs.find(t => t.key === activeTab)?.label || ''

  const reportData = { dash, pay, att, req }

  const exportOptions = [
    { key: 'pdf', label: es ? 'Exportar PDF' : 'Export PDF', icon: 'picture_as_pdf', desc: es ? `Reporte ${tabLabel} en PDF` : `${tabLabel} report as PDF`, action: () => exportReportPDF(activeTab, reportData) },
    { key: 'csv', label: es ? 'Exportar CSV' : 'Export CSV', icon: 'table_chart', desc: es ? `Datos ${tabLabel} en CSV` : `${tabLabel} data as CSV`, action: () => exportReportCSV(activeTab, reportData) },
  ]

  const loading = l1 || l2 || l3 || l4
  if (loading && !dashData) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  const monthlyPayroll = pay.monthly || []
  const deptCost = pay.byDepartment || []
  const attendanceWeek = att.weekly || []
  const requestsByType = req.byType || []
  const overtimeTrend = pay.overtimeTrend || []

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm">{es ? 'Análisis y métricas de tu organización' : 'Analytics and metrics for your organization'}</p>
        </div>
        <div className="relative" ref={exportRef}>
          <Button variant="secondary" icon="download" onClick={() => setShowExport(!showExport)}>
            {es ? 'Exportar' : 'Export'}
          </Button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden animate-fade-in">
                {exportOptions.map(opt => (
                  <button key={opt.key} onClick={() => { opt.action(); setShowExport(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <span className="material-symbols-outlined text-[20px] text-primary">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                      <p className="text-[11px] text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={es ? 'Empleados Activos' : 'Active Employees'} value={dash.totalEmployees || 0} icon="groups" />
            <StatCard label={es ? 'Presentes Hoy' : 'Present Today'} value={dash.activeToday || 0} icon="trending_up" iconColor="text-success bg-success/10" />
            <StatCard label={es ? 'Nómina Mensual' : 'Monthly Payroll'} value={`$${((dash.monthlyPayroll || 0) / 1e6).toFixed(1)}M`} icon="payments" iconColor="text-primary bg-primary/10" />
            <StatCard label={es ? 'Solicitudes Pend.' : 'Pending Requests'} value={dash.pendingRequests || 0} icon="pending_actions" iconColor="text-warning bg-warning/10" />
          </div>
          {monthlyPayroll.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title={es ? 'Evolución Nómina Mensual' : 'Monthly Payroll Trend'}>
                <div className="p-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyPayroll}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#7e22ce" fill="#7e22ce" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card title={es ? 'Costo por Departamento' : 'Cost by Department'}>
                <div className="p-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptCost} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="costo" fill="#7e22ce" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'nomina' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label={es ? 'Nómina Bruta' : 'Gross Payroll'} value={`$${((pay.gross || 0) / 1e6).toFixed(1)}M`} icon="payments" />
            <StatCard label={es ? 'Deducciones' : 'Deductions'} value={`$${((pay.deductions || 0) / 1e6).toFixed(1)}M`} icon="remove_circle" iconColor="text-danger bg-danger/10" />
            <StatCard label={es ? 'Nómina Neta' : 'Net Payroll'} value={`$${((pay.net || 0) / 1e6).toFixed(1)}M`} icon="account_balance" iconColor="text-success bg-success/10" />
          </div>
          {overtimeTrend.length > 0 && (
            <Card title={es ? 'Tendencia Horas Extra' : 'Overtime Trend'}>
              <div className="p-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overtimeTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="horas" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'asistencia' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label={es ? 'Asistencia Promedio' : 'Avg Attendance'} value={`${att.avgRate || 0}%`} icon="check_circle" iconColor="text-success bg-success/10" />
            <StatCard label={es ? 'Tardanzas' : 'Late arrivals'} value={att.lateCount || 0} icon="schedule" iconColor="text-warning bg-warning/10" />
            <StatCard label={es ? 'Ausencias' : 'Absences'} value={att.absentCount || 0} icon="person_off" iconColor="text-danger bg-danger/10" />
          </div>
          {attendanceWeek.length > 0 && (
            <Card title={es ? 'Asistencia Semanal' : 'Weekly Attendance'}>
              <div className="p-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="presentes" name={es ? 'Presentes' : 'Present'} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ausentes" name={es ? 'Ausentes' : 'Absent'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label={es ? 'Total Mes' : 'Monthly Total'} value={req.total || 0} icon="description" />
            <StatCard label={es ? 'Aprobadas' : 'Approved'} value={req.approved || 0} icon="check_circle" iconColor="text-success bg-success/10" />
            <StatCard label={es ? 'Rechazadas' : 'Rejected'} value={req.rejected || 0} icon="cancel" iconColor="text-danger bg-danger/10" />
            <StatCard label={es ? 'Pendientes' : 'Pending'} value={req.pending || 0} icon="pending" iconColor="text-warning bg-warning/10" />
          </div>
          {requestsByType.length > 0 && (
            <Card title={es ? 'Solicitudes por Tipo' : 'Requests by Type'}>
              <div className="p-6 h-64 flex items-center justify-center gap-12">
                <ResponsiveContainer width="40%" height="100%">
                  <PieChart>
                    <Pie data={requestsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {requestsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {requestsByType.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600 w-24">{d.name}</span>
                      <span className="text-sm font-bold text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
