// ============================================================================
// POST /api/create-checkout
// Creates a Stripe Checkout session for buying lead credit packs
// ============================================================================
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Server-side functions should use the service role key (bypasses RLS).
// Falls back to anon key if service role key is not configured yet.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  create-checkout.js: SUPABASE_SERVICE_ROLE_KEY not set — using anon key')
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey)

// Lead credit packs — default pricing (non-discount)
const PACKS = {
  starter:  { credits: 10,  priceCents: 2500,  label: '10 Leads'  },
  growth:   { credits: 25,  priceCents: 5000,  label: '25 Leads'  },
  pro:      { credits: 50,  priceCents: 8500,  label: '50 Leads'  },
  agency:   { credits: 100, priceCents: 15000, label: '100 Leads' },
}

// LAUNCH20 discount pricing: $1/lead for life
const LAUNCH_PACKS = {
  starter:  { credits: 10,  priceCents: 1000,  label: '10 Leads'  },
  growth:   { credits: 25,  priceCents: 2500,  label: '25 Leads'  },
  pro:      { credits: 50,  priceCents: 5000,  label: '50 Leads'  },
  agency:   { credits: 100, priceCents: 10000, label: '100 Leads' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tenantId, packId } = req.body
    if (!tenantId || !packId || !PACKS[packId]) {
      return res.status(400).json({ error: 'Missing tenantId or invalid packId' })
    }

    // Look up tenant (including launch customer status)
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, email, business_name, stripe_customer_id, is_launch_customer')
      .eq('id', tenantId)
      .single()

    // Use LAUNCH20 pricing if tenant is a launch customer ($1/lead)
    const packSet = tenant?.is_launch_customer ? LAUNCH_PACKS : PACKS
    const pack = packSet[packId]

    if (tenantErr || !tenant) {
      return res.status(404).json({ error: 'Tenant not found' })
    }

    let customerId = tenant.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.business_name,
        metadata: { tenant_id: tenantId },
      })
      customerId = customer.id
      await supabase
        .from('tenants')
        .update({ stripe_customer_id: customerId })
        .eq('id', tenantId)
    }

    // Create Checkout Session — whitelist known origins only
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
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `MyBidQuick ${pack.label} Credit Pack`,
            description: `${pack.credits} lead credits for your quoting tool`,
          },
          unit_amount: pack.priceCents,
        },
        quantity: 1,
      }],
      metadata: {
        tenant_id: tenantId,
        pack_id: packId,
        credits: String(pack.credits),
      },
      success_url: `${origin}/dashboard?billing=success&credits=${pack.credits}`,
      cancel_url: `${origin}/dashboard?billing=cancelled`,
    })

    // Record the pending purchase
    await supabase.from('credit_purchases').insert({
      tenant_id: tenantId,
      stripe_session_id: session.id,
      credits_purchased: pack.credits,
      amount_cents: pack.priceCents,
      status: 'pending',
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}
