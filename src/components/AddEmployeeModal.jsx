import { useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Select from './ui/Select'
import Button from './ui/Button'
import Avatar from './ui/Avatar'
import { useToast } from '../context/ToastContext'

const departments = [
  { value: 'technology', label: 'Tecnología' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'sales', label: 'Ventas' },
  { value: 'management', label: 'Gerencia' },
]

const roles = [
  { value: 'employee', label: 'Empleado' },
  { value: 'coordinator', label: 'Coordinador' },
  { value: 'admin', label: 'Administrador' },
]

export default function AddEmployeeModal({ open, onClose }) {
  const [name, setName] = useState('')
  const toast = useToast()

  const handleSave = () => {
    toast.success('Empleado agregado exitosamente')
    setName('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar Empleado"
      icon="person_add"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button icon="person_add" onClick={handleSave}>Agregar</Button>
        </>
      }
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <Avatar name={name || 'N N'} size="lg" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Vista previa</p>
            <p className="font-semibold text-gray-900">{name || 'Nombre del empleado'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Apellido" placeholder="Apellido" />
        </div>
        <Input label="Correo electrónico" type="email" icon="mail" placeholder="correo@empresa.com" />
        <Input label="Teléfono" icon="phone" placeholder="+57 300 000 0000" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Departamento" options={departments} />
          <Select label="Rol" options={roles} />
        </div>
        <Input label="Cargo" placeholder="Ej: Desarrollador Backend" />
      </div>
    </Modal>
  )
}
