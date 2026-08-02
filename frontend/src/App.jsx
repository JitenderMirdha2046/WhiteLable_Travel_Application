import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MainLayout from './layouts/MainLayout'
import PrivateRoute from './routes/PrivateRoute'
import { ErrorBoundary } from './components/ui/error-boundary'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import TripDetails from './pages/TripDetails'
import MyTrips from './pages/MyTrips'
import Profile from './pages/Profile'
import TripComparison from './pages/TripComparison'
import WhiteLabelDemo from './pages/WhiteLabelDemo'
import PricingPage from './pages/PricingPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import BrandingSetup from './pages/admin/BrandingSetup'
import DestinationManager from './pages/admin/DestinationManager'
import CustomerList from './pages/admin/CustomerList'
import BillingPage from './pages/admin/BillingPage'

import SuperAdminLogin from './pages/super/SuperAdminLogin'
import SuperAdminLayout from './pages/super/SuperAdminLayout'
import SuperDashboard from './pages/super/SuperDashboard'
import SuperTenants from './pages/super/SuperTenants'
import SuperTenantDetail from './pages/super/SuperTenantDetail'

export default function App() {
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/whitelabel-demo" element={<WhiteLabelDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/compare" element={<TripComparison />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/branding" element={<BrandingSetup />} />
          <Route path="/admin/destinations" element={<DestinationManager />} />
          <Route path="/admin/users" element={<CustomerList />} />
          <Route path="/admin/billing" element={<BillingPage />} />
        </Route>

        <Route path="/super-admin" element={<SuperAdminLogin />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperDashboard />} />
          <Route path="/super-admin/tenants" element={<SuperTenants />} />
          <Route path="/super-admin/tenants/:id" element={<SuperTenantDetail />} />
        </Route>
      </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  )
}
