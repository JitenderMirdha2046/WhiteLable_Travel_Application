import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiClock, FiCreditCard, FiDownload, FiAlertCircle } from 'react-icons/fi'

const plans = [
  {
    name: 'Starter',
    price: 199,
    period: '/month',
    features: ['1 agency profile', '3 sub-agents', '500 trips/month', 'Subdomain'],
    popular: false,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Growth',
    price: 499,
    period: '/month',
    features: ['1 agency profile', '10 sub-agents', '2,000 trips/month', 'Custom domain', 'Priority support'],
    popular: true,
    color: 'from-purple-500 to-accent-500',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited', 'Custom integrations', 'Dedicated server', 'SLA', 'On-prem option'],
    popular: false,
    color: 'from-amber-500 to-orange-600',
  },
]

const invoices = [
  { id: 'INV-001', date: '2024-06-01', amount: '$199', status: 'Paid' },
  { id: 'INV-002', date: '2024-05-01', amount: '$199', status: 'Paid' },
  { id: 'INV-003', date: '2024-04-01', amount: '$199', status: 'Paid' },
]

export default function BillingPage() {
  const [currentPlan] = useState('Starter')

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
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">You are on the <strong className="text-white">{currentPlan}</strong> plan</p>
          </div>
          <button className="btn-primary text-sm">Upgrade Plan</button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiClock className="w-4 h-4" />
          Next billing: July 1, 2026
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card p-6 relative ${plan.popular ? 'border-primary-500/50 ring-1 ring-primary-500/20' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
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
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:shadow-primary-500/20'
                  : 'border border-surface-border hover:border-gray-500 text-gray-300'
              }`}>
                {plan.price === 'Custom' ? 'Contact Sales' : `Choose ${plan.name}`}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Invoice History</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Invoice</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Date</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Amount</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-right text-sm text-gray-400 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-surface-border/50">
                  <td className="px-4 py-3 text-sm">{inv.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{inv.date}</td>
                  <td className="px-4 py-3 text-sm">{inv.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost p-1.5 text-sm">
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
