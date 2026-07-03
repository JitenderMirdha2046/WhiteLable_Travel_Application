import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCompass, FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantProvider'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const tenant = useTenant()
  const agencyName = tenant.branding?.agencyName
  const backgroundImage = tenant.branding?.backgroundImage
  const overlayOpacity = tenant.branding?.overlayOpacity ?? 70
  const overlayBlur = tenant.branding?.overlayBlur || 'sm'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome, Demo Traveler!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-surface relative">
      {backgroundImage && (
        <div className="fixed inset-0 pointer-events-none">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})`,
              backdropFilter: overlayBlur === 'none' ? 'none' : `blur(${{ sm: '4px', md: '12px', lg: '24px' }[overlayBlur] || '4px'})`,
            }}
          />
        </div>
      )}
      {!backgroundImage && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-accent-500/8 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
      )}
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8 border border-surface-border">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <FiCompass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">{agencyName || 'TravelPlanner'}</span>
          </Link>

          {agencyName && (
            <div className="mb-6 px-4 py-2 glass rounded-lg border border-primary-500/20 text-sm text-primary-300">
              Signing in to <strong>{agencyName}</strong>
            </div>
          )}

          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to continue planning your trips.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 group">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface text-gray-500">Demo Access</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('demo@travelplanner.com', 'demo123')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-surface-border-light bg-surface-lighter/50 backdrop-blur-sm hover:border-accent-500/40 hover:bg-accent-500/5 hover:-translate-y-0.5 text-sm text-gray-300 hover:text-white transition-all duration-200"
              >
                <FiZap className="w-4 h-4 text-accent-400" />
                Demo User
              </button>
              <button
                onClick={() => demoLogin('admin@travelplanner.com', 'admin123')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-surface-border-light bg-surface-lighter/50 backdrop-blur-sm hover:border-primary-500/40 hover:bg-primary-500/5 hover:-translate-y-0.5 text-sm text-gray-300 hover:text-white transition-all duration-200"
              >
                <FiZap className="w-4 h-4 text-primary-400" />
                Admin User
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one
            </Link>
          </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-900/40 to-surface items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/20 rounded-full blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center"
        >
          <div className="glass rounded-3xl p-10 max-w-sm border-primary-500/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <FiCompass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">AI Travel Planning</h3>
            <p className="text-gray-400">
              Smart itineraries, personalized recommendations, and seamless trip management.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
