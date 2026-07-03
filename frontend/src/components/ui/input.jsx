import { forwardRef } from 'react'

const Input = forwardRef(({ className = '', label, error, icon: Icon, ...props }, ref) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-light border rounded-lg text-white placeholder-gray-500 
          focus:outline-none focus:ring-1 transition-all duration-200
          ${Icon ? 'pl-11' : ''}
          ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
            : 'border-surface-border-light focus:border-primary-500 focus:ring-primary-500/50'
          }
          ${className}`}
        {...props}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-400">{error}</p>
    )}
  </div>
))
Input.displayName = 'Input'

export { Input }
