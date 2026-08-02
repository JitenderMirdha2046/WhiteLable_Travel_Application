import { motion } from 'framer-motion'
import { FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'
import RupeeIcon from './ui/RupeeIcon'

export default function TripCard({ trip, onClick, onDelete }) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="card card-hover group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
          <FiMapPin className="w-6 h-6 text-primary-400" />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(trip.id) }}
          className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <h3 className="text-lg font-semibold text-white mb-3">{trip.destination}</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <RupeeIcon className="w-4 h-4 text-accent-400" />
          <span>₹{trip.budget?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiCalendar className="w-4 h-4 text-primary-400" />
          <span>{trip.days} {trip.days === 1 ? 'day' : 'days'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiTag className="w-4 h-4 text-emerald-400" />
          <span>{trip.travelType}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-border">
        <p className="text-xs text-gray-500">Created {formatDate(trip.createdAt)}</p>
      </div>
    </motion.div>
  )
}
