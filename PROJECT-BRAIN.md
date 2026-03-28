# MyBidQuick â Project Brain

## What Is This?
MyBidQuick is a SaaS platform owned by **Tim Sullivan** (personally, NOT Cloute Inc). It's a white-label quoting tool that Tim sells to other cleaning companies. Each cleaning company gets their own branded quote page powered by MyBidQuick's engine.

## Business Model â Per-Lead Credit Billing
Tenants buy lead credit packs upfront. Each quote submission from a customer deducts 1 credit. New accounts get 3 free credits to try it out.

### Lead Credit Packs
| Pack | Credits | Price | Per Lead |
|------|---------|-------|----------|
| Starter | 10 | $25 | $2.50 |
| Growth | 25 | $50 | $2.00 |
| Pro | 50 | $85 | $1.70 |
| Agency | 100 | $150 | $1.50 |

### How It Works
1. Tenant signs up â gets 3 free lead credits
2. Tenant buys a credit pack via Stripe Checkout
3. Stripe webhook adds credits to their account in Supabase
4. Each customer quote submission deducts 1 credit + logs the charge
5. When credits run out, quote form stops accepting submissions (shows "NO_CREDITS" error)

## Architecture
Two repos (both under MyBidQuick):
1. **mybidquick** (this repo) â The SaaS platform: marketing site, onboarding wizard, admin dashboard
2. **mybidquick-engine** (formerly Cleanbid) â The quoting engine that generates quotes for customers

### How They Connect
- Tenant configs live in **Supabase** (tenants table with config JSONB column)
- URL pattern: `slug.mybidquick.com` (subdomain-style, e.g., `cloute-cleaning.mybidquick.com`)
- Slugs auto-generated from business name during onboarding (e.g., "Cloute Cleaning" â "cloute-cleaning")
- New companies can self-serve sign up WITHOUT any code changes

## Tech Stack
- **Frontend**: React + Vite (SPA with HashRouter)
- **Styling**: Custom CSS with CSS variables (in index.css)
- **Icons**: Lucide React
- **Hosting**: Vercel (LIVE and deployed)
- **Database**: Supabase (PostgreSQL with RLS) â tenant storage, leads, billing
- **Payments**: Stripe (per-lead credit billing via Checkout + Customer Portal)
- **Serverless API**: Vercel Functions (4 endpoints in `/api/`)
- **Domains**: mybidquick.com, mybidquick.io, mybidquick.org (all purchased via Vercel, all connected)
- **Vercel URL**: mybidquick.vercel.app

