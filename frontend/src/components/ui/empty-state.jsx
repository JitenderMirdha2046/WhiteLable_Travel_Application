import { motion } from 'framer-motion'
import { FiCompass } from 'react-icons/fi'

export function EmptyState({
  icon: Icon = FiCompass,
  title,
  description,
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card text-center py-16"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {action}
    </motion.div>
  )
}
