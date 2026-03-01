import { useState } from 'react'
import { departments } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

export default function DepartmentsPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const { data, loading, refetch } = useFetch(() => departments.list(), { key: 'departments' })
  const list = data || []

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await departments.create({ name })
      setName('')
      setShowForm(false)
      refetch()
      toast.success(es ? 'Departamento creado' : 'Department created')
    } catch { toast.error(es ? 'Error al crear' : 'Error creating') }
  }

  const handleDelete = async (id) => {
    try {
      await departments.remove(id)
      refetch()
      toast.success(es ? 'Departamento eliminado' : 'Department deleted')
    } catch { toast.error(es ? 'Error al eliminar' : 'Error deleting') }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{es ? 'Gestiona los departamentos de tu organización.' : 'Manage your organization departments.'}</p>
        </div>
        <Button icon="add" onClick={() => setShowForm(!showForm)}>{es ? 'Nuevo' : 'New'}</Button>
      </div>

      {showForm && (
        <Card>
          <div className="p-4 flex gap-3">
            <Input placeholder={es ? 'Nombre del departamento' : 'Department name'} value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            <Button onClick={handleCreate}>{t('save')}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t('cancel')}</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
          <div className="divide-y divide-gray-100">
            {list.length === 0 && <div className="p-8 text-center text-gray-400">{es ? 'Sin departamentos' : 'No departments'}</div>}
            {list.map(d => (
              <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                  {d.manager && <p className="text-xs text-gray-500">{es ? 'Responsable' : 'Manager'}: {d.manager.name}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="neutral">{d.employeeCount || 0} {es ? 'empleados' : 'employees'}</Badge>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-danger p-1 rounded-full hover:bg-gray-100">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
