/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import AppLoader from '../components/ui/AppLoader'

const LoaderContext = createContext(null)
const emptyMessage = { label: '', detail: '', icon: 'downloading' }

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(emptyMessage)

  const show = useCallback((payload = '') => {
    if (typeof payload === 'string') {
      setMessage({ ...emptyMessage, label: payload })
    } else {
      setMessage({ ...emptyMessage, ...payload })
    }
    setLoading(true)
  }, [])
  const hide = useCallback(() => { setLoading(false); setMessage(emptyMessage) }, [])

  return (
    <LoaderContext.Provider value={{ show, hide, loading }}>
      {children}
      {loading && (
        <AppLoader
          label={message.label || 'Procesando'}
          detail={message.detail}
          icon={message.icon}
        />
      )}
    </LoaderContext.Provider>
  )
}

export const useLoader = () => useContext(LoaderContext)
