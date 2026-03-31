# MyBidQuick — Continuation Prompt

Paste this into a new chat to pick up where we left off.

---

## Prompt:

Read PROJECT-BRAIN.md first. Also check the MyBidQuick Notion brain at https://www.notion.so/32e006ff1159812aaa26c9f32b8a6e74 for full context. This is a SaaS platform owned by Tim Sullivan — not Cloute Inc.

### Where we left off (2026-03-31):

**Just completed:**
1. Wildcard subdomain routing LIVE — `*.mybidquick.com` configured on Vercel engine project. Every tenant gets `SLUG.mybidquick.com` automatically.
2. Full repo cleanup for scale — deleted 139MB of dead weight, organized marketing docs into `docs/`, removed unused code/imports, updated .gitignore. Repo root went from 35+ items to 13 clean items. All pushed to GitHub, all Vercel builds GREEN.
3. Updated PROJECT-BRAIN.md and Notion brain with everything.

**Open items to tackle next:**
- **Duplicate webhook**: `api/webhook.js` and `api/stripe-webhook.js` are nearly identical Stripe webhook handlers. Need to check Stripe Dashboard → Developers → Webhooks to see which endpoint URL is configured, then delete the other one.
- **Lead Pipeline CRM Phase 3.5**: AI agent to auto-sync leads from Supabase → Google Sheets, auto follow-up emails (Day 1, 3, 7), in-app Kanban board in TenantDashboard.
- **Google Business Profile**: Register MyBidQuick as a software company.
- **Software directory submissions**: Capterra, G2, GetApp, SoftwareAdvice, SourceForge.
- **Competitor comparison landing pages**: vs ResponsiBid, vs QuoteIQ.
- **Industry-specific landing pages**: pressure washing, window cleaning, etc.
- **README.md**: Still has default Vite template text — needs a real MyBidQuick README.

### Key technical context:
- **No git CLI/API/MCP available** — all GitHub pushes go through the browser-based workflow (React fiber injection into CodeMirror editor on github.com/edit pages)
- **Supabase MCP connected** — use `execute_sql` for database operations
- **Notion MCP connected** — use notion-update-page for brain updates
- **Vercel MCP connected** — use list_deployments, get_project, etc.
- **Two Vercel projects**: `mybidquick` (platform, prj_V8FWQozdjIi7AURR1M5VduQK7KJC) and `cleanbid` (engine, prj_zauduwCgyCqVTCu93aVFljRg3ahD)
- **GitHub repo**: `sppartyof7-ship-it/mybidquick` (NOT sppartyof7/mybidquick)
- **Google Maps API Key**: AIzaSyAnLy1iRt0_fkMJqyBxrC0meEJD0qpshvU
