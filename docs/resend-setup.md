# Resend Email Setup for MyBidQuick Welcome Sequence

**Purpose:** The welcome email automation is fully built in Supabase. It just needs a Resend API key to actually send emails.

**Why Resend?** Simplest transactional email API. Free tier = 100 emails/day (plenty for MyBidQuick's volume). One API call per email, no complex setup.

---

## Setup Steps (10 minutes)

### 1. Create Resend Account
- Go to https://resend.com/signup
- Sign up with tim@mybidquick.com

### 2. Add & Verify Your Domain
- Go to https://resend.com/domains
- Click "Add Domain" → enter `mybidquick.com`
- Resend gives you DNS records to add (SPF, DKIM, DMARC)
- Add these records in your domain registrar (wherever mybidquick.com DNS is managed)
- Wait for verification (usually 5-30 minutes)

**Why this matters:** Without domain verification, emails would come from `onboarding@resend.dev` instead of `tim@mybidquick.com`. Verified domain = professional sender address + better deliverability.

### 3. Create API Key
- Go to https://resend.com/api-keys
- Click "Create API Key"
- Name it: `mybidquick-welcome-emails`
- Permission: "Sending access" (default)
- Copy the key (starts with `re_`)

### 4. Add API Key to Supabase
- Go to https://supabase.com/dashboard/project/eccuaztubjdxicylcwrh/settings/functions
- Under "Edge Function Secrets", add:
  - Name: `RESEND_API_KEY`
  - Value: (paste your Resend API key)
- Click Save

### 5. Test It
After setup, the next tenant signup will automatically:
1. Insert a row in `tenants` table
2. Trigger `schedule_welcome_emails()` — creates 5 rows in `welcome_email_schedule`
3. Email 1 (welcome) is scheduled immediately
4. Hourly cron job picks it up and sends via Resend
5. Remaining emails send on Day 1, 3, 5, 7

---

## How the Automation Works (For Reference)

```
New Tenant Signup
    │
    ▼
[DB Trigger] schedule_welcome_emails()
    │
    ├── Email 1: Welcome (immediate)
    ├── Email 2: Quick Setup (Day 1)
    ├── Email 3: Upsell Cascade (Day 3)
    ├── Email 4: Get Leads (Day 5)
    └── Email 5: Credits Nudge (Day 7)
    │
    ▼
[Cron Job] runs every hour
    │
    ▼
[Edge Function] process-welcome-emails
    │
    ├── Finds due emails (status='pending', scheduled_at <= now)
    ├── Fetches tenant data (name, email, slug)
    ├── Renders HTML email from template
    └── Sends via Resend API
    │
    ▼
[Exit Condition] If tenant buys credits → remaining emails marked 'skipped'
```

## Monitoring

Check email status in Supabase:
```sql
SELECT t.business_name, w.email_number, w.subject, w.status, w.scheduled_at, w.sent_at
FROM welcome_email_schedule w
JOIN tenants t ON t.id = w.tenant_id
ORDER BY t.business_name, w.email_number;
```

Resend dashboard: https://resend.com/emails (see delivery status, opens, clicks)

---

## Supabase Resources Created

| Resource | Type | Purpose |
|----------|------|---------|
| `welcome_email_schedule` | Table | Tracks all 5 emails per tenant |
| `schedule_welcome_emails()` | Trigger function | Populates schedule on tenant INSERT |
| `skip_welcome_emails_on_purchase()` | Trigger function | Marks emails 'skipped' when credits purchased |
| `process-welcome-emails` | Edge Function | Sends due emails via Resend |
| `process-welcome-emails` | Cron job | Runs edge function every hour |
