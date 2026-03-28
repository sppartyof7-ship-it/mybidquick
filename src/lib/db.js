// ============================================================================
// DATABASE LAYER â Supabase with localStorage fallback
// ============================================================================
// This file is the ONLY place that talks to the database or localStorage.
// Every page imports from here instead of touching storage directly.
// When Supabase env vars are set, it uses the real database.
// Otherwise, it falls back to localStorage so the app still works in demo mode.

import { supabase, isSupabaseConnected } from './supabase'

// ============================================================================
// TENANTS
// ============================================================================

/**
 * Get all tenants (for admin dashboard)
 */
export async function getAllTenants() {
  if (isSupabaseConnected()) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(rowToTenant)
  }
  // Fallback: localStorage
  return JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
}

/**
 * Find a tenant by slug (for duplicate check during onboarding)
 */
export async function getTenantBySlug(slug, fullData = false) {
  if (isSupabaseConnected()) {
    const { data, error } = await supabase
      .from('tenants')
      .select(fullData ? '*' : 'id, slug')
      .eq('slug', slug)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data ? (fullData ? rowToTenant(data) : data) : null
  }
  // Fallback: localStorage
  const tenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
  return tenants.find(t => t.slug === slug) || null
}

/**
 * Find a tenant by email (for login)
 */
export async function getTenantByEmail(email) {
  if (isSupabaseConnected()) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .ilike('email', email)
      .single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data ? rowToTenant(data) : null
  }
  // Fallback: localStorage
  const tenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
  return tenants.find(t => t.email?.toLowerCase() === email.toLowerCase()) || null
}

/**
 * Create a new tenant (from onboarding wizard)
 */
export async function createTenant(tenantData) {
  if (isSupabaseConnected()) {
    const row = tenantToRow(tenantData)
    const { data, error } = await supabase
      .from('tenants')
      .insert(row)
      .select()
      .single()
    if (error) throw error
    return rowToTenant(data)
  }
  // Fallback: localStorage
  const tenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
  tenants.push(tenantData)
  localStorage.setItem('mybidquick_tenants', JSON.stringify(tenants))
  return tenantData
}

/**
 * Update a tenant's config (from tenant dashboard "Save Changes")
 */
export async function updateTenantConfig(tenantId, config) {
  if (isSupabaseConnected()) {
    const { data, error } = await supabase
      .from('tenants')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', tenantId)
      .select()
      .single()
    if (error) throw error
    return rowToTenant(data)
  }
  // Fallback: localStorage
  const tenants = JSON.parse(localStorage.getItem('mybidquick_tenants') || '[]')
  const idx = tenants.findIndex(t => t.id === tenantId)
  if (idx >= 0) {
    tenants[idx] = { ...tenants[idx], config }
  } else {
    tenants.push({ id: tenantId, config })
  }
  localStorage.setItem('mybidquick_tenants', JSON.stringify(tenants))
  return tenants[idx] || { id: tenantId, config }
}

// ============================================================================
// LEADS
// ============================================================================

/**
 * Get all leads for a tenant
 */
export async function getLeads(tenantId) {
  if (isSupabaseConnected()) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(rowToLead)
  }
  // Fallback: return empty (demo leads are hardcoded in component)
  return null // null = "use demo leads"
}

/**
 * Update a lead's status (won/lost/pending)
 */
export async function updateLeadStatus(leadId, status) {
  if (isSupabaseConnected()) {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
    if (error) throw error
  }
  // localStorage leads are managed in component state (not persisted in demo)
}

/**
 * Create a new lead (from customer quote submission)
 * Also deducts 1 lead credit from the tenant and logs the charge.
 */
