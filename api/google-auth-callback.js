// ============================================================================
// GET /api/google-auth-callback?code=xxx&state=xxx
// Google redirects here after user consents
// Exchanges auth code → tokens → encrypts → stores → redirects to dashboard
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'
import { encrypt } from './_lib/encryption.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, state, error: oauthError } = req.query

  // User denied access
  if (oauthError) {
    return res.redirect(302, '/#/dashboard?gcal=denied')
  }

  if (!code || !state) {
    return res.redirect(302, '/#/dashboard?gcal=error&reason=missing_params')
  }

  // Decode state to get tenantId
  let tenantId
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    tenantId = decoded.tenantId
  } catch {
    return res.redirect(302, '/#/dashboard?gcal=error&reason=invalid_state')
  }

  if (!tenantId) {
    return res.redirect(302, '/#/dashboard?gcal=error&reason=no_tenant')
  }

  try {
    // ── Step 1: Exchange auth code for tokens ──
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error('Token exchange failed:', tokens)
      return res.redirect(302, '/#/dashboard?gcal=error&reason=token_exchange')
    }

    // ── Step 2: Get the user's email (for display + provider_account_id) ──
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileResponse.json()
    const calendarEmail = profile.email || 'unknown'
    const providerAccountId = profile.id || profile.email

    // ── Step 3: Encrypt tokens ──
    const accessTokenEncrypted = encrypt(tokens.access_token)
    const refreshTokenEncrypted = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null

    // Token expiry: Google gives expires_in in seconds
    const tokenExpiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    // ── Step 4: Upsert into integrations table ──
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        tenant_id: tenantId,
        provider: 'google_calendar',
        provider_account_id: providerAccountId,
        calendar_email: calendarEmail,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expiry: tokenExpiry,
        scopes: ['calendar.events'],
        status: 'connected',
      }, {
        onConflict: 'tenant_id,provider',
      })

    if (upsertError) {
      console.error('Supabase upsert failed:', upsertError)
      return res.redirect(302, '/#/dashboard?gcal=error&reason=db_save')
    }

    // ── Step 5: Update tenant config to reflect connected state ──
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('config')
      .eq('id', tenantId)
      .single()

    if (!fetchError && tenant) {
      const updatedConfig = {
        ...tenant.config,
        googleCalendarConnected: true,
        googleCalendarEmail: calendarEmail,
        featureToggles: {
          ...(tenant.config?.featureToggles || {}),
          googleCalendar: true,
        },
      }
      await supabase
        .from('tenants')
        .update({ config: updatedConfig })
        .eq('id', tenantId)
    }

    // ── Step 6: Redirect back to dashboard with success ──
    return res.redirect(302, '/#/dashboard?gcal=connected')

  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return res.redirect(302, '/#/dashboard?gcal=error&reason=server_error')
  }
}
