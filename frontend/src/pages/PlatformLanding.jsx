import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FiCompass, FiStar, FiShield, FiZap, FiArrowRight, FiUsers, FiEdit3,
  FiMonitor, FiGlobe, FiDollarSign, FiCheck, FiEye, FiEyeOff, FiLock, FiMail
} from 'react-icons/fi'
import adminService from '../services/adminService'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const platformFeatures = [
  { icon: FiEdit3, title: 'White-Label Branding', desc: 'Full custom branding — logo, colors, domain, and tagline. Your agency, your brand.' },
  { icon: FiUsers, title: 'Customer Management', desc: 'Manage all your travelers in one place. View trips, usage, and export data anytime.' },
  { icon: FiZap, title: 'AI Trip Planning', desc: 'Powerful AI generates personalized itineraries. Smart budgets, routes, and recommendations.' },
  { icon: FiMonitor, title: 'Admin Dashboard', desc: 'Complete admin panel with analytics, user management, and billing controls.' },
  { icon: FiGlobe, title: 'Custom Domain', desc: 'Use your own domain or subdomain. Your customers see your brand, not ours.' },
  { icon: FiDollarSign, title: 'Subscription Billing', desc: 'Starter $199/mo, Growth $499/mo. Enterprise plans available. Cancel anytime.' },
]

const steps = [
  { num: '01', title: 'Register Your Agency', desc: 'Sign up with your agency name and email. Get your subdomain instantly.' },
  { num: '02', title: 'Customize Branding', desc: 'Upload your logo, set colors, choose background. Make it yours in minutes.' },
  { num: '03', title: 'Invite Customers', desc: 'Share your branded link. Customers sign up and start planning trips with AI.' },
  { num: '04', title: 'Manage & Grow', desc: 'Track usage, manage customers, export data. Scale your travel business.' },
]

