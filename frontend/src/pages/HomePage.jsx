import { useTenant } from '../context/TenantProvider'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import PlatformLanding from './PlatformLanding'
import LandingPage from './LandingPage'

export default function HomePage() {
  const tenant = useTenant()
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  // Show tenant-branded landing page for travelers (subdomain or ?tenant= param)
  if (tenant.branding && tenant.subdomain) {
    return <LandingPage />
  }

  // Show SaaS platform for everyone else (including authenticated users)
  return <PlatformLanding />
}
