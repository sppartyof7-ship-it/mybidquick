# MyBidQuick Production Action Plan — April 5, 2026

## Verified Live State

| Fact | Detail |
|------|--------|
| **Tenants** | 4 real: Cloute Exterior, Cornerstone Exterior (orphaned), County Wide Power Wash, Cornerstone Wash & Window |
| **Leads** | 5 total, all Cloute's, all status "new" |
| **Charges** | 3 of 5 leads have charge records — all show $0 amount. 2 leads have NO charge record. |
| **Credits** | Cloute: 82, Cornerstone (old): 3, County Wide: 25, Cornerstone (new): 25 |
| **Stripe** | Only Cloute has a Stripe customer. 1 completed purchase ($25/10 credits), 1 failed ($50). |
| **Auth** | Cornerstone Exterior (old) has `auth_user_id: null` — cannot log in |
| **RLS** | ✅ HARDENED April 6, 2026. 12 scoped policies active. credit_purchases + welcome_email_schedule locked to service_role_key only. Tenant isolation verified. |
| **API routes** | ✅ All 4 billing API functions switched to `SUPABASE_SERVICE_ROLE_KEY` with anon fallback (April 5). Key deployed to Vercel April 6. |
| **Edge functions** | 2 deployed: submit-lead, process-welcome-emails. Both have `verify_jwt: false` |
| **Vercel** | Both projects deploying. mybidquick on 9 domains, cleanbid on `*.mybidquick.com` wildcard |

---

## What Should Be Backed Up First

Before touching anything:

1. **Database snapshot** — Supabase has point-in-time recovery on Pro plan. Verify this is enabled. If on Free plan, manually export:
   ```sql
   -- Run each of these and save results
   SELECT * FROM tenants;
   SELECT * FROM leads;
   SELECT * FROM lead_charges;
   SELECT * FROM credit_purchases;
   SELECT * FROM welcome_email_schedule;
   ```

2. **Git state** — Tag the current working commit on both repos before any changes:
   ```bash
   git tag pre-audit-april2026
   git push origin pre-audit-april2026
   ```

3. **Vercel env vars** — Screenshot or document every environment variable currently set in both Vercel projects (mybidquick + cleanbid). We can't read these via API but Tim should verify in the Vercel dashboard.

---

## What Should Be Tested First

Before making changes, manually verify these critical flows still work:

1. **Quote submission** — Visit `cloute-cleaning.mybidquick.com#quote`, fill out a test quote, verify it appears in Supabase `leads` table
2. **Tenant login** — Log in at `mybidquick.com/#/login` with Tim's Cloute credentials, verify dashboard loads with real leads
3. **Billing** — In tenant dashboard, click "Buy Credits" and verify Stripe Checkout page loads (cancel before paying)
4. **Subdomain routing** — Visit `cornerstone-wash-and-window-cleaning.mybidquick.com` and verify it loads the right tenant's page
5. **Admin dashboard** — Visit `mybidquick.com/#/admin`, enter password, verify tenant list shows real data

---

## What Parts Break Paying Clients If Changed Carelessly

In order of blast radius:

| Component | What Breaks | Who's Affected |
|-----------|-------------|----------------|
| **Supabase RLS policies** | If locked down without updating API routes first: billing stops working, quote submissions fail, dashboards show no data | ALL tenants |
| **Stripe webhook** | If it stops crediting accounts: tenants pay but get nothing | Any tenant buying credits |
| **Subdomain routing / Vercel DNS** | If wildcard breaks: all tenant quote pages go down | ALL customers seeing quotes |
| **submit-lead edge function** | If it breaks: customers can't submit quotes at all | ALL end customers |
| **Supabase anon key / URL** | If rotated or changed: both repos lose database access | Everything |
| **Auth flow** | If session handling changes: tenants locked out of dashboards | ALL logged-in tenants |

---

## BUCKET 1: Safe Now

These changes are additive, isolated, or fix confirmed bugs with zero risk to live flows.

### 1.1 — Fix weekly email "contacted" calculation
**File:** `api/weekly-pipeline-email.js` line 296
**Bug:** `contacted = won + lost` — misses leads with status "contacted"
**Fix:** `contacted = leads.filter(l => l.status === 'contacted').length`
**Risk:** NONE — this only affects the Monday email, not any live flow

### 1.2 — Add unsubscribe footer to weekly email
**File:** `api/weekly-pipeline-email.js`
**What:** Add "Unsubscribe" link to email footer. Add `email_opt_out` column to tenants table. Check before sending.
**Risk:** NONE — additive column + email template change

### 1.3 — Create `.env.example`
**What:** Document all required env vars for both repos
**Risk:** NONE — new file, no code changes

### 1.4 — Fix origin whitelist in create-checkout.js
**File:** `api/create-checkout.js` line 71
**Bug:** `const origin = req.headers.origin || 'https://www.mybidquick.com'` — accepts any origin
**Fix:** Whitelist `mybidquick.com` domains only
**Risk:** VERY LOW — only affects redirect URL after Stripe payment, doesn't affect payment itself

