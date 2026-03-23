import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employees as empService } from '../../api/services'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import AppLoader from '../../components/ui/AppLoader'
import Input from '../../components/ui/Input'
import InteractivePanel from '../../components/ui/InteractivePanel'
import { useLang } from '../../context/LangContext'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'

const departmentTones = [
  {
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    soft: 'from-emerald-50 via-white to-emerald-100/60',
    dot: 'bg-emerald-500',
  },
  {
    chip: 'bg-sky-50 text-sky-700 border-sky-200',
    soft: 'from-sky-50 via-white to-cyan-100/60',
    dot: 'bg-sky-500',
  },
  {
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    soft: 'from-amber-50 via-white to-orange-100/60',
    dot: 'bg-amber-500',
  },
  {
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    soft: 'from-rose-50 via-white to-pink-100/60',
    dot: 'bg-rose-500',
  },
  {
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    soft: 'from-violet-50 via-white to-fuchsia-100/60',
    dot: 'bg-violet-500',
  },
  {
    chip: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    soft: 'from-cyan-50 via-white to-teal-100/60',
    dot: 'bg-cyan-500',
  },
]

const PAGE_SIZE = 20

function getTone(departments, departmentId) {
  const index = departments.findIndex((item) => item.id === departmentId)
  return departmentTones[(index < 0 ? 0 : index) % departmentTones.length]
}

