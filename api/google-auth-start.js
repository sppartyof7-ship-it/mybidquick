// ============================================================================
// GET /api/google-auth-start?tenantId=xxx
// Initiates Google OAuth flow — redirects user to Google consent screen
// ============================================================================

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
]

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tenantId } = req.query
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenantId' })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Google OAuth not configured' })
  }

  // State param: tenantId so we know who to connect on callback
  // In production you'd add a CSRF token here too
  const state = Buffer.from(JSON.stringify({ tenantId })).toString('base64url')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',     // gets us a refresh_token
    prompt: 'consent',          // always show consent to guarantee refresh_token
    state,
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  res.redirect(302, authUrl)
}
