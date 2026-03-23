import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useLoader } from '../context/LoaderContext'
import Avatar from './ui/Avatar'

export default function UserMenu({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { lang } = useLang()
  const loader = useLoader()
  const es = lang === 'es'
  const [confirming, setConfirming] = useState(false)

  const handleLogout = async () => {
    if (!confirming) { setConfirming(true); return }
    loader.show(es ? 'Cerrando sesión...' : 'Signing out...')
    await new Promise(r => setTimeout(r, 800))
    logout()
    loader.hide()
    navigate('/login')
  }

  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <button onClick={() => navigate('/profile')} className="shrink-0 relative">
        <Avatar name={user?.name} size="sm" />
        <div className="ui-success-dot absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white" />
      </button>
      {!collapsed && (
        <>
          <button onClick={() => navigate('/profile')} className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </button>
          <button
            onClick={handleLogout}
            onMouseLeave={() => setConfirming(false)}
            className={`shrink-0 p-1.5 rounded-lg transition-all ${confirming ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title={confirming ? (es ? 'Click para confirmar' : 'Click to confirm') : (es ? 'Cerrar sesión' : 'Sign out')}
          >
            <span className="material-symbols-outlined text-[20px]">{confirming ? 'check' : 'logout'}</span>
          </button>
        </>
      )}
    </div>
  )
}
