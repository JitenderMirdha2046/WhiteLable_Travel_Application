import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiMap, FiTrendingUp, FiGlobe, FiCopy, FiCheck, FiExternalLink, FiMapPin } from 'react-icons/fi'
import RupeeIcon from '../../components/ui/RupeeIcon'
import toast from 'react-hot-toast'
import adminService from '../../services/adminService'

function formatNumber(n) {
  if (n == null || isNaN(n)) return '0'
  return Number(n).toLocaleString('en-IN')
}

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN')
}

function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso)
  const diff = Math.max(0, (Date.now() - then.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${diff >= 7200 ? 's' : ''} ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${diff >= 172800 ? 's' : ''} ago`
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(status) {
  const s = (status || '').toUpperCase()
  if (s === 'COMPLETED') return 'Completed'
  if (s === 'GENERATING') return 'Generating'
  if (s === 'PENDING') return 'Pending'
  if (s === 'FAILED') return 'Failed'
  return s || 'Unknown'
}

function statusClass(status) {
  const s = (status || '').toUpperCase()
  if (s === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-400'
  if (s === 'GENERATING') return 'bg-amber-500/10 text-amber-400'
  if (s === 'FAILED') return 'bg-red-500/10 text-red-400'
  return 'bg-gray-500/10 text-gray-400'
}

export default function AdminOverview() {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalTrips: 0, aiGenerations: 0, totalRevenue: 0, popularDestinations: [], recentTrips: [] })

  const subdomain = localStorage.getItem('admin_tenant_subdomain') || ''
  const tenantName = localStorage.getItem('admin_tenant_name') || 'Agency'
  const portalUrl = subdomain
    ? `${window.location.protocol}//${subdomain}.${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
    : window.location.origin + '/?tenant=' + tenantName.toLowerCase().replace(/\s+/g, '')

  useEffect(() => {
    Promise.all([adminService.getUsers(), adminService.getStats()])
      .then(([userList, statsData]) => {
        setUsers(userList)
        setStats({
          totalTrips: statsData.totalTrips || 0,
          aiGenerations: statsData.aiGenerations || 0,
          totalRevenue: statsData.totalRevenue || 0,
          popularDestinations: statsData.popularDestinations || [],
          recentTrips: statsData.recentTrips || [],
        })
      })
      .catch((err) => {
        console.warn('Failed to load dashboard data:', err)
        toast.error('Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [])

  const userNameById = (id) => {
    const user = users.find((u) => u.id === id)
    return user ? user.name : 'A traveler'
  }

  const statCards = [
    { label: 'Total Users', value: formatNumber(users.length), icon: FiUsers, iconColor: 'text-blue-400' },
    { label: 'Total Trips', value: formatNumber(stats.totalTrips), icon: FiMap, iconColor: 'text-emerald-400' },
    { label: 'AI Itineraries', value: formatNumber(stats.aiGenerations), icon: FiTrendingUp, iconColor: 'text-purple-400' },
    { label: 'Trip Value', value: formatCurrency(stats.totalRevenue), icon: RupeeIcon, iconColor: 'text-amber-400' },
  ]

  const copyUrl = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maxPopularCount = Math.max(1, ...stats.popularDestinations.map((d) => Number(d.count) || 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back, {tenantName}</p>
      </div>

      {/* Portal URLs Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 border-primary-500/20"
      >
        <h2 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <FiGlobe className="w-4 h-4 text-primary-400" />
          Your Agency URLs
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              🔗 <span className="text-gray-400 font-medium">Customer Portal</span> — share this with your travelers
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-primary-300 bg-surface/50 rounded-lg px-3 py-2 border border-surface-border truncate">
                {portalUrl}
              </code>
              <button
                onClick={copyUrl}
                className="btn-ghost p-2 shrink-0 text-gray-400 hover:text-primary-400"
                title="Copy URL"
              >
                {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
              </button>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost p-2 shrink-0 text-gray-400 hover:text-primary-400"
                title="Open customer portal"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              🔐 <span className="text-gray-400 font-medium">Admin Panel</span> — manage your agency here
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-gray-400 bg-surface/50 rounded-lg px-3 py-2 border border-surface-border truncate">
                {window.location.origin}/admin
              </code>
              <a
                href="/admin/overview"
                className="btn-ghost p-2 shrink-0 text-gray-400 hover:text-primary-400"
                title="Open admin panel"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-surface-border/30 rounded w-1/3 mb-3" />
              <div className="h-7 bg-surface-border/30 rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-border/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-surface-lighter border border-surface-border-light flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-semibold mb-4">Popular Destinations</h2>
              {stats.popularDestinations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No trips planned yet. Share your customer portal link to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.popularDestinations.map((d) => (
                    <div key={d.destination} className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1.5">
                        <FiMapPin className="w-3.5 h-3.5 text-primary-400" />
                        {d.destination}
                      </span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="h-2 bg-surface-border rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.max(6, (Number(d.count) / maxPopularCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{Number(d.count)} trip{d.count === 1 ? '' : 's'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="font-semibold mb-4">Recent Trips</h2>
              {stats.recentTrips.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No trips yet. They'll appear here once your travelers start planning.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-medium">{trip.destination}</p>
                        <p className="text-xs text-gray-500">
                          {userNameById(trip.userId)} · {timeAgo(trip.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formatCurrency(trip.budget)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusClass(trip.tripStatus)}`}>
                          {statusLabel(trip.tripStatus)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
