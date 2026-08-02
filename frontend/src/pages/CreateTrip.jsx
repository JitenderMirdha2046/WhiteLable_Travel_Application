import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiCalendar, FiTag, FiArrowRight, FiCheck, FiCompass, FiLoader, FiChevronLeft, FiSmile, FiClock, FiBarChart2, FiSun, FiSunset } from 'react-icons/fi'
import RupeeIcon from '../components/ui/RupeeIcon'
import toast from 'react-hot-toast'
import tripService from '../services/tripService'
import { Button } from '../components/ui/button'
import { getDestinations } from '../api/tripApi'

const ALL_TRAVEL_TYPES = [
  { id: 'Adventure', icon: '🏔️', desc: 'Thrills & outdoors' },
  { id: 'Relaxation', icon: '🏖️', desc: 'Peace & unwind' },
  { id: 'Cultural', icon: '🏛️', desc: 'Heritage & history' },
  { id: 'Road Trip', icon: '🚗', desc: 'Drive & explore' },
  { id: 'Beach', icon: '🌊', desc: 'Sun & sand' },
  { id: 'Wildlife', icon: '🦁', desc: 'Nature & animals' },
  { id: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Fun for all' },
  { id: 'Solo', icon: '🧘', desc: 'Me time' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const MEAL_REST_BUFFER = 2

function selectPlacesForTimeAndBudget(places, totalUsableHours, budgetRatio) {
  if (!places || places.length === 0) return []
  const targetHours = totalUsableHours * budgetRatio
  const shuffled = shuffle(places)
  const selected = []
  let hours = 0
  for (const p of shuffled) {
    if (hours + p.timeRequired <= targetHours + 0.5) {
      selected.push(p)
      hours += p.timeRequired
    }
    if (hours >= targetHours) break
  }
  return selected.length > 0 ? selected : shuffled.slice(0, Math.max(1, Math.floor(shuffled.length * budgetRatio)))
}

export default function CreateTrip() {
  const navigate = useNavigate()
  const [adminDestinations, setAdminDestinations] = useState([])
  const [fetching, setFetching] = useState(true)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ destination: '', budget: '', days: '', travelType: '', moodDescription: '' })
  const [selectedDest, setSelectedDest] = useState(null)
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getDestinations()
      .then((res) => setAdminDestinations(res.data || []))
      .catch(() => setAdminDestinations([]))
      .finally(() => setFetching(false))
  }, [])

  const update = (key, value) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: '' })
  }

  const selectDestination = (dest) => {
    setSelectedDest(dest)
    setSelectedPlaces([])
    setForm((prev) => ({
      ...prev,
      destination: dest.name,
      budget: dest.estimatedCost?.toString() || prev.budget,
    }))
    setStep(2)
  }

  const availableTravelTypes = selectedDest?.travelTypes?.length
    ? ALL_TRAVEL_TYPES.filter((t) => selectedDest.travelTypes.includes(t.id))
    : ALL_TRAVEL_TYPES

  const destActiveStart = selectedDest?.activeStartHour ?? 7
  const destActiveEnd = selectedDest?.activeEndHour ?? 18
  const rawDailyHours = destActiveEnd - destActiveStart
  const usableDailyHours = Math.max(rawDailyHours - MEAL_REST_BUFFER, 0)

  const suggestedPlaces = useMemo(() => {
    if (!selectedDest || !form.budget || !form.days) return []
    const pkg = selectedDest.estimatedCost || 1
    const budgetRatio = Math.min((parseFloat(form.budget) || pkg) / pkg, 1)
    const totalUsable = usableDailyHours * parseInt(form.days)
    return selectPlacesForTimeAndBudget(selectedDest.places || [], totalUsable, budgetRatio)
  }, [selectedDest, form.budget, form.days, usableDailyHours])

  const totalPlaceHours = suggestedPlaces.reduce((s, p) => s + p.timeRequired, 0)
  const totalPlaceCost = suggestedPlaces.reduce((s, p) => s + (p.entryCost || 0), 0)
  const dailyHours = form.days ? Math.round(totalPlaceHours / parseInt(form.days) * 10) / 10 : 0
  const pkgRatio = selectedDest && form.budget
    ? Math.round((parseFloat(form.budget) / (selectedDest.estimatedCost || 1)) * 100)
    : 100

  const validateStep = (s) => {
    const errs = {}
    if (s === 1) return adminDestinations.length > 0
    if (s === 2) {
      if (form.budget && (isNaN(form.budget) || Number(form.budget) <= 0)) errs.budget = 'Enter a valid budget'
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
      const payload = {
        destination: form.destination || 'Selected destination',
        budget: form.budget ? parseFloat(form.budget) : (selectedDest?.estimatedCost || 25000),
        days: parseInt(form.days),
        travelType: form.travelType,
        moodDescription: form.moodDescription.trim(),
        selectedPlaces: suggestedPlaces.map((p) => p.name),
      }
      const data = await tripService.create(payload)
      toast.success('Trip generation started!')
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
      <span className={`text-sm hidden sm:block ${step === num ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  )

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <FiLoader className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  const totalSteps = 3

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Plan Your Trip</h1>
        <p className="text-gray-400">Let AI create your perfect itinerary in 3 simple steps.</p>
      </motion.div>

      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">{stepIndicator(1, 'Destination', step > 1)}</div>
        <div className="flex-1 h-px mx-4 bg-surface-border relative">
          <div className="absolute inset-0 bg-primary-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
        </div>
        <div className="flex items-center gap-2">{stepIndicator(2, 'Budget & Days', step > 2)}</div>
        <div className="flex-1 h-px mx-4 bg-surface-border relative">
          <div className="absolute inset-0 bg-primary-500 transition-all duration-500"
            style={{ width: `${Math.max(0, ((step - 2) / (totalSteps - 1)) * 100)}%` }} />
        </div>
        <div className="flex items-center gap-2">{stepIndicator(3, 'Style & Mood', step > 3)}</div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="card mb-4">
              <div className="w-14 h-14 mb-5 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-2xl flex items-center justify-center">
                <FiMapPin className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Where do you want to go?</h2>
              <p className="text-gray-400 mb-4">Choose from destinations offered by your travel agency.</p>
            </div>

            {adminDestinations.length > 0 ? (
              <div className="grid gap-3">
                {adminDestinations.map((dest, i) => (
                  <motion.button
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectDestination(dest)}
                    className={`card p-0 overflow-hidden text-left flex hover:border-primary-500/50 transition-all ${
                      selectedDest?.id === dest.id ? 'border-primary-500 ring-1 ring-primary-500/30' : ''
                    }`}
                  >
                    {dest.imageUrl && (
                      <div className="w-28 md:w-36 shrink-0 bg-surface-lighter">
                        <img src={dest.imageUrl} alt={dest.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); const icon = document.createElement('div'); icon.className = 'text-gray-600'; icon.innerHTML = '<svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M21 15l-5-5L5 21\"/></svg>'; e.target.parentElement.appendChild(icon) }} />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-white">{dest.name}</h3>
                          <span className="text-sm font-bold text-primary-400 shrink-0 ml-2">₹{Number(dest.estimatedCost).toLocaleString()}</span>
                        </div>
                        {dest.description && <p className="text-sm text-gray-400 line-clamp-2">{dest.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {dest.travelTypes?.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">{t}</span>
                        ))}
                        {dest.places?.length > 0 && (
                          <span className="text-[10px] text-gray-500 ml-auto">{dest.places.length} places</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <FiMapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-lg mb-1">No destinations available</p>
                <p className="text-gray-500 text-sm">Your travel agency hasn't added any destinations yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="card mb-4">
              <div className="w-14 h-14 mb-5 bg-surface-lighter border border-surface-border-light text-emerald-400 rounded-2xl flex items-center justify-center">
                <RupeeIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Budget & Duration</h2>
              <p className="text-gray-400 mb-6">Set your budget — we'll suggest places that fit.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Budget (₹)</label>
                  <div className="relative">
                    <RupeeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="number" placeholder={selectedDest?.estimatedCost?.toString() || '25000'} min="1"
                      value={form.budget} onChange={(e) => update('budget', e.target.value)}
                      className={`input-field pl-11 ${errors.budget ? 'border-red-500' : ''}`} />
                  </div>
                  {errors.budget && <p className="mt-1 text-sm text-red-400">{errors.budget}</p>}
                  {selectedDest && (
                    <p className="mt-1 text-xs text-gray-500">Package price: ₹{Number(selectedDest.estimatedCost).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="number" placeholder="4" min="1" max="30"
                      value={form.days} onChange={(e) => update('days', e.target.value)}
                      className={`input-field pl-11 ${errors.days ? 'border-red-500' : ''}`} />
                  </div>
                  {errors.days && <p className="mt-1 text-sm text-red-400">{errors.days}</p>}
                </div>
              </div>
            </div>

            {/* Budget + Time analysis */}
            {selectedDest && form.budget && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <FiBarChart2 className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-medium text-white">Your Budget & Time</h3>
                </div>

                {/* Active hours info */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-400 bg-surface-lighter rounded-lg p-2.5">
                  <span className="flex items-center gap-1"><FiSun className="w-3.5 h-3.5 text-amber-400" /> {destActiveStart}:00</span>
                  <span className="text-gray-600">to</span>
                  <span className="flex items-center gap-1"><FiSunset className="w-3.5 h-3.5 text-orange-400" /> {destActiveEnd}:00</span>
                  <span className="text-gray-600">•</span>
                  <span>{rawDailyHours}h/day</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-emerald-400">{usableDailyHours}h usable</span>
                  <span className="text-gray-500">(−{MEAL_REST_BUFFER}h meals/rest)</span>
                </div>

                {/* Budget bar */}
                <div className="w-full bg-surface-lighter rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pkgRatio, 100)}%` }}
                    className={`h-full rounded-full ${pkgRatio >= 100 ? 'bg-emerald-500' : pkgRatio >= 60 ? 'bg-primary-500' : 'bg-amber-500'}`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {pkgRatio >= 100
                    ? `Full budget coverage — up to ${usableDailyHours * parseInt(form.days || 1)}h of activities across ${form.days || 0} days`
                    : `${pkgRatio}% budget — ${suggestedPlaces.length} of ${selectedDest.places?.length || 0} places fit in ${Math.round(usableDailyHours * parseInt(form.days || 1) * pkgRatio / 100)}h`}
                </p>

                {/* Suggested places preview */}
                {suggestedPlaces.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Suggested places ({suggestedPlaces.length})</span>
                      <span className="text-[10px] text-gray-500">{totalPlaceHours}h total · ₹{totalPlaceCost.toLocaleString()} entry fees</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedPlaces.map((p) => (
                        <span key={p.name} className="text-[11px] px-2 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20 flex items-center gap-1">
                          <FiClock className="w-3 h-3" /> {p.name} <span className="text-gray-500">({p.timeRequired}h)</span>
                        </span>
                      ))}
                    </div>
                    {form.days && (
                      <p className="text-[10px] text-gray-500 mt-2">~{dailyHours}h activities/day | {totalPlaceHours}h total across {form.days} days</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card">
            <div className="w-14 h-14 mb-5 bg-surface-lighter border border-surface-border-light text-accent-400 rounded-2xl flex items-center justify-center">
              <FiTag className="w-7 h-7 text-accent-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">What's your travel style?</h2>
            <p className="text-gray-400 mb-6">
              {selectedDest?.travelTypes?.length
                ? `Select a style for your ${selectedDest.name} trip.`
                : 'Choose the type of experience you\'re looking for.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {availableTravelTypes.map((type) => (
                <button key={type.id} onClick={() => update('travelType', type.id)}
                  className={`p-4 rounded-xl text-center transition-all border ${
                    form.travelType === type.id
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-surface-lighter border-surface-border-light hover:border-primary-500/30'
                  }`}>
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className={`text-sm font-medium block ${form.travelType === type.id ? 'text-primary-300' : 'text-gray-300'}`}>{type.id}</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">{type.desc}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-surface-border-light pt-6">
              <div className="flex items-center gap-2 mb-3">
                <FiSmile className="w-5 h-5 text-accent-400" />
                <h3 className="text-lg font-medium text-white">Describe your mood (optional)</h3>
              </div>
              <textarea placeholder="e.g. Romantic getaway, family-friendly, budget backpacking, luxury relaxation..."
                value={form.moodDescription} onChange={(e) => update('moodDescription', e.target.value)}
                rows={3} className="input-field w-full resize-none" />
            </div>

            {errors.travelType && <p className="mt-3 text-sm text-red-400">{errors.travelType}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button variant="secondary" onClick={prevStep} icon={<FiChevronLeft />}>Back</Button>
        ) : <div />}
        {step < 3 ? (
          <Button onClick={nextStep} icon={<FiArrowRight />}>Next</Button>
        ) : (
          <Button onClick={handleGenerate} loading={loading} size="lg" className="px-8">
            <FiCompass className="w-5 h-5" /> Generate My Plan
          </Button>
        )}
      </div>

      {step > 1 && Object.values(form).some(Boolean) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 card">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Trip Summary</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {form.destination && (
              <span className="flex items-center gap-1.5 text-gray-300"><FiMapPin className="w-4 h-4 text-primary-400" /> {form.destination}</span>
            )}
            {form.budget && (
              <span className="flex items-center gap-1.5 text-gray-300"><RupeeIcon className="w-4 h-4 text-emerald-400" /> ₹{Number(form.budget).toLocaleString()}</span>
            )}
            {form.days && (
              <span className="flex items-center gap-1.5 text-gray-300"><FiCalendar className="w-4 h-4 text-primary-400" /> {form.days} days</span>
            )}
            {form.travelType && (
              <span className="flex items-center gap-1.5 text-gray-300"><FiTag className="w-4 h-4 text-accent-400" /> {form.travelType}</span>
            )}
            {suggestedPlaces.length > 0 && (
              <span className="flex items-center gap-1.5 text-gray-300"><FiClock className="w-4 h-4 text-primary-400" /> {suggestedPlaces.length} places</span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
