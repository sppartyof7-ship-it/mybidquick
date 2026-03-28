import { Routes, Route, useParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
import QuoteDemo from './pages/QuoteDemo'
import TenantDashboard from './pages/TenantDashboard'
import TenantPublicPage from './pages/TenantPublicPage'
import Login from './pages/Login'
import './App.css'

/**
 * Detect if we're on a tenant subdomain.
 * Examples:
 *   abc-cleaning.mybidquick.com â "abc-cleaning"
 *   mybidquick.com â null (main site)
 *   localhost:5173 â null (dev)
 */
function getSubdomainSlug() {
  const hostname = window.location.hostname

  // Skip localhost / IP addresses (development)
  if (hostname === 'localhost' || hostname.match(/^\d/)) return null

  const parts = hostname.split('.')

  // Custom domain: slug.mybidquick.com (3 parts)
  if (parts.length === 3 && parts[1] === 'mybidquick' && parts[2] === 'com') {
    const sub = parts[0]
    if (sub === 'www') return null
    return sub
  }

  // Vercel preview: slug.mybidquick.vercel.app (4 parts)
  if (parts.length === 4 && parts[1] === 'mybidquick' && parts[2] === 'vercel' && parts[3] === 'app') {
    return parts[0]
  }

  return null
}

/**
 * Fallback route: mybidquick.com/q/abc-cleaning
 * For tenants before subdomain DNS is set up.
 */
function SlugRoute() {
  const { slug } = useParams()
  return <TenantPublicPage slug={slug} />
}

function App() {
  const slug = getSubdomainSlug()

  // If on a tenant subdomain, show their public quote page
  if (slug) {
    return <TenantPublicPage slug={slug} />
  }

  // Otherwise, show the main MyBidQuick platform
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Onboarding />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/demo/quote" element={<QuoteDemo />} />
      <Route path="/dashboard" element={<TenantDashboard />} />
      <Route path="/q/:slug" element={<SlugRoute />} />
    </Routes>
  )
}

export default App
