-- Scheduling support: add 'scheduled' status + scheduling preference columns
-- Applied: 2026-04-07

-- Add 'scheduled' to leads status CHECK constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'scheduled', 'won', 'lost'));

-- Add scheduling preference columns (text for simplicity + Google Calendar readiness)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_days text DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_time text DEFAULT NULL;
