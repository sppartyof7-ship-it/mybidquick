import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Check, Upload, Palette,
  Building2, Mail, Phone, Globe, DollarSign, Sparkles, Tag, Percent
} from 'lucide-react'
import { createTenant, getTenantBySlug, signUp, linkAuthToTenant, uploadLogo, getLaunchCustomerCount } from '../lib/db'

// Notify Tim when a new tenant signs up (Web3Forms → email)
async function notifyNewSignup(form, slug, isLaunchCustomer) {
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '6cf87767-154f-42e1-8920-4988ef3cf5a3',
        subject: `🎉 New MyBidQuick Signup: ${form.businessName}`,
        from_name: 'MyBidQuick Signups',
        message: [
          `========================================`,
          `  NEW TENANT SIGNUP`,
          `========================================`,
          ``,
          `Business:  ${form.businessName}`,
          `Owner:     ${form.ownerName}`,
          `Email:     ${form.email}`,
          `Phone:     ${form.phone || 'N/A'}`,
          `Location:  ${form.city || ''}, ${form.state || ''}`,
          `Website:   ${form.website || 'N/A'}`,
          ``,
          `Slug:      ${slug}`,
          `Quote URL: https://www.mybidquick.com/${slug}`,
          `Dashboard: https://www.mybidquick.com/dashboard`,
          ``,
          `Launch Customer (LAUNCH20): ${isLaunchCustomer ? 'YES ✅' : 'No'}`,
          `Signed up: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
        ].join('\n'),
      }),
    })
  } catch (err) {
    console.warn('Signup notification email failed (non-blocking):', err)
  }
}

// Send the Day-0 welcome email to the new tenant.
// Best-effort: logs and swallows errors so onboarding never fails on email.
// Backend template lives in api/send-welcome-email.js.
async function sendWelcomeEmail({ email, ownerName, businessName, slug }) {
  try {
    const resp = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ownerName, businessName, slug }),
    })
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      console.warn('Welcome email send returned non-OK:', resp.status, data)
    }
  } catch (err) {
    console.warn('Welcome email send failed (non-blocking):', err)
  }
}

const STEPS = [
  { title: "Your Info", desc: "Tell us about your business" },
  { title: "Branding", desc: "Make it look like yours" },
  { title: "Services", desc: "What do you offer?" },
  { title: "Launch!", desc: "You're ready to go" },
]

const DEFAULT_SERVICES = [
  { id: "house_washing", name: "House Washing", enabled: true, price: 125 },
  { id: "window_cleaning", name: "Window Cleaning", enabled: true, price: 0 },
  { id: "deck_cleaning", name: "Deck Cleaning", enabled: true, price: 75 },
  { id: "concrete_cleaning", name: "Concrete Cleaning", enabled: true, price: 75 },
  { id: "roof_cleaning", name: "Roof Cleaning", enabled: true, price: 150 },
  { id: "gutter_cleaning", name: "Gutter Cleaning", enabled: true, price: 50 },
  { id: "gutter_guard", name: "Gutter Guard Install", enabled: false, price: 0 },
]

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#2563eb", secondary: "#60a5fa" },
  { name: "Forest Green", primary: "#059669", secondary: "#34d399" },
  { name: "Royal Purple", primary: "#7c3aed", secondary: "#a78bfa" },
  { name: "Sunset Orange", primary: "#ea580c", secondary: "#fb923c" },
  { name: "Slate", primary: "#334155", secondary: "#64748b" },
  { name: "Crimson", primary: "#dc2626", secondary: "#f87171" },
]

// -- Session persistence helpers --
const STORAGE_KEY = 'mbq_onboarding_progress'

function loadSavedProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveProgress(step, form, logoPreview) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, form, logoPreview }))
  } catch { /* storage full or unavailable - silent fail */ }
}

function clearProgress() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch {
    // Silent fail - storage may not be available
  }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)

  // -- Restore from session if available --
  const saved = loadSavedProgress()

  const [step, setStep] = useState(saved?.step ?? 0)
  const [logoPreview, setLogoPreview] = useState(saved?.logoPreview ?? null)
  const [logoFile, setLogoFile] = useState(null) // File objects can't be serialized - user re-uploads if needed

  const [form, setForm] = useState(saved?.form ?? {
    businessName: '',
    ownerName: '',
    email: searchParams.get('email') || '',
    phone: '',
    website: '',
    city: '',
    state: '',
    password: '',
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
    discountCode: '',
  })

  // -- Auto-save progress on every change --
  useEffect(() => {
    saveProgress(step, form, logoPreview)
  }, [step, form, logoPreview])

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
      setLogoFile(file) // keep the actual file for Supabase Storage upload
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const [launchError, setLaunchError] = useState('')
  const [launching, setLaunching] = useState(false)

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const canProceed = () => {
    if (step === 0) return form.businessName && form.ownerName && form.email && isValidEmail(form.email) && form.password.length >= 6
    return true
  }

  const handleLaunch = async () => {
    setLaunching(true)
    setLaunchError('')

    // Generate URL-safe slug from business name (e.g., "ABC Cleaning" -> "abc-cleaning")
    let slug = form.businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for duplicate slug and make unique if needed
    try {
      const existing = await getTenantBySlug(slug)
      if (existing) {
        // Append a number to make it unique (abc-cleaning-2, abc-cleaning-3, etc.)
        let counter = 2
        while (true) {
          const candidate = `${slug}-${counter}`
          const check = await getTenantBySlug(candidate)
          if (!check) { slug = candidate; break }
          counter++
          if (counter > 20) break // safety valve
        }
      }
    } catch (err) {
      // If slug check fails, proceed anyway - insert will catch true duplicates
      console.warn('Slug check failed, proceeding:', err)
    }

    // Build the config object with all service/pricing/upsell data
    // This is what the TenantDashboard reads from tenant.config
    const config = {
      businessName: form.businessName,
      services: form.services.map(svc => ({
        id: svc.id,
        name: svc.name,
        enabled: svc.enabled,
        icon: 'Home',
        basePrice: svc.price || 0,
        perSqFt: 0,
        perWindow: svc.id === 'window_cleaning' ? 8 : 0,
        perLinFt: svc.id === 'gutter_cleaning' ? 1.5 : svc.id === 'gutter_guard' ? 14.99 : 0,
        extras: [],
      })),
      upsell: form.upsell,
      packages: {
        basic: { multiplier: 1, tagline: 'Best for single services' },
        standard: { multiplier: 1.35, tagline: 'Most popular choice' },
        premium: { multiplier: 1.75, tagline: 'Complete solution' },
      },
      bundleDiscounts: { twoServices: 10, threeServices: 15 },
      priceAdjustment: 0,
    }

    // Upload logo to Supabase Storage (falls back to base64 if upload fails)
    let logoUrl = logoPreview // default: base64 preview
    if (logoFile) {
      const uploaded = await uploadLogo(logoFile, slug)
      if (uploaded) logoUrl = uploaded // use the Storage URL instead of base64
    }

    // Validate LAUNCH20 discount code (first 20 customers get $1/lead for life)
    let isLaunchCustomer = false
    if (form.discountCode === 'LAUNCH20') {
      try {
        const { isFull, spotsLeft: _spotsLeft } = await getLaunchCustomerCount()
        if (isFull) {
          setLaunchError('Sorry, the LAUNCH20 code has reached its limit of 20 customers. You can still sign up at regular pricing!')
          setLaunching(false)
          return
        }
        isLaunchCustomer = true
      } catch (err) {
        console.warn('Could not verify launch spots, proceeding with discount:', err)
        isLaunchCustomer = true // give benefit of the doubt if check fails
      }
    }

    const tenantData = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      website: form.website,
      city: form.city,
      state: form.state,
      slug,
      createdAt: new Date().toISOString(),
      status: 'active',
      plan: form.plan || 'growth',
      logo: logoUrl,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      config,
      discountCode: form.discountCode || null,
      isLaunchCustomer,
    }

    try {
      // 1. Create the tenant in Supabase
      const tenant = await createTenant(tenantData)

      // 2. Notify Tim about the new signup (non-blocking)
      notifyNewSignup(form, slug, isLaunchCustomer)

      // 3. Send Day-0 welcome email (non-blocking — never fail onboarding on email)
      //    See api/send-welcome-email.js
      sendWelcomeEmail({
        email: form.email,
        ownerName: form.ownerName,
        businessName: form.businessName,
        slug,
      })

      // 4. Create auth user with email + password
      try {
        const authUser = await signUp(form.email, form.password, {
          business_name: form.businessName,
          owner_name: form.ownerName,
        })

        // 5. Link auth user to tenant
        if (authUser && tenant?.id) {
          await linkAuthToTenant(tenant.id, authUser.id)
        }
      } catch (authErr) {
        // Auth creation failed but tenant was created - log but don't block
        // They can use "forgot password" flow later to set up auth
        console.warn('Auth user creation failed (tenant still created):', authErr)
      }
    } catch (err) {
      console.error('Failed to create tenant:', err)
      if (err.message?.includes('duplicate')) {
        setLaunchError('A business with this name already exists. Please use a different name.')
      } else {
        setLaunchError('Something went wrong creating your page. Please try again or contact support.')
      }
      setLaunching(false)
      return
    }

    setLaunching(false)
    setStep(3) // Show success
    clearProgress() // Clean up - onboarding complete
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
          <img src="/mybidquick-logo.svg" alt="MyBidQuick" style={{ height: 36 }} />
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
                  <input type="email" placeholder="you@business.com" value={form.email} onChange={e => update('email', e.target.value)}
                    style={form.email && !isValidEmail(form.email) ? { borderColor: '#dc2626' } : {}} />
                  {form.email && !isValidEmail(form.email) && (
                    <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Please enter a valid email address</span>
                  )}
                </div>
                <div className="form-group">
                  <label><Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Phone</label>
                  <input type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Password * <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(min 6 characters - for your dashboard login)</span></label>
                <input type="password" placeholder="Create a password" value={form.password}
                  onChange={e => update('password', e.target.value)}
                  style={form.password && form.password.length < 6 ? { borderColor: '#dc2626' } : {}} />
                {form.password && form.password.length < 6 && (
                  <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Password must be at least 6 characters</span>
                )}
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

              {/* Discount Code */}
              <div style={{ marginTop: 24, padding: '20px 24px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: 12, border: '1px solid #fde68a' }}>
                <label style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#92400e' }}>
                  <Tag size={14} /> Have a discount code?
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="Enter code (e.g., LAUNCH20)"
                    value={form.discountCode}
                    onChange={e => update('discountCode', e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '10px 12px', border: '2px solid #fde68a', borderRadius: 8, fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}
                  />
                </div>
                {form.discountCode === 'LAUNCH20' && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>
                      Launch Customer pricing: $1.00/lead for life! (Limited to first 20 customers)
                    </span>
                  </div>
                )}
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
                        Preview - what your customer sees after house wash quote
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
                                ${discounted} - You save ${originalPrice - discounted}!
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
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>You're live! {'\u{1F389}'}</h2>
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
                  value={`${form.businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.mybidquick.com`}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 'var(--radius)',
                    border: '2px solid var(--border)', fontSize: 15, fontWeight: 600,
                    background: 'var(--bg-alt)', color: 'var(--accent)',
                  }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => {
                  const slug = form.businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  navigator.clipboard?.writeText(`${slug}.mybidquick.com`)
                }}>Copy</button>
              </div>
            </div>

            {form.discountCode === 'LAUNCH20' && (
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: 12, padding: 16,
                maxWidth: 480, margin: '0 auto 24px',
                border: '1px solid #6ee7b7', fontSize: 14, color: '#065f46',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Sparkles size={20} color="#059669" />
                <div>
                  <strong>Launch Customer discount applied!</strong>
                  <br />
                  <span style={{ fontSize: 12, color: '#047857' }}>
                    You're locked in at $1.00/lead for life. This never expires.
                  </span>
                </div>
              </div>
            )}

            <div style={{
              background: '#f0f7ff', borderRadius: 12, padding: 16,
              maxWidth: 480, margin: '0 auto 24px',
              border: '1px solid #dbeafe', fontSize: 13, color: '#1e40af',
            }}>
              <strong>Your login:</strong> {form.email} + the password you just created.
              <br />
              <span style={{ fontSize: 12, color: '#3b82f6' }}>
                Use these to log into your dashboard anytime at mybidquick.com/login
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                Open Dashboard <ArrowRight size={16} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Launch error message */}
        {launchError && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            fontSize: 14, fontWeight: 500,
          }}>
            {launchError}
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
              disabled={!canProceed() || launching}
              style={{ opacity: (canProceed() && !launching) ? 1 : 0.5 }}
            >
              {launching ? 'Setting up...' : step === 2 ? 'Launch My Page' : 'Continue'} {!launching && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
