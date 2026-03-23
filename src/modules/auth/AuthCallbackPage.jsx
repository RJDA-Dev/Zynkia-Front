import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { handleCallback } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const code = params.get('code')
    if (code) {
      handleCallback(code)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => navigate('/login', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )
}
