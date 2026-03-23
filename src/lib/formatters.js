export function formatRelativeTime(date, lang = 'es') {
  const isSpanish = lang === 'es'
  const value = new Date(date)

  if (Number.isNaN(value.getTime())) return ''

  const diff = Date.now() - value.getTime()
  const minutes = Math.floor(diff / 60_000)

  if (minutes < 1) return isSpanish ? 'Ahora' : 'Now'
  if (minutes < 60) return isSpanish ? `Hace ${minutes} min` : `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return isSpanish ? `Hace ${hours}h` : `${hours}h ago`

  const days = Math.floor(hours / 24)
  return isSpanish ? `Hace ${days}d` : `${days}d ago`
}
