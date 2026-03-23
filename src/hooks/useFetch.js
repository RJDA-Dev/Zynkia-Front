import { useState, useEffect, useCallback, useRef } from 'react'

const cache = new Map()
const CACHE_TTL = 30_000

export default function useFetch(fn, { deps = [], key = '', enabled = true, initialData = null, select = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const fnRef = useRef(fn)
  const keyRef = useRef(key)
  const selectRef = useRef(select)
  const depsSignature = JSON.stringify(deps)

  useEffect(() => { fnRef.current = fn }, [fn])
  useEffect(() => { keyRef.current = key }, [key])
  useEffect(() => { selectRef.current = select }, [select])

  const execute = useCallback(async (...args) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const resolvedKey = typeof keyRef.current === 'function' ? keyRef.current(...args) : keyRef.current
    const canUseCache = typeof resolvedKey === 'string' && resolvedKey.length > 0
    const cached = canUseCache ? cache.get(resolvedKey) : null
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    setLoading(true)
    setError(null)
    try {
      const result = await fnRef.current(...args)
      const nextData = selectRef.current ? selectRef.current(result) : result
      if (!ctrl.signal.aborted) {
        setData(nextData)
        if (canUseCache) cache.set(resolvedKey, { data: nextData, ts: Date.now() })
      }
      return nextData
    } catch (err) {
      if (!ctrl.signal.aborted) setError(err)
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) execute()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [depsSignature, enabled, execute])

  const invalidate = useCallback(() => {
    const resolvedKey = typeof keyRef.current === 'function' ? keyRef.current() : keyRef.current
    if (resolvedKey) cache.delete(resolvedKey)
    return execute()
  }, [execute])

  return { data, loading, error, refetch: execute, invalidate }
}

export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { mutate, loading, error }
}

export function usePagination(fetchFn, { pageSize = 20, key = '' } = {}) {
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    () => fetchFn({ page, limit: pageSize }),
    { deps: [page], key: key ? `${key}-p${page}` : '' }
  )
  const total = data?.total || 0

  return {
    data: data?.data || data || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    loading,
    error,
    setPage,
    refetch,
  }
}

export function invalidateCache(prefix) {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k)
  }
}
