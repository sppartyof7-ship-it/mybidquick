import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, DollarSign, Settings, Mail, Phone, LogOut, Check, Plus, X,
  Eye, Trash2, AlertCircle, Clock, MessageSquare, Home, Zap, TrendingUp,
  ChevronDown, MapPin, Heart
} from 'lucide-react'

// ============================================================================
// DEFAULTS & DATA
// ============================================================================

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
    status: 'pending', // pending, won, lost
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
    status: 'pending',
    notes: 'Waiting on property inspection',
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
    email: 'tim@clouteinc.com',
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
  const [tenant, setTenant] = useState(null)
  const [config, setConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('leads')
  const [adminTab, setAdminTab] = useState('pricing')
  const [saved, setSaved] = useState(false)
  const [leadsFilter, setLeadsFilter] = useState('all')
  const [expandedLead, setExpandedLead] = useState(null)
  const [leads, setLeads] = useState(DEMO_LEADS)

  // ========================================================================
  // LOGIN
  // ========================================================================

  const handleLogin = () => {
    const storedTenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
    const allTenants = [...DEMO_TENANTS, ...storedTenants]
    const found = allTenants.find(t => t.email?.toLowerCase() === loginEmail.toLowerCase())

    if (found) {
      setTenant(found)
      setConfig(found.config || deepClone(DEFAULT_CONFIG))
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('No account found with that email.')
    }
  }

  const handleLogout = () => {
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

  const handleSave = () => {
    if (tenant && config) {
      const updated = { ...tenant, config }
      setTenant(updated)

      const storedTenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
      const idx = storedTenants.findIndex(t => t.id === tenant.id)
      if (idx >= 0) {
        storedTenants[idx] = updated
      } else {
        storedTenants.push(updated)
      }
      localStorage.setItem('mybidquick_tenants', JSON.stringify(storedTenants))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  // ========================================================================
  // LEADS MANAGEMENT
  // ========================================================================

  const filteredLeads = leadsFilter === 'all' ? leads : leads.filter(l => l.status === leadsFilter)

  const handleLeadStatus = (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
  }

  const totalRevenue = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + l.total, 0)

  // ========================================================================
  // LOGIN SCREEN
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
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b9cff, #6dd19e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 20,
              margin: '0 auto 16px',
            }}>BQ</div>
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
              disabled={!loginEmail}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 10,
                background: loginEmail ? '#3b9cff' : '#a78bfa',
                color: 'white',
                border: 'none',
                cursor: loginEmail ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Log In
            </button>

            <div style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: '#f0f7ff',
              fontSize: 12,
              color: '#3b9cff',
            }}>
              <strong>Demo accounts:</strong><br />
              tim@clouteinc.com<br />
              noah@cornerstoneexterior.com
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
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
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
        </div>

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Leads', value: leads.length, icon: 'TrendingUp', color: '#3b9cff' },
                { label: 'Pending', value: leads.filter(l => l.status === 'pending').length, icon: 'Clock', color: '#ffa500' },
                { label: 'Won', value: leads.filter(l => l.status === 'won').length, icon: 'Heart', color: '#6dd19e' },
                { label: 'Revenue', value: `$${totalRevenue}`, icon: 'DollarSign', color: '#a78bfa' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid #d4e4f7',
                  boxShadow: '0 2px 8px rgba(59, 156, 255, 0.08)',
                }}>
                  <div style={{ fontSize: 12, color: '#7a9bbc', fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['all', 'pending', 'won', 'lost'].map(f => (
                <button
                  key={f}
                  onClick={() => setLeadsFilter(f)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: leadsFilter === f ? '#3b9cff' : 'transparent',
                    color: leadsFilter === f ? 'white' : '#4a6d94',
                    border: `1px solid ${leadsFilter === f ? '#3b9cff' : '#d4e4f7'}`,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Lead Cards */}
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredLeads.map(lead => (
                <div key={lead.id} style={{
                  background: 'white',
                  borderRadius: 16,
                  border: '1px solid #d4e4f7',
                  boxShadow: '0 2px 8px rgba(59, 156, 255, 0.08)',
                }}>
                  <div
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    style={{
                      padding: 24,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f' }}>{lead.name}</div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: lead.status === 'pending' ? '#fff3cd' : lead.status === 'won' ? '#d4edda' : '#f8d7da',
                          color: lead.status === 'pending' ? '#856404' : lead.status === 'won' ? '#155724' : '#721c24',
                        }}>
                          {lead.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#7a9bbc', marginBottom: 8 }}>
                        <span><Mail size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{lead.email}</span>
                        <span><Phone size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{lead.phone}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        {lead.services.map(s => (
                          <span key={s} style={{
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: '#f0f7ff',
                            color: '#3b9cff',
                            fontSize: 12,
                            fontWeight: 600,
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: '#4a6d94', display: 'flex', gap: 16 }}>
                        <span>{lead.package} • {lead.date}</span>
                        <span>Source: {lead.source}</span>
                        <span style={{ fontWeight: 700, color: '#3b9cff' }}>${lead.total}</span>
                      </div>
                    </div>
                    <div style={{ marginLeft: 16 }}>
                      <ChevronDown size={20} color="#7a9bbc" style={{
                        transform: expandedLead === lead.id ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }} />
                    </div>
                  </div>

                  {expandedLead === lead.id && (
                    <div style={{ borderTop: '1px solid #d4e4f7', padding: 24, background: '#f8fbff' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e3a5f', marginBottom: 8 }}>Notes</div>
                        <p style={{ color: '#4a6d94', fontSize: 13 }}>{lead.notes}</p>
                      </div>

                      {lead.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleLeadStatus(lead.id, 'won')}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: '#6dd19e',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            Mark Won
                          </button>
                          <button
                            onClick={() => handleLeadStatus(lead.id, 'lost')}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: '#f87171',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            Mark Lost
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                        <div style={{ fontSize: 12, color: '#7a9bbc', fontWeight: 600 }}>{step.type.toUpperCase()} • {step.delay} days</div>
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
      </div>
    </div>
  )
}
