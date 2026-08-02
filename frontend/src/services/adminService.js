import { DEMO_MODE } from '../demo/config'

class AdminService {
  async login({ email, password }) {
    const { loginTenant } = await import('../api/adminApi')
    const res = await loginTenant({ email, password })
    const data = res.data
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_tenant_id', data.tenantId)
    localStorage.setItem('admin_tenant_name', data.agencyName)
    localStorage.setItem('admin_tenant_subdomain', data.subdomain)
    return data
  }

  async register(data) {
    const { registerTenant } = await import('../api/adminApi')
    const res = await registerTenant(data)
    const responseData = res.data
    localStorage.setItem('admin_token', responseData.token)
    localStorage.setItem('admin_tenant_id', responseData.tenantId)
    localStorage.setItem('admin_tenant_name', responseData.agencyName)
    localStorage.setItem('admin_tenant_subdomain', responseData.subdomain)
    return responseData
  }

  async getBranding() {
    const subdomain = localStorage.getItem('admin_tenant_subdomain')
    const { getBranding } = await import('../api/adminApi')
    const res = await getBranding(subdomain)
    return res.data
  }

  async updateBranding(data) {
    let logoUrl = data.logoUrl || data.existingLogoUrl || null

    if (data.logoFile) {
      const { uploadLogo } = await import('../api/adminApi')
      const uploadRes = await uploadLogo(data.logoFile)
      logoUrl = uploadRes.data.logoUrl
    }

    const { updateBranding } = await import('../api/adminApi')
    const res = await updateBranding({
      logoUrl,
      backgroundImage: data.backgroundImage || null,
      overlayOpacity: data.overlayOpacity ?? 70,
      overlayBlur: data.overlayBlur || 'sm',
      templateStyle: data.templateStyle || null,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      tagline: data.tagline || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      phone: data.phone || null,
      address: data.address || null,
    })
    return res.data
  }

  async getStats() {
    const { getAdminStats } = await import('../api/adminApi')
    const res = await getAdminStats()
    return res.data
  }

  logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_tenant_id')
    localStorage.removeItem('admin_tenant_name')
    localStorage.removeItem('admin_tenant_subdomain')
  }

  isAuthenticated() {
    return !!localStorage.getItem('admin_token')
  }

  getTenantId() {
    return localStorage.getItem('admin_tenant_id')
  }

  async getUsers() {
    const token = localStorage.getItem('admin_token')
    const res = await fetch('/api/user/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  }

  async deleteUser(userId) {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/user/admin/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to delete user')
  }
}

export default new AdminService()
