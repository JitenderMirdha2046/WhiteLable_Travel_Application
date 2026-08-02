import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCompass, FiGrid, FiMapPin, FiCalendar, FiTag, FiStar, FiZap, FiUsers, FiGlobe, FiCheck, FiArrowRight, FiLayers } from 'react-icons/fi'
import RupeeIcon from '../components/ui/RupeeIcon'

const AGENCIES = [
  {
    id: 'default',
    name: 'TravelPlanner (Original)',
    tagline: 'AI-Powered Travel Planning',
    logoGradient: 'from-primary-500 to-accent-500',
    primaryColor: 'rgb(59, 130, 246)',
    primaryDark: 'rgb(37, 99, 235)',
    accentColor: 'rgb(168, 85, 247)',
    theme: {
      primary: 'primary',
      accent: 'accent',
    },
  },
  {
    id: 'manali',
    name: 'Manali Travels',
    tagline: 'Himalayas Ki Best Trips',
    logoGradient: 'from-emerald-500 to-teal-500',
    primaryColor: 'rgb(16, 185, 129)',
    primaryDark: 'rgb(5, 150, 105)',
    accentColor: 'rgb(245, 158, 11)',
    theme: {
      primary: 'emerald',
      accent: 'amber',
    },
  },
  {
    id: 'goa',
    name: 'Goa Adventures',
    tagline: 'Beach, Sun & Thrills',
    logoGradient: 'from-sky-500 to-cyan-500',
    primaryColor: 'rgb(14, 165, 233)',
    primaryDark: 'rgb(2, 132, 199)',
    accentColor: 'rgb(249, 115, 22)',
    theme: {
      primary: 'sky',
      accent: 'orange',
    },
  },
  {
    id: 'rajasthan',
    name: 'Royal Rajasthan Tours',
    tagline: 'Heritage & Royalty',
    logoGradient: 'from-orange-500 to-red-500',
    primaryColor: 'rgb(249, 115, 22)',
    primaryDark: 'rgb(234, 88, 12)',
    accentColor: 'rgb(217, 119, 6)',
    theme: {
      primary: 'orange',
      accent: 'amber',
    },
  },
]

