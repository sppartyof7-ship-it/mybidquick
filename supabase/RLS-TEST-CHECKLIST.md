# RLS Hardening — Preview Test Checklist

**DO NOT merge RLS changes to production until every check below passes.**

Run this checklist after applying `rls-hardening.sql` to the database.
If ANY test fails, run `rls-rollback.sql` immediately and investigate.

---

## Prerequisites

Before testing, confirm:

- [ ] All 4 API routes use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
  - `api/webhook.js` — check Vercel env vars
  - `api/create-checkout.js`
  - `api/billing-status.js`
  - `api/create-portal.js`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables
- [ ] Deployment is live on Vercel (redeploy after env var changes)

---

## 1. Quote Page Load (Anon User)

Tests: `anon_select_tenants` policy

- [ ] Visit `https://cloute-cleaning.mybidquick.com` — page loads, shows Cloute branding/colors
- [ ] Visit `https://cornerstone.mybidquick.com` — page loads, shows Cornerstone branding
- [ ] Confirm service list loads (house wash, windows, gutters, etc.)
- [ ] Confirm pricing tiers show (Standard/Premium/Platinum) with dollar amounts only
- [ ] Confirm address autocomplete works (Google Maps API)

**If this fails:** Quote pages can't load tenant config. The `anon_select_tenants` policy is broken.

---

## 2. Quote Submission (Anon User)

Tests: `anon_insert_leads`, `anon_insert_charges`, anon SELECT on tenants (credit check)

- [ ] Fill out a test quote on `cloute-cleaning.mybidquick.com`
  - Use: Test Name, test@example.com, 555-0100, any valid address
  - Select House Washing → Standard tier
- [ ] Quote total displays (no pricing formulas visible)
- [ ] Click Submit — confirmation screen shows
- [ ] Check Supabase `leads` table: new row exists with correct `tenant_id`
- [ ] Check Supabase `lead_charges` table: new row exists for this lead
- [ ] Check Supabase `tenants` table: Cloute's `lead_credits` decremented by 1

**If this fails:** The `createLead()` flow in `db.js` can't write through RLS. Check anon INSERT policies on leads, lead_charges, and anon SELECT/UPDATE on tenants.

---

## 3. Tenant Login / Auth

Tests: `anon_select_tenants` (email lookup), Supabase Auth, `tenant_select_own` policy

