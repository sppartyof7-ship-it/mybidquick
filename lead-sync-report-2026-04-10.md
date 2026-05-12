# MyBidQuick Lead Pipeline Sync Report
**Date:** April 10, 2026
**Status:** Partial — Google Sheets write failed (permission error)

---

## Supabase Lead Pull: SUCCESS (8 leads)

| # | Date | Name | Email | Tenant | Services | Quote $ | Status |
|---|------|------|-------|--------|----------|---------|--------|
| 1 | 2026-04-08 | Tim Sullivan | s.p.partyof7@gmail.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | $969.00 | scheduled |
| 2 | 2026-04-07 | Test User | test@test.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | $673.00 | new |
| 3 | 2026-04-06 | test rls | testrls@example.com | Cloute Exterior Cleaning | Pressure Washing | $552.00 | won |
| 4 | 2026-04-03 | Eliott D Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | $541.00 | new |
| 5 | 2026-04-03 | Tim Sullivan | s.p.partyof7@gmail.com | Cloute Exterior Cleaning | PW + Windows + Gutters | $1,189.00 | new |
| 6 | 2026-04-03 | Tim Sullivan | tim.sullivan@clouteinc.com | Cloute Exterior Cleaning | Pressure Washing + Window Cleaning | $933.46 | new |
| 7 | 2026-04-03 | Noah Baldry | noahbaldry34@gmail.com | Cloute Exterior Cleaning | Window Cleaning | $1,375.00 | new |
| 8 | 2026-04-03 | Test Lead - Eli Cloute | eli.cloute@clouteinc.com | Cloute Exterior Cleaning | Window Cleaning | $120.00 | new |

## Pipeline Summary

- **New Lead:** 6
- **Scheduled:** 1
- **Won:** 1
- **Lost:** 0
- **Total Pipeline Value:** $6,352.46

## Google Sheets Sync: FAILED

The `s-p-partyof7` Google Workspace account is returning permission errors on all spreadsheet read/write operations. The account can search Drive and create sheets, but cannot read or write data. Tim likely needs to re-authorize the Google Workspace MCP with full Sheets permissions.

**Action needed:** Re-auth the `s-p-partyof7` account in Google Workspace MCP settings to grant Sheets read/write scope.

**Note:** There are many duplicate "Lead Pipeline (Auto-Sync)" sheets accumulating in Drive from previous sync attempts that also failed to write data. Tim may want to clean those up.
