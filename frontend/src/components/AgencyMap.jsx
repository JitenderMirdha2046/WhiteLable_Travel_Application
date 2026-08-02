import { Component, lazy, Suspense, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiNavigation, FiMap } from 'react-icons/fi'

const LazyAgencyMap = lazy(() => import('./AgencyLeafletMap'))

class AgencyMapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function ContactBlock({ agency }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {agency.phone && (
        <a
          href={`tel:${agency.phone.replace(/\s+/g, '')}`}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary-400 transition-colors"
        >
          <FiPhone className="w-4 h-4 text-primary-400" />
          {agency.phone}
        </a>
      )}
      {agency.address && (
        <span className="flex items-center gap-2 text-sm text-gray-300">
          <FiMapPin className="w-4 h-4 text-primary-400 shrink-0" />
          <span>{agency.address}</span>
        </span>
      )}
    </div>
  )
}

export default function AgencyMap({ agency }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locState, setLocState] = useState('idle')

  const hasCoords = agency?.latitude != null && agency?.longitude != null

  useEffect(() => {
    if (!hasCoords) return
    if (!navigator.geolocation) {
      setLocState('denied')
      return
    }
    setLocState('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocState('done')
      },
      () => setLocState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [hasCoords])

  if (!hasCoords) {
    if (!agency?.phone && !agency?.address) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <FiMapPin className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Visit Our Agency</h2>
        </div>
        <ContactBlock agency={agency} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 p-5 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FiMap className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Visit Our Agency</h2>
        </div>
        <div className="flex items-center gap-3">
          {locState === 'locating' && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-gray-500 border-t-primary-400 rounded-full animate-spin" />
              Finding your location...
            </span>
          )}
          {locState === 'denied' && (
            <span className="text-xs text-gray-500">Location unavailable</span>
          )}
          {userLocation && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20 flex items-center gap-1">
              <FiNavigation className="w-3 h-3" /> You are on the map
            </span>
          )}
        </div>
      </div>

      <div className="h-72" style={{ zIndex: 0 }}>
        <AgencyMapErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full h-full bg-surface-lighter animate-pulse flex items-center justify-center">
                <FiMap className="w-8 h-8 text-gray-600" />
              </div>
            }
          >
            <LazyAgencyMap agency={agency} userLocation={userLocation} />
          </Suspense>
        </AgencyMapErrorBoundary>
      </div>

      <div className="p-5 pt-3 border-t border-surface-border-light">
        <ContactBlock agency={agency} />
      </div>
    </motion.div>
  )
}
