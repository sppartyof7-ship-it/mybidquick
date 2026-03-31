import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, DollarSign, Settings, Mail, Phone, LogOut, Check, Plus, X,
  Eye, Trash2, AlertCircle, Clock, MessageSquare, Home, Zap, TrendingUp,
  ChevronDown, MapPin, Heart, Loader, CreditCard, ShoppingCart, ExternalLink, Gift,
  BarChart3, Users, Target, Calendar, GripVertical
} from 'lucide-react'
import { getTenantByEmail, updateTenantConfig, getLeads, updateLeadStatus, getCurrentUser, getMyTenant, signOut, onAuthStateChange } from '../lib/db'
import { getBillingStatus, buyLeadCredits, openCustomerPortal, LEAD_PACKS, LAUNCH_PACKS, getPacksForTenant } from '../lib/billing'

// ============================================================================
// DEFAULTS & DATA
// ============================================================================

// Pipeline stages for the Kanban board
const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: '#3b9cff', bg: '#f0f7ff', icon: 'Plus' },
  { id: 'contacted', label: 'Contacted', color: '#ffa500', bg: '#fff8ef', icon: 'MessageSquare' },
  { id: 'won', label: 'Won', color: '#22c55e', bg: '#f0fdf4', icon: 'Check' },
  { id: 'lost', label: 'Lost', color: '#ef4444', bg: '#fef2f2', icon: 'X' },
]

const DEMO_LEADS = [
  {
    id: 'lead-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(608) 555-0123',
    services: ['House Washing', 'Window Cleaning'],
    package: 'Premium',
    date: '2026-03-24',
    source: 'Google',
    total: 850,
    status: 'new', // new, contacted, won, lost
    notes: 'Interested in spring cleaning special',
  },
  {
    id: 'lead-2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    phone: '(608) 555-0456',
    services: ['House Washing'],
    package: 'Basic',
    date: '2026-03-22',
    source: 'Referral',
    total: 350,
    status: 'won',
    notes: 'Paid in full',
  },
  {
    id: 'lead-3',
    name: 'Jennifer Davis',
    email: 'jen@example.com',
    phone: '(608) 555-0789',
    services: ['Gutter Cleaning', 'Roof Cleaning'],
    package: 'Standard',
    date: '2026-03-20',
    source: 'Facebook',
    total: 520,
    status: 'contacted',
    notes: 'Called — waiting on property inspection schedule',
  },
  {
    id: 'lead-4',
    name: 'Robert Williams',
    email: 'rob@example.com',
    phone: '(608) 555-0321',
    services: ['Deck Cleaning'],
    package: 'Standard',
    date: '2026-03-19',
    source: 'Website',
    total: 275,
    status: 'new',
    notes: 'Submitted via quoting tool',
  },
  {
    id: 'lead-5',
    name: 'Lisa Park',
    email: 'lisa@example.com',
    phone: '(608) 555-0654',
    services: ['House Washing', 'Gutter Cleaning'],
    package: 'Premium',
    date: '2026-03-18',
    source: 'Google',
    total: 680,
    status: 'lost',
    notes: 'Went with a cheaper competitor',
  },
]

const DEFAULT_CONFIG = {
  businessName: '',
  adminPassword: '',
  priceAdjustment: 0, // -30 to +50
  packages: {
    basic: { multiplier: 1, tagline: 'Best for single services' },
    standard: { multiplier: 1.35, tagline: 'Most popular choice' },
    premium: { multiplier: 1.75, tagline: 'Complete solution' },
  },
  bundleDiscounts: {
    twoServices: 10,
    threeServices: 15,
  },
  services: [
    {
      id: 'house_washing',
      name: 'House Washing',
      enabled: true,
      icon: 'Home',
      basePrice: 150,
      perSqFt: 0.15,
      perWindow: 0,
      perLinFt: 0,
      extras: [
        { label: 'Patio/Porch', price: 75 },
        { label: 'Detached Garage', price: 120 },
        { label: 'Aluminum Siding', price: 75 },
        { label: 'EIFS/Stucco/Wood', price: 100 },
      ],
    },
    {
      id: 'window_cleaning',
      name: 'Window Cleaning',
      enabled: true,
      icon: 'Eye',
      basePrice: 0,
      perSqFt: 0,
      perWindow: 8,
      perLinFt: 0,
      extras: [],
    },
    {
      id: 'deck_cleaning',
      name: 'Deck Cleaning',
      enabled: true,
      icon: 'Home',
      basePrice: 175,
      perSqFt: 0.25,
      perWindow: 0,
      perLinFt: 0,
      extras: [
        { label: 'Railing', price: 65 },
        { label: 'Stairs', price: 45 },
      ],
    },
    {
      id: 'concrete_cleaning',
      name: 'Concrete Cleaning',
      enabled: true,
      icon: 'Home',
      basePrice: 125,
      perSqFt: 0.12,
      perWindow: 0,
      perLinFt: 0,
      extras: [
        { label: 'Sealing', price: 200 },
        { label: 'Oil Stain', price: 50 },
        { label: 'Edging', price: 40 },
      ],
    },
    {
      id: 'roof_cleaning',
      name: 'Roof Cleaning',
      enabled: true,
      icon: 'Home',
      basePrice: 250,
      perSqFt: 0.18,
      perWindow: 0,
      perLinFt: 0,
      extras: [
        { label: 'Moss Treatment', price: 150 },
        { label: 'Chimney', price: 75 },
        { label: 'Solar Panels', price: 100 },
      ],
    },
    {
      id: 'gutter_cleaning',
      name: 'Gutter Cleaning',
      enabled: true,
      icon: 'Home',
      basePrice: 125,
      perSqFt: 0,
      perWindow: 0,
      perLinFt: 1.5,
      extras: [
        { label: 'Downspout Clearing', price: 65 },
        { label: 'Whitening', price: 120 },
      ],
    },
    {
      id: 'gutter_guard',
      name: 'Gutter Guard Install',
      enabled: true,
      icon: 'Home',
      basePrice: 0,
      perSqFt: 0,
      perWindow: 0,
      perLinFt: 14.99,
      extras: [
        { label: 'Basic', price: 14.99 },
        { label: 'With Cleaning', price: 19.99 },
        { label: 'Full Service', price: 24.99 },
      ],
    },
  ],
  bundles: [
    {
      id: 'spring-refresh',
      name: 'Spring Refresh Bundle',
      discount: 15,
      endDate: '2026-05-31',
      tagline: 'Get your home spring-ready',
      active: true,
      services: ['house_washing', 'window_cleaning', 'gutter_cleaning'],
    },
  ],
  marketing: {
    urgencyTimer: { enabled: false, message: 'Limited time offer expires soon!', endDate: '2026-04-30' },
    socialProof: { enabled: false, count: 500 },
    limitedOffer: { enabled: false, text: 'Book by March 31st and save 20%' },
    reviewBadge: { enabled: false, count: 200, rating: 4.8 },
  },
  followUp: [
    { id: 'fu-1', delay: 0, type: 'email', subject: 'Your Quote is Ready!', body: 'Hi {{name}},\n\nYour {{services}} quote is {{total}}.\n\nLook forward to helping {{business}}!', active: true },
    { id: 'fu-2', delay: 2, type: 'sms', subject: '', body: 'Hi {{name}}! Just checking in on your {{services}} quote. Reply with any questions!', active: true },
    { id: 'fu-3', delay: 5, type: 'email', subject: 'Ready to Book?', body: 'Hi {{name}},\n\nYour {{services}} project is waiting. Let\'s get started!\n\nTotal: {{total}}', active: true },
    { id: 'fu-4', delay: 14, type: 'email', subject: 'Last Chance!', body: 'Hi {{name}},\n\nThis offer won\'t last much longer. Book your {{services}} service today!', active: false },
  ],
  leadSources: ['Google', 'Facebook', 'Referral', 'Direct'],
  leadEmail: 'leads@example.com',
  web3formsKey: 'your-web3forms-key',
}

