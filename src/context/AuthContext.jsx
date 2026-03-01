import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const KC_URL = 'http://localhost:8080'
const KC_REALM = 'zynkia'
const KC_CLIENT = 'zynkia-app'
const TOKEN_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`
const AUTH_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/auth`
const LOGOUT_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/logout`
const REDIRECT_URI = window.location.origin + '/auth/callback'

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

  // Direct grant login (works when MFA is NOT required)
  const login = useCallback(async (username, password) => {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: KC_CLIENT, grant_type: 'password', username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      // If MFA is required, Keycloak returns error — redirect to PKCE flow
      if (err.error === 'invalid_grant' || err.error_description?.includes('action')) {
        await loginWithMFA()
        return null
      }
      throw new Error(err.error_description || 'Invalid credentials')
    }
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const u = extractUser(data.access_token)
    setUser(u)
    return u
  }, [extractUser])

  // PKCE Authorization Code flow (handles MFA/OTP via Keycloak UI)
  const loginWithMFA = useCallback(async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem('pkce_verifier', verifier)
    const params = new URLSearchParams({
      client_id: KC_CLIENT,
      response_type: 'code',
      scope: 'openid',
      redirect_uri: REDIRECT_URI,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    window.location.href = `${AUTH_URL}?${params}`
  }, [])

  // Exchange authorization code for tokens (called from callback route)
  const handleCallback = useCallback(async (code) => {
    const verifier = sessionStorage.getItem('pkce_verifier')
    sessionStorage.removeItem('pkce_verifier')
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: KC_CLIENT,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier || '',
      }),
    })
    if (!res.ok) throw new Error('Token exchange failed')
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const u = extractUser(data.access_token)
    setUser(u)
    return u
  }, [extractUser])

  const refresh = useCallback(async () => {
    const rt = localStorage.getItem('refresh_token')
    if (!rt) return false
    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: KC_CLIENT, grant_type: 'refresh_token', refresh_token: rt }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      setUser(extractUser(data.access_token))
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

  // Sync currency from backend after user is set
  const syncCurrency = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const json = await res.json()
        const c = json?.data?.currency || json?.currency
        if (c) localStorage.setItem('currency', c)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (user) syncCurrency()
  }, [user, syncCurrency])

  return (
    <AuthContext.Provider value={{ user, login, loginWithMFA, handleCallback, logout, refresh, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
