import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiArrowLeft, FiZap, FiUsers, FiGlobe, FiShield } from 'react-icons/fi'
import { getPricingPlans } from '../api/billingApi'
import { useTenant } from '../context/TenantProvider'

const featureIcons = [FiZap, FiUsers, FiGlobe, FiShield, FiZap, FiUsers]

export default function PricingPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const tenant = useTenant()
  const navigate = useNavigate()

  useEffect(() => {
    getPricingPlans()
      .then((res) => setPlans(res.data))
      .catch(() => {
        setPlans([
          { name: 'Starter', price: 199, period: '/month', description: 'Perfect for small agencies.', features: ['1 Agency', '3 Sub-Agents', '500 Trips/mo', 'Subdomain', 'Basic Branding', 'Email Support'], popular: false, priceId: 'price_starter' },
          { name: 'Growth', price: 499, period: '/month', description: 'For growing agencies.', features: ['1 Agency', '10 Sub-Agents', '2,000 Trips/mo', 'Custom Domain', 'Full Branding', 'Priority Support'], popular: true, priceId: 'price_growth' },
          { name: 'Enterprise', price: 0, period: '', description: 'Custom solution.', features: ['Unlimited', 'Custom Integrations', 'Dedicated Server', 'SLA', 'On-Prem', '24/7 Support'], popular: false, priceId: 'price_enterprise' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChoose = (plan) => {
    if (plan.price === 0 || plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@travelplanner.com'
      return
    }
    navigate('/admin/login')
  }

  const bgStyle = tenant?.branding?.backgroundImage
    ? { backgroundImage: `url(${tenant.branding.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <div className="min-h-screen bg-surface-dark text-white" style={bgStyle}>
      {tenant?.branding?.backgroundImage && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent <span className="gradient-text-glow">Pricing</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">Start with a free trial. No credit card required. Upgrade anytime.</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 animate-pulse">
                <div className="h-6 bg-surface-border/30 rounded w-20 mb-4" />
                <div className="h-10 bg-surface-border/30 rounded w-32 mb-6" />
                <div className="space-y-2 mb-8">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="h-4 bg-surface-border/30 rounded w-full" />
                  ))}
                </div>
                <div className="h-10 bg-surface-border/30 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`card p-8 relative ${plan.popular ? 'border-primary-500/40 ring-1 ring-primary-500/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 rounded-full text-xs font-medium text-white whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-white">Custom</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleChoose(plan)}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-surface-border/30 text-gray-300 hover:bg-surface-border/50 hover:text-white border border-surface-border'
                  }`}
                >
                  {plan.price === 0 ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            All plans include a 14-day free trial. No credit card required.{' '}
            <Link to="/register" className="text-primary-400 hover:underline">Create your agency account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
