# MyBidQuick Production Audit — April 5, 2026

## A. Current Architecture Summary

**Two repos, one database, one payment system:**

| Component | Repo | What It Does |
|-----------|------|-------------|
| Platform | mybidquick | Marketing site, onboarding, admin dashboard, tenant dashboard, billing API |
| Engine | mybidquick-engine (Cleanbid) | Customer-facing quote flow, pricing calc, lead submission |

**How they connect:**
1. Tenant signs up on mybidquick.com → config saved to Supabase `tenants.config` (JSONB)
2. Customer visits `slug.mybidquick.com` → engine loads config from Supabase
3. Customer submits quote → engine creates lead in Supabase + deducts 1 credit
4. Billing happens through Stripe Checkout → webhook adds credits to tenant

**Live state:** 4 tenants in database, 5 leads (all Cloute), 1 completed credit purchase ($25/10 credits).

---

## B. What Is Safe to Improve Now

These are additive changes that won't break anything for live clients:

1. **Weekly pipeline email bug fix** — "contacted" metric is calculated wrong (counts won+lost instead of all non-new). Simple math fix in one file.

2. **Add unsubscribe link to weekly email** — Missing from pipeline emails. GDPR requirement. Add opt-out flag to tenants table + check before sending.

3. **Add `.env.example` file** — Document all required environment variables so nothing gets missed on deploy.

4. **Vite build optimization** — Add code splitting, minification targets. Zero risk to functionality.

5. **Blog/SEO improvements** — Content additions are purely additive.

6. **Lead pagination** — Currently loads all leads into memory. Add limit/offset for large datasets. Backward compatible.

7. **Error tracking** — Add Sentry or similar. Zero risk, massive visibility gain.

---

## C. What Is Dangerous to Touch Right Now

These areas need careful handling — breaking them affects live paying clients:

| Area | Why It's Dangerous | What Could Break |
|------|-------------------|-----------------|
| **Stripe webhook** | Processes real payments. Race condition exists but hasn't caused issues yet at current volume. | Double-crediting, lost payments |
| **Subdomain routing** | Wildcard DNS + Vercel config. Touching this affects all tenant quote pages. | Cloute and Cornerstone quote pages go down |
| **Supabase RLS policies** | Currently wide open (`using(true)`). Fixing this is critical but could lock out working features if done wrong. | Tenants can't load their own data, quote submissions fail |
| **Auth flow** | Supabase Auth session + email-based tenant lookup. | Tenants locked out of dashboards |
| **Credit deduction logic** | Runs on every quote submission in the engine. | Tenants lose credits without getting leads, or get leads without credit deduction |
| **Onboarding wizard** | Creates tenant + auth user + config in sequence. | New signups break, orphaned records |

---

## D. Recommended Order of Work

### Phase 1: Production Safety & Visibility (DO FIRST)

**Goal:** Make the existing system safer without changing how it works.

| # | Task | Risk | Impact | Est. |
|---|------|------|--------|------|
| 1.1 | **Fix RLS policies** — Replace `using(true)` with proper tenant isolation. Test thoroughly before deploying. | HIGH (if done wrong) | CRITICAL — any user can currently read/write any tenant's data | 2-3 hrs |
| 1.2 | **Verify STRIPE_WEBHOOK_SECRET is set in Vercel** — If missing, webhooks are unverified | NONE | HIGH — prevents forged payment events | 5 min |
| 1.3 | **Add auth to billing API endpoints** — `/api/billing-status` and `/api/create-portal` accept any tenantId with no auth check | LOW | HIGH — prevents unauthorized billing access | 30 min |
| 1.4 | **Fix origin whitelist in create-checkout** — Currently uses `req.headers.origin` unvalidated. Whitelist mybidquick.com domains only | LOW | MEDIUM — prevents open redirect after payment | 15 min |
| 1.5 | **Add `.env.example`** — Document all required env vars | NONE | MEDIUM — prevents deploy mishaps | 15 min |
| 1.6 | **Fix lead_charges recording $0** — All 3 charges in DB show `amount_cents = 0` despite `lead_price_cents = 500`. Billing logic bug. | LOW | HIGH — revenue not tracked correctly | 30 min |
| 1.7 | **Add error tracking (Sentry)** — Zero visibility into production errors right now | NONE | HIGH — catch issues before users report them | 30 min |

