import { DEMO_MODE, DEMO_JWT_TOKEN } from '../demo/config'

const demoCreds = {
  'demo@travelplanner.com': { password: 'demo123', name: 'Demo Traveler' },
  'admin@travelplanner.com': { password: 'admin123', name: 'Admin User' },
}

class AuthService {
  async login({ email, password }) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 600))
      const user = demoCreds[email]
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password')
      }
      localStorage.setItem('token', DEMO_JWT_TOKEN)
      return { token: DEMO_JWT_TOKEN }
    }
    const { loginUser } = await import('../api/authApi')
    const res = await loginUser({ email, password })
    const data = res.data
    if (data.token) {
      localStorage.setItem('token', data.token)
      const payload = JSON.parse(atob(data.token.split('.')[1]))
      if (payload.tenantId) localStorage.setItem('tenant_id', payload.tenantId)
    }
    return data
  }

  async register(data) {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 600))
      return { message: 'User Registered' }
    }
    const { registerUser } = await import('../api/authApi')
    const res = await registerUser(data)
    const data2 = res.data
    if (data2.token) {
      localStorage.setItem('token', data2.token)
      const payload = JSON.parse(atob(data2.token.split('.')[1]))
      if (payload.tenantId) localStorage.setItem('tenant_id', payload.tenantId)
    }
    return data2
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('tenant_id')
  }

  getToken() {
    return localStorage.getItem('token')
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

export default new AuthService()
