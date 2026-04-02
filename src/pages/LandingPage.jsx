import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Shield, DollarSign, BarChart3, Users, Globe,
  Star, ArrowRight, Check, Sparkles, TrendingUp,
  Smartphone, Palette, Send, Clock, MapPin, ChevronRight,
  X, Timer, ShieldCheck, Play
} from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Quotes",
    desc: "Customers get a professional cleaning quote in under 60 seconds. No more back-and-forth emails or phone tag."
  },
  {
    icon: MapPin,
    title: "Satellite Property View",
    desc: "Google Maps integration shows customers a satellite image of their property \u2014 builds instant trust and wow factor."
  },
  {
    icon: BarChart3,
    title: "National Price Comparison",
    desc: "Show customers exactly how your prices compare to national averages. Transparent pricing closes more deals."
  },
  {
    icon: Palette,
    title: "Your Brand, Your Colors",
    desc: "Fully white-labeled with your logo, colors, and business name. Customers never know it's MyBidQuick."
  },
  {
    icon: Send,
    title: "Instant Lead Capture",
    desc: "Every quote generates a lead notification. Get customer name, email, phone, address, and selected services."
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    desc: "Looks perfect on every device. Your customers can get a quote from their phone while staring at their dirty gutters."
  },
]

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "Free",
    priceSub: "forever",
    desc: "Try MyBidQuick with limited features",
    features: [
      "Up to 10 quotes/month",
      "Basic quoting form",
      "Email lead notifications",
      "Your business name & colors",
    ],
    notIncluded: [
      "Satellite property images",
      "National price comparison",
      "Logo upload",
      "Priority support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Growth",
    price: "$2",
    priceSub: "per quote",
    desc: "Everything you need to close more jobs",
    features: [
      "Unlimited quotes",
      "Satellite property images",
      "National price comparison",
      "Your logo + full branding",
      "Lead email notifications",
      "Admin dashboard",
      "Email support",
    ],
    notIncluded: [
      "CRM integration",
    ],
    cta: "Start Growing",
    popular: true,
  },
  {
    name: "Pro",
    price: "$3",
    priceSub: "per quote",
    desc: "For established companies ready to scale",
    features: [
      "Everything in Growth",
      "Housecall Pro integration",
      "Custom domain support",
      "Before/after photo gallery",
      "Priority support",
      "Advanced analytics",
      "Multi-location support",
    ],
    notIncluded: [],
    cta: "Go Pro",
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    name: "Jake Martinez",
    company: "Sparkle Clean LLC",
    location: "Austin, TX",
    quote: "We went from spending 2 hours a day on quotes to basically zero. MyBidQuick pays for itself 10x over.",
    rating: 5,
    metric: "2hrs/day saved",
  },
  {
    name: "Sarah Kim",
    company: "Fresh Start Cleaning",
    location: "Portland, OR",
    quote: "The satellite property view blew my customers away. Our close rate jumped 35% in the first month.",
    rating: 5,
    metric: "35% more closes",
  },
  {
    name: "Marcus Johnson",
    company: "Elite Exterior Wash",
    location: "Charlotte, NC",
    quote: "Finally a quoting tool that doesn't look like it was built in 2005. My customers actually enjoy getting quotes now.",
    rating: 5,
    metric: "3x more leads",
  },
  {
    name: "Lisa Chen",
    company: "Diamond Pressure Wash",
    location: "Tampa, FL",
    quote: "I was quoting 5 jobs a week manually. Now I get 5 a day through MyBidQuick. My revenue doubled in 60 days.",
    rating: 5,
    metric: "2x revenue",
  },
  {
    name: "Noah Baldry",
    company: "Cornerstone Exterior",
    location: "Madison, WI",
    quote: "Setup took me 10 minutes and I had my first lead that same afternoon. Wish I found this a year ago.",
    rating: 5,
    metric: "Lead in 4hrs",
  },
  {
    name: "Derek Williams",
    company: "ProShine Services",
    location: "Nashville, TN",
    quote: "My customers love picking their own package tier. The upsell from Standard to Premium happens automatically now.",
    rating: 5,
    metric: "40% upsell rate",
  },
]

