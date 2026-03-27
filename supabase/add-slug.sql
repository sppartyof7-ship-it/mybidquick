-- ============================================================================
-- Add slug column to tenants table
-- ============================================================================
-- Run this in the Supabase SQL Editor.
-- The slug is how Cleanbid identifies which tenant to load from a subdomain.
-- Example: slug "cloute-cleaning" â cloute-cleaning.mybidquick.com
-- ============================================================================

-- Add the slug column (nullable at first so existing rows don't break)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug text;

-- Create a unique index on slug (only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE slug IS NOT NULL;

-- Set slugs for existing demo tenants
UPDATE tenants SET slug = 'cloute-cleaning' WHERE email = 'tim@clouteinc.com';
UPDATE tenants SET slug = 'cornerstone-exterior' WHERE email = 'noah@cornerstoneexterior.com';

-- Allow public reads on slug (already covered by existing RLS policy)
-- No changes needed â the "Allow public read on tenants" policy covers SELECT.

-- Helper function: auto-generate slug from business name
-- Usage: SELECT generate_slug('Cloute Cleaning'); â 'cloute-cleaning'
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
