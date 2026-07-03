import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiUsers, FiBarChart2, FiLogOut, FiMenu, FiX, FiShield
} from 'react-icons/fi'

const navItems = [
  { path: '/super-admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { path: '/super-admin/tenants', label: 'Tenants', icon: FiUsers },
]

export default function SuperAdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const adminData = JSON.parse(localStorage.getItem('super_admin') || '{}')
  const adminName = adminData.name || 'Super Admin'

  const handleLogout = () => {
    localStorage.removeItem('super_token')
    localStorage.removeItem('super_admin')
    navigate('/super-admin/login')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-surface">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-surface-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-border">
          <Link to="/super-admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <FiShield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold gradient-text">TravelProject</span>
              <p className="text-[10px] text-gray-500 leading-tight">Super Admin</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary-500/10 text-primary-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-surface-border/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-border">
          <div className="px-4 py-2 mb-2 text-xs text-gray-500 truncate">{adminData.email || ''}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass border-b border-surface-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm text-gray-400">{adminName}</span>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
