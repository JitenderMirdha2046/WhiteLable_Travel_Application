import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiCompass, FiTrendingUp, FiArrowRight, FiPlus, FiBarChart2, FiGlobe, FiZap, FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantProvider'
import tripService from '../services/tripService'
import TripCard from '../components/TripCard'
import AgencyMap from '../components/AgencyMap'
import { StatsSkeleton, CardSkeleton } from '../components/ui/skeleton'
import { ErrorState } from '../components/ui/error-state'
import { EmptyState } from '../components/ui/empty-state'


export default function Dashboard() {
  const { user } = useAuth()
  const tenant = useTenant()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cacheStats, setCacheStats] = useState(null)
  const [popularDest, setPopularDest] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const loadTrips = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tripService.getAll()
      setTrips(data)
    } catch (err) {
      setError(err.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const [stats, destinations] = await Promise.all([
        tripService.getCacheStats(),
        tripService.getPopularDestinations(),
      ])
      setCacheStats(stats)
      setPopularDest(destinations)
    } catch {}
  }

  useEffect(() => {
    loadTrips()
    loadAnalytics()
  }, [])

  const handleSearch = (value) => {
    setSearchKeyword(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await tripService.search(value.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  const stats = [
    {
      icon: FiMapPin,
      label: 'Total Trips',
      value: trips.length,
      color: 'from-primary-500/20 to-primary-500/5',
      iconColor: 'text-primary-400',
    },
    {
      icon: FiCompass,
      label: 'AI Plans Generated',
      value: trips.filter(t => t.itinerary).length,
      color: 'from-accent-500/20 to-accent-500/5',
      iconColor: 'text-accent-400',
    },
    {
      icon: FiTrendingUp,
      label: 'This Month',
      value: trips.filter(t => {
        const d = new Date(t.createdAt)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
    },
    {
      icon: FiGlobe,
      label: 'Popular',
      value: popularDest[0]?.destination || 'N/A',
      color: 'from-purple-500/20 to-purple-500/5',
      iconColor: 'text-purple-400',
    },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="gradient-text">{user?.name || 'Traveler'}</span>
        </h1>
        <p className="text-gray-400 mb-4">Here's your travel overview.</p>
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search trips by keyword (e.g. mountain, beach, adventure)..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-lighter border border-surface-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-surface-lighter border border-surface-border-light flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <motion.span
                  key={stat.value}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-white"
                >
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </motion.span>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cache Stats & Popular Destinations */}
      {cacheStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-medium text-white">Cache Performance</h3>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">{cacheStats.cachedTrips} cached trips</span>
              <span className="text-emerald-400">{cacheStats.cacheHits || 0} hits</span>
              <span className="text-orange-400">{cacheStats.cacheMisses || 0} misses</span>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FiBarChart2 className="w-4 h-4 text-accent-400" />
              <h3 className="text-sm font-medium text-white">Popular Destinations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularDest.slice(0, 5).map((d) => (
                <span key={d.destination} className="px-2 py-1 text-xs rounded-full bg-surface-lighter text-gray-300 border border-surface-border-light">
                  {d.destination} ({d.count})
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Recommendations */}
      <AnimatePresence>
        {searchKeyword.trim() && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Recommendations for "<span className="text-primary-400">{searchKeyword}</span>"
              </h2>
              {!searching && searchResults.length > 0 && (
                <span className="text-sm text-gray-500">{searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}</span>
              )}
            </div>
            {searching ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </div>
            ) : searchResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center py-10"
              >
                <FiSearch className="w-8 h-8 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400 text-sm">No trips match your search. Try a different keyword.</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <TripCard trip={trip} />
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agency Location */}
      <div className="mb-10">
        <AgencyMap
          agency={{
            name: tenant.branding?.agencyName || 'Our Agency',
            latitude: tenant.branding?.latitude,
            longitude: tenant.branding?.longitude,
            phone: tenant.branding?.phone,
            address: tenant.branding?.address,
          }}
        />
      </div>

      {/* Recent Trips */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Trips</h2>
        {trips.length > 0 && (
          <Link to="/trips" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load trips"
          message={error}
          onRetry={loadTrips}
        />
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Create your first AI-powered trip plan and start exploring!"
          action={
            <Link to="/create-trip" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" /> Create Your First Trip
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.slice(0, 6).map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
