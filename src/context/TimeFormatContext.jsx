import { createContext, useContext, useState, useEffect } from 'react'
import { settings } from '../api/services'

const Ctx = createContext({ timeFormat: '24h', formatTime: (t) => t })

export function TimeFormatProvider({ children }) {
  const [timeFormat, setTimeFormat] = useState('24h')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    settings.getLocalization().then(r => {
      const data = r?.data?.data || r?.data || r || {}
      if (data.timeFormat) setTimeFormat(data.timeFormat)
    }).catch(() => {})
  }, [])

  const formatTime = (time) => {
    if (!time || timeFormat === '24h') return time
    const [h, m] = time.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
  }

  return <Ctx.Provider value={{ timeFormat, setTimeFormat, formatTime }}>{children}</Ctx.Provider>
}

export const useTimeFormat = () => useContext(Ctx)
