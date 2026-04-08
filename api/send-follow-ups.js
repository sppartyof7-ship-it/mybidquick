// ============================================================================
// GET /api/send-follow-ups  (triggered by Vercel Cron every hour)
//
// Scans all leads, checks each tenant's follow-up config, and sends any
// emails that are due based on delay_days since lead creation.
// Skips leads that have already been contacted, won, or lost.
// Logs every send to follow_up_logs to prevent duplicates.
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'

// ============================================================================
// Auth — Only allow Vercel Cron or manual trigger with secret
// ============================================================================
export default async function handler(req, res) {
  // Vercel Cron sends this header automatically
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  // Allow: Vercel Cron header, or Bearer token matching CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const results = await processFollowUps()
    return res.status(200).json(results)
  } catch (err) {
    console.error('Follow-up cron error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ============================================================================
// Main processing logic
// ============================================================================
async function processFollowUps() {
  const stats = { checked: 0, sent: 0, skipped: 0, errors: 0, details: [] }

  // 1. Get all tenants with their follow-up config
  const { data: tenants, error: tErr } = await supabase
    .from('tenants')
    .select('id, business_name, email, phone, logo_url, primary_color, config')

  if (tErr) throw new Error(`Tenant fetch failed: ${tErr.message}`)
  if (!tenants?.length) return { ...stats, message: 'No tenants found' }

  for (const tenant of tenants) {
    // Parse follow-up steps from tenant config
    const config = tenant.config || {}
    const followUps = config.followUp || []
    const activeSteps = followUps
      .filter((step) => step.active && step.type === 'email' && step.delay > 0)
      .sort((a, b) => a.delay - b.delay)

    if (!activeSteps.length) continue

    // 2. Get open leads for this tenant (only "new" status — don't follow up on contacted/won/lost)
    const maxDelay = Math.max(...activeSteps.map((s) => s.delay))
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDelay - 1) // Only look at leads within the follow-up window

    const { data: leads, error: lErr } = await supabase
      .from('leads')
      .select('id, name, email, services, total, package, created_at, status')
      .eq('tenant_id', tenant.id)
      .in('status', ['new', null]) // Only follow up on untouched leads
      .gte('created_at', cutoffDate.toISOString())
      .not('email', 'is', null) // Must have an email
      .neq('email', '') // Must not be empty

    if (lErr) {
      console.error(`Lead fetch for ${tenant.business_name}:`, lErr)
      stats.errors++
      continue
    }
    if (!leads?.length) continue

    // 3. Get already-sent follow-ups for these leads (to avoid duplicates)
    const leadIds = leads.map((l) => l.id)
    const { data: sentLogs } = await supabase
      .from('follow_up_logs')
      .select('lead_id, step_id')
      .in('lead_id', leadIds)
      .eq('status', 'sent')

    const sentSet = new Set((sentLogs || []).map((l) => `${l.lead_id}::${l.step_id}`))

    // 4. For each lead, check which steps are due
    for (const lead of leads) {
      stats.checked++
      const leadAge = daysSince(lead.created_at)

      for (let i = 0; i < activeSteps.length; i++) {
        const step = activeSteps[i]
        const key = `${lead.id}::${step.id}`

        // Already sent this step for this lead
        if (sentSet.has(key)) continue

        // Not due yet
        if (leadAge < step.delay) continue

        // Don't send step N if step N-1 hasn't been sent yet (sequential order)
        if (i > 0) {
          const prevKey = `${lead.id}::${activeSteps[i - 1].id}`
          if (!sentSet.has(prevKey)) continue
        }

        // 5. Send the email!
        try {
          const html = buildFollowUpEmail(lead, tenant, step)
          const subject = interpolateTemplate(step.subject || 'Following Up on Your Quote', lead, tenant)

          await sendEmail({
            to: lead.email,
            subject,
            html,
            replyTo: tenant.email,
          })

          // Log the send
          await supabase.from('follow_up_logs').insert({
            lead_id: lead.id,
            tenant_id: tenant.id,
            step_id: step.id,
            step_index: i,
            delay_days: step.delay,
            type: 'email',
            subject,
            status: 'sent',
          })

          // Update leads table too for dashboard visibility
          await supabase
            .from('leads')
            .update({
              last_follow_up_at: new Date().toISOString(),
              follow_up_stage: i + 1,
            })
            .eq('id', lead.id)

          sentSet.add(key) // Mark as sent for remaining loop iterations
          stats.sent++
          stats.details.push({
            lead: lead.name,
            tenant: tenant.business_name,
            step: step.id,
            delay: step.delay,
          })
        } catch (err) {
          console.error(`Follow-up send failed [${lead.name}/${step.id}]:`, err)
          stats.errors++

          // Log the failure too so we don't retry endlessly
          await supabase
            .from('follow_up_logs')
            .insert({
              lead_id: lead.id,
              tenant_id: tenant.id,
              step_id: step.id,
              step_index: i,
              delay_days: step.delay,
              type: 'email',
              subject: step.subject || '',
              status: 'failed',
              error: err.message,
            })
            .catch(() => {}) // Don't fail the whole loop on log insert error
        }

        // Only send ONE step per lead per cron run (avoid flooding)
        break
      }
    }
  }

  return stats
}

// ============================================================================
// Email sender (same pattern as send-quote-confirmation.js)
// ============================================================================
async function sendEmail({ to, subject, html, replyTo }) {
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
// Template variable interpolation
// ============================================================================
function interpolateTemplate(template, lead, tenant) {
  if (!template) return ''

  const firstName = (lead.name || 'there').split(' ')[0]
  const services = Array.isArray(lead.services)
    ? lead.services.map((s) => (typeof s === 'string' ? s : s.name || 'Service')).join(', ')
    : 'your services'
  const total =
    lead.total != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.total)
      : 'your quote'

  return template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{full_name\}\}/g, lead.name || 'Valued Customer')
    .replace(/\{\{services\}\}/g, services)
    .replace(/\{\{total\}\}/g, total)
    .replace(/\{\{business\}\}/g, tenant.business_name || 'us')
    .replace(/\{\{phone\}\}/g, tenant.phone || '')
    .replace(/\{\{email\}\}/g, tenant.email || '')
}

