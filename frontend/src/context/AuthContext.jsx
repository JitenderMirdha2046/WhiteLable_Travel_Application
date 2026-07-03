import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authService.getToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        })
      } catch {
        authService.logout()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    const payload = JSON.parse(atob(data.token.split('.')[1]))
    setUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    })
    return data
  }, [])

  const register = useCallback(async (data) => {
    return await authService.register(data)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
