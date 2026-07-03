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
