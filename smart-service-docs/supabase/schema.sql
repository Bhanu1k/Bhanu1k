-- Smart Service Docs: run once in Supabase SQL editor.
-- Then Authentication > Users > "Add user" (your email + password) and disable public sign-ups.

create table if not exists sd_settings (
  owner uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  company jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists sd_customers (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  address text not null default '',
  phone text not null default '',
  unique (owner, name)
);

create table if not exists sd_items (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null,
  uom text not null default 'NOS',
  rate numeric not null default 0,
  unique (owner, description)
);

create table if not exists sd_documents (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null check (type in ('quotation','challan')),
  number text not null,
  doc_date date not null,
  customer_name text not null default '',
  total numeric not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner, type, number)
);

alter table sd_settings  enable row level security;
alter table sd_customers enable row level security;
alter table sd_items     enable row level security;
alter table sd_documents enable row level security;

create policy "own settings"  on sd_settings  for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own customers" on sd_customers for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own items"     on sd_items     for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own documents" on sd_documents for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
