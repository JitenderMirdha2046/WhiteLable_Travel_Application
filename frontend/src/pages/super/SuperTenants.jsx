import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiSearch, FiShield, FiMoreVertical, FiChevronDown } from 'react-icons/fi'
import { getAllTenants, updateTenantStatus, updateTenantPlan, deleteTenant } from '../../api/superAdminApi'

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-400',
  trial: 'bg-amber-500/10 text-amber-400',
  suspended: 'bg-red-500/10 text-red-400',
}

export default function SuperTenants() {
  const [tenants, setTenants] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMenu, setActionMenu] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    let result = [...tenants]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.subdomain?.toLowerCase().includes(q) || t.adminEmail?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (planFilter !== 'all') result = result.filter(t => t.planType === planFilter)
    setFiltered(result)
  }, [search, statusFilter, planFilter, tenants])

  const fetchTenants = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAllTenants()
      setTenants(res.data)
      setFiltered(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action, value) => {
    setActionMenu(null)
    try {
      if (action === 'status') await updateTenantStatus(id, value)
      else if (action === 'plan') await updateTenantPlan(id, value)
      else if (action === 'delete') await deleteTenant(id)
      fetchTenants()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Tenants</h1>
          <p className="text-gray-400 mt-1">{filtered.length} of {tenants.length} agencies</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, subdomain, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Agency</th>
                <th className="text-left py-3 px-4 font-medium">Subdomain</th>
                <th className="text-left py-3 px-4 font-medium">Plan</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Trips</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    {search ? 'No tenants match your search' : 'No tenants registered yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-border/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link to={`/super-admin/tenants/${t.id}`} className="flex items-center gap-3 hover:text-primary-400 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-surface-lighter border border-surface-border-light text-primary-400 flex items-center justify-center">
                          <FiShield className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          {t.adminEmail && <p className="text-xs text-gray-500">{t.adminEmail}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">{t.subdomain || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm capitalize">{t.planType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status] || 'bg-gray-500/10 text-gray-400'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">{t.tripCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === t.id ? null : t.id)}
                        className="btn-ghost p-1.5"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenu === t.id && (
                        <div className="absolute right-0 mt-1 w-44 glass-strong rounded-xl border border-surface-border shadow-xl z-50 py-1">
                          <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-surface-border">Status</div>
                          {['active', 'trial', 'suspended'].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleAction(t.id, 'status', s)}
                              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-border/30 transition-colors ${t.status === s ? 'text-primary-400' : 'text-gray-300'}`}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                          <div className="border-t border-surface-border mt-1 pt-1">
                            <div className="px-3 py-1.5 text-xs text-gray-500">Plan</div>
                            {['starter', 'growth', 'enterprise', 'trial'].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleAction(t.id, 'plan', p)}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-border/30 transition-colors ${t.planType === p ? 'text-primary-400' : 'text-gray-300'}`}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-surface-border mt-1 pt-1">
                            <button
                              onClick={() => handleAction(t.id, 'delete', null)}
                              className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Delete Tenant
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
