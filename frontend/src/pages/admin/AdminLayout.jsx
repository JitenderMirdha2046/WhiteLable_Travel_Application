import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiEdit3, FiUsers, FiCreditCard, FiLogOut,
  FiMenu, FiX, FiCompass, FiMapPin
} from 'react-icons/fi'

const navItems = [
  { path: '/admin/overview', label: 'Overview', icon: FiGrid },
  { path: '/admin/branding', label: 'Branding', icon: FiEdit3 },
  { path: '/admin/destinations', label: 'Destinations', icon: FiMapPin },
  { path: '/admin/users', label: 'Customers', icon: FiUsers },
  { path: '/admin/billing', label: 'Billing', icon: FiCreditCard },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tenantName = localStorage.getItem('admin_tenant_name') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_tenant_id')
    localStorage.removeItem('admin_tenant_name')
    localStorage.removeItem('admin_tenant_subdomain')
    navigate('/admin')
  }

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
          <Link to="/admin/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-lg flex items-center justify-center">
              <FiCompass className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">{tenantName}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
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
              <span className="text-sm text-gray-400">{tenantName}</span>
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
