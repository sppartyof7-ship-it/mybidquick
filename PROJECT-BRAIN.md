# MyBidQuick — Project Brain

## What Is This?
MyBidQuick is a SaaS platform owned by **Tim Sullivan** (personally, NOT Cloute Inc). It's a white-label quoting tool that Tim sells to other cleaning companies. Each cleaning company gets their own branded quote page powered by MyBidQuick's engine.

## Business Model
- **Starter**: Free (10 quotes/month) — gets companies hooked
- **Growth**: $2 per quote — for growing companies
- **Pro**: $3 per quote — full features, priority support
- Revenue comes from per-lead fees charged to each tenant (cleaning company)

## Architecture
Two separate repos:
1. **mybidquick** (this repo) — The SaaS platform: marketing site, onboarding wizard, admin dashboard
2. **Cleanbid** — The actual quoting engine that generates quotes for customers

### How They Connect (Future)
- Tenant configs will live in a **Supabase database** (not hardcoded JS files)
- When a customer visits `mybidquick.com/company-name`, the quoting engine pulls that company's config from the database
- This means new companies can self-serve sign up WITHOUT any code changes

## Tech Stack
- **Frontend**: React + Vite (SPA with HashRouter)
- **Styling**: Custom CSS with CSS variables (in index.css)
- **Icons**: Lucide React
- **Hosting**: Vercel (LIVE and deployed)
- **Database**: Supabase (future — currently using localStorage for demo)
- **Payments**: Stripe (future — for billing per-lead)
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
| `/admin/*` | AdminDashboard.jsx | Tim's admin panel to manage tenants & revenue |
| `/demo/quote` | QuoteDemo.jsx | Interactive customer quote demo with upsell flow |
| `/dashboard` | TenantDashboard.jsx | Full tenant admin panel (matches ClouteBid admin) |

## Key Files
```
mybidquick/
├── index.html              # Entry HTML
├── src/
│   ├── main.jsx            # React entry with HashRouter
│   ├── App.jsx             # Router (5 routes)
│   ├── index.css           # Global styles & CSS variables
│   └── pages/
│       ├── LandingPage.jsx     # Marketing landing page
│       ├── Onboarding.jsx      # 3-step signup wizard (includes upsell config)
│       ├── AdminDashboard.jsx  # Tim's admin panel (password: admin123)
│       ├── QuoteDemo.jsx       # Customer-facing quote demo with upsell
│       └── TenantDashboard.jsx # Tenant admin panel (1845 lines, full ClouteBid clone)
├── package.json            # Dependencies
└── vite.config.js          # Vite config
```

## Onboarding Wizard (3 Steps)
1. **Business Info**: Company name, owner, email, phone, city, state, website
2. **Branding**: Logo upload, 6 color presets + custom pickers, live preview
3. **Services**: 7 toggleable services with price inputs + upsell configuration (toggle, discount slider 5-50%)

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
- **Demo Tenants**: 5 sample companies including Cloute Cleaning (Tim's company) and Cornerstone Exterior (Noah Baldry)
- Merges demo data with localStorage tenants from signups

## Window Cleaning Upsell Feature
- When a customer selects house washing and gets a price, they're offered window cleaning at a percentage discount
- Configurable in onboarding wizard (Step 3) — toggle on/off, set discount % (5-50%)
- Live customer preview in onboarding shows what the upsell popup looks like
- Full interactive demo at `/demo/quote`: select home size → see house wash price → upsell slides in → select window type → final summary with savings
- Window types: single-hung, double-hung, casement, sliding, bay/bow (each with price multipliers)

## Tenant Dashboard (mybidquick.com/#/dashboard)
Full admin panel for each tenant (cleaning company customer), matching ClouteBid's admin. Login via email lookup. Includes:
- **Leads/CRM Panel**: Stats dashboard (total leads, pending, won, revenue), status filters (All/Pending/Won/Lost), expandable lead cards with contact info, services, notes, won/lost actions
- **Pricing Tab**: Global price adjustment slider (-50% to +50%), package multipliers (Basic 1x, Standard 1.35x, Premium 1.75x with editable descriptions), bundle discounts (2-service and 3+ service %)
- **Services Tab**: Per-service config with toggle on/off, base price, per sq ft, per window, per linear ft, and editable add-ons with prices
- **Bundles Tab**: Seasonal bundle builder with name, discount %, end date, tagline
- **Marketing Tab**: Toggleable marketing elements — urgency timer, social proof, limited-time offer, review badge
- **Followup Tab**: Email/SMS sequence builder — delay (days), type (email/sms), subject, body with template variables ({{name}}, {{business}}, {{total}}, {{services}}), add/remove steps
- **Settings Tab**: Business name, admin password, lead sources (add/remove tags), lead notification email, Web3Forms API key, export config JSON
- **Demo accounts**: tim@clouteinc.com, noah@cornerstoneexterior.com
- Config pattern: `updateConfig(dotPath, value)` with `deepClone` for immutable state, localStorage persistence
- Self-contained 1845-line component with inline styles, blue theme (#3b9cff primary)

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
- Copyright: © MyBidQuick

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
- [x] Build full tenant admin dashboard (6 tabs + Leads/CRM, matching ClouteBid admin)
- [x] Fix Followup tab JSX expression bug

### NEXT UP (Phase 2 — Backend & Database)
- [ ] Add Supabase database for tenant storage (replaces localStorage)
- [ ] Build API endpoints for tenant CRUD operations
- [ ] Connect Cleanbid quoting engine to pull tenant configs from database
- [ ] Real authentication for admin dashboard (replace admin123 password)

### PHASE 3 — Monetization
- [ ] Add Stripe billing (charge per-lead: $2 Growth, $3 Pro)
- [ ] Usage tracking (count quotes per tenant per month)
- [ ] Billing dashboard for tenants
- [ ] Auto-throttle free tier at 10 quotes/month

### PHASE 4 — Growth Features
- [ ] Email notifications for new signups
- [ ] Tenant self-serve dashboard (companies edit their own settings)
- [ ] Analytics for tenants (how many quotes, conversion rates)
- [ ] Referral program
- [ ] Blog / SEO content on mybidquick.com

## Related Repos
- **Cleanbid / ClouteBid**: github.com (separate repo) — The quoting engine at cleanbid.vercel.app. Has its own admin panel at `#admin` (password: admin123) with AdminPanel.jsx, LeadsPanel.jsx, config-driven architecture. MyBidQuick's tenant dashboard was cloned from this admin panel.

## Session Log
| Date | What We Did |
|------|------------|
| 2026-03-25 | Built entire MVP: landing page, onboarding wizard, admin dashboard. Pushed to GitHub. Deployed to Vercel. Purchased & connected mybidquick.com, .io, .org domains. |
| 2026-03-26 | Added window cleaning upsell feature (onboarding config + QuoteDemo page). Built full tenant admin dashboard (1845 lines) matching ClouteBid admin — 6 tabs (Pricing, Services, Bundles, Marketing, Followup, Settings) + Leads/CRM panel. Fixed Followup tab JSX bug. All pushed and live on Vercel. |

## Important Notes
- Cloute Cleaning and Cornerstone Exterior are just **customers/tenants**, not owners
- This is Tim's personal product — keep all Cloute Inc branding OUT
- Tim is learning to code — keep explanations beginner-friendly
- The quoting engine (Cleanbid repo) is a separate project
