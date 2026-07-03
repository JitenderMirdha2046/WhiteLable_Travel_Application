import axios from 'axios'

const api = axios.create({
  baseURL: '/api/super',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('super_token')
  if (token) config.headers['X-Super-Token'] = token
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('super_token')
      localStorage.removeItem('super_admin')
      window.location.href = '/super-admin/login'
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const superLogin = (data) => api.post('/login', data)
export const getAllTenants = () => api.get('/tenants')
export const getTenantDetail = (id) => api.get(`/tenants/${id}`)
export const updateTenantStatus = (id, status) => api.put(`/tenants/${id}/status`, { status })
export const updateTenantPlan = (id, planType) => api.put(`/tenants/${id}/plan`, { planType })
export const deleteTenant = (id) => api.delete(`/tenants/${id}`)
export const getPlatformStats = () => api.get('/stats')
