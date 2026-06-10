// ============================================================================
// GET /api/send-followups
// Daily cron. For each tenant with active follow-up sequences, find leads
// where the next-due follow-up step is past its `delay` window, and send it.
//
// Behavior:
// - Sends ONE follow-up per lead per cron run (paces sends; safe if we
//   miss a day).
// - Only sends email steps in v1. SMS steps are skipped with a logged
//   reason — UI keeps the toggle so we can wire Twilio later without churn.
// - Idempotent: tracks sent step IDs in leads.follow_ups_sent and won't
//   re-send a step it's already fired.
// - Skips leads in any TERMINAL_STATUSES (won, lost, scheduled, booked,
//   complete, paid) and leads marked paid_at. Once a deal is won/accepted the
//   lead drops off follow-ups automatically — no manual step required.
// - Respects step.active toggle. If a tenant deactivates a step mid-run,
//   it's skipped on the next cron.
//
// Cron schedule: vercel.json → 0 14 * * * (9am Eastern, 14:00 UTC).
// Triggered by Vercel Cron — no auth required, Vercel routes directly.
//
// Lookback cap: leads older than MAX_LEAD_AGE_DAYS are ignored entirely.
// Prevents a one-time flood on first deploy where months-old leads would
// suddenly qualify for steps 0-3 over the next few cron runs.
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'
import { substituteTemplate } from './_lib/followup-template.js'

const MAX_LEAD_AGE_DAYS = 60

// Statuses that mean the deal is closed/accepted — these leads must NEVER
// receive follow-ups. A won/scheduled customer who keeps getting "ready to
// book?" nudges is the exact bug this list prevents. Extend here if the CRM
// adds new "accepted" stages. Matching is case-insensitive (see below).
const TERMINAL_STATUSES = ['won', 'lost', 'scheduled', 'booked', 'complete', 'completed', 'paid']

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const cors = getCorsHeaders(origin)
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  // Allow GET (Vercel cron) and POST (manual trigger from admin)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // ---- 1. Load every tenant that has follow-up configured + their leads --
    const { data: tenants, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, business_name, email, phone, slug, primary_color, config')

    if (tenantErr) throw tenantErr
    if (!tenants || tenants.length === 0) {
      return res.status(200).json({ processed: 0, sent: 0 })
    }

    const results = { sent: [], skipped: [], failed: [] }
    const now = Date.now()

    // ---- 2. For each tenant, walk their open leads --------------------------
    for (const tenant of tenants) {
      const sequence = Array.isArray(tenant.config && tenant.config.followUp)
        ? tenant.config.followUp
        : []
      if (!sequence.length) continue

      const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('id, name, email, phone, address, services, total, status, created_at, paid_at, follow_ups_sent, last_follow_up_at')
        .eq('tenant_id', tenant.id)
        .not('email', 'is', null)
        .not('status', 'in', '(' + TERMINAL_STATUSES.map((s) => '"' + s + '"').join(',') + ')')
        .is('paid_at', null)

      if (leadErr) {
        results.failed.push({ tenant: tenant.slug, error: leadErr.message })
        continue
      }
      if (!leads || !leads.length) continue

      // ---- 3. For each lead, find the first eligible step ------------------
      for (const lead of leads) {
        try {
          // Belt-and-suspenders: never follow up a closed/accepted lead, even
          // if the DB filter above is ever loosened. Case-insensitive match.
          if (lead.status && TERMINAL_STATUSES.includes(String(lead.status).toLowerCase())) {
            continue
          }

          const alreadySent = Array.isArray(lead.follow_ups_sent) ? lead.follow_ups_sent : []
          const createdMs = new Date(lead.created_at).getTime()
          const ageDays = (now - createdMs) / (1000 * 60 * 60 * 24)

          // Lookback cap: skip leads older than the cap. Prevents day-one
          // flood after first deploy. Leads stale this long won't engage
          // with a follow-up anyway.
          if (ageDays > MAX_LEAD_AGE_DAYS) continue

          // Find the first step that:
          //   - is active
          //   - is due (delay elapsed)
          //   - hasn't already been sent for this lead
          let stepIndex = -1
          let step = null
          for (let i = 0; i < sequence.length; i++) {
            const s = sequence[i]
            if (!s || !s.active) continue
            if (alreadySent.includes(i)) continue
            const delayDays = Number(s.delay)
            if (!isFinite(delayDays)) continue
            if (ageDays < delayDays) continue
            stepIndex = i
            step = s
            break
          }
          if (!step) continue

          // ---- 4. SMS not wired yet — skip cleanly --------------------------
          if (step.type === 'sms') {
            results.skipped.push({
              tenant: tenant.slug,
              lead: lead.id,
              step: stepIndex,
              reason: 'sms-not-wired',
            })
            // Mark as "sent" anyway so we don't get stuck on this step every run.
            await markStepSent(lead, stepIndex)
            continue
          }

          if (step.type !== 'email') {
            results.skipped.push({
              tenant: tenant.slug,
              lead: lead.id,
              step: stepIndex,
              reason: 'unsupported-type:' + step.type,
            })
            await markStepSent(lead, stepIndex)
            continue
          }

          // ---- 5. Build + send the email -----------------------------------
          const subject = substituteTemplate(step.subject || 'Following up on your quote', { lead, tenant })
          const bodyText = substituteTemplate(step.body || '', { lead, tenant })
          const html = wrapAsHtml(bodyText, tenant)

          await sendEmail({
            to: lead.email,
            subject,
            html,
            text: bodyText,
            replyTo: tenant.email || undefined,
            fromName: tenant.business_name || 'MyBidQuick',
          })

          await markStepSent(lead, stepIndex)

          results.sent.push({
            tenant: tenant.slug,
            lead: lead.id,
            step: stepIndex,
            to: lead.email,
          })
        } catch (err) {
          console.error('Follow-up failed for lead ' + lead.id + ':', err)
          results.failed.push({ tenant: tenant.slug, lead: lead.id, error: err.message })
        }
      }
    }

    return res.status(200).json({
      sent: results.sent.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
      details: results,
    })
  } catch (err) {
    console.error('send-followups failed:', err)
    return res.status(500).json({ error: 'Cron failed', detail: err.message })
  }
}