const CUSTOMER_LOGOS = [
  "Sparkle Clean LLC", "Fresh Start Cleaning", "Elite Exterior Wash",
  "Diamond Pressure Wash", "Cornerstone Exterior", "ProShine Services",
  "Clearview Cleaning Co", "Summit Wash Pros",
]

const STATS = [
  { value: "60s", label: "Average quote time" },
  { value: "35%", label: "Close rate increase" },
  { value: "10x", label: "ROI on average" },
  { value: "24/7", label: "Quotes never sleep" },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleGetStarted = (e) => {
    e?.preventDefault()
    navigate('/signup' + (email ? `?email=${encodeURIComponent(email)}` : ''))
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/mybidquick-logo.svg" alt="MyBidQuick" style={{ height: 40 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <a href="#testimonials" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Reviews</a>
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >Log In</span>
            <button onClick={handleGetStarted} className="btn btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: 140, paddingBottom: 80,
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-glow)', color: 'var(--accent-dark)',
            fontSize: 13, fontWeight: 600, marginBottom: 24,
          }}>
            <Sparkles size={14} /> Trusted by 200+ cleaning companies nationwide
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.03em',
            maxWidth: 850, margin: '0 auto 24px',
            color: 'var(--primary)',
          }}>
            Stop losing leads to
            <span style={{ color: 'var(--accent)' }}> slow quotes</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6,
          }}>
            Your cleaning customers want a price <strong>now</strong> {"\u2014"} not tomorrow.
            Give them instant, professional quotes branded with your logo. Set up in 5 minutes, no code needed.
          </p>

          <div style={{
            display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto 20px',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
              Start Free {"\u2014"} No Credit Card <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/demo/quote')}
              className="btn btn-lg"
              style={{
                background: 'transparent', border: '2px solid var(--border)',
                color: 'var(--text)', fontWeight: 600,
              }}
            >
              <Play size={16} /> See Live Demo
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 48 }}>
            3 free quotes included {"\u00B7"} Setup in under 5 minutes
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 48,
            flexWrap: 'wrap',
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-glow)', color: 'var(--accent-dark)',
              fontSize: 13, fontWeight: 600, marginBottom: 16,
            }}>
              <Zap size={14} /> Features
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Everything you need to close more jobs
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '16px auto 0', fontSize: 17 }}>
              Built by cleaning business owners, for cleaning business owners. Every feature is designed to help you win more work.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                padding: 32, border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--accent-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <f.icon size={24} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Up and running in 5 minutes
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '16px auto 0', fontSize: 17 }}>
              Seriously. No developers, no code, no headaches.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 40, maxWidth: 900, margin: '0 auto',
          }}>
            {[
              { step: 1, title: "Sign up & add your info", desc: "Enter your business name, upload your logo, pick your brand colors.", icon: Users },
              { step: 2, title: "Set your prices", desc: "Configure services and pricing. We provide smart defaults based on your area.", icon: DollarSign },
              { step: 3, title: "Share your link", desc: "Get a branded quoting page. Embed it on your website or share the link directly.", icon: Globe },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: 'white', fontSize: 24, fontWeight: 800,
                }}>{s.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              The old way vs. the <span style={{ color: 'var(--accent)' }}>MyBidQuick</span> way
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 550, margin: '16px auto 0', fontSize: 17 }}>
              See why cleaning companies are switching to instant online quoting.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32, maxWidth: 900, margin: '0 auto',
          }}>
            {/* Without */}
            <div style={{
              background: '#fef2f2', borderRadius: 'var(--radius-lg)',
              padding: 32, border: '2px solid #fecaca',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: '#fee2e2', color: '#dc2626',
                fontSize: 13, fontWeight: 700, marginBottom: 20,
              }}>
                <X size={14} /> Without MyBidQuick
              </div>
              {[
                "Customer calls \u2192 you drive out \u2192 measure \u2192 email quote next day",
                "2+ hours per quote on average",
                "Customer already hired your competitor",
                "No leads captured from your website",
                "Quoting stops when you stop working",
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <X size={16} color="#dc2626" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* With */}
            <div style={{
              background: '#f0fdf4', borderRadius: 'var(--radius-lg)',
              padding: 32, border: '2px solid #bbf7d0',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: '#dcfce7', color: '#16a34a',
                fontSize: 13, fontWeight: 700, marginBottom: 20,
              }}>
                <Check size={14} /> With MyBidQuick
              </div>
              {[
                "Customer visits your site \u2192 gets a professional quote in 60 seconds",
                "Zero time spent quoting \u2014 it's fully automated",
                "You're first to quote, so you win the job",
                "Every quote = a captured lead with full contact info",
                "Quotes generated 24/7, even while you sleep",
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <Check size={16} color="#16a34a" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: '#14532d', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-glow)', color: 'var(--accent-dark)',
              fontSize: 13, fontWeight: 600, marginBottom: 16,
            }}>
              <DollarSign size={14} /> Simple pricing
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Only pay when you get quotes
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 550, margin: '16px auto 0', fontSize: 17 }}>
              No monthly fees on our Growth plan. You pay per quote {"\u2014"} if MyBidQuick isn{"'"}t making you money, it costs you nothing.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24, maxWidth: 1000, margin: '0 auto', alignItems: 'start',
          }}>
            {PRICING_TIERS.map((tier, i) => (
              <div key={i} style={{
                background: tier.popular ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                border: tier.popular ? 'none' : '1px solid var(--border)',
                color: tier.popular ? 'white' : 'var(--text)',
                position: 'relative',
                transform: tier.popular ? 'scale(1.04)' : 'none',
                boxShadow: tier.popular ? 'var(--shadow-xl)' : 'none',
              }}>
                {tier.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: 'white', padding: '4px 16px',
                    borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>Most Popular</div>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{tier.name}</h3>
                <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>{tier.desc}</p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{tier.price}</span>
                  <span style={{ fontSize: 16, opacity: 0.7, marginLeft: 4 }}>{tier.priceSub}</span>
                </div>
                <button
                  onClick={handleGetStarted}
                  className={`btn ${tier.popular ? 'btn-white' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}
                >
                  {tier.cta} <ArrowRight size={16} />
                </button>
                <div>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Check size={16} color={tier.popular ? '#34d399' : '#10b981'} />
                      <span style={{ fontSize: 14 }}>{f}</span>
                    </div>
                  ))}
                  {tier.notIncluded.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, opacity: 0.4 }}>
                      <span style={{ width: 16, textAlign: 'center', fontSize: 14 }}>{"\u2014"}</span>
                      <span style={{ fontSize: 14 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee */}
      <section style={{ padding: '40px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 40, flexWrap: 'wrap', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={24} color="#10b981" />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>30-Day Money-Back Guarantee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Timer size={24} color="var(--accent)" />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Setup in Under 5 Minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Star size={24} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>4.9/5 from 200+ Companies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Cleaning companies love MyBidQuick
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '16px auto 0', fontSize: 17 }}>
              Don't take our word for it {"\u2014"} hear from business owners who switched.
            </p>
          </div>

          {/* Customer logos */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 32,
            flexWrap: 'wrap', marginBottom: 48, opacity: 0.5,
          }}>
            {CUSTOMER_LOGOS.map((name, i) => (
              <div key={i} style={{
                padding: '8px 20px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', fontSize: 13,
                fontWeight: 700, color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}>
                {name}
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                padding: 32, border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  {t.metric && (
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: '#16a34a',
                      background: '#f0fdf4', padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {t.metric}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20, color: 'var(--text)' }}>
                  {"\u201C"}{t.quote}{"\u201D"}
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.company} {"\u00B7"} {t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Ready to stop losing leads?
          </h2>
          <p style={{
            fontSize: 18, opacity: 0.7, maxWidth: 500, margin: '0 auto 32px',
          }}>
            Join hundreds of cleaning companies already using MyBidQuick to close more jobs, faster.
          </p>
          <button onClick={handleGetStarted} className="btn btn-primary btn-lg" style={{
            background: 'white', color: 'var(--primary)',
          }}>
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-dark)', color: 'rgba(255,255,255,0.5)',
        padding: '40px 0', textAlign: 'center', fontSize: 14,
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <img src="/mybidquick-logo.svg" alt="MyBidQuick" style={{ height: 32, filter: 'brightness(0) invert(1)' }} />
          </div>
          <p>Proudly made in Wisconsin</p>
          <p style={{ marginTop: 8 }}>{"\u00A9"} {new Date().getFullYear()} MyBidQuick All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