export default function EmployeeListPage() {
  const [search, setSearch] = useState('')
  const [activeDept, setActiveDept] = useState('all')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { formatCurrency } = useCurrency()
  const isSpanish = lang === 'es'

  const { data: deptData, refetch: refetchDepts } = useFetch(() => empService.deptCounts(), { key: 'dept-counts' })
  const departments = deptData?.departments || []
  const totalCount = deptData?.total || 0

  const employeeParams = {
    page,
    limit: PAGE_SIZE,
    ...(activeDept !== 'all' ? { departmentId: activeDept } : {}),
    ...(search ? { search } : {}),
  }

  const { data: employeesResponse, loading: empLoading, refetch: refetchEmployees } = useFetch(
    () => empService.list(employeeParams),
    { key: `employees-${page}-${activeDept}-${search}`, deps: [page, activeDept, search] }
  )

  const employees = employeesResponse?.data || []
  const totalPages = employeesResponse?.totalPages || 1
  const totalResults = employeesResponse?.total || 0
  const activeDepartment = activeDept === 'all'
    ? null
    : departments.find((department) => department.id === activeDept)
  const activeName = activeDepartment?.name || (isSpanish ? 'Toda la compañía' : 'Whole company')
  const visibleActiveEmployees = employees.filter((employee) => employee.status === 'active').length
  const visibleSalaryProjection = employees.reduce((sum, employee) => sum + (Number(employee.baseSalary) || 0), 0)

  const handleRefresh = () => {
    refetchEmployees()
    refetchDepts()
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      <Card
        title={isSpanish ? 'Centro de empleados' : 'Employee hub'}
        subtitle={isSpanish ? 'Consulta la base activa creada desde contratos firmados y administración, filtra por frente operativo y entra al detalle sin salir del flujo administrativo.' : 'Browse the active base created from signed contracts and administration, filter by area and open details without leaving operations.'}
        className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
        actions={<span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{isSpanish ? 'Alta automática desde contrato' : 'Auto-created from contract'}</span>}
      >
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="relative overflow-hidden rounded-[--radius-xl] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_22%),linear-gradient(135deg,_#082f2e_0%,_#0f766e_56%,_#14532d_100%)] p-6 text-white shadow-[--shadow-xl]">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/80">
                {isSpanish ? 'Administración interna' : 'Internal administration'}
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                {isSpanish ? 'Diseño orientado a operación, no a tablas pesadas.' : 'An operation-first layout instead of heavy tables.'}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76">
                {isSpanish
                  ? 'La lista prioriza búsqueda rápida, contexto del colaborador, salario, estado y accesos directos. Las nuevas altas ya nacen desde firma de contrato.'
                  : 'The list prioritizes fast search, employee context, salary, status and direct follow-up actions. New hires now originate from contract signing.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  isSpanish ? 'Vista móvil usable' : 'Usable on mobile',
                  isSpanish ? 'Filtros por área' : 'Department filters',
                  isSpanish ? 'Carga por componente' : 'Component-level loading',
                ].map((item) => (
                  <span key={item} className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/82 ring-1 ring-white/12">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: isSpanish ? 'Plantilla total' : 'Total workforce',
                value: totalCount,
                icon: 'groups',
                hint: isSpanish ? 'Base centralizada' : 'Centralized base',
              },
              {
                label: isSpanish ? 'Resultados visibles' : 'Visible results',
                value: totalResults,
                icon: 'visibility',
                hint: activeDept === 'all' ? (isSpanish ? 'Todos los equipos' : 'All departments') : activeName,
              },
              {
                label: isSpanish ? 'Nómina visible' : 'Visible payroll',
                value: formatCurrency(visibleSalaryProjection),
                icon: 'payments',
                hint: isSpanish ? 'Estimado página actual' : 'Current page estimate',
              },
            ].map((item) => (
              <InteractivePanel key={item.label} className="border border-slate-200 bg-white/92 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                </div>
              </InteractivePanel>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <div className="space-y-4">
          <InteractivePanel className="border border-slate-200 bg-white/90 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {isSpanish ? 'Filtro por frente' : 'Department filter'}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{activeName}</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {departments.length + 1}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => { setActiveDept('all'); setPage(1) }}
                className={`flex w-full items-center gap-3 rounded-[--radius-md] px-3 py-3 text-left transition ${
                  activeDept === 'all'
                    ? 'bg-slate-900 text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)]'
                    : 'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">apartment</span>
                <span className="flex-1 text-sm font-semibold">{isSpanish ? 'Toda la compañía' : 'Whole company'}</span>
                <span className={`text-xs ${activeDept === 'all' ? 'text-white/65' : 'text-slate-400'}`}>{totalCount}</span>
              </button>

              {departments.map((department) => {
                const tone = getTone(departments, department.id)
                const isActive = activeDept === department.id

                return (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => { setActiveDept(department.id); setPage(1) }}
                    className={`flex w-full items-center gap-3 rounded-[--radius-md] border px-3 py-3 text-left transition ${
                      isActive
                        ? `${tone.chip} shadow-sm`
                        : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                    <span className="flex-1 truncate text-sm font-semibold">{department.name}</span>
                    <span className="text-xs opacity-70">{department.count}</span>
                  </button>
                )
              })}
            </div>
          </InteractivePanel>

          <InteractivePanel className="border border-slate-200 bg-white/90 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {isSpanish ? 'Pulso visible' : 'Visible pulse'}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{isSpanish ? 'Activos en pantalla' : 'Active on screen'}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{visibleActiveEmployees}</p>
              </div>
              <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{isSpanish ? 'Página actual' : 'Current page'}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{page}/{totalPages}</p>
              </div>
              <div className="rounded-[--radius-md] bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{isSpanish ? 'Búsqueda aplicada' : 'Applied search'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{search || (isSpanish ? 'Sin filtro' : 'No filter')}</p>
              </div>
            </div>
          </InteractivePanel>
        </div>

        <div className="space-y-5">
          <Card
            title={isSpanish ? 'Explorador de colaboradores' : 'Employee explorer'}
            subtitle={isSpanish ? 'Busca por nombre o código y abre acciones rápidas desde cada tarjeta.' : 'Search by name or code and open quick actions from each card.'}
            className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
              <Input
                icon="search"
                placeholder={`${t('search')}...`}
                className="w-full lg:max-w-md"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              />
              <div className="hidden flex-1 lg:block" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {totalResults} {isSpanish ? 'resultados' : 'results'}
                </span>
                <Button variant="secondary" icon="refresh" onClick={handleRefresh}>
                  {isSpanish ? 'Recargar lista' : 'Reload list'}
                </Button>
              </div>
            </div>
          </Card>

          {empLoading && (
            <AppLoader
              inline
              label={isSpanish ? 'Cargando empleados' : 'Loading employees'}
              detail={isSpanish ? 'Actualizando tarjetas, filtros y resumen salarial sin refrescar la página.' : 'Refreshing cards, filters and salary summary without a full page refresh.'}
              icon="group"
            />
          )}

          {!empLoading && employees.length === 0 && (
            <InteractivePanel className="border border-dashed border-slate-300 bg-white/88 px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[32px]">group_off</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{isSpanish ? 'No hay empleados para este filtro' : 'No employees for this filter'}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {isSpanish ? 'Prueba otra búsqueda o cambia el frente operativo para ver más resultados.' : 'Try another search or change the operating area to see more results.'}
              </p>
            </InteractivePanel>
          )}

          {!empLoading && employees.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {employees.map((employee) => {
                const tone = getTone(departments, employee.department?.id)
                const statusLabel = employee.status === 'active' ? t('active') : t('inactive')

                return (
                  <InteractivePanel
                    key={employee.id}
                    className={`border border-slate-200 bg-gradient-to-br ${tone.soft} p-5`}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <Avatar name={employee.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-slate-900">{employee.name}</p>
                            <p className="mt-1 truncate text-sm text-slate-500">{employee.roleTitle || employee.employeeCode}</p>
                          </div>
                        </div>
                        <Badge color={employee.status === 'active' ? 'success' : 'neutral'} dot>{statusLabel}</Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone.chip}`}>
                          <span className="material-symbols-outlined text-[14px]">apartment</span>
                          {employee.department?.name || (isSpanish ? 'Sin área' : 'No area')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          {formatCurrency(Number(employee.baseSalary) || 0)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[--radius-md] bg-white/72 px-4 py-3 ring-1 ring-inset ring-white/80">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Contrato' : 'Contract'}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">{employee.contractType || '-'}</p>
                        </div>
                        <div className="rounded-[--radius-md] bg-white/72 px-4 py-3 ring-1 ring-inset ring-white/80">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isSpanish ? 'Código' : 'Code'}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{employee.employeeCode}</p>
                        </div>
                      </div>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        icon="visibility"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(`/employees/${employee.id}`)
                        }}
                      >
                        {isSpanish ? 'Ver detalle' : 'View detail'}
                      </Button>
                      <Button
                        variant="ghost"
                        icon="edit"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(`/employees/${employee.id}`)
                        }}
                      >
                        {isSpanish ? 'Editar' : 'Edit'}
                      </Button>
                    </div>
                  </InteractivePanel>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1)
                .reduce((acc, value, index, array) => {
                  if (index > 0 && value - array[index - 1] > 1) acc.push('...')
                  acc.push(value)
                  return acc
                }, [])
                .map((value, index) => (
                  value === '...'
                    ? <span key={`dots-${index}`} className="px-1 text-sm text-slate-300">...</span>
                    : (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPage(value)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-semibold transition ${
                          value === page
                            ? 'bg-slate-900 text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)]'
                            : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {value}
                      </button>
                    )
                ))}

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
