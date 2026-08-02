import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX } from 'react-icons/hi'
import { FiLogOut, FiUser, FiCompass } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantProvider'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const tenant = useTenant()
  const agencyName = tenant.branding?.agencyName
  const logoUrl = tenant.branding?.logoUrl
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-40 glass-strong border-b border-surface-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2">
            <HiMenu className="w-6 h-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={agencyName} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-lg flex items-center justify-center">
                <FiCompass className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-lg font-bold gradient-text hidden sm:block">{agencyName || 'TravelPlanner'}</span>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 btn-ghost rounded-full pr-2"
          >
            <div className="w-8 h-8 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 glass-strong rounded-xl border border-surface-border shadow-2xl shadow-black/30 overflow-hidden"
              >
                <div className="p-3 border-b border-surface-border">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-surface-lighter transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-surface-lighter transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
