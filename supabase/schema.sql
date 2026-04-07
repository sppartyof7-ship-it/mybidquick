-- ============================================================================
-- MyBidQuick Database Schema
-- ============================================================================
-- Run this in the Supabase SQL Editor to set up your database.
-- Dashboard: https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================================

-- TENANTS TABLE
-- Each row is a cleaning company that uses MyBidQuick
create table if not exists tenants (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  owner_name text,
  email text unique not null,
  phone text,
  city text,
  state text,
  website text,
  plan text default 'starter' check (plan in ('starter', 'growth', 'pro')),
  logo_url text,
  slug text,
  primary_color text default '#3b82f6',
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LEADS TABLE
-- Each row is a customer who requested a quote from a tenant
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  services jsonb default '[]'::jsonb,
  package text,
  source text,
  total numeric(10,2) default 0,
  status text default 'new' check (status in ('new', 'contacted', 'scheduled', 'won', 'lost')),
  notes text,
  photos jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES for faster lookups
create index if not exists idx_tenants_email on tenants(email);
create unique index if not exists idx_tenants_slug on tenants(slug) where slug is not null;
create index if not exists idx_leads_tenant_id on leads(tenant_id);
create index if not exists idx_leads_status on leads(status);

-- ROW LEVEL SECURITY (RLS)
-- This makes sure tenants can only see their own data
alter table tenants enable row level security;
alter table leads enable row level security;

-- For now, allow all operations via the anon key (public access).
-- In Phase 2.5, we'll add proper auth and lock these down.
create policy "Allow public read on tenants"
  on tenants for select
  using (true);

create policy "Allow public insert on tenants"
  on tenants for insert
  with check (true);

create policy "Allow public update on tenants"
  on tenants for update
  using (true);

create policy "Allow public read on leads"
  on leads for select
  using (true);

create policy "Allow public insert on leads"
  on leads for insert
  with check (true);

create policy "Allow public update on leads"
  on leads for update
  using (true);

-- SEED DATA: Add the two demo tenants
insert into tenants (id, business_name, owner_name, email, phone, city, state, plan, slug, config) values
  (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'Cloute Cleaning',
    'Tim Sullivan',
    'tim.sullivan@clouteinc.com',
    '(608) 555-0001',
    'Madison',
    'WI',
    'pro',
    'cloute-cleaning',
    '{
      "businessName": "Cloute Cleaning",
      "adminPassword": "",
      "priceAdjustment": 0,
      "packages": {
        "basic": {"multiplier": 1, "tagline": "Best for single services"},
        "standard": {"multiplier": 1.35, "tagline": "Most popular choice"},
        "premium": {"multiplier": 1.75, "tagline": "Complete solution"}
      },
      "bundleDiscounts": {"twoServices": 10, "threeServices": 15},
      "services": [
        {"id": "house_washing", "name": "House Washing", "enabled": true, "basePrice": 150, "perSqFt": 0.15, "perWindow": 0, "perLinFt": 0, "extras": [{"label": "Patio/Porch", "price": 75}, {"label": "Detached Garage", "price": 120}, {"label": "Aluminum Siding", "price": 75}, {"label": "EIFS/Stucco/Wood", "price": 100}]},
        {"id": "window_cleaning", "name": "Window Cleaning", "enabled": true, "basePrice": 0, "perSqFt": 0, "perWindow": 8, "perLinFt": 0, "extras": []},
        {"id": "deck_cleaning", "name": "Deck Cleaning", "enabled": true, "basePrice": 175, "perSqFt": 0.25, "perWindow": 0, "perLinFt": 0, "extras": [{"label": "Railing", "price": 65}, {"label": "Stairs", "price": 45}]},
        {"id": "concrete_cleaning", "name": "Concrete Cleaning", "enabled": true, "basePrice": 125, "perSqFt": 0.12, "perWindow": 0, "perLinFt": 0, "extras": [{"label": "Sealing", "price": 200}, {"label": "Oil Stain", "price": 50}, {"label": "Edging", "price": 40}]},
        {"id": "roof_cleaning", "name": "Roof Cleaning", "enabled": true, "basePrice": 250, "perSqFt": 0.18, "perWindow": 0, "perLinFt": 0, "extras": [{"label": "Moss Treatment", "price": 150}, {"label": "Chimney", "price": 75}, {"label": "Solar Panels", "price": 100}]},
        {"id": "gutter_cleaning", "name": "Gutter Cleaning", "enabled": true, "basePrice": 125, "perSqFt": 0, "perWindow": 0, "perLinFt": 1.5, "extras": [{"label": "Downspout Clearing", "price": 65}, {"label": "Whitening", "price": 120}]},
        {"id": "gutter_guard", "name": "Gutter Guard Install", "enabled": true, "basePrice": 0, "perSqFt": 0, "perWindow": 0, "perLinFt": 14.99, "extras": [{"label": "Basic", "price": 14.99}, {"label": "With Cleaning", "price": 19.99}, {"label": "Full Service", "price": 24.99}]}
      ],
      "bundles": [{"id": "spring-refresh", "name": "Spring Refresh Bundle", "discount": 15, "endDate": "2026-05-31", "tagline": "Get your home spring-ready", "active": true, "services": ["house_washing", "window_cleaning", "gutter_cleaning"]}],
      "marketing": {"urgencyTimer": {"enabled": false, "message": "Limited time offer expires soon!", "endDate": "2026-04-30"}, "socialProof": {"enabled": false, "count": 500}, "limitedOffer": {"enabled": false, "text": "Book by March 31st and save 20%"}, "reviewBadge": {"enabled": false, "count": 200, "rating": 4.8}},
      "followUp": [
        {"id": "fu-1", "delay": 0, "type": "email", "subject": "Your Quote is Ready!", "body": "Hi {{name}},\n\nYour {{services}} quote is {{total}}.\n\nLook forward to helping {{business}}!", "active": true},
        {"id": "fu-2", "delay": 2, "type": "sms", "subject": "", "body": "Hi {{name}}! Just checking in on your {{services}} quote. Reply with any questions!", "active": true},
        {"id": "fu-3", "delay": 5, "type": "email", "subject": "Ready to Book?", "body": "Hi {{name}},\n\nYour {{services}} project is waiting. Lets get started!\n\nTotal: {{total}}", "active": true},
        {"id": "fu-4", "delay": 14, "type": "email", "subject": "Last Chance!", "body": "Hi {{name}},\n\nThis offer wont last much longer. Book your {{services}} service today!", "active": false}
      ],
      "leadSources": ["Google", "Facebook", "Referral", "Direct"],
      "leadEmail": "leads@example.com",
      "web3formsKey": "your-web3forms-key"
    }'::jsonb
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'Cornerstone Exterior',
    'Noah Baldry',
    'noah@cornerstoneexterior.com',
    '(608) 555-0002',
    'Madison',
    'WI',
    'growth',
    'cornerstone-exterior',
    '{
      "businessName": "Cornerstone Exterior",
      "adminPassword": "",
      "priceAdjustment": 0,
      "packages": {
        "basic": {"multiplier": 1, "tagline": "Best for single services"},
        "standard": {"multiplier": 1.35, "tagline": "Most popular choice"},
        "premium": {"multiplier": 1.75, "tagline": "Complete solution"}
      },
      "bundleDiscounts": {"twoServices": 10, "threeServices": 15},
      "services": [
        {"id": "house_washing", "name": "House Washing", "enabled": true, "basePrice": 150, "perSqFt": 0.15, "perWindow": 0, "perLinFt": 0, "extras": []},
        {"id": "window_cleaning", "name": "Window Cleaning", "enabled": true, "basePrice": 0, "perSqFt": 0, "perWindow": 8, "perLinFt": 0, "extras": []},
        {"id": "gutter_cleaning", "name": "Gutter Cleaning", "enabled": true, "basePrice": 125, "perSqFt": 0, "perWindow": 0, "perLinFt": 1.5, "extras": []}
      ],
      "bundles": [],
      "marketing": {"urgencyTimer": {"enabled": false}, "socialProof": {"enabled": false}, "limitedOffer": {"enabled": false}, "reviewBadge": {"enabled": false}},
      "followUp": [],
      "leadSources": ["Google", "Referral"],
      "leadEmail": "",
      "web3formsKey": ""
    }'::jsonb
  )
on conflict (email) do nothing;

-- SEED: Demo leads for Cloute Cleaning
insert into leads (tenant_id, name, email, phone, services, package, source, total, status, notes) values
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Sarah Johnson', 'sarah@example.com', '(608) 555-0123', '["House Washing", "Window Cleaning"]'::jsonb, 'Premium', 'Google', 850, 'pending', 'Interested in spring cleaning special'),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Michael Chen', 'michael@example.com', '(608) 555-0456', '["House Washing"]'::jsonb, 'Basic', 'Referral', 350, 'won', 'Paid in full'),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Jennifer Davis', 'jen@example.com', '(608) 555-0789', '["Gutter Cleaning", "Roof Cleaning"]'::jsonb, 'Standard', 'Facebook', 520, 'pending', 'Waiting on property inspection')
on conflict do nothing;
