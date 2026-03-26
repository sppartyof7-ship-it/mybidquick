import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Check, Upload, Palette,
  Building2, Mail, Phone, Globe, DollarSign, Sparkles, Tag, Percent
} from 'lucide-react'

const STEPS = [
  { title: "Your Info", desc: "Tell us about your business" },
  { title: "Branding", desc: "Make it look like yours" },
  { title: "Services", desc: "What do you offer?" },
  { title: "Launch!", desc: "You're ready to go" },
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

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#2563eb", secondary: "#60a5fa" },
  { name: "Forest Green", primary: "#059669", secondary: "#34d399" },
  { name: "Royal Purple", primary: "#7c3aed", secondary: "#a78bfa" },
  { name: "Sunset Orange", primary: "#ea580c", secondary: "#fb923c" },
  { name: "Slate", primary: "#334155", secondary: "#64748b" },
  { name: "Crimson", primary: "#dc2626", secondary: "#f87171" },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(0)
  const [logoPreview, setLogoPreview] = useState(null)

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: searchParams.get('email') || '',
    phone: '',
    website: '',
    city: '',
    state: '',
    primaryColor: '#2563eb',
    secondaryColor: '#60a5fa',
    services: DEFAULT_SERVICES.map(s => ({ ...s })),
    plan: 'growth',
    upsell: {
      enabled: false,
      triggerService: 'house_washing',
      offerService: 'window_cleaning',
      discountPercent: 20,
    },
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      services: f.services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }))
  }

  const updateServicePrice = (id, price) => {
    setForm(f => ({
      ...f,
      services: f.services.map(s => s.id === id ? { ...s, price: Number(price) || 0 } : s)
    }))
  }

  const updateUpsell = (field, value) => {
    setForm(f => ({ ...f, upsell: { ...f.upsell, [field]: value } }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.businessName && form.email && form.ownerName
    return true
  }

  const handleLaunch = () => {
    // In a real app, this would POST to an API to create the tenant
    const tenantData = {
      ...form,
      id: form.businessName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      createdAt: new Date().toISOString(),
      status: 'active',
      quotesUsed: 0,
      logo: logoPreview,
    }

    // Save to localStorage for demo purposes
    const tenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
    tenants.push(tenantData)
    localStorage.setItem('mybidquick_tenants', JSON.stringify(tenants))

    setStep(3) // Show success
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 50%)',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', background: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => navigate('/')}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
          }}>BQ</div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>MyBidQuick</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Step {Math.min(step + 1, 3)} of 3
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)' }}>
        <div style={{
          height: '100%', background: 'var(--accent)',
          width: `${((step + 1) / 4) * 100}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ maxWidth: 640, margin: '48px auto', padding: '0 24px' }}>
        {/* Step indicators */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48,
        }}>
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: i <= step ? 1 : 0.4,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--border)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Business Info */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Let's set up your quoting page</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Tell us about your business so we can personalize your experience.</p>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)' }}>
              <div className="form-group">
                <label><Building2 size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Business Name *</label>
                <input placeholder="e.g., Sparkle Clean LLC" value={form.businessName} onChange={e => update('businessName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Your Name *</label>
                <input placeholder="e.g., John Smith" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label><Mail size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Email *</label>
                  <input type="email" placeholder="you@business.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label><Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Phone</label>
                  <input type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input placeholder="e.g., Madison" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select state...</option>
                    {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label><Globe size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Website (optional)</label>
                <input placeholder="https://yourbusiness.com" value={form.website} onChange={e => update('website', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Branding */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Make it yours</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Upload your logo and pick your brand colors. Your customers will never know it's MyBidQuick.</p>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)' }}>
              {/* Logo upload */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>Your Logo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                    padding: 32, textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" style={{ maxHeight: 80, maxWidth: '100%' }} />
                  ) : (
                    <>
                      <Upload size={32} color="var(--text-muted)" />
                      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Click to upload your logo (PNG, JPG, SVG)</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </div>

              {/* Color presets */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>
                  <Palette size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Brand Colors
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {COLOR_PRESETS.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => { update('primaryColor', c.primary); update('secondaryColor', c.secondary) }}
                      style={{
                        padding: 12, borderRadius: 'var(--radius)',
                        border: form.primaryColor === c.primary ? '2px solid var(--accent)' : '2px solid var(--border)',
                        cursor: 'pointer', textAlign: 'center',
                        background: form.primaryColor === c.primary ? 'var(--accent-glow)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: c.primary }} />
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: c.secondary }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom color pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                      style={{ width: 48, height: 40, border: 'none', cursor: 'pointer', padding: 0 }} />
                    <input value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={form.secondaryColor} onChange={e => update('secondaryColor', e.target.value)}
                      style={{ width: 48, height: 40, border: 'none', cursor: 'pointer', padding: 0 }} />
                    <input value={form.secondaryColor} onChange={e => update('secondaryColor', e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14 }} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>Preview</label>
                <div style={{
                  borderRadius: 'var(--radius)', padding: 24,
                  background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                  color: 'white', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {form.businessName || 'Your Business Name'}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                    Get Your Free Quote
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Set up your services</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Toggle on the services you offer and set your base prices. You can always change these later.</p>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)' }}>
              {form.services.map((svc) => (
                <div key={svc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border-light)',
                  opacity: svc.enabled ? 1 : 0.5,
                }}>
                  {/* Toggle */}
                  <div
                    onClick={() => toggleService(svc.id)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: svc.enabled ? 'var(--success)' : 'var(--border)',
                      cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'white', position: 'absolute',
                      top: 2, left: svc.enabled ? 22 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>

                  <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{svc.name}</span>

                  {svc.enabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign size={16} color="var(--text-muted)" />
                      <input
                        type="number"
                        value={svc.price}
                        onChange={e => updateServicePrice(svc.id, e.target.value)}
                        style={{
                          width: 80, padding: '6px 10px', border: '2px solid var(--border)',
                          borderRadius: 8, fontSize: 15, fontWeight: 600, textAlign: 'right',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              <div style={{
                marginTop: 24, padding: 16, borderRadius: 'var(--radius)',
                background: 'var(--accent-glow)', fontSize: 13, color: 'var(--accent-dark)',
              }}>
                <Sparkles size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Tip: These are starting prices. Your customers' actual quotes will vary based on property size, which they'll enter on your quoting page.
              </div>

              {/* Upsell Configuration */}
              <div style={{
                marginTop: 32, padding: 24, borderRadius: 'var(--radius-lg)',
                border: '2px solid',
                borderColor: form.upsell.enabled ? 'var(--success)' : 'var(--border)',
                background: form.upsell.enabled ? '#f0fdf4' : 'transparent',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: form.upsell.enabled ? 20 : 0 }}>
                  {/* Toggle */}
                  <div
                    onClick={() => updateUpsell('enabled', !form.upsell.enabled)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: form.upsell.enabled ? 'var(--success)' : 'var(--border)',
                      cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'white', position: 'absolute',
                      top: 2, left: form.upsell.enabled ? 22 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={16} color={form.upsell.enabled ? '#059669' : '#64748b'} />
                      Window Cleaning Upsell
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      After a house washing quote, offer windows at a discount to increase your ticket size
                    </div>
                  </div>
                </div>

                {form.upsell.enabled && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 16, background: 'white', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                          <Percent size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                          Discount off window cleaning price
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={form.upsell.discountPercent}
                            onChange={e => updateUpsell('discountPercent', Number(e.target.value))}
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <span style={{
                            fontWeight: 800, fontSize: 20, color: '#059669',
                            minWidth: 52, textAlign: 'right',
                          }}>
                            {form.upsell.discountPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live preview of what customer sees */}
                    <div style={{
                      marginTop: 16, padding: 16, borderRadius: 'var(--radius)',
                      background: `linear-gradient(135deg, ${form.primaryColor}10, ${form.primaryColor}05)`,
                      border: `1px dashed ${form.primaryColor}40`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>
                        Preview — what your customer sees after house wash quote
                      </div>
                      <div style={{
                        background: 'white', borderRadius: 'var(--radius)', padding: 16,
                        border: '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                          Add Window Cleaning & Save {form.upsell.discountPercent}%!
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                          Since we're already at your home, get your windows done at a discount. Just pick your window type below.
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Single-Hung', 'Double-Hung', 'Casement'].map(type => (
                            <div key={type} style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                              border: `1px solid ${form.primaryColor}30`,
                              color: form.primaryColor, background: `${form.primaryColor}08`,
                            }}>
                              {type}
                            </div>
                          ))}
                        </div>
                        <div style={{
                          marginTop: 12, fontSize: 13, color: '#059669', fontWeight: 600,
                        }}>
                          {(() => {
                            const windowSvc = form.services.find(s => s.id === 'window_cleaning')
                            const originalPrice = windowSvc ? windowSvc.price : 250
                            const discounted = Math.round(originalPrice * (1 - form.upsell.discountPercent / 100))
                            return (
                              <>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 8 }}>
                                  ${originalPrice}
                                </span>
                                ${discounted} — You save ${originalPrice - discounted}!
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Check size={40} color="#059669" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>You're live! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
              Your branded quoting page is ready. Share the link with customers or embed it on your website.
            </p>

            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
              border: '1px solid var(--border)', maxWidth: 480, margin: '0 auto 24px',
            }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Your quoting page URL</label>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <input
                  readOnly
                  value={`mybidquick.com/${form.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 'var(--radius)',
                    border: '2px solid var(--border)', fontSize: 15, fontWeight: 600,
                    background: 'var(--bg-alt)', color: 'var(--accent)',
                  }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => {
                  navigator.clipboard?.writeText(`mybidquick.com/${form.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
                }}>Copy</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/admin')}>
                Open Dashboard <ArrowRight size={16} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 3 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 32,
          }}>
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} /> {step === 0 ? 'Home' : 'Back'}
            </button>
            <button
              onClick={() => step === 2 ? handleLaunch() : setStep(s => s + 1)}
              className="btn btn-primary btn-lg"
              disabled={!canProceed()}
              style={{ opacity: canProceed() ? 1 : 0.5 }}
            >
              {step === 2 ? 'Launch My Page' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
