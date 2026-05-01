// ============================================================================
// POST /api/send-lead-notification
// Sends a "you have a new lead!" email to the cleaning company (tenant) when a
// customer submits a quote on their slug.mybidquick.com page. Mirrors
// send-quote-confirmation.js but the audience is the tenant, not the customer.
//
// Replaces the legacy Web3Forms path in mybidquick-engine. Tenants no longer
// need a third-party access key — they just set `leadEmail` in their dashboard.
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'

// ============================================================================
// CORS — must allow the engine subdomains (cornerstone.mybidquick.com etc.)
// ============================================================================
const ALLOWED_ORIGINS = [
  'https://www.mybidquick.com',
  'https://mybidquick.com',
  'http://localhost:5173',
  'http://localhost:5174',
]

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(
    (o) => origin === o || (origin && origin.endsWith('.mybidquick.com'))
  )
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const cors = getCorsHeaders(origin)
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lead, tenant_id } = req.body

    if (!lead || !tenant_id) {
      return res.status(400).json({ error: 'Missing lead or tenant_id' })
    }

    // Fetch tenant info — we need leadEmail (config) and brand basics
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('business_name, email, phone, slug, primary_color, config')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant lookup failed:', tenantError)
      return res.status(404).json({ error: 'Tenant not found' })
    }

    // Where to send the notification: prefer config.leadEmail, fall back to
    // the login email. If neither is set we can't send.
    const recipient = tenant.config?.leadEmail || tenant.email
    if (!recipient) {
      return res
        .status(200)
        .json({ skipped: true, reason: 'No leadEmail configured for tenant' })
    }

    const html = buildLeadNotificationEmail(lead, tenant)
    const subject = buildSubject(lead, tenant)

    await sendEmail({
      to: recipient,
      subject,
      html,
      // Replies from Noah land in the customer's inbox. Critical UX — lets
      // Noah hit Reply and start a conversation instantly.
      replyTo: lead.email || undefined,
    })

    return res.status(200).json({ sent: true, to: recipient })
  } catch (err) {
    console.error('Lead notification email failed:', err)
    return res.status(500).json({ error: 'Email send failed', detail: err.message })
  }
}

// ============================================================================
// Resend Email Sender — same shape as send-quote-confirmation.js
// ============================================================================
async function sendEmail({ to, subject, html, replyTo }) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api_key
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

  const payload = {
    from: 'MyBidQuick Leads <leads@mybidquick.com>',
    to,
    subject,
    html,
  }
  if (replyTo) payload.reply_to = replyTo

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// ============================================================================
// Subject builder — short, scannable, hits the inbox preview line hard
// ============================================================================
function buildSubject(lead, tenant) {
  const total = formatMoney(lead.total)
  const name = lead.name || 'Customer'
  const services = serviceList(lead, tenant).join(', ')
  const tail = services ? ` — ${services}` : ''
  return total
    ? `New Lead: ${name} — ${total}${tail}`
    : `New Lead: ${name}${tail}`
}

