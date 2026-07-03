import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMapPin, FiDollarSign, FiStar, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import toast from 'react-hot-toast'
import tripService from '../services/tripService'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import LoadingSpinner from '../components/LoadingSpinner'

const planColors = {
  BUDGET: { bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', icon: FiDollarSign, label: 'Budget-Friendly' },
  LUXURY: { bg: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', icon: FiStar, label: 'Luxury' },
  ADVENTURE: { bg: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30', icon: FiZap, label: 'Adventure' },
}

export default function TripComparison() {
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [comparison, setComparison] = useState(null)
  const [expandedPlan, setExpandedPlan] = useState(null)

  const handleCompare = async () => {
    if (!destination.trim()) {
      toast.error('Please enter a destination')
      return
    }
    setLoading(true)
    try {
      const data = await tripService.compare(destination.trim())
      setComparison(data)
    } catch (err) {
      toast.error(err.message || 'Failed to compare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Compare Trip Plans</h1>
        <p className="text-gray-400">See different itineraries for the same destination — budget, luxury, and adventure.</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">Destination</label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter a destination to compare..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              className="input-field pl-11"
            />
          </div>
          <Button onClick={handleCompare} loading={loading} icon={<FiSearch />}>
            Compare
          </Button>
        </div>
      </motion.div>

      {/* Results */}
      {loading && <LoadingSpinner text="Generating comparisons..." />}

      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Plans for <span className="gradient-text">{comparison.destination}</span>
            </h2>

            {comparison.plans?.map((plan, i) => {
              const config = planColors[plan.type] || planColors.BUDGET
              const isExpanded = expandedPlan === i

              return (
                <motion.div
                  key={plan.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card border ${config.border} relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} pointer-events-none`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-lighter flex items-center justify-center">
                          <config.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                          <Badge variant="accent">{plan.type}</Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedPlan(isExpanded ? null : i)}
                        className="p-1 hover:bg-surface-lighter rounded-lg transition-colors"
                      >
                        {isExpanded ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {plan.itinerary}
                    </p>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-surface-border-light"
                      >
                        <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{plan.itinerary}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!comparison && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FiSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Enter a destination to see different travel plans side by side.</p>
        </motion.div>
      )}
    </div>
  )
}
