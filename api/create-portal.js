// ============================================================================
// POST /api/create-portal
// Creates a Stripe Customer Portal session so tenants can manage billing
// ============================================================================
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Server-side functions should use the service role key (bypasses RLS).
// Falls back to anon key if service role key is not configured yet.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  create-portal.js: SUPABASE_SERVICE_ROLE_KEY not set — using anon key')
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tenantId } = req.body
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' })
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single()

    if (error || !tenant?.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found. Purchase a lead pack first.' })
    }

    // Whitelist known origins only
    const allowedOrigins = [
      'https://www.mybidquick.com',
      'https://mybidquick.com',
      'https://mybidquick.vercel.app',
      'https://www.mybidquick.io',
      'https://www.mybidquick.org',
    ]
    const origin = allowedOrigins.includes(req.headers.origin)
      ? req.headers.origin
      : 'https://www.mybidquick.com'
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${origin}/#/dashboard`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return res.status(500).json({ error: err.message })
  }
}
