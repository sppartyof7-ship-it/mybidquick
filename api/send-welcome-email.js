// ============================================================================
// POST /api/send-welcome-email
// Sends the Day-0 welcome email right after a new tenant finishes onboarding.
// Content source: docs/welcome-email-sequence.md → Email 1.
// Called from src/pages/Onboarding.jsx after createTenant() succeeds.
//
// This is best-effort — onboarding does NOT fail if email send fails.
// The Day 1/3/5/7 drip emails still need a scheduled cron; see TODO at bottom.
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
    const { email, ownerName, businessName, slug } = req.body || {}

    if (!email) {
      return res.status(400).json({ error: 'Missing email' })
    }
    if (!slug) {
      return res.status(400).json({ error: 'Missing slug' })
    }

    const firstName = (ownerName || '').trim().split(/\s+/)[0] || 'there'
    const subject = 'Welcome to MyBidQuick — your quote page is live'

    await sendEmail({
      to: email,
      subject,
      html: buildWelcomeEmail({ firstName, businessName, slug }),
      text: buildWelcomeEmailText({ firstName, businessName, slug }),
      replyTo: 'tim@mybidquick.com',
    })

    return res.status(200).json({ sent: true, to: email })
  } catch (err) {
    console.error('Welcome email failed:', err)
    // Don't fail onboarding — email is best-effort
    return res.status(500).json({ error: 'Welcome email send failed', detail: err.message })
  }
}

// ============================================================================
// Resend sender (same setup as send-quote-confirmation.js)
// ============================================================================
async function sendEmail({ to, subject, html, text, replyTo }) {
  // Accept either casing — Vercel env was historically saved lowercase.
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api_key
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

  const payload = {
    from: 'Tim Sullivan <tim@mybidquick.com>',
    to,
    subject,
    html,
    text,
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
    const error = await response.json().catch(() => ({}))
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// ============================================================================
// Email template — mirrors docs/welcome-email-sequence.md Email 1
// ============================================================================
function buildWelcomeEmail({ firstName, businessName, slug }) {
  const quoteUrl = `https://${slug}.mybidquick.com`
  const dashboardUrl = 'https://www.mybidquick.com/#/login'
  const greetingBiz = businessName ? ` at ${escapeHtml(businessName)}` : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MyBidQuick</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b9cff 0%, #1e3a5f 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Your quote page is live.</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Welcome to MyBidQuick</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px; color: #1e293b; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 16px;">Hey ${escapeHtml(firstName)},</p>

              <p style="margin: 0 0 16px;">Welcome to MyBidQuick — you just set up the fastest way for your customers${greetingBiz} to get cleaning quotes.</p>

              <p style="margin: 0 0 8px;">Your branded quote page is already live:</p>

              <p style="margin: 0 0 24px;">
                <a href="${quoteUrl}" style="color: #3b9cff; font-size: 18px; font-weight: 700; text-decoration: none;">→ ${escapeHtml(slug)}.mybidquick.com</a>
              </p>

              <p style="margin: 0 0 16px;">That's your page. Your company name, your services, your pricing rules. When a customer fills out a quote, you get their name, email, phone, address, and exactly what they need — delivered straight to your dashboard.</p>

              <p style="margin: 0 0 24px;">You're starting with <strong>3 free credits</strong>, which means your first 3 leads are on us.</p>

              <p style="margin: 0 0 8px; font-weight: 600;">Here's what to do next:</p>
              <ol style="margin: 0 0 24px 20px; padding: 0; color: #1e293b;">
                <li style="margin-bottom: 8px;"><strong>Visit your dashboard</strong> to upload your logo and set your brand colors</li>
                <li style="margin-bottom: 8px;"><strong>Review your pricing</strong> to make sure the tiers match your market</li>
                <li style="margin-bottom: 8px;"><strong>Share your link</strong> — text it to a friend and watch a test quote come through</li>
              </ol>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 36px; background: #3b9cff; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Open Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 4px;">If you have any questions, just reply to this email. I read every one.</p>
              <p style="margin: 16px 0 0;">Talk soon,<br>
              <strong>Tim Sullivan</strong><br>
              <span style="color: #7a9bbc; font-size: 14px;">MyBidQuick</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; text-align: center; background: #f0f0f0;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                <a href="https://www.mybidquick.com" style="color: #3b9cff; text-decoration: none;">MyBidQuick</a>
                · Instant quoting for cleaning companies
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

// Plain-text fallback — some email clients prefer this; also helps deliverability.
function buildWelcomeEmailText({ firstName, businessName, slug }) {
  const quoteUrl = `https://${slug}.mybidquick.com`
  const greetingBiz = businessName ? ` at ${businessName}` : ''
  return `Hey ${firstName},

Welcome to MyBidQuick — you just set up the fastest way for your customers${greetingBiz} to get cleaning quotes.

Your branded quote page is already live:
${quoteUrl}

That's your page. Your company name, your services, your pricing rules. When a customer fills out a quote, you get their name, email, phone, address, and exactly what they need — delivered straight to your dashboard.

You're starting with 3 free credits, which means your first 3 leads are on us.

Here's what to do next:
  1. Visit your dashboard to upload your logo and set your brand colors
  2. Review your pricing to make sure the tiers match your market
  3. Share your link — text it to a friend and watch a test quote come through

Open your dashboard: https://www.mybidquick.com/#/login

If you have any questions, just reply to this email. I read every one.

Talk soon,
Tim Sullivan
MyBidQuick
`
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

// TODO (next phase): Day 1/3/5/7 drip emails.
// Options:
//   (a) Vercel Cron daily at 9am ET → query tenants where
//       createdAt is N days ago AND welcome_step < N → send next email → bump step.
//       (Requires adding welcome_step integer column to tenants table.)
//   (b) Skip drip in code — send Email 1 only here and do Days 1/3/5/7 as
//       Gmail drafts (same pattern already in use for quote follow-ups).