### 1.5 — Fix origin whitelist in create-portal.js
**File:** `api/create-portal.js` line 35
**Same bug and fix as above.**

### 1.6 — Add error tracking (Sentry)
**What:** Install `@sentry/react` + `@sentry/node`, add to frontend entry + API routes
**Risk:** NONE — purely additive observability

### 1.7 — Clean up orphaned Cornerstone tenant
**What:** Noah has 2 tenant records. The old one (`cornerstone-exterior`, `auth_user_id: null`) appears orphaned. Verify with Tim which is correct, then soft-delete or mark inactive.
**Risk:** NONE if we confirm with Tim first

### 1.8 — Tag current git state
**What:** `git tag pre-audit-april2026` on both repos
**Risk:** NONE

---

## BUCKET 2: Safe With Staging/Preview Testing

These changes fix real security or data issues but touch production-critical paths. Do them in branches, test on Vercel preview deployments first.

### 2.1 — Switch API routes from anon key to service_role_key (PREREQUISITE FOR RLS FIX)
**Files:** `api/webhook.js`, `api/create-checkout.js`, `api/billing-status.js`, `api/create-portal.js`
**What:** Replace `VITE_SUPABASE_ANON_KEY` with `SUPABASE_SERVICE_ROLE_KEY` in all 4 API routes. The service role key bypasses RLS, which is correct for server-side functions. The weekly-pipeline-email already uses the service role key.
**Why this matters:** If we fix RLS (Bucket 2.2) without doing this first, ALL billing endpoints break because the anon key will be blocked by the new policies.
**Test:** Deploy to Vercel preview URL → test checkout flow → test billing status → test portal
**Risk:** MEDIUM — if `SUPABASE_SERVICE_ROLE_KEY` is not set in Vercel, all billing breaks. Verify it exists first.

### 2.2 — Fix RLS policies (THE BIG ONE)
**What:** Replace all `Allow public *` policies with proper tenant-scoped policies.

**Strategy — do this in exact order:**
1. First deploy Bucket 2.1 (API routes use service role key)
2. Then apply new RLS policies:

**tenants:**
- SELECT: `auth_user_id = auth.uid()` for authenticated users + allow anon select by slug only (for public quote pages)
- INSERT: Allow during onboarding (anon with `with_check` that email matches)
- UPDATE: `auth_user_id = auth.uid()` only

**leads:**
- SELECT: Tenant can view own leads (via auth_user_id → tenant_id join)
- INSERT: Allow anon insert (quote submissions come from unauthenticated customers)
- UPDATE: Tenant can update own leads only

**lead_charges:**
- SELECT/INSERT: Service role only (server-side API routes handle this)
- No public access needed

**credit_purchases:**
- SELECT/INSERT/UPDATE: Service role only
- No public access needed

**welcome_email_schedule:**
- ALL: Service role only

**Critical detail:** The engine's `submit-lead` edge function and the frontend `getTenantBySlug()` call BOTH use the anon key to read tenant configs for public quote pages. The new RLS must still allow: `SELECT on tenants WHERE slug = X` for anon users. Without this, all quote pages break.

**Test:**
1. Deploy API route changes to preview
2. Apply RLS to a Supabase branch (not production)
3. Test: quote submission, tenant login + dashboard, billing checkout, admin panel
4. Only then apply to production

**Risk:** HIGH if done wrong — could lock out all tenants. LOW if tested properly on branch first.

### 2.3 — Fix lead_charges $0 billing bug
**What:** All 3 charge records show `amount_cents = 0`. The `submit-lead` edge function likely doesn't pass the correct amount when inserting charges.
**Investigation needed:** Read the `submit-lead` edge function code to find where `amount_cents` is set.
**Risk:** MEDIUM — need to understand the edge function before fixing. Changing it affects all new quote submissions.

### 2.4 — Add auth check to billing-status endpoint
**File:** `api/billing-status.js`
**What:** Verify the requesting user owns the tenant before returning billing data. Check `Authorization` header for Supabase JWT, decode it, verify `auth_user_id` matches tenant.
**Risk:** MEDIUM — if auth check is too strict, legitimate tenant dashboard calls get blocked. Test on preview first.

### 2.5 — Add auth check to create-portal endpoint
**File:** `api/create-portal.js`
**Same pattern as 2.4.**

### 2.6 — Webhook idempotency guard
**File:** `api/webhook.js`
**What:** Before adding credits, check if `credit_purchases` status is already `completed` for this session_id. If so, skip. Currently the code reads balance, adds credits, writes new balance — a race window exists.
**Better fix:** Use a Supabase RPC function with `UPDATE tenants SET lead_credits = lead_credits + $1 WHERE id = $2` (atomic increment, no read-then-write).
**Risk:** LOW-MEDIUM — improves safety without changing behavior. Test with a duplicate webhook event.

---

## BUCKET 3: Do Not Touch Yet

These need deeper investigation, affect multiple systems, or have high blast radius with low immediate value.