// ============================================================================
// Email Template — keep it scannable, action-oriented
// Design rule (from project): NEVER show pricing formulas, multipliers, or
// per-sqft rates. Final dollar amounts only.
// ============================================================================
function buildLeadNotificationEmail(lead, tenant) {
  const businessName = tenant.business_name || 'Your Cleaning Company'
  const brandColor = tenant.primary_color || '#2563eb'
  const brandColorDark = darkenHex(brandColor, 0.15)
  const slug = tenant.slug || ''

  const customerName = lead.name || 'Unnamed customer'
  const customerEmail = lead.email || ''
  const customerPhone = lead.phone || ''
  const customerAddress = lead.address || ''
  const projectType = lead.projectType || ''
  const leadSource = lead.leadSource || ''
  const notes = lead.notes || ''
  const photoCount = Array.isArray(lead.photos) ? lead.photos.length : 0
  const preferredDays = lead.preferredDays || ''
  const preferredTime = lead.preferredTime || ''

  const services = serviceList(lead, tenant)
  const total = formatMoney(lead.total)
  const selectedPackage = lead.package || lead.selectedPackage || ''

  // Service rows with per-service prices (final $ only — no formulas)
  const serviceRows = services
    .map((name, i) => {
      const id = Array.isArray(lead.services) ? lead.services[i] : null
      const price = id && lead.servicePrices ? lead.servicePrices[id] : null
      const priceCell = price != null
        ? `<td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1e3a5f; font-weight: 600;">${formatMoney(price)}</td>`
        : `<td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0;"></td>`
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #333;">${escapeHtml(name)}</td>
          ${priceCell}
        </tr>`
    })
    .join('')

  const dashboardUrl = `https://www.mybidquick.com/#/dashboard`
  const slugUrl = slug ? `https://${slug}.mybidquick.com` : ''

  const contactRows = [
    customerEmail
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc; width: 90px;">Email:</td><td style="padding: 4px 0; color: #1e3a5f;"><a href="mailto:${escapeHtml(customerEmail)}" style="color: ${brandColor}; text-decoration: none;">${escapeHtml(customerEmail)}</a></td></tr>`
      : '',
    customerPhone
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc;">Phone:</td><td style="padding: 4px 0; color: #1e3a5f;"><a href="tel:${escapeHtml(customerPhone)}" style="color: ${brandColor}; text-decoration: none;">${escapeHtml(customerPhone)}</a></td></tr>`
      : '',
    customerAddress
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc;">Address:</td><td style="padding: 4px 0; color: #1e3a5f;">${escapeHtml(customerAddress)}</td></tr>`
      : '',
    projectType
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc;">Type:</td><td style="padding: 4px 0; color: #1e3a5f;">${escapeHtml(projectType)}</td></tr>`
      : '',
    leadSource
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc;">Source:</td><td style="padding: 4px 0; color: #1e3a5f;">${escapeHtml(leadSource)}</td></tr>`
      : '',
    (preferredDays || preferredTime)
      ? `<tr><td style="padding: 4px 0; color: #7a9bbc;">Prefers:</td><td style="padding: 4px 0; color: #1e3a5f;">${escapeHtml([preferredDays, preferredTime].filter(Boolean).join(' • '))}</td></tr>`
      : '',
  ]
    .filter(Boolean)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%); padding: 24px 32px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">${escapeHtml(businessName)}</p>
              <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                💼 New Lead${total ? ` — ${total}` : ''}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">

              <h2 style="margin: 0 0 6px; color: #1e3a5f; font-size: 20px; font-weight: 700;">${escapeHtml(customerName)}</h2>
              <p style="margin: 0 0 20px; color: #7a9bbc; font-size: 13px;">Submitted just now via your quoting page</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; margin-bottom: 24px;">
                ${contactRows}
              </table>

              ${services.length ? `
              <h3 style="margin: 0 0 12px; color: #1e3a5f; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Services Requested</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
                ${serviceRows}
                ${total ? `
                <tr>
                  <td style="padding: 14px 16px; background: #f0fdf4; color: #166534; font-weight: 700;">Quote Total</td>
                  <td style="padding: 14px 16px; background: #f0fdf4; color: #166534; font-weight: 800; text-align: right; font-size: 18px;">${total}</td>
                </tr>
                ` : ''}
              </table>
              ` : ''}

              ${selectedPackage ? `
              <p style="margin: 0 0 16px; color: #555; font-size: 14px;">
                <strong style="color: #1e3a5f;">Package selected:</strong> ${escapeHtml(String(selectedPackage))}
              </p>
              ` : ''}

              ${notes ? `
              <div style="padding: 14px 16px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Customer notes</p>
                <p style="margin: 0; color: #1e3a5f; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(notes)}</p>
              </div>
              ` : ''}

              ${photoCount ? `
              <p style="margin: 0 0 24px; color: #7a9bbc; font-size: 13px;">📎 Customer uploaded ${photoCount} photo${photoCount === 1 ? '' : 's'} (view in dashboard).</p>
              ` : ''}

              <!-- Action buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 8px 0 16px;">
                <tr>
                  ${customerPhone ? `
                  <td align="center" style="padding: 4px;">
                    <a href="tel:${escapeHtml(customerPhone)}" style="display: inline-block; padding: 12px 24px; background: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">📞 Call now</a>
                  </td>
                  ` : ''}
                  ${customerEmail ? `
                  <td align="center" style="padding: 4px;">
                    <a href="mailto:${escapeHtml(customerEmail)}" style="display: inline-block; padding: 12px 24px; background: #ffffff; color: ${brandColor}; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid ${brandColor};">✉️ Email customer</a>
                  </td>
                  ` : ''}
                </tr>
              </table>

              <p style="margin: 16px 0 0; color: #7a9bbc; font-size: 13px;">
                💡 <strong>Tip:</strong> Just hit Reply — your message goes straight to the customer.
              </p>

              <hr style="border: none; border-top: 1px solid #e2ecf5; margin: 24px 0;">

              <p style="margin: 0; color: #7a9bbc; font-size: 13px; line-height: 1.6;">
                Manage all your leads in your <a href="${dashboardUrl}" style="color: ${brandColor}; text-decoration: none; font-weight: 600;">MyBidQuick dashboard</a>${slugUrl ? ` &nbsp;·&nbsp; <a href="${slugUrl}" style="color: ${brandColor}; text-decoration: none; font-weight: 600;">view your quote page</a>` : ''}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; text-align: center; background: #f0f0f0;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Powered by <a href="https://www.mybidquick.com" style="color: #2563eb; text-decoration: none;">MyBidQuick</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// ============================================================================
// Helpers
// ============================================================================
function serviceList(lead, tenant) {
  const ids = Array.isArray(lead.services) ? lead.services : []
  if (!ids.length) return []
  const services = (tenant.config && Array.isArray(tenant.config.services)) ? tenant.config.services : []
  return ids.map((id) => {
    if (typeof id === 'string') {
      const svc = services.find((s) => s.id === id)
      if (svc && svc.name) return svc.name
      return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
    if (id && typeof id === 'object') return id.name || id.service || 'Service'
    return 'Service'
  })
}

function formatMoney(v) {
  if (v == null) return null
  const n = Number(v)
  if (!isFinite(n)) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')
}

function darkenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
