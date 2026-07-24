import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import { getProfile } from '../api/userApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const parseToken = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.avatarUrl || null,
      tenantId: payload.tenantId || null,
    }
  }

  useEffect(() => {
    const token = authService.getToken()
    if (token) {
      try {
        const parsed = parseToken(token)
        setUser(parsed)
        getProfile().then(res => {
          if (res.data) {
            setUser(prev => prev ? { ...prev, avatarUrl: res.data.avatarUrl || null } : prev)
          }
        }).catch(() => {})
      } catch {
        authService.logout()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    setUser(parseToken(data.token))
    return data
  }, [])

  const register = useCallback(async (data) => {
    return await authService.register(data)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
