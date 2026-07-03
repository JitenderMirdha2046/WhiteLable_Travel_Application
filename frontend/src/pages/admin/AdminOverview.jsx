import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiMap, FiTrendingUp, FiDollarSign, FiGlobe, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi'

const stats = [
  { label: 'Total Users', value: '156', icon: FiUsers, change: '+12%', color: 'from-blue-500 to-blue-600' },
  { label: 'Total Trips', value: '423', icon: FiMap, change: '+8%', color: 'from-emerald-500 to-emerald-600' },
  { label: 'AI Generations', value: '1,247', icon: FiTrendingUp, change: '+23%', color: 'from-purple-500 to-purple-600' },
  { label: 'Revenue', value: '$3,450', icon: FiDollarSign, change: '+15%', color: 'from-amber-500 to-amber-600' },
]

const recentTrips = [
  { destination: 'Goa', user: 'Rahul S.', date: '2 hours ago', status: 'Completed' },
  { destination: 'Manali', user: 'Priya M.', date: '5 hours ago', status: 'Generating' },
  { destination: 'Jaipur', user: 'Amit K.', date: '1 day ago', status: 'Completed' },
  { destination: 'Kerala', user: 'Neha G.', date: '2 days ago', status: 'Completed' },
  { destination: 'Ladakh', user: 'Vikram P.', date: '3 days ago', status: 'Failed' },
]

export default function AdminOverview() {
  const [copied, setCopied] = useState(false)
  const subdomain = localStorage.getItem('admin_tenant_subdomain') || ''
  const tenantName = localStorage.getItem('admin_tenant_name') || 'Agency'
  const portalUrl = subdomain
    ? `${window.location.protocol}//${subdomain}.${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
    : window.location.origin + '/?tenant=' + tenantName.toLowerCase().replace(/\s+/g, '')

  const copyUrl = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        className="card p-5 border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-accent-500/5"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-emerald-400">{stat.change}</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Popular Destinations</h2>
          <div className="space-y-3">
            {['Goa', 'Manali', 'Jaipur', 'Kerala', 'Ladakh'].map((dest, i) => (
              <div key={dest} className="flex items-center justify-between">
                <span className="text-sm">{dest}</span>
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <div className="h-2 bg-surface-border rounded-full flex-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-400">{12 + i * 8} trips</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Recent Trips</h2>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.destination + trip.user} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{trip.destination}</p>
                  <p className="text-xs text-gray-500">{trip.user} · {trip.date}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  trip.status === 'Generating' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
