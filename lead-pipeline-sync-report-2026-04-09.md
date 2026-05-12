# MyBidQuick Lead Pipeline Sync Report
**Date:** April 9, 2026 (automated run)

## Sync Status: ⚠️ Partial — Google Sheets permission error

Supabase pull succeeded, but Google Sheets read/write failed with permission denied. Tim needs to re-authorize the Google Workspace MCP for Sheets access.

## Supabase Leads (8 total)

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
- **New Lead:** 7
- **Won:** 1
- **Contacted:** 0
- **Lost:** 0
- **Total pipeline value:** $6,352.46

## Notes
- All 8 leads are from the Cloute Exterior Cleaning tenant — no leads yet from Cornerstone or other tenants
- Several leads appear to be test entries (Test User, test rls, Test Lead - Eli Cloute)
- The configured spreadsheet ID (1lJqthT4uOKtBd-PlZNIhxtKQWtYXcfwpayf5dDqzNQU) returned permission denied on both read and write
- Multiple duplicate "Auto-Sync" sheets exist in Drive from previous runs that also created new sheets when writes failed

## Action Required
Tim needs to re-authorize Google Sheets permissions in the Google Workspace MCP connector, or update the scheduled task with a spreadsheet ID that has proper access.
