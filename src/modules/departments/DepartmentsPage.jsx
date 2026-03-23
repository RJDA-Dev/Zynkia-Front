import { useState } from 'react'
import { departments } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import InteractivePanel from '../../components/ui/InteractivePanel'
import AppLoader from '../../components/ui/AppLoader'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'

const tones = [
  'from-emerald-50 via-white to-emerald-100/70',
  'from-sky-50 via-white to-cyan-100/70',
  'from-amber-50 via-white to-orange-100/70',
  'from-rose-50 via-white to-pink-100/70',
  'from-violet-50 via-white to-fuchsia-100/70',
]

export default function DepartmentsPage() {
  const { t, lang } = useLang()
  const toast = useToast()
  const es = lang === 'es'
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const { data, loading, refetch } = useFetch(() => departments.list(), { key: 'departments' })
  const list = Array.isArray(data) ? data : data?.data || []
  const totalEmployees = list.reduce((sum, item) => sum + (item.employeeCount || item.count || 0), 0)

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await departments.create({ name })
      setName('')
      setShowForm(false)
      refetch()
      toast.success(es ? 'Departamento creado' : 'Department created')
    } catch {
      toast.error(es ? 'Error al crear' : 'Error creating')
    }
  }

  const handleDelete = async (id) => {
    try {
      await departments.remove(id)
      refetch()
      toast.success(es ? 'Departamento eliminado' : 'Department deleted')
    } catch {
      toast.error(es ? 'Error al eliminar' : 'Error deleting')
    }
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-6">
      <Card
        title={es ? 'Diseño organizacional' : 'Organization design'}
        subtitle={es ? 'Los departamentos quedan como estructura operativa de la plataforma, no como una tabla aislada.' : 'Departments now act as the operating structure of the platform instead of an isolated table.'}
        className="rounded-[32px] border-white/70 bg-white/84 backdrop-blur-sm"
        actions={<Button icon="add" onClick={() => setShowForm((current) => !current)}>{es ? 'Nuevo departamento' : 'New department'}</Button>}
      >
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="relative overflow-hidden rounded-[--radius-xl] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_24%),linear-gradient(140deg,_#082f2e,_#0f766e_62%,_#14532d)] p-6 text-white shadow-[--shadow-xl]">
            <div className="absolute inset-x-[-35%] top-10 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent opacity-30" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                {es ? 'Base organizacional' : 'Organizational base'}
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                {es ? 'Cada frente con responsable, carga y visibilidad real.' : 'Every area with ownership, load and real visibility.'}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76">
                {es
                  ? 'Esta vista alimenta empleados, accesos, inventario, turnos y reportes para que la estructura organizacional quede consistente.'
                  : 'This view feeds employees, access, inventory, schedules and reports so the organizational structure remains consistent.'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: es ? 'Áreas activas' : 'Active areas', value: list.length, icon: 'apartment' },
              { label: es ? 'Base asociada' : 'Linked headcount', value: totalEmployees, icon: 'groups' },
              { label: es ? 'Managers visibles' : 'Visible managers', value: list.filter((item) => item.manager?.name).length, icon: 'supervisor_account' },
            ].map((item) => (
              <InteractivePanel key={item.label} className="border border-slate-200 bg-white/92 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
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

      {showForm && (
        <Card className="rounded-[--radius-xl] border-white/70 bg-white/84 backdrop-blur-sm">
          <div className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
            <Input placeholder={es ? 'Nombre del departamento' : 'Department name'} value={name} onChange={(event) => setName(event.target.value)} />
            <Button onClick={handleCreate}>{t('save')}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t('cancel')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <AppLoader
          inline
          label={es ? 'Cargando departamentos' : 'Loading departments'}
          detail={es ? 'Actualizando estructura organizacional sin refrescar la página.' : 'Refreshing organization structure without a full page reload.'}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {list.map((department, index) => (
            <InteractivePanel key={department.id} className={`border border-slate-200 bg-gradient-to-br ${tones[index % tones.length]} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight text-slate-900">{department.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {department.manager?.name
                      ? `${es ? 'Responsable' : 'Owner'}: ${department.manager.name}`
                      : (es ? 'Sin responsable asignado' : 'No owner assigned')}
                  </p>
                </div>
                <Badge color="primary">{department.employeeCount || department.count || 0}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[--radius-md] bg-white/82 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Headcount' : 'Headcount'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{department.employeeCount || department.count || 0} {es ? 'empleados' : 'employees'}</p>
                </div>
                <div className="rounded-[--radius-md] bg-white/82 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Clave interna' : 'Internal key'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{department.id}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">
                  {es ? 'Alineado con empleados, inventario y accesos' : 'Aligned with employees, inventory and access'}
                </span>
                <button onClick={() => handleDelete(department.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </InteractivePanel>
          ))}

          {list.length === 0 && (
            <div className="col-span-full rounded-[--radius-xl] border border-dashed border-slate-300 bg-white/88 px-6 py-16 text-center">
              <span className="material-symbols-outlined text-[42px] text-slate-300">apartment</span>
              <p className="mt-4 text-lg font-semibold text-slate-900">{es ? 'Aún no hay departamentos' : 'No departments yet'}</p>
              <p className="mt-2 text-sm text-slate-500">{es ? 'Crea el primero para organizar empleados, accesos e inventario.' : 'Create the first one to organize employees, access and inventory.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
