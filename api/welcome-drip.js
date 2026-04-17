// ============================================================================
// GET /api/welcome-drip
// Daily cron. Walks each tenant through the Day 1/3/5/7 welcome email drip.
// Triggered by Vercel Cron (see vercel.json "crons"). No auth required —
// Vercel routes cron traffic directly to the endpoint.
//
// Content source: docs/welcome-email-sequence.md (Emails 2-5).
// Day-0 is sent by api/send-welcome-email.js at signup time.
//
// welcome_step on tenants:
//   0 → Day-1 is the next email to send once 1+ day has passed
//   1 → Day-3 is next (3+ days)
//   2 → Day-5 is next (5+ days)
//   3 → Day-7 is next (7+ days)
//   4 → sequence complete
//
// Respects tenants.email_opt_out (skipped if true).
// Sends at most ONE email per tenant per run to keep pacing safe if a run
// is missed for a day.
// ============================================================================
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const STEP_PLAN = [
  // index = current welcome_step, must match tenant.welcome_step before sending
  { nextStep: 1, minDays: 1, email: 'day1' },
  { nextStep: 2, minDays: 3, email: 'day3' },
  { nextStep: 3, minDays: 5, email: 'day5' },
  { nextStep: 4, minDays: 7, email: 'day7' },
]

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, business_name, owner_name, email, slug, created_at, welcome_step, email_opt_out')
      .lt('welcome_step', 4)
      .or('email_opt_out.is.null,email_opt_out.eq.false')

    if (error) throw error
    if (!tenants || tenants.length === 0) {
      return res.status(200).json({ processed: 0, sent: 0 })
    }

    const now = Date.now()
    const results = { sent: [], skipped: [], failed: [] }

    for (const tenant of tenants) {
      try {
        if (!tenant.email || !tenant.slug) {
          results.skipped.push({ id: tenant.id, reason: 'missing email or slug' })
          continue
        }

        const step = tenant.welcome_step ?? 0
        const plan = STEP_PLAN[step]
        if (!plan) {
          results.skipped.push({ id: tenant.id, reason: 'step out of range' })
          continue
        }

        const created = new Date(tenant.created_at).getTime()
        const daysSince = (now - created) / (1000 * 60 * 60 * 24)
        if (daysSince < plan.minDays) {
          results.skipped.push({ id: tenant.id, reason: `only ${daysSince.toFixed(1)} days old, waiting for ${plan.minDays}` })
          continue
        }

        const firstName = (tenant.owner_name || '').trim().split(/\s+/)[0] || 'there'
        const tpl = buildEmailForStep(plan.email, {
          firstName,
          businessName: tenant.business_name,
          slug: tenant.slug,
        })

        await sendEmail({
          to: tenant.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          replyTo: 'tim@mybidquick.com',
        })

        // Advance the step so we don't send the same email again tomorrow.
        const { error: updateErr } = await supabase
          .from('tenants')
          .update({ welcome_step: plan.nextStep })
          .eq('id', tenant.id)
        if (updateErr) throw updateErr

        results.sent.push({ id: tenant.id, email: plan.email, to: tenant.email })
      } catch (err) {
        console.error(`Drip failed for tenant ${tenant.id}:`, err)
        results.failed.push({ id: tenant.id, error: err.message })
      }
    }

    return res.status(200).json({
      processed: tenants.length,
      sent: results.sent.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
      details: results,
    })
  } catch (err) {
    console.error('welcome-drip failed:', err)
    return res.status(500).json({ error: 'Drip run failed', detail: err.message })
  }
}

