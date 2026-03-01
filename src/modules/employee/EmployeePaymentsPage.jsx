import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'
import { portal } from '../../api/services'

export default function EmployeePaymentsPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const { formatCurrency: fc } = useCurrency()
  const { data: raw, loading } = useFetch(() => portal.payHistory(), { key: 'portal-pay-history' })
  const { data: homeRaw } = useFetch(() => portal.home(), { key: 'portal-home-pay' })
  const [expanded, setExpanded] = useState(null)

  const items = Array.isArray(raw) ? raw : (raw?.data || [])
  const stats = homeRaw?.data?.stats || homeRaw?.stats || {}

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>

  const fmtPeriod = (p) => {
    if (!p) return ''
    const [y, m] = p.split('-')
    const d = new Date(+y, +m - 1)
    return d.toLocaleDateString(es ? 'es-CO' : 'en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{es ? 'Historial de Pagos' : 'Payment History'}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{es ? 'Nomina, horas extras y recibos.' : 'Payroll, overtime and receipts.'}</p>
      </div>

      {/* Current month summary */}
      <div className="bg-gradient-to-br from-primary to-purple-800 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{es ? 'Mes Actual' : 'Current Month'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">{es ? 'Salario' : 'Salary'}</p>
              <p className="text-lg font-bold">{fc(stats.baseSalary || 0)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">{es ? 'Extras' : 'Overtime'}</p>
              <p className="text-lg font-bold text-amber-300">{fc(stats.overtimeAmount || 0)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">{es ? 'Pagado' : 'Paid'}</p>
              <p className="text-lg font-bold text-emerald-300">{fc(stats.overtimePaid || 0)}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">{es ? 'Horas' : 'Hours'}</p>
              <p className="text-lg font-bold">{stats.monthlyHours || 0}<span className="text-sm text-white/50">/{stats.monthlyTarget || 208}h</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* History list */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-200">receipt_long</span>
          <p className="text-gray-400 text-sm mt-2">{es ? 'Sin registros de nomina aun.' : 'No payroll records yet.'}</p>
          <p className="text-gray-300 text-xs mt-1">{es ? 'Apareceran cuando RRHH procese la nomina.' : 'They will appear when HR processes payroll.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id}>
              <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 capitalize">{fmtPeriod(item.period)}</p>
                    <p className="text-xs text-gray-400">{item.paidAt ? new Date(item.paidAt).toLocaleDateString(es ? 'es-CO' : 'en-US') : (es ? 'Sin pagar' : 'Unpaid')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{fc(item.net)}</p>
                    <p className="text-[10px] text-gray-400">{es ? 'Neto' : 'Net'}</p>
                  </div>
                  <Badge color={item.status === 'paid' ? 'success' : item.status === 'approved' ? 'info' : 'warning'}>
                    {item.status === 'paid' ? (es ? 'Pagado' : 'Paid') : item.status === 'approved' ? (es ? 'Aprobado' : 'Approved') : (es ? 'Borrador' : 'Draft')}
                  </Badge>
                  <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </button>
              {expanded === item.id && (
                <div className="px-5 pb-4">
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Salario Base' : 'Base Salary'}</p><p className="font-semibold text-gray-900">{fc(item.baseSalary)}</p></div>
                      <div><p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Transporte' : 'Transport'}</p><p className="font-semibold text-gray-900">{fc(item.transport)}</p></div>
                      <div><p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Horas Extra' : 'Overtime'}</p><p className="font-semibold text-amber-600">{fc(item.overtimeAmount)} <span className="text-gray-400 text-xs">({item.overtimeHours}h)</span></p></div>
                      <div><p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Bonos' : 'Bonuses'}</p><p className="font-semibold text-gray-900">{fc(item.bonuses)}</p></div>
                      <div><p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Bruto' : 'Gross'}</p><p className="font-bold text-gray-900">{fc(item.gross)}</p></div>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{es ? 'Deducciones' : 'Deductions'}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div><p className="text-xs text-gray-500">{es ? 'Salud' : 'Health'}</p><p className="font-medium text-red-500">-{fc(item.health)}</p></div>
                        <div><p className="text-xs text-gray-500">{es ? 'Pension' : 'Pension'}</p><p className="font-medium text-red-500">-{fc(item.pension)}</p></div>
                        <div><p className="text-xs text-gray-500">{es ? 'Impuesto' : 'Tax'}</p><p className="font-medium text-red-500">-{fc(item.tax)}</p></div>
                        <div><p className="text-xs text-gray-500">{es ? 'Otros' : 'Other'}</p><p className="font-medium text-red-500">-{fc(item.deductions)}</p></div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{es ? 'Total Neto' : 'Net Total'}</p>
                        <p className="text-xl font-bold text-primary">{fc(item.net)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