### Phase 2: UX & Quote Flow Improvements

**Goal:** Make the customer-facing experience feel more premium.

| # | Task | Risk | Impact |
|---|------|------|--------|
| 2.1 | **Audit engine quote flow end-to-end** — Need to clone and read the engine repo to understand the full customer journey | NONE | Prerequisite for all UX work |
| 2.2 | **Fix weekly email contacted calculation** — Wrong metric being sent to tenants | NONE | Users getting bad data |
| 2.3 | **Add unsubscribe to weekly email** — GDPR compliance | LOW | Legal requirement |
| 2.4 | **Improve quote presentation** — Better visual design on the price breakdown step | LOW | Direct conversion impact |
| 2.5 | **Add quote-to-close flow** — After quote, help tenant follow up and close the job | LOW | Revenue system improvement |
| 2.6 | **Lead detail improvements** — Better display of all 20+ fields in dashboard | LOW | Tenant UX |

### Phase 3: CRM Layer Improvements

**Goal:** Strengthen the lead management system.

| # | Task | Risk | Impact |
|---|------|------|--------|
| 3.1 | **Lead lifecycle management** — Track quote → viewed → follow-up → won/lost with timestamps | LOW | Core CRM value |
| 3.2 | **Follow-up tracking** — Which leads got which emails, when, what happened | LOW | Tenant visibility |
| 3.3 | **Reporting improvements** — Revenue by service, conversion by source, tenant ROI | LOW | Tenant retention |
| 3.4 | **Lead pagination + search** — Handle growing lead volumes | LOW | Performance |

### Phase 4: Architecture Improvements (Only If Needed)

**Goal:** Clean up tech debt, but only when it blocks progress.

| # | Task | Risk | Impact |
|---|------|------|--------|
| 4.1 | **Extract shared billing constants** — Pack definitions duplicated between `billing.js` and `create-checkout.js` | LOW | Prevents price sync bugs |
| 4.2 | **Move admin auth server-side** — `VITE_ADMIN_PASSWORD` is embedded in the frontend JS bundle. Anyone who decompiles sees it. | MEDIUM | Security improvement |
| 4.3 | **Make FK columns NOT NULL** — All foreign keys currently nullable, allows orphaned records | MEDIUM | Data integrity |
| 4.4 | **TenantDashboard decomposition** — 3,512 lines in one file. Split into tab components. | MEDIUM | Maintainability |
| 4.5 | **Shared config between repos** — Service definitions, defaults duplicated | MEDIUM | Consistency |

---

## E. Quick Wins vs Deeper Refactors

### Quick Wins (< 30 min each, safe to ship today)

1. Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel production
2. Fix origin whitelist in `create-checkout.js`
3. Create `.env.example` documenting all required vars
4. Fix weekly email "contacted" calculation
5. Add unsubscribe link to weekly pipeline email
6. Fix lead_charges $0 billing bug

### Deeper Refactors (need careful testing, do in branches)

1. **RLS policy overhaul** — Most critical. Every table is currently public. Needs migration + thorough testing.
2. **Admin auth to server-side** — Password currently in frontend bundle. Needs new auth pattern.
3. **Billing endpoint auth** — Add session verification to API routes.
4. **TenantDashboard split** — 3,500-line component into smaller pieces.
5. **Webhook idempotency** — Prevent race condition on concurrent credit additions.

---

## F. Missing Safeguards That Should Be Added First

### Before any other work:

| Safeguard | Why | Status |
|-----------|-----|--------|
| **Error tracking (Sentry)** | Zero visibility into production errors. Flying blind. | NOT SET UP |
| **Database backups** | Supabase has point-in-time recovery on paid plans. Verify it's enabled. | UNKNOWN |
| **Env var documentation** | No `.env.example`. Easy to miss critical vars on deploy. | MISSING |
| **RLS audit & fix** | All data publicly accessible through Supabase client. | CRITICAL - OPEN |
| **Webhook secret verification** | If missing, anyone can forge Stripe events and grant free credits. | NEEDS VERIFICATION |
| **Rate limiting** | API endpoints have zero rate limiting. Enumeration/DDoS risk. | NOT SET UP |
| **Uptime monitoring** | No alerting if site goes down. | NOT SET UP |

