import axios from 'axios'

const api = axios.create({
  baseURL: '/api/trips',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const tenantId = localStorage.getItem('tenant_id')
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const createTrip = (data) => api.post('/create', data)
export const getUserTrips = () => api.get('/all')
export const getTripById = (id) => api.get(`/${id}`)
export const getTripStatus = (id) => api.get(`/${id}/status`)
export const getTripBudget = (id) => api.get(`/${id}/budget`)
export const deleteTrip = (id) => api.delete(`/${id}`)
export const replanTrip = (data) => api.post('/replan', data)
export const compareTrips = (destination) => api.post('/compare', { destination })
export const getCacheStats = () => api.get('/cache-stats')
export const getPopularDestinations = () => api.get('/analytics/destinations')
export const getAdminAnalytics = () => api.get('/analytics')
export const searchTrips = (keyword) => api.get(`/search?keyword=${encodeURIComponent(keyword)}`)

// Public destinations (tenant-active)
export const getDestinations = () => {
  const tenantId = localStorage.getItem('tenant_id')
  return axios.get('/api/tenants/destinations', {
    headers: tenantId ? { 'X-Tenant-Id': tenantId } : {},
  })
}
