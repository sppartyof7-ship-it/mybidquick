// ============================================================================
// POST /api/admin-login
// Server-side admin password check. Reads ADMIN_PASSWORD (no VITE_ prefix) so
// the secret stays server-only and never ships to the client JS bundle.
//
// Called from src/pages/AdminDashboard.jsx login form.
// Returns { ok: true } on match, { ok: false } otherwise. The client stores a
// session flag in sessionStorage — this endpoint exists purely to keep the
// password off the client.
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

// Constant-time string compare. Prevents timing attacks where an attacker
// measures how long the compare takes to learn the password character-by-character.
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const cors = getCorsHeaders(origin)
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const expected = process.env.ADMIN_PASSWORD
    if (!expected) {
      console.error('ADMIN_PASSWORD env var is not set in Vercel')
      return res.status(500).json({ ok: false, error: 'Admin password not configured on server' })
    }

    const { password } = req.body || {}
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ ok: false, error: 'Missing password' })
    }

    if (timingSafeEqual(password, expected)) {
      return res.status(200).json({ ok: true })
    }
    return res.status(401).json({ ok: false, error: 'Incorrect password' })
  } catch (err) {
    console.error('admin-login failed:', err)
    return res.status(500).json({ ok: false, error: 'Login check failed' })
  }
}
