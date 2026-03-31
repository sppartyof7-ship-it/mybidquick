// ============================================================================
// POST /api/webhook
// Stripe webhook handler — fulfills lead credit purchases
// Events: checkout.session.completed, checkout.session.expired
// ============================================================================
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Vercel serverless config: disable body parsing so we get raw body for signature verification
export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let event
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  try {
    const rawBody = await getRawBody(req)

    if (webhookSecret) {
      // Production: verify Stripe signature
      const sig = req.headers['stripe-signature']
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } else {
      // Dev/testing: accept without signature (remove before going live)
      console.warn('⚠️  No STRIPE_WEBHOOK_SECRET set — skipping signature verification')
      event = JSON.parse(rawBody.toString())
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // ── Handle events ──────────────────────────────────────────────────────
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object
      const tenantId = session.metadata?.tenant_id
      const packId = session.metadata?.pack_id
      const credits = parseInt(session.metadata?.credits, 10)

      if (!tenantId || !credits) {
        console.error('Missing metadata in checkout session:', session.id)
        return res.status(400).json({ error: 'Missing tenant_id or credits in metadata' })
      }

      console.log(`✅ Checkout completed: tenant=${tenantId}, pack=${packId}, credits=${credits}`)

      try {
        // 1. Add credits to tenant's balance
        const { data: tenant, error: fetchErr } = await supabase
          .from('tenants')
          .select('lead_credits')
          .eq('id', tenantId)
          .single()

        if (fetchErr) throw fetchErr

        const currentCredits = tenant?.lead_credits ?? 0
        const newCredits = currentCredits + credits

        const { error: updateErr } = await supabase
          .from('tenants')
          .update({
            lead_credits: newCredits,
            billing_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId)

        if (updateErr) throw updateErr

        // 2. Mark the purchase as completed
        const { error: purchaseErr } = await supabase
          .from('credit_purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('stripe_session_id', session.id)

        if (purchaseErr) {
          console.error('Failed to update purchase record:', purchaseErr)
          // Don't fail the webhook — credits were already added
        }

        console.log(`Credits added: tenant=${tenantId}, ${currentCredits} -> ${newCredits} (+${credits})`)
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err)
        return res.status(500).json({ error: 'Failed to process payment' })
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      try {
        await supabase
          .from('credit_purchases')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id)
        console.log(`⏰ Checkout expired: session=${session.id}`)
      } catch (err) {
        console.error('Error handling expired session:', err)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Always return 200 to acknowledge receipt
  return res.status(200).json({ received: true })
}
