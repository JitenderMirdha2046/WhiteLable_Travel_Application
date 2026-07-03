import { forwardRef } from 'react'

const Card = forwardRef(({ className = '', children, hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={`glass rounded-xl p-6 ${hover ? 'glass-hover cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = 'Card'

const CardHeader = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ className = '', children, ...props }, ref) => (
  <h3 ref={ref} className={`text-lg font-semibold text-white ${className}`} {...props}>
    {children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef(({ className = '', children, ...props }, ref) => (
  <p ref={ref} className={`text-sm text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`mt-4 pt-4 border-t border-surface-border ${className}`} {...props}>
    {children}
  </div>
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
