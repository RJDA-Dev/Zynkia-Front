import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { reports } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'

function TimeAgo({ date }) {
  if (!date) return <span className="text-gray-400">--</span>
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return <span className="text-green-600 font-medium">ahora</span>
  if (mins < 5) return <span className="text-green-600 font-medium">{mins}m</span>
  if (mins < 60) return <span className="text-gray-500">{mins}m</span>
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return <span className="text-gray-400">{hrs}h</span>
  return <span className="text-gray-400">{Math.floor(hrs / 24)}d</span>
}

function isOnline(date) {
  if (!date) return false
  return (Date.now() - new Date(date).getTime()) < 5 * 60000
}

const statusColors = { approved: 'text-green-600 bg-green-50', pending: 'text-amber-600 bg-amber-50', rejected: 'text-red-600 bg-red-50' }
const statusLabels = { approved: 'Aprobada', pending: 'Pendiente', rejected: 'Rechazada' }

export default function DashboardPage() {
  const { t } = useLang()
  const { formatCurrency } = useCurrency()
  const { data, loading } = useFetch(() => reports.dashboard(), { key: 'dashboard' })
  const d = data || {}

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('welcome')}</h2>
        <p className="mt-1 text-gray-500">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('totalEmployees')} value={String(d.totalEmployees || 0)} icon="groups" />
        <StatCard label={t('pendingRequests')} value={String(d.pendingRequests || 0)} icon="pending_actions" iconColor="text-warning bg-warning/10" />
        <StatCard label={t('activeUsers')} value={String(d.activeToday || 0)} icon="fingerprint" iconColor="text-success bg-success/10" subtitle={t('attendance')} />
        <StatCard label={t('monthlyPayroll')} value={d.monthlyPayroll ? formatCurrency(d.monthlyPayroll) : '$0'} icon="payments" iconColor="text-primary bg-primary/10" />
      </div>

      {loading && <div className="text-center text-gray-400 py-12">Cargando...</div>}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('overtimeHours') + ' ' + t('byDepartment')}>
          <div className="p-4 h-56">
            {(d.overtimeByDept?.length) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.overtimeByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="h" />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <Bar dataKey="hours" fill="#7e22ce" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin datos de horas extra</div>}
          </div>
        </Card>

        <Card title="Turnos esta semana">
          <div className="p-4 h-56">
            {(d.weekShifts?.length) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.weekShifts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="employee" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="shifts" fill="#a855f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin turnos esta semana</div>}
          </div>
        </Card>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Shifts */}
        <Card title="Turnos de hoy">
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {d.todayShifts?.length ? d.todayShifts.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.employee}</p>
                  <p className="text-gray-500 text-xs">{s.type} — {s.time}</p>
                </div>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-6">Sin turnos hoy</p>}
          </div>
        </Card>

        {/* Recent Requests */}
        <Card title="Solicitudes recientes">
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {d.requests?.length ? d.requests.map(r => (
              <div key={r.id} className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-amber-500 text-lg">pending_actions</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{r.employee}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs capitalize">{r.type}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[r.status] || ''}`}>{statusLabels[r.status] || r.status}</span>
                  </div>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap"><TimeAgo date={r.date} /></span>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-6">Sin solicitudes</p>}
            {d.requests?.length > 0 && <Link to="/requests" className="block text-center text-xs text-primary hover:underline mt-2">Ver todas</Link>}
          </div>
        </Card>

        {/* Online Users */}
        <Card title="Personas en linea">
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {d.onlineUsers?.length ? d.onlineUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-1.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline(u.lastSeenAt) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-[11px] text-gray-400 capitalize">{u.role}</p>
                </div>
                <div className="text-xs"><TimeAgo date={u.lastSeenAt} /></div>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-6">Sin usuarios</p>}
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: 'pending_actions', label: t('requests'), to: '/requests', color: 'text-warning bg-warning/10' },
          { icon: 'calendar_month', label: t('schedule'), to: '/schedule', color: 'text-primary bg-primary/10' },
          { icon: 'analytics', label: t('reports'), to: '/reports', color: 'text-purple-500 bg-purple-50' },
          { icon: 'fingerprint', label: t('attendance'), to: '/attendance', color: 'text-success bg-success/10' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all">
            <span className={`material-symbols-outlined p-2 rounded-lg ${item.color}`}>{item.icon}</span>
            <span className="text-xs font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
