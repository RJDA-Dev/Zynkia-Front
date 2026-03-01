import { useState, useEffect, useCallback } from 'react'
import { employees as empService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AddEmployeeModal from '../../components/AddEmployeeModal'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'

const colors = ['purple', 'blue', 'emerald', 'amber', 'rose', 'cyan']
const dotMap = { purple: 'bg-purple-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500' }
const leftMap = { purple: 'border-l-purple-500', blue: 'border-l-blue-500', emerald: 'border-l-emerald-500', amber: 'border-l-amber-500', rose: 'border-l-rose-500', cyan: 'border-l-cyan-500' }
const activeMap = { purple: 'bg-purple-100 border-purple-300 text-purple-800', blue: 'bg-blue-100 border-blue-300 text-blue-800', emerald: 'bg-emerald-100 border-emerald-300 text-emerald-800', amber: 'bg-amber-100 border-amber-300 text-amber-800', rose: 'bg-rose-100 border-rose-300 text-rose-800', cyan: 'bg-cyan-100 border-cyan-300 text-cyan-800' }
const bgMap = { purple: 'bg-purple-50 text-purple-700 border-purple-200', blue: 'bg-blue-50 text-blue-700 border-blue-200', emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200', amber: 'bg-amber-50 text-amber-700 border-amber-200', rose: 'bg-rose-50 text-rose-700 border-rose-200', cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200' }

const PAGE_SIZE = 20

export default function EmployeeListPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [activeDept, setActiveDept] = useState('all')
  const [page, setPage] = useState(1)
  const [empData, setEmpData] = useState({ data: [], total: 0, totalPages: 1 })
  const [empLoading, setEmpLoading] = useState(false)
  const { t, lang } = useLang()
  const es = lang === 'es'
  const { formatCurrency } = useCurrency()

  // Dept counts — one call
  const { data: deptData, refetch: refetchDepts } = useFetch(() => empService.deptCounts(), { key: 'dept-counts' })
  const departments = deptData?.departments || []
  const totalCount = deptData?.total || 0

  const colorOf = (dId) => colors[(departments.findIndex(d => d.id === dId) + colors.length) % colors.length]

  // Fetch employees server-side
  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (activeDept !== 'all') params.departmentId = activeDept
      if (search) params.search = search
      const res = await empService.list(params)
      // axios interceptor unwraps to { data: [...], total, page, limit, totalPages }
      setEmpData({ data: res?.data || [], total: res?.total || 0, totalPages: res?.totalPages || 1 })
    } catch { setEmpData({ data: [], total: 0, totalPages: 1 }) }
    setEmpLoading(false)
  }, [activeDept, search, page])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [activeDept, search])

  const list = empData.data
  const activeName = activeDept === 'all' ? (es ? 'Todos' : 'All') : departments.find(d => d.id === activeDept)?.name || ''

  const handleRefresh = () => { fetchEmployees(); refetchDepts() }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{es ? 'Gestiona el equipo de tu organizacion.' : 'Manage your organization team.'}</p>
        <Button icon="add" onClick={() => setShowAdd(true)}>{es ? 'Agregar' : 'Add'}</Button>
      </div>

      <div className="flex gap-6 min-h-[calc(100vh-220px)]">
        {/* Left — departments */}
        <div className="w-56 shrink-0 space-y-1">
          <button onClick={() => setActiveDept('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeDept === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span className="material-symbols-outlined text-lg">groups</span>
            <span className="flex-1 text-left">{es ? 'Todos' : 'All'}</span>
            <span className={`text-xs ${activeDept === 'all' ? 'text-gray-300' : 'text-gray-400'}`}>{totalCount}</span>
          </button>
          <div className="h-px bg-gray-200 my-2" />
          {departments.map(d => {
            const c = colorOf(d.id)
            const isActive = activeDept === d.id
            return (
              <button key={d.id} onClick={() => setActiveDept(d.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${isActive ? activeMap[c] : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotMap[c]}`} />
                <span className="flex-1 text-left truncate">{d.name}</span>
                <span className="text-xs opacity-60">{d.count}</span>
              </button>
            )
          })}
        </div>

        {/* Right — employees */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-bold text-gray-900">{activeName}</h3>
            <span className="text-sm text-gray-400">{empData.total} {empData.total === 1 ? (es ? 'empleado' : 'employee') : (es ? 'empleados' : 'employees')}</span>
            <div className="flex-1" />
            <Input icon="search" placeholder={`${t('search')}...`} className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {empLoading && <div className="text-center text-gray-400 py-16">{es ? 'Cargando...' : 'Loading...'}</div>}

          {!empLoading && list.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">group_off</span>
              <p>{es ? 'Sin empleados' : 'No employees'}</p>
            </div>
          )}

          {!empLoading && list.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {list.map(emp => {
                const c = colorOf(emp.department?.id)
                return (
                  <div key={emp.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors border-l-4 ${leftMap[c]}`}>
                    <Avatar name={emp.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.roleTitle || emp.employeeCode}</p>
                    </div>
                    {activeDept === 'all' && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${bgMap[c]}`}>{emp.department?.name}</span>
                    )}
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-gray-400">{es ? 'Salario' : 'Salary'}</p>
                      <p className="text-sm font-medium text-gray-700">{formatCurrency(Number(emp.baseSalary) || 0)}</p>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-gray-400">{es ? 'Contrato' : 'Contract'}</p>
                      <p className="text-xs font-medium text-gray-600 capitalize">{emp.contractType || '-'}</p>
                    </div>
                    <Badge color={emp.status === 'active' ? 'success' : 'danger'} dot>{emp.status === 'active' ? t('active') : t('inactive')}</Badge>
                    <button className="text-gray-400 hover:text-primary p-1 rounded-full hover:bg-gray-100">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {empData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: empData.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === empData.totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`d${i}`} className="px-1 text-gray-400">...</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
                )}
              <button onClick={() => setPage(p => Math.min(empData.totalPages, p + 1))} disabled={page === empData.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AddEmployeeModal open={showAdd} onClose={() => { setShowAdd(false); handleRefresh() }} />
    </div>
  )
}
