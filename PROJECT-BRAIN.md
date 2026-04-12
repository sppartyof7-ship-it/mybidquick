# MyBidQuick — Project Brain

## What Is This?
MyBidQuick is a SaaS platform owned by **Tim Sullivan** (personally, NOT Cloute Inc). It's a white-label quoting tool that Tim sells to other cleaning companies. Each cleaning company gets their own branded quote page powered by MyBidQuick's engine.

## Owner Identity — Tim Sullivan
Tim Sullivan has multiple businesses. These must NEVER be mixed together in any system:
| Business | Email | Role |
|----------|-------|------|
| MyBidQuick (this SaaS) | s.p.partyof7@gmail.com | Owner/founder |
| Cloute Inc / Cloute Exterior Cleaning | tim.sullivan@clouteinc.com | Managing partner (also a MyBidQuick tenant/client) |
| Positivity Coaching | tim@wechoosepositivity.com | Coach (separate business, separate Stripe) |
| My 3D Family | tim@my3dfamily.net | Family 3D printing business |

**Important**: Cloute Exterior Cleaning is a CLIENT of MyBidQuick, not the owner entity. Keep all identities separate across Stripe, Supabase, and all other systems.

## Business Model — Per-Lead Credit Billing
Tenants buy lead credit packs upfront. Each quote submission from a customer deducts 1 credit. New accounts get 3 free credits to try it out.

### Lead Credit Packs
| Pack | Credits | Price | Per Lead |
|------|---------|-------|----------|
| Starter | 10 | $25 | $2.50 |
| Growth | 25 | $50 | $2.00 |
| Pro | 50 | $85 | $1.70 |
| Agency | 100 | $150 | $1.50 |

### How It Works
1. Tenant signs up → gets 3 free lead credits
2. Tenant buys a credit pack via Stripe Checkout
3. Stripe webhook adds credits to their account in Supabase
4. Each customer quote submission deducts 1 credit + logs the charge
5. When credits run out, quote form stops accepting submissions (shows "NO_CREDITS" error)

## Architecture
Two repos (both under MyBidQuick):
1. **mybidquick** (this repo) — The SaaS platform: marketing site, onboarding wizard, admin dashboard
2. **mybidquick-engine** (formerly Cleanbid) — The quoting engine that generates quotes for customers

### How They Connect
- Tenant configs live in **Supabase** (tenants table with config JSONB column)
- URL pattern: `slug.mybidquick.com` (subdomain-style, e.g., `cloute-cleaning.mybidquick.com`)
- Slugs auto-generated from business name during onboarding (e.g., "Cloute Cleaning" → "cloute-cleaning")
- New companies can self-serve sign up WITHOUT any code changes

## Tech Stack
- **Frontend**: React + Vite (SPA with HashRouter)
- **Styling**: Custom CSS with CSS variables (in index.css)
- **Icons**: Lucide React
- **Hosting**: Vercel (LIVE and deployed)
- **Database**: Supabase (PostgreSQL with RLS) — tenant storage, leads, billing
- **Payments**: Stripe (per-lead credit billing via Checkout + Customer Portal)
- **Serverless API**: Vercel Functions (10 endpoints in `/api/`)
- **Domains**: mybidquick.com, mybidquick.io, mybidquick.org (all purchased via Vercel, all connected)
- **Vercel URL**: mybidquick.vercel.app

