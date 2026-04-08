// ============================================================================
// POST /api/create-calendar-event
// Creates a Google Calendar event from a lead's scheduling preferences
// Body: { tenantId, lead: { name, services, total, preferredDays, preferredTime, address, phone, email } }
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'
import { decrypt, encrypt } from './_lib/encryption.js'

export default async function handler(req, res) {
  // CORS headers for frontend calls
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tenantId, lead } = req.body
  if (!tenantId || !lead) {
    return res.status(400).json({ error: 'Missing tenantId or lead data' })
  }

  try {
    // ── Step 1: Get integration record ──
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('provider', 'google_calendar')
      .single()

    if (fetchError || !integration) {
      return res.status(404).json({ error: 'Google Calendar not connected' })
    }

    if (integration.status !== 'connected') {
      return res.status(400).json({ error: `Integration status: ${integration.status}` })
    }

    // ── Step 2: Decrypt and refresh token if needed ──
    let accessToken = decrypt(integration.access_token_encrypted)
    const refreshToken = decrypt(integration.refresh_token_encrypted)

    const isExpired = integration.token_expiry && new Date(integration.token_expiry) < new Date()

    if (isExpired && refreshToken) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()

      if (!refreshResponse.ok || !refreshData.access_token) {
        // Refresh failed — mark as expired
        await supabase
          .from('integrations')
          .update({ status: 'expired' })
          .eq('id', integration.id)

        // Also update tenant config
        await supabase
          .from('tenants')
          .select('config')
          .eq('id', tenantId)
          .single()
          .then(({ data: tenant }) => {
            if (tenant) {
              supabase.from('tenants').update({
                config: { ...tenant.config, googleCalendarConnected: false }
              }).eq('id', tenantId)
            }
          })

        return res.status(401).json({ error: 'Token expired. Please reconnect Google Calendar.' })
      }

      // Update stored token
      accessToken = refreshData.access_token
      const newExpiry = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString()

      await supabase
        .from('integrations')
        .update({
          access_token_encrypted: encrypt(accessToken),
          token_expiry: newExpiry,
        })
        .eq('id', integration.id)
    }

    // ── Step 3: Build the calendar event ──
    const serviceList = Array.isArray(lead.services)
      ? lead.services.join(', ')
      : (lead.services || 'Cleaning service')

    const eventSummary = `🏠 ${lead.name} — ${serviceList}`

    const descriptionLines = [
      `Customer: ${lead.name}`,
      `Phone: ${lead.phone || 'N/A'}`,
      `Email: ${lead.email || 'N/A'}`,
      `Address: ${lead.address || 'N/A'}`,
      '',
      `Services: ${serviceList}`,
      `Quote Total: $${lead.total || '—'}`,
      '',
      `Preferred Days: ${lead.preferredDays || 'Not specified'}`,
      `Preferred Time: ${formatTime(lead.preferredTime)}`,
      '',
      '— Created from MyBidQuick',
    ]

    // Map preferred time to hour ranges
    const { startHour, endHour } = getTimeRange(lead.preferredTime)

    // Find the next matching preferred day
    const eventDate = getNextPreferredDate(lead.preferredDays)

    const startTime = new Date(eventDate)
    startTime.setHours(startHour, 0, 0, 0)

    const endTime = new Date(eventDate)
    endTime.setHours(endHour, 0, 0, 0)

    const event = {
      summary: eventSummary,
      description: descriptionLines.join('\n'),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Chicago', // Default to Central — can make tenant-configurable later
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 1440 }, // 24 hours
        ],
      },
    }

    // ── Step 4: Create the event via Google Calendar API ──
    const calResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    const calResult = await calResponse.json()

    if (!calResponse.ok) {
      console.error('Google Calendar API error:', calResult)
      return res.status(502).json({
        error: 'Failed to create calendar event',
        detail: calResult.error?.message || 'Unknown error',
      })
    }

    return res.status(200).json({
      success: true,
      eventId: calResult.id,
      eventLink: calResult.htmlLink,
    })

  } catch (err) {
    console.error('create-calendar-event error:', err)
    return res.status(500).json({ error: 'Server error creating event' })
  }
}

// ── Helpers ──

function formatTime(pref) {
  if (!pref) return 'Not specified'
  if (pref === 'morning') return 'Morning (8am–12pm)'
  if (pref === 'afternoon') return 'Afternoon (12–5pm)'
  return 'Any time'
}

function getTimeRange(pref) {
  if (pref === 'morning') return { startHour: 8, endHour: 10 }
  if (pref === 'afternoon') return { startHour: 13, endHour: 15 }
  return { startHour: 9, endHour: 11 } // default: mid-morning
}

function getNextPreferredDate(preferredDays) {
  const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const today = new Date()
  const todayDow = today.getDay() // 0=Sun

  if (!preferredDays) {
    // No preference — pick next business day
    const next = new Date(today)
    next.setDate(next.getDate() + (todayDow === 5 ? 3 : todayDow === 6 ? 2 : 1))
    return next
  }

  // Parse "Mon, Wed, Fri" format
  const days = preferredDays.split(',').map(d => d.trim())
  const preferredDows = days.map(d => dayMap[d]).filter(Boolean)

  if (preferredDows.length === 0) {
    const next = new Date(today)
    next.setDate(next.getDate() + 1)
    return next
  }

  // Find the nearest future day that matches
  for (let offset = 1; offset <= 7; offset++) {
    const candidate = new Date(today)
    candidate.setDate(candidate.getDate() + offset)
    if (preferredDows.includes(candidate.getDay())) {
      return candidate
    }
  }

  // Fallback
  const next = new Date(today)
  next.setDate(next.getDate() + 1)
  return next
}
