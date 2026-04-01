-- ============================================================================
-- MyBidQuick Billing Schema (Stripe Per-Lead Billing)
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER the main schema.sql
-- ============================================================================

-- Add billing columns to tenants table
alter table tenants add column if not exists stripe_customer_id text;
alter table tenants add column if not exists lead_credits integer default 3;
alter table tenants add column if not exists lead_price_cents integer default 500;
alter table tenants add column if not exists billing_active boolean default false;

-- Lead credits = 3 free leads to start (trial), then they buy packs

-- LEAD_CHARGES TABLE — tracks every per-lead charge
create table if not exists lead_charges (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  amount_cents integer not null,
  stripe_payment_intent_id text,
  status text default 'charged' check (status in ('charged', 'refunded', 'free')),
  created_at timestamptz default now()
);

-- CREDIT_PURCHASES TABLE — tracks lead credit pack purchases
create table if not exists credit_purchases (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  stripe_session_id text,
  stripe_payment_intent_id text,
  credits_purchased integer not null,
  amount_cents integer not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_lead_charges_tenant on lead_charges(tenant_id);
create index if not exists idx_credit_purchases_tenant on credit_purchases(tenant_id);
create index if not exists idx_tenants_stripe on tenants(stripe_customer_id);

-- RLS policies (open for now, same as main schema)
alter table lead_charges enable row level security;
alter table credit_purchases enable row level security;

create policy "Allow public read on lead_charges"
  on lead_charges for select using (true);
create policy "Allow public insert on lead_charges"
  on lead_charges for insert with check (true);

create policy "Allow public read on credit_purchases"
  on credit_purchases for select using (true);
create policy "Allow public insert on credit_purchases"
  on credit_purchases for insert with check (true);
create policy "Allow public update on credit_purchases"
  on credit_purchases for update using (true);

-- Give the demo Cloute Cleaning tenant 3 free trial leads
update tenants set lead_credits = 3 where email = 'tim.sullivan@clouteinc.com';
update tenants set lead_credits = 3 where email = 'noah@cornerstoneexterior.com';
