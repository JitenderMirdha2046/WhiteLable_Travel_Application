import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({ id: null, subdomain: null, branding: null, loading: true })

  const refreshBranding = async (tenantId) => {
    try {
      const { getBrandingByTenantId } = await import('../api/adminApi')
      const res = await getBrandingByTenantId(tenantId)
      setTenant((prev) => ({ ...prev, branding: res.data }))
    } catch {}
  }

  useEffect(() => {
    const handleBrandingUpdate = (e) => {
      const detail = e.detail
      if (detail?.tenantId || tenant.id) {
        refreshBranding(detail?.tenantId || tenant.id)
      }
    }
    window.addEventListener('branding-updated', handleBrandingUpdate)
    return () => window.removeEventListener('branding-updated', handleBrandingUpdate)
  }, [tenant.id])

  useEffect(() => {
    const detectTenant = async () => {
      const params = new URLSearchParams(window.location.search)
      let subdomain = params.get('tenant')

      const host = window.location.hostname
      if (!subdomain && host !== 'localhost' && host !== '127.0.0.1') {
        const parts = host.split('.')
        if (parts.length >= 2) subdomain = parts[0]
      }

      if (subdomain) {
        try {
          const { getBranding } = await import('../api/adminApi')
          const res = await getBranding(subdomain)
          setTenant({ id: res.data.tenantId, subdomain, branding: res.data, loading: false })
          localStorage.setItem('tenant_id', res.data.tenantId)
          return
        } catch {
          setTenant({ id: null, subdomain, branding: null, loading: false })
          return
        }
      }

      const token = localStorage.getItem('token')
      const isAuthenticated = !!token
      if (isAuthenticated) {
        const tenantId = localStorage.getItem('tenant_id')
        if (tenantId) {
          try {
            const { getBrandingByTenantId } = await import('../api/adminApi')
            const res = await getBrandingByTenantId(tenantId)
            setTenant({ id: tenantId, subdomain: null, branding: res.data, loading: false })
            return
          } catch {
            setTenant({ id: tenantId, subdomain: null, branding: null, loading: false })
            return
          }
        }
      }

      setTenant({ id: null, subdomain: null, branding: null, loading: false })
    }

    detectTenant()
  }, [])

  const value = useMemo(() => tenant, [tenant.loading, tenant.id, tenant.subdomain, JSON.stringify(tenant.branding)])

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
