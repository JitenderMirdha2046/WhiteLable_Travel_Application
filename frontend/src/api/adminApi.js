import axios from 'axios'

const api = axios.create({
  baseURL: '/api/tenants',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('admin_tenant_id')
  const token = localStorage.getItem('admin_token')
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId
  if (token) config.headers['X-Admin-Token'] = token
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_tenant_id')
      window.location.href = '/admin'
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const registerTenant = (data) => api.post('/register', data)
export const loginTenant = (data) => api.post('/login', data)
export const getBranding = (subdomain) => api.get(`/branding?subdomain=${encodeURIComponent(subdomain)}`)
export const updateBranding = (data) => api.put('/branding', data)
export const getBrandingByTenantId = (tenantId) => api.get('/branding', { headers: { 'X-Tenant-Id': tenantId } })
export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Admin Destinations CRUD
export const getAdminDestinations = () => api.get('/destinations/admin')
export const createAdminDestination = (data) => api.post('/destinations', data)
export const updateAdminDestination = (id, data) => api.put(`/destinations/${id}`, data)
export const deleteAdminDestination = (id) => api.delete(`/destinations/${id}`)

// Admin Places CRUD (nested under destinations)
export const getAdminPlaces = (destId) => api.get(`/destinations/${destId}/places/admin`)
export const createAdminPlace = (destId, data) => api.post(`/destinations/${destId}/places`, data)
export const updateAdminPlace = (destId, id, data) => api.put(`/destinations/${destId}/places/${id}`, data)
export const deleteAdminPlace = (destId, id) => api.delete(`/destinations/${destId}/places/${id}`)

// Real usage analytics for the agency dashboard
export const getAdminStats = () => api.get('/admin/stats')
