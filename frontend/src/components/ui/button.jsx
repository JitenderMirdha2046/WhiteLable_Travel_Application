import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25',
  secondary: 'bg-surface-lighter border border-surface-border-light hover:border-primary-500/50 hover:bg-surface-lighter/80 text-gray-200',
  outline: 'border border-surface-border-light bg-transparent hover:border-primary-500/50 text-gray-300 hover:text-white',
  ghost: 'text-gray-400 hover:text-white hover:bg-surface-lighter',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300',
  'danger-solid': 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  loading,
  icon,
  as: Component = 'button',
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500/50'

  const content = (
    <>
      {loading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </>
  )

  if (Component === 'button') {
    return (
      <motion.button
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <Component
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {content}
    </Component>
  )
})

Button.displayName = 'Button'
export { Button }
