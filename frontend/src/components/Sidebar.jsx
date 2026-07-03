import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCompass, FiGrid, FiPlusSquare, FiMap, FiUser, FiX, FiLayers } from 'react-icons/fi'
import { useTenant } from '../context/TenantProvider'

const links = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/create-trip', icon: FiPlusSquare, label: 'Create Trip' },
  { to: '/trips', icon: FiMap, label: 'My Trips' },
  { to: '/compare', icon: FiLayers, label: 'Compare' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const tenant = useTenant()
  const agencyName = tenant.branding?.agencyName
  const logoUrl = tenant.branding?.logoUrl

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between h-16 px-6 border-b border-surface-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={agencyName} className="h-9 w-auto" />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <FiCompass className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-lg font-bold gradient-text">{agencyName || 'TravelPlanner'}</span>
        </Link>
        <button onClick={onClose} className="lg:hidden btn-ghost p-2">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-gradient-to-r from-primary-600/40 to-primary-600/10'
                  : 'text-gray-400 hover:text-white hover:bg-surface-lighter'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/40 to-primary-600/10 border border-primary-500/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <link.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">AI Powered</p>
          <p className="text-sm text-gray-300">Plan your perfect trip with AI</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-surface-light/90 border-r border-surface-border backdrop-blur-2xl">
          {sidebarContent}
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-light border-r border-surface-border lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
