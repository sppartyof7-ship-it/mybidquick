// ============================================================================
// BILLING LAYER - Stripe per-lead billing client utilities
// ============================================================================
// This file handles all client-side billing operations.
// Server-side operations happen in /api/ serverless functions.

const API_BASE = '/api'

/**
 * Get billing status for a tenant (credits, history)
 */
export async function getBillingStatus(tenantId) {
  const res = await fetch(`${API_BASE}/billing-status?tenantId=${tenantId}`)
  if (!res.ok) throw new Error('Failed to fetch billing status')
  return res.json()
}

/**
 * Start a Stripe Checkout session to buy lead credits
 * Returns the Stripe Checkout URL to redirect to
 */
export async function buyLeadCredits(tenantId, packId) {
  const res = await fetch(`${API_BASE}/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, packId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create checkout')
  }
  const { url } = await res.json()
  return url
}

/**
 * Open Stripe Customer Portal (manage payment methods, view invoices)
 */
export async function openCustomerPortal(tenantId) {
  const res = await fetch(`${API_BASE}/create-portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to open portal')
  }
  const { url } = await res.json()
  return url
}

/**
 * Lead credit pack definitions (must match api/create-checkout.js)
 */
export const LEAD_PACKS = [
  { id: 'starter',  credits: 10,  price: 25,  pricePerLead: 2.50, label: '10 Leads',  popular: false },
  { id: 'growth',   credits: 25,  price: 50,  pricePerLead: 2.00, label: '25 Leads',  popular: true  },
  { id: 'pro',      credits: 50,  price: 85,  pricePerLead: 1.70, label: '50 Leads',  popular: false },
  { id: 'agency',   credits: 100, price: 150, pricePerLead: 1.50, label: '100 Leads', popular: false },
]

/**
 * LAUNCH20 discount packs — $1/lead for life (first 20 customers)
 */
export const LAUNCH_PACKS = [
  { id: 'starter',  credits: 10,  price: 10,  pricePerLead: 1.00, label: '10 Leads',  popular: false },
  { id: 'growth',   credits: 25,  price: 25,  pricePerLead: 1.00, label: '25 Leads',  popular: true  },
  { id: 'pro',      credits: 50,  price: 50,  pricePerLead: 1.00, label: '50 Leads',  popular: false },
  { id: 'agency',   credits: 100, price: 100, pricePerLead: 1.00, label: '100 Leads', popular: false },
]

/**
 * Get the right pack list based on whether tenant is a launch customer
 */
export function getPacksForTenant(isLaunchCustomer) {
  return isLaunchCustomer ? LAUNCH_PACKS : LEAD_PACKS
}