// ============================================================================
// Follow-up email HTML builder (branded, matches confirmation email style)
// ============================================================================
function buildFollowUpEmail(lead, tenant, step) {
  const businessName = tenant.business_name || 'Your Cleaning Company'
  const phone = tenant.phone || ''
  const tenantEmail = tenant.email || ''
  const firstName = (lead.name || 'there').split(' ')[0]
  const brandColor = tenant.primary_color || '#2563eb'
  const brandColorDark = darkenHex(brandColor, 0.15)
  const logoUrl = tenant.logo_url || ''

  // Interpolate the tenant's custom message body
  const bodyText = interpolateTemplate(step.body || '', lead, tenant)
  // Convert newlines to <br> and paragraphs for HTML
  const bodyHtml = bodyText
    .split('\n\n')
    .map((para) => `<p style="margin: 0 0 16px; color: #333; font-size: 16px; line-height: 1.6;">${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('')

  // Services summary (compact)
  const services = Array.isArray(lead.services) ? lead.services : []
  const serviceList = services
    .map((svc) => {
      const name = typeof svc === 'string' ? svc : svc.name || 'Service'
      const tier = typeof svc === 'object' && svc.tier ? ` (${svc.tier})` : ''
      return `${escapeHtml(name)}${escapeHtml(tier)}`
    })
    .join(' • ')

  const total =
    lead.total != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.total)
      : null

  // CTA section
  const ctaHtml = phone
    ? `<a href="tel:${escapeHtml(phone)}" style="display: inline-block; padding: 14px 36px; background: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
        Call Us to Schedule
      </a>
      <p style="margin: 10px 0 0; color: #888; font-size: 13px;">
        Or reply to this email — it goes straight to our team.
      </p>`
    : tenantEmail
      ? `<a href="mailto:${escapeHtml(tenantEmail)}" style="display: inline-block; padding: 14px 36px; background: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Email Us to Schedule
        </a>`
      : `<p style="margin: 0; color: #555; font-size: 15px;">Just reply to this email and we'll get back to you.</p>`

  // Contact block for footer
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
  <title>${escapeHtml(interpolateTemplate(step.subject || 'Following Up', lead, tenant))}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%); padding: 24px 32px; text-align: center;">
              ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(businessName)}" style="max-height: 44px; max-width: 180px; margin-bottom: 8px; display: inline-block;" />` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                ${escapeHtml(businessName)}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Tenant's custom follow-up message -->
              ${bodyHtml}

              <!-- Quote reminder box -->
              ${services.length || total ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; margin: 0 0 24px; border-left: 4px solid ${brandColor};">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Quote</p>
                    ${serviceList ? `<p style="margin: 0 0 6px; color: #333; font-size: 15px;">${serviceList}</p>` : ''}
                    ${total ? `<p style="margin: 0; color: #166534; font-size: 20px; font-weight: 700;">${total}</p>` : ''}
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    ${ctaHtml}
                  </td>
                </tr>
              </table>

              <!-- Trust bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #eee; padding-top: 16px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #666; font-size: 13px;">
                      ✅ Licensed &amp; Insured&nbsp;&nbsp;•&nbsp;&nbsp;✅ Satisfaction Guaranteed&nbsp;&nbsp;•&nbsp;&nbsp;✅ No Hidden Fees
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #333; font-size: 15px; font-weight: 600;">${escapeHtml(businessName)}</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #555;">${contactBlock}</p>
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
// Utilities
// ============================================================================
function daysSince(dateStr) {
  const then = new Date(dateStr)
  const now = new Date()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hexToRgb(hex) {
  const h = (hex || '#2563eb').replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')
}

function darkenHex(hex, amount = 0.15) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
