// ============================================================================
// POST /api/send-quote-confirmation
// Sends an immediate confirmation email to the customer after quote submission
// Called from createLead() in src/lib/db.js after successful lead insert
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'

// ============================================================================
// CORS + Method Handling
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

    // Validate required fields
    if (!lead || !tenant_id) {
      return res.status(400).json({ error: 'Missing lead or tenant_id' })
    }
    if (!lead.email) {
      // No email = no confirmation to send. This is OK — not all customers provide email
      return res.status(200).json({ skipped: true, reason: 'No customer email provided' })
    }

    // Fetch tenant info for branding the email
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('business_name, email, phone, slug, logo_url, primary_color, config')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant lookup failed:', tenantError)
      return res.status(404).json({ error: 'Tenant not found' })
    }

    // Build and send the email
    const html = buildConfirmationEmail(lead, tenant)
    const subject = `✓ Quote Received — ${tenant.business_name}`

    await sendEmail({
      to: lead.email,
      subject,
      html,
      replyTo: tenant.email, // Replies go to the cleaning company
    })

    return res.status(200).json({ sent: true, to: lead.email })
  } catch (err) {
    console.error('Quote confirmation email failed:', err)
    // Don't fail the lead creation — email is best-effort
    return res.status(500).json({ error: 'Email send failed', detail: err.message })
  }
}

// ============================================================================
// Resend Email Sender
// ============================================================================
async function sendEmail({ to, subject, html, replyTo }) {
  // Accept either casing — Vercel env was historically saved lowercase.
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api_key
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

  const payload = {
    from: 'MyBidQuick <noreply@mybidquick.com>',
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
// Email Template Builder
// ============================================================================
function buildConfirmationEmail(lead, tenant) {
  const businessName = tenant.business_name || 'Your Cleaning Company'
  const phone = tenant.phone || ''
  const tenantEmail = tenant.email || ''
  const firstName = (lead.name || 'there').split(' ')[0]
  const brandColor = tenant.primary_color || '#2563eb'
  const logoUrl = tenant.logo_url || ''

  // Derive a darker shade for gradients (used in header)
  const brandColorDark = darkenHex(brandColor, 0.15)

  // Build services table rows
  const services = Array.isArray(lead.services) ? lead.services : []
  const serviceRows = services
    .map((svc) => {
      // Handle both formats: string or {name, tier, price} object
      const name = typeof svc === 'string' ? svc : svc.name || svc.service || 'Service'
      const tier = typeof svc === 'object' && svc.tier ? ` (${svc.tier})` : ''
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #333;">
            ${escapeHtml(name)}${tier ? `<span style="color: #888; font-size: 13px;">${escapeHtml(tier)}</span>` : ''}
          </td>
        </tr>`
    })
    .join('')

  // Format total
  const total =
    lead.total != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.total)
      : null

  // Contact section — show what the tenant has available
  const contactLines = []
  if (phone) contactLines.push(`📞 <a href="tel:${escapeHtml(phone)}" style="color: ${brandColor}; text-decoration: none;">${escapeHtml(phone)}</a>`)
  if (tenantEmail) contactLines.push(`✉️ <a href="mailto:${escapeHtml(tenantEmail)}" style="color: ${brandColor}; text-decoration: none;">${escapeHtml(tenantEmail)}</a>`)
  const contactBlock = contactLines.length
    ? contactLines.join('<br>')
    : 'Reply to this email and we\'ll get right back to you.'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%); padding: 28px 32px; text-align: center;">
              ${logoUrl ? `
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(businessName)}" style="max-height: 48px; max-width: 200px; margin-bottom: 12px; display: inline-block;" />
              ` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                ✓ Quote Received
              </h1>
              ${!logoUrl ? `
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                ${escapeHtml(businessName)}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                Hi ${escapeHtml(firstName)},
              </p>
              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Thanks for requesting a quote from <strong>${escapeHtml(businessName)}</strong>! We've received your request and here's a summary of what you asked for:
              </p>

              <!-- Services summary -->
              ${services.length ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; border-radius: 8px; margin-bottom: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; background: ${lightenHex(brandColor, 0.9)}; font-weight: 600; color: ${brandColorDark}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Services Requested
                  </td>
                </tr>
                ${serviceRows}
              </table>
              ` : ''}

              <!-- Total -->
              ${total ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 16px; background: #f0fdf4; border-radius: 8px; text-align: right;">
                    <span style="color: #555; font-size: 14px;">Estimated Total:</span>
                    <span style="color: #166534; font-size: 22px; font-weight: 700; margin-left: 12px;">${total}</span>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- What happens next -->
              <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 17px; font-weight: 600;">
                What Happens Next
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 0 0 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: ${brandColor}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 600;">1</div>
                        </td>
                        <td style="padding-left: 10px; color: #555; font-size: 15px; line-height: 1.5;">
                          <strong style="color: #333;">We'll review your request</strong> — usually within a few hours during business hours.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: ${brandColor}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 600;">2</div>
                        </td>
                        <td style="padding-left: 10px; color: #555; font-size: 15px; line-height: 1.5;">
                          <strong style="color: #333;">We'll reach out</strong> to confirm details and answer any questions.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: ${brandColor}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 600;">3</div>
                        </td>
                        <td style="padding-left: 10px; color: #555; font-size: 15px; line-height: 1.5;">
                          <strong style="color: #333;">Schedule at your convenience</strong> — we'll find a time that works for you.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    ${phone ? `
                    <a href="tel:${escapeHtml(phone)}" style="display: inline-block; padding: 14px 36px; background: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Ready to Schedule? Call Us
                    </a>
                    <p style="margin: 10px 0 0; color: #888; font-size: 13px;">
                      Or reply to this email — it goes straight to our team.
                    </p>
                    ` : tenantEmail ? `
                    <a href="mailto:${escapeHtml(tenantEmail)}" style="display: inline-block; padding: 14px 36px; background: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Ready to Schedule? Email Us
                    </a>
                    ` : `
                    <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
                      <strong>Ready to schedule?</strong> Just reply to this email and we'll get back to you promptly.
                    </p>
                    `}
                  </td>
                </tr>
              </table>

              <!-- Trust signals -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #eee; padding-top: 20px;">
                <tr>
                  <td align="center" style="padding: 4px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px; line-height: 2;">
                      ✅ Licensed &amp; Insured&nbsp;&nbsp;•&nbsp;&nbsp;✅ Satisfaction Guaranteed&nbsp;&nbsp;•&nbsp;&nbsp;✅ No Hidden Fees
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Contact footer -->
          <tr>
            <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #333; font-size: 15px; font-weight: 600;">
                ${escapeHtml(businessName)}
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #555;">
                ${contactBlock}
              </p>
            </td>
          </tr>

          <!-- Powered by -->
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
// Utility
// ============================================================================
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Parse a hex color like '#2563eb' into [r, g, b] */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

/** Convert [r, g, b] back to '#rrggbb' */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')
}

/** Darken a hex color by a fraction (0–1). darkenHex('#2563eb', 0.15) → ~15% darker */
function darkenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

/** Lighten a hex color by mixing toward white. lightenHex('#2563eb', 0.9) → very light tint */
function lightenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
}