### 3.1 — Admin auth (VITE_ADMIN_PASSWORD in frontend bundle)
**Problem:** The admin password is embedded in the compiled JavaScript. Anyone who opens DevTools → Sources can find it.
**Why not now:** Fixing this requires building a server-side admin auth system (new API route, session cookie, httpOnly). That's a significant change. The current risk is low because someone would need to know the admin URL exists AND look through the JS bundle.
**When:** Phase 4, after billing and RLS are solid.

### 3.2 — TenantDashboard decomposition (3,500 lines)
**Problem:** One massive component file. Hard to maintain.
**Why not now:** Refactoring a working 3,500-line component risks introducing bugs across every tab. No user-facing benefit.
**When:** Phase 4, when we need to add new dashboard features.

### 3.3 — Shared billing constants (pack definitions in 2 files)
**Problem:** `billing.js` and `create-checkout.js` both define pack prices.
**Why not now:** They're currently in sync. The risk is future divergence, not current breakage.
**When:** Next time we change pricing.

### 3.4 — Database FK columns NOT NULL migration
**Problem:** All foreign keys (tenant_id, lead_id) are nullable. Orphaned records possible.
**Why not now:** No orphans exist currently. Making columns NOT NULL on a live table requires verifying every row has data, and could break inserts if any code path doesn't set the FK.
**When:** Phase 4, combined with a broader schema review.

### 3.5 — Engine repo code-level rename (Cleanbid → mybidquick-engine)
**Problem:** Internal code still references "Cleanbid" in some places.
**Why not now:** Cosmetic. Renaming imports/comments risks breaking the build for zero user benefit.
**When:** Never, unless it causes actual confusion.

### 3.6 — Rate limiting on API endpoints
**Problem:** No rate limiting. Enumeration or DDoS possible.
**Why not now:** At 4 tenants, the attack surface is tiny. Adding rate limiting requires middleware or a proxy layer.
**When:** Before scaling past ~20 tenants or running paid ads that drive traffic.

### 3.7 — Real-time lead updates in dashboard
**Problem:** Leads loaded once on mount. No live updates.
**Why not now:** With 5 leads, this doesn't matter. Supabase Realtime is easy to add later.
**When:** When tenants are actively using the CRM daily.

---

## Recommended Order of Work

```
TODAY (Bucket 1 — no risk):
  1.8  Tag git state
  1.3  Create .env.example
  1.1  Fix weekly email contacted calc
  1.2  Add unsubscribe to weekly email
  1.4  Fix origin whitelist (create-checkout)
  1.5  Fix origin whitelist (create-portal)
  1.7  Verify Cornerstone data with Tim

THIS WEEK (Bucket 2 — with preview testing):
  2.1  Switch API routes to service_role_key  ← MUST come before 2.2
  2.2  Fix RLS policies                       ← Test on Supabase branch first
  2.3  Investigate & fix lead_charges $0 bug
  2.6  Add webhook idempotency guard
  2.4  Add auth to billing-status endpoint
  2.5  Add auth to create-portal endpoint

LATER (Bucket 3 — not yet):
  3.1  Server-side admin auth
  3.2  TenantDashboard decomposition
  3.3  Shared billing constants
  3.4  FK NOT NULL migration
  3.6  Rate limiting
```

---

## Data Anomalies Found

| Issue | Detail | Action |
|-------|--------|--------|
| Noah has 2 tenant records | `cornerstone-exterior` (auth_user_id: null, 3 credits) and `cornerstone-wash-and-window-cleaning` (auth_user_id set, 25 credits) | Confirm with Tim which is real. Soft-delete the other. |
| County Wide Power Wash | New tenant not mentioned in project docs. Has auth_user_id, 25 credits. | Update PROJECT-BRAIN.md and Notion |
| 3 lead charges at $0 | Leads have totals ($120-$1375) but charges recorded $0 | Bug in submit-lead edge function |
| 2 leads with no charge record | Oldest 2 Cloute leads have no entry in lead_charges at all | Either submitted before charge tracking existed, or the insert failed |
| All leads status "new" | No leads have moved through the pipeline (contacted/won/lost) | Expected — CRM usage hasn't started yet |
| Cloute has 82 credits but only bought 10 | 82 credits with only 1 purchase of 10 credits ($25) | Credits were likely seeded manually. Not a bug, but worth documenting. |

---

---

## Completed Milestones

| Date | Milestone | Details |
|------|-----------|---------|
| April 5 | Bucket 1 safe fixes committed | Commit 909fe64 — origin whitelists, service_role_key fallback, weekly email fixes, .env.example, audit docs |
| April 6 | SUPABASE_SERVICE_ROLE_KEY deployed to Vercel | All 4 API routes now use service_role_key in production |
| April 6 | **RLS hardening applied and verified** | 18 old permissive policies dropped, 12 scoped policies created. credit_purchases and welcome_email_schedule fully locked. All 10 tests passed: quote load, quote submit, tenant login, tenant isolation, settings update, Kanban CRM, Stripe checkout, billing status API, onboarding, admin dashboard. Rollback script available at `supabase/rls-rollback.sql`. |

---

*Plan created April 5, 2026. Updated April 6, 2026 after RLS hardening. Based on live database queries, Vercel project inspection, and full code audit of both repos.*
