import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMap, FiPlus, FiGrid, FiList, FiSearch, FiSliders, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import tripService from '../services/tripService'
import TripCard from '../components/TripCard'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { ErrorState } from '../components/ui/error-state'
import { CardSkeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

export default function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('card')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadTrips = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tripService.getAll()
      setTrips(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await tripService.remove(deleteTarget)
      setTrips(trips.filter((t) => t.id !== deleteTarget))
      toast.success('Trip deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete trip')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filtered = trips
    .filter((t) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        t.destination?.toLowerCase().includes(q) ||
        t.travelType?.toLowerCase().includes(q) ||
        t.budget?.toString().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortAsc
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === 'budget') {
        return sortAsc ? (a.budget || 0) - (b.budget || 0) : (b.budget || 0) - (a.budget || 0)
      }
      if (sortBy === 'destination') {
        return sortAsc
          ? (a.destination || '').localeCompare(b.destination || '')
          : (b.destination || '').localeCompare(a.destination || '')
      }
      if (sortBy === 'days') {
        return sortAsc ? (a.days || 0) - (b.days || 0) : (b.days || 0) - (a.days || 0)
      }
      return 0
    })

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => {
        if (sortBy === field) setSortAsc(!sortAsc)
        else { setSortBy(field); setSortAsc(false) }
      }}
      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
        sortBy === field
          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
          : 'text-gray-400 hover:text-gray-200 border border-transparent hover:border-surface-border-light'
      }`}
    >
      {label}
      {sortBy === field && (
        sortAsc ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
      )}
    </button>
  )

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Trips</h1>
          <p className="text-gray-400">All your planned adventures in one place.</p>
        </div>
        <Link to="/create-trip">
          <Button icon={<FiPlus />}>New Trip</Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load trips" message={error} onRetry={loadTrips} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={FiMap}
          title="No trips planned yet"
          description="Start by creating your first AI-powered trip and explore the world!"
          action={
            <Link to="/create-trip">
              <Button icon={<FiPlus />}>Create Your First Trip</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by destination, type, budget..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-surface-lighter rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sort Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
          >
            <FiSliders className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 mr-1">Sort:</span>
            <SortButton field="date" label="Date" />
            <SortButton field="destination" label="Destination" />
            <SortButton field="budget" label="Budget" />
            <SortButton field="days" label="Duration" />
            <span className="text-xs text-gray-500 ml-auto">{filtered.length} of {trips.length} trips</span>
          </motion.div>

          {/* Trips Display */}
          {viewMode === 'card' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((trip) => (
                <Link key={trip.id} to={`/trips/${trip.id}`}>
                  <TripCard trip={trip} onDelete={(id) => setDeleteTarget(id)} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Destination</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Budget</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Duration</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filtered.map((trip) => (
                      <motion.tr
                        key={trip.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-surface-lighter/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link to={`/trips/${trip.id}`} className="flex items-center gap-2 text-white font-medium hover:text-primary-400 transition-colors">
                            <FiMap className="w-4 h-4 text-primary-400" />
                            {trip.destination}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-300">₹{trip.budget?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-300">{trip.days} days</td>
                        <td className="px-4 py-3">
                          <Badge variant="accent">{trip.travelType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm">
                          {new Date(trip.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteTarget(trip.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          >
                            <FiSliders className="w-4 h-4 rotate-45" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filtered.length === 0 && search && (
            <div className="text-center py-12">
              <p className="text-gray-400">No trips match your search.</p>
              <Button variant="ghost" onClick={() => setSearch('')} className="mt-2">
                Clear Search
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Trip?"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}