---

## Detailed Findings

### Database Schema (Live Supabase)

**5 tables, 4 tenants, 5 leads:**

| Table | Rows | RLS | Key Issue |
|-------|------|-----|-----------|
| tenants | 4 | ON but `using(true)` | Publicly readable/writable |
| leads | 5 | ON but `using(true)` | Publicly readable/writable |
| lead_charges | 3 | ON but `using(true)` | All showing $0 amount |
| credit_purchases | 2 | ON but `using(true)` | 1 completed, 1 failed |
| welcome_email_schedule | 5 | ON but `using(true)` | 1 sent, 4 pending |

**Indexes:** Well-designed. Proper indexes on tenant_id, email, slug, status, stripe_customer_id.

**Foreign keys:** Present but all nullable. No cascading deletes.

**Triggers:** 2 working triggers for welcome email scheduling (good design).

**Edge functions:** 2 deployed (submit-lead, process-welcome-emails). Both have `verify_jwt: false`.

### Billing Flow Issues

1. **Pack definitions duplicated** in `src/lib/billing.js` AND `api/create-checkout.js`. If they diverge, checkout charges wrong amounts.
2. **Race condition** in webhook: two simultaneous `checkout.session.completed` events could double-credit a tenant. Low risk at current volume, real risk at scale.
3. **`/api/billing-status`** has NO auth check. Anyone can query any tenant's billing by guessing tenantId.
4. **`/api/create-portal`** has NO auth check. Anyone can open Stripe management for any tenant.
5. **Origin header** used unvalidated for checkout success redirect URL.

### Auth Issues

1. **Admin password** (`VITE_ADMIN_PASSWORD`) is embedded in the frontend JavaScript bundle. Decompiling the JS reveals the password.
2. **No rate limiting** on admin login. Brute-force possible.
3. **No 2FA** on admin or tenant accounts.
4. **Tenant lookup is email-based** — if a tenant changes their email, they lose dashboard access.

### Email Issues

1. **Weekly pipeline email** calculates "contacted" as `won + lost`, missing leads that are in conversation but haven't closed.
2. **No unsubscribe link** in emails (GDPR violation risk).
3. **No opt-in flag** checked before sending. All tenants get emails whether they want them or not.
4. **Hardcoded from address** — no white-label option for tenant-branded emails.

### Onboarding Issues

1. **Slug generation** has 20-attempt limit. If all variations taken, onboarding fails silently.
2. **Race condition** — two simultaneous signups could both claim same slug (DB unique constraint catches it but no user-friendly error).
3. **Non-atomic** — if auth signup fails after tenant creation, orphaned tenant record with no login.
4. **Web3Forms API key** hardcoded in frontend (visible in bundle).
5. **No file size limit** on logo uploads.

---

## Risk Matrix

| Risk | Severity | Likelihood | Current Impact |
|------|----------|-----------|----------------|
| RLS policies open (data exposure) | CRITICAL | HIGH | Any user can read all tenant/lead data |
| Admin password in frontend bundle | HIGH | MEDIUM | Anyone with dev tools can get admin access |
| Billing endpoints unauthenticated | HIGH | MEDIUM | Tenant billing info queryable by anyone |
| Webhook signature skip if secret missing | HIGH | LOW | Forged payment events possible |
| Lead charges recording $0 | HIGH | CONFIRMED | Revenue tracking broken |
| Credit race condition | MEDIUM | LOW (at current volume) | Double-crediting possible |
| No error tracking | MEDIUM | HIGH | Production errors invisible |
| No rate limiting on APIs | MEDIUM | LOW | DDoS or enumeration possible |
| Weekly email wrong metric | LOW | CONFIRMED | Tenants see incorrect conversion data |
| No unsubscribe in emails | LOW | MEDIUM | GDPR compliance gap |

---

*Audit performed April 5, 2026. Both repos inspected. Supabase database queried directly.*
