import axios from 'axios'

const api = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('tenant_id')
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

export const registerUser = (data) => api.post('/register', data)
export const loginUser = (data) => api.post('/login', data)