## Repo Info
- **GitHub**: github.com/sppartyof7-ship-it/mybidquick
- **Local Path (Tim's PC)**: C:\Users\Tim\Downloads\mybidquick

## Pages & Routes
| Route | Component | What It Does |
|-------|-----------|-------------|
| `/` | LandingPage.jsx | Marketing site â hero, features, pricing, testimonials |
| `/signup` | Onboarding.jsx | 3-step wizard for new cleaning companies to sign up |
| `/onboarding` | Onboarding.jsx | Alias for /signup (both routes work) |
| `/admin/*` | AdminDashboard.jsx | Tim's admin panel to manage tenants & revenue |
| `/demo/quote` | QuoteDemo.jsx | Interactive customer quote demo with upsell flow |
| `/login` | Login.jsx | Email + password login (Supabase Auth) with forgot password |
| `/dashboard` | TenantDashboard.jsx | Full tenant admin panel for each cleaning company (auth-protected) |

## Key Files
```
mybidquick/
âââ index.html              # Entry HTML
âââ .env                    # Client-side env vars (VITE_ prefixed, publishable keys only)
âââ vercel.json             # Vercel rewrites (API routes + SPA fallback)
âââ api/                    # Vercel Serverless Functions
â   âââ create-checkout.js  # Creates Stripe Checkout sessions for credit packs
â   âââ create-portal.js    # Creates Stripe Customer Portal sessions
â   âââ billing-status.js   # GET billing info (credits, purchases, charges)
â   âââ webhook.js          # Stripe webhook (fulfills credit purchases)
âââ supabase/
â   âââ billing-schema.sql  # SQL for billing tables (lead_charges, credit_purchases)
âââ src/
â   âââ main.jsx            # React entry with HashRouter
â   âââ App.jsx             # Router (7 routes, including /onboarding alias)
â   âââ index.css           # Global styles & CSS variables
â   âââ lib/
â   â   âââ supabase.js     # Supabase client init
â   â   âââ db.js           # Database layer (Supabase + localStorage fallback)
â   â   âââ billing.js      # Client-side billing utilities (fetch wrappers + LEAD_PACKS)
â   âââ pages/
â       âââ LandingPage.jsx     # Marketing landing page
â       âââ Login.jsx           # Email + password login (Supabase Auth) with forgot password
â       âââ Onboarding.jsx      # 3-step signup wizard (includes upsell config)
â       âââ AdminDashboard.jsx  # Tim's admin panel (password: admin123)
â       âââ QuoteDemo.jsx       # Customer-facing quote demo with upsell
â       âââ TenantDashboard.jsx # Tenant admin panel (Leads + Admin + Billing tabs)
âââ mybidquick-logo.svg     # Full logo (lightning bolt + speed lines, navy/orange)
âââ mybidquick-logo.png     # Full logo PNG version
âââ mybidquick-icon.svg     # Icon-only mark (BQ)
âââ mybidquick-icon.png     # Icon-only PNG version
âââ SOFT-LAUNCH-ISSUES.md   # Pre-launch QA audit (15 issues, categorized by severity)
âââ MyBidQuick-Onboarding-SOP.docx # Standard Operating Procedure for onboarding new tenants
âââ package.json            # Dependencies (includes stripe, @stripe/stripe-js)
âââ vite.config.js          # Vite config
```

## Onboarding Wizard (3 Steps)
1. **Business Info**: Company name, owner, email, phone, city, state, website
2. **Branding**: Logo upload, 6 color presets + custom pickers, live preview â shows subdomain URL (`slug.mybidquick.com`)
3. **Services**: 7 toggleable services with price inputs + upsell configuration (toggle, discount slider 5-50%)

On launch, creates tenant in Supabase via `createTenant()` from db.js (with localStorage fallback).

### Default Services
- House Washing ($350)
- Roof Cleaning ($450)
- Gutter Cleaning ($150)
- Window Cleaning ($250)
- Driveway Cleaning ($200)
- Deck & Patio ($275)
- Gutter Guard Install ($800, disabled by default)

### Color Presets
Ocean Blue, Forest Green, Royal Purple, Sunset Orange, Slate, Crimson

## Admin Dashboard
- **Password**: admin123 (change this before going live!)
- **Tabs**: Overview, Tenants, Revenue, Analytics, Settings
- **Demo Tenants**: 5 sample companies including Cloute Cleaning (Tim is managing partner) and Cornerstone Exterior (Noah Baldry)
- Loads real tenants from Supabase via `getAllTenants()`, merges with demo data (deduplicates by email)

## Smart Cascade Upsell Feature
Multi-step upsell flow built into the QuoteDemo page:
1. Customer selects house washing â gets a price
2. **Window upsell** slides in offering window cleaning at a configured discount
3. **Gutter upsell** slides in next offering gutter cleaning at a discount
4. Final summary shows all selected services with total savings

### Configuration
- Configurable in onboarding wizard (Step 3) â toggle on/off, set discount % (5-50%)
- Live customer preview in onboarding shows what the upsell popup looks like
- Full interactive demo at `/demo/quote`

### Window Types
single-hung, double-hung, casement, sliding, bay/bow (each with price multipliers)

### Porting Status
- Built and working in QuoteDemo (mybidquick repo)
- Needs porting to mybidquick-engine (the customer-facing quoting engine)

## Tenant Dashboard (mybidquick.com/#/dashboard)
Full admin panel for each tenant (cleaning company customer). Login via email lookup. Includes:
- **Leads/CRM Panel**: Stats dashboard (total leads, pending, won, revenue), status filters (All/Pending/Won/Lost), expandable lead cards with contact info, services, notes, won/lost actions
- **Pricing Tab**: Global price adjustment slider (-50% to +50%), package multipliers (Basic 1x, Standard 1.35x, Premium 1.75x with editable descriptions), bundle discounts (2-service and 3+ service %)
- **Services Tab**: Per-service config with toggle on/off, base price, per sq ft, per window, per linear ft, and editable add-ons with prices
- **Bundles Tab**: Seasonal bundle builder with name, discount %, end date, tagline
- **Marketing Tab**: Toggleable marketing elements â urgency timer, social proof, limited-time offer, review badge
- **Followup Tab**: Email/SMS sequence builder â delay (days), type (email/sms), subject, body with template variables ({{name}}, {{business}}, {{total}}, {{services}}), add/remove steps
- **Settings Tab**: Business name, admin password, lead sources (add/remove tags), lead notification email, Web3Forms API key, export config JSON
- **Demo accounts**: tim@clouteinc.com, noah@cornerstoneexterior.com
- **Billing Tab**: Credits banner (real-time from Supabase), low/zero credit warnings, 4 lead credit pack cards, "How It Works" section, purchase history table, Manage Billing button (Stripe Customer Portal)
- Config pattern: `updateConfig(dotPath, value)` with `deepClone` for immutable state, localStorage persistence
- Self-contained component with inline styles, blue theme (#3b9cff primary)

## Demo Tenants (Hardcoded)
| Company | Owner | Plan | Quotes/Month |
|---------|-------|------|-------------|
| Cloute Cleaning | Tim Sullivan | Pro | 147 |
| Cornerstone Exterior | Noah Baldry | Growth | 63 |
| + 3 others | Various | Various | Various |

## Branding
- Product name: **MyBidQuick**
- Logo mark: **BQ**
- Tagline: "The #1 Quoting Tool for Cleaning Companies"
- Footer: "Proudly made in Wisconsin"
- Copyright: Â© MyBidQuick

## Roadmap / TODO

### COMPLETED
- [x] Build marketing landing page
- [x] Build onboarding wizard
- [x] Build admin dashboard
- [x] Push to GitHub (github.com/sppartyof7-ship-it/mybidquick)
- [x] Deploy to Vercel (mybidquick.vercel.app)
- [x] Purchase domains (mybidquick.com, .io, .org â all via Vercel)
- [x] Connect all 3 domains + www variants to Vercel project
- [x] SSL certificates generated
- [x] Add window cleaning upsell feature to onboarding + customer-facing QuoteDemo page
- [x] Upgrade to smart cascade upsell (house wash â windows â gutters) in QuoteDemo
- [x] Build full tenant admin dashboard (6 tabs + Leads/CRM)
- [x] Fix Followup tab JSX expression bug

### COMPLETED â Phase 2 (Backend & Database)
- [x] Add Supabase database for tenant storage (replaces localStorage)
- [x] Build db.js abstraction layer (Supabase + localStorage fallback)
- [x] Tenant CRUD: create, read by email, update config
- [x] Leads CRUD: create (with credit deduction), read, update status
- [x] Connect mybidquick-engine (quoting engine) to pull tenant configs from database
- [x] Real authentication for admin dashboard (Supabase Auth â email + password)

### COMPLETED â Phase 3 (Monetization / Stripe Billing)
- [x] Stripe per-lead credit billing (Checkout + Customer Portal + webhook)
- [x] 4 Vercel serverless API routes (create-checkout, create-portal, billing-status, webhook)
- [x] Billing tab in tenant dashboard (credits banner, pack cards, purchase history)
- [x] Credit deduction on lead creation (1 credit per quote submission)
- [x] Supabase billing schema (lead_charges + credit_purchases tables)
- [x] Configure Stripe webhook endpoint URL in Stripe Dashboard (https://www.mybidquick.com/api/webhook)
- [x] Add STRIPE_WEBHOOK_SECRET env var to Vercel for signature verification
- [ ] Usage analytics / reporting for tenants

### SOFT LAUNCH FIXES (from QA audit â March 27, 2026)
See SOFT-LAUNCH-ISSUES.md for full details (15 issues, severity-ranked).

**Critical (must fix before soft launch):**
- [x] Fix success page navigation: `/admin` â `/dashboard` (Onboarding.jsx)
- [x] Pack onboarding services/upsell data into config JSONB before createTenant()
- [x] Add duplicate slug check before tenant creation (appends -2, -3, etc.)
- [x] Add `/onboarding` route alias (both /signup and /onboarding now work)
- [x] Save secondaryColor to Supabase (secondary_color column + tenantToRow mapping)
- [x] Transform onboarding service format to match dashboard format (basePrice, perSqFt, perWindow, perLinFt, extras)
- [ ] Upload logos to Supabase Storage instead of storing base64 in DB

**Medium:**
- [x] Add email format validation in onboarding (regex check + red border feedback)
- [ ] Deploy billing API endpoints to Vercel (or show "coming soon" message)

### PHASE 4 â Growth Features
- [x] Port cascade upsell flow from QuoteDemo to mybidquick-engine (with tenant discount config)
- [ ] Email notifications for new signups
- [ ] Tenant self-serve dashboard (companies edit their own settings)
- [ ] Analytics for tenants (how many quotes, conversion rates)
- [ ] Referral program
- [ ] Blog / SEO content on mybidquick.com

### PHASE 5 â Exterior Cleaning Expansion (NEW â March 2026)
**Market**: Exterior building cleaning is a $12.5B market (2024) growing to $20.3B by 2033. U.S. pressure washing alone = $1.2B. 34,000+ pressure washing businesses in US, most using generic tools.

**Competitors**: ResponsiBid ($829 setup + $229/mo), QuoteIQ ($249/mo), Jobber ($69-349/mo). MyBidQuick is 10x cheaper with per-lead pricing.

#### Product Roadmap
- [ ] Add pressure washing as default service (sq ft pricing)
- [ ] Add soft washing as a service option
- [ ] Add fence cleaning as a service option
- [ ] Add surface material type modifier (vinyl, brick, stucco, wood â different multipliers)
- [ ] Add roof pitch/slope estimator for roof cleaning
- [ ] Add story count surcharge (2nd story = 1.3x, 3rd = 1.6x)
- [ ] Add condition modifier (light/moderate/heavy)
- [ ] Add "What type of cleaning company?" to onboarding Step 1
- [ ] Auto-populate services based on company type
- [ ] Expand cascade upsells: pressure wash â sealing, house wash â soffit/fascia
- [ ] Commercial quoting support (larger properties)
- [ ] Seasonal pricing (peak-season surcharges)

#### Go-To-Market Strategy
- **Facebook Groups**: Join pressure washing biz groups (50K+ combined members), share value-first content
- **Before/After Content**: TikTok, Instagram Reels, YouTube Shorts â 3-5x engagement
- **Google Ads**: Target "pressure washing estimate software" keywords ($500-1K/month)
- **YouTube Tutorials**: "How to Price Pressure Washing Jobs" educational content â funnel to MBQ
- **Partnerships**: Equipment suppliers, training programs, affiliate program for tenants
- **SEO/Blog**: Target 10-15 pressure washing pricing keywords in 6 months

#### Full Research
See Notion: [Exterior Cleaning Expansion â Product & Marketing Research](https://www.notion.so/330006ff1159818e8de5ce87a82c00a4)

## Related Repos
- **mybidquick-engine** (formerly Cleanbid/ClouteBid): github.com (separate repo) â The customer-facing quoting engine, currently deployed at cleanbid.vercel.app (to be rebranded). Has its own admin panel at `#admin` (password: admin123) with AdminPanel.jsx, LeadsPanel.jsx, config-driven architecture. All under the MyBidQuick brand now.

## Session Log
| Date | What We Did |
|------|------------|
| 2026-03-25 | Built entire MVP: landing page, onboarding wizard, admin dashboard. Pushed to GitHub. Deployed to Vercel. Purchased & connected mybidquick.com, .io, .org domains. |
| 2026-03-26 | Added window cleaning upsell feature (onboarding config + QuoteDemo page). Upgraded to smart cascade upsell (house wash â windows â gutters). Built full tenant admin dashboard â 6 tabs (Pricing, Services, Bundles, Marketing, Followup, Settings) + Leads/CRM panel. Fixed Followup tab JSX bug. |
| 2026-03-26 | Connected Supabase database (tenant storage, leads). Migrated Onboarding + AdminDashboard from localStorage to Supabase (with fallback). Switched tenant URL pattern to subdomain-style (slug.mybidquick.com). Built full Stripe per-lead billing integration: 4 serverless API routes, Billing tab in tenant dashboard, credit deduction on lead creation. Added billing schema to Supabase (lead_charges, credit_purchases tables). Tested end-to-end: Billing tab shows 3 free credits, Buy Leads buttons redirect to Stripe Checkout. |
| 2026-03-27 | Created MyBidQuick logo (lightning bolt + speed lines, navy/orange palette) in SVG + PNG. Also generated via ChatGPT/DALL-E for high-quality AI version. Researched exterior cleaning market expansion: $12.5B market, 34K+ pressure washing businesses. Built full product roadmap (Phase 5) and go-to-market strategy. Added comprehensive research page to Notion brain. Updated PROJECT-BRAIN.md with Phase 5 expansion plan. |
| 2026-03-27 | Brand consolidation: everything is now under **MyBidQuick**. Removed all ClouteBid/Cleanbid branding from PROJECT-BRAIN.md. Quoting engine repo rebranded as "mybidquick-engine" (code-level rename still pending). |
| 2026-03-27 | **Supabase Auth**: Real authentication replacing admin123. Onboarding creates auth user (email+password), Login.jsx page with forgot password, TenantDashboard auto-detects session, auth_user_id column + RLS policies on tenants table. **Engine upsell discount**: wired tenant's `upsell.discountPercent` into CustomerFlow.jsx â shows "Save X%!" badges, applies discount to upselled service pricing. |
| 2026-03-27 | **Soft launch QA audit**: Full code walkthrough identified 15 issues across 4 severity levels (3 critical, 4 high, 5 medium, 3 low). Created SOFT-LAUNCH-ISSUES.md with fixes and readiness assessment. Verdict: not ready for self-serve launch, but White-Glove path viable. Created MyBidQuick-Onboarding-SOP.docx for manual tenant onboarding. Added `/onboarding` route alias in App.jsx. |
| 2026-03-28 | **Engine deploy**: Pushed tiered pricing defaults.js + CustomerFlow.jsx (smart cascade upsell with tenant config) to mybidquick-engine. Fixed base64 injection corruption on line 473. Both Vercel deploys GREEN. **Soft launch audit**: Verified all 5 critical QA fixes already shipped â success nav, config JSONB packing, duplicate slug check, secondaryColor column, service format transform. Also confirmed email validation already added. Updated PROJECT-BRAIN.md checklist. |

## Environment Variables
### In `.env` (committed to repo â client-side, publishable only)
- `VITE_SUPABASE_URL` â Supabase project URL
- `VITE_SUPABASE_ANON_KEY` â Supabase public/anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` â Stripe publishable key (pk_test_...)

### In Vercel Dashboard (NOT committed â server-side secrets)
- `VITE_SUPABASE_URL` â Also needed by serverless functions
- `VITE_SUPABASE_ANON_KEY` â Also needed by serverless functions
- `STRIPE_SECRET_KEY` â Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` â Stripe webhook signing secret (whsec_...)

### Supabase
- **Project**: Mybidquick (eccuaztubjdxicylcwrh)
- **Tables**: tenants, leads, lead_charges, credit_purchases
- **Auth column on tenants**: auth_user_id (UUID FK â auth.users.id, unique)
- **Billing columns on tenants**: stripe_customer_id, lead_credits (default 3), lead_price_cents (default 500), billing_active

## Important Notes
- Cloute Cleaning and Cornerstone Exterior are **customers/tenants** â Tim is a managing partner at Cloute, not the owner
- This is Tim's personal product â keep all Cloute Inc branding OUT
- Tim is learning to code â keep explanations beginner-friendly
- The quoting engine (mybidquick-engine repo, formerly Cleanbid) is part of MyBidQuick â same brand, separate repo
