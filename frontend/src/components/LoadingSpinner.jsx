import { motion } from 'framer-motion'
import { FiCompass } from 'react-icons/fi'

export default function LoadingSpinner({ fullScreen, text }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center"
          >
            <FiCompass className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-400 text-sm">{text || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full"
      />
      {text && <p className="mt-3 text-sm text-gray-400">{text}</p>}
    </div>
  )
}
