// ============================================================================
// POST /api/webhook
// Stripe webhook handler — fulfills lead credit purchases
// ============================================================================
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Vercel provides the raw body for us when we disable bodyParser
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    const rawBody = await getRawBody(req)

    // If we have a webhook secret, verify the signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } else {
      // In test mode without webhook secret, parse the body directly
      event = JSON.parse(rawBody.toString())
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Webhook Error: ' + err.message })
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const tenantId = session.metadata?.tenant_id
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (tenantId && credits > 0) {
      try {
        // 1. Add credits to tenant
        const { data: tenant } = await supabase
          .from('tenants')
          .select('lead_credits')
          .eq('id', tenantId)
          .single()

        const currentCredits = tenant?.lead_credits || 0
        await supabase
          .from('tenants')
          .update({
            lead_credits: currentCredits + credits,
            billing_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId)

        // 2. Mark the purchase as completed
        await supabase
          .from('credit_purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('stripe_session_id', session.id)

        console.log(`Added ${credits} credits to tenant ${tenantId}`)
      } catch (err) {
        console.error('Error fulfilling credits:', err)
      }
    }
  }

  return res.status(200).json({ received: true })
}
