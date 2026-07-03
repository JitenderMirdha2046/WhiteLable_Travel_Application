import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

export function Dialog({ open, onClose, children, title, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`glass rounded-2xl border border-surface-border w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-white">{title}</h2>
                  <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400 hover:text-white">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
