import axios from 'axios'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const tenantId = localStorage.getItem('tenant_id')
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId
  return config
})

export const getProfile = () => api.get('/api/user/profile')

export const updateProfile = (data) => api.put('/api/user/profile', data)

export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