- [ ] Go to `https://www.mybidquick.com/#/login`
- [ ] Log in with Cloute credentials (tim.sullivan@clouteinc.com)
- [ ] Dashboard loads — shows Cloute business name
- [ ] Log out
- [ ] Log in with Cornerstone credentials (Noah's email)
- [ ] Dashboard loads — shows Cornerstone business name

**If this fails:** Either `getTenantByEmail()` can't find the tenant (anon SELECT broken), or `getMyTenant()` can't match `auth_user_id` (authenticated SELECT broken).

---

## 4. Tenant Isolation (Authenticated User)

Tests: `tenant_select_own`, `tenant_select_own_leads` — the core security improvement

- [ ] While logged in as Cloute: dashboard shows ONLY Cloute leads
- [ ] Count leads in dashboard vs. Supabase query: `SELECT count(*) FROM leads WHERE tenant_id = '<cloute-id>'` — numbers match
- [ ] While logged in as Cornerstone: dashboard shows ONLY Cornerstone leads
- [ ] Cornerstone CANNOT see Cloute leads (verify lead list has zero Cloute entries)
- [ ] Open browser console → Network tab → check Supabase API responses contain only the logged-in tenant's data

**If this fails:** The subquery `tenant_id IN (SELECT id FROM tenants WHERE auth_user_id = auth.uid())` isn't matching. Check that `auth_user_id` is correctly set on the tenant row.

---

## 5. Tenant Dashboard Settings (Authenticated User)

Tests: `tenant_update_own` policy

- [ ] Log in as Cloute
- [ ] Go to Settings/Profile section
- [ ] Change a non-critical field (e.g., business phone number or tagline)
- [ ] Save — confirm success message
- [ ] Refresh page — change persists
- [ ] Revert the change back to original value

**If this fails:** `updateTenantConfig()` or `updateTenantProfile()` can't UPDATE through RLS. Check `tenant_update_own` USING + WITH CHECK clauses.

---

## 6. Lead Status Updates / Kanban CRM (Authenticated User)

Tests: `tenant_update_own_leads` policy

- [ ] Log in as Cloute
- [ ] Find a lead in the Kanban board
- [ ] Drag it to a different status column (e.g., New → Contacted)
- [ ] Refresh — lead stays in new position
- [ ] Move it back to original status

**If this fails:** `updateLeadStatus()` can't UPDATE leads. Check `tenant_update_own_leads` policy and the `tenant_id` subquery.

---

## 7. Stripe Checkout / Buy Credits (Authenticated User)

Tests: `create-checkout.js` API route (uses service_role_key, bypasses RLS)

- [ ] Log in as Cloute
- [ ] Go to Billing section
- [ ] Click "Buy Credits" → select Starter pack (10 credits / $25)
- [ ] Redirected to Stripe Checkout page — verify correct amount shows
- [ ] **DO NOT complete payment** — click back/cancel
- [ ] Verify redirect back to dashboard with `?billing=cancelled`
- [ ] Check Supabase `credit_purchases`: pending row created with correct `stripe_session_id`

**If this fails:** The `create-checkout.js` route can't read/write Supabase. Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env vars.

---

## 8. Stripe Customer Portal (Authenticated User)

Tests: `create-portal.js` API route (uses service_role_key, bypasses RLS)

- [ ] Log in as Cloute (must have a `stripe_customer_id` already)
- [ ] Go to Billing section
- [ ] Click "Manage Billing" or "Customer Portal" button
- [ ] Stripe Portal opens — shows payment history
- [ ] Close portal — returns to dashboard

**If this fails:** `create-portal.js` can't read `stripe_customer_id` from tenants table. Confirm service_role_key is working.

---

## 9. Billing Status API (Server-Side)

Tests: `billing-status.js` API route (uses service_role_key, bypasses RLS)

- [ ] While on dashboard, open Network tab in browser DevTools
- [ ] Look for request to `/api/billing-status?tenantId=...`
- [ ] Response returns: credits count, purchase history, charge history
- [ ] Credits count matches what's in Supabase `tenants.lead_credits`

**If this fails:** `billing-status.js` can't SELECT from credit_purchases or lead_charges (these have NO anon/authenticated policies after hardening — only service_role_key works). This is the most likely breakpoint if service_role_key isn't configured.

---

## 10. Stripe Webhook (Server-Side)

Tests: `webhook.js` API route (uses service_role_key, bypasses RLS)

This is the hardest to test without a real payment. Options:

**Option A — Stripe CLI (recommended):**
- [ ] Install Stripe CLI: `stripe login`
- [ ] Forward events: `stripe listen --forward-to https://www.mybidquick.com/api/webhook`
- [ ] Trigger test event: `stripe trigger checkout.session.completed`
- [ ] Check Vercel function logs for "✅ Checkout completed" message
- [ ] Verify no 500 errors in logs

**Option B — Manual Stripe Dashboard:**
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Find the `www.mybidquick.com/api/webhook` endpoint
- [ ] Click "Send test webhook" → select `checkout.session.completed`
- [ ] Check response is 200 (will fail on missing metadata, but confirms the route runs)

**Option C — Real test purchase (most thorough):**
- [ ] Complete a real Starter pack purchase for Cloute using a test Stripe card
- [ ] Verify credits increment in Supabase
- [ ] Verify `credit_purchases` row status changes from `pending` to `completed`

**If this fails:** Webhook can't UPDATE tenants or credit_purchases. This is critical — credits won't be delivered after payment. Run rollback immediately.

---

## 11. Onboarding / New Tenant Signup

Tests: `anon_insert_tenants`, `anon_update_tenants_link_auth` policies

- [ ] Go to `https://www.mybidquick.com` → click "Get Started" or "Sign Up"
- [ ] Fill out onboarding wizard with test data:
  - Business: "Test Cleaning Co"
  - Email: a fresh test email (e.g., testcleaner123@gmail.com)
  - Slug: "test-cleaning-co"
- [ ] Complete signup — account created
- [ ] Check Supabase `tenants` table: new row exists with correct slug
- [ ] Check that `auth_user_id` is set on the new tenant row (linkAuthToTenant worked)
- [ ] Log in with the new account — dashboard loads
- [ ] **Clean up:** Delete the test tenant row from Supabase after testing

**If this fails:** Either `createTenant()` INSERT is blocked, or `linkAuthToTenant()` UPDATE is blocked. Check `anon_insert_tenants` and `anon_update_tenants_link_auth` policies.

---

## 12. Admin Dashboard (Service Role)

Tests: `getAllTenants()` — currently runs client-side with anon key

⚠️ **KNOWN ISSUE:** `getAllTenants()` in `db.js` runs in the browser with the anon key. After RLS hardening, anon can still SELECT all tenants (the `anon_select_tenants` policy allows it). So admin will still work, BUT this means all tenant data remains publicly readable via the anon key. This is a Phase 4 item to fix (move admin queries server-side).

- [ ] Go to `https://www.mybidquick.com/#/admin`
- [ ] Log in with admin credentials
- [ ] All tenants list loads
- [ ] Can view each tenant's details

**Expected:** This works because anon SELECT on tenants is still allowed. Not a regression.

---

## Emergency Rollback Procedure

If any critical flow above fails after applying RLS:

1. Open Supabase SQL Editor (or use MCP `execute_sql`)
2. Paste and run the entire contents of `supabase/rls-rollback.sql`
3. Verify the broken flow works again
4. Investigate the root cause before re-attempting

---

## Sign-Off

| Test | Pass/Fail | Tester | Date |
|------|-----------|--------|------|
| 1. Quote Page Load | | | |
| 2. Quote Submission | | | |
| 3. Tenant Login | | | |
| 4. Tenant Isolation | | | |
| 5. Dashboard Settings | | | |
| 6. Kanban CRM | | | |
| 7. Stripe Checkout | | | |
| 8. Stripe Portal | | | |
| 9. Billing Status API | | | |
| 10. Stripe Webhook | | | |
| 11. Onboarding Signup | | | |
| 12. Admin Dashboard | | | |

**All 12 tests must pass before RLS stays in production.**
