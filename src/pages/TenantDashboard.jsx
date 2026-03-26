import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Palette, DollarSign, Tag, Percent, Upload,
  Check, Building2, Mail, Phone, Globe, Sparkles, LogOut, Eye
} from 'lucide-react'

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#2563eb", secondary: "#60a5fa" },
  { name: "Forest Green", primary: "#059669", secondary: "#34d399" },
  { name: "Royal Purple", primary: "#7c3aed", secondary: "#a78bfa" },
  { name: "Sunset Orange", primary: "#ea580c", secondary: "#fb923c" },
  { name: "Slate", primary: "#334155", secondary: "#64748b" },
  { name: "Crimson", primary: "#dc2626", secondary: "#f87171" },
]

const DEFAULT_SERVICES = [
  { id: "house_washing", name: "House Washing", enabled: true, price: 350 },
  { id: "roof_cleaning", name: "Roof Cleaning", enabled: true, price: 450 },
  { id: "gutter_cleaning", name: "Gutter Cleaning", enabled: true, price: 150 },
  { id: "window_cleaning", name: "Window Cleaning", enabled: true, price: 250 },
  { id: "driveway_cleaning", name: "Driveway Cleaning", enabled: true, price: 200 },
  { id: "deck_patio", name: "Deck & Patio Cleaning", enabled: true, price: 275 },
  { id: "gutter_guard", name: "Gutter Guard Install", enabled: false, price: 800 },
]

// Demo tenants — in production these come from Supabase
const DEMO_TENANTS = [
  {
    id: 'cloute-cleaning',
    businessName: 'Cloute Cleaning',
    ownerName: 'Tim Sullivan',
    email: 'tim@clouteinc.com',
    phone: '(608) 555-1234',
    website: 'clouteinc.com',
    city: 'Madison',
    state: 'WI',
    primaryColor: '#2563eb',
    secondaryColor: '#60a5fa',
    services: DEFAULT_SERVICES.map(s => ({ ...s })),
    plan: 'pro',
    logo: null,
    upsell: { enabled: true, triggerService: 'house_washing', offerService: 'window_cleaning', discountPercent: 20 },
  },
  {
    id: 'cornerstone-exterior',
    businessName: 'Cornerstone Exterior',
    ownerName: 'Noah Baldry',
    email: 'noah@cornerstoneexterior.com',
    phone: '(608) 555-5678',
    website: 'cornerstoneexterior.com',
    city: 'Milwaukee',
    state: 'WI',
    primaryColor: '#059669',
    secondaryColor: '#34d399',
    services: DEFAULT_SERVICES.map(s => ({ ...s })),
    plan: 'growth',
    logo: null,
    upsell: { enabled: false, triggerService: 'house_washing', offerService: 'window_cleaning', discountPercent: 15 },
  },
]

