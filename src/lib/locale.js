export function copyFor(lang, value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) return value.map((item) => copyFor(lang, item))
  if (typeof value === 'object') {
    return value[lang] || value.es || value.en || Object.values(value)[0] || ''
  }
  return String(value)
}
