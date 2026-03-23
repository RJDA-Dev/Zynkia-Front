import { useMemo, useState } from 'react'
import { employees, inventory } from '../../api/services'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FileUpload from '../../components/ui/FileUpload'
import Input from '../../components/ui/Input'
import MockImage from '../../components/ui/MockImage'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatCard from '../../components/ui/StatCard'
import Textarea from '../../components/ui/Textarea'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'
import useFetch from '../../hooks/useFetch'
import useCurrency from '../../hooks/useCurrency'
import Spinner from '../../components/ui/Spinner'

const statusColors = { assigned: 'success', warehouse: 'info', maintenance: 'warning' }

const conditionOptions = [
  { value: 'new', label: 'Nuevo' },
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
]

const emptyForm = {
  area: 'Tecnología', type: 'Portátil', category: 'laptop', brand: '', model: '', serial: '', cost: '', location: '', assignedEmployeeId: '', condition: 'good', purchaseDate: new Date().toISOString().slice(0, 10), specs: '', notes: '', photos: [],
}

export default function InventoryPage() {
  const { lang } = useLang()
  const { formatCurrency } = useCurrency()
  const toast = useToast()
  const es = lang === 'es'
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [area, setArea] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [form, setForm] = useState({ ...emptyForm })

  const { data, loading, invalidate } = useFetch(
    () => inventory.list({ search, status, area }),
    { key: `inventory-${search}-${status}-${area}`, deps: [search, status, area] }
  )
  const { data: employeesData } = useFetch(() => employees.list({ limit: 999 }), { key: 'inventory-employees' })

  const list = useMemo(() => (
    Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : data?.data?.data || []
  ), [data])
  const stats = useMemo(() => (
    data?.stats || data?.data?.stats || { total: 0, assigned: 0, available: 0, maintenance: 0, totalCost: 0 }
  ), [data])
  const employeeList = useMemo(() => (
    Array.isArray(employeesData?.data) ? employeesData.data : Array.isArray(employeesData) ? employeesData : employeesData?.data?.data || []
  ), [employeesData])

  const areaOptions = useMemo(() => {
    const unique = Array.from(new Set([
      ...list.map((i) => i.area),
      ...employeeList.map((i) => i.department?.name).filter(Boolean),
    ]))
    return [{ value: '', label: es ? 'Todas las áreas' : 'All areas' }, ...unique.map((i) => ({ value: i, label: i }))]
  }, [employeeList, es, list])

  const employeeOptions = [
    { value: '', label: es ? 'Sin asignar' : 'Unassigned' },
    ...employeeList.map((e) => ({ value: String(e.id), label: `${e.name} · ${e.roleTitle || e.department?.name || ''}` })),
  ]

  const statusOptions = [
    { value: '', label: es ? 'Todos' : 'All' },
    { value: 'assigned', label: es ? 'Asignado' : 'Assigned' },
    { value: 'warehouse', label: es ? 'Disponible' : 'Available' },
    { value: 'maintenance', label: es ? 'Mantenimiento' : 'Maintenance' },
  ]

  const resetForm = () => setForm({ ...emptyForm })

  const openEdit = (asset) => {
    setForm({
      area: asset.area || '', type: asset.type || '', category: asset.category || '', brand: asset.brand || '', model: asset.model || '', serial: asset.serial || '', cost: asset.cost || '', location: asset.location || '', assignedEmployeeId: asset.assignedEmployeeId ? String(asset.assignedEmployeeId) : '', condition: asset.condition || 'good', purchaseDate: asset.purchaseDate?.slice(0, 10) || '', specs: Array.isArray(asset.specs) ? asset.specs.join(', ') : (asset.specs || ''), notes: asset.notes || '', photos: asset.photos || [],
    })
    setEditingAsset(asset)
    setOpenCreate(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null, cost: Number(form.cost) || 0 }
      if (editingAsset) {
        await inventory.update(editingAsset.id, payload)
        toast.success(es ? 'Activo actualizado' : 'Asset updated')
      } else {
        await inventory.create(payload)
        toast.success(es ? 'Activo creado' : 'Asset created')
      }
      setOpenCreate(false)
      setEditingAsset(null)
      resetForm()
      invalidate()
    } catch {
      toast.error(es ? 'No se pudo guardar el activo' : 'Could not save asset')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await inventory.delete(deleteTarget.id)
      toast.success(es ? 'Activo eliminado' : 'Asset deleted')
      setDeleteTarget(null)
      invalidate()
    } catch {
      toast.error(es ? 'No se pudo eliminar' : 'Could not delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleAssign = async (assetId, employeeId) => {
    try {
      await inventory.assign(assetId, employeeId ? Number(employeeId) : null)
      toast.success(employeeId ? (es ? 'Activo asignado' : 'Asset assigned') : (es ? 'Activo liberado' : 'Asset released'))
      invalidate()
    } catch {
      toast.error(es ? 'No fue posible actualizar' : 'Could not update')
    }
  }

  const statusLabel = (s) => s === 'assigned' ? (es ? 'Asignado' : 'Assigned') : s === 'warehouse' ? (es ? 'Disponible' : 'Available') : (es ? 'Mantenimiento' : 'Maintenance')

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {es ? 'Administra equipos, seriales, evidencias y responsable de cada activo.' : 'Manage devices, serials, evidence and the current owner of each asset.'}
        </p>
        <Button icon="inventory_2" onClick={() => { resetForm(); setEditingAsset(null); setOpenCreate(true) }} className="w-full sm:w-auto">
          {es ? 'Registrar activo' : 'Register asset'}
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard label={es ? 'Activos totales' : 'Total assets'} value={stats.total || 0} icon="inventory_2" />
        <StatCard label={es ? 'Asignados' : 'Assigned'} value={stats.assigned || 0} icon="badge" iconColor="text-success bg-success/10" />
        <StatCard label={es ? 'Disponibles' : 'Available'} value={stats.available || 0} icon="deployed_code" iconColor="text-blue-600 bg-blue-50" />
        <StatCard label={es ? 'Valor inventario' : 'Inventory value'} value={formatCurrency(stats.totalCost || 0)} icon="payments" iconColor="text-amber-600 bg-amber-50" valueClassName="text-xl sm:text-2xl" />
      </div>

      <Card
        title={es ? 'Vista central de inventario' : 'Central inventory view'}
        subtitle={es ? 'Filtra por responsable, área o estado.' : 'Filter by owner, area or status.'}
        actions={
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {[{ v: 'grid', i: 'grid_view' }, { v: 'list', i: 'view_list' }].map(({ v, i }) => (
              <button key={v} onClick={() => setViewMode(v)} className={`rounded-lg p-1.5 transition-all ${viewMode === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="material-symbols-outlined text-[18px]">{i}</span>
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-3 border-b border-slate-200/80 p-4 sm:p-6 sm:grid-cols-[minmax(0,1.2fr)_180px_180px]">
          <Input icon="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={es ? 'Buscar serial, modelo o colaborador' : 'Search serial, model or employee'} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
          <Select value={area} onChange={(e) => setArea(e.target.value)} options={areaOptions} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl">inventory</span>
            <p className="mt-3 text-sm">{es ? 'No hay activos para este filtro.' : 'No assets match this filter.'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
            {list.map((asset) => (
              <article key={asset.id} className="group overflow-hidden rounded-[--radius-lg] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
                <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="relative min-h-[160px] sm:min-h-[220px] overflow-hidden">
                    {asset.photos?.[0]?.preview ? (
                      <img src={asset.photos[0].preview} alt={`${asset.brand} ${asset.model}`} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <MockImage category={asset.category || asset.type} className="h-full w-full" />
                    )}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <div className="rounded-[--radius-md] bg-slate-950/75 px-3 py-2 text-white backdrop-blur-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">{asset.type}</p>
                        <p className="mt-0.5 text-sm font-semibold truncate">{asset.brand} {asset.model}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{asset.assetCode}</p>
                        <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">{asset.brand} {asset.model}</h3>
                        <p className="text-xs text-slate-500">{asset.serial}</p>
                      </div>
                      <Badge color={statusColors[asset.status] || 'neutral'}>{statusLabel(asset.status)}</Badge>
                    </div>

                    <div className="grid gap-2 grid-cols-2">
                      <div className="rounded-[--radius-sm] bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Área' : 'Area'}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">{asset.area}</p>
                      </div>
                      <div className="rounded-[--radius-sm] bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Costo' : 'Cost'}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">{formatCurrency(asset.cost || 0)}</p>
                      </div>
                    </div>

                    <div className="rounded-[--radius-md] border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Responsable' : 'Owner'}</p>
                          <p className="text-sm font-semibold text-slate-900 truncate">{asset.assignedEmployee?.name || (es ? 'Sin asignar' : 'Unassigned')}</p>
                        </div>
                      </div>
                    </div>

                    <Select
                      label={es ? 'Vincular a empleado' : 'Link to employee'}
                      value={asset.assignedEmployeeId ? String(asset.assignedEmployeeId) : ''}
                      onChange={(e) => handleAssign(asset.id, e.target.value)}
                      options={employeeOptions}
                    />

                    {(asset.specs || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asset.specs.map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button variant="secondary" size="sm" icon="edit" onClick={() => openEdit(asset)} className="flex-1">
                        {es ? 'Editar' : 'Edit'}
                      </Button>
                      <Button variant="danger" size="sm" icon="delete" onClick={() => setDeleteTarget(asset)} className="flex-1">
                        {es ? 'Eliminar' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 px-4 py-3 sm:px-6 hover:bg-primary/[0.02] transition-colors">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  {asset.photos?.[0]?.preview ? (
                    <img src={asset.photos[0].preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <MockImage category={asset.category || asset.type} size="sm" className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{asset.brand} {asset.model}</p>
                  <p className="text-xs text-slate-500">{asset.serial} · {asset.area}</p>
                </div>
                <Badge color={statusColors[asset.status] || 'neutral'} size="sm">{statusLabel(asset.status)}</Badge>
                <span className="hidden sm:block text-sm font-medium text-slate-700 w-24 text-right">{formatCurrency(asset.cost || 0)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(asset)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => setDeleteTarget(asset)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={openCreate}
        onClose={() => { setOpenCreate(false); setEditingAsset(null); resetForm() }}
        title={editingAsset ? (es ? 'Editar activo' : 'Edit asset') : (es ? 'Registrar activo' : 'Register asset')}
        subtitle={editingAsset ? (es ? 'Modifica los datos del activo seleccionado.' : 'Update the selected asset data.') : (es ? 'Carga serial, evidencias y responsable.' : 'Upload serial, evidence and owner.')}
        icon="inventory_2"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpenCreate(false); setEditingAsset(null); resetForm() }}>
              {es ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button icon="save" onClick={handleSave} loading={saving}>
              {editingAsset ? (es ? 'Actualizar' : 'Update') : (es ? 'Guardar' : 'Save')}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2">
          <Input label={es ? 'Área' : 'Area'} value={form.area} onChange={(e) => setForm((c) => ({ ...c, area: e.target.value }))} />
          <Input label={es ? 'Tipo' : 'Type'} value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value, category: e.target.value.toLowerCase() }))} />
          <Input label="Brand" value={form.brand} onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))} />
          <Input label="Model" value={form.model} onChange={(e) => setForm((c) => ({ ...c, model: e.target.value }))} />
          <Input label="Serial" value={form.serial} onChange={(e) => setForm((c) => ({ ...c, serial: e.target.value }))} />
          <Input label={es ? 'Costo' : 'Cost'} type="number" value={form.cost} onChange={(e) => setForm((c) => ({ ...c, cost: e.target.value }))} />
          <Input label={es ? 'Ubicación' : 'Location'} value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} />
          <Input label={es ? 'Fecha compra' : 'Purchase date'} type="date" value={form.purchaseDate} onChange={(e) => setForm((c) => ({ ...c, purchaseDate: e.target.value }))} />
          <Select label={es ? 'Condición' : 'Condition'} value={form.condition} onChange={(e) => setForm((c) => ({ ...c, condition: e.target.value }))} options={conditionOptions} />
          <Select label={es ? 'Asignar a' : 'Assign to'} value={form.assignedEmployeeId} onChange={(e) => setForm((c) => ({ ...c, assignedEmployeeId: e.target.value }))} options={employeeOptions} />
          <Input className="sm:col-span-2" label={es ? 'Especificaciones' : 'Specs'} value={form.specs} onChange={(e) => setForm((c) => ({ ...c, specs: e.target.value }))} placeholder="Intel i7, 32 GB RAM, SSD 1 TB" />
          <Textarea className="sm:col-span-2" label={es ? 'Notas' : 'Notes'} value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <div className="sm:col-span-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{es ? 'Evidencias' : 'Evidence'}</p>
            <FileUpload onFiles={(files) => setForm((c) => ({ ...c, photos: files }))} accept=".png,.jpg,.jpeg,.webp" maxSize="8MB" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={es ? '¿Eliminar este activo?' : 'Delete this asset?'}
        message={deleteTarget ? `${deleteTarget.brand} ${deleteTarget.model} — ${deleteTarget.serial}` : ''}
        confirmText={es ? 'Eliminar' : 'Delete'}
        cancelText={es ? 'Cancelar' : 'Cancel'}
        icon="delete"
      />
    </div>
  )
}
