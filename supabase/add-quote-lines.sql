-- Migration: add quote_lines to leads (applied 2026-06-24)
-- Backs the full line-item quote editor in the tenant dashboard.
-- Stores the tenant-edited breakdown behind leads.total so a quote can be
-- rebuilt service-by-service (not just nudged as one number). Internal only —
-- customers never see this column.
--
-- Shape: {"lines":[{"id","label","amount"}], "savedAt": <iso>}

alter table public.leads
  add column if not exists quote_lines jsonb;

comment on column public.leads.quote_lines is
  'Tenant-edited quote breakdown. Shape: {"lines":[{"id","label","amount"}],"savedAt":iso}. When present, this is the line-item composition behind leads.total. NULL = quote was never rebuilt line-by-line. Customer never sees this — internal only.';
