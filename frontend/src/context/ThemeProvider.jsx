import { useEffect, useRef } from 'react'
import { useTenant } from './TenantProvider'

const DEFAULTS = {
  primary: '#3b82f6',
  accent: '#a855f7',
}

function clamp(v) {
  return Math.min(255, Math.max(0, v))
}

function adjust(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = clamp((n >> 16) + amt)
  const g = clamp(((n >> 8) & 0xff) + amt)
  const b = clamp((n & 0xff) + amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function getCss(p, a, dk) {
  return `
[class*="btn-primary"] {
  background-image: linear-gradient(to right, ${dk}, ${p}) !important;
}
[class*="btn-primary"]:hover {
  background-image: linear-gradient(to right, ${p}, ${adjust(p, 30)}) !important;
  box-shadow: 0 10px 15px -3px ${p}40 !important;
}
.btn-secondary:hover {
  border-color: ${p}80 !important;
}
[class*="text-primary-300"] { color: ${adjust(p, 80)} !important; }
[class*="text-primary-400"] { color: ${p} !important; }
[class*="text-primary-500"] { color: ${p} !important; }
[class*="hover:text-primary-300"]:hover { color: ${adjust(p, 80)} !important; }
[class*="hover:text-primary-400"]:hover { color: ${p} !important; }
[class*="bg-primary-500"] { background-color: ${p} !important; }
[class*="bg-primary-500/"] { background-color: color-mix(in srgb, ${p} 100%, transparent) !important; }
[class*="hover:bg-primary-500"]:hover { background-color: ${p} !important; }
[class*="border-primary-500"] { border-color: ${p} !important; }
[class*="border-primary-500/"] { border-color: color-mix(in srgb, ${p} 50%, transparent) !important; }
[class*="hover:border-primary-500"]:hover { border-color: ${p} !important; }
[class*="from-primary-400"] { --tw-gradient-from: ${p} !important; }
[class*="from-primary-500"] { --tw-gradient-from: ${p} !important; }
[class*="from-primary-600"] { --tw-gradient-from: ${dk} !important; }
[class*="from-primary-900"] { --tw-gradient-from: ${adjust(p, -120)} !important; }
[class*="to-primary-400"] { --tw-gradient-to: ${p} !important; }
[class*="to-primary-500"] { --tw-gradient-to: ${p} !important; }
[class*="to-primary-600"] { --tw-gradient-to: ${dk} !important; }
[class*="hover:from-primary-400"]:hover { --tw-gradient-from: ${p} !important; }
[class*="hover:from-primary-500"]:hover { --tw-gradient-from: ${p} !important; }
[class*="hover:to-primary-400"]:hover { --tw-gradient-to: ${p} !important; }
[class*="hover:shadow-primary-500"]:hover { --tw-shadow-color: ${p} !important; }
[class*="hover:shadow-primary-500/"]:hover { --tw-shadow-color: color-mix(in srgb, ${p} 25%, transparent) !important; }
.group:hover [class*="group-hover:from-primary-500"] { --tw-gradient-from: ${p} !important; }
[class*="ring-primary-500/"] { --tw-ring-color: color-mix(in srgb, ${p} 30%, transparent) !important; }

[class*="text-accent-400"] { color: ${a} !important; }
[class*="text-accent-500"] { color: ${a} !important; }
[class*="bg-accent-500"] { background-color: ${a} !important; }
[class*="border-accent-500"] { border-color: ${a} !important; }
[class*="from-accent-500"] { --tw-gradient-from: ${a} !important; }
[class*="to-accent-400"] { --tw-gradient-to: ${a} !important; }
[class*="to-accent-500"] { --tw-gradient-to: ${a} !important; }
.group:hover [class*="group-hover:to-accent-500"] { --tw-gradient-to: ${a} !important; }

[class*="shadow-primary-500/20"] { box-shadow: 0 10px 15px -3px ${p}33 !important; }
[class*="shadow-primary-500/25"] { box-shadow: 0 10px 15px -3px ${p}40 !important; }
`
}

export default function ThemeProvider({ children }) {
  const tenant = useTenant()
  const styleRef = useRef(null)

  useEffect(() => {
    if (tenant.loading) return

    const p = tenant.branding?.primaryColor || DEFAULTS.primary
    const a = tenant.branding?.accentColor || DEFAULTS.accent
    const dk = adjust(p, -30)

    const root = document.documentElement
    root.style.setProperty('--color-primary', p)
    root.style.setProperty('--color-primary-dark', dk)
    root.style.setProperty('--color-accent', a)

    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.id = 'theme-overrides'
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = getCss(p, a, dk)
  }, [tenant.loading, tenant.branding?.primaryColor, tenant.branding?.accentColor])

  return children
}
