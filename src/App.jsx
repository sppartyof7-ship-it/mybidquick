import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
import QuoteDemo from './pages/QuoteDemo'
import TenantDashboard from './pages/TenantDashboard'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Onboarding />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/demo/quote" element={<QuoteDemo />} />
      <Route path="/dashboard" element={<TenantDashboard />} />
    </Routes>
  )
}

export default App