export async function createLead(leadData) {
  if (isSupabaseConnected()) {
    // Check tenant has credits
    const { data: tenant } = await supabase
      .from('tenants')
      .select('lead_credits')
      .eq('id', leadData.tenant_id)
      .single()

    if (tenant && (tenant.lead_credits ?? 0) <= 0) {
      throw new Error('NO_CREDITS')
    }

    // Insert the lead
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()
    if (error) throw error

    // Deduct 1 credit
    if (tenant) {
      await supabase
        .from('tenants')
        .update({
          lead_credits: Math.max(0, (tenant.lead_credits ?? 0) - 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadData.tenant_id)

      // Log the charge
      await supabase.from('lead_charges').insert({
        tenant_id: leadData.tenant_id,
        lead_id: data.id,
        amount_cents: 0, // free trial or pre-paid via credit pack
        status: (tenant.lead_credits ?? 0) > 0 ? 'charged' : 'free',
      })
    }

    return rowToLead(data)
  }
  return leadData
}

// ============================================================================
// AUTH â Supabase Authentication
// ============================================================================

/**
 * Sign up a new user with email + password.
 * Returns the auth user (with user.id that links to tenants.auth_user_id).
 */
export async function signUp(email, password, metadata = {}) {
  if (!isSupabaseConnected()) return null
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data.user
}

/**
 * Sign in with email + password.
 */
export async function signIn(email, password) {
  if (!isSupabaseConnected()) return null
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (!isSupabaseConnected()) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current logged-in user (or null).
 */
export async function getCurrentUser() {
  if (!isSupabaseConnected()) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Listen for auth state changes (login, logout, token refresh).
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConnected()) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  )
  return () => subscription.unsubscribe()
}

/**
 * Link an auth user to a tenant (called right after signup).
 */
export async function linkAuthToTenant(tenantId, authUserId) {
  if (!isSupabaseConnected()) return
  const { error } = await supabase
    .from('tenants')
    .update({ auth_user_id: authUserId })
    .eq('id', tenantId)
  if (error) throw error
}

/**
 * Get the tenant for the currently logged-in auth user.
 */
export async function getMyTenant() {
  if (!isSupabaseConnected()) return null
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ? rowToTenant(data) : null
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
  if (!isSupabaseConnected()) return
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/dashboard`,
  })
  if (error) throw error
}

// ============================================================================
// ROW CONVERTERS
// ============================================================================
// Supabase rows use snake_case, our React components use camelCase.
// These helpers convert between the two so components don't need to care.

function rowToTenant(row) {
  return {
    id: row.id,
    slug: row.slug,
    businessName: row.business_name,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    state: row.state,
    website: row.website,
    plan: row.plan || 'starter',
    logo: row.logo_url,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    config: row.config || {},
    createdAt: row.created_at,
  }
}

function tenantToRow(tenant) {
  return {
    business_name: tenant.businessName,
    owner_name: tenant.ownerName,
    slug: tenant.slug,
    email: tenant.email,
    phone: tenant.phone,
    city: tenant.city,
    state: tenant.state,
    website: tenant.website,
    plan: tenant.plan || 'starter',
    logo_url: tenant.logo,
    primary_color: tenant.primaryColor,
    secondary_color: tenant.secondaryColor,
    config: tenant.config || {},
  }
}

// ============================================================================
// STORAGE (Logo uploads)
// ============================================================================

/**
 * Upload a logo file to Supabase Storage and return the public URL.
 * Falls back to base64 data URL if Supabase Storage isn't available.
 */
export async function uploadLogo(file, slug) {
  if (!isSupabaseConnected()) return null

  const ext = file.name.split('.').pop().toLowerCase()
  const filePath = `logos/${slug}.${ext}`

  const { error } = await supabase.storage
    .from('tenant-assets')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.warn('Logo upload failed, falling back to base64:', error)
    return null // caller will fall back to base64
  }

  const { data: urlData } = supabase.storage
    .from('tenant-assets')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

function rowToLead(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    services: row.services || [],
    package: row.package,
    date: row.created_at?.split('T')[0],
    source: row.source,
    total: row.total,
    status: row.status || 'pending',
    notes: row.notes,
  }
}
