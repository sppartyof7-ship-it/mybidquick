# MyBidQuick Lead Pipeline Sync Report
**Date:** April 9, 2026 (scheduled sync)

## Supabase Pull: ✅ SUCCESS
Pulled **8 leads** from the `leads` table (joined with tenants).

## Google Sheet Sync: ❌ FAILED — Permission Denied
The Google Workspace MCP returned **permission denied** for spreadsheet ID `1lJqthT4uOKtBd-PlZNIhxtKQWtYXcfwpayf5dDqzNQU` using the `s-p-partyof7` account. Both read and write attempts failed. This is the same issue as the prior sync attempt.

## Current Pipeline Snapshot (from Supabase)

| # | Date | Name | Email | Tenant | Services | Package | Quote $ | Status |
|---|------|------|-------|--------|----------|---------|---------|--------|
| 1 | 2026-04-08 | Tim Sullivan | s.p.partyof7@gmail.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | Premium | $969.00 | New |
| 2 | 2026-04-07 | Test User | test@test.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | Premium | $673.00 | New |
| 3 | 2026-04-06 | test rls | testrls@example.com | Cloute Exterior Cleaning | Pressure Washing | Premium | $552.00 | Won |
| 4 | 2026-04-03 | Eliott D Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | Premium | $541.00 | New |
| 5 | 2026-04-03 | Tim Sullivan | s.p.partyof7@gmail.com | Cloute Exterior Cleaning | PW + Windows + Gutters | Platinum | $1,189.00 | New |
| 6 | 2026-04-03 | Tim Sullivan | tim.sullivan@clouteinc.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | Premium | $933.46 | New |
| 7 | 2026-04-03 | Noah Baldry | noahbaldry34@gmail.com | Cloute Exterior Cleaning | Window Cleaning | Premium | $1,375.00 | New |
| 8 | 2026-04-03 | Test Lead - Eli Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | Premium | $120.00 | New |

## Pipeline Summary

| Stage | Count | Value |
|-------|-------|-------|
| New Lead | 7 | $5,800.46 |
| Won | 1 | $552.00 |
| Contacted | 0 | $0.00 |
| Lost | 0 | $0.00 |
| **Total** | **8** | **$6,352.46** |

## Key Observations
- All 8 leads are under **Cloute Exterior Cleaning** — no leads from Cornerstone or other tenants yet
- Several appear to be test submissions (test@test.com, "test rls", "testy test for claude")
- 1 lead marked **Won** ($552 pressure washing, April 6)
- Most leads chose **Premium** tier; 1 chose **Platinum**

## Action Required
1. **Fix Google Sheet permissions** — open the Lead Pipeline sheet and ensure `s.p.partyof7@gmail.com` has Editor access, or re-authorize the Google Workspace connector in Cowork settings
2. Once fixed, the next scheduled sync will populate the sheet automatically
3. Consider cleaning up duplicate auto-sync sheets from prior failed attempts
