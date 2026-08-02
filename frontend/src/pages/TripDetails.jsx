import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FiMapPin, FiCalendar, FiTag, FiDownload, FiShare2, FiArrowLeft, FiTrash2, FiCheck, FiSmile, FiSun, FiRefreshCw, FiBarChart2 } from 'react-icons/fi'
import RupeeIcon from '../components/ui/RupeeIcon'
import toast from 'react-hot-toast'
import tripService from '../services/tripService'
import LoadingSpinner from '../components/LoadingSpinner'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ErrorState } from '../components/ui/error-state'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import LeafletMapWrapper from '../components/LeafletMapWrapper'
import { useTenant } from '../context/TenantProvider'
import { downloadTripPDF } from '../utils/generatePDF'

export default function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tenant = useTenant()
  const [trip, setTrip] = useState(null)
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replanning, setReplanning] = useState(false)
  const [replanInstruction, setReplanInstruction] = useState('')
  const [showReplanInput, setShowReplanInput] = useState(false)
  const [polling, setPolling] = useState(false)

  const loadTrip = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tripService.getById(id)
      setTrip(data)
      if (data.budgetBreakdown) setBudget(data.budgetBreakdown)
      return data
    } catch (err) {
      setError(err.message || 'Failed to load trip')
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    loadTrip().then(data => {
      if (data && (data.tripStatus === 'GENERATING' || data.tripStatus === 'PENDING')) {
        setPolling(true)
      }
    })
  }, [id])

  useEffect(() => {
    if (!polling || !id) return
    const interval = setInterval(async () => {
      try {
        const status = await tripService.getStatus(id)
        if (status.tripStatus === 'COMPLETED') {
          clearInterval(interval)
          setPolling(false)
          await loadTrip()
          toast.success('Itinerary generated!')
        } else if (status.tripStatus === 'FAILED') {
          clearInterval(interval)
          setPolling(false)
          toast.error('Generation failed. Try again.')
          setTrip(prev => prev ? { ...prev, tripStatus: 'FAILED' } : prev)
        }
      } catch {
        clearInterval(interval)
        setPolling(false)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [polling, id, loadTrip])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tripService.remove(id)
      toast.success('Trip deleted successfully')
      navigate('/trips', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Failed to delete trip')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${trip?.destination} Trip`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      toast.error('Failed to share')
    }
  }

  const handleDownloadPDF = async () => {
    if (!trip) return
    try {
      toast.loading('Generating PDF...')
      await downloadTripPDF(trip, tenant?.branding)
      toast.dismiss()
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.dismiss()
      toast.error('Failed to generate PDF')
      console.error(err)
    }
  }

  const handleReplan = async () => {
    if (!replanInstruction.trim()) {
      toast.error('Please describe what to change')
      return
    }
    setReplanning(true)
    try {
      await tripService.replan({ tripId: id, instruction: replanInstruction })
      toast.success('Re-plan started!')
      setShowReplanInput(false)
      setReplanInstruction('')
      setTrip(prev => prev ? { ...prev, tripStatus: 'GENERATING' } : prev)
      setPolling(true)
    } catch (err) {
      toast.error(err.message || 'Failed to re-plan')
    } finally {
      setReplanning(false)
    }
  }

  const handleLoadBudget = async () => {
    try {
      const b = await tripService.getBudget(id)
      setBudget(b)
    } catch {}
  }

  const loadBudget = async () => {
    if (trip?.tripStatus === 'COMPLETED' && !budget) {
      await handleLoadBudget()
    }
  }

  useEffect(() => {
    if (trip?.tripStatus === 'COMPLETED') loadBudget()
  }, [trip?.tripStatus])

  if (loading) return <LoadingSpinner text="Loading trip details..." />
  if (error) return (
    <div className="max-w-4xl mx-auto">
      <ErrorState title="Failed to load trip" message={error} onRetry={loadTrip} />
    </div>
  )
  if (!trip) return null

  const isGenerating = trip.tripStatus === 'GENERATING' || trip.tripStatus === 'PENDING'
  const isFailed = trip.tripStatus === 'FAILED'
  const isCompleted = trip.tripStatus === 'COMPLETED'

  const itinerary = trip.itinerary || ''

  const days = itinerary.split(/\n\s*\n/).filter(block => block.trim().match(/^Day \d+:/im))
  const totalBudget = budget
    ? (budget.hotelCost || 0) + (budget.foodCost || 0) + (budget.transportCost || 0) + (budget.activityCost || 0) + (budget.miscCost || 0)
    : (trip.totalEstimatedCost || 0)

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 mb-6 group">
          <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> Back
        </button>

        {/* Hero Card */}
        <div className="relative overflow-hidden mb-8 rounded-xl">
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="relative card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-2xl flex items-center justify-center">
                  <FiMapPin className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{trip.destination}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-400">AI-Generated Itinerary</p>
                    <Badge variant={isGenerating ? 'warning' : isFailed ? 'danger' : 'success'}>
                      {isGenerating ? 'Generating...' : isFailed ? 'Failed' : 'Ready'}
                    </Badge>
                    {trip.cacheUsed && (
                      <Badge variant="accent">Cached</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiShare2 className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Share'}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
                  <FiDownload className="w-4 h-4" /> Download
                </Button>
                <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-lighter rounded-xl">
                <RupeeIcon className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-xs text-gray-500">Budget</p>
                <p className="text-sm font-semibold text-white">₹{trip.budget?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-surface-lighter rounded-xl">
                <FiCalendar className="w-5 h-5 text-primary-400 mb-2" />
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-white">{trip.days} {trip.days === 1 ? 'day' : 'days'}</p>
              </div>
              <div className="p-4 bg-surface-lighter rounded-xl">
                <FiTag className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-semibold text-white">{trip.travelType}</p>
              </div>
              <div className="p-4 bg-surface-lighter rounded-xl">
                <FiMapPin className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-white">{trip.tripStatus || 'Generated'}</p>
              </div>
            </div>

            {trip.createdAt && (
              <p className="mt-4 text-xs text-gray-500">
                Created on {new Date(trip.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Generating / Failed State */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-10 mb-8"
          >
            <FiRefreshCw className="w-10 h-10 text-primary-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Generating Your Itinerary</h2>
            <p className="text-gray-400">AI is crafting your personalized travel plan. This may take a moment...</p>
            {polling && (
              <p className="text-xs text-gray-500 mt-4">Auto-refreshing...</p>
            )}
          </motion.div>
        )}

        {isFailed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-10 mb-8 border-red-500/30"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Generation Failed</h2>
            <p className="text-gray-400 mb-4">Something went wrong while generating your itinerary.</p>
            <Button onClick={() => { setTrip(prev => prev ? { ...prev, tripStatus: 'GENERATING' } : prev); setPolling(true) }}>
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Selected Places */}
        {trip.selectedPlaces && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-medium text-white">Selected Attractions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.selectedPlaces.split(',').map((place, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                  {place.trim()}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mood Description */}
        {trip.moodDescription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiSmile className="w-4 h-4 text-accent-400" />
              <h3 className="text-sm font-medium text-white">Mood</h3>
            </div>
            <p className="text-gray-400 text-sm">{trip.moodDescription}</p>
          </motion.div>
        )}

        {/* Weather Summary */}
        {trip.weatherSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiSun className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">Weather Forecast</h3>
            </div>
            <p className="text-gray-400 text-sm">{trip.weatherSummary}</p>
          </motion.div>
        )}

        {/* Budget Chart */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <FiBarChart2 className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-semibold text-white">Budget Breakdown</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Hotel', value: budget.hotelCost },
                      { name: 'Food', value: budget.foodCost },
                      { name: 'Transport', value: budget.transportCost },
                      { name: 'Activities', value: budget.activityCost },
                      { name: 'Misc', value: budget.miscCost },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '13px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center md:text-left min-w-[140px]">
                <p className="text-sm text-gray-400">Total Estimated</p>
                <p className="text-2xl font-bold text-white">₹{Number(totalBudget).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map View */}
        {isCompleted && <LeafletMapWrapper destination={trip.destination} />}

        {/* Itinerary Timeline */}
        {isCompleted && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Itinerary</h2>
              <Badge variant="accent">{days.length} {days.length === 1 ? 'day' : 'days'}</Badge>
            </div>

            {!itinerary ? (
              <div className="card text-center py-10">
                <h3 className="text-lg font-semibold text-white mb-2">No Itinerary Available</h3>
                <p className="text-gray-400">The itinerary content is empty. Try re-planning or check back later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {days.map((day, i) => {
                  const [header, ...rest] = day.split('\n')
                  const dayNumMatch = header.match(/Day\s*(\d+):\s*(.*)/i)
                  if (!dayNumMatch) return null
                  const dayNum = dayNumMatch[1]
                  const dayTitle = dayNumMatch[2]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="card relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-4 pl-2">
                        <div className="w-12 h-12 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiMapPin className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">Day {dayNum}</h3>
                            <span className="text-xs text-gray-500">— {dayTitle}</span>
                          </div>
                          {rest.length > 0 && (
                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{rest.join('\n').trim()}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-8 pb-8">
          {isCompleted && (
            <Button onClick={handleDownloadPDF} icon={<FiDownload />}>
              Download Itinerary
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/create-trip')} icon={<FiMapPin />}>
            Plan Another Trip
          </Button>
          {!showReplanInput ? (
            <Button variant="secondary" onClick={() => setShowReplanInput(true)} icon={<FiRefreshCw />}>
              Re-Plan
            </Button>
          ) : (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="e.g. Make it more budget-friendly..."
                value={replanInstruction}
                onChange={(e) => setReplanInstruction(e.target.value)}
                className="input-field flex-1 min-w-[200px]"
                onKeyDown={(e) => e.key === 'Enter' && handleReplan()}
              />
              <Button onClick={handleReplan} loading={replanning} size="sm">
                Go
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setShowReplanInput(false); setReplanInstruction('') }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Trip?"
        message={`Are you sure you want to delete the ${trip.destination} trip? This action cannot be undone.`}
        confirmText="Delete Trip"
        loading={deleting}
      />
    </div>
  )
}

