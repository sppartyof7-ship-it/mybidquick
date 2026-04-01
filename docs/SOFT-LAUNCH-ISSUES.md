# MyBidQuick — Soft Launch Issues Report
**Date:** March 27, 2026
**Tested by:** Claude (code walkthrough of Onboarding.jsx, TenantDashboard.jsx, db.js, billing.js, App.jsx, supabase.js)

---

## CRITICAL (Must fix before soft launch)

### 1. Success page sends new clients to wrong dashboard
**File:** `src/pages/Onboarding.jsx` line 561
**Issue:** After completing onboarding, the "Open Dashboard" button navigates to `/admin` (the platform admin dashboard) instead of `/dashboard` (the tenant's own dashboard).
**Impact:** New clients would land on your internal admin panel showing ALL tenants, not their own dashboard.
**Fix:** Change `navigate('/admin')` → `navigate('/dashboard')` on the success page button.

### 2. Most onboarding data is lost on save to Supabase
**Files:** `src/pages/Onboarding.jsx` (handleLaunch), `src/lib/db.js` (tenantToRow)
**Issue:** The `tenantToRow()` function only maps these fields to Supabase: business_name, owner_name, slug, email, phone, city, state, website, plan, logo_url, primary_color, config. But the onboarding form puts services, upsell settings, and secondaryColor at the TOP level of tenantData — not inside a `config` object. So `tenant.config || {}` resolves to `{}` and all service/pricing/upsell data is lost.
**Impact:** Every new tenant's pricing, services, and upsell config disappears after creation. Dashboard would show defaults instead of what they configured.
**Fix:** In `handleLaunch()`, pack services, upsell, and secondaryColor into a `config` object before calling `createTenant()`.

### 3. No duplicate slug/ID check
**File:** `src/pages/Onboarding.jsx` line 98-108
**Issue:** Slug and ID are generated from business name with no uniqueness check. If two businesses both named "ABC Cleaning" sign up, they'd get the same slug and the second insert would either fail silently or overwrite the first.
**Impact:** Data loss for existing tenant if another signs up with same name.
**Fix:** Query Supabase for existing slug before insert, append a number if taken (e.g., abc-cleaning-2).

---

## HIGH (Should fix before soft launch, or document for early clients)

### 4. Route mismatch: SOP says /onboarding, code uses /signup
**File:** `src/App.jsx` line 13
**Issue:** The actual route is `/signup`, not `/onboarding`. Any links, docs, or marketing that reference `/onboarding` will 404.
**Impact:** Broken links in marketing materials, SOP, or direct referrals.
**Fix:** Either rename the route to `/onboarding` or update all docs. I'd recommend adding both routes to be safe.

### 5. Secondary color not saved to Supabase
**File:** `src/lib/db.js` (tenantToRow function)
**Issue:** `tenantToRow()` maps `primaryColor` → `primary_color` but there's no mapping for `secondaryColor`. The column may not even exist in the Supabase table.
**Impact:** Tenants who pick a color scheme only get their primary color saved. Secondary color defaults after re-login.
**Fix:** Add `secondary_color` to tenantToRow and the Supabase table, or store it in the config JSONB.

### 6. Onboarding service format doesn't match dashboard format
**File:** `src/pages/Onboarding.jsx` vs `src/pages/TenantDashboard.jsx`
**Issue:** Onboarding saves services as `{id, name, enabled, price}`. Dashboard expects `{id, name, enabled, icon, basePrice, perSqFt, perWindow, perLinFt, extras[]}`. If onboarding data DID make it into config (after fixing issue #2), the dashboard would still show broken pricing because the data shapes don't match.
**Impact:** Even after fixing the config save, pricing data would be incompatible between onboarding and dashboard.
**Fix:** Either transform the simplified onboarding format into the full format during save, or use the configAdapter to bridge the gap.

### 7. Logo stored as full base64 data URL
**File:** `src/pages/Onboarding.jsx` line 112
**Issue:** `logo: logoPreview` stores the entire base64-encoded image as a string. This goes into Supabase's `logo_url` column. A typical logo PNG could be 500KB–2MB as base64, which may exceed column or row size limits.
**Impact:** Large logos may fail to save, or blow up Supabase row size. DB queries returning all tenants would transfer massive data.
**Fix:** Upload logos to Supabase Storage (S3-backed) and store just the URL.

---

## MEDIUM (Fix before public launch)

### 8. No email validation
**File:** `src/pages/Onboarding.jsx` line 93
**Issue:** `canProceed()` only checks `form.email` is truthy. "asdf" would pass. No regex or format check.
**Impact:** Invalid emails would prevent dashboard login later (email must match exactly).
**Fix:** Add basic email regex validation.

### 9. Email-only login (no password/auth)
**File:** `src/pages/TenantDashboard.jsx` line 266
**Issue:** Anyone who knows a tenant's email can access their full dashboard, pricing, and leads.
**Impact:** Zero security. Acceptable for soft launch with trusted early clients, but must fix before public launch.
**Fix:** Add Supabase Auth or at minimum a password field.

### 10. getBillingStatus call fails silently on first load
**File:** `src/pages/TenantDashboard.jsx` line 288
**Issue:** `getBillingStatus(found.id)` calls `/api/billing-status` which likely doesn't exist as a deployed serverless function yet. The `.catch(() => setBilling(null))` swallows the error, so billing tab would show empty/loading state forever.
**Impact:** Billing tab appears broken for all tenants.
**Fix:** Either deploy the billing API endpoint or show a clear "Billing coming soon" message when the API isn't available.

### 11. Stripe in test mode
**File:** `api/create-checkout.js`
**Issue:** Stripe keys are test keys. No real payments can be processed.
**Impact:** Billing tab and lead credit purchases don't work with real money.
**Fix:** Switch to live keys when ready. Keep test for soft launch.

### 12. Admin dashboard password is hardcoded
**File:** `src/pages/AdminDashboard.jsx`
**Issue:** The admin login likely uses a simple hardcoded check rather than proper auth.
**Impact:** Anyone who knows the password can see all tenants' data.
**Fix:** Move to environment variable at minimum, proper auth eventually.

---

## LOW (Nice to have)

### 13. No signup notification system
**Issue:** When a new tenant signs up, there's no email/Slack notification to the MyBidQuick team.
**Impact:** You'd have to manually check Supabase or the admin dashboard to know when someone signs up.
**Fix:** Add a webhook or email trigger on tenant creation.

### 14. Demo tenants have different emails across files
**Files:** `AdminDashboard.jsx` has `tim@mybidquick.com`, `TenantDashboard.jsx` has `tim.sullivan@clouteinc.com`
**Issue:** The demo email for Tim's Cloute Cleaning tenant is different in the admin dashboard vs tenant dashboard demo data.
**Impact:** Confusing during demos; login with one email wouldn't match the other page's data.
**Fix:** Align demo emails across both files.

### 15. No "back to dashboard" link after onboarding
**Issue:** If a client closes the success page before clicking "Open Dashboard", they'd need to know to go to `/dashboard` and log in with their email. There's no recovery flow.
**Fix:** Include the dashboard URL in the welcome email (which the SOP covers).

---

## Soft Launch Readiness Assessment

| Category | Status | Notes |
|----------|--------|-------|
| Onboarding wizard loads | ✅ Ready | Route is /signup (not /onboarding) |
| Business info collection | ✅ Ready | Required fields validated |
| Branding (logo + colors) | ⚠️ Partial | Logo base64 issue, secondary color lost |
| Services configuration | ❌ Broken | Data not saved to config JSONB |
| Upsell cascade setup | ❌ Broken | Data not saved to config JSONB |
| Tenant record creation | ⚠️ Partial | Creates record but loses most config |
| Dashboard login | ✅ Ready | Email-only works (no security) |
| Dashboard config editing | ✅ Ready | Works with DEFAULT_CONFIG fallback |
| Quoting page (engine) | ⚠️ Not connected | Engine uses separate config, not tenant config |
| Billing/Stripe | ❌ Not ready | Test mode, API may not be deployed |
| Subdomain routing | ❌ Not ready | DNS not configured |

### Verdict: NOT ready for self-serve soft launch as-is

**Minimum fixes needed for this weekend:**
1. Fix the success page navigation (#1) — 2 minutes
2. Pack onboarding data into config object (#2) — 15 minutes
3. Add duplicate slug check (#3) — 10 minutes
4. Fix route to /onboarding or add alias (#4) — 2 minutes
5. Save secondary color (#5) — 5 minutes

**Recommended approach for soft launch:** Use the White-Glove path exclusively. You personally walk each early client through setup, which lets you work around the data format issues by manually configuring their dashboard after onboarding. This is actually better for early clients anyway — they get personal attention and you get direct feedback.