## Repo Info
- **GitHub**: github.com/sppartyof7-ship-it/mybidquick
- **Local Path (Tim's PC)**: C:\Users\Tim\Downloads\mybidquick

## Pages & Routes
| Route | Component | What It Does |
|-------|-----------|-------------|
| `/` | LandingPage.jsx | Marketing site — hero, features, pricing, testimonials |
| `/signup` | Onboarding.jsx | 3-step wizard for new cleaning companies to sign up |
| `/onboarding` | Onboarding.jsx | Alias for /signup (both routes work) |
| `/admin/*` | AdminDashboard.jsx | Tim's admin panel to manage tenants & revenue |
| `/demo/quote` | QuoteDemo.jsx | Interactive customer quote demo with upsell flow |
| `/login` | Login.jsx | Email + password login (Supabase Auth) with forgot password |
| `/dashboard` | TenantDashboard.jsx | Full tenant admin panel for each cleaning company (auth-protected) |
| `/blog` | BlogIndex (BlogPost.jsx) | Blog index page listing all SEO articles |
| `/blog/:slug` | BlogPost (BlogPost.jsx) | Individual blog post pages (10 SEO articles, incl. 3 competitor comparisons) |
| `/privacy` | PrivacyPolicy.jsx | Privacy Policy page (required for Gartner/Capterra listing) |
| `/terms` | TermsOfService.jsx | Terms of Service page (required for Gartner/Capterra listing) |
| `/q/:slug` | TenantPublicPage.jsx | Fallback tenant quote page for before subdomain DNS is set up |
| *(subdomain)* | TenantPublicPage.jsx | Auto-detected via `slug.mybidquick.com` — shows tenant's public quote page |

## Key Files (cleaned up 2026-03-31)
```
mybidquick/
├── index.html              # Entry HTML
├── .env                    # Client-side env vars (VITE_ prefixed, publishable keys only)
├── .gitignore              # Ignores: node_modules, dist, .env, lock files, OS files
├── vercel.json             # Vercel rewrites (API routes + SPA fallback)
├── embed-snippet.html      # Drop-in HTML for tenants to embed quote widget on their site
├── PROJECT-BRAIN.md        # This file — full project documentation
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI — runs `npm run build` on every push to main
├── api/                    # Vercel Serverless Functions (11 endpoints)
│   ├── _lib/
│   │   ├── encryption.js       # AES-256-GCM encrypt/decrypt for OAuth tokens
│   │   └── supabase-admin.js   # Supabase client with service_role_key (bypasses RLS)
│   ├── billing-status.js       # GET billing info (credits, purchases, charges)
│   ├── create-calendar-event.js # Creates Google Calendar event from lead scheduling prefs
│   ├── create-checkout.js      # Creates Stripe Checkout sessions for credit packs
│   ├── create-portal.js        # Creates Stripe Customer Portal sessions
│   ├── google-auth-callback.js # OAuth callback — exchanges code → tokens → encrypts → stores
│   ├── google-auth-start.js    # Initiates Google OAuth flow (Calendar + email scopes)
│   ├── google-disconnect.js    # Revokes Google tokens + cleans up integration record
│   ├── send-quote-confirmation.js # Sends confirmation email to customer after quote submission (Resend)
│   ├── webhook.js              # Stripe webhook (fulfills credit purchases) — endpoint: /api/webhook
│   └── weekly-pipeline-email.js # Weekly pipeline summary email to tenants (scheduled Monday 8am ET via Resend)
├── docs/                   # Marketing, planning, and reference docs (not deployed)
│   ├── client-acquisition-playbook.html  # Interactive playbook: cold DM templates, FB group posts, directory links
│   ├── directory-listings.md             # Software directory submission guide + links
│   ├── resend-setup.md                   # Resend email/SMTP configuration reference
│   ├── welcome-email-sequence.md         # 5-email welcome sequence templates
│   ├── tim-personal-posts.md             # Tim's personal social media post templates
│   ├── community-launch-posts.md         # Ready-to-post copy for PH, Reddit, IH, FB groups
│   ├── marketing-teaser-tonight.md       # Soft-launch "First 50 FREE" campaign
│   ├── design-philosophy.md              # "Electric Velocity" brand design philosophy
│   ├── SOFT-LAUNCH-ISSUES.md             # Pre-launch QA audit (15 issues, categorized)
│   ├── MyBidQuick-Onboarding-SOP.docx    # Standard Operating Procedure for onboarding
│   ├── MyBidQuick-Marketing-Playbook.docx # Marketing playbook document
│   ├── MyBidQuick-Lead-Pipeline.xlsx     # Lead pipeline tracker spreadsheet
│   └── seo-audit-march2026.html          # SEO audit report with keyword opps
├── supabase/
│   ├── schema.sql              # Core schema (tenants, leads tables)
│   ├── add-slug.sql            # Slug column migration
│   ├── billing-schema.sql      # Billing tables (lead_charges, credit_purchases)
│   ├── integrations-schema.sql # OAuth token storage (integrations table, RLS server-only)
│   ├── scheduling-schema.sql   # Adds 'scheduled' status + preferred_days/time columns to leads
│   ├── rls-hardening.sql       # 12 scoped RLS policies replacing open "Allow public *" policies
│   ├── rls-rollback.sql        # Rollback script to restore pre-hardening policies
│   └── RLS-TEST-CHECKLIST.md   # Manual test checklist for verifying RLS policies
├── public/
│   ├── favicon.svg         # Site favicon
│   ├── icons.svg           # Icon sprite
│   ├── mybidquick-logo.svg # Full logo SVG (served at /mybidquick-logo.svg by Vite)
│   ├── mybidquick-logo.png # Logo PNG version
│   ├── robots.txt          # SEO robots file (sitemap URL points to www.mybidquick.com)
│   └── sitemap.xml         # SEO sitemap (all 6 URLs use www.mybidquick.com)
├── src/
│   ├── main.jsx            # React entry with HashRouter
│   ├── App.jsx             # Router (13 routes + subdomain detection)
│   ├── index.css           # Global styles & CSS variables
│   ├── lib/
│   │   ├── supabase.js     # Supabase client init
│   │   ├── db.js           # Database layer (Supabase + localStorage fallback)
│   │   └── billing.js      # Client-side billing utilities (fetch wrappers + LEAD_PACKS)
│   │   # db.js also includes: uploadLogo() (Supabase Storage), getLaunchCustomerCount(), signUp(), linkAuthToTenant()
│   └── pages/
│       ├── LandingPage.jsx     # Marketing landing page
│       ├── Login.jsx           # Email + password login (Supabase Auth) with forgot password
│       ├── Onboarding.jsx      # 3-step signup wizard (includes upsell config)
│       ├── AdminDashboard.jsx  # Tim's admin panel (password via VITE_ADMIN_PASSWORD env var)
│       ├── QuoteDemo.jsx       # Customer-facing quote demo with upsell
│       ├── TenantDashboard.jsx # Tenant admin panel (Leads + Admin + Billing + Analytics tabs)
│       ├── BlogPost.jsx        # Blog index + individual post pages (10 SEO articles incl. competitor comparisons)
│       ├── PrivacyPolicy.jsx   # Privacy Policy page (for Gartner/Capterra listing approval)
│       ├── TermsOfService.jsx  # Terms of Service page (for Gartner/Capterra listing approval)
│       └── TenantPublicPage.jsx # Public-facing tenant quote page (subdomain or /q/:slug)
├── mybidquick-logo.svg     # Full logo (lightning bolt + speed lines, navy/orange)
├── mybidquick-logo.png     # Full logo PNG version
├── mybidquick-icon.svg     # Icon-only mark (BQ)
├── mybidquick-icon.png     # Icon-only PNG version
├── AUDIT-APRIL-2026.md     # April 2026 production audit findings
├── PRODUCTION-ACTION-PLAN.md # Production hardening action plan
├── embed-snippet.html      # Copy-paste HTML embed code for tenants — 3 options: full-page iframe, floating button + slide-up modal, simple CTA link
├── County-Wide-PowerWash-Website-Audit-V2.docx # Website audit delivered to County Wide (Steven)
├── package.json            # Dependencies (includes stripe, @stripe/stripe-js)
└── vite.config.js          # Vite config
```

## Onboarding Wizard (3 Steps)
1. **Business Info**: Company name, owner, email, phone, city, state, website, discount code (LAUNCH20 promo)
2. **Branding**: Logo upload, 6 color presets + custom pickers, live preview — shows subdomain URL (`slug.mybidquick.com`)
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
- **Password**: Set via `VITE_ADMIN_PASSWORD` env var in Vercel (hardcoded admin123 fallback removed 2026-04-01)
- **Tabs**: Overview, Tenants, Revenue, Analytics, Settings
- **Demo Tenants**: 5 sample companies including Cloute Cleaning (Tim is managing partner) and Cornerstone Exterior (Noah Baldry)
- Loads real tenants from Supabase via `getAllTenants()`, merges with demo data (deduplicates by email)

## Smart Cascade Upsell Feature
Multi-step upsell flow built into the QuoteDemo page:
1. Customer selects house washing → gets a price
2. **Window upsell** slides in offering window cleaning at a configured discount
3. **Gutter upsell** slides in next offering gutter cleaning at a discount
4. Final summary shows all selected services with total savings

### Configuration
- Configurable in onboarding wizard (Step 3) — toggle on/off, set discount % (5-50%)
- Live customer preview in onboarding shows what the upsell popup looks like
- Full interactive demo at `/demo/quote`

### Window Types
single-hung, double-hung, casement, sliding, bay/bow (each with price multipliers)

### Porting Status
- Built and working in QuoteDemo (mybidquick repo)
- Needs porting to mybidquick-engine (the customer-facing quoting engine)

## Tenant Dashboard (mybidquick.com/#/dashboard)
Full admin panel for each tenant (cleaning company customer). Login via Supabase Auth. Includes:
- **Leads/CRM Panel**: Stats dashboard (total leads, pending, won, revenue), status filters (All/New/Contacted/Scheduled/Won/Lost), expandable lead cards with contact info, services, scheduling preferences, notes, quick-move actions
- **Pricing Tab**: Global price adjustment slider (-50% to +50%), package multipliers (Standard 1.0x, Premium 1.25x, Platinum 1.55x with editable descriptions), bundle discounts (2/3/4/5-service %), multi-story upcharge controls (2-story and 3-story multipliers), configurable minimum charge floors per service
- **Services Tab**: Per-service config with toggle on/off, base price, per sq ft, per window, per linear ft, and editable add-ons with prices
- **Bundles Tab**: Seasonal bundle builder with name, discount %, end date, tagline
- **Marketing Tab**: Toggleable marketing elements — urgency timer, social proof, limited-time offer, review badge
- **Followup Tab**: Email/SMS sequence builder — delay (days), type (email/sms), subject, body with template variables ({{name}}, {{business}}, {{total}}, {{services}}), add/remove steps
- **Integrations Tab**: Google Calendar OAuth integration — connect/disconnect with one click, encrypted token storage (AES-256-GCM), auto-create calendar events from leads with scheduling preferences, shows connected account email. OAuth flow: google-auth-start → Google consent → google-auth-callback → encrypted token stored in `integrations` table
- **Settings Tab**: Business name, admin password, lead sources (add/remove tags), lead notification email, Web3Forms API key, export config JSON
- **Demo accounts**: tim.sullivan@clouteinc.com, noah@cornerstoneexterior.com
- **Analytics Tab**: Time range filter (7d/30d/90d/All), 4 KPI cards (Total Quotes, Conversion Rate, Avg Ticket Size, Total Revenue), conversion funnel visualization (New → Contacted → Scheduled → Won with dropout rates), ROI summary card (Cost per Lead, Revenue per Lead, ROI %, Credits Remaining), bar chart for quote volume by month (last 6 months), revenue by month chart, lead source breakdown with color-coded percentage bars, top services by popularity, revenue by service, performance summary (best day, avg quotes/day), recent quotes table (last 10), follow-up opportunities (leads needing contact). Empty state shown when no leads exist yet. All computed client-side from the `leads` array.
- **Billing Tab**: Credits banner (real-time from Supabase), low/zero credit warnings, 4 lead credit pack cards, "How It Works" section, purchase history table, Manage Billing button (Stripe Customer Portal)
- Config pattern: `updateConfig(dotPath, value)` with `deepClone` for immutable state, localStorage persistence
- Self-contained component with inline styles, blue theme (#3b9cff primary)

## Demo Tenants (Hardcoded in AdminDashboard)
| Company | Owner | Plan | Quotes/Month |
|---------|-------|------|-------------|
| Cloute Cleaning | Tim Sullivan | Pro | 147 |
| Cornerstone Exterior | Noah Baldry | Growth | 63 |
| + 3 others | Various | Various | Various |

**Real Tenants (Supabase)**: 3 active — Cloute Exterior Cleaning, Cornerstone Wash and Window Cleaning, County Wide Power Wash. See "Active Tenants" section in mybidquick-engine docs below for full details.

## Branding
- Product name: **MyBidQuick**
- Logo: **mybidquick-logo.svg** (lightning bolt + speed lines icon, navy/orange gradient, wordmark: "My" light + "Bid" bold + "Quick" bold orange, tagline: "INSTANT QUOTES FOR PROS", 800x240 viewBox)
- Logo files: `mybidquick-logo.svg`, `mybidquick-logo.png` (repo root) — also copied to `public/` for Vite serving
- Logo in code: All pages use `<img src="/mybidquick-logo.svg">` — no more "BQ" placeholder divs
- Dark backgrounds (footer, sidebar): CSS `filter: 'brightness(0) invert(1)'` for white version
- Pages with logo: LandingPage.jsx (nav + footer), Login.jsx (nav + card header), Onboarding.jsx (nav), AdminDashboard.jsx (auth screen + sidebar), TenantDashboard.jsx (page header)
- Tagline: "The #1 Quoting Tool for Cleaning Companies"
- Footer: "Proudly made in Wisconsin"
- Copyright: © 2026 MyBidQuick All rights reserved.

## Roadmap / TODO

### COMPLETED
- [x] Build marketing landing page
- [x] Build onboarding wizard
- [x] Build admin dashboard
- [x] Push to GitHub (github.com/sppartyof7-ship-it/mybidquick)
- [x] Deploy to Vercel (mybidquick.vercel.app)
- [x] Purchase domains (mybidquick.com, .io, .org — all via Vercel)
- [x] Connect all 3 domains + www variants to Vercel project
- [x] SSL certificates generated
- [x] Add window cleaning upsell feature to onboarding + customer-facing QuoteDemo page
- [x] Upgrade to smart cascade upsell (house wash → windows → gutters) in QuoteDemo
- [x] Build full tenant admin dashboard (6 tabs + Leads/CRM)
- [x] Fix Followup tab JSX expression bug

### COMPLETED — Phase 2 (Backend & Database)
- [x] Add Supabase database for tenant storage (replaces localStorage)
- [x] Build db.js abstraction layer (Supabase + localStorage fallback)
- [x] Tenant CRUD: create, read by email, update config
- [x] Leads CRUD: create (with credit deduction), read, update status
- [x] Connect mybidquick-engine (quoting engine) to pull tenant configs from database
- [x] Real authentication for admin dashboard (Supabase Auth — email + password)

### COMPLETED — Phase 3 (Monetization / Stripe Billing)
- [x] Stripe per-lead credit billing (Checkout + Customer Portal + webhook)
- [x] 4 Vercel serverless API routes (create-checkout, create-portal, billing-status, webhook)
- [x] Billing tab in tenant dashboard (credits banner, pack cards, purchase history)
- [x] Credit deduction on lead creation (1 credit per quote submission)
- [x] Supabase billing schema (lead_charges + credit_purchases tables)
- [x] Configure Stripe webhook endpoint URL in Stripe Dashboard (https://www.mybidquick.com/api/webhook)
- [x] Add STRIPE_WEBHOOK_SECRET env var to Vercel for signature verification
- [x] Usage analytics / reporting for tenants (Analytics tab in TenantDashboard — quotes, revenue, conversion rate, lead sources, top services, time range filters, performance summary, follow-up opportunities)
- [x] RLS hardening — 12 scoped policies replacing open "Allow public *" on all 4 tables (2026-04-06)
- [x] Google Calendar integration for tenants — OAuth connect/disconnect, auto-create events from leads (2026-04-07)
- [x] Quote confirmation emails — branded HTML email sent to customers after quote submission via Resend (2026-04-08)
- [x] Multi-story upcharge controls in tenant dashboard (2-story/3-story multipliers)
- [x] Minimum charge floors per service in tenant dashboard
- [x] Scheduled status in CRM pipeline (5th stage between Contacted and Won)

### SOFT LAUNCH FIXES (from QA audit — March 27, 2026)
See SOFT-LAUNCH-ISSUES.md for full details (15 issues, severity-ranked).

**Critical (must fix before soft launch):**
- [x] Fix success page navigation: `/admin` → `/dashboard` (Onboarding.jsx)
- [x] Pack onboarding services/upsell data into config JSONB before createTenant()
- [x] Add duplicate slug check before tenant creation (appends -2, -3, etc.)
- [x] Add `/onboarding` route alias (both /signup and /onboarding now work)
- [x] Save secondaryColor to Supabase (secondary_color column + tenantToRow mapping)
- [x] Transform onboarding service format to match dashboard format (basePrice, perSqFt, perWindow, perLinFt, extras)
- [x] Upload logos to Supabase Storage (`tenant-assets` bucket) with base64 fallback

**Medium:**
- [x] Add email format validation in onboarding (regex check + red border feedback)
- [x] Deploy billing API endpoints to Vercel (4 endpoints: billing-status, create-checkout, create-portal, webhook)

### PHASE 3.5 — Lead Pipeline CRM (Started March 28, 2026)
**Goal**: Track every lead coming through MyBidQuick in a simple 4-stage pipeline, with AI-powered follow-up emails and a visual Kanban board.

**Pipeline Stages**: New → Contacted → Scheduled → Won → Lost (Supabase check constraint updated)

**Tracking Fields**: Lead #, Date, Name, Email, Phone, Tenant, Service Requested, Quote $, Status, Last Contact, Notes, Follow-ups Sent

**Google Sheet**: MyBidQuick — Lead Pipeline CRM (ID: 15hinMbA5OhRk2WFrKgPf0Dd9GPk5tYPDyfLNvIvuXkc) — created 2026-03-31

**Phase 1 (Manual) — DONE**:
- [x] Build lead pipeline tracker spreadsheet with formulas + color-coded statuses
- [x] Created Google Sheet CRM with all Supabase leads synced (2026-03-31)

**Phase 2 (AI Agent) — DONE**:
- [x] Supabase DB migration: updated leads status check constraint (pending → new/contacted/won/lost)
- [x] Migrated all existing 'pending' leads to 'new' status
- [x] Added follow_ups_sent (int array) and last_follow_up_at columns to leads table
- [x] Scheduled task `mybidquick-lead-followup` — runs daily at 8am, checks for leads needing Day 1/3/7 follow-ups
- [x] Follow-up emails created as Gmail DRAFTS (not auto-sent) so Tim can review before sending
- [ ] Google Sheets auto-sync (blocked by MCP write permissions — manual sync for now)
- [x] Weekly pipeline summary email to tenant owners — api/weekly-pipeline-email.js + scheduled task every Monday 8am ET (2026-04-05)

**Phase 3 (Full CRM) — DONE**:
- [x] In-app Kanban board in TenantDashboard.jsx — 4 columns with drag-and-drop (2026-03-31)
- [x] Board view + List view toggle
- [x] Quick-move buttons on expanded lead cards (move to any stage with one click)
- [x] Stats row showing count per stage + total won revenue
- [x] Automated follow-up email system — `follow_up_logs` table in Supabase, tenants configure steps in Follow-Up tab, Vercel cron sends branded emails per tenant config (2026-04-08)
- [ ] Invoicing integration (generate + send invoices for Won leads)
- [x] Marketing source tracking (lead source field + analytics tab breakdown)

### PHASE 4 — Growth Features
- [x] Port cascade upsell flow from QuoteDemo to mybidquick-engine (with tenant discount config)
- [x] Email notifications for new signups (Web3Forms → Tim's email on every signup)
- [x] Tenant self-serve dashboard (companies edit their own settings) — logo upload, color pickers, business name editing in Settings tab (2026-04-02)
- [x] Analytics for tenants (how many quotes, conversion rates) — shipped via Analytics tab in TenantDashboard
- [x] QR code generator per tenant — links to their quoting page, downloadable PNG/SVG for yard signs, flyers, door hangers, truck wraps
- [ ] Referral program
- [x] Blog / SEO content on mybidquick.com (10 SEO-optimized articles incl. 3 competitor comparisons, sitemap.xml with 14 URLs, robots.txt, meta tags, Open Graph, structured data)
- [x] SEO audit + www/non-www URL consistency fix (robots.txt, sitemap.xml, index.html canonical/og:url all using www.mybidquick.com)
- [x] Google Search Console: www.mybidquick.com property created, verification meta tag in index.html (`uVz2LLgmtmrxIhr1PeowRq9TlUksp-kxqfaG8Ekxxow`), sitemap submitted (2026-03-30)
- [x] Logo integration: Real MyBidQuick logo SVG replacing all "BQ" placeholder divs across all 5 page components + `public/mybidquick-logo.svg` for Vite serving (2026-03-30)
- [x] Google Business Profile: registered and verified as software company (2026-04-03)
- [x] Submit to software directories — G2 profile completed (2026-04-05, 4/4 steps, awaiting review 3-5 days). Capterra/GetApp/SoftwareAdvice submitted via Gartner Digital Markets (2026-04-05, request ID 0a8c9922, awaiting review 1-2 days). SourceForge N/A (open-source only).
- [x] Competitor comparison landing pages — 3 blog posts: mybidquick-vs-jobber, mybidquick-vs-housecall-pro, mybidquick-vs-responsibid (2026-04-05)
- [ ] Industry-specific landing pages (pressure washing, window cleaning, etc.)

### PHASE 5 — Exterior Cleaning Expansion (NEW — March 2026)
**Market**: Exterior building cleaning is a $12.5B market (2024) growing to $20.3B by 2033. U.S. pressure washing alone = $1.2B. 34,000+ pressure washing businesses in US, most using generic tools.

**Competitors**: ResponsiBid ($829 setup + $229/mo), QuoteIQ ($249/mo), Jobber ($69-349/mo). MyBidQuick is 10x cheaper with per-lead pricing.

#### Product Roadmap
- [ ] Add pressure washing as default service (sq ft pricing)
- [ ] Add soft washing as a service option
- [ ] Add fence cleaning as a service option
- [ ] Add surface material type modifier (vinyl, brick, stucco, wood — different multipliers)
- [ ] Add roof pitch/slope estimator for roof cleaning
- [ ] Add story count surcharge (2nd story = 1.3x, 3rd = 1.6x)
- [ ] Add condition modifier (light/moderate/heavy)
- [ ] Add "What type of cleaning company?" to onboarding Step 1
- [ ] Auto-populate services based on company type
- [ ] Expand cascade upsells: pressure wash → sealing, house wash → soffit/fascia
- [ ] Commercial quoting support (larger properties)
- [ ] Seasonal pricing (peak-season surcharges)

#### Go-To-Market Strategy
- **Facebook Groups**: Join pressure washing biz groups (50K+ combined members), share value-first content
- **Before/After Content**: TikTok, Instagram Reels, YouTube Shorts — 3-5x engagement
- **Google Ads**: Target "pressure washing estimate software" keywords ($500-1K/month)
- **YouTube Tutorials**: "How to Price Pressure Washing Jobs" educational content → funnel to MBQ
- **Partnerships**: Equipment suppliers, training programs, affiliate program for tenants
- **SEO/Blog**: Target 10-15 pressure washing pricing keywords in 6 months

#### Full Research
See Notion: [Exterior Cleaning Expansion — Product & Marketing Research](https://www.notion.so/330006ff1159818e8de5ce87a82c00a4)

## Subdomain Routing & Tenant Public Pages
**Wildcard subdomain routing is LIVE** as of 2026-03-31.

### Platform (mybidquick Vercel project)
- `www.mybidquick.com` / `mybidquick.com` → main platform (landing, login, dashboard)
- Also: `mybidquick.io`, `mybidquick.org` + www variants
- Fallback route: `/q/:slug` for tenant public pages

### Engine (cleanbid Vercel project)
- `*.mybidquick.com` → wildcard routes to quoting engine (configured 2026-03-31)
- `cloute-cleaning.mybidquick.com` → Cloute Exterior Cleaning quoting page (Tim Sullivan)
- `cornerstone-wash-and-window-cleaning.mybidquick.com` → Cornerstone Wash & Window Cleaning (Noah Baldry)
- `county-wide-power-wash-and-restorations.mybidquick.com` → County Wide Power Wash (Steven)
- `cleanbid.vercel.app` → legacy fallback (still works)
- Specific domains (`www.mybidquick.com`, etc.) take priority over wildcard on Vercel

### How It Works
- Engine's `extractSubdomainSlug()` in `tenants/index.js` detects the subdomain
- `resolveSlug()` orchestrates: query param → subdomain → hostname map → fuzzy → default
- `fetchTenantBySlug()` loads config from Supabase
- `configAdapter.js` transforms Supabase row to engine format

## Blog / SEO
BlogPost.jsx contains 10 SEO-optimized articles with structured data (JSON-LD), Open Graph meta tags, and a blog index page:
- "How to Price Exterior Cleaning Services"
- "Why Every Cleaning Company Needs an Instant Quote Tool"
- "The Complete Guide to Upselling Cleaning Services"
- "Get More Pressure Washing Customers"
- "Best Quoting Software for Cleaning Companies"
- "Upsell Cleaning Services"
- "Pressure Washing Marketing Ideas"
- "MyBidQuick vs Jobber" (competitor comparison, 2026-04-05)
- "MyBidQuick vs Housecall Pro" (competitor comparison, 2026-04-05)
- "MyBidQuick vs ResponsiBid" (competitor comparison, 2026-04-05)
Also includes `robots.txt` and `sitemap.xml` in `/public/`.

## Welcome Email Sequence (5 emails, created 2026-04-05)
Gmail drafts for new tenant onboarding. Use with automation or send manually:
1. **Day 0** — Welcome + 3 free credits + quote page URL
2. **Day 1** — Setup nudge (logo, colors, embed widget)
3. **Day 3** — First lead tips (respond fast, use CRM)
4. **Day 5** — Credit pack intro (pricing, LAUNCH20 discount)
5. **Day 7** — Growth tips (QR codes, embed, share link)
All signed from tim@mybidquick.com. Templates in Gmail drafts (tim-clouteinc account).

## mybidquick-engine (formerly Cleanbid) — Full Details

### Links & Deployment
- **GitHub**: github.com/sppartyof7-ship-it/Cleanbid
- **Live URL**: `*.mybidquick.com` (wildcard subdomain routing) — e.g., `cloute-cleaning.mybidquick.com`
- **Legacy URL**: cleanbid.vercel.app (still works as fallback)
- **Vercel Team**: team_USo8JZXOzfnS4VWoiz03PBW2
- **Vercel Project ID**: prj_zauduwCgyCqVTCu93aVFljRg3ahD
- **Google Cloud Project**: CleanBid (project ID: cleanbid-490313)
- **Google Maps API Key**: AIzaSyAnLy1iRt0_fkMJqyBxrC0meEJD0qpshvU (in CleanBid GCP project)
- **APIs Enabled**: Maps Static API, Places API, Street View Static API

### Hash Routes
| Route | What It Does |
|-------|-------------|
| `#quote` | Customer quoting flow (main entry point for embeds) |
| `#admin` | Admin panel (password: via VITE_ADMIN_PASSWORD env var — see Vercel) |
| `#leads` | Leads management panel |
| *(empty hash)* | Tenant landing page (TenantLandingPage component) |

### Tenant Routing
- Slug resolved via `resolveSlug()` from tenants module
- `cloute-cleaning.mybidquick.com#quote` → Cloute Cleaning quote flow
- `cornerstone.mybidquick.com#quote` → Cornerstone quote flow
- **Wildcard subdomain routing LIVE** (`*.mybidquick.com` on Vercel cleanbid project, configured 2026-03-31)
- Legacy path routing (`cleanbid.vercel.app/slug#quote`) still works as fallback
- **Dynamic Supabase loading**: Engine fetches tenant config from Supabase via `fetchTenantBySlug()`. Any company that signs up on mybidquick.com automatically gets their own engine page — no code change needed. Hardcoded tenant files (cloute.js, cornerstone.js) still work as a backwards-compatible fallback.
- `configAdapter.js` bridges the gap: mybidquick stores simple JSONB configs; the engine needs a rich pricing structure. The adapter calls `buildDefaultConfig()` then overlays the tenant's custom values.

### Key Files (Engine)
```
Cleanbid/
├── src/
│   ├── App.jsx               # Router with hash routes + slug detection
│   ├── main.jsx              # Entry point
│   ├── index.css             # Styles
│   ├── config/
│   │   ├── defaults.js       # DEFAULT pricing + all service configs (350 lines)
│   │   ├── colors.js         # Color constants (C.primary, C.accent, etc.)
│   │   └── styles.js         # Style utilities
│   ├── components/
│   │   ├── CustomerFlow.jsx  # Main step-by-step quote flow (cascade upsell)
│   │   ├── AddressAutocomplete.jsx  # Google Places address autocomplete
│   │   ├── PhotoUploader.jsx        # Property photo upload
│   │   ├── PriceBreakdown.jsx       # Pricing display + satellite map image
│   │   ├── CountdownTimer.jsx       # Urgency timer
│   │   ├── TrustGallery.jsx         # Before/after gallery
│   │   ├── AdminPanel.jsx           # Admin view
│   │   ├── LeadsPanel.jsx           # Leads CRM
│   │   ├── TenantLandingPage.jsx    # Default landing page
│   │   └── Badge.jsx, TabBar.jsx, Toggle.jsx  # UI components
│   ├── tenants/
│   │   ├── index.js           # Tenant resolver
│   │   ├── cloute.js          # Cloute Cleaning config
│   │   └── cornerstone.js     # Cornerstone Exterior config
│   ├── lib/
│   │   ├── supabase.js        # Supabase client — fetchTenantBySlug, fetchTenantByEmail, isSupabaseConnected
│   │   └── configAdapter.js   # Adapts Supabase JSONB config → engine's rich pricing format (generates full color palette, service tiers, etc.)
│   └── utils/                 # Utility functions
├── api/                       # Housecall Pro CRM integration
└── public/                    # Static assets (gallery images, etc.)
```

### Current Service Pricing (defaults.js — verified 2026-04-03)
| Service | Base Price | Rate | Unit | Notes |
|---------|-----------|------|------|-------|
| House Washing | $125 | $0.15/sq ft | sq ft | Tiered: 100% up to 2k sqft, 67% 2-3k, 47% 3k+ |
| Window Cleaning | $0 base | Per window (by type & package) | per window | $8/glass door |
| Deck Cleaning | $75 | $0.40/sq ft | sq ft | maxTier: premium (no Platinum) |
| Concrete Cleaning | $75 | $0.20/sq ft | sq ft | maxTier: premium (no Platinum) |
| Roof Cleaning | $150 | $0.10/sq ft | sq ft | |
| Gutter Cleaning | $50 | $0.85/lin ft | linear ft | maxTier: premium (no Platinum) |
| Gutter Guard Install | $0 base | $10.99-20.99/lin ft (by tier) | linear ft | |

### Window Cleaning Pricing (per window, by package)
| Window Type | Standard | Premium | Platinum |
|-------------|----------|---------|----------|
| Casement | $5.50 | $12 | $18 |
| Double Hung | $8 | $16 | $24 |
| Combo/Storm | $14 | $28 | $38 |

### Gutter Guard Tiers
| Tier | Per Lin Ft | Description |
|------|-----------|-------------|
| Basic Install | $10.99 | Guard installation only |
| Install + Cleaning | $15.99 | Includes full gutter cleaning before install |
| Full Service | $20.99 | Gutter cleaning, guard install & downspout work |

### Package Multipliers
- **Standard** (1.0x) — "Quality service at a great price"
- **Premium** (1.25x) — "Our most popular choice" — 7-day spot re-treatment guarantee
- **Platinum** (1.55x) — "The ultimate clean" — 60-day satisfaction guarantee

### Per-Service Package Selection (added 2026-04-03)
Customers pick Standard/Premium/Platinum **independently for each service**. Each service card has its own tier picker with bold description card showing what's included. Some services cap at Premium (deck, concrete, gutter cleaning). `servicePackages` state object maps service IDs → tier names. `totalPrice()` computes mixed-tier totals.

### IMPORTANT: Pricing Visibility Rule
**NEVER show pricing formulas, per-sqft rates, multipliers, or equations to customers.** Customers only see the final dollar amount on the quote review screen. Tim has stated this multiple times — treat it as a hard rule.

### Smart Cascade Upsell (Engine)
- Trigger: House Washing selected
- Upsell 1: Window Cleaning (15% discount)
- Upsell 2: Gutter Cleaning (15% discount)
- Bundle discounts: 2 services = 10% off, 3 = 15%, 4 = 20%, 5 = 25%

### Tenant Config Structure (in tenant JS files)
Each tenant file exports: id, businessName, tagline, phone, email, adminPassword, web3formsKey, googlePlacesApiKey, housecallProEnabled, colors (bg, primary, primaryLight, accent, text, textMid, textLight, card, border), logoLetter, logoImage, leadSources[], gallery, marketing config, disabledServices[]

### Active Tenants (Supabase — 3 rows as of April 10, 2026)
| Tenant | Slug | HCP Integration | Notes |
|--------|------|-----------------|-------|
| Cloute Exterior Cleaning | cloute-cleaning | Yes | Tim's company (managing partner). Test tenant. 82+ credits. Only one with Stripe customer. |
| Cornerstone Wash and Window Cleaning | cornerstone-wash-and-window-cleaning | No | Noah Baldry. Coaching client — credits manually seeded. |
| County Wide Power Wash and Restorations | county-wide-power-wash-and-restorations | No | Steven. Coaching client — credits manually seeded. |

**Note**: Old orphaned "Cornerstone Exterior" record (auth_user_id: null, slug: cornerstone-exterior) should be soft-deleted. Non-Cloute tenants are coaching clients getting free leads — don't flag credit balances as anomalies.

### Embed Snippet (for tenant websites)
File: `embed-snippet.html` in mybidquick repo root. Three integration options:
1. Full-page iframe: `<iframe src="https://SLUG.mybidquick.com#quote">`
2. Floating button + slide-up modal (JS + CSS included)
3. Simple CTA link button
MyBidQuick gradient: 135deg, #3b9cff → #6dd19e

## Session Log
| Date | What We Did |
|------|------------|
| 2026-03-25 | Built entire MVP: landing page, onboarding wizard, admin dashboard. Pushed to GitHub. Deployed to Vercel. Purchased & connected mybidquick.com, .io, .org domains. |
| 2026-03-26 | Added window cleaning upsell feature (onboarding config + QuoteDemo page). Upgraded to smart cascade upsell (house wash → windows → gutters). Built full tenant admin dashboard — 6 tabs (Pricing, Services, Bundles, Marketing, Followup, Settings) + Leads/CRM panel. Fixed Followup tab JSX bug. |
| 2026-03-26 | Connected Supabase database (tenant storage, leads). Migrated Onboarding + AdminDashboard from localStorage to Supabase (with fallback). Switched tenant URL pattern to subdomain-style (slug.mybidquick.com). Built full Stripe per-lead billing integration: 4 serverless API routes, Billing tab in tenant dashboard, credit deduction on lead creation. Added billing schema to Supabase (lead_charges, credit_purchases tables). Tested end-to-end: Billing tab shows 3 free credits, Buy Leads buttons redirect to Stripe Checkout. |
| 2026-03-27 | Created MyBidQuick logo (lightning bolt + speed lines, navy/orange palette) in SVG + PNG. Also generated via ChatGPT/DALL-E for high-quality AI version. Researched exterior cleaning market expansion: $12.5B market, 34K+ pressure washing businesses. Built full product roadmap (Phase 5) and go-to-market strategy. Added comprehensive research page to Notion brain. Updated PROJECT-BRAIN.md with Phase 5 expansion plan. |
| 2026-03-29 | **LAUNCH NIGHT.** Created "Electric Velocity" teaser graphics (square 1080 + FB ad 1200x628) using canvas-design skill. Wrote full marketing copy for Facebook groups, Instagram, TikTok, and 3 Facebook Ad versions (A/B/C testing). Launch promo: "25 FREE lead credits for first 50 companies" — updated Supabase default from 3→25 credits. Created Canva graphics (4 teaser + 4 hype + 4 FB ad options). All assets + copy saved to `marketing-teaser-tonight.md`. Launch plan page added to Notion brain. |
| 2026-03-27 | Brand consolidation: everything is now under **MyBidQuick**. Removed all ClouteBid/Cleanbid branding from PROJECT-BRAIN.md. Quoting engine repo rebranded as "mybidquick-engine" (code-level rename still pending). |
| 2026-03-27 | **Supabase Auth**: Real authentication replacing admin123. Onboarding creates auth user (email+password), Login.jsx page with forgot password, TenantDashboard auto-detects session, auth_user_id column + RLS policies on tenants table. **Engine upsell discount**: wired tenant's `upsell.discountPercent` into CustomerFlow.jsx — shows "Save X%!" badges, applies discount to upselled service pricing. |
| 2026-03-27 | **Soft launch QA audit**: Full code walkthrough identified 15 issues across 4 severity levels (3 critical, 4 high, 5 medium, 3 low). Created SOFT-LAUNCH-ISSUES.md with fixes and readiness assessment. Verdict: not ready for self-serve launch, but White-Glove path viable. Created MyBidQuick-Onboarding-SOP.docx for manual tenant onboarding. Added `/onboarding` route alias in App.jsx. |
| 2026-03-28 | **Engine deploy**: Pushed tiered pricing defaults.js + CustomerFlow.jsx (smart cascade upsell with tenant config) to mybidquick-engine. Fixed base64 injection corruption on line 473. Both Vercel deploys GREEN. **Soft launch audit**: Verified all 5 critical QA fixes already shipped — success nav, config JSONB packing, duplicate slug check, secondaryColor column, service format transform. Also confirmed email validation already added. Updated PROJECT-BRAIN.md checklist. |
| 2026-03-28 | **Code symbol cleanup + full file push**: Fixed corrupted non-ASCII characters (emojis, special chars) across 10 files pushed via browser-based GitHub workflow: BlogPost.jsx, Login.jsx, TenantPublicPage.jsx, Onboarding.jsx, QuoteDemo.jsx, TenantDashboard.jsx, AdminDashboard.jsx, App.jsx, billing.js, db.js. Fixed 3 Vercel build errors: (1) QuoteDemo.jsx line 214 — literal `->` in JSX parsed as closing tag, escaped to `{'->'}`. (2) TenantDashboard.jsx line 1844 — base64 chunk boundary corruption lost `12 }}>` and newline, restored directly in GitHub editor. (3) QuoteDemo.jsx line 320 — two more `->` literals in bundle price arrows, escaped to `{'→'}`. **Vercel build GREEN** — mybidquick production deployed successfully. Also started Lead Pipeline CRM Phase 1 — built MyBidQuick-Lead-Pipeline.xlsx spreadsheet with 4-stage pipeline (New Lead → Contacted → Won → Lost). |
| 2026-03-28 | **Soft-launch marketing blitz**: Created community-launch-posts.md with ready-to-post copy for 6 channels (Product Hunt, Reddit r/pressurewashing, r/SaaS, r/EntrepreneurRideAlong, Indie Hackers, Facebook groups). Created marketing-teaser-tonight.md with full "First 50 FREE" hype drop campaign — Facebook group post, Instagram caption + hashtags, TikTok script (30-45 sec), 3 Facebook ad copy versions (A/B/C), 4 Canva graphic options per format, and a 7-step posting game plan for the evening. Staged cleanbid-upsell-patch/ with refactored CustomerFlow.jsx + extracted pricing.js utility for mybidquick-engine. |
| 2026-03-28 | **Soft launch marketing campaign**: Built full launch content kit targeting exterior cleaning / pressure washing companies. `community-launch-posts.md` — ready-to-post copy for Product Hunt, Reddit (r/pressurewashing, r/SaaS, r/EntrepreneurRideAlong), and Indie Hackers. `marketing-teaser-tonight.md` — tonight's campaign with "First 50 FREE" hype posts for Facebook groups, Instagram, and TikTok; 8 Canva graphic options (pain-point and hype-drop styles); Facebook ad copy in 3 A/B/C versions; full posting game plan (7–8:30 PM). Positioning: pain-point hook ("Stop Losing Jobs to Slow Quotes"), per-lead pricing vs. ResponsiBid/Jobber, 35% avg ticket lift from cascade upsell. |
| 2026-03-28 | **Tenant embed snippet**: Created `embed-snippet.html` — a drop-in HTML file tenants can share with their web designers (or paste into WordPress/Wix/Squarespace themselves). Offers 3 integration options: (1) full-page iframe for a dedicated "Get a Quote" page, (2) floating "Get Instant Quote" button + slide-up modal, (3) simple CTA link. Now points to `SLUG.mybidquick.com` subdomain URLs. |
| 2026-03-29 | **Engine pricing update**: Updated all service pricing in defaults.js to competitive national market rates — House Washing $125+$0.12/sqft (was $150+$0.15), Deck $100 base (was $175), Concrete $100+$0.15/sqft (was $125+$0.12), Gutter Cleaning $75 base (was $125), Window cleaning per-window prices lowered across all 3 types and all 3 tiers, Gutter Guard tiers reduced by $2/linft each. Roof cleaning unchanged ($250+$0.18/sqft). Pushed to GitHub, Vercel deployed. |
| 2026-03-29 | **Google Maps Static API**: Enabled Maps Static API in Google Cloud Console for CleanBid project (cleanbid-490313). Fixed API key mismatch — code had wrong key. Swapped to correct CleanBid project key (AIzaSyAnLy1iRt0_fkMJqyBxrC0meEJD0qpshvU) across all 3 files: defaults.js, cloute.js, cornerstone.js. Pushed all 3 commits to GitHub. Verified satellite map images now load successfully via the API. |
| 2026-03-29 | **LAUNCH20 promo + onboarding upgrades**: Built LAUNCH20 discount code system — first 20 customers get $1/lead for life. Discount code field in onboarding Step 1, `getLaunchCustomerCount()` in db.js checks cap, stores `is_launch_customer` flag in Supabase. **Logo upload**: `uploadLogo()` in db.js now uploads logos to Supabase Storage (`tenant-assets` bucket) with base64 fallback. **Signup notifications**: `notifyNewSignup()` sends Tim an email via Web3Forms on every new tenant signup with full details. **New assets**: quote-preview.html (mobile mockup of quote results), mybidquick-ops-eval-v2.html (updated ops eval viewer), design-philosophy.md ("Electric Velocity" brand guide), MyBidQuick-Marketing-Playbook.docx, mybidquick-ops.skill. |
| 2026-03-30 | **SEO audit + fixes**: Ran full SEO audit — discovered mybidquick.com has ZERO pages indexed in Google. Created comprehensive SEO audit report (seo-audit-march2026.html) with keyword opportunities, competitor comparison (ResponsiBid, QuoteIQ), and 12-item prioritized action plan. Fixed critical www vs non-www URL mismatch across 3 files: (1) robots.txt — sitemap URL updated to www (SHA: 4f51c8c). (2) sitemap.xml — all 6 URLs updated to www + lastmod dates refreshed (SHA: 77dfd07). (3) index.html — canonical tag and og:url fixed to www (SHA: b98bcb4). Also fixed Onboarding.jsx stray 'h' character on line 1 causing Vite build failure (SHA: 1cdb7c3). All 4 commits deployed to Vercel successfully. **Pending manual steps**: Tim needs to verify domain in Google Search Console, submit sitemap, create Google Business Profile, and submit to software directories (Capterra, G2, GetApp, etc.). |
| 2026-03-30 | **Analytics tab in TenantDashboard**: Added full Analytics tab (commit 7c5da1a) — 4 KPI cards (Total Quotes, Conversion Rate, Avg Ticket, Total Revenue with week-over-week trend), bar chart for quote volume by month (last 6 months), revenue by month chart, lead source breakdown with color-coded % bars, top services by popularity, revenue by service breakdown. All computed client-side from leads data. Empty state shown when no leads yet. Also added QR code feature to roadmap TODO. **Vercel build fix** (commit 4eedaf2): Added missing tracked files that were causing Vercel build to fail — supabase.js, billing.js, and related files were not in git. Also brought in final versions of BlogPost.jsx, Login.jsx, TenantPublicPage.jsx, Onboarding.jsx, robots.txt, sitemap.xml. Build GREEN on Vercel. |
| 2026-03-30 | **Logo integration across entire site**: Replaced ALL "BQ" placeholder divs with actual `<img src="/mybidquick-logo.svg">` tags across 5 JSX files: LandingPage.jsx (nav + footer), Login.jsx (nav + card header), Onboarding.jsx (nav), AdminDashboard.jsx (auth screen + sidebar), TenantDashboard.jsx (page header). Added `mybidquick-logo.svg` to `public/` folder (commit 63ff1ba) for Vite static serving. Footer/sidebar logos use CSS `filter: 'brightness(0) invert(1)'` for white-on-dark rendering. All 6 commits pushed via browser-based GitHub workflow, Vercel auto-deployed. Logo verified live on www.mybidquick.com — nav and footer rendering correctly. Also emailed complete Cloute Cleaning login/page reference to tim.sullivan@clouteinc.com with all URLs for customer pages, engine admin, platform login, and super admin. |

| 2026-03-31 | **Wildcard subdomain routing + QR codes + billing APIs**: (1) Built 4 Stripe billing API endpoints (billing-status.js, create-checkout.js, create-portal.js, webhook.js) and pushed to GitHub. (2) Added QR Code Generator to Marketing tab in TenantDashboard — generates QR codes for 4 source types (yard sign, flyer, truck wrap, business card) with UTM tracking, download as PNG/SVG. (3) Configured wildcard subdomain routing: moved `*.mybidquick.com` from mybidquick (platform) → cleanbid (engine) Vercel project. Every tenant now gets `SLUG.mybidquick.com`. Tested `cloute-cleaning.mybidquick.com` — loads perfectly. (4) Updated all URLs across codebase: TenantDashboard.jsx QR URLs, TenantPublicPage.jsx engine link, embed-snippet.html (now pushed to repo). (5) Updated PROJECT-BRAIN.md and Notion brain with new URL scheme. |
| 2026-03-31 | **Repo cleanup for scale**: Full audit + cleanup of both local and GitHub repo. **Deleted**: Nested Cleanbid/ engine copy (139MB), cleanbid-upsell-patch/ (old applied patches), src/App.css (empty), src/assets/ boilerplate (react.svg, vite.svg, hero.png), unused icons (mybidquick-icon.svg/png), root logo dupes (kept public/ copies), garbage files (ziFAvEMC, lock files, AI prompt files). **Organized**: Moved 12 marketing/business docs (xlsx, docx, md, png, html) into `docs/` folder. **Code cleanup**: Removed dead `import './App.css'` from App.jsx. Updated .gitignore with .env, lock file, and OS file patterns. All changes pushed to GitHub — 6 commits, all Vercel builds GREEN. Repo root went from 35+ items to 13 clean items. |
| 2026-03-31 | **Duplicate webhook cleanup + CRM Phase 3.5**: (1) Confirmed Stripe Dashboard points to `/api/webhook` — deleted duplicate `api/stripe-webhook.js`. (2) **Kanban Board**: Replaced flat lead list with full drag-and-drop Kanban board in TenantDashboard.jsx — 4 columns (New/Contacted/Won/Lost), board+list view toggle, quick-move buttons, stats per stage. (3) **DB Migration**: Updated Supabase `leads` table — changed status check constraint from (pending/won/lost) to (new/contacted/won/lost), migrated 2 existing 'pending' leads to 'new', added `follow_ups_sent` (int array) and `last_follow_up_at` columns. (4) **Auto Follow-Up System**: Created scheduled task `mybidquick-lead-followup` — runs daily at 8am, queries Supabase for leads needing Day 1/3/7 follow-ups, creates Gmail DRAFTS for Tim to review before sending. (5) Created Google Sheet "MyBidQuick — Lead Pipeline CRM" (Sheets write blocked by MCP permissions — manual sync for now). Updated db.js default status from 'pending' to 'new'. |
| 2026-04-01 | **Follow-up sequence hidden from customers**: Removed the `{config.followUp.enabled && (...)}` block from post-quote confirmation screen (step 4) in mybidquick-engine CustomerFlow.jsx — customers were seeing internal automation details (email immediate, SMS at 2 days). Commit `c943680`, deployed and live on Vercel. **Git CLI fully configured**: GitHub PAT with repo+workflow scope stored at `.github-token`. All future code changes go through `git commit + git push` — retired browser-based CM6 editor workflow. **GitHub Actions CI**: Added `.github/workflows/ci.yml` — runs `npm run build` on every push to main, catches bad builds before Vercel deploys. Commit `782a085`. |
| 2026-04-01 | **Stripe checkout URL fix + billing toast**: Fixed `create-checkout.js` success/cancel URLs — removed `/#/` hash prefix for BrowserRouter compatibility (was redirecting to wrong page after Stripe payment). Added billing toast notifications to TenantDashboard — on return from Stripe Checkout, shows green "Payment received! X credits will be added shortly" toast on success, or blue "Checkout was cancelled" toast on cancel. Auto-dismisses after 8/5 seconds. Auto-switches to Billing tab. **Email corrections**: Updated all SQL seeds and docs from `tim@clouteinc.com` to `tim.sullivan@clouteinc.com` (AdminDashboard demo data, schema.sql, add-slug.sql, billing-schema.sql, SOFT-LAUNCH-ISSUES.md). Commit `08738e5`. |
| 2026-04-01 | **Admin security + landing page overhaul + 4 new blog posts**: (1) **Removed admin123 fallback** — AdminDashboard now requires `VITE_ADMIN_PASSWORD` env var, no more hardcoded password in source code (commit `04e876e`). (2) **Conversion optimization** on LandingPage.jsx — pain-focused hero ("Stop losing leads to slow quotes"), dual CTA ("Start Free" + "See Live Demo"), before/after comparison section, trust signals (30-day guarantee badge, 4.9/5 rating, setup time callouts), expanded to 6 testimonials with result metrics (commit `bbfb898`). (3) **Admin login UX fixes** — clear error messages for wrong password and missing env var; replaced "Satellite Property View" with "Smart Address Lookup" on landing page since satellite isn't deployed yet (commit `0c1d3d8`). (4) **Admin tab crash fix** — TenantDashboard hardcoded basic/standard/premium package names but Supabase uses standard/premium/platinum; now uses Object.keys() + optional chaining to handle both formats (commit `f638c4d`). (5) **4 new SEO blog posts** added to BlogPost.jsx targeting cleaning company owner keywords: "Get More Pressure Washing Customers", "Best Quoting Software for Cleaning Companies", "Upsell Cleaning Services", "Pressure Washing Marketing Ideas" (commit `3bb8ce3`). (6) **Sitemap updated** to include all 7 blog posts + blog index page — now 13 URLs total (commit `1078013`). |
| 2026-04-02 | **Window cleaning tier descriptions**: Updated tierFeatures in mybidquick-engine defaults.js — Standard: "Exterior windows only — outsides cleaned & streak-free", Premium: "Interior & exterior — both sides of every window cleaned", Platinum: "Detailed interior & exterior — windows + tracks, sills, screens & frames". **Tier description cards**: Added colored description box per service showing what each tier includes. **Lead details in dashboard**: Updated `rowToLead()` in db.js to pass through ALL 20+ Supabase fields (address, project type, service details, package prices, extras, bundle, photos, notes). Added SERVICE_NAMES map for friendly display names (pressure_washing → "House Washing"). Both pipeline and list views now show full lead details on expand. **Tenant self-serve branding**: New Settings tab features — tenants can now upload their logo (Supabase Storage with base64 fallback), pick primary/secondary colors with live preview, and edit business name. New `updateTenantProfile()` function in db.js for row-level column updates (commit `9803fd6`). |
| 2026-04-03 | **Per-service package selection SHIPPED**: Replaced global package selector with per-service tier pickers in mybidquick-engine CustomerFlow.jsx. Each service card now has its own Standard/Premium/Platinum buttons. Customers can mix tiers (e.g., Platinum house wash + Standard windows). `servicePackages` state object maps service IDs to tier names. `totalPrice()` computes mixed-tier totals. Services with `maxTier: "premium"` (deck, concrete, gutter) don't show Platinum. **Tier description styling**: Made descriptions bold (14px, 700 weight) inside colored card with "{TIER} — What's Included:" label. Removed old redundant global tier description box. **Notion brain updated**: Corrected all pricing tables to match actual defaults.js (were out of date), added per-service package docs, pricing visibility rule, and session log entries. Engine commits: f4ec533, 40bcbf5. |
| 2026-04-04 | **Bug fixes + UX improvements + video toggle**: (1) **Window Cleaning $0 bug FIXED** — added sqft fallback in pricing logic; if window cleaning's details don't have sqft yet (useEffect sync race condition), it falls back to house washing sqft. (2) **National averages comparison bars FIXED** — were showing base price without package multiplier; now show package-adjusted price matching what customer sees. (3) **Owner intro video toggle** — added `showOwnerVideo` boolean to config (defaults.js, cloute.js, configAdapter.js); AdminPanel.jsx has toggle switch next to video URL field; CustomerFlow.jsx checks both toggle AND URL before rendering. Tenants can save URL and toggle on/off without losing it. (4) **Scroll-to-top on step navigation** — Next/Back buttons now smooth-scroll to top instead of leaving page at bottom. (5) **Customer notes field** — added "Questions or Notes" textarea on quote review page (step 3) between "What Happens Next" and trust signals. Notes already wired into lead submission data. (6) **Street View Static API** enabled in GCP (from prior session). (7) **Canva Facebook post graphic** created with Cloute blue/navy branding + dad joke copy for Tim's personal page. (8) **Noah Baldry onboarding email** drafted from Cloute email with signup link (mybidquick.com/#/signup) and checklist of what he needs to provide. Engine commits: 60f8fe5, 17c7ad5, f29da05. |
| 2026-04-05 | **Email domain setup + Gmail Send As**: (1) **Resend domain swap** — deleted send.mybidquick.com, added mybidquick.com (root domain) to Resend to stay on free tier (1 domain limit). (2) **DNS records added to Vercel** — 4 records: DKIM (TXT on resend._domainkey), SPF (MX + TXT on send subdomain), DMARC (TXT on _dmarc). Full 218-char DKIM key extracted from Resend UI. (3) **Resend domain verified** (green) — propagated in ~2 minutes since Vercel manages both DNS and registrar. (4) **Edge Function v4 deployed** — `process-welcome-emails` updated from address: `tim@send.mybidquick.com` → `tim@mybidquick.com`. Reply-to unchanged. (5) **New Resend API key** created: "gmail-smtp" with Sending access (old masked key couldn't be revealed). (6) **Gmail "Send As" configured** — tim@mybidquick.com working via smtp.resend.com:587/TLS (port 465/SSL failed; 587/TLS succeeded). Tim can now send emails as tim@mybidquick.com from Gmail. (7) **Gartner Digital Markets / Capterra submission started** — confirmation received (request ID: 0a8c9922). Covers Capterra + GetApp + Software Advice (all Gartner-owned). (8) Updated next-steps-action-guide.md with SMTP instructions + docs/directory-listings.md + docs/resend-setup.md committed. |
| 2026-04-06 | **RLS hardening + production safety audit**: (1) **Production safety audit (Bucket 1)** — switched all 4 API routes (webhook, create-checkout, billing-status, create-portal) to use `SUPABASE_SERVICE_ROLE_KEY` with anon key fallback. Added `api/_lib/supabase-admin.js` shared module (commit `909fe64`). (2) **City & State fields** added to tenant Settings tab in TenantDashboard — saves to Supabase `city` and `state` columns (commit `5c89096`). (3) **RLS hardening applied to production** — replaced 10+ wide-open "Allow public *" policies with 12 scoped policies: authenticated tenants see only their own data, anon users can only read tenant info by slug and insert leads, service_role_key bypasses for server-side API routes. Created `supabase/rls-hardening.sql`, `supabase/rls-rollback.sql`, and `supabase/RLS-TEST-CHECKLIST.md`. All 4 tables hardened: tenants, leads, lead_charges, credit_purchases (commit `84a0209`). |
| 2026-04-07 | **Platform defaults sync + pricing controls + analytics upgrade + scheduling + Google Calendar integration**: (1) **Synced platform defaults with engine** — updated DEFAULT_CONFIG in TenantDashboard to match engine defaults.js: packages renamed Basic→Standard/Standard→Premium/Premium→Platinum with correct multipliers (1.0/1.25/1.55), all service prices aligned, added 4/5-service bundle discounts, window types updated (commit `510f19e`). (2) **Multi-story upcharge controls** — added `storiesMultipliers` config section to Pricing tab: 2-story (default 1.12x) and 3-story (default 1.21x) adjustable sliders (commit `fe5bb86`). (3) **Minimum charge floors** — new Pricing tab section for per-service minimum charges: window cleaning ($75), gutter guard install ($200), gutter cleaning ($75) with editable inputs (commit `3cfe104`). (4) **Analytics time range filter** — added 7d/30d/90d/All toggle to Analytics tab, all charts and KPIs filter by selected range (commit `c69d87e`). (5) **Analytics enhancements** — added performance summary (best day, avg quotes/day), recent quotes table (last 10 with status badges), and follow-up opportunities section highlighting leads needing contact (commit `0d442b4`). (6) **Scheduled status** — added 'scheduled' as 5th pipeline stage (purple, between Contacted and Won). DB migration adds `preferred_days` and `preferred_time` columns to leads. Kanban board updated with scheduling display on lead cards (commits `ce660cd`, `5db091e`). (7) **Integrations tab + Google Calendar OAuth** — new admin sub-tab for managing integrations. Full Google Calendar flow: `google-auth-start.js` → Google consent → `google-auth-callback.js` → encrypted tokens stored in `integrations` table (AES-256-GCM via `api/_lib/encryption.js`). Disconnect via `google-disconnect.js` revokes tokens. `create-calendar-event.js` creates events from lead scheduling preferences. New Supabase table `integrations` with RLS (server-only, no client access). Feature toggle `googleCalendar` in config. Multiple bug fixes for state races, toggle crashes, OAuth scopes (commits `96d9d42`, `e8352ee`, `fafc180`, `a4bb8a1`, `e3509f1`). |
| 2026-04-08 | **Quote confirmation emails**: (1) **Customer confirmation email** — new `api/send-quote-confirmation.js` endpoint sends a branded HTML email to customers immediately after quote submission via Resend. Called from `createLead()` in db.js. Email includes service details, total price, business name/phone, and "What happens next" section (commit `18b26fe`). (2) **Redeploy** to pick up `RESEND_API_KEY` env var in Vercel (commit `ddb539c`). |
| 2026-04-09 | **Legal pages for directory listings**: Added Privacy Policy (`/privacy`) and Terms of Service (`/terms`) pages — required for Gartner Digital Markets (Capterra/GetApp/SoftwareAdvice) listing approval. New files: `PrivacyPolicy.jsx`, `TermsOfService.jsx`. Footer links added to LandingPage.jsx. 2 new routes in App.jsx (commit `98adcd1`). **SEO audit v2**: Updated audit (seo-audit-2026-04-09.md) — ~200 organic visits/mo, big gap vs QuoteIQ (15-25K) and Jobber (20-35K). Nobody owns "white-label quoting" or "per-lead pricing" content yet. Quick wins: optimize homepage title/meta, add schema markup, fix internal linking. **Blog rewrite**: Replaced generic "How to Price Pressure Washing Jobs" with Tim's authentic voice version. **County Wide website audit V2**: Full PageSpeed + technical SEO + conversion audit delivered as docx for Steven. |
| 2026-04-10 | **State of project review + client acquisition playbook**: Reviewed full project status — product is solid, bottleneck is tenant acquisition. Built interactive client acquisition playbook (`docs/client-acquisition-playbook.html`) with 4 cold DM/email templates for solo pressure washers, 5 Facebook group value posts (ready to paste), 8 software directory submission links with steps, weekly action plan (<2 hrs/week), and positioning guide (4 differentiators vs Jobber/HCP/ResponsiBid). **Gartner Peer Insights submitted**: MyBidQuick listed under "Configure, Price and Quote Applications" in Sales market. Submitted with Cloute + Cornerstone as customer links. Under review 2-5 business days. **PROJECT-BRAIN.md major update**: Added follow_up_logs table, updated tenant roster (3 active: Cloute, Cornerstone W&W, County Wide), added Scheduled Tasks section, added Client Acquisition section, documented all 7 Supabase tables with key columns, updated file tree with docs/ contents, verified API count at 10. |
| 2026-04-11 | **Sitemap update + merge cleanup**: Added `/privacy` and `/terms` to `public/sitemap.xml` — now **14 URLs total** (commits `aca6710`, `8dd8e01`). Resolved merge conflict between Privacy/Terms pages branch (`98adcd1`) and automated follow-up email branch (`8c2e74f`) — both features now fully in main. No new feature code shipped today; maintenance-only. |

## Scheduled Tasks (Automation)
These run automatically via Cowork scheduled tasks:
| Task | Schedule | What It Does |
|------|----------|-------------|
| mybidquick-lead-sync | Every 4 hours | Syncs leads from Supabase, generates sync report |
| mybidquick-lead-followup | Daily 8am | Checks leads needing Day 1/3/7 follow-ups, creates Gmail drafts |
| weekly-mybidquick-marketing | Sundays 8pm | Generates 10 social posts, 1 blog outline, competitor intel |
| mybidquick-health-check | Daily | Checks site uptime and API endpoint health |
| daily-tenant-update | Daily | Pulls tenant data, creates Google Sheet report, emails Tim |
| update-project-brain | Periodic | Auto-updates PROJECT-BRAIN.md with recent session work |

## Client Acquisition (as of April 10, 2026)
**Target customer**: Solo pressure washers (1-person operations, no website, price-sensitive)
**Budget**: Under $200/month
**Strategy**: 3-pronged approach documented in `docs/client-acquisition-playbook.html`:
1. **Cold outreach** — personalized DMs to pressure washers on Instagram/Facebook. Lead with their pain (slow quoting), offer 3 free credits. 5 DMs/week.
2. **Facebook group value posts** — show up as "the pressure washer who built a quoting tool." 1 post/week in PW groups (Pressure Washing Resource, PWRA, Softwash Nation).
3. **Software directories** — passive inbound from Capterra, G2, GetApp, AlternativeTo, Product Hunt.

**Directory submission status**:
- Gartner Digital Markets (Capterra/GetApp/SoftwareAdvice): Submitted 2026-04-05, request ID 0a8c9922
- Gartner Peer Insights: Submitted 2026-04-10 via Vendor Portal (under review, 2-5 business days). Category: Configure, Price and Quote Applications.
- G2: Profile submitted 2026-04-05 (4/4 steps, awaiting review)
- SourceForge: N/A (open-source only)

**Outreach tools built**:
- `website_audit.py` — Python script that audits a prospect's website (PageSpeed + content scrape), generates a report with 3 quick wins. Use before cold emailing to lead with value.
- `County-Wide-PowerWash-Website-Audit-V2.docx` — example audit delivered to Steven's company

## SEO & Google Search Console
- **www vs non-www**: All URLs canonicalized to `www.mybidquick.com` (fixed 2026-03-30)
- **Google Search Console**: www.mybidquick.com property verified via meta tag
- **Verification tag**: `<meta name="google-site-verification" content="uVz2LLgmtmrxIhr1PeowRq9TlUksp-kxqfaG8Ekxxow" />` (in index.html)
- **Sitemap**: `www.mybidquick.com/sitemap.xml` — 14 URLs (/, /signup, /blog, 7 blog posts, /login, /compare, /privacy, /terms)
- **Canonical tag**: `<link rel="canonical" href="https://www.mybidquick.com/" />` (in index.html)
- **og:url**: `https://www.mybidquick.com/` (in index.html)
- **robots.txt**: Points sitemap to `https://www.mybidquick.com/sitemap.xml`
- **SEO Audit Reports**: seo-audit-march2026.html (original, March 2026) + seo-audit-2026-04-09.md (updated April 9 — ~200 organic visits/mo, QuoteIQ gets 15-25K, Jobber 20-35K. Key opps: own "white-label quoting" and "per-lead pricing" content)
- **Status as of 2026-03-30**: Zero pages indexed in Google. Fixes deployed, waiting for Googlebot to crawl.
- **Google Business Profile**: Verified (2026-04-03)
- **Pending**: Software directory submissions — Capterra/GetApp/SoftwareAdvice submitted via Gartner (2026-04-05, awaiting review); G2 submitted (awaiting review); SourceForge N/A (open-source only). Competitor comparison blog posts shipped (3 articles).
- **Email**: tim@mybidquick.com fully operational — Resend domain verified, Edge Function sends from root domain, Gmail "Send As" configured via smtp.resend.com:587/TLS (2026-04-05)

## Cloute Cleaning — Quick Reference (Tenant)
Cloute Cleaning is a **customer/tenant** of MyBidQuick. Tim Sullivan is managing partner (NOT owner of Cloute Inc).

### Customer-Facing Pages
| Page | URL |
|------|-----|
| Quoting Page | `cloute-cleaning.mybidquick.com#quote` |
| Landing Page | `cloute-cleaning.mybidquick.com` |
| Legacy URL | `cleanbid.vercel.app/cloute#quote` (still works) |
| Fallback URL | `www.mybidquick.com/#/q/cloute-cleaning` |

### Engine Admin/Leads (Legacy Panels)
| Page | URL |
|------|-----|
| Admin Panel | `cloute-cleaning.mybidquick.com#admin` (password: via Vercel env var) |
| Leads Panel | `cloute-cleaning.mybidquick.com#leads` |

### MyBidQuick Platform Login
| Page | URL |
|------|-----|
| Login Page | `www.mybidquick.com/#/login` |
| Login Email | tim.sullivan@clouteinc.com (Supabase Auth) |
| Tenant Dashboard | `www.mybidquick.com/#/dashboard` |

### Tim's Super Admin (Owner Panel)
| Page | URL |
|------|-----|
| Admin Dashboard | `www.mybidquick.com/#/admin` (password: via Vercel env var — changed 2026-04-05) |
| Tabs | Overview, Tenants, Revenue, Analytics, Settings |

### Cornerstone Wash & Window (Tenant)
| Page | URL |
|------|-----|
| Quoting Page | `cornerstone-wash-and-window-cleaning.mybidquick.com#quote` |
| Demo Login Email | noah@cornerstoneexterior.com |

### County Wide Power Wash (Tenant)
| Page | URL |
|------|-----|
| Quoting Page | `county-wide-power-wash-and-restorations.mybidquick.com#quote` |
| Owner | Steven |

## Environment Variables
### In `.env` (committed to repo — client-side, publishable only)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase public/anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (pk_test_...)

### In Vercel Dashboard (NOT committed — server-side secrets)
- `VITE_SUPABASE_URL` — Also needed by serverless functions
- `VITE_SUPABASE_ANON_KEY` — Also needed by serverless functions
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (bypasses RLS for server-side API routes)
- `STRIPE_SECRET_KEY` — Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (whsec_...)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID (for Calendar integration)
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `INTEGRATION_ENCRYPTION_KEY` — 64-char hex string (32 bytes) for AES-256-GCM token encryption
- `RESEND_API_KEY` — Resend API key for sending transactional emails (quote confirmations, weekly pipeline)

### Supabase
- **Project**: Mybidquick (eccuaztubjdxicylcwrh)
- **Tables** (7 total):
  - `tenants` — company profiles, configs, billing info, auth linkage. Key columns: slug, config (JSONB), lead_credits (default 25), stripe_customer_id, auth_user_id, is_launch_customer, email_opt_out
  - `leads` — customer quote submissions. Key columns: status (new/contacted/scheduled/won/lost), service_details (JSONB), package_prices (JSONB), address, preferred_days/time, follow_ups_sent (int array)
  - `lead_charges` — per-lead billing records (1 credit deducted per quote)
  - `credit_purchases` — Stripe checkout purchase records (pending/completed/failed)
  - `integrations` — OAuth token storage (Google Calendar). Encrypted access/refresh tokens (AES-256-GCM). RLS: server-only (no client access)
  - `welcome_email_schedule` — 5-email onboarding sequence per tenant. Tracks sent_at, status (pending/sent/skipped/failed). RLS: server-only
  - `follow_up_logs` — automated follow-up email tracking. Logs each step sent per lead (step_index, delay_days, type, subject, status). RLS: server-only
- **Auth column on tenants**: auth_user_id (UUID FK → auth.users.id, unique)
- **Billing columns on tenants**: stripe_customer_id, lead_credits (default 3), lead_price_cents (default 500), billing_active

## Competitive Landscape (Researched March 29, 2026)

### Market Size
- U.S. home services market: $650-750B annually
- Exterior cleaning sub-market: $12.5B (2024) → $20.3B by 2033
- 34,000+ pressure washing businesses in U.S., most using generic tools or nothing

### Key Competitors
| Company | Pricing | MyBidQuick Advantage |
|---------|---------|---------------------|
| **ServiceTitan** (public, ~$960M rev) | Custom, $$$/technician | Too expensive/complex for small crews |
| **Housecall Pro** ($125M funded) | $59-129+/mo | Per-lead beats monthly subscription |
| **Jobber** (Series D) | $69-349/mo | No instant customer-facing quotes |
| **ResponsiBid** | $829 setup + $229/mo | MBQ: zero setup, 10x cheaper |
| **QuoteIQ** | $188-249/mo | MBQ: no monthly fee, simpler |
| **MaidCentral** | ~$450/mo | MBQ: 50x cheaper entry point |
| **ZenMaid** | $19+/mo | Scheduling only, no quoting |
| **Thumbtack/Angi** | $15-100/lead (SHARED) | MBQ leads are EXCLUSIVE, 5-40x cheaper |

### MyBidQuick's Moat (No Competitor Has All 4)
1. Instant quoting (78% of customers buy from first responder)
2. Smart cascade upsell (35% avg ticket lift)
3. Per-lead pricing (no subscription trap)
4. White-label branding (looks like tenant's own tool)

Full competitive deep-dive in skill: `mybidquick-ops/references/competitive-intel.md`

## Active Promo (March 2026)
- **LAUNCH20 Code**: First 20 customers get **$1/lead for life** (discount code: `LAUNCH20`)
  - Entered during onboarding Step 1 (discount code field)
  - `getLaunchCustomerCount()` in db.js checks/caps at 20 customers
  - Stores `is_launch_customer` flag + `discount_code` on tenant record in Supabase
  - Shows real-time "spots left" indicator in onboarding
- **Free credits**: Default `tenants.lead_credits` = 25 (was 3) for launch period
- **Notion**: [Launch Night page](https://www.notion.so/332006ff115981a78ce2e7ef750ac9ec)

## Important Notes
- Cloute Cleaning and Cornerstone Exterior are **customers/tenants** — Tim is a managing partner at Cloute, not the owner
- This is Tim's personal product — keep all Cloute Inc branding OUT
- Tim is learning to code — keep explanations beginner-friendly
- The quoting engine (mybidquick-engine repo, formerly Cleanbid) is part of MyBidQuick — same brand, separate repo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 