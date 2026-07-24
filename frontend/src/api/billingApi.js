import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  const tenantId = localStorage.getItem('admin_tenant_id')
  if (token) config.headers['X-Admin-Token'] = token
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const getPricingPlans = () => api.get('/tenants/pricing')
export const createSubscription = (data) => api.post('/billing/create-subscription', data)
