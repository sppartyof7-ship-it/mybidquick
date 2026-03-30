import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BarChart3, Settings, LogOut,
  Plus, Search, DollarSign, TrendingUp, FileText, Eye,
  MoreVertical, ChevronRight, Zap, Clock, AlertCircle,
  CheckCircle2, XCircle, ExternalLink, ArrowRight
} from 'lucide-react'
import { getAllTenants } from '../lib/db'

// Demo data for tenants
const DEMO_TENANTS = [
  {
    id: 'cloute-cleaning',
    businessName: 'Cloute Cleaning',
    ownerName: 'Tim Sullivan',
    email: 'tim.sullivan@clouteinc.com',
    plan: 'pro',
    status: 'active',
    primaryColor: '#2563eb',
    secondaryColor: '#60a5fa',
    createdAt: '2025-11-15',
    quotesThisMonth: 147,
    quotesTotal: 892,
    revenue: 446.00,
    revenueTotal: 2676.00,
    lastQuote: '2026-03-25',
  },
  {
    id: 'cornerstone-exterior',
    businessName: 'Cornerstone Exterior Cleaning',
    ownerName: 'Noah Baldry',
    email: 'noah@cornerstoneexterior.com',
    plan: 'growth',
    status: 'active',
    primaryColor: '#1a2e4a',
    secondaryColor: '#5cb8e4',
    createdAt: '2026-01-20',
    quotesThisMonth: 63,
    quotesTotal: 189,
    revenue: 126.00,
    revenueTotal: 378.00,
    lastQuote: '2026-03-24',
  },
  {
    id: 'sparkle-clean',
    businessName: 'Sparkle Clean LLC',
    ownerName: 'Jake Martinez',
    email: 'jake@sparkleclean.com',
    plan: 'growth',
    status: 'active',
    primaryColor: '#059669',
    secondaryColor: '#34d399',
    createdAt: '2026-02-10',
    quotesThisMonth: 41,
    quotesTotal: 82,
    revenue: 82.00,
    revenueTotal: 164.00,
    lastQuote: '2026-03-25',
  },
  {
    id: 'fresh-start',
    businessName: 'Fresh Start Cleaning',
    ownerName: 'Sarah Kim',
    email: 'sarah@freshstartclean.com',
    plan: 'starter',
    status: 'active',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    createdAt: '2026-03-01',
    quotesThisMonth: 8,
    quotesTotal: 8,
    revenue: 0,
    revenueTotal: 0,
    lastQuote: '2026-03-22',
  },
  {
    id: 'elite-wash',
    businessName: 'Elite Exterior Wash',
    ownerName: 'Marcus Johnson',
    email: 'marcus@elitewash.com',
    plan: 'growth',
    status: 'trial',
    primaryColor: '#dc2626',
    secondaryColor: '#f87171',
    createdAt: '2026-03-18',
    quotesThisMonth: 5,
    quotesTotal: 5,
    revenue: 10.00,
    revenueTotal: 10.00,
    lastQuote: '2026-03-24',
  },
]

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
      border: '1px solid var(--border)', flex: '1 1 220px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        <TrendingUp size={16} color="var(--success)" />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function TenantRow({ tenant, onView }) {
  const planColors = { starter: '#94a3b8', growth: '#3b82f6', pro: '#8b5cf6' }
  const statusColors = { active: '#10b981', trial: '#f59e0b', suspended: '#ef4444' }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0,
      }}>
        {tenant.businessName.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tenant.businessName}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tenant.ownerName} · {tenant.email}</div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 100 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{tenant.quotesThisMonth} quotes</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>this month</div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 80 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>${tenant.revenue.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>revenue</div>
      </div>
      <span className={`badge badge-${tenant.plan === 'pro' ? 'info' : tenant.plan === 'growth' ? 'info' : 'warning'}`}
        style={{
          background: `${planColors[tenant.plan]}20`,
          color: planColors[tenant.plan],
          textTransform: 'capitalize',
        }}>
        {tenant.plan}
      </span>
      <span className="badge" style={{
        background: `${statusColors[tenant.status]}20`,
        color: statusColors[tenant.status],
        textTransform: 'capitalize',
      }}>
        {tenant.status}
      </span>
      <button onClick={() => onView(tenant)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 4, borderRadius: 6, color: 'var(--text-muted)',
      }}>
        <Eye size={18} />
      </button>
    </div>
  )
}

