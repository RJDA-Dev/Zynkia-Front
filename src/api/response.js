export function unwrapResponse(payload) {
  if (payload == null) return null
  return payload.data ?? payload
}

export function extractList(payload) {
  const value = unwrapResponse(payload)

  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items

  return []
}

export function extractStats(payload, fallback = {}) {
  const value = unwrapResponse(payload)
  return value?.stats || fallback
}

export function extractUnread(payload, fallback = 0) {
  const value = unwrapResponse(payload)
  return value?.unread ?? fallback
}
