import { createContext, useContext, useState, useCallback } from 'react'

const LoaderContext = createContext(null)

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const show = useCallback((msg = '') => { setMessage(msg); setLoading(true) }, [])
  const hide = useCallback(() => { setLoading(false); setMessage('') }, [])

  return (
    <LoaderContext.Provider value={{ show, hide, loading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
            </div>
            {message && <p className="text-sm text-gray-600 font-medium">{message}</p>}
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  )
}

export const useLoader = () => useContext(LoaderContext)
