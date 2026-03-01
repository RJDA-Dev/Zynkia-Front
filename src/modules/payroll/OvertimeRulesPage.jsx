import { useState } from 'react'
import { payroll } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Tabs from '../../components/ui/Tabs'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/ui/StatCard'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useCurrency from '../../hooks/useCurrency'

export default function OvertimeRulesPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const { formatCurrency } = useCurrency()
  const [tab, setTab] = useState('rules')
  const [expanded, setExpanded] = useState(null)

  const { data: rules, loading, refetch } = useFetch(() => payroll.rules(), { key: 'overtime-rules' })
  const { data: balRaw, loading: balLoading, refetch: refetchBal } = useFetch(() => payroll.overtimeBalances(), { key: 'overtime-bal' })

  const list = rules?.data?.data || rules?.data || rules || []
  const balances = balRaw?.data?.data || balRaw?.data || []
  const balList = Array.isArray(balances) ? balances : []

  const totalHours = balList.reduce((a, b) => a + (b.totalHours || 0), 0)
  const totalPending = balList.reduce((a, b) => a + (b.pending || 0), 0)
  const totalPaid = balList.reduce((a, b) => a + (b.paid || 0), 0)
  const totalApproved = balList.reduce((a, b) => a + (b.records?.filter(r => r.status === 'approved').reduce((s, r) => s + (r.hours || 0), 0) || 0), 0)

  const handleToggle = async (id) => {
    try {
      await payroll.toggleRule(id)
      toast.success(es ? 'Regla actualizada' : 'Rule updated')
      refetch()
    } catch { toast.error(es ? 'Error' : 'Error') }
  }

  const handleStatusChange = async (balId, status) => {
    try {
      await payroll.updateBalanceStatus(balId, status)
      toast.success(es ? 'Estado actualizado' : 'Status updated')
      refetchBal()
    } catch { toast.error(es ? 'Error' : 'Error') }
  }

  const ruleColumns = [
    { key: 'name', label: es ? 'Nombre' : 'Name' },
    { key: 'code', label: es ? 'Código' : 'Code' },
    { key: 'multiplier', label: es ? 'Multiplicador' : 'Multiplier', render: (v) => <span className="font-bold text-primary">{v}x</span> },
    { key: 'shiftType', label: es ? 'Turno' : 'Shift', render: (v) => v || '-' },
    { key: 'status', label: es ? 'Estado' : 'Status', render: (v) => <Badge color={v === 'active' ? 'success' : 'danger'} dot>{v === 'active' ? (es ? 'Activo' : 'Active') : (es ? 'Inactivo' : 'Inactive')}</Badge> },
    { key: 'id', label: '', render: (_, row) => (
      <button onClick={() => handleToggle(row.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${row.status === 'active' ? 'bg-primary' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${row.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )},
  ]

  const tabs = [
    { key: 'rules', label: es ? 'Reglas' : 'Rules', icon: 'rule' },
    { key: 'balance', label: es ? 'Balance por Empleado' : 'Employee Balance', icon: 'account_balance_wallet' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-gray-500">{es ? 'Reglas, balance y seguimiento de horas extra.' : 'Rules, balance and overtime tracking.'}</p>
      </div>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === 'rules' && (
        <Card>
          {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : <Table columns={ruleColumns} data={list} />}
        </Card>
      )}

      {tab === 'balance' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label={es ? 'Total Horas Extra' : 'Total OT Hours'} value={`${totalHours.toFixed(1)}h`} icon="schedule" />
            <StatCard label={es ? 'Pendientes' : 'Pending'} value={`${totalPending.toFixed(1)}h`} icon="hourglass_top" iconColor="text-warning bg-warning/10" />
            <StatCard label={es ? 'Aprobadas' : 'Approved'} value={`${totalApproved.toFixed(1)}h`} icon="verified" iconColor="text-blue-500 bg-blue-50" />
            <StatCard label={es ? 'Pagadas' : 'Paid'} value={`${totalPaid.toFixed(1)}h`} icon="check_circle" iconColor="text-success bg-success/10" />
          </div>

          <Card>
            {balLoading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
              balList.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">hourglass_empty</span>
                  <p>{es ? 'Sin registros de horas extra. Se generarán al procesar nómina con horas extra.' : 'No overtime records. They will be generated when processing payroll with overtime.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {balList.map((emp) => (
                    <div key={emp.employeeId}>
                      <button onClick={() => setExpanded(expanded === emp.employeeId ? null : emp.employeeId)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar name={emp.name || '?'} size="sm" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.department || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="hidden sm:flex gap-6 text-xs">
                            <div className="text-right">
                              <p className="text-gray-400">{es ? 'Total' : 'Total'}</p>
                              <p className="font-bold text-gray-900">{emp.totalHours?.toFixed(1)}h</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">{es ? 'Pendiente' : 'Pending'}</p>
                              <p className="font-bold text-warning">{emp.pending?.toFixed(1)}h</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">{es ? 'Pagado' : 'Paid'}</p>
                              <p className="font-bold text-success">{emp.paid?.toFixed(1)}h</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">{es ? 'Monto' : 'Amount'}</p>
                              <p className="font-bold text-primary">{formatCurrency(emp.totalAmount || 0)}</p>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform ${expanded === emp.employeeId ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                      </button>
                      {expanded === emp.employeeId && emp.records?.length > 0 && (
                        <div className="px-6 pb-4">
                          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">{es ? 'Período' : 'Period'}</th>
                                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">{es ? 'Horas' : 'Hours'}</th>
                                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">{es ? 'Monto' : 'Amount'}</th>
                                  <th className="text-center px-4 py-2 text-xs text-gray-500 font-medium">{es ? 'Estado' : 'Status'}</th>
                                  <th className="px-4 py-2"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {emp.records.map((r) => (
                                  <tr key={r.id} className="hover:bg-white">
                                    <td className="px-4 py-2 font-medium text-gray-900">{r.period}</td>
                                    <td className="px-4 py-2 text-right">{r.hours?.toFixed(1)}h</td>
                                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.amount || 0)}</td>
                                    <td className="px-4 py-2 text-center">
                                      <Badge color={r.status === 'paid' ? 'success' : r.status === 'approved' ? 'info' : r.status === 'rejected' ? 'danger' : 'warning'}>
                                        {r.status === 'paid' ? (es ? 'Pagado' : 'Paid') : r.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : r.status === 'rejected' ? (es ? 'Rechazado' : 'Rejected') : (es ? 'Pendiente' : 'Pending')}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                      {r.status === 'pending' && (
                                        <div className="flex gap-2">
                                          <button onClick={() => handleStatusChange(r.id, 'approved')}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800">
                                            {es ? 'Aprobar' : 'Approve'}
                                          </button>
                                          <button onClick={() => handleStatusChange(r.id, 'rejected')}
                                            className="text-[11px] font-semibold text-red-500 hover:text-red-700">
                                            {es ? 'Rechazar' : 'Reject'}
                                          </button>
                                        </div>
                                      )}
                                      {r.status === 'approved' && (
                                        <button onClick={() => handleStatusChange(r.id, 'paid')}
                                          className="text-[11px] font-semibold text-primary hover:text-purple-800">
                                          {es ? 'Marcar pagado' : 'Mark paid'}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </Card>
        </>
      )}
    </div>
  )
}
