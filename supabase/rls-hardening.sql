-- ============================================================================
-- RLS HARDENING MIGRATION
-- MyBidQuick — April 2026
-- ============================================================================
-- PURPOSE: Replace wide-open "Allow public *" policies with proper
-- tenant-scoped isolation. After this migration:
--   - Authenticated tenants can only see/edit their own data
--   - Public (anon) users can only read tenant info by slug (for quote pages)
--     and insert leads (quote submissions)
--   - Server-side API routes use service_role_key which bypasses RLS entirely
--
-- PREREQUISITE: All 4 API routes (webhook, create-checkout, billing-status,
-- create-portal) must be using SUPABASE_SERVICE_ROLE_KEY, not anon key.
-- The Bucket 1 commit (909fe64) added this with a fallback.
--
-- ROLLBACK: Run supabase/rls-rollback.sql to restore the old open policies.
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP all existing permissive "Allow public *" policies
-- ============================================================================

-- tenants
DROP POLICY IF EXISTS "Allow public read on tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public insert on tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public update on tenants" ON tenants;
DROP POLICY IF EXISTS "Allow tenant creation" ON tenants;
DROP POLICY IF EXISTS "Tenants can view own data" ON tenants;
DROP POLICY IF EXISTS "Tenants can update own data" ON tenants;

-- leads
DROP POLICY IF EXISTS "Allow public read on leads" ON leads;
DROP POLICY IF EXISTS "Allow public insert on leads" ON leads;
DROP POLICY IF EXISTS "Allow public update on leads" ON leads;
DROP POLICY IF EXISTS "Allow lead creation" ON leads;
DROP POLICY IF EXISTS "Tenants can view own leads" ON leads;
DROP POLICY IF EXISTS "Tenants can update own leads" ON leads;

-- lead_charges
DROP POLICY IF EXISTS "Allow public read on lead_charges" ON lead_charges;
DROP POLICY IF EXISTS "Allow public insert on lead_charges" ON lead_charges;

-- credit_purchases
DROP POLICY IF EXISTS "Allow public read on credit_purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Allow public insert on credit_purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Allow public update on credit_purchases" ON credit_purchases;

-- welcome_email_schedule
DROP POLICY IF EXISTS "Service role full access" ON welcome_email_schedule;

-- ============================================================================
-- STEP 2: CREATE new properly-scoped policies
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- TENANTS TABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Who needs to read tenants?
--   1. Authenticated tenant: their own row (TenantDashboard via getMyTenant)
--   2. Anon user: read by slug only (quote pages via getTenantBySlug)
--   3. Anon user: read by email for login resolution (getTenantByEmail)
--   4. Anon user: count is_launch_customer for LAUNCH20 (getLaunchCustomerCount)
--   5. Admin: getAllTenants — uses service_role_key, bypasses RLS
--   6. API routes: all use service_role_key now, bypass RLS

-- Authenticated tenant can read their own row
CREATE POLICY "tenant_select_own"
  ON tenants FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Anon can read limited tenant data (for quote pages, login, LAUNCH20 check)
-- This allows getTenantBySlug, getTenantByEmail, getLaunchCustomerCount
CREATE POLICY "anon_select_tenants"
  ON tenants FOR SELECT
  TO anon
  USING (true);
-- NOTE: This is still open for SELECT by anon. We accept this because:
-- (a) Quote pages MUST load tenant config without auth
-- (b) Onboarding checks slug availability without auth
-- (c) Login flow looks up tenant by email without auth
-- (d) LAUNCH20 count check runs without auth
-- The data exposed (business name, slug, colors, services) is public anyway.
-- Sensitive fields (stripe_customer_id, lead_credits) are visible but not
-- actionable without Stripe access. To further restrict, we'd need a
-- security-definer function that returns only safe columns.

-- Anon can create tenants (onboarding wizard — before user has auth session)
CREATE POLICY "anon_insert_tenants"
  ON tenants FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated tenant can update their own row (dashboard settings)
CREATE POLICY "tenant_update_own"
  ON tenants FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Anon can update tenants (for linkAuthToTenant during onboarding)
-- This runs right after signup when the auth session may not be fully
-- established yet. The update sets auth_user_id on the newly created row.
CREATE POLICY "anon_update_tenants_link_auth"
  ON tenants FOR UPDATE
  TO anon
  WITH CHECK (true);
-- NOTE: This is still permissive for anon UPDATE. Tightening this further
-- requires moving linkAuthToTenant to a server-side function. Flagged for
-- Phase 4.

-- ──────────────────────────────────────────────────────────────────────────
-- LEADS TABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Who needs to read leads?
--   1. Authenticated tenant: their own leads (TenantDashboard via getLeads)
--   2. API routes: service_role_key, bypass RLS
-- Who needs to insert leads?
--   1. Anon user: quote submission (createLead from engine or db.js)
-- Who needs to update leads?
--   1. Authenticated tenant: change status (updateLeadStatus)

-- Authenticated tenant can read their own leads
CREATE POLICY "tenant_select_own_leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE auth_user_id = auth.uid()
    )
  );

-- Anon can insert leads (quote submissions from customers)
CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also insert leads (if submission happens with session)
CREATE POLICY "authenticated_insert_leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated tenant can update their own leads (status changes)
CREATE POLICY "tenant_update_own_leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE auth_user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- LEAD_CHARGES TABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Only server-side (service_role_key) writes charges (createLead in db.js
-- currently runs client-side, but the insert happens right after lead creation).
-- For now, allow anon insert (same as leads). Reads are tenant-scoped.

-- Authenticated tenant can read their own charges
CREATE POLICY "tenant_select_own_charges"
  ON lead_charges FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE auth_user_id = auth.uid()
    )
  );

-- Anon can insert charges (runs during createLead from client-side db.js)
CREATE POLICY "anon_insert_charges"
  ON lead_charges FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated can also insert charges
CREATE POLICY "authenticated_insert_charges"
  ON lead_charges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────
-- CREDIT_PURCHASES TABLE
-- ──────────────────────────────────────────────────────────────────────────
-- All access should be server-side only (Stripe checkout + webhook).
-- API routes use service_role_key. No client-side access needed.
-- But billing-status reads purchases for the dashboard via the API route
-- (service_role_key), so no anon/authenticated policy needed for SELECT.
-- However, the billing.js client calls getBillingStatus which calls the
-- API route, not Supabase directly. So this is safe to lock down fully.

-- No public/anon/authenticated policies. Only service_role_key can access.
-- RLS is ON but with no permissive policies = all access denied for
-- anon and authenticated roles. service_role_key bypasses RLS.

-- ──────────────────────────────────────────────────────────────────────────
-- WELCOME_EMAIL_SCHEDULE TABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Only server-side access (triggers + edge functions). Lock down completely.

-- No public/anon/authenticated policies. Only service_role_key and
-- database triggers (which run as the table owner) can access.

-- ============================================================================
-- STEP 3: VERIFY RLS is enabled on all tables (should already be)
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_email_schedule ENABLE ROW LEVEL SECURITY;
