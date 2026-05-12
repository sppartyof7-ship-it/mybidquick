# MyBidQuick — Lead Pipeline Snapshot

**Synced:** May 4, 2026
**Source:** Supabase (`leads` table, all tenants)
**Note:** Scheduled xlsx sync to Google Sheets failed today — bash sandbox could not initialize (plugin mount errors). Data pulled successfully and captured here for visibility.

## Pipeline Summary

| Stage     | Count |
|-----------|-------|
| New Lead  | 8     |
| Contacted | 4     |
| Scheduled | 1     |
| Won       | 1     |
| Lost      | 0     |
| **Total** | **13** |

- **Total Pipeline Value:** $10,700.46
- **Won Revenue:** $552.00

## Leads (newest first)

| # | Name | Email | Phone | Services | Pkg | Quote | Status | Tenant |
|---|------|-------|-------|----------|-----|-------|--------|--------|
| 1 | Tim Sullivan | s.p.partyof7@gmail.com | 9207236822 | Pressure Washing, Window Cleaning, Gutter Cleaning | Premium | $1,533.00 | Contacted | Cornerstone Wash and Window Cleaning |
| 2 | Jessica Wagner | hartmanrylee@hotmail.com | 4065801760 | Pressure Washing, Window Cleaning | Premium | $705.00 | Contacted | Cornerstone Wash and Window Cleaning |
| 3 | Steph Jack | shernandez0288@yahoo.com | 5613088205 | Window Cleaning, Gutter Cleaning | Standard | $449.00 | Contacted | Cornerstone Wash and Window Cleaning |
| 4 | Kasey Chambers | kcrae2@gmail.com | 4062076336 | Window Cleaning, Gutter Cleaning | Standard | $231.00 | Contacted | Cornerstone Wash and Window Cleaning |
| 5 | Steven Metellus | steventonice@gmail.com | 2407841290 | Pressure Washing, Gutter Cleaning | Platinum | $1,430.00 | New Lead | County Wide Power Wash And Restorations |
| 6 | Tim Sullivan | s.p.partyof7@gmail.com | 9207236822 | Pressure Washing, Window Cleaning | Premium | $969.00 | Scheduled | Cloute Exterior Cleaning |
| 7 | Test User | test@test.com | 5551234567 | Pressure Washing, Window Cleaning | Premium | $673.00 | New Lead | Cloute Exterior Cleaning |
| 8 | test rls | testrls@example.com | 6085550199 | Pressure Washing | Premium | $552.00 | Won | Cloute Exterior Cleaning |
| 9 | Eliott D Cloute | eli.cloute@clouteinc.com | 9207231939 | Window Cleaning | Premium | $541.00 | New Lead | Cloute Exterior Cleaning |
| 10 | Tim Sullivan | s.p.partyof7@gmail.com | 9207236822 | Pressure Washing, Window Cleaning, Gutter Cleaning | Platinum | $1,189.00 | New Lead | Cloute Exterior Cleaning |
| 11 | Tim Sullivan | tim.sullivan@clouteinc.com | 9205634101 | Pressure Washing, Window Cleaning | Premium | $933.46 | New Lead | Cloute Exterior Cleaning |
| 12 | Noah Baldry | noahbaldry34@gmail.com | 9203972318 | Window Cleaning | Premium | $1,375.00 | New Lead | Cloute Exterior Cleaning |
| 13 | Test Lead - Eli Cloute | eli.cloute@clouteinc.com | 9207231939 | Window Cleaning | Premium | $120.00 | New Lead | Cloute Exterior Cleaning |

## Why no Google Sheet today

Every `mcp__workspace__bash` call failed with:
> bind mount failed: exit status 1: Could not open source directory ... rpm/plugin_*

The Linux sandbox couldn't bring up because it can't find some plugin source directories on the host. Without bash I can't run `openpyxl` to build the xlsx, and the xlsx-upload workaround is the only path that works (Sheets write API still has the missing-scope issue).

Next run should succeed once the plugin mount issue clears. If it keeps recurring, the workaround would be to bake an xlsx-builder Edge Function in Supabase or a tiny Vercel serverless endpoint that returns the xlsx bytes — then I could fetch and upload without needing bash.