export default function TenantDashboard() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tenant, setTenant] = useState(null)
  const [activeTab, setActiveTab] = useState('branding')
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  // Load tenant from localStorage or demo data
  const handleLogin = () => {
    // Check localStorage tenants first
    const storedTenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
    const allTenants = [...DEMO_TENANTS, ...storedTenants]
    const found = allTenants.find(t => t.email?.toLowerCase() === loginEmail.toLowerCase())

    if (found) {
      // Ensure upsell exists (for older tenants)
      if (!found.upsell) {
        found.upsell = { enabled: false, triggerService: 'house_washing', offerService: 'window_cleaning', discountPercent: 20 }
      }
      setTenant({ ...found })
      setLogoPreview(found.logo || null)
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('No account found with that email. Check your email or sign up first.')
    }
  }

  const updateTenant = (field, value) => {
    setTenant(t => ({ ...t, [field]: value }))
    setSaved(false)
  }

  const toggleService = (id) => {
    setTenant(t => ({
      ...t,
      services: t.services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }))
    setSaved(false)
  }

  const updateServicePrice = (id, price) => {
    setTenant(t => ({
      ...t,
      services: t.services.map(s => s.id === id ? { ...s, price: Number(price) || 0 } : s)
    }))
    setSaved(false)
  }

  const updateUpsell = (field, value) => {
    setTenant(t => ({ ...t, upsell: { ...t.upsell, [field]: value } }))
    setSaved(false)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setLogoPreview(ev.target.result)
        updateTenant('logo', ev.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Save to localStorage (in production, this would POST to Supabase)
    const storedTenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
    const idx = storedTenants.findIndex(t => t.id === tenant.id)
    if (idx >= 0) {
      storedTenants[idx] = { ...tenant }
    } else {
      storedTenants.push({ ...tenant })
    }
    localStorage.setItem('mybidquick_tenants', JSON.stringify(storedTenants))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'services', label: 'Services & Pricing', icon: DollarSign },
    { id: 'upsell', label: 'Upsell', icon: Tag },
    { id: 'info', label: 'Business Info', icon: Building2 },
  ]

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 420, width: '100%', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 20, margin: '0 auto 16px',
            }}>BQ</div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Tenant Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>
              Log in to manage your quoting page
            </p>
          </div>

          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
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
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: `2px solid ${loginError ? '#ef4444' : '#e2e8f0'}`,
                  fontSize: 15, boxSizing: 'border-box',
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
                width: '100%', padding: '14px 24px', borderRadius: 10,
                background: loginEmail ? '#2563eb' : '#94a3b8',
                color: 'white', border: 'none', cursor: loginEmail ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: 16,
              }}
            >
              Log In
            </button>

            <div style={{
              marginTop: 20, padding: 12, borderRadius: 8,
              background: '#f0f7ff', fontSize: 12, color: '#2563eb',
            }}>
              <strong>Demo accounts:</strong><br />
              tim@clouteinc.com (Cloute Cleaning)<br />
              noah@cornerstoneexterior.com (Cornerstone Exterior)
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              margin: '24px auto', background: 'none', border: 'none',
              color: '#64748b', fontSize: 14, cursor: 'pointer', fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} /> Back to MyBidQuick
          </button>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top bar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 14,
          }}>
            {tenant.businessName?.charAt(0) || 'T'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{tenant.businessName}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {tenant.plan?.charAt(0).toUpperCase() + tenant.plan?.slice(1)} Plan
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 10,
              background: saved ? '#059669' : '#2563eb',
              color: 'white', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, transition: 'background 0.3s',
            }}
          >
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
          <button
            onClick={() => { setIsLoggedIn(false); setTenant(null); setLoginEmail('') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10,
              background: 'transparent', color: '#64748b',
              border: '1px solid #e2e8f0', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
            }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>
        {/* Tab navigation */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: 'white', borderRadius: 12, padding: 4,
          border: '1px solid #e2e8f0',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '12px 16px', borderRadius: 10,
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Branding</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Customize how your quoting page looks to customers.
            </p>

            {/* Logo */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 10 }}>Logo</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #e2e8f0', borderRadius: 12,
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = tenant.primaryColor}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ maxHeight: 60, maxWidth: '100%' }} />
                ) : (
                  <>
                    <Upload size={28} color="#94a3b8" />
                    <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>Click to upload (PNG, JPG, SVG)</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </div>

            {/* Color presets */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 10 }}>Brand Colors</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {COLOR_PRESETS.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => { updateTenant('primaryColor', c.primary); updateTenant('secondaryColor', c.secondary) }}
                    style={{
                      padding: 10, borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                      border: tenant.primaryColor === c.primary ? `2px solid ${c.primary}` : '2px solid #e2e8f0',
                      background: tenant.primaryColor === c.primary ? `${c.primary}08` : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: c.primary }} />
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: c.secondary }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Primary</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={tenant.primaryColor} onChange={e => updateTenant('primaryColor', e.target.value)}
                    style={{ width: 44, height: 36, border: 'none', cursor: 'pointer', padding: 0 }} />
                  <input value={tenant.primaryColor} onChange={e => updateTenant('primaryColor', e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Secondary</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={tenant.secondaryColor} onChange={e => updateTenant('secondaryColor', e.target.value)}
                    style={{ width: 44, height: 36, border: 'none', cursor: 'pointer', padding: 0 }} />
                  <input value={tenant.secondaryColor} onChange={e => updateTenant('secondaryColor', e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 10 }}>Preview</label>
              <div style={{
                borderRadius: 12, padding: 24, textAlign: 'center', color: 'white',
                background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{tenant.businessName}</div>
                <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Get Your Free Quote</div>
              </div>
            </div>
          </div>
        )}

        {/* Services & Pricing Tab */}
        {activeTab === 'services' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Services & Pricing</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Toggle services on/off and set your base prices.
            </p>

            {tenant.services.map((svc) => (
              <div key={svc.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 0', borderBottom: '1px solid #f1f5f9',
                opacity: svc.enabled ? 1 : 0.5,
              }}>
                <div
                  onClick={() => toggleService(svc.id)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: svc.enabled ? '#059669' : '#cbd5e1',
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 2, left: svc.enabled ? 22 : 2,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{svc.name}</span>
                {svc.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={16} color="#64748b" />
                    <input
                      type="number"
                      value={svc.price}
                      onChange={e => updateServicePrice(svc.id, e.target.value)}
                      style={{
                        width: 80, padding: '6px 10px', border: '2px solid #e2e8f0',
                        borderRadius: 8, fontSize: 15, fontWeight: 600, textAlign: 'right',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            <div style={{
              marginTop: 20, padding: 14, borderRadius: 10,
              background: '#f0f7ff', fontSize: 13, color: '#2563eb',
            }}>
              <Sparkles size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              These are base prices. Actual quotes vary by property size.
            </div>
          </div>
        )}

        {/* Upsell Tab */}
        {activeTab === 'upsell' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Window Cleaning Upsell</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Offer window cleaning at a discount when customers get a house washing quote.
            </p>

            {/* Enable toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
              padding: 20, borderRadius: 12,
              border: `2px solid ${tenant.upsell.enabled ? '#059669' : '#e2e8f0'}`,
              background: tenant.upsell.enabled ? '#f0fdf4' : 'transparent',
              transition: 'all 0.3s',
            }}>
              <div
                onClick={() => updateUpsell('enabled', !tenant.upsell.enabled)}
                style={{
                  width: 50, height: 28, borderRadius: 14,
                  background: tenant.upsell.enabled ? '#059669' : '#cbd5e1',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 2, left: tenant.upsell.enabled ? 24 : 2,
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {tenant.upsell.enabled ? 'Upsell is ON' : 'Upsell is OFF'}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {tenant.upsell.enabled
                    ? 'Customers will see a window cleaning offer after their house wash quote'
                    : 'Turn this on to boost your average ticket size'}
                </div>
              </div>
            </div>

            {tenant.upsell.enabled && (
              <>
                {/* Discount slider */}
                <div style={{
                  padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24,
                }}>
                  <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>
                    <Percent size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Discount Percentage
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range" min="5" max="50" step="5"
                      value={tenant.upsell.discountPercent}
                      onChange={e => updateUpsell('discountPercent', Number(e.target.value))}
                      style={{ flex: 1, cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 900, fontSize: 28, color: '#059669', minWidth: 60, textAlign: 'right' }}>
                      {tenant.upsell.discountPercent}%
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                    Customers get {tenant.upsell.discountPercent}% off window cleaning when bundled with house washing.
                  </p>
                </div>

                {/* Preview */}
                <div style={{
                  padding: 20, borderRadius: 12,
                  background: `linear-gradient(135deg, ${tenant.primaryColor}08, ${tenant.primaryColor}03)`,
                  border: `1px dashed ${tenant.primaryColor}40`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 10, letterSpacing: 0.5 }}>
                    <Eye size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Customer preview
                  </div>
                  <div style={{
                    background: 'white', borderRadius: 12, overflow: 'hidden',
                    border: '2px solid #059669', boxShadow: '0 4px 16px rgba(5,150,105,0.1)',
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      padding: '12px 16px', color: 'white',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Tag size={16} />
                      <span style={{ fontWeight: 800, fontSize: 15 }}>
                        Save {tenant.upsell.discountPercent}% on Window Cleaning!
                      </span>
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                        Since we're already at your home, get your windows done at a special bundled rate.
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {['Single-Hung', 'Double-Hung', 'Casement'].map(type => (
                          <span key={type} style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: `1px solid ${tenant.primaryColor}30`,
                            color: tenant.primaryColor, background: `${tenant.primaryColor}08`,
                          }}>
                            {type}
                          </span>
                        ))}
                      </div>
                      {(() => {
                        const windowSvc = tenant.services.find(s => s.id === 'window_cleaning')
                        const orig = windowSvc ? windowSvc.price : 250
                        const disc = Math.round(orig * (1 - tenant.upsell.discountPercent / 100))
                        return (
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: 8 }}>${orig}</span>
                            ${disc} — Save ${orig - disc}!
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Business Info Tab */}
        {activeTab === 'info' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Business Info</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Update your contact details and business information.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                  <Building2 size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Business Name
                </label>
                <input value={tenant.businessName} onChange={e => updateTenant('businessName', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Owner Name</label>
                <input value={tenant.ownerName} onChange={e => updateTenant('ownerName', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                    <Mail size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Email
                  </label>
                  <input type="email" value={tenant.email} onChange={e => updateTenant('email', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                    <Phone size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Phone
                  </label>
                  <input type="tel" value={tenant.phone} onChange={e => updateTenant('phone', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>City</label>
                  <input value={tenant.city || ''} onChange={e => updateTenant('city', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>State</label>
                  <input value={tenant.state || ''} onChange={e => updateTenant('state', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                  <Globe size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Website
                </label>
                <input value={tenant.website || ''} onChange={e => updateTenant('website', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