// ============================================================================
// Append the step index to leads.follow_ups_sent and stamp last_follow_up_at.
// Reads current array first so concurrent writes don't clobber each other.
// ============================================================================
async function markStepSent(lead, stepIndex) {
  const current = Array.isArray(lead.follow_ups_sent) ? [...lead.follow_ups_sent] : []
  if (!current.includes(stepIndex)) current.push(stepIndex)

  const { error } = await supabase
    .from('leads')
    .update({
      follow_ups_sent: current,
      last_follow_up_at: new Date().toISOString(),
      follow_up_stage: current.length,
    })
    .eq('id', lead.id)

  if (error) throw error
}

// ============================================================================
// Resend email sender. Tenant's business name is shown as the From: name,
// but the address stays on send.mybidquick.com (Resend DNS) — replies are
// routed back to the tenant via reply_to.
// ============================================================================
async function sendEmail({ to, subject, html, text, replyTo, fromName }) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api_key
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

  // Sanitize the from-name (no commas, no angle brackets, < 60 chars).
  const safeName = String(fromName || 'MyBidQuick')
    .replace(/[<>,"]/g, '')
    .trim()
    .slice(0, 60) || 'MyBidQuick'

  const payload = {
    from: safeName + ' <noreply@send.mybidquick.com>',
    to,
    subject,
    html,
    text,
  }
  if (replyTo) payload.reply_to = replyTo

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + resendApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error('Resend error: ' + JSON.stringify(error))
  }
  return response.json()
}

// ============================================================================
// Wrap the tenant's plain-text follow-up body in a minimal branded shell.
// Plain paragraphs only — tenants write conversationally, we don't want to
// over-design what they typed.
// ============================================================================
function wrapAsHtml(plainText, tenant) {
  const brandColor = (tenant && tenant.primary_color) || '#3b9cff'
  const businessName = (tenant && tenant.business_name) || 'Our team'
  const phone = (tenant && tenant.phone) || ''
  const email = (tenant && tenant.email) || ''

  const paragraphs = String(plainText || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => '<p style="margin:0 0 14px;color:#1e293b;font-size:16px;line-height:1.6;">' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>')
    .join('')

  const contactBits = []
  if (phone) contactBits.push('<a href="tel:' + escapeHtml(phone) + '" style="color:' + brandColor + ';text-decoration:none;">' + escapeHtml(phone) + '</a>')
  if (email) contactBits.push('<a href="mailto:' + escapeHtml(email) + '" style="color:' + brandColor + ';text-decoration:none;">' + escapeHtml(email) + '</a>')
  const contactLine = contactBits.length
    ? '<p style="margin:8px 0 0;color:#64748b;font-size:13px;">' + contactBits.join(' &nbsp;·&nbsp; ') + '</p>'
    : ''

  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f8;"><tr><td align="center" style="padding:32px 16px;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">',
    '<tr><td style="padding:28px 32px 8px;">',
    paragraphs,
    '<hr style="border:none;border-top:1px solid #eef2f7;margin:24px 0 16px;">',
    '<p style="margin:0;color:#1e293b;font-size:14px;font-weight:600;">' + escapeHtml(businessName) + '</p>',
    contactLine,
    '</td></tr>',
    '<tr><td style="padding:14px 32px;text-align:center;background:#f0f0f0;"><p style="margin:0;color:#999;font-size:12px;">Powered by <a href="https://www.mybidquick.com" style="color:#2563eb;text-decoration:none;">MyBidQuick</a></p></td></tr>',
    '</table></td></tr></table></body></html>',
  ].join('')
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
