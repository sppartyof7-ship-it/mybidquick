# MyBidQuick Lead Pipeline Sync Report
**Date:** April 8, 2026

---

## Sync Status: PARTIAL — Google Sheets Permission Error

The Supabase pull succeeded, but the Google Workspace MCP could not read or write to any Google Sheet (permission denied on both the original tracker and a newly created sheet). Tim likely needs to re-authorize the Google Workspace MCP with Sheets API scope.

**Sheets affected:**
- MyBidQuick - Lead Pipeline (ID: `16ky3Qx4x4QmfhOBERJJIsxX9axD7C_Kzp1-Xzr5Q3KA`) — most recent, modified 4/7
- MyBidQuick — Lead Pipeline Tracker (ID: `1lJqthT4uOKtBd-PlZNIhxtKQWtYXcfwpayf5dDqzNQU`) — original from task config

---

## Pipeline Snapshot from Supabase (7 total leads)

| # | Date | Name | Email | Tenant | Services | Quote $ | Status |
|---|------|------|-------|--------|----------|---------|--------|
| 1 | 2026-04-07 | Test User | test@test.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | $673 | New |
| 2 | 2026-04-06 | test rls | testrls@example.com | Cloute Exterior Cleaning | Pressure Washing | $552 | Won |
| 3 | 2026-04-03 | Eliott D Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | $541 | New |
| 4 | 2026-04-03 | Tim Sullivan | s.p.partyof7@gmail.com | Cloute Exterior Cleaning | PW + Windows + Gutters | $1,189 | New |
| 5 | 2026-04-03 | Tim Sullivan | tim.sullivan@clouteinc.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | $933 | New |
| 6 | 2026-04-03 | Noah Baldry | noahbaldry34@gmail.com | Cloute Exterior Cleaning | Window Cleaning | $1,375 | New |
| 7 | 2026-04-03 | Test Lead - Eli Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | $120 | New |

---

## Pipeline Summary

- **New Lead:** 6
- **Contacted:** 0
- **Won:** 1
- **Lost:** 0
- **Total Leads:** 7
- **Total Pipeline Value:** $5,383.46

---

## Notes
- All leads are from **Cloute Exterior Cleaning** — no leads yet from Cornerstone or other tenants
- 1 lead marked as "Won" ($552 pressure washing)
- Several appear to be test leads (test@test.com, testrls@example.com)

## Action Required
Re-authorize Google Workspace MCP for Sheets read/write access so future auto-syncs can update the pipeline sheet directly.