const DEMO_TENANTS = [
  {
    id: 'cloute-cleaning',
    businessName: 'Cloute Cleaning',
    email: 'tim.sullivan@clouteinc.com',
    plan: 'pro',
    config: { ...DEFAULT_CONFIG, businessName: 'Cloute Cleaning' },
  },
  {
    id: 'cornerstone-exterior',
    businessName: 'Cornerstone Exterior',
    email: 'noah@cornerstoneexterior.com',
    plan: 'growth',
    config: { ...DEFAULT_CONFIG, businessName: 'Cornerstone Exterior' },
  },
]

// ============================================================================
// HELPERS
// ============================================================================

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function updateNestedConfig(config, path, value) {
  const keys = path.split('.')
  const newConfig = deepClone(config)
  let current = newConfig
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
  return newConfig
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TenantDashboard() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true) // checking for existing session
  const [tenant, setTenant] = useState(null)
  const [config, setConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('leads')
  const [adminTab, setAdminTab] = useState('pricing')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [leadsFilter, setLeadsFilter] = useState('all')
  const [selectedQrSource, setSelectedQrSource] = useState('yard-sign')
  const [expandedLead, setExpandedLead] = useState(null)
  const [leads, setLeads] = useState(DEMO_LEADS)
  const [kanbanView, setKanbanView] = useState('board') // 'board' or 'list'
  const [draggedLead, setDraggedLead] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)
  // Billing state
  const [billing, setBilling] = useState(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [buyingPack, setBuyingPack] = useState(null)

  // ========================================================================
  // AUTH - Check for existing Supabase session on mount
  // ========================================================================

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user && !cancelled) {
          // User has an active auth session - load their tenant
          const myTenant = await getMyTenant()
          if (myTenant) {
            setTenant(myTenant)
            setConfig(myTenant.config || deepClone(DEFAULT_CONFIG))
            setIsLoggedIn(true)

            // Load leads
            const dbLeads = await getLeads(myTenant.id)
            if (dbLeads) setLeads(dbLeads)

            // Load billing (non-blocking)
            getBillingStatus(myTenant.id)
              .then(b => setBilling(b))
              .catch(() => setBilling(null))
          }
        }
      } catch (err) {
        console.warn('Auth check failed:', err)
      } finally {
        if (!cancelled) setAuthChecking(false)
      }
    }
    checkAuth()

    // Listen for auth changes (e.g., token refresh, logout from another tab)
    const unsub = onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setTenant(null)
        setConfig(null)
      }
    })

    return () => { cancelled = true; unsub() }
  }, [])

  // ========================================================================
  // LOGIN - fallback for demo tenants / email-only lookup
  // (For tenants that signed up before auth was added)
  // ========================================================================

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginError('')
    try {
      // Try Supabase / localStorage via the db layer
      let found = await getTenantByEmail(loginEmail)

      // If not found in DB, check hardcoded demo tenants
      if (!found) {
        found = DEMO_TENANTS.find(t => t.email?.toLowerCase() === loginEmail.toLowerCase())
      }

      if (found) {
        setTenant(found)
        setConfig(found.config || deepClone(DEFAULT_CONFIG))
        setIsLoggedIn(true)

        // Load leads from Supabase if available
        const dbLeads = await getLeads(found.id)
        if (dbLeads) setLeads(dbLeads)

        // Load billing status (non-blocking)
        getBillingStatus(found.id)
          .then(b => setBilling(b))
          .catch(() => setBilling(null))
      } else {
        setLoginError('No account found with that email. Try logging in at')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('Something went wrong. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await signOut() } catch (e) { console.warn('Signout error:', e) }
    setIsLoggedIn(false)
    setTenant(null)
    setConfig(null)
    setLoginEmail('')
  }

  // ========================================================================
  // CONFIG MANAGEMENT
  // ========================================================================

  const updateConfig = (path, value) => {
    const newConfig = updateNestedConfig(config, path, value)
    setConfig(newConfig)
    setSaved(false)
  }

  const handleSave = async () => {
    if (tenant && config) {
      setSaving(true)
      try {
        await updateTenantConfig(tenant.id, config)
        const updated = { ...tenant, config }
        setTenant(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        console.error('Save error:', err)
        alert('Failed to save. Please try again.')
      } finally {
        setSaving(false)
      }
    }
  }

  // ========================================================================
  // LEADS MANAGEMENT
  // ========================================================================

  const filteredLeads = leadsFilter === 'all' ? leads : leads.filter(l => l.status === leadsFilter)

  const handleLeadStatus = async (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    try {
      await updateLeadStatus(leadId, newStatus)
    } catch (err) {
      console.error('Lead status update error:', err)
    }
  }

  // Kanban drag-and-drop handlers
  const handleDragStart = useCallback((e, lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    // Make the drag ghost slightly transparent
    setTimeout(() => { e.target.style.opacity = '0.5' }, 0)
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1'
    setDraggedLead(null)
    setDragOverStage(null)
  }, [])

  const handleDragOver = useCallback((e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null)
  }, [])

  const handleDrop = useCallback((e, stageId) => {
    e.preventDefault()
    setDragOverStage(null)
    if (draggedLead && draggedLead.status !== stageId) {
      handleLeadStatus(draggedLead.id, stageId)
    }
    setDraggedLead(null)
  }, [draggedLead, handleLeadStatus])

  const totalRevenue = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (Number(l.total) || 0), 0)
  const leadsPerStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.status === stage.id)
    return acc
  }, {})

  // ========================================================================
  // AUTH CHECKING (loading state while checking session)
  // ========================================================================

  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #e8f4ff, #f0f7ff)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b9cff' }} />
          <p style={{ color: '#7a9bbc', marginTop: 12, fontSize: 14 }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // ========================================================================
  // LOGIN SCREEN (fallback for pre-auth tenants)
  // ========================================================================

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 420, width: '100%', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/mybidquick-logo.svg" alt="MyBidQuick" style={{ height: 56, margin: '0 auto 16px', display: 'block' }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>Tenant Dashboard</h1>
            <p style={{ color: '#7a9bbc', fontSize: 15, marginTop: 4 }}>
              Admin panel for your quoting system
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            border: '1px solid #d4e4f7',
            boxShadow: '0 4px 16px rgba(59, 156, 255, 0.08)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8, color: '#1e3a5f' }}>
                <Mail size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@business.com"
                value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setLoginError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `2px solid ${loginError ? '#ef4444' : '#d4e4f7'}`,
                  fontSize: 15,
                  boxSizing: 'border-box',
                  color: '#1e3a5f',
                }}
              />
              {loginError && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{loginError}</p>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={!loginEmail || loginLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 10,
                background: (loginEmail && !loginLoading) ? '#3b9cff' : '#a78bfa',
                color: 'white',
                border: 'none',
                cursor: (loginEmail && !loginLoading) ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loginLoading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Logging in...</> : 'Log In'}
            </button>

            <div style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: '#f0f7ff',
              fontSize: 13,
              color: '#3b9cff',
              textAlign: 'center',
            }}>
              <span
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
              >
                Log in with password instead
              </span>
              <br />
              <span style={{ fontSize: 11, color: '#7a9bbc', marginTop: 4, display: 'inline-block' }}>
                New accounts use email + password login
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              margin: '24px auto',
              background: 'none',
              border: 'none',
              color: '#7a9bbc',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} /> Back to MyBidQuick
          </button>
        </div>
      </div>
    )
  }

  // ========================================================================
  // DASHBOARD
  // ========================================================================

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7ff' }}>
      {/* TOP BAR */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #d4e4f7',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3b9cff, #6dd19e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 16,
          }}>
            {tenant?.businessName?.charAt(0) || 'T'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f' }}>{tenant?.businessName}</div>
            <div style={{ fontSize: 12, color: '#4a6d94' }}>{tenant?.plan} Plan</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              background: saved ? '#6dd19e' : '#3b9cff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'background 0.3s',
            }}
          >
            {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'transparent',
              color: '#4a6d94',
              border: '1px solid #d4e4f7',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '32px auto', padding: '0 24px' }}>
        {/* MAIN TABS: Leads vs Admin */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          background: 'white',
          borderRadius: 12,
          padding: 4,
          border: '1px solid #d4e4f7',
        }}>
          <button
            onClick={() => setActiveTab('leads')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: activeTab === 'leads' ? '#3b9cff' : 'transparent',
              color: activeTab === 'leads' ? 'white' : '#4a6d94',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: activeTab === 'admin' ? '#3b9cff' : 'transparent',
              color: activeTab === 'admin' ? 'white' : '#4a6d94',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Admin
          </button>
          <button
            onClick={() => {
              setActiveTab('billing')
              if (tenant?.id && !billing) {
                setBillingLoading(true)
                getBillingStatus(tenant.id)
                  .then(b => setBilling(b))
                  .catch(() => setBilling(null))
                  .finally(() => setBillingLoading(false))
              }
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: activeTab === 'billing' ? '#3b9cff' : 'transparent',
              color: activeTab === 'billing' ? 'white' : '#4a6d94',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <CreditCard size={14} /> Billing
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              background: activeTab === 'analytics' ? '#3b9cff' : 'transparent',
              color: activeTab === 'analytics' ? 'white' : '#4a6d94',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <BarChart3 size={14} /> Analytics
          </button>
        </div>

        {/* LEADS TAB — KANBAN PIPELINE BOARD */}
        {activeTab === 'leads' && (
          <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {PIPELINE_STAGES.map(stage => {
                const count = leadsPerStage[stage.id]?.length || 0
                const value = stage.id === 'won'
                  ? `$${totalRevenue.toLocaleString()}`
                  : count
                return (
                  <div key={stage.id} style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #d4e4f7',
                    boxShadow: '0 2px 8px rgba(59, 156, 255, 0.08)',
                  }}>
                    <div style={{ fontSize: 12, color: '#7a9bbc', fontWeight: 600, marginBottom: 8 }}>
                      {stage.id === 'won' ? 'Revenue (Won)' : stage.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: stage.color }}>{value}</div>
                    {stage.id !== 'won' && (
                      <div style={{ fontSize: 11, color: '#7a9bbc', marginTop: 4 }}>{count} lead{count !== 1 ? 's' : ''}</div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* View Toggle: Board / List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1e3a5f' }}>
                Lead Pipeline
                <span style={{ fontSize: 13, fontWeight: 400, color: '#7a9bbc', marginLeft: 8 }}>{leads.length} total</span>
              </div>
              <div style={{ display: 'flex', gap: 4, background: '#f0f7ff', borderRadius: 8, padding: 2 }}>
                {['board', 'list'].map(v => (
                  <button key={v} onClick={() => setKanbanView(v)} style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: kanbanView === v ? '#3b9cff' : 'transparent',
                    color: kanbanView === v ? 'white' : '#4a6d94',
                    fontWeight: 600, fontSize: 12,
                  }}>
                    {v === 'board' ? 'Board' : 'List'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── KANBAN BOARD VIEW ── */}
            {kanbanView === 'board' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                minHeight: 400,
              }}>
                {PIPELINE_STAGES.map(stage => {
                  const stageLeads = leadsPerStage[stage.id] || []
                  const isOver = dragOverStage === stage.id
                  return (
                    <div
                      key={stage.id}
                      onDragOver={(e) => handleDragOver(e, stage.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage.id)}
                      style={{
                        background: isOver ? stage.bg : '#f8fbff',
                        borderRadius: 16,
                        border: `2px ${isOver ? 'dashed' : 'solid'} ${isOver ? stage.color : '#e2ecf5'}`,
                        padding: 12,
                        transition: 'all 0.2s ease',
                        minHeight: 300,
                      }}
                    >
                      {/* Column Header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 4px', marginBottom: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: stage.color,
                          }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f' }}>{stage.label}</span>
                        </div>
                        <span style={{
                          background: stage.bg, color: stage.color,
                          padding: '2px 8px', borderRadius: 10,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {stageLeads.length}
                        </span>
                      </div>

                      {/* Lead Cards in Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {stageLeads.map(lead => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                            style={{
                              background: 'white',
                              borderRadius: 12,
                              border: '1px solid #e2ecf5',
                              padding: 12,
                              cursor: 'grab',
                              boxShadow: draggedLead?.id === lead.id
                                ? '0 8px 24px rgba(59, 156, 255, 0.2)'
                                : '0 1px 4px rgba(59, 156, 255, 0.06)',
                              transition: 'box-shadow 0.2s, transform 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                              <GripVertical size={14} color="#c0d0e0" style={{ marginTop: 2, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f', marginBottom: 4 }}>
                                  {lead.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#7a9bbc' }}>
                                  {lead.email}
                                </div>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#3b9cff', whiteSpace: 'nowrap' }}>
                                ${lead.total}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                              {lead.services.map(s => (
                                <span key={s} style={{
                                  padding: '2px 6px', borderRadius: 6,
                                  background: '#f0f7ff', color: '#3b9cff',
                                  fontSize: 10, fontWeight: 600,
                                }}>
                                  {s}
                                </span>
                              ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: 10, color: '#a0b5cc' }}>
                                {lead.package} · {lead.date}
                              </div>
                              <div style={{ fontSize: 10, color: '#a0b5cc' }}>
                                {lead.source}
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedLead === lead.id && (
                              <div style={{
                                marginTop: 10, paddingTop: 10,
                                borderTop: '1px solid #e2ecf5',
                              }}>
                                <div style={{ fontSize: 11, color: '#7a9bbc', marginBottom: 4 }}>
                                  <Phone size={10} style={{ marginRight: 4, verticalAlign: -1 }} />{lead.phone}
                                </div>
                                {lead.notes && (
                                  <div style={{ fontSize: 11, color: '#4a6d94', marginBottom: 8, fontStyle: 'italic' }}>
                                    {lead.notes}
                                  </div>
                                )}
                                {/* Quick-move buttons */}
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {PIPELINE_STAGES.filter(s => s.id !== lead.status).map(s => (
                                    <button
                                      key={s.id}
                                      onClick={(e) => { e.stopPropagation(); handleLeadStatus(lead.id, s.id) }}
                                      style={{
                                        padding: '4px 8px', borderRadius: 6,
                                        background: s.bg, color: s.color,
                                        border: `1px solid ${s.color}30`,
                                        cursor: 'pointer', fontWeight: 600, fontSize: 10,
                                      }}
                                    >
                                      → {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {stageLeads.length === 0 && (
                          <div style={{
                            padding: 24, textAlign: 'center',
                            color: '#b0c4d8', fontSize: 12,
                            border: '2px dashed #e2ecf5', borderRadius: 12,
                          }}>
                            Drag leads here
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── LIST VIEW (classic) ── */}
            {kanbanView === 'list' && (
              <div>
                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {['all', ...PIPELINE_STAGES.map(s => s.id)].map(f => (
                    <button
                      key={f}
                      onClick={() => setLeadsFilter(f)}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: leadsFilter === f ? '#3b9cff' : 'transparent',
                        color: leadsFilter === f ? 'white' : '#4a6d94',
                        border: `1px solid ${leadsFilter === f ? '#3b9cff' : '#d4e4f7'}`,
                        cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Lead Cards - List Style */}
                <div style={{ display: 'grid', gap: 12 }}>
                  {filteredLeads.map(lead => {
                    const stage = PIPELINE_STAGES.find(s => s.id === lead.status) || PIPELINE_STAGES[0]
                    return (
                      <div key={lead.id} style={{
                        background: 'white', borderRadius: 16,
                        border: '1px solid #d4e4f7',
                        boxShadow: '0 2px 8px rgba(59, 156, 255, 0.08)',
                      }}>
                        <div
                          onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                          style={{ padding: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f' }}>{lead.name}</div>
                              <span style={{
                                padding: '4px 12px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700,
                                background: stage.bg, color: stage.color,
                              }}>
                                {stage.label.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#7a9bbc', marginBottom: 8 }}>
                              <span><Mail size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{lead.email}</span>
                              <span><Phone size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{lead.phone}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                              {lead.services.map(s => (
                                <span key={s} style={{
                                  padding: '3px 10px', borderRadius: 12,
                                  background: '#f0f7ff', color: '#3b9cff',
                                  fontSize: 12, fontWeight: 600,
                                }}>{s}</span>
                              ))}
                            </div>
                            <div style={{ fontSize: 12, color: '#4a6d94', display: 'flex', gap: 16 }}>
                              <span>{lead.package} {'\u2022'} {lead.date}</span>
                              <span>Source: {lead.source}</span>
                              <span style={{ fontWeight: 700, color: '#3b9cff' }}>${lead.total}</span>
                            </div>
                          </div>
                          <ChevronDown size={20} color="#7a9bbc" style={{
                            transform: expandedLead === lead.id ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s', marginLeft: 16,
                          }} />
                        </div>

                        {expandedLead === lead.id && (
                          <div style={{ borderTop: '1px solid #d4e4f7', padding: 24, background: '#f8fbff' }}>
                            {lead.notes && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1e3a5f', marginBottom: 8 }}>Notes</div>
                                <p style={{ color: '#4a6d94', fontSize: 13 }}>{lead.notes}</p>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                              {PIPELINE_STAGES.filter(s => s.id !== lead.status).map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => handleLeadStatus(lead.id, s.id)}
                                  style={{
                                    padding: '8px 16px', borderRadius: 8,
                                    background: s.color, color: 'white',
                                    border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 13,
                                  }}
                                >
                                  Move to {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <div>
            {/* Admin Sub-tabs */}
            <div style={{
              display: 'flex',
              gap: 4,
              marginBottom: 24,
              background: 'white',
              borderRadius: 12,
              padding: 4,
              border: '1px solid #d4e4f7',
              overflowX: 'auto',
            }}>
              {['pricing', 'services', 'bundles', 'marketing', 'followup', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: adminTab === tab ? '#3b9cff' : 'transparent',
                    color: adminTab === tab ? 'white' : '#4a6d94',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* PRICING TAB */}
            {adminTab === 'pricing' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
                boxShadow: '0 2px 8px rgba(59, 156, 255, 0.08)',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Pricing Settings</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>Control global pricing adjustments and package multipliers.</p>

                {/* Global Price Adjustment */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12, color: '#1e3a5f' }}>
                    <DollarSign size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Global Price Adjustment
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input
                      type="range"
                      min="-30"
                      max="50"
                      step="5"
                      value={config.priceAdjustment}
                      onChange={e => updateConfig('priceAdjustment', Number(e.target.value))}
                      style={{ flex: 1, cursor: 'pointer' }}
                    />
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: config.priceAdjustment < 0 ? '#ffcccc' : '#ccffcc',
                      color: config.priceAdjustment < 0 ? '#cc0000' : '#00cc00',
                      fontWeight: 700,
                      fontSize: 16,
                      minWidth: 80,
                      textAlign: 'center',
                    }}>
                      {config.priceAdjustment > 0 ? '+' : ''}{config.priceAdjustment}%
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#7a9bbc', marginTop: 8 }}>Applies a global multiplier to all service pricing</p>
                </div>

                {/* Package Multipliers */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 16, color: '#1e3a5f' }}>Package Multipliers</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {['basic', 'standard', 'premium'].map((pkg, i) => {
                      const multipliers = [1, 1.35, 1.75]
                      return (
                        <div key={pkg} style={{
                          border: '1px solid #d4e4f7',
                          borderRadius: 12,
                          padding: 16,
                          background: '#f8fbff',
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f', marginBottom: 8 }}>
                            {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#3b9cff', marginBottom: 12 }}>
                            {config.packages[pkg].multiplier}x
                          </div>
                          <input
                            type="number"
                            value={config.packages[pkg].multiplier}
                            onChange={e => updateConfig(`packages.${pkg}.multiplier`, parseFloat(e.target.value))}
                            step="0.05"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              marginBottom: 12,
                              fontSize: 13,
                            }}
                          />
                          <input
                            type="text"
                            value={config.packages[pkg].tagline}
                            onChange={e => updateConfig(`packages.${pkg}.tagline`, e.target.value)}
                            placeholder="Tagline"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              fontSize: 12,
                              color: '#4a6d94',
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bundle Discounts */}
                <div style={{ marginTop: 32 }}>
                  <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 16, color: '#1e3a5f' }}>Bundle Discounts</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>2 Services Discount %</label>
                      <input
                        type="number"
                        value={config.bundleDiscounts.twoServices}
                        onChange={e => updateConfig('bundleDiscounts.twoServices', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>3+ Services Discount %</label>
                      <input
                        type="number"
                        value={config.bundleDiscounts.threeServices}
                        onChange={e => updateConfig('bundleDiscounts.threeServices', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES TAB */}
            {adminTab === 'services' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Services</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>Configure individual services and pricing tiers.</p>

                {config.services.map((svc, idx) => (
                  <div key={svc.id} style={{
                    marginBottom: 24,
                    padding: 20,
                    border: '1px solid #d4e4f7',
                    borderRadius: 12,
                    background: svc.enabled ? 'white' : '#f8fbff',
                    opacity: svc.enabled ? 1 : 0.6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div
                        onClick={() => updateConfig(`services.${idx}.enabled`, !svc.enabled)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: svc.enabled ? '#6dd19e' : '#cbd5e1',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: svc.enabled ? 22 : 2,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={svc.name}
                          onChange={e => updateConfig(`services.${idx}.name`, e.target.value)}
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            border: 'none',
                            background: 'transparent',
                            color: '#1e3a5f',
                            width: '100%',
                            padding: 0,
                          }}
                        />
                      </div>
                    </div>

                    {svc.enabled && (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                          <div>
                            <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Base Price</label>
                            <input
                              type="number"
                              value={svc.basePrice}
                              onChange={e => updateConfig(`services.${idx}.basePrice`, parseFloat(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d4e4f7',
                                borderRadius: 8,
                                fontSize: 13,
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Per Sq Ft</label>
                            <input
                              type="number"
                              value={svc.perSqFt}
                              onChange={e => updateConfig(`services.${idx}.perSqFt`, parseFloat(e.target.value))}
                              step="0.01"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d4e4f7',
                                borderRadius: 8,
                                fontSize: 13,
                              }}
                            />
                          </div>
                          {svc.perWindow > 0 && (
                            <div>
                              <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Per Window</label>
                              <input
                                type="number"
                                value={svc.perWindow}
                                onChange={e => updateConfig(`services.${idx}.perWindow`, parseFloat(e.target.value))}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #d4e4f7',
                                  borderRadius: 8,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                          )}
                          {svc.perLinFt > 0 && (
                            <div>
                              <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Per Linear Ft</label>
                              <input
                                type="number"
                                value={svc.perLinFt}
                                onChange={e => updateConfig(`services.${idx}.perLinFt`, parseFloat(e.target.value))}
                                step="0.01"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #d4e4f7',
                                  borderRadius: 8,
                                  fontSize: 13,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {svc.extras && svc.extras.length > 0 && (
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f', display: 'block', marginBottom: 8 }}>Add-ons</label>
                            {svc.extras.map((extra, eidx) => (
                              <div key={eidx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                  type="text"
                                  value={extra.label}
                                  onChange={e => updateConfig(`services.${idx}.extras.${eidx}.label`, e.target.value)}
                                  placeholder="Label"
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #d4e4f7',
                                    borderRadius: 8,
                                    fontSize: 12,
                                  }}
                                />
                                <input
                                  type="number"
                                  value={extra.price}
                                  onChange={e => updateConfig(`services.${idx}.extras.${eidx}.price`, parseFloat(e.target.value))}
                                  placeholder="Price"
                                  style={{
                                    width: 100,
                                    padding: '8px 12px',
                                    border: '1px solid #d4e4f7',
                                    borderRadius: 8,
                                    fontSize: 12,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* BUNDLES TAB */}
            {adminTab === 'bundles' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Bundles</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>Create seasonal or promotional service bundles.</p>

                {config.bundles.map((bundle, bidx) => (
                  <div key={bundle.id} style={{
                    marginBottom: 20,
                    padding: 20,
                    border: '1px solid #d4e4f7',
                    borderRadius: 12,
                    background: bundle.active ? 'white' : '#f8fbff',
                    opacity: bundle.active ? 1 : 0.6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div
                        onClick={() => updateConfig(`bundles.${bidx}.active`, !bundle.active)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: bundle.active ? '#6dd19e' : '#cbd5e1',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: bundle.active ? 22 : 2,
                          transition: 'left 0.2s',
                        }} />
                      </div>
                      <input
                        type="text"
                        value={bundle.name}
                        onChange={e => updateConfig(`bundles.${bidx}.name`, e.target.value)}
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          fontSize: 15,
                          border: 'none',
                          background: 'transparent',
                          color: '#1e3a5f',
                          padding: 0,
                        }}
                      />
                    </div>

                    {bundle.active && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Discount %</label>
                          <input
                            type="number"
                            value={bundle.discount}
                            onChange={e => updateConfig(`bundles.${bidx}.discount`, parseInt(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              fontSize: 13,
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>End Date</label>
                          <input
                            type="date"
                            value={bundle.endDate}
                            onChange={e => updateConfig(`bundles.${bidx}.endDate`, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              fontSize: 13,
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Tagline</label>
                          <input
                            type="text"
                            value={bundle.tagline}
                            onChange={e => updateConfig(`bundles.${bidx}.tagline`, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              fontSize: 13,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f', display: 'block', marginBottom: 8 }}>Services</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {config.services.map(svc => (
                          <button
                            key={svc.id}
                            onClick={() => {
                              const included = bundle.services.includes(svc.id)
                              const newServices = included
                                ? bundle.services.filter(s => s !== svc.id)
                                : [...bundle.services, svc.id]
                              updateConfig(`bundles.${bidx}.services`, newServices)
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: bundle.services.includes(svc.id) ? '#3b9cff' : '#d4e4f7',
                              color: bundle.services.includes(svc.id) ? 'white' : '#4a6d94',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            {svc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newBundles = [...config.bundles, {
                      id: `bundle-${Date.now()}`,
                      name: 'New Bundle',
                      discount: 10,
                      endDate: '2026-06-30',
                      tagline: 'Special offer',
                      active: true,
                      services: [],
                    }]
                    updateConfig('bundles', newBundles)
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: '#3b9cff',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Plus size={16} /> Add Bundle
                </button>
              </div>
            )}

            {/* MARKETING TAB */}
            {adminTab === 'marketing' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Marketing</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>Control marketing elements on your quoting pages.</p>

                {/* Urgency Timer */}
                <div style={{ marginBottom: 24, padding: 20, border: '1px solid #d4e4f7', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      onClick={() => updateConfig('marketing.urgencyTimer.enabled', !config.marketing.urgencyTimer.enabled)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: config.marketing.urgencyTimer.enabled ? '#6dd19e' : '#cbd5e1',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 2,
                        left: config.marketing.urgencyTimer.enabled ? 22 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    <label style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
                      <Clock size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                      Urgency Timer
                    </label>
                  </div>
                  {config.marketing.urgencyTimer.enabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input
                        type="text"
                        value={config.marketing.urgencyTimer.message}
                        onChange={e => updateConfig('marketing.urgencyTimer.message', e.target.value)}
                        placeholder="Timer message"
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <input
                        type="date"
                        value={config.marketing.urgencyTimer.endDate}
                        onChange={e => updateConfig('marketing.urgencyTimer.endDate', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Social Proof */}
                <div style={{ marginBottom: 24, padding: 20, border: '1px solid #d4e4f7', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      onClick={() => updateConfig('marketing.socialProof.enabled', !config.marketing.socialProof.enabled)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: config.marketing.socialProof.enabled ? '#6dd19e' : '#cbd5e1',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 2,
                        left: config.marketing.socialProof.enabled ? 22 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    <label style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
                      <Heart size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                      Social Proof
                    </label>
                  </div>
                  {config.marketing.socialProof.enabled && (
                    <div>
                      <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Customer Count</label>
                      <input
                        type="number"
                        value={config.marketing.socialProof.count}
                        onChange={e => updateConfig('marketing.socialProof.count', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Limited-Time Offer */}
                <div style={{ marginBottom: 24, padding: 20, border: '1px solid #d4e4f7', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      onClick={() => updateConfig('marketing.limitedOffer.enabled', !config.marketing.limitedOffer.enabled)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: config.marketing.limitedOffer.enabled ? '#6dd19e' : '#cbd5e1',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 2,
                        left: config.marketing.limitedOffer.enabled ? 22 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    <label style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>Limited-Time Offer</label>
                  </div>
                  {config.marketing.limitedOffer.enabled && (
                    <textarea
                      value={config.marketing.limitedOffer.text}
                      onChange={e => updateConfig('marketing.limitedOffer.text', e.target.value)}
                      placeholder="Offer text"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d4e4f7',
                        borderRadius: 8,
                        fontSize: 13,
                        minHeight: 60,
                        fontFamily: 'inherit',
                      }}
                    />
                  )}
                </div>

                {/* Review Badge */}
                <div style={{ padding: 20, border: '1px solid #d4e4f7', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      onClick={() => updateConfig('marketing.reviewBadge.enabled', !config.marketing.reviewBadge.enabled)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: config.marketing.reviewBadge.enabled ? '#6dd19e' : '#cbd5e1',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 2,
                        left: config.marketing.reviewBadge.enabled ? 22 : 2,
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    <label style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>Review Badge</label>
                  </div>
                  {config.marketing.reviewBadge.enabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Review Count</label>
                        <input
                          type="number"
                          value={config.marketing.reviewBadge.count}
                          onChange={e => updateConfig('marketing.reviewBadge.count', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d4e4f7',
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Rating</label>
                        <input
                          type="number"
                          value={config.marketing.reviewBadge.rating}
                          onChange={e => updateConfig('marketing.reviewBadge.rating', parseFloat(e.target.value))}
                          step="0.1"
                          min="0"
                          max="5"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d4e4f7',
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code Generator */}
                <div style={{ padding: 20, border: '1px solid #d4e4f7', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b9cff, #6dd19e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>&#9638;</span>
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: 15, color: '#1e3a5f', display: 'block' }}>QR Code Generator</label>
                      <span style={{ fontSize: 12, color: '#7a9bbc' }}>For yard signs, flyers, door hangers & truck wraps</span>
                    </div>
                  </div>

                  {(() => {
                    const tenantSlug = tenant?.slug || tenant?.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'demo'
                    const quoteUrl = `https://${tenantSlug}.mybidquick.com#quote`
                    const utmBase = `${quoteUrl}?utm_source=`
                    const sources = [
                      { id: 'yard-sign', label: 'Yard Sign', utm: `${utmBase}yard_sign&utm_medium=qr&utm_campaign=offline` },
                      { id: 'flyer', label: 'Flyer / Door Hanger', utm: `${utmBase}flyer&utm_medium=qr&utm_campaign=offline` },
                      { id: 'truck', label: 'Truck Wrap', utm: `${utmBase}truck_wrap&utm_medium=qr&utm_campaign=offline` },
                      { id: 'business-card', label: 'Business Card', utm: `${utmBase}business_card&utm_medium=qr&utm_campaign=offline` },
                    ]
                    const selected = sources.find(s => s.id === selectedQrSource) || sources[0]
                    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(selected.utm)}`

                    const handleDownload = async (format) => {
                      try {
                        const size = format === 'svg' ? '300x300' : '600x600'
                        const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&format=${format}&data=${encodeURIComponent(selected.utm)}`
                        const resp = await fetch(downloadUrl)
                        const blob = await resp.blob()
                        const a = document.createElement('a')
                        a.href = URL.createObjectURL(blob)
                        a.download = `mybidquick-qr-${tenantSlug}-${selected.id}.${format}`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(a.href)
                      } catch (err) {
                        console.error('QR download error:', err)
                      }
                    }

                    return (
                      <div>
                        {/* Source selector */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                          {sources.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedQrSource(s.id)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: selectedQrSource === s.id ? '2px solid #3b9cff' : '1px solid #d4e4f7',
                                background: selectedQrSource === s.id ? '#eef6ff' : 'white',
                                color: selectedQrSource === s.id ? '#3b9cff' : '#4a6d94',
                                fontWeight: 600,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        {/* QR Preview + Download */}
                        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 180, height: 180, border: '2px solid #d4e4f7', borderRadius: 12, overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img
                                src={qrApiUrl}
                                alt={`QR code for ${selected.label}`}
                                style={{ width: 160, height: 160 }}
                              />
                            </div>
                            <div style={{ marginTop: 10, fontSize: 11, color: '#7a9bbc', fontWeight: 600 }}>{selected.label}</div>
                          </div>

                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 4 }}>Links to:</label>
                              <div style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600, wordBreak: 'break-all', background: '#f0f6ff', padding: '8px 12px', borderRadius: 8 }}>
                                {quoteUrl}
                              </div>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 4 }}>UTM tracking:</label>
                              <div style={{ fontSize: 11, color: '#4a6d94', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                {selected.utm.split('?')[1]}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                              <button
                                onClick={() => handleDownload('png')}
                                style={{
                                  padding: '10px 20px',
                                  borderRadius: 10,
                                  background: 'linear-gradient(135deg, #3b9cff, #6dd19e)',
                                  color: 'white',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: 13,
                                  cursor: 'pointer',
                                }}
                              >
                                Download PNG
                              </button>
                              <button
                                onClick={() => handleDownload('svg')}
                                style={{
                                  padding: '10px 20px',
                                  borderRadius: 10,
                                  background: 'white',
                                  color: '#3b9cff',
                                  border: '2px solid #3b9cff',
                                  fontWeight: 700,
                                  fontSize: 13,
                                  cursor: 'pointer',
                                }}
                              >
                                Download SVG
                              </button>
                            </div>
                            <p style={{ fontSize: 11, color: '#7a9bbc', marginTop: 8 }}>
                              PNG for print (600x600px). SVG for large format (scalable).
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* FOLLOW-UP TAB */}
            {adminTab === 'followup' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Follow-Up Sequences</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>{"Create email and SMS follow-ups. Template variables: {{name}}, {{business}}, {{total}}, {{services}}"}</p>

                {config.followUp.map((step, sidx) => (
                  <div key={step.id} style={{
                    marginBottom: 20,
                    padding: 20,
                    border: `2px solid ${step.type === 'email' ? '#3b9cff' : '#6dd19e'}`,
                    borderRadius: 12,
                    borderLeftWidth: 6,
                    background: step.active ? 'white' : '#f8fbff',
                    opacity: step.active ? 1 : 0.6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div
                        onClick={() => updateConfig(`followUp.${sidx}.active`, !step.active)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: step.active ? '#6dd19e' : '#cbd5e1',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: step.active ? 22 : 2,
                          transition: 'left 0.2s',
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#7a9bbc', fontWeight: 600 }}>{step.type.toUpperCase()} {'\u2022'} {step.delay} days</div>
                      </div>
                      <button
                        onClick={() => {
                          const newFollowUp = config.followUp.filter((_, i) => i !== sidx)
                          updateConfig('followUp', newFollowUp)
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: '#ffcccc',
                          color: '#cc0000',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {step.active && (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Delay (days)</label>
                            <input
                              type="number"
                              value={step.delay}
                              onChange={e => updateConfig(`followUp.${sidx}.delay`, parseInt(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d4e4f7',
                                borderRadius: 8,
                                fontSize: 13,
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Type</label>
                            <select
                              value={step.type}
                              onChange={e => updateConfig(`followUp.${sidx}.type`, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d4e4f7',
                                borderRadius: 8,
                                fontSize: 13,
                              }}
                            >
                              <option>email</option>
                              <option>sms</option>
                            </select>
                          </div>
                        </div>

                        {step.type === 'email' && (
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Subject</label>
                            <input
                              type="text"
                              value={step.subject}
                              onChange={e => updateConfig(`followUp.${sidx}.subject`, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d4e4f7',
                                borderRadius: 8,
                                fontSize: 13,
                              }}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ fontSize: 12, color: '#7a9bbc', display: 'block', marginBottom: 6 }}>Message Body</label>
                          <textarea
                            value={step.body}
                            onChange={e => updateConfig(`followUp.${sidx}.body`, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d4e4f7',
                              borderRadius: 8,
                              fontSize: 13,
                              minHeight: 80,
                              fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newFollowUp = [...config.followUp, {
                      id: `fu-${Date.now()}`,
                      delay: 7,
                      type: 'email',
                      subject: 'Follow-up',
                      body: 'Hi {{name}}, checking in on your quote.',
                      active: true,
                    }]
                    updateConfig('followUp', newFollowUp)
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: '#3b9cff',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Plus size={16} /> Add Step
                </button>
              </div>
            )}

            {/* SETTINGS TAB */}
            {adminTab === 'settings' && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #d4e4f7',
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#1e3a5f' }}>Settings</h2>
                <p style={{ color: '#7a9bbc', fontSize: 14, marginBottom: 24 }}>Business configuration and notifications.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6, color: '#1e3a5f' }}>
                      <Home size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={config.businessName}
                      onChange={e => updateConfig('businessName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #d4e4f7',
                        borderRadius: 10,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6, color: '#1e3a5f' }}>Admin Password</label>
                    <input
                      type="password"
                      value={config.adminPassword}
                      onChange={e => updateConfig('adminPassword', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #d4e4f7',
                        borderRadius: 10,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 10, color: '#1e3a5f' }}>Lead Sources</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {config.leadSources.map((source, sidx) => (
                        <div key={sidx} style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          background: '#f0f7ff',
                          color: '#3b9cff',
                          fontWeight: 600,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          {source}
                          <button
                            onClick={() => {
                              const newSources = config.leadSources.filter((_, i) => i !== sidx)
                              updateConfig('leadSources', newSources)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b9cff',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Add new source"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.target.value) {
                            const newSources = [...config.leadSources, e.target.value]
                            updateConfig('leadSources', newSources)
                            e.target.value = ''
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d4e4f7',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <button
                        onClick={e => {
                          const input = e.target.parentElement.querySelector('input')
                          if (input.value) {
                            const newSources = [...config.leadSources, input.value]
                            updateConfig('leadSources', newSources)
                            input.value = ''
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: '#3b9cff',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6, color: '#1e3a5f' }}>
                      <Mail size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
                      Lead Notification Email
                    </label>
                    <input
                      type="email"
                      value={config.leadEmail}
                      onChange={e => updateConfig('leadEmail', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #d4e4f7',
                        borderRadius: 10,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6, color: '#1e3a5f' }}>Web3Forms API Key</label>
                    <input
                      type="text"
                      value={config.web3formsKey}
                      onChange={e => updateConfig('web3formsKey', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #d4e4f7',
                        borderRadius: 10,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 10, color: '#1e3a5f' }}>Export Config</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(config, null, 2))
                      alert('Config copied to clipboard!')
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      background: '#3b9cff',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Check size={14} /> Copy Config JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* BILLING TAB                                                       */}
        {/* ================================================================ */}
        {activeTab === 'billing' && (
          <div>
            {/* Credits Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f, #3b9cff)',
              borderRadius: 16,
              padding: 32,
              color: 'white',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>Lead Credits Remaining</div>
                <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                  {billingLoading ? '...' : (billing?.credits ?? '-')}
                </div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
                  Each lead from your quote form uses 1 credit
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {billing?.hasStripeCustomer && (
                  <button
                    onClick={async () => {
                      try {
                        const url = await openCustomerPortal(tenant.id)
                        window.open(url, '_blank')
                      } catch (e) { alert(e.message) }
                    }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ExternalLink size={14} /> Manage Billing
                  </button>
                )}
              </div>
            </div>

            {/* Credit Warning */}
            {billing && billing.credits <= 3 && billing.credits > 0 && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <AlertCircle size={20} color="#ea580c" />
                <div>
                  <div style={{ fontWeight: 600, color: '#9a3412', fontSize: 14 }}>Low credits!</div>
                  <div style={{ fontSize: 13, color: '#c2410c' }}>
                    You have {billing.credits} lead{billing.credits !== 1 ? 's' : ''} remaining. Buy more below to keep receiving leads.
                  </div>
                </div>
              </div>
            )}
            {billing && billing.credits === 0 && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <AlertCircle size={20} color="#dc2626" />
                <div>
                  <div style={{ fontWeight: 600, color: '#991b1b', fontSize: 14 }}>No credits remaining!</div>
                  <div style={{ fontSize: 13, color: '#b91c1c' }}>
                    New leads will not be delivered until you purchase more credits.
                  </div>
                </div>
              </div>
            )}

            {/* Launch Customer Banner */}
            {billing?.isLaunchCustomer && (
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                border: '1px solid #6ee7b7',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <Gift size={24} color="#059669" />
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: 15 }}>Launch Customer - $1/Lead for Life!</div>
                  <div style={{ fontSize: 13, color: '#047857' }}>
                    You're one of our first 20 customers. Your LAUNCH20 discount is locked in permanently.
                  </div>
                </div>
              </div>
            )}

            {/* Lead Credit Packs */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
                Buy Lead Credits
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {getPacksForTenant(billing?.isLaunchCustomer).map(pack => (
                  <div key={pack.id} style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 24,
                    border: pack.popular ? '2px solid #3b9cff' : '1px solid #d4e4f7',
                    boxShadow: pack.popular ? '0 4px 20px rgba(59, 156, 255, 0.15)' : '0 2px 8px rgba(59, 156, 255, 0.08)',
                    position: 'relative',
                    textAlign: 'center',
                  }}>
                    {pack.popular && (
                      <div style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#3b9cff',
                        color: 'white',
                        padding: '3px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        BEST VALUE
                      </div>
                    )}
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#1e3a5f', marginBottom: 4 }}>
                      {pack.credits}
                    </div>
                    <div style={{ fontSize: 13, color: '#7a9bbc', marginBottom: 12 }}>lead credits</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>
                      {billing?.isLaunchCustomer && (
                        <span style={{ fontSize: 16, color: '#a0b4c8', textDecoration: 'line-through', marginRight: 6 }}>
                          ${LEAD_PACKS.find(p => p.id === pack.id)?.price}
                        </span>
                      )}
                      ${pack.price}
                    </div>
                    <div style={{ fontSize: 12, color: billing?.isLaunchCustomer ? '#059669' : '#a0b4c8', fontWeight: billing?.isLaunchCustomer ? 700 : 400, marginBottom: 16 }}>
                      ${pack.pricePerLead.toFixed(2)} per lead
                    </div>
                    <button
                      disabled={buyingPack === pack.id}
                      onClick={async () => {
                        setBuyingPack(pack.id)
                        try {
                          const url = await buyLeadCredits(tenant.id, pack.id)
                          window.location.href = url
                        } catch (e) {
                          alert('Error: ' + e.message)
                          setBuyingPack(null)
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: pack.popular ? '#3b9cff' : '#e8f1fb',
                        color: pack.popular ? 'white' : '#1e3a5f',
                        border: 'none',
                        cursor: buyingPack === pack.id ? 'wait' : 'pointer',
                        fontWeight: 700,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        opacity: buyingPack === pack.id ? 0.6 : 1,
                      }}
                    >
                      {buyingPack === pack.id ? (
                        <><Loader size={14} className="spin" /> Processing...</>
                      ) : (
                        <><ShoppingCart size={14} /> Buy {pack.label}</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div style={{
              background: '#f0f7ff',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
                How Per-Lead Billing Works
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { icon: <Gift size={20} color="#3b9cff" />, title: '3 Free Leads', desc: 'Every new account starts with 3 free lead credits to try it out.' },
                  { icon: <ShoppingCart size={20} color="#3b9cff" />, title: 'Buy Packs', desc: 'Purchase lead credit packs above. The more you buy, the cheaper per lead.' },
                  { icon: <Zap size={20} color="#3b9cff" />, title: 'Auto-Deduct', desc: 'Each time a customer submits a quote through your form, 1 credit is used.' },
                  { icon: <CreditCard size={20} color="#3b9cff" />, title: 'Manage Billing', desc: 'View invoices, update payment methods, and track spending in the portal.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'white', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#5a7d9e', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase History */}
            {billing?.purchases?.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
                  Purchase History
                </h3>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #d4e4f7', overflow: 'hidden' }}>
                  {billing.purchases.map((p, i) => (
                    <div key={p.id || i} style={{
                      padding: '14px 20px',
                      borderBottom: i < billing.purchases.length - 1 ? '1px solid #e8f1fb' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
                          +{p.credits_purchased} Lead Credits
                        </div>
                        <div style={{ fontSize: 12, color: '#7a9bbc' }}>
                          {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, color: '#1e3a5f' }}>
                          ${(p.amount_cents / 100).toFixed(2)}
                        </span>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: p.status === 'completed' ? '#dcfce7' : '#fef3c7',
                          color: p.status === 'completed' ? '#166534' : '#92400e',
                        }}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* ANALYTICS TAB                                                    */}
        {/* ================================================================ */}
        {activeTab === 'analytics' && (() => {
          // Compute analytics from leads data
          const now = new Date()
          const wonLeads = leads.filter(l => l.status === 'won')
          const totalQuotes = leads.length
          const totalRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.total) || 0), 0)
          const avgTicket = wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0
          const conversionRate = totalQuotes > 0 ? ((wonLeads.length / totalQuotes) * 100) : 0

          // Quote volume by month (last 6 months)
          const monthlyData = []
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            const count = leads.filter(l => {
              const ld = new Date(l.created_at || l.date)
              return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth()
            }).length
            const rev = leads.filter(l => {
              const ld = new Date(l.created_at || l.date)
              return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth() && l.status === 'won'
            }).reduce((s, l) => s + (Number(l.total) || 0), 0)
            monthlyData.push({ key: monthKey, label: monthLabel, count, revenue: rev })
          }
          const maxMonthCount = Math.max(...monthlyData.map(m => m.count), 1)
          const maxMonthRev = Math.max(...monthlyData.map(m => m.revenue), 1)

          // Lead sources breakdown
          const sourceMap = {}
          leads.forEach(l => {
            const src = l.source || 'Unknown'
            sourceMap[src] = (sourceMap[src] || 0) + 1
          })
          const sources = Object.entries(sourceMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count, pct: totalQuotes > 0 ? ((count / totalQuotes) * 100) : 0 }))
          const sourceColors = ['#3b9cff', '#6dd19e', '#ffa500', '#a78bfa', '#f87171', '#38bdf8', '#fb923c']

          // Revenue by service
          const serviceRevMap = {}
          const serviceCountMap = {}
          wonLeads.forEach(l => {
            const svcs = Array.isArray(l.services) ? l.services : []
            const perService = svcs.length > 0 ? (Number(l.total) || 0) / svcs.length : 0
            svcs.forEach(s => {
              const name = typeof s === 'string' ? s : (s.name || 'Other')
              serviceRevMap[name] = (serviceRevMap[name] || 0) + perService
              serviceCountMap[name] = (serviceCountMap[name] || 0) + 1
            })
          })
          // Also count services from all leads for popularity
          const allServiceCount = {}
          leads.forEach(l => {
            const svcs = Array.isArray(l.services) ? l.services : []
            svcs.forEach(s => {
              const name = typeof s === 'string' ? s : (s.name || 'Other')
              allServiceCount[name] = (allServiceCount[name] || 0) + 1
            })
          })
          const topServices = Object.entries(allServiceCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
          const maxServiceCount = topServices.length > 0 ? topServices[0][1] : 1
          const serviceRevEntries = Object.entries(serviceRevMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
          const maxServiceRev = serviceRevEntries.length > 0 ? serviceRevEntries[0][1] : 1

          // This week vs last week
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          const startOfLastWeek = new Date(startOfWeek)
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
          const thisWeekLeads = leads.filter(l => new Date(l.created_at || l.date) >= startOfWeek).length
          const lastWeekLeads = leads.filter(l => {
            const d = new Date(l.created_at || l.date)
            return d >= startOfLastWeek && d < startOfWeek
          }).length
          const weekTrend = lastWeekLeads > 0 ? (((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100) : (thisWeekLeads > 0 ? 100 : 0)

          const hasData = leads.length > 0

          return (
            <div>
              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Total Quotes', value: totalQuotes, icon: Users, color: '#3b9cff', sub: `${thisWeekLeads} this week` },
                  { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, icon: Target, color: '#6dd19e', sub: `${wonLeads.length} won of ${totalQuotes}` },
                  { label: 'Avg Ticket Size', value: `$${avgTicket.toFixed(0)}`, icon: TrendingUp, color: '#ffa500', sub: 'from won leads' },
                  { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#a78bfa', sub: `${weekTrend >= 0 ? '+' : ''}${weekTrend.toFixed(0)}% vs last week` },
                ].map((card, i) => (
                  <div key={i} style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: 20,
                    border: '1px solid #e2ecf5',
                    boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${card.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <card.icon size={18} color={card.color} />
                      </div>
                      <span style={{ fontSize: 12, color: '#7a9bbc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {card.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.1 }}>{card.value}</div>
                    <div style={{ fontSize: 12, color: '#7a9bbc', marginTop: 4 }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {!hasData && (
                <div style={{
                  background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
                  border: '1px solid #e2ecf5', marginBottom: 24,
                }}>
                  <BarChart3 size={48} color="#d4e4f7" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>No leads yet</div>
                  <div style={{ fontSize: 14, color: '#7a9bbc', maxWidth: 400, margin: '0 auto' }}>
                    Once customers start submitting quotes through your page, you will see volume trends, revenue breakdowns, and lead source analytics here.
                  </div>
                </div>
              )}

              {hasData && (
                <>
                  {/* Quote Volume Chart */}
                  <div style={{
                    background: 'white', borderRadius: 16, padding: 24,
                    border: '1px solid #e2ecf5', marginBottom: 24,
                    boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>Quote Volume</div>
                        <div style={{ fontSize: 12, color: '#7a9bbc' }}>Quotes received per month (last 6 months)</div>
                      </div>
                      <div style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: weekTrend >= 0 ? '#dcfce7' : '#fee2e2',
                        color: weekTrend >= 0 ? '#166534' : '#991b1b',
                      }}>
                        {weekTrend >= 0 ? '+' : ''}{weekTrend.toFixed(0)}% this week
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingBottom: 8 }}>
                      {monthlyData.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{m.count}</span>
                          <div style={{
                            width: '100%', maxWidth: 60,
                            height: `${Math.max((m.count / maxMonthCount) * 140, 4)}px`,
                            background: 'linear-gradient(180deg, #3b9cff, #6dd19e)',
                            borderRadius: '8px 8px 4px 4px',
                            transition: 'height 0.5s ease',
                          }} />
                          <span style={{ fontSize: 11, color: '#7a9bbc', fontWeight: 600 }}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue by Month Chart */}
                  <div style={{
                    background: 'white', borderRadius: 16, padding: 24,
                    border: '1px solid #e2ecf5', marginBottom: 24,
                    boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                  }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>Revenue Trend</div>
                      <div style={{ fontSize: 12, color: '#7a9bbc' }}>Revenue from won leads per month</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingBottom: 8 }}>
                      {monthlyData.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>
                            {m.revenue > 0 ? `$${m.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'}
                          </span>
                          <div style={{
                            width: '100%', maxWidth: 60,
                            height: `${Math.max((m.revenue / maxMonthRev) * 140, 4)}px`,
                            background: 'linear-gradient(180deg, #a78bfa, #6dd19e)',
                            borderRadius: '8px 8px 4px 4px',
                            transition: 'height 0.5s ease',
                          }} />
                          <span style={{ fontSize: 11, color: '#7a9bbc', fontWeight: 600 }}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Two Column: Lead Sources + Top Services */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    {/* Lead Sources */}
                    <div style={{
                      background: 'white', borderRadius: 16, padding: 24,
                      border: '1px solid #e2ecf5',
                      boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Lead Sources</div>
                      <div style={{ fontSize: 12, color: '#7a9bbc', marginBottom: 20 }}>Where your quotes come from</div>
                      {sources.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#7a9bbc', textAlign: 'center', padding: 20 }}>No source data yet</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {sources.map((src, i) => (
                            <div key={src.name}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: sourceColors[i % sourceColors.length],
                                  }} />
                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{src.name}</span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#3b9cff' }}>
                                  {src.count} ({src.pct.toFixed(0)}%)
                                </span>
                              </div>
                              <div style={{
                                height: 8, borderRadius: 4, background: '#f0f4f8', overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%', borderRadius: 4,
                                  width: `${src.pct}%`,
                                  background: sourceColors[i % sourceColors.length],
                                  transition: 'width 0.5s ease',
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Services */}
                    <div style={{
                      background: 'white', borderRadius: 16, padding: 24,
                      border: '1px solid #e2ecf5',
                      boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Top Services</div>
                      <div style={{ fontSize: 12, color: '#7a9bbc', marginBottom: 20 }}>Most requested services</div>
                      {topServices.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#7a9bbc', textAlign: 'center', padding: 20 }}>No service data yet</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {topServices.map(([name, count], i) => (
                            <div key={name}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{name}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#6dd19e' }}>
                                  {count} quote{count !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div style={{
                                height: 8, borderRadius: 4, background: '#f0f4f8', overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%', borderRadius: 4,
                                  width: `${(count / maxServiceCount) * 100}%`,
                                  background: 'linear-gradient(90deg, #3b9cff, #6dd19e)',
                                  transition: 'width 0.5s ease',
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue by Service */}
                  {serviceRevEntries.length > 0 && (
                    <div style={{
                      background: 'white', borderRadius: 16, padding: 24,
                      border: '1px solid #e2ecf5', marginBottom: 24,
                      boxShadow: '0 2px 8px rgba(59, 156, 255, 0.06)',
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Revenue by Service</div>
                      <div style={{ fontSize: 12, color: '#7a9bbc', marginBottom: 20 }}>Estimated revenue split across services (from won leads)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {serviceRevEntries.map(([name, rev], i) => (
                          <div key={name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{name}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>
                                ${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div style={{
                              height: 8, borderRadius: 4, background: '#f0f4f8', overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', borderRadius: 4,
                                width: `${(rev / maxServiceRev) * 100}%`,
                                background: 'linear-gradient(90deg, #a78bfa, #6dd19e)',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
