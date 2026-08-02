import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCompass, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantProvider'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const tenant = useTenant()
  const agencyName = tenant.branding?.agencyName
  const backgroundImage = tenant.branding?.backgroundImage
  const overlayOpacity = tenant.branding?.overlayOpacity ?? 70
  const overlayBlur = tenant.branding?.overlayBlur || 'sm'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
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
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-white/5 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
      )}
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-black/30 border-r border-surface-border items-center justify-center p-8 relative overflow-hidden">
        {!backgroundImage && (
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center"
        >
          <div className="glass rounded-3xl p-10 max-w-sm border-accent-500/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-surface-lighter border border-surface-border-light text-accent-400 rounded-2xl flex items-center justify-center">
              <FiCompass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start Your Journey</h3>
            <p className="text-gray-400">
              Create an account and let AI plan your perfect trip.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8 border border-surface-border">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-surface-lighter border border-surface-border-light text-primary-400 rounded-xl flex items-center justify-center">
              <FiCompass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">{agencyName || 'TravelPlanner'}</span>
          </Link>

          {agencyName && (
            <div className="mb-6 px-4 py-2 glass rounded-lg border border-primary-500/20 text-sm text-primary-300">
              Registering with <strong>{agencyName}</strong>
            </div>
          )}

          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400 mb-8">Start planning your dream trip with AI.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
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
                  Create Account
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign in
            </Link>
          </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
