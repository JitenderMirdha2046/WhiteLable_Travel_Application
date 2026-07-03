import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiDollarSign, FiCalendar, FiTag, FiArrowRight, FiCheck, FiCompass, FiLoader, FiChevronLeft, FiSmile } from 'react-icons/fi'
import toast from 'react-hot-toast'
import tripService from '../services/tripService'
import { Button } from '../components/ui/button'

const travelTypes = [
  { id: 'Adventure', icon: '🏔️', desc: 'Thrills & outdoors' },
  { id: 'Relaxation', icon: '🏖️', desc: 'Peace & unwind' },
  { id: 'Cultural', icon: '🏛️', desc: 'Heritage & history' },
  { id: 'Road Trip', icon: '🚗', desc: 'Drive & explore' },
  { id: 'Beach', icon: '🌊', desc: 'Sun & sand' },
  { id: 'Wildlife', icon: '🦁', desc: 'Nature & animals' },
  { id: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Fun for all' },
  { id: 'Solo', icon: '🧘', desc: 'Me time' },
]

export default function CreateTrip() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ destination: '', budget: '', days: '', travelType: '', moodDescription: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: '' })
  }

  const validateStep = (s) => {
    const errs = {}
    if (s === 1 && !form.destination.trim()) errs.destination = 'Destination is required'
    if (s === 2) {
      if (!form.budget) errs.budget = 'Budget is required'
      else if (isNaN(form.budget) || Number(form.budget) <= 0) errs.budget = 'Enter a valid budget'
      if (!form.days) errs.days = 'Duration is required'
      else if (isNaN(form.days) || Number(form.days) < 1) errs.days = 'At least 1 day'
      else if (Number(form.days) > 30) errs.days = 'Max 30 days'
    }
    if (s === 3 && !form.travelType) errs.travelType = 'Select a travel style'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const handleGenerate = async () => {
    if (!validateStep(3)) return
    setLoading(true)
    try {
      const data = await tripService.create({
        destination: form.destination.trim(),
        budget: parseFloat(form.budget),
        days: parseInt(form.days),
        travelType: form.travelType,
        moodDescription: form.moodDescription.trim(),
      })
      toast.success('Trip generation started! It may take a moment.')
      navigate(`/trips/${data.tripId}`)
    } catch (err) {
      toast.error(err.message || 'Failed to generate trip')
    } finally {
      setLoading(false)
    }
  }

  const stepIndicator = (num, label, isComplete) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        isComplete
          ? 'bg-primary-500 text-white'
          : step === num
            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
            : 'bg-surface-lighter text-gray-500'
      }`}>
        {isComplete ? <FiCheck className="w-4 h-4" /> : num}
      </div>
      <span className={`text-sm hidden sm:block ${step === num ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )

  const totalSteps = 3

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Plan Your Trip</h1>
        <p className="text-gray-400">Let AI create your perfect itinerary in 3 simple steps.</p>
      </motion.div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">
          {stepIndicator(1, 'Destination', step > 1)}
        </div>
        <div className="flex-1 h-px mx-4 bg-surface-border relative">
          <div className={`absolute inset-0 bg-primary-500 transition-all duration-500`}
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          {stepIndicator(2, 'Budget & Days', step > 2)}
        </div>
        <div className="flex-1 h-px mx-4 bg-surface-border relative">
          <div className={`absolute inset-0 bg-primary-500 transition-all duration-500`}
            style={{ width: `${Math.max(0, ((step - 2) / (totalSteps - 1)) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          {stepIndicator(3, 'Style & Mood', step > 3)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card">
            <div className="w-14 h-14 mb-5 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center">
              <FiMapPin className="w-7 h-7 text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Where do you want to go?</h2>
            <p className="text-gray-400 mb-6">Tell us your dream destination and we'll plan the rest.</p>
            <div>
              <input
                type="text"
                placeholder="e.g. Goa, Manali, Jaipur, Kerala..."
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                className={`input-field text-lg py-4 ${errors.destination ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                autoFocus
              />
              {errors.destination && (
                <p className="mt-2 text-sm text-red-400">{errors.destination}</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Goa', 'Manali', 'Jaipur', 'Kerala', 'Ladakh', 'Udaipur', 'Sikkim', 'Andaman'].map((d) => (
                <button
                  key={d}
                  onClick={() => { update('destination', d); setStep(2) }}
                  className="px-3 py-1.5 text-sm rounded-full bg-surface-lighter border border-surface-border-light text-gray-300 hover:border-primary-500/50 hover:text-white transition-all"
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card">
            <div className="w-14 h-14 mb-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center">
              <FiDollarSign className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Budget & Duration</h2>
            <p className="text-gray-400 mb-6">How much do you want to spend and how long will you stay?</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    placeholder="25000"
                    min="1"
                    value={form.budget}
                    onChange={(e) => update('budget', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    className={`input-field pl-11 ${errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                  />
                </div>
                {errors.budget && <p className="mt-1 text-sm text-red-400">{errors.budget}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[10000, 25000, 50000, 100000].map((b) => (
                    <button
                      key={b}
                      onClick={() => update('budget', b.toString())}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${form.budget === b.toString()
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                        : 'bg-surface-lighter border-surface-border-light text-gray-400 hover:border-primary-500/30'
                      }`}
                    >
                      ₹{(b / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    placeholder="4"
                    min="1"
                    max="30"
                    value={form.days}
                    onChange={(e) => update('days', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    className={`input-field pl-11 ${errors.days ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                  />
                </div>
                {errors.days && <p className="mt-1 text-sm text-red-400">{errors.days}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                    <button
                      key={d}
                      onClick={() => update('days', d.toString())}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${form.days === d.toString()
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                        : 'bg-surface-lighter border-surface-border-light text-gray-400 hover:border-primary-500/30'
                      }`}
                    >
                      {d} {d === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card">
            <div className="w-14 h-14 mb-5 bg-gradient-to-br from-accent-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
              <FiTag className="w-7 h-7 text-accent-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">What's your travel style?</h2>
            <p className="text-gray-400 mb-6">Choose the type of experience you're looking for.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {travelTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => update('travelType', type.id)}
                  className={`p-4 rounded-xl text-center transition-all border ${
                    form.travelType === type.id
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-surface-lighter border-surface-border-light hover:border-primary-500/30 hover:bg-surface-lighter/80'
                  }`}
                >
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className={`text-sm font-medium block ${
                    form.travelType === type.id ? 'text-primary-300' : 'text-gray-300'
                  }`}>
                    {type.id}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">{type.desc}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-surface-border-light pt-6">
              <div className="flex items-center gap-2 mb-3">
                <FiSmile className="w-5 h-5 text-accent-400" />
                <h3 className="text-lg font-medium text-white">Describe your mood (optional)</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Tell us the vibe you're looking for — AI will tailor the itinerary.</p>
              <textarea
                placeholder="e.g. Romantic getaway, family-friendly, budget backpacking, luxury relaxation..."
                value={form.moodDescription}
                onChange={(e) => update('moodDescription', e.target.value)}
                rows={3}
                className="input-field w-full resize-none"
              />
            </div>

            {errors.travelType && (
              <p className="mt-3 text-sm text-red-400">{errors.travelType}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button variant="secondary" onClick={prevStep} icon={<FiChevronLeft />}>
            Back
          </Button>
        ) : <div />}
        {step < 3 ? (
          <Button onClick={nextStep} icon={<FiArrowRight />}>
            Next
          </Button>
        ) : (
          <Button onClick={handleGenerate} loading={loading} size="lg" className="px-8">
            <FiCompass className="w-5 h-5" />
            Generate My Plan
          </Button>
        )}
      </div>

      {/* Summary Preview */}
      {step > 1 && Object.values(form).some(Boolean) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Trip Summary</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {form.destination && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <FiMapPin className="w-4 h-4 text-primary-400" /> {form.destination}
              </span>
            )}
            {form.budget && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <FiDollarSign className="w-4 h-4 text-emerald-400" /> ₹{Number(form.budget).toLocaleString()}
              </span>
            )}
            {form.days && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <FiCalendar className="w-4 h-4 text-primary-400" /> {form.days} days
              </span>
            )}
            {form.travelType && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <FiTag className="w-4 h-4 text-accent-400" /> {form.travelType}
              </span>
            )}
            {form.moodDescription && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <FiSmile className="w-4 h-4 text-accent-400" /> {form.moodDescription}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
