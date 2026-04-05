// ============================================================================
// GET /api/weekly-pipeline-email
// Sends weekly pipeline summary emails to all tenants
// Triggers: Weekly via scheduled task (Mondays 8am ET)
// ============================================================================
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Format currency for display
function formatCurrency(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

// Calculate week date range (Monday-Sunday)
function getWeekDateRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)

  const monday = new Date(now.setDate(diff))
  const sunday = new Date(now.setDate(diff + 6))

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return {
    start: formatter.format(monday),
    end: formatter.format(sunday),
  }
}

// Generate HTML email template
function generateEmailHTML(tenant, pipelineData, weekRange) {
  const conversionRate = pipelineData.contacted > 0
    ? Math.round((pipelineData.won / pipelineData.contacted) * 100)
    : 0
  const revenueWon = formatCurrency(pipelineData.totalRevenue)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your MyBidQuick Weekly Pipeline Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .kpi-label {
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .pipeline-section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 12px;
    }
    .pipeline-table {
      width: 100%;
      border-collapse: collapse;
    }
    .pipeline-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .pipeline-table td:first-child {
      color: #6b7280;
      font-size: 14px;
    }
    .pipeline-table td:last-child {
      text-align: right;
      font-weight: 600;
      color: #2563eb;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 14px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin: 30px 0;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Pipeline Report</h1>
      <p>Week of ${weekRange.start} – ${weekRange.end}</p>
    </div>

    <div class="content">
      <div class="greeting">
        <p>Hi <strong>${tenant.owner_name || 'there'}</strong>,</p>
        <p style="margin-top: 12px;">Here's a snapshot of your pipeline activity this week. Keep pushing!</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${pipelineData.newLeads}</div>
          <div class="kpi-label">New Leads</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${conversionRate}%</div>
          <div class="kpi-label">Conversion Rate</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${revenueWon}</div>
          <div class="kpi-label">Revenue Won</div>
        </div>
      </div>

      <div class="pipeline-section">
        <div class="section-title">Pipeline Breakdown</div>
        <table class="pipeline-table">
          <tr>
            <td>Pending</td>
            <td>${pipelineData.pending}</td>
          </tr>
          <tr>
            <td>Contacted</td>
            <td>${pipelineData.contacted}</td>
          </tr>
          <tr>
            <td>Won</td>
            <td>${pipelineData.won}</td>
          </tr>
          <tr>
            <td>Lost</td>
            <td>${pipelineData.lost}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="https://www.mybidquick.com/dashboard" class="cta-button">View Full Dashboard</a>
      </div>

      <p style="margin-top: 20px; font-size: 13px; color: #6b7280; line-height: 1.6;">
        This is an automated report sent every Monday morning. Log in to your dashboard anytime to track your leads and manage your pipeline in real-time.
      </p>
    </div>

    <div class="footer">
      <p><strong>MyBidQuick</strong></p>
      <p><a href="mailto:tim@mybidquick.com">tim@mybidquick.com</a></p>
      <p style="margin-top: 12px; opacity: 0.7;">Copyright © 2026 MyBidQuick. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Send email via Resend
async function sendEmail(to, subject, html) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'tim@mybidquick.com',
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// Get pipeline data for a tenant
async function getPipelineData(tenantId) {
  // Get leads from the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('created_at', sevenDaysAgo)

  if (error) throw error

  // Compute metrics
  const newLeads = leads.length
  const pending = leads.filter(l => l.status === 'pending').length
  const won = leads.filter(l => l.status === 'won').length
  const lost = leads.filter(l => l.status === 'lost').length
  const contacted = won + lost // Contacted = won + lost (those with final status)

  const totalRevenue = leads
    .filter(l => l.status === 'won')
    .reduce((sum, l) => sum + (parseFloat(l.total) * 100 || 0), 0) // Convert to cents

  return {
    newLeads,
    pending,
    contacted,
    won,
    lost,
    totalRevenue: Math.round(totalRevenue),
  }
}

export default async function handler(req, res) {
  // Only allow GET requests (can be triggered via cron/scheduled task)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Get all active tenants
    const { data: tenants, error: tenantsErr } = await supabase
      .from('tenants')
      .select('id, business_name, owner_name, email')

    if (tenantsErr) throw tenantsErr

    if (!tenants || tenants.length === 0) {
      console.log('No tenants found')
      return res.status(200).json({ message: 'No tenants to process' })
    }

    console.log(`Processing pipeline emails for ${tenants.length} tenants`)

    const weekRange = getWeekDateRange()
    const results = {
      sent: [],
      failed: [],
    }

    // 2. For each tenant, get pipeline data and send email
    for (const tenant of tenants) {
      try {
        const pipelineData = await getPipelineData(tenant.id)
        const html = generateEmailHTML(tenant, pipelineData, weekRange)

        await sendEmail(
          tenant.email,
          'Your MyBidQuick Weekly Pipeline Report',
          html
        )

        console.log(`✅ Email sent to ${tenant.email}`)
        results.sent.push({
          tenantId: tenant.id,
          email: tenant.email,
          businessName: tenant.business_name,
        })
      } catch (err) {
        console.error(`❌ Failed to send email to ${tenant.email}:`, err.message)
        results.failed.push({
          tenantId: tenant.id,
          email: tenant.email,
          error: err.message,
        })
      }
    }

    return res.status(200).json({
      message: `Processed ${tenants.length} tenants`,
      sent: results.sent.length,
      failed: results.failed.length,
      details: results,
    })
  } catch (err) {
    console.error('Pipeline email job failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
