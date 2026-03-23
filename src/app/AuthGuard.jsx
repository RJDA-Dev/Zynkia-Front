import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLoader from '../components/ui/AppLoader'

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AppLoader label="Cargando sesión" detail="Validando acceso y preparando tu espacio..." icon="shield" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
