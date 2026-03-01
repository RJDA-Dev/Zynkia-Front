import { useState, useEffect, useCallback, useRef } from 'react'

const cache = new Map()
const CACHE_TTL = 30_000

export default function useFetch(fn, { deps = [], key = '', enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const execute = useCallback(async (...args) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const cacheKey = key || fn.toString()
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      if (!ctrl.signal.aborted) {
        setData(result)
        if (key) cache.set(cacheKey, { data: result, ts: Date.now() })
      }
      return result
    } catch (err) {
      if (!ctrl.signal.aborted) setError(err)
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (enabled) execute()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [execute, enabled])

  const invalidate = useCallback(() => {
    if (key) cache.delete(key)
    return execute()
  }, [key, execute])

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
  const [total, setTotal] = useState(0)

  const { data, loading, error, refetch } = useFetch(
    () => fetchFn({ page, limit: pageSize }),
    { deps: [page], key: key ? `${key}-p${page}` : '' }
  )

  useEffect(() => {
    if (data?.total !== undefined) setTotal(data.total)
  }, [data])

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
