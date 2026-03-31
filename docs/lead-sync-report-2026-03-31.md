# MyBidQuick Lead Pipeline Sync Report
**Date:** 2026-03-31 (Scheduled Run)

## Status: Partial — Google Sheet Permission Error

The Supabase lead pull succeeded, but the Google Sheet sync could not complete because all connected Google accounts (`s-p-partyof7`, `tim-clouteinc`, `tim-my3dfamily`) returned **Permission Denied** for spreadsheet `1lJqthT4uOKtBd-PlZNIhxtKQWtYXcfwpayf5dDqzNQU`.

**Action needed:** Tim, please re-share that Google Sheet with your connected Google Workspace account(s), or re-authorize access. Once permissions are fixed, the next scheduled run will sync automatically.

---

## Leads Pulled from Supabase (3 total)

| # | Date | Name | Email | Phone | Tenant | Services | Quote $ | Status | Last Contact | Notes |
|---|------|------|-------|-------|--------|----------|---------|--------|--------------|-------|
| 1 | 2026-03-26 | Sarah Johnson | sarah@example.com | (608) 555-0123 | Cloute Exterior Cleaning | House Washing + Window Cleaning | $850.00 | New Lead | 2026-03-30 | Interested in spring cleaning special |
| 2 | 2026-03-26 | Michael Chen | michael@example.com | (608) 555-0456 | Cloute Exterior Cleaning | House Washing | $350.00 | Won | — | Paid in full |
| 3 | 2026-03-26 | Jennifer Davis | jen@example.com | (608) 555-0789 | Cloute Exterior Cleaning | Gutter Cleaning + Roof Cleaning | $520.00 | New Lead | 2026-03-30 | Waiting on property inspection |

## Pipeline Summary

- **New Lead:** 2
- **Contacted:** 0
- **Won:** 1
- **Lost:** 0
- **Total Pipeline Value:** $1,720.00
- **Won Revenue:** $350.00

## Rows Ready to Write (when sheet access is restored)

These rows are formatted and ready for the next successful sync:

```
1 | 2026-03-26 | Sarah Johnson | sarah@example.com | (608) 555-0123 | Cloute Exterior Cleaning | House Washing + Window Cleaning | 850.00 | New Lead | 2026-03-30 | Interested in spring cleaning special
2 | 2026-03-26 | Michael Chen | michael@example.com | (608) 555-0456 | Cloute Exterior Cleaning | House Washing | 350.00 | Won | | Paid in full
3 | 2026-03-26 | Jennifer Davis | jen@example.com | (608) 555-0789 | Cloute Exterior Cleaning | Gutter Cleaning + Roof Cleaning | 520.00 | New Lead | 2026-03-30 | Waiting on property inspection
```
