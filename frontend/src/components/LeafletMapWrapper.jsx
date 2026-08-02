import { Component, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FiMap } from 'react-icons/fi'

const destinationCoords = {
  'Goa': [15.4909, 73.8278],
  'Manali': [32.2396, 77.1887],
  'Shimla': [31.1048, 77.1734],
  'Dharamshala': [32.2190, 76.3234],
  'Kasol': [32.0101, 77.3150],
  'Bir Billing': [32.0503, 76.7298],
  'Spiti Valley': [32.2460, 78.0110],
  'Jaipur': [26.9124, 75.7873],
  'Kerala': [10.8505, 76.2711],
  'Ladakh': [34.1526, 77.5771],
  'Udaipur': [24.5854, 73.7125],
  'Sikkim': [27.5330, 88.5122],
  'Andaman': [11.7401, 92.6586],
  'Delhi': [28.7041, 77.1025],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Agra': [27.1767, 78.0081],
  'Varanasi': [25.3176, 82.9739],
  'Rishikesh': [30.0869, 78.2676],
}

const defaultCoords = [20.5937, 78.9629]

const LazyMap = lazy(() => import('./LeafletMap'))

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <StaticFallback destination={this.props.destination} />
    }
    return this.props.children
  }
}

function StaticFallback({ destination }) {
  const coords = destinationCoords[destination] || defaultCoords
  return (
    <div className="rounded-xl overflow-hidden h-64 bg-surface-lighter flex items-center justify-center">
      <div className="text-center p-6">
        <FiMap className="w-10 h-10 text-primary-400 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">{destination}</p>
        <p className="text-gray-500 text-sm">
          {coords[0].toFixed(2)}°N, {coords[1].toFixed(2)}°E
        </p>
        <p className="text-gray-600 text-xs mt-2">Map unavailable — showing coordinates</p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="rounded-xl overflow-hidden h-64 bg-surface-lighter animate-pulse flex items-center justify-center">
      <FiMap className="w-8 h-8 text-gray-600" />
    </div>
  )
}

export default function LeafletMapWrapper({ destination }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiMap className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">Map View</h2>
      </div>
      <MapErrorBoundary destination={destination}>
        <Suspense fallback={<LoadingFallback />}>
          <LazyMap destination={destination} />
        </Suspense>
      </MapErrorBoundary>
    </motion.div>
  )
}

export { destinationCoords, defaultCoords }
