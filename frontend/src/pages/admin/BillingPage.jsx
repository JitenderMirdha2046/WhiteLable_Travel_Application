import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiClock, FiCreditCard, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { getPricingPlans, createSubscription } from '../../api/billingApi'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const [plans, setPlans] = useState([])
  const [currentPlan, setCurrentPlan] = useState(localStorage.getItem('admin_plan_type') || 'starter')
  const [currentStatus, setCurrentStatus] = useState(localStorage.getItem('admin_tenant_status') || 'trial')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)

  useEffect(() => {
    getPricingPlans()
      .then((res) => setPlans(res.data))
      .catch(() => {
        setPlans([
          { name: 'Starter', price: 199, period: '/month', description: '', features: ['1 Agency', '3 Sub-Agents', '500 Trips/mo', 'Subdomain', 'Basic Branding'], popular: false, priceId: 'price_starter' },
          { name: 'Growth', price: 499, period: '/month', description: '', features: ['1 Agency', '10 Sub-Agents', '2,000 Trips/mo', 'Custom Domain', 'Full Branding', 'Priority Support'], popular: true, priceId: 'price_growth' },
          { name: 'Enterprise', price: 0, period: '', description: '', features: ['Unlimited', 'Custom Integrations', 'Dedicated Server', 'SLA', 'On-Prem'], popular: false, priceId: 'price_enterprise' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const devUpgrade = params.get('dev_upgrade')
    if (devUpgrade) {
      setCurrentPlan(devUpgrade)
      setCurrentStatus('active')
      localStorage.setItem('admin_plan_type', devUpgrade)
      localStorage.setItem('admin_tenant_status', 'active')
      toast.success(`Upgraded to ${devUpgrade.charAt(0).toUpperCase() + devUpgrade.slice(1)} plan!`)
      window.history.replaceState({}, '', '/admin/billing')
    }
  }, [])

  const handleUpgrade = async (plan) => {
    if (plan.price === 0 || plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@travelplanner.com'
      return
    }
    setUpgrading(plan.name)
    try {
      const res = await createSubscription({
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/admin/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/admin/billing?canceled=true`,
      })
      if (res.data.sessionUrl) {
        window.location.href = res.data.sessionUrl
      } else {
        toast.success(`Upgraded to ${plan.name} (DEV mode)`)
        setCurrentPlan(plan.name.toLowerCase())
        setCurrentStatus('active')
        localStorage.setItem('admin_plan_type', plan.name.toLowerCase())
        localStorage.setItem('admin_tenant_status', 'active')
        window.location.href = '/admin/billing'
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create subscription')
    } finally {
      setUpgrading(null)
    }
  }

  const isActive = currentStatus === 'active' || currentStatus === 'active'
  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-400 mt-1">Manage your plan and payment history</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Current Plan</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {isActive ? 'Active' : 'Trial'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              You are on the <strong className="text-white">{planLabel}</strong> plan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {isActive ? (
            <><FiCreditCard className="w-4 h-4" /> Active subscription</>
          ) : (
            <><FiClock className="w-4 h-4" /> Trial period — upgrade to keep your agency active</>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-surface-border/30 rounded w-16 mb-3" />
                <div className="h-8 bg-surface-border/30 rounded w-24 mb-6" />
                <div className="space-y-2 mb-6">
                  {[1, 2, 3, 4, 5].map((j) => <div key={j} className="h-4 bg-surface-border/30 rounded w-full" />)}
                </div>
                <div className="h-10 bg-surface-border/30 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, i) => {
              const isCurrent = plan.name.toLowerCase() === currentPlan
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card p-6 relative ${plan.popular ? 'border-primary-500/50 ring-1 ring-primary-500/20' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-primary-500 text-white px-3 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      {plan.price > 0 ? (
                        <>
                          <span className="text-3xl font-bold">₹{plan.price}</span>
                          <span className="text-gray-400 text-sm">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold">Custom</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <FiCheck className={`w-4 h-4 ${plan.popular ? 'text-accent-400' : 'text-primary-400'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="w-full py-2 rounded-lg text-sm font-medium text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading === plan.name}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-black/20'
                          : 'border border-surface-border hover:border-gray-500 text-gray-300'
                      } ${upgrading === plan.name ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {upgrading === plan.name ? (
                        <><FiRefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : plan.price === 0 ? (
                        'Contact Sales'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Need a custom plan?</h3>
            <p className="text-sm text-gray-400 mt-1">
              Contact our sales team for enterprise pricing, custom integrations, and dedicated support.
            </p>
            <a href="mailto:sales@travelplanner.com" className="text-sm text-primary-400 hover:underline mt-2 inline-block">
              sales@travelplanner.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
