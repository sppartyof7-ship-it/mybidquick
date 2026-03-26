// ============================================================================
// GET /api/billing-status?tenantId=xxx
// Returns billing info for a tenant (credits, purchase history)
// ============================================================================
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tenantId = req.query.tenantId
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenantId' })
  }

  try {
    // Get tenant billing info
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('lead_credits, lead_price_cents, billing_active, stripe_customer_id')
      .eq('id', tenantId)
      .single()

    if (tenantErr) throw tenantErr

    // Get recent purchases
    const { data: purchases } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get recent lead charges
    const { data: charges } = await supabase
      .from('lead_charges')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(20)

    return res.status(200).json({
      credits: tenant?.lead_credits ?? 0,
      pricePerLead: tenant?.lead_price_cents ?? 500,
      billingActive: tenant?.billing_active ?? false,
      hasStripeCustomer: !!tenant?.stripe_customer_id,
      purchases: purchases || [],
      charges: charges || [],
    })
  } catch (err) {
    console.error('Billing status error:', err)
    return res.status(500).json({ error: err.message })
  }
}
