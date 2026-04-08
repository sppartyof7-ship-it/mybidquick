-- Follow-up email tracking table
-- Created: 2026-04-08
-- Purpose: Prevents duplicate sends, enables reporting on follow-up performance

CREATE TABLE IF NOT EXISTS follow_up_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,          -- matches followUp[].id from tenant config
  step_index INT NOT NULL,        -- 0-based position in the sequence
  delay_days INT NOT NULL,        -- days after lead creation
  type TEXT NOT NULL DEFAULT 'email',  -- 'email' or 'sms' (sms future)
  subject TEXT,                   -- email subject line sent
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent' or 'failed'
  error TEXT,                     -- error message if failed
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, step_id)        -- one send per step per lead
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_logs_lead_step ON follow_up_logs(lead_id, step_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_logs_tenant ON follow_up_logs(tenant_id, sent_at);

-- RLS
ALTER TABLE follow_up_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants see own follow-up logs"
  ON follow_up_logs FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Service role full access on follow_up_logs"
  ON follow_up_logs FOR ALL
  USING (true)
  WITH CHECK (true);
