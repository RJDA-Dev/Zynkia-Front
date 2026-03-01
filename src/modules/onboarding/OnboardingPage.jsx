import { useState } from 'react'
import { onboarding, employees } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import { useToast } from '../../context/ToastContext'
import { useLang } from '../../context/LangContext'

export default function OnboardingPage() {
  const toast = useToast()
  const { t, lang } = useLang()
  const es = lang === 'es'
  const [selectedEmp, setSelectedEmp] = useState('')

  const { data: processes, loading, refetch } = useFetch(() => onboarding.list({}), { key: 'onboarding' })
  const { data: empData } = useFetch(() => employees.list(), { key: 'emp-list-onb' })

  const list = processes || []
  const empList = (empData?.data || empData || []).map(e => ({ value: e.id, label: e.name }))

  const handleStart = async () => {
    if (!selectedEmp) return
    try {
      await onboarding.start(selectedEmp)
      setSelectedEmp('')
      refetch()
      toast.success(es ? 'Onboarding iniciado' : 'Onboarding started')
    } catch { toast.error(es ? 'Error al iniciar' : 'Error starting') }
  }

  const handleAdvance = async (id) => {
    try {
      await onboarding.advance(id)
      refetch()
      toast.success(es ? 'Paso avanzado' : 'Step advanced')
    } catch { toast.error(es ? 'Error al avanzar' : 'Error advancing') }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('onboarding')}</h2>
          <p className="mt-1 text-gray-500">{es ? 'Flujo de ingreso de nuevos empleados.' : 'New employee onboarding flow.'}</p>
        </div>
      </div>

      <Card title={es ? 'Iniciar Nuevo Onboarding' : 'Start New Onboarding'}>
        <div className="p-4 flex gap-3 items-end">
          <Select label={es ? 'Empleado' : 'Employee'} options={empList} value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} className="flex-1" />
          <Button icon="person_add" onClick={handleStart}>{es ? 'Iniciar' : 'Start'}</Button>
        </div>
      </Card>

      <Card title={es ? 'Procesos Activos' : 'Active Processes'}>
        {loading ? <div className="p-8 text-center text-gray-400">{es ? 'Cargando...' : 'Loading...'}</div> : (
          <div className="divide-y divide-gray-100">
            {list.length === 0 && <div className="p-8 text-center text-gray-400">{es ? 'Sin procesos de onboarding' : 'No onboarding processes'}</div>}
            {list.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.employee?.name || '-'}</p>
                  <p className="text-xs text-gray-500">{p.employee?.position || ''} · {es ? 'Inicio' : 'Start'}: {p.startedAt ? new Date(p.startedAt).toLocaleDateString() : '-'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.currentStep}/{p.totalSteps}</span>
                  </div>
                  <Badge color={p.status === 'completed' ? 'success' : 'warning'}>{p.status === 'completed' ? (es ? 'Completado' : 'Completed') : (es ? 'En proceso' : 'In progress')}</Badge>
                  {p.status !== 'completed' && (
                    <Button variant="ghost" size="sm" icon="arrow_forward" onClick={() => handleAdvance(p.id)}>{es ? 'Avanzar' : 'Advance'}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