const plans = [
  {
    name: 'Starter',
    price: '$199',
    period: '/month',
    desc: 'Perfect for small agencies getting started with AI travel planning.',
    features: ['1 Agency Account', '3 Sub-Agents', '500 Trips/mo', 'Subdomain (.travelplanner.com)', 'Basic Branding', 'Email Support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$499',
    period: '/month',
    desc: 'For growing agencies that need more power and flexibility.',
    features: ['1 Agency Account', '10 Sub-Agents', '2,000 Trips/mo', 'Custom Domain', 'Full Branding', 'Priority Support', 'Advanced Analytics'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large travel businesses with custom requirements.',
    features: ['Unlimited Sub-Agents', 'Unlimited Trips', 'Dedicated Server', 'SLA Guarantee', 'On-Prem Option', 'Custom Integrations', '24/7 Support'],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PlatformLanding() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ agencyName: '', adminEmail: '', adminPassword: '', subdomain: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminService.register({
        agencyName: formData.agencyName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        subdomain: formData.subdomain || undefined,
      })
      const url = data.subdomain
        ? `${window.location.protocol}//${data.subdomain}.${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
        : window.location.origin + '/?tenant=' + data.agencyName.toLowerCase().replace(/\s+/g, '')
      setSuccess(url)
      setTimeout(() => navigate('/admin/overview'), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-accent-500/8 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-emerald-500/6 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <FiCompass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">TravelProject</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/super-admin/login" className="text-sm text-gray-400 hover:text-primary-400 transition-colors hidden sm:block">
            <FiShield className="w-3.5 h-3.5 inline mr-1" />Super Admin
          </Link>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Register Agency
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-primary-300 mb-6 border-primary-500/20"
            >
              <FiStar className="w-4 h-4 text-accent-400" />
              White-Label AI Travel Platform
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 text-shadow">
              Sell Travel with
              <span className="gradient-text-glow block">Your Own Brand</span>
              Powered by AI
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Launch your AI-powered travel agency in minutes. White-label platform with 
              custom branding, customer management, and smart trip planning.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => setShowForm(true)} className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group shadow-lg shadow-primary-500/20">
                Start Your Agency Free <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                See Features
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCheck className="w-4 h-4 text-emerald-400" /> No credit card</span>
              <span className="flex items-center gap-1"><FiCheck className="w-4 h-4 text-emerald-400" /> 14-day trial</span>
              <span className="flex items-center gap-1"><FiCheck className="w-4 h-4 text-emerald-400" /> Cancel anytime</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-2xl" />
            <div className="relative glass-strong rounded-2xl p-6 border border-primary-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-500 ml-2">travelproject.com</span>
              </div>
              <div className="bg-surface rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <FiCompass className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold gradient-text">Manali Travels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-border rounded-full w-3/4" />
                <div className="h-2 bg-surface-border rounded-full w-1/2" />
                <div className="h-2 bg-surface-border rounded-full w-2/3" />
                <div className="flex gap-2 mt-2">
                  <div className="h-20 w-16 bg-gradient-to-b from-primary-500/30 to-accent-500/30 rounded-lg flex-1" />
                  <div className="h-20 w-16 bg-gradient-to-b from-primary-500/20 to-accent-500/20 rounded-lg flex-1" />
                  <div className="h-20 w-16 bg-gradient-to-b from-primary-500/30 to-accent-500/30 rounded-lg flex-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Started in <span className="gradient-text-glow">4 Simple Steps</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">From registration to your first customer — quick and easy.</p>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card p-6 relative"
            >
              <div className="text-4xl font-bold gradient-text mb-3">{step.num}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 text-primary-500/30">
                  <FiArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to <span className="gradient-text-glow">Sell Travel</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">A complete white-label platform built for travel agencies.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 hover:border-primary-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Screenshots / Demo Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See It in <span className="gradient-text-glow">Action</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">A peek at what your agency dashboard looks like.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500 ml-2">Agency Dashboard</span>
            </div>
            <div className="bg-surface rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gradient-to-r from-primary-500/40 to-accent-500/40 rounded" />
                <div className="h-4 w-20 bg-surface-border rounded" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['Users', 'Trips', 'Revenue', 'AI Gen'].map((label) => (
                  <div key={label} className="bg-surface-border/30 rounded-lg p-3">
                    <div className="h-3 w-12 bg-surface-border rounded mb-2" />
                    <div className="h-6 w-16 bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-32 bg-surface-border/30 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Chart placeholder</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500 ml-2">Branding Setup</span>
            </div>
            <div className="bg-surface rounded-xl p-4 space-y-3">
              <div className="h-4 w-40 bg-gradient-to-r from-primary-500/40 to-accent-500/40 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-surface-border rounded" />
                <div className="h-8 w-full bg-surface-border/50 rounded-lg border border-surface-border" />
                <div className="h-3 w-full bg-surface-border rounded" />
                <div className="h-8 w-full bg-surface-border/50 rounded-lg border border-surface-border" />
                <div className="flex gap-3">
                  {['#3b82f6', '#a855f7', '#10b981', '#f59e0b'].map((c) => (
                    <div key={c} className="w-8 h-8 rounded-lg" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent <span className="gradient-text-glow">Pricing</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">Start with a free trial. No credit card required.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`card p-8 relative ${plan.popular ? 'border-primary-500/40 ring-1 ring-primary-500/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowForm(true)}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                  plan.popular
                    ? 'btn-primary'
                    : 'bg-surface-border/30 text-gray-300 hover:bg-surface-border/50 hover:text-white border border-surface-border'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => { if (!success) setShowForm(false) }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg card p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Register Your Agency</h2>
            <p className="text-gray-400 text-sm mb-6">Get your branded AI travel platform instantly.</p>

            {success ? (
              <div className="py-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-medium">Agency Created!</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <p className="text-xs text-gray-500 mb-1.5">🔗 Customer Portal — share with travelers</p>
                    <code className="text-sm text-primary-300 break-all">{success}</code>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <p className="text-xs text-gray-500 mb-1.5">🔐 Admin Panel — manage your agency</p>
                    <code className="text-sm text-gray-400 break-all">{window.location.origin}/admin</code>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">Redirecting to admin panel...</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Agency Name *</label>
                  <input
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    placeholder="Your Travel Agency"
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Admin Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="admin@youragency.com"
                      className="input-field pl-10 w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="adminPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="input-field pl-10 pr-10 w-full"
                      minLength={6}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Subdomain <span className="text-gray-500">(optional)</span></label>
                  <div className="flex items-center gap-2">
                    <input
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleChange}
                      placeholder="youragency"
                      className="input-field flex-1"
                    />
                    <span className="text-sm text-gray-500">.travelplanner.com</span>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create Your Agency'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By registering, you agree to our Terms of Service. 14-day free trial, no credit card needed.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[3rem] blur-3xl" />
          <div className="relative glass-strong rounded-3xl p-12 md:p-20 text-center border-primary-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
                Ready to Launch Your<br />
                <span className="gradient-text-glow">AI Travel Agency?</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                Join agencies using TravelProject to power their travel business. Start your free trial today.
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group shadow-lg shadow-primary-500/20">
                Start Free Trial <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCompass className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-400">TravelProject</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/super-admin/login" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
              Super Admin
            </Link>
            <p className="text-sm text-gray-500">© 2026 TravelProject. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
