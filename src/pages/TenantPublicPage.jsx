import { useState, useEffect } from 'react'
import { getTenantBySlug } from '../lib/db'

/**
 * TenantPublicPage â the customer-facing page for a tenant's subdomain.
 * When someone visits abc-cleaning.mybidquick.com, this page loads.
 * It shows the tenant's branding and embeds their quote engine.
 */
export default function TenantPublicPage({ slug }) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadTenant() {
      try {
        const found = await getTenantBySlug(slug, true)
        if (found) {
          setTenant(found)
        } else {
          setError('not-found')
        }
      } catch (err) {
        console.error('Failed to load tenant:', err)
        setError('load-error')
      } finally {
        setLoading(false)
      }
    }
    loadTenant()
  }, [slug])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: '#3b82f6', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error === 'not-found') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>404</h1>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Page Not Found</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
            This business page doesn't exist yet.
          </p>
          <a href="https://mybidquick.com" style={{
            color: '#2563eb', fontSize: 14, textDecoration: 'none', fontWeight: 500,
          }}>
            Get your own quote page â
          </a>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: 16 }}>Something went wrong. Please try again.</p>
        </div>
      </div>
    )
  }

  // Build the engine URL for this tenant's quote page
  // The mybidquick-engine (Cleanbid) is deployed separately
  const engineBaseUrl = import.meta.env.VITE_ENGINE_URL || 'https://cleanbid.vercel.app'
  const engineUrl = `${engineBaseUrl}?tenant=${tenant.slug}`

  const primaryColor = tenant.primaryColor || '#2563eb'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tenant branded header */}
      <header style={{
        background: primaryColor, color: 'white', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {tenant.logo && (
          <img
            src={tenant.logo}
            alt={`${tenant.businessName} logo`}
            style={{ height: 36, width: 36, borderRadius: 8, objectFit: 'cover', background: 'white' }}
          />
        )}
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{tenant.businessName}</h1>
          {tenant.city && tenant.state && (
            <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
              {tenant.city}, {tenant.state}
            </p>
          )}
        </div>
        {tenant.phone && (
          <a href={`tel:${tenant.phone}`} style={{
            marginLeft: 'auto', color: 'white', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, opacity: 0.9,
          }}>
            ð {tenant.phone}
          </a>
        )}
      </header>

      {/* Embedded quote engine */}
      <iframe
        src={engineUrl}
        title={`Get a quote from ${tenant.businessName}`}
        style={{
          flex: 1, width: '100%', border: 'none', minHeight: 'calc(100vh - 60px)',
        }}
      />

      {/* Powered by footer */}
      <footer style={{
        textAlign: 'center', padding: '8px 16px', background: '#f8fafc',
        borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8',
      }}>
        Powered by <a href="https://mybidquick.com" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>MyBidQuick</a>
      </footer>
    </div>
  )
}
