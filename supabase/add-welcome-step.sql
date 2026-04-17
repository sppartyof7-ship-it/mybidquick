-- ============================================================================
-- Adds welcome_step to tenants table for the Day 1/3/5/7 welcome drip.
-- Applied to production 2026-04-17 via Supabase MCP.
-- ============================================================================
--
-- 0 = only Day-0 welcome sent (at signup time by api/send-welcome-email.js)
-- 1 = Day-1 email sent; 2 = Day-3; 3 = Day-5; 4 = Day-7 (sequence complete)
--
-- The api/welcome-drip.js cron walks this forward based on days since created_at.
-- ============================================================================

alter table tenants
  add column if not exists welcome_step smallint not null default 0;

-- Helper index so the daily cron can quickly find tenants who still have
-- pending emails in their sequence.
create index if not exists idx_tenants_welcome_step
  on tenants(welcome_step)
  where welcome_step < 4;