const PREVIEW_SECTIONS = [
  {
    id: 'landing',
    label: 'Landing Page',
    icon: FiGlobe,
    content: (agency) => (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${agency.logoGradient} rounded-xl flex items-center justify-center`}>
            <FiCompass className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{agency.name}</p>
            <p className="text-gray-400 text-xs">{agency.tagline}</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Plan Your Perfect <br /><span style={{ color: agency.primaryColor }}>Trip with AI</span>
        </h2>
        <p className="text-gray-400 text-sm">Get personalized itineraries, budget breakdowns, and smart recommendations powered by AI.</p>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 text-xs rounded-lg text-white`} style={{ backgroundColor: agency.primaryColor }}>Get Started</span>
          <span className="px-3 py-1.5 text-xs rounded-lg bg-surface-lighter text-gray-300 border border-surface-border">Learn More</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {['Manali', 'Leh Ladakh', 'Dharamshala'].map((d) => (
            <span key={d} className="text-xs text-gray-500 bg-surface-lighter/50 rounded-lg px-2 py-1.5 text-center">{d}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: FiGrid,
    content: (agency) => (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Welcome back, <span style={{ color: agency.primaryColor }}>Rahul</span></p>
            <p className="text-gray-500 text-xs">Your travel overview</p>
          </div>
          <div className={`w-8 h-8 bg-gradient-to-br ${agency.logoGradient} rounded-full flex items-center justify-center text-white text-xs font-bold`}>R</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Total Trips', value: '6', color: agency.primaryColor },
            { label: 'AI Plans', value: '4', color: agency.accentColor },
            { label: 'This Month', value: '2', color: '#10b981' },
            { label: 'Popular', value: 'Manali', color: '#8b5cf6' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-lighter/50 rounded-lg p-3">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 font-medium">Recent Trips</p>
        <div className="space-y-2">
          {['Manali - 5 Days', 'Goa - 4 Days', 'Jaipur - 3 Days'].map((t) => (
            <div key={t} className="flex items-center gap-2 bg-surface-lighter/30 rounded-lg p-2">
              <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: agency.primaryColor + '30' }}>
                <FiMapPin className="w-3 h-3 m-auto text-white" style={{ color: agency.primaryColor }} />
              </div>
              <span className="text-xs text-gray-300">{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'trip',
    label: 'Trip Details',
    icon: FiMapPin,
    content: (agency) => (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: agency.primaryColor + '20' }}>
              <FiMapPin className="w-4 h-4 m-auto" style={{ color: agency.primaryColor }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Manali Trip</p>
              <p className="text-gray-500 text-xs">5 Days • ₹35,000</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: agency.primaryColor + '20', color: agency.primaryColor }}>COMPLETED</span>
        </div>
        <div className="bg-surface-lighter/30 rounded-lg p-3">
          <p className="text-xs text-gray-300 font-medium mb-1">Day 1</p>
          <p className="text-xs text-gray-500">Arrival at Manali • Check-in • Mall Road walk • German bakery dinner</p>
        </div>
        <div className="bg-surface-lighter/30 rounded-lg p-3">
          <p className="text-xs text-gray-300 font-medium mb-1">Day 2</p>
          <p className="text-xs text-gray-500">Solang Valley • Paragliding • Snow point • Cable car ride</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-1 rounded-lg bg-surface-lighter text-gray-400">🏔️ Adventure</span>
          <span className="text-[10px] px-2 py-1 rounded-lg bg-surface-lighter text-gray-400">💰 Budget breakdown</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-lighter overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: agency.primaryColor }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Hotel 40%</span>
          <span>Food 20%</span>
          <span>Travel 20%</span>
        </div>
      </div>
    ),
  },
  {
    id: 'compare',
    label: 'Compare Plans',
    icon: FiLayers,
    content: (agency) => (
      <div className="space-y-3">
        <p className="text-white text-sm font-semibold">Compare Trip Plans</p>
        <p className="text-xs text-gray-500">for <span style={{ color: agency.primaryColor }}>Manali</span></p>
        <div className="space-y-2">
          {[
            { type: 'Budget', cost: '₹15,000', color: '#10b981', items: 'Hostels, street food, buses' },
            { type: 'Luxury', cost: '₹60,000', color: '#8b5cf6', items: '5-star resorts, fine dining, private cab' },
            { type: 'Adventure', cost: '₹35,000', color: agency.accentColor, items: 'Camping, trekking, river rafting' },
          ].map((p) => (
            <div key={p.type} className="bg-surface-lighter/30 rounded-lg p-3 border-l-2" style={{ borderLeftColor: p.color }}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white font-medium">{p.type}</span>
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.cost}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{p.items}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function WhiteLabelDemo() {
  const [activeAgency, setActiveAgency] = useState(AGENCIES[0])
  const [activePreview, setActivePreview] = useState(PREVIEW_SECTIONS[0])

  const agency = activeAgency
  const preview = PREVIEW_SECTIONS.find(p => p.id === activePreview.id) || PREVIEW_SECTIONS[0]

  return (
    <div className="min-h-screen bg-surface text-gray-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 glass border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${agency.logoGradient} rounded-lg flex items-center justify-center`}>
                <FiCompass className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">{agency.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 bg-surface-lighter px-2 py-1 rounded-full">White-Label Demo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            White-Label <span className="gradient-text">Demo</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Select a travel agency to see how the platform looks with their branding.
            <br />Same app — different brand identity for each agency.
          </p>
        </motion.div>

        {/* Agency Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Select Agency</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENCIES.map((a) => (
              <motion.button
                key={a.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveAgency(a); setActivePreview(PREVIEW_SECTIONS[0]) }}
                className={`relative text-left p-3 rounded-xl border transition-all ${
                  activeAgency.id === a.id
                    ? 'border-white/20 bg-surface-lighter'
                    : 'border-surface-border bg-surface-light/50 hover:border-surface-border-light'
                }`}
              >
                {activeAgency.id === a.id && (
                  <motion.div layoutId="agency-active" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: a.primaryColor }}>
                    <FiCheck className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <div className={`w-8 h-8 bg-gradient-to-br ${a.logoGradient} rounded-lg flex items-center justify-center mb-2`}>
                  <FiCompass className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-white font-medium">{a.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{a.tagline}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Preview Sections Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Page Preview</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PREVIEW_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActivePreview(section)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  activePreview.id === section.id
                    ? 'text-white'
                    : 'text-gray-400 bg-surface-lighter/30 hover:bg-surface-lighter'
                }`}
                style={activePreview.id === section.id ? { backgroundColor: agency.primaryColor + '20', color: agency.primaryColor } : {}}
              >
                <section.icon className="w-3.5 h-3.5" />
                {section.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          key={activePreview.id + agency.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ borderColor: agency.primaryColor + '30', backgroundColor: agency.primaryColor + '08' }}
          >
            {/* Top branding strip */}
            <div className="h-1 absolute top-0 left-0 right-0" style={{ background: `linear-gradient(90deg, ${agency.primaryColor}, ${agency.accentColor})` }} />

            {/* Floating badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-7 h-7 bg-gradient-to-br ${agency.logoGradient} rounded-lg flex items-center justify-center`}>
                <FiCompass className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white font-semibold">{agency.name}</p>
                <p className="text-[10px] text-gray-500">{agency.tagline}</p>
              </div>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-gray-500 bg-surface-lighter">Live Preview</span>
            </div>

            {/* Preview content */}
            <div className="max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreview.id + agency.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {preview.content(agency)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Key Difference Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass rounded-2xl p-5 border border-surface-border"
        >
          <p className="text-sm font-semibold text-white mb-4">Same Codebase — Different Branding</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-surface-lighter/30 rounded-xl p-3">
              <p className="text-xs text-gray-300 font-medium mb-1">🔄 Same Features</p>
              <p className="text-[10px] text-gray-500">AI itinerary, budget, weather, comparison, PDF — sab same hai. Ek baar bana, sabko do.</p>
            </div>
            <div className="bg-surface-lighter/30 rounded-xl p-3">
              <p className="text-xs text-gray-300 font-medium mb-1">🎨 Different Look</p>
              <p className="text-[10px] text-gray-500">Har agency ka apna logo, color, tagline. Aap admin panel se ek click mein badal sakte ho.</p>
            </div>
            <div className="bg-surface-lighter/30 rounded-xl p-3">
              <p className="text-xs text-gray-300 font-medium mb-1">💰 Recurring Revenue</p>
              <p className="text-[10px] text-gray-500">Har agency se ₹199/month. 10 agencies = ₹1990/month. Koi extra dev cost nahi.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
