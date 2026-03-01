import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const API = 'http://localhost:3000/api'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch { return null }
}

function isTokenExpired(token) {
  const p = decodeJwt(token)
  return !p || p.exp * 1000 < Date.now() + 30_000
}

// PKCE helpers
function generateCodeVerifier() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const extractUser = useCallback((token) => {
    const p = decodeJwt(token)
    if (!p) return null
    const roles = p.realm_access?.roles || []
    const role = roles.includes('admin') ? 'admin' : roles.includes('coordinator') ? 'coordinator' : 'employee'
    return { sub: p.sub, email: p.email, tenantId: p.tenant_id, role, name: p.name || p.preferred_username || p.email }
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (err.message?.includes('action') || err.statusCode === 401) {
        await loginWithMFA()
        return null
      }
      throw new Error(err.message || 'Invalid credentials')
    }
    const data = await res.json()
    const tokens = data.data || data
    localStorage.setItem('token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const u = extractUser(tokens.access_token)
    setUser(u)
    return u
  }, [extractUser])

  const loginWithMFA = useCallback(async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem('pkce_verifier', verifier)
    // Get auth URL from backend
    const cfgRes = await fetch(`${API}/auth/config`)
    const cfg = await cfgRes.json()
    const authUrl = cfg.data?.authorization_url || cfg.authorization_url
    const clientId = cfg.data?.client_id || cfg.client_id || 'zynkia-app'
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: 'openid',
      redirect_uri: window.location.origin + '/auth/callback',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    window.location.href = `${authUrl}?${params}`
  }, [])

  const handleCallback = useCallback(async (code) => {
    const verifier = sessionStorage.getItem('pkce_verifier')
    sessionStorage.removeItem('pkce_verifier')
    const res = await fetch(`${API}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: window.location.origin + '/auth/callback', code_verifier: verifier || '' }),
    })
    if (!res.ok) throw new Error('Token exchange failed')
    const data = await res.json()
    const tokens = data.data || data
    localStorage.setItem('token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const u = extractUser(tokens.access_token)
    setUser(u)
    return u
  }, [extractUser])

  const refresh = useCallback(async () => {
    const rt = localStorage.getItem('refresh_token')
    if (!rt) return false
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const tokens = data.data || data
      localStorage.setItem('token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      setUser(extractUser(tokens.access_token))
      return true
    } catch {
      logout()
      return false
    }
  }, [extractUser])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    if (isTokenExpired(token)) {
      refresh().finally(() => setLoading(false))
    } else {
      setUser(extractUser(token))
      setLoading(false)
    }
  }, [extractUser, refresh])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      const token = localStorage.getItem('token')
      if (token && isTokenExpired(token)) refresh()
    }, 60_000)
    return () => clearInterval(interval)
  }, [user, refresh])

  // Sync currency and timeFormat from backend
  const syncCurrency = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 403) { logout(); return }
      if (res.ok) {
        const json = await res.json()
        const c = json?.data?.currency || json?.currency
        if (c) localStorage.setItem('currency', c)
      }
      const loc = await fetch(`${API}/settings/localization`, { headers: { Authorization: `Bearer ${token}` } })
      if (loc.ok) {
        const lj = await loc.json()
        const d = lj?.data || lj
        if (d?.timeFormat) localStorage.setItem('timeFormat', d.timeFormat)
      }
    } catch {}
  }, [])

  useEffect(() => { if (user) syncCurrency() }, [user, syncCurrency])

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithMFA, handleCallback, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
