import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiMap, FiActivity, FiDollarSign, FiShield } from 'react-icons/fi'
import { getPlatformStats, getAllTenants } from '../../api/superAdminApi'
import { Link } from 'react-router-dom'

export default function SuperDashboard() {
  const [stats, setStats] = useState(null)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          getPlatformStats(),
          getAllTenants()
        ])
        setStats(statsRes.data)
        setTenants(tenantsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Tenants', value: stats?.totalTenants || 0, icon: FiShield, color: 'from-blue-500 to-blue-600', sub: `${stats?.activeTenants || 0} active` },
    { label: 'Active', value: stats?.activeTenants || 0, icon: FiActivity, color: 'from-emerald-500 to-emerald-600', sub: `${stats?.trialTenants || 0} in trial` },
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: FiMap, color: 'from-purple-500 to-purple-600', sub: 'across all tenants' },
    { label: 'Suspended', value: stats?.suspendedTenants || 0, icon: FiUsers, color: 'from-red-500 to-red-600', sub: 'need attention' },
  ]

  const recentTenants = tenants
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your TravelProject platform</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Plan Breakdown</h2>
          </div>
          {stats?.planBreakdown && (
            <div className="space-y-3">
              {Object.entries(stats.planBreakdown).map(([plan, count]) => {
                const total = Object.values(stats.planBreakdown).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? (count / total) * 100 : 0
                const colors = {
                  starter: 'from-blue-500 to-blue-600',
                  growth: 'from-purple-500 to-purple-600',
                  enterprise: 'from-amber-500 to-amber-600',
                  trial: 'from-gray-500 to-gray-600',
                }
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize">{plan}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[plan] || 'from-primary-500 to-accent-500'} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Registrations</h2>
            <Link to="/super-admin/tenants" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTenants.length === 0 ? (
              <p className="text-sm text-gray-500">No tenants registered yet</p>
            ) : (
              recentTenants.map((t) => (
                <Link
                  key={t.id}
                  to={`/super-admin/tenants/${t.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-border/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                      <FiShield className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.subdomain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      t.status === 'trial' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-500">{t.planType}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