function RevenueChart({ tenants }) {
  // Simple bar chart representation
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const values = [320, 580, 890, 1240, 1680, tenants.reduce((s, t) => s + t.revenue, 0)]
  const max = Math.max(...values)

  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>Monthly Revenue</h3>
        <span className="badge badge-success">+38% vs last month</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: `${(values[i] / max) * 120}px`,
              background: i === months.length - 1
                ? 'linear-gradient(180deg, var(--accent), var(--accent-dark))'
                : 'var(--border)',
              borderRadius: '6px 6px 0 0',
              marginBottom: 8,
              transition: 'height 0.3s',
            }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{m}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>${values[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  // Load tenants from Supabase (or localStorage fallback), merge with demo data
  const [tenants, setTenants] = useState(DEMO_TENANTS)

  useEffect(() => {
    async function loadTenants() {
      try {
        const dbTenants = await getAllTenants()
        // Merge DB tenants with demo data, avoiding duplicates by email
        const demoEmails = new Set(DEMO_TENANTS.map(t => t.email?.toLowerCase()))
        const extraTenants = dbTenants
          .filter(t => !demoEmails.has(t.email?.toLowerCase()))
          .map(t => ({
            ...t,
            quotesThisMonth: t.quotesUsed || 0,
            quotesTotal: t.quotesUsed || 0,
            revenue: (t.quotesUsed || 0) * 2,
            revenueTotal: (t.quotesUsed || 0) * 2,
            lastQuote: t.createdAt,
            plan: t.plan || 'growth',
            status: t.status || 'active',
            primaryColor: t.primaryColor || '#2563eb',
            secondaryColor: t.secondaryColor || '#60a5fa',
          }))
        setTenants([...DEMO_TENANTS, ...extraTenants])
      } catch (err) {
        console.error('Failed to load tenants:', err)
      }
    }
    loadTenants()
  }, [])

  const totalQuotesMonth = tenants.reduce((s, t) => s + t.quotesThisMonth, 0)
  const totalRevenueMonth = tenants.reduce((s, t) => s + t.revenue, 0)
  const totalRevenueAll = tenants.reduce((s, t) => s + t.revenueTotal, 0)
  const activeTenants = tenants.filter(t => t.status === 'active').length

  const filteredTenants = tenants.filter(t =>
    t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Simple auth check
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-alt)',
      }}>
        <div style={{
          background: 'white', borderRadius: 'var(--radius-lg)', padding: 40,
          border: '1px solid var(--border)', maxWidth: 400, width: '100%', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'white', fontWeight: 800, fontSize: 20,
          }}>BQ</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>MyBidQuick Platform Admin</p>
          <form onSubmit={e => { e.preventDefault(); if (password === 'admin123') setIsAuthenticated(true) }}>
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-alt)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg-dark)', color: 'white',
        padding: '20px 0', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0,
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 13,
            }}>BQ</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>MyBidQuick</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>Platform Admin</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 20px',
                background: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: activeTab === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                border: 'none', borderLeft: activeTab === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 20px' }}>
          <button
            onClick={() => { setIsAuthenticated(false); setPassword('') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: 13, padding: '8px 0',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, padding: 32 }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Welcome back, Tim. Here's your platform overview.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard icon={Users} label="Active Tenants" value={activeTenants} sub={`+2 this month`} color="var(--accent)" />
              <StatCard icon={FileText} label="Quotes This Month" value={totalQuotesMonth} sub={`+38% vs last month`} color="#10b981" />
              <StatCard icon={DollarSign} label="Revenue This Month" value={`$${totalRevenueMonth.toFixed(0)}`} sub={`$${(totalRevenueMonth / activeTenants).toFixed(0)} avg per tenant`} color="#f59e0b" />
              <StatCard icon={TrendingUp} label="Total Revenue" value={`$${totalRevenueAll.toFixed(0)}`} sub="All time" color="#8b5cf6" />
            </div>

            {/* Chart + Recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <RevenueChart tenants={tenants} />

              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
                {[
                  { text: 'Cloute Cleaning generated 12 quotes today', time: '2h ago', icon: Zap, color: '#3b82f6' },
                  { text: 'Elite Exterior Wash signed up for trial', time: '1d ago', icon: Plus, color: '#10b981' },
                  { text: 'Sparkle Clean LLC upgraded to Growth', time: '3d ago', icon: TrendingUp, color: '#8b5cf6' },
                  { text: 'Cornerstone hit 50 quotes this month', time: '5d ago', icon: CheckCircle2, color: '#f59e0b' },
                ].map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <a.icon size={16} color={a.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Tenants</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{tenants.length} cleaning companies on the platform</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                <Plus size={16} /> Add Tenant
              </button>
            </div>

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'white', borderRadius: 'var(--radius)', padding: '8px 16px',
              border: '1px solid var(--border)', marginBottom: 24,
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15 }}
              />
            </div>

            {/* Tenant list */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '8px 24px', border: '1px solid var(--border)' }}>
              {filteredTenants.map(t => (
                <TenantRow key={t.id} tenant={t} onView={setSelectedTenant} />
              ))}
            </div>

            {/* Tenant detail modal */}
            {selectedTenant && (
              <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
              }} onClick={() => setSelectedTenant(null)}>
                <div style={{
                  background: 'white', borderRadius: 'var(--radius-lg)', padding: 32,
                  maxWidth: 500, width: '90%',
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `linear-gradient(135deg, ${selectedTenant.primaryColor}, ${selectedTenant.secondaryColor})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: 18,
                    }}>{selectedTenant.businessName.charAt(0)}</div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800 }}>{selectedTenant.businessName}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedTenant.ownerName} · {selectedTenant.email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: 16, background: 'var(--bg-alt)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Quotes (month)</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedTenant.quotesThisMonth}</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-alt)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Revenue (month)</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>${selectedTenant.revenue.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-alt)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Quotes</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedTenant.quotesTotal}</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-alt)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Revenue</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>${selectedTenant.revenueTotal.toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <ExternalLink size={14} /> View Quoting Page
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedTenant(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Revenue</h1>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard icon={DollarSign} label="This Month" value={`$${totalRevenueMonth.toFixed(0)}`} sub="+38% vs last month" color="#10b981" />
              <StatCard icon={TrendingUp} label="All Time" value={`$${totalRevenueAll.toFixed(0)}`} sub={`${tenants.length} paying tenants`} color="#3b82f6" />
              <StatCard icon={FileText} label="Avg Per Quote" value="$2.00" sub="Growth plan rate" color="#f59e0b" />
            </div>

            <RevenueChart tenants={tenants} />

            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
              border: '1px solid var(--border)', marginTop: 24,
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Revenue by Tenant</h3>
              {[...tenants].sort((a, b) => b.revenue - a.revenue).map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 12,
                  }}>{t.businessName.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.businessName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.quotesThisMonth} quotes @ ${t.plan === 'pro' ? '3' : '2'}/quote</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>${t.revenue.toFixed(2)}</div>
                  <div style={{
                    width: 80, height: 6, borderRadius: 3, background: 'var(--border)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(t.revenue / totalRevenueMonth) * 100}%`,
                      height: '100%', borderRadius: 3,
                      background: `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Analytics</h1>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard icon={FileText} label="Total Quotes (All Time)" value={tenants.reduce((s, t) => s + t.quotesTotal, 0)} color="#3b82f6" />
              <StatCard icon={Users} label="Active Tenants" value={activeTenants} color="#10b981" />
              <StatCard icon={Clock} label="Avg Quotes/Tenant/Month" value={Math.round(totalQuotesMonth / activeTenants)} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Plan breakdown */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Tenants by Plan</h3>
                {['starter', 'growth', 'pro'].map(plan => {
                  const count = tenants.filter(t => t.plan === plan).length
                  const pct = Math.round((count / tenants.length) * 100)
                  const colors = { starter: '#94a3b8', growth: '#3b82f6', pro: '#8b5cf6' }
                  return (
                    <div key={plan} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{plan}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--border)' }}>
                        <div style={{
                          height: '100%', borderRadius: 4, background: colors[plan],
                          width: `${pct}%`, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Top performers */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Top Performers</h3>
                {[...tenants].sort((a, b) => b.quotesThisMonth - a.quotesThisMonth).slice(0, 4).map((t, i) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: 12,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t.businessName}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.quotesThisMonth} quotes</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Platform Settings</h1>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)', maxWidth: 600 }}>
              <div className="form-group">
                <label>Platform Name</label>
                <input defaultValue="MyBidQuick" />
              </div>
              <div className="form-group">
                <label>Admin Email</label>
                <input defaultValue="tim@mybidquick.com" />
              </div>
              <div className="form-group">
                <label>Per-Quote Price (Growth)</label>
                <input type="number" defaultValue="2.00" step="0.50" />
              </div>
              <div className="form-group">
                <label>Per-Quote Price (Pro)</label>
                <input type="number" defaultValue="3.00" step="0.50" />
              </div>
              <div className="form-group">
                <label>Free Tier Quota (quotes/month)</label>
                <input type="number" defaultValue="10" />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 8 }}>
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
