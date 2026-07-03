import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
