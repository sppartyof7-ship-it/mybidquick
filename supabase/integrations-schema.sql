-- ============================================================================
-- integrations table — multi-provider integration storage
-- Created: 2026-04-07
-- Purpose: Securely store OAuth tokens for tenant integrations
-- Security: RLS enabled, NO policies = zero client access
--           Only service_role_key (server-side) can read/write
-- ============================================================================

CREATE TABLE integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) NOT NULL,
  provider text NOT NULL,  -- 'google_calendar', 'housecall_pro', etc.

  provider_account_id text,   -- unique ID from the provider
  calendar_email text,        -- display-friendly connected account

  access_token_encrypted text,   -- AES-256-GCM encrypted
  refresh_token_encrypted text,  -- AES-256-GCM encrypted
  token_expiry timestamptz,
  scopes text[],                 -- e.g. {'calendar.events'}

  status text DEFAULT 'connected',  -- connected | disconnected | expired

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(tenant_id, provider)
);

-- RLS: deny ALL client access. Only service_role_key can read/write.
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. service_role_key bypasses RLS.

-- Index for fast lookups
CREATE INDEX idx_integrations_tenant_provider ON integrations(tenant_id, provider);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- ============================================================================
-- ROLLBACK (if needed):
-- DROP TRIGGER IF EXISTS integrations_updated_at ON integrations;
-- DROP FUNCTION IF EXISTS update_integrations_updated_at();
-- DROP TABLE IF EXISTS integrations;
-- ============================================================================
