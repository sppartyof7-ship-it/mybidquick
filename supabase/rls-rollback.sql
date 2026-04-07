-- ============================================================================
-- RLS ROLLBACK SCRIPT
-- MyBidQuick — April 2026
-- ============================================================================
-- PURPOSE: Revert rls-hardening.sql and restore the original wide-open
-- "Allow public *" policies. Use this if any critical flow breaks after
-- applying the hardening migration.
--
-- HOW TO USE:
--   1. Run this entire script in Supabase SQL Editor (or via MCP execute_sql)
--   2. Verify all flows work again (quote submission, dashboard, billing)
--   3. Investigate what broke before re-attempting hardening
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP all hardened policies created by rls-hardening.sql
-- ============================================================================

-- tenants
DROP POLICY IF EXISTS "tenant_select_own" ON tenants;
DROP POLICY IF EXISTS "anon_select_tenants" ON tenants;
DROP POLICY IF EXISTS "anon_insert_tenants" ON tenants;
DROP POLICY IF EXISTS "tenant_update_own" ON tenants;
DROP POLICY IF EXISTS "anon_update_tenants_link_auth" ON tenants;

-- leads
DROP POLICY IF EXISTS "tenant_select_own_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "authenticated_insert_leads" ON leads;
DROP POLICY IF EXISTS "tenant_update_own_leads" ON leads;

-- lead_charges
DROP POLICY IF EXISTS "tenant_select_own_charges" ON lead_charges;
DROP POLICY IF EXISTS "anon_insert_charges" ON lead_charges;
DROP POLICY IF EXISTS "authenticated_insert_charges" ON lead_charges;

-- credit_purchases (hardening added NO policies, so nothing to drop)

-- welcome_email_schedule (hardening added NO policies, so nothing to drop)

-- ============================================================================
-- STEP 2: RESTORE original permissive policies
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- TENANTS — restore open access
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "Allow public read on tenants"
  ON tenants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on tenants"
  ON tenants FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on tenants"
  ON tenants FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────
-- LEADS — restore open access
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "Allow public read on leads"
  ON leads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on leads"
  ON leads FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on leads"
  ON leads FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────
-- LEAD_CHARGES — restore open access
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "Allow public read on lead_charges"
  ON lead_charges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on lead_charges"
  ON lead_charges FOR INSERT
  TO public
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────
-- CREDIT_PURCHASES — restore open access
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "Allow public read on credit_purchases"
  ON credit_purchases FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on credit_purchases"
  ON credit_purchases FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on credit_purchases"
  ON credit_purchases FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────
-- WELCOME_EMAIL_SCHEDULE — restore open access
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "Service role full access"
  ON welcome_email_schedule FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 3: Confirm RLS is still enabled (policies handle access, not disabling)
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_email_schedule ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONE. All tables are back to wide-open public access.
-- This is the SAME state the database was in before hardening.
-- ============================================================================
