import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { employees as empService } from '../../api/services'
import useFetch from '../../hooks/useFetch'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { useLang } from '../../context/LangContext'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import ProgressBar from '../../components/ui/ProgressBar'

export default function EmployeeDetailPage() {
  const { t, lang } = useLang()
  const es = lang === 'es'
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('info')

  const { data: emp, loading } = useFetch(() => empService.get(id), { deps: [id], key: `emp-${id}` })
  const { data: payslips } = useFetch(() => empService.payslips(id), { deps: [id], key: `payslips-${id}`, enabled: activeTab === 'nomina' })
  const { data: documents } = useFetch(() => empService.documents(id), { deps: [id], key: `docs-${id}`, enabled: activeTab === 'docs' })
  const { data: history } = useFetch(() => empService.history(id), { deps: [id], key: `hist-${id}`, enabled: activeTab === 'history' })

  const tabs = [
    { key: 'info', label: es ? 'Info Personal' : 'Personal Info', icon: 'person' },
    { key: 'nomina', label: es ? 'Nómina' : 'Payroll', icon: 'payments' },
    { key: 'docs', label: es ? 'Documentos' : 'Documents', icon: 'folder' },
    { key: 'history', label: es ? 'Historial' : 'History', icon: 'history' },
  ]

  if (loading || !emp) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <Link to="/employees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> {es ? 'Volver a empleados' : 'Back to employees'}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar name={emp.name} size="lg" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{emp.name}</h2>
          <p className="text-gray-500">{emp.roleTitle} · {emp.department?.name || '-'}</p>
          <div className="flex gap-2 mt-2">
            <Badge color={emp.status === 'active' ? 'success' : 'danger'} dot>{emp.status}</Badge>
            <Badge color="primary">ID: {emp.employeeCode || emp.id?.slice(0,8)}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="edit">{es ? 'Editar' : 'Edit'}</Button>
          <Button variant="secondary" icon="mail">{es ? 'Mensaje' : 'Message'}</Button>
        </div>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <Card title={es ? 'Datos Personales' : 'Personal Data'}>
              <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                {[
                  ['Email', emp.email],
                  [es ? 'Teléfono' : 'Phone', emp.phone || '-'],
                  [es ? 'Documento' : 'ID Number', `${emp.documentType || 'CC'} ${emp.documentNumber || '-'}`],
                  [es ? 'Fecha Nacimiento' : 'Birth Date', emp.birthDate || '-'],
                  [es ? 'Dirección' : 'Address', emp.address || '-'],
                  [es ? 'Fecha Ingreso' : 'Start Date', emp.startDate || '-'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-gray-900 font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={es ? 'Contrato' : 'Contract'}>
              <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                {[
                  [es ? 'Tipo' : 'Type', emp.contractType || '-'],
                  [es ? 'Salario Base' : 'Base Salary', emp.baseSalary ? `$${Number(emp.baseSalary).toLocaleString('es-CO')} COP` : '-'],
                  [es ? 'Jornada' : 'Schedule', `${emp.workHoursPerWeek || 46} ${es ? 'horas semanales' : 'hours/week'}`],
                  [es ? 'Sede' : 'Office', emp.officeLocation || '-'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-gray-900 font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card title={es ? 'Horas esta semana' : 'Hours this week'}>
              <div className="p-6"><ProgressBar value={0} max={emp.workHoursPerWeek || 46} label="" /></div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'nomina' && (
        <Card title={es ? 'Desprendibles de Nómina' : 'Payslips'}>
          <div className="divide-y divide-gray-100">
            {(payslips || []).length === 0 && <p className="p-6 text-sm text-gray-400 text-center">{es ? 'Sin registros de nómina' : 'No payroll records'}</p>}
            {(payslips || []).map((p, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.period || p.month}</p>
                  <p className="text-xs text-gray-500">{es ? 'Neto' : 'Net'}: ${Number(p.net || 0).toLocaleString('es-CO')}</p>
                </div>
                <Badge color="success">{es ? 'Pagado' : 'Paid'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'docs' && (
        <Card title={es ? 'Documentos' : 'Documents'}>
          <div className="divide-y divide-gray-100">
            {(documents || []).length === 0 && <p className="p-6 text-sm text-gray-400 text-center">{es ? 'Sin documentos' : 'No documents'}</p>}
            {(documents || []).map((d, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.category || ''} · {d.fileSize ? `${d.fileSize} bytes` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card title={es ? 'Historial del Empleado' : 'Employee History'}>
          <div className="p-6">
            {(history || []).length === 0 && <p className="text-sm text-gray-400 text-center">{es ? 'Sin historial' : 'No history'}</p>}
            <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
              {(history || []).map((h, i) => (
                <div key={i} className="flex gap-4 ml-[-9px]">
                  <div className="h-4 w-4 rounded-full bg-white border-2 border-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{h.action}: {h.description || ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
