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
  const fc = useCurrency().formatCurrency
  const [tab, setTab] = useState('balance')
  const [expanded, setExpanded] = useState(null)

  const { data: rules, loading, invalidate: refetch } = useFetch(() => payroll.rules(), { key: 'overtime-rules' })
  const { data: balRaw, loading: balLoading, invalidate: refetchBal } = useFetch(() => payroll.overtimeBalances(), { key: 'overtime-bal' })

  const list = rules?.data?.data || rules?.data || rules || []
  const balances = balRaw?.data?.data || balRaw?.data || []
  const balList = Array.isArray(balances) ? balances : []

  const totalHours = balList.reduce((a, b) => a + (b.totalHours || 0), 0)
  const totalAmount = balList.reduce((a, b) => a + (b.totalAmount || 0), 0)
  const totalPaid = balList.reduce((a, b) => a + (b.paid || 0), 0)
  const totalApproved = balList.reduce((a, b) => a + (b.records?.filter(r => r.status === 'approved').reduce((s, r) => s + (r.hours || 0), 0) || 0), 0)
  const paidAmount = balList.reduce((a, b) => a + (b.records?.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0) || 0), 0)

  const handleToggle = async (id) => {
    try { await payroll.toggleRule(id); toast.success(es ? 'Regla actualizada' : 'Rule updated'); refetch() }
    catch { toast.error('Error') }
  }

  const handleStatusChange = async (balId, status) => {
    try { await payroll.updateBalanceStatus(balId, status); toast.success(es ? 'Estado actualizado' : 'Status updated'); refetchBal() }
    catch { toast.error('Error') }
  }

  const ruleColumns = [
    { key: 'name', label: es ? 'Nombre' : 'Name' },
    { key: 'code', label: es ? 'Código' : 'Code' },
    { key: 'multiplier', label: es ? 'Multiplicador' : 'Multiplier', render: (v) => <span className="font-bold text-amber-600">{v}x</span> },
    { key: 'shiftType', label: es ? 'Turno' : 'Shift', render: (v) => v || '-' },
    { key: 'status', label: es ? 'Estado' : 'Status', render: (v) => <Badge color={v === 'active' ? 'success' : 'danger'} dot>{v === 'active' ? (es ? 'Activo' : 'Active') : (es ? 'Inactivo' : 'Inactive')}</Badge> },
    { key: 'id', label: '', render: (_, row) => (
      <button onClick={() => handleToggle(row.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${row.status === 'active' ? 'bg-amber-500' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${row.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )},
  ]

  const tabs = [
    { key: 'balance', label: es ? 'Balance por Empleado' : 'Employee Balance', icon: 'account_balance_wallet' },
    { key: 'rules', label: es ? 'Reglas' : 'Rules', icon: 'rule' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{es ? 'Horas Extra' : 'Overtime'}</h1>
        <p className="text-gray-500 mt-1">{es ? 'Reglas, balance y seguimiento de horas extra.' : 'Rules, balance and overtime tracking.'}</p>
      </div>

      {/* Summary banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{es ? 'Total Horas' : 'Total Hours'}</p>
            <p className="text-3xl font-black mt-1">{totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{es ? 'Monto Total' : 'Total Amount'}</p>
            <p className="text-3xl font-black mt-1">{fc(totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{es ? 'Aprobadas' : 'Approved'}</p>
            <p className="text-3xl font-black mt-1">{totalApproved.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{es ? 'Pagado' : 'Paid'}</p>
            <p className="text-3xl font-black mt-1">{fc(paidAmount)}</p>
            <p className="text-xs text-white/60 mt-0.5">{totalPaid.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === 'rules' && (
        <Card>
          {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : <Table columns={ruleColumns} data={list} />}
        </Card>
      )}

      {tab === 'balance' && (
        balLoading ? <div className="p-8 text-center text-gray-400"><div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
          balList.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">hourglass_empty</span>
              <p className="text-gray-400">{es ? 'Sin registros de horas extra.' : 'No overtime records.'}</p>
              <p className="text-xs text-gray-300 mt-1">{es ? 'Se generarán al aprobar solicitudes de horas extra.' : 'They will be generated when approving overtime requests.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balList.map((emp) => (
                <div key={emp.employeeId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <button onClick={() => setExpanded(expanded === emp.employeeId ? null : emp.employeeId)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name || '?'} size="md" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.department || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="hidden sm:grid grid-cols-4 gap-6 text-xs">
                        <div className="text-right">
                          <p className="text-gray-400">{es ? 'Total' : 'Total'}</p>
                          <p className="font-bold text-gray-900 text-sm">{emp.totalHours?.toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">{es ? 'Aprobadas' : 'Approved'}</p>
                          <p className="font-bold text-amber-600 text-sm">{(emp.records?.filter(r => r.status === 'approved').reduce((s, r) => s + r.hours, 0) || 0).toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">{es ? 'Pagado' : 'Paid'}</p>
                          <p className="font-bold text-emerald-600 text-sm">{emp.paid?.toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">{es ? 'Monto' : 'Amount'}</p>
                          <p className="font-bold text-primary text-sm">{fc(emp.totalAmount || 0)}</p>
                        </div>
                      </div>
                      {/* Mobile summary */}
                      <div className="sm:hidden text-right">
                        <p className="text-sm font-bold text-gray-900">{emp.totalHours?.toFixed(1)}h</p>
                        <p className="text-xs text-primary font-semibold">{fc(emp.totalAmount || 0)}</p>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform duration-200 ${expanded === emp.employeeId ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </button>

                  {expanded === emp.employeeId && emp.records?.length > 0 && (
                    <div className="border-t border-gray-100">
                      <div className="divide-y divide-gray-50">
                        {emp.records.map((r) => (
                          <div key={r.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50">
                            <div className="w-20 shrink-0">
                              <p className="text-sm font-bold text-gray-900">{r.period}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              {r.notes && <p className="text-xs text-gray-500 truncate">{r.notes}</p>}
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{r.hours?.toFixed(1)}h</p>
                                <p className="text-xs text-gray-400">{fc(r.amount || 0)}</p>
                              </div>
                              <Badge color={r.status === 'paid' ? 'success' : r.status === 'approved' ? 'warning' : r.status === 'rejected' ? 'danger' : 'neutral'}>
                                {r.status === 'paid' ? (es ? 'Pagado' : 'Paid') : r.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : r.status === 'rejected' ? (es ? 'Rechazado' : 'Rejected') : (es ? 'Pendiente' : 'Pending')}
                              </Badge>
                              {r.status === 'approved' && (
                                <button onClick={() => handleStatusChange(r.id, 'paid')}
                                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors">
                                  <span className="material-symbols-outlined text-[14px]">payments</span>
                                  {es ? 'Pagar' : 'Pay'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )
      )}
    </div>
  )
}
