import { useState } from 'react'
import { payroll } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
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
  const balances = balRaw?.data?.data || balRaw?.data || balRaw || []
  const balList = Array.isArray(balances) ? balances : []

  const totalHours = balList.reduce((a, b) => a + (b.totalHours || 0), 0)
  const totalAmount = balList.reduce((a, b) => a + (b.totalAmount || 0), 0)
  const totalPaid = balList.reduce((a, b) => a + (b.paid || 0), 0)
  const approvedHours = balList.reduce((a, b) => a + (b.records?.filter(r => r.status === 'approved').reduce((s, r) => s + (r.hours || 0), 0) || 0), 0)
  const paidAmount = balList.reduce((a, b) => a + (b.records?.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0) || 0), 0)

  const handleToggle = async (id) => {
    try { await payroll.toggleRule(id); toast.success(es ? 'Actualizada' : 'Updated'); refetch() }
    catch { toast.error('Error') }
  }

  const handlePay = async (balId) => {
    try { await payroll.updateBalanceStatus(balId, 'paid'); toast.success(es ? 'Marcado como pagado' : 'Marked as paid'); refetchBal() }
    catch { toast.error('Error') }
  }

  const tabs = [
    { key: 'balance', label: es ? 'Balance' : 'Balance', icon: 'account_balance_wallet' },
    { key: 'rules', label: es ? 'Reglas' : 'Rules', icon: 'rule' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <p className="text-sm text-gray-400">{es ? 'Balance y seguimiento de horas extra por empleado.' : 'Overtime balance and tracking by employee.'}</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: es ? 'Total horas' : 'Total hours', value: `${totalHours.toFixed(1)}h`, sub: fc(totalAmount), icon: 'schedule', color: 'text-purple-600 bg-purple-50' },
          { label: es ? 'Aprobadas' : 'Approved', value: `${approvedHours.toFixed(1)}h`, sub: es ? 'pendientes de pago' : 'pending payment', icon: 'verified', color: 'text-amber-600 bg-amber-50' },
          { label: es ? 'Pagadas' : 'Paid', value: `${totalPaid.toFixed(1)}h`, sub: fc(paidAmount), icon: 'payments', color: 'text-emerald-600 bg-emerald-50' },
          { label: es ? 'Empleados' : 'Employees', value: String(balList.length), sub: es ? 'con horas extra' : 'with overtime', icon: 'group', color: 'text-gray-600 bg-gray-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</span>
              <span className={`material-symbols-outlined text-lg p-1.5 rounded-lg ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Rules tab */}
      {tab === 'rules' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? <div className="p-12 text-center text-gray-300"><div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
            list.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm">{es ? 'Sin reglas configuradas' : 'No rules configured'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[es ? 'Nombre' : 'Name', es ? 'Código' : 'Code', es ? 'Multiplicador' : 'Multiplier', es ? 'Turno' : 'Shift', es ? 'Estado' : 'Status', ''].map((h, i) => (
                      <th key={i} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {list.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{r.code}</td>
                      <td className="px-5 py-3.5"><span className="text-sm font-bold text-purple-600">{r.multiplier}x</span></td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{r.shiftType || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {r.status === 'active' ? (es ? 'Activo' : 'Active') : (es ? 'Inactivo' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleToggle(r.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.status === 'active' ? 'bg-purple-600' : 'bg-gray-200'}`}>
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${r.status === 'active' ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {/* Balance tab */}
      {tab === 'balance' && (
        balLoading ? <div className="p-12 text-center"><div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
          balList.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-gray-200 block mb-3">hourglass_empty</span>
              <p className="text-sm text-gray-400">{es ? 'Sin registros de horas extra.' : 'No overtime records.'}</p>
              <p className="text-xs text-gray-300 mt-1">{es ? 'Se generarán al aprobar solicitudes.' : 'Generated when approving requests.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balList.map((emp) => {
                const isOpen = expanded === emp.employeeId
                const approvedH = emp.records?.filter(r => r.status === 'approved').reduce((s, r) => s + r.hours, 0) || 0
                return (
                  <div key={emp.employeeId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button onClick={() => setExpanded(isOpen ? null : emp.employeeId)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <Avatar name={emp.name || '?'} size="md" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.department}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-8 text-right">
                        <div>
                          <p className="text-xs text-gray-400">{es ? 'Total' : 'Total'}</p>
                          <p className="text-sm font-bold text-gray-900">{emp.totalHours?.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{es ? 'Aprobadas' : 'Approved'}</p>
                          <p className="text-sm font-bold text-amber-600">{approvedH.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{es ? 'Pagadas' : 'Paid'}</p>
                          <p className="text-sm font-bold text-emerald-600">{emp.paid?.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{es ? 'Monto' : 'Amount'}</p>
                          <p className="text-sm font-bold text-gray-900">{fc(emp.totalAmount || 0)}</p>
                        </div>
                      </div>
                      <div className="sm:hidden text-right">
                        <p className="text-sm font-bold text-gray-900">{emp.totalHours?.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500">{fc(emp.totalAmount || 0)}</p>
                      </div>
                      <span className={`material-symbols-outlined text-gray-300 text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isOpen && emp.records?.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50/30">
                        {emp.records.map((r) => (
                          <div key={r.id} className="px-5 py-3 flex items-center gap-4 border-b border-gray-50 last:border-0">
                            <span className="text-sm font-mono text-gray-500 w-20 shrink-0">{r.period}</span>
                            <p className="text-xs text-gray-400 flex-1 min-w-0 truncate">{r.notes || '—'}</p>
                            <span className="text-sm font-semibold text-gray-900 shrink-0">{r.hours?.toFixed(1)}h</span>
                            <span className="text-sm text-gray-500 shrink-0 w-24 text-right">{fc(r.amount || 0)}</span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              r.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                              r.status === 'approved' ? 'bg-amber-50 text-amber-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                r.status === 'paid' ? 'bg-emerald-500' : r.status === 'approved' ? 'bg-amber-500' : 'bg-gray-400'
                              }`} />
                              {r.status === 'paid' ? (es ? 'Pagado' : 'Paid') : r.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : r.status}
                            </span>
                            {r.status === 'approved' && (
                              <button onClick={(e) => { e.stopPropagation(); handlePay(r.id) }}
                                className="text-xs font-medium text-purple-600 hover:text-purple-800 shrink-0 transition-colors">
                                {es ? 'Pagar' : 'Pay'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )
      )}
    </div>
  )
}
