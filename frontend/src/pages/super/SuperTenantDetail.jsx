import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiShield, FiGlobe, FiMail, FiCalendar, FiMap, FiEdit3 } from 'react-icons/fi'
import { getTenantDetail, updateTenantStatus, updateTenantPlan, deleteTenant } from '../../api/superAdminApi'

export default function SuperTenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchTenant()
  }, [id])

  const fetchTenant = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getTenantDetail(id)
      setTenant(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      const res = await updateTenantStatus(id, status)
      setTenant(res.data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePlanChange = async (planType) => {
    try {
      const res = await updateTenantPlan(id, planType)
      setTenant(res.data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTenant(id)
      navigate('/super-admin/tenants')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !tenant) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {error}
        <div className="mt-3">
          <Link to="/super-admin/tenants" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
            <FiArrowLeft className="w-4 h-4" /> Back to tenants
          </Link>
        </div>
      </div>
    )
  }

  if (!tenant) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/super-admin/tenants" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Tenants
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-surface-lighter border border-surface-border-light text-primary-400 flex items-center justify-center">
            <FiShield className="w-7 h-7 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <p className="text-gray-400 mt-0.5">{tenant.subdomain}{tenant.domain ? ` · ${tenant.domain}` : ''}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FiEdit3 className="w-4 h-4 text-primary-400" />
            Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Admin Email</p>
              <p className="text-sm flex items-center gap-2"><FiMail className="w-3.5 h-3.5 text-gray-400" /> {tenant.adminEmail || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Subdomain</p>
              <p className="text-sm flex items-center gap-2"><FiGlobe className="w-3.5 h-3.5 text-gray-400" /> {tenant.subdomain || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Domain</p>
              <p className="text-sm">{tenant.domain || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm flex items-center gap-2"><FiCalendar className="w-3.5 h-3.5 text-gray-400" /> {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Trips</p>
              <p className="text-sm flex items-center gap-2"><FiMap className="w-3.5 h-3.5 text-gray-400" /> {tenant.tripCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Branding Preview</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Primary Color</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md border border-surface-border" style={{ backgroundColor: tenant.primaryColor }} />
                <span className="text-sm">{tenant.primaryColor}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Accent Color</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md border border-surface-border" style={{ backgroundColor: tenant.accentColor }} />
                <span className="text-sm">{tenant.accentColor}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tagline</p>
              <p className="text-sm">{tenant.tagline || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Status</h2>
          <div className="flex gap-2">
            {['active', 'trial', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tenant.status === s
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-border/30 text-gray-400 border border-transparent hover:border-surface-border hover:text-white'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Plan</h2>
          <div className="grid grid-cols-2 gap-2">
            {['starter', 'growth', 'enterprise', 'trial'].map((p) => (
              <button
                key={p}
                onClick={() => handlePlanChange(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tenant.planType === p
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-border/30 text-gray-400 border border-transparent hover:border-surface-border hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 border-red-500/20">
        <h2 className="font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Deleting a tenant removes all their data permanently.</p>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-400">Are you sure?</p>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
              Yes, Delete
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-surface-border/30 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
            Delete This Tenant
          </button>
        )}
      </div>
    </div>
  )
}
