// ============================================================================
// POST /api/google-disconnect
// Revokes Google tokens and cleans up the integration record
// Body: { tenantId }
// ============================================================================
import { supabase } from './_lib/supabase-admin.js'
import { decrypt } from './_lib/encryption.js'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tenantId } = req.body
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenantId' })
  }

  try {
    // ── Step 1: Get and revoke the token at Google ──
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token_encrypted')
      .eq('tenant_id', tenantId)
      .eq('provider', 'google_calendar')
      .single()

    if (integration?.access_token_encrypted) {
      try {
        const token = decrypt(integration.access_token_encrypted)
        // Best-effort revoke — don't fail if Google is unreachable
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      } catch {
        // Revoke failed — that's OK, we still clean up locally
      }
    }

    // ── Step 2: Delete the integration record ──
    await supabase
      .from('integrations')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('provider', 'google_calendar')

    // ── Step 3: Update tenant config ──
    const { data: tenant } = await supabase
      .from('tenants')
      .select('config')
      .eq('id', tenantId)
      .single()

    if (tenant) {
      const updatedConfig = { ...tenant.config }
      updatedConfig.googleCalendarConnected = false
      delete updatedConfig.googleCalendarEmail
      await supabase
        .from('tenants')
        .update({ config: updatedConfig })
        .eq('id', tenantId)
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('google-disconnect error:', err)
    return res.status(500).json({ error: 'Server error disconnecting' })
  }
}