// ============================================================================
// Resend email sender
// ============================================================================
async function sendEmail({ to, subject, html, text, replyTo }) {
  const resendApiKey = process.env.RESEND_API_KEY
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
// Email templates — Days 1, 3, 5, 7. Content from docs/welcome-email-sequence.md
// ============================================================================
function buildEmailForStep(key, { firstName, businessName, slug }) {
  const fn = TEMPLATES[key]
  return fn({ firstName, businessName, slug })
}

const TEMPLATES = {
  day1: ({ firstName, slug }) => ({
    subject: '3 things to do in your first 10 minutes',
    text: `Hey ${firstName},

Most cleaning companies that get results with MyBidQuick do three things on day one. Takes about 10 minutes:

1. Upload your logo — Dashboard → Settings → Brand. Upload your logo and it shows up on your quote page instantly.

2. Pick your brand colors — choose your primary and accent colors so your quote page matches your website, truck wraps, and business cards.

3. Run a test quote — open ${slug}.mybidquick.com on your phone and fill it out like a customer would. See exactly what they see. Check the pricing feels right for your market.

Quick tip: your quote page works great on mobile — most of your customers will use it from their phone.

Open your dashboard: https://www.mybidquick.com/#/login

— Tim`,
    html: shell('Quick setup wins', `
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>Most cleaning companies that get results with MyBidQuick do three things on day one. Takes about 10 minutes:</p>
      <ol style="margin: 16px 0 24px 20px; padding: 0;">
        <li style="margin-bottom: 14px;"><strong>Upload your logo.</strong> Dashboard → Settings → Brand. Upload your company logo and it shows up on your quote page instantly.</li>
        <li style="margin-bottom: 14px;"><strong>Pick your brand colors.</strong> Choose your primary and accent colors so your quote page matches your website, truck wraps, and business cards.</li>
        <li style="margin-bottom: 14px;"><strong>Run a test quote.</strong> Open <a href="https://${escapeHtml(slug)}.mybidquick.com" style="color: #3b9cff;">${escapeHtml(slug)}.mybidquick.com</a> on your phone and fill it out like a customer would. Check the pricing feels right for your market.</li>
      </ol>
      <p style="color: #4a6d94; font-size: 14px; background: #f0f7ff; padding: 12px 16px; border-radius: 8px; margin: 0 0 24px;">Quick tip: your quote page works great on mobile — most of your customers will fill it out from their phone after seeing your yard sign, business card, or social post.</p>
      ${cta('Open Your Dashboard', 'https://www.mybidquick.com/#/login')}
      <p style="margin: 16px 0 0;">— Tim</p>
    `),
  }),

  day3: ({ firstName, slug }) => ({
    subject: 'Your secret weapon: the upsell cascade',
    text: `Hey ${firstName},

Here's the thing about cleaning customers: they almost never buy just one service.

The person who needs their house washed? Their windows are dirty too. And their gutters haven't been cleaned in two years.

MyBidQuick has a built-in upsell cascade that handles this automatically:

House Wash → Window Cleaning → Gutter Cleaning

After a customer selects their house wash, the flow suggests windows. After that, gutters. Each service offers three tiers — Standard, Premium, Platinum — so customers choose their comfort level.

Your average ticket goes up 40-60% without a single phone call. And the customer chose it themselves — no pressure, no awkward upselling.

Go check it out: ${slug}.mybidquick.com

— Tim`,
    html: shell('The upsell advantage', `
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>Here's the thing about cleaning customers: they almost never buy just one service.</p>
      <p>The person who needs their house washed? Their windows are dirty too. And their gutters haven't been cleaned in two years.</p>
      <p>MyBidQuick has a built-in upsell cascade that handles this automatically:</p>
      <p style="background: linear-gradient(135deg, #3b9cff 0%, #1e3a5f 100%); color: white; padding: 16px; text-align: center; border-radius: 10px; font-weight: 700; font-size: 17px; margin: 16px 0 24px;">
        House Wash → Window Cleaning → Gutter Cleaning
      </p>
      <p>After a customer selects their house wash, the flow suggests windows. After that, gutters. Each service offers three tiers — Standard, Premium, Platinum — so customers choose their comfort level.</p>
      <p><strong>Your average ticket goes up 40-60%</strong> without a single phone call. And the customer chose it themselves — no pressure, no awkward upselling.</p>
      ${cta('Preview Your Quote Flow', `https://${slug}.mybidquick.com`)}
      <p style="margin: 16px 0 0;">— Tim</p>
    `),
  }),

  day5: ({ firstName, slug }) => ({
    subject: 'How to get your first leads this week',
    text: `Hey ${firstName},

Your quote page is set up, your branding looks good — now let's get some customers to it.

5 things you can do today (all free) to start generating leads:

1. Add it to your Google Business Profile. Edit → Website → paste your MyBidQuick URL. Every Google Maps visitor gets a one-click path to a quote.

2. Put it in your social bio. Instagram, Facebook, TikTok — update your bio link to ${slug}.mybidquick.com.

3. Embed it on your website. Dashboard → Embed Code. Three options: full embed, popup button, or simple link.

4. Print QR codes on everything. Dashboard → QR Code. Download and put it on business cards, door hangers, yard signs, flyers, truck magnets.

5. Text past customers: "Hey! We just launched instant online quotes. Get yours in 60 seconds: ${slug}.mybidquick.com"

Start with one today. The leads will follow.

— Tim`,
    html: shell('Get your first leads', `
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>Your quote page is set up, your branding looks good — now let's get some customers to it.</p>
      <p>Here are <strong>5 things you can do today</strong> (all free) to start generating leads:</p>
      <ol style="margin: 16px 0 24px 20px; padding: 0;">
        <li style="margin-bottom: 12px;"><strong>Add it to your Google Business Profile.</strong> Edit → Website → paste your MyBidQuick URL. Every Google Maps visitor gets a one-click path to a quote.</li>
        <li style="margin-bottom: 12px;"><strong>Put it in your social bio.</strong> Instagram, Facebook, TikTok — update your bio link to <code style="background: #f0f4f8; padding: 2px 6px; border-radius: 4px;">${escapeHtml(slug)}.mybidquick.com</code>.</li>
        <li style="margin-bottom: 12px;"><strong>Embed it on your website.</strong> Dashboard → Embed Code. Three options: full embed, popup button, or simple link.</li>
        <li style="margin-bottom: 12px;"><strong>Print QR codes on everything.</strong> Dashboard → QR Code. Put it on business cards, door hangers, yard signs, flyers, truck magnets.</li>
        <li style="margin-bottom: 12px;"><strong>Text past customers.</strong> Send: "Hey! We just launched instant online quotes. Get yours in 60 seconds: ${escapeHtml(slug)}.mybidquick.com"</li>
      </ol>
      <p>Start with one today. The leads will follow.</p>
      ${cta('Get Your Embed Code', 'https://www.mybidquick.com/#/login')}
      <p style="margin: 16px 0 0;">— Tim</p>
    `),
  }),

  day7: ({ firstName }) => ({
    subject: 'Your 3 free credits are waiting',
    text: `Hey ${firstName},

It's been a week since you signed up for MyBidQuick. Quick check-in:

Your 3 free credits are still available.

Each credit = one qualified lead. Name, email, phone, address, and the exact services they want — delivered to your dashboard the second they submit.

If you haven't sent anyone to your quote page yet, now's the time. Pick one tactic from my last email and try it today.

When those 3 free leads come through (and they will), here's what your credit packs look like:

- Starter  — 10 credits for $25  ($2.50/lead)
- Growth   — 25 credits for $50  ($2.00/lead)
- Pro      — 50 credits for $85  ($1.70/lead)
- Agency   — 100 credits for $150 ($1.50/lead)

For context: if your average cleaning job is $300 and you close 30% of leads, a $50 credit pack returns $2,250 in revenue. That's a 45x return.

No monthly fees. No contracts. Buy credits when you need them.

Reply to this email if you have questions — I'm here to help you win.

— Tim`,
    html: shell('One week in', `
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>It's been a week since you signed up for MyBidQuick. Quick check-in:</p>
      <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 16px 0 24px; font-weight: 600;">Your 3 free credits are still available.</p>
      <p>Each credit = one qualified lead. Name, email, phone, address, and the exact services they want — delivered to your dashboard the second they submit.</p>
      <p>If you haven't sent anyone to your quote page yet, now's the time. Pick one tactic from my last email and try it today.</p>
      <p>When those 3 free leads come through (and they will), here's what your credit packs look like:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 24px; border-collapse: separate; border-spacing: 0; border-radius: 10px; overflow: hidden; border: 1px solid #e2ecf5;">
        <tr style="background: #f0f4f8;"><td style="padding: 10px 14px; font-weight: 700; color: #1e3a5f;">Starter</td><td style="padding: 10px 14px; text-align: right;">10 credits / $25 <span style="color: #7a9bbc;">($2.50/lead)</span></td></tr>
        <tr><td style="padding: 10px 14px; font-weight: 700; color: #1e3a5f; border-top: 1px solid #e2ecf5;">Growth</td><td style="padding: 10px 14px; text-align: right; border-top: 1px solid #e2ecf5;">25 credits / $50 <span style="color: #7a9bbc;">($2.00/lead)</span></td></tr>
        <tr style="background: #f0f4f8;"><td style="padding: 10px 14px; font-weight: 700; color: #1e3a5f; border-top: 1px solid #e2ecf5;">Pro</td><td style="padding: 10px 14px; text-align: right; border-top: 1px solid #e2ecf5;">50 credits / $85 <span style="color: #7a9bbc;">($1.70/lead)</span></td></tr>
        <tr><td style="padding: 10px 14px; font-weight: 700; color: #1e3a5f; border-top: 1px solid #e2ecf5;">Agency</td><td style="padding: 10px 14px; text-align: right; border-top: 1px solid #e2ecf5;">100 credits / $150 <span style="color: #7a9bbc;">($1.50/lead)</span></td></tr>
      </table>
      <p style="color: #4a6d94; font-size: 14px; background: #f0fdf4; padding: 14px 18px; border-radius: 8px;">
        For context: if your average cleaning job is $300 and you close 30% of leads, a $50 credit pack returns <strong>$2,250 in revenue</strong>. That's a 45x return.
      </p>
      <p>No monthly fees. No contracts. Buy credits when you need them.</p>
      ${cta('Buy Credits', 'https://www.mybidquick.com/#/login')}
      <p style="margin: 16px 0 0;">Reply to this email if you have questions — I'm here to help you win.</p>
      <p style="margin: 16px 0 0;">— Tim</p>
    `),
  }),
}

// ============================================================================
// Shared HTML shell + helpers
// ============================================================================
function shell(headerText, innerHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(headerText)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b9cff 0%, #1e3a5f 100%); padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">${escapeHtml(headerText)}</h1>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">MyBidQuick</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px; color: #1e293b; font-size: 16px; line-height: 1.6;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px; text-align: center; background: #f0f0f0;">
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

function cta(label, url) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
  <tr><td align="center">
    <a href="${url}" style="display: inline-block; padding: 14px 36px; background: #3b9cff; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">${escapeHtml(label)}</a>
  </td></tr>
</table>`
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// TODO (next): honor "exit early on credit purchase" rule from the sequence doc.
// Query credit_purchases for tenant → if any, bump welcome_step to 4 and skip.
