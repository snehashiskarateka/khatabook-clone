-- Khatabook Clone Database Schema
-- Run this in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- Parties (Customers / Suppliers)
create table if not exists parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  gstin text,
  address text,
  state text,
  type text check (type in ('customer', 'supplier')) default 'customer',
  created_at timestamptz default now(),
  user_id uuid references auth.users on delete cascade
);

-- Products (Product Master)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text default 'pcs',
  rate numeric default 0,
  hsn_code text,
  gst_rate numeric default 0,
  created_at timestamptz default now(),
  user_id uuid references auth.users on delete cascade
);

-- Transactions (Ledger entries)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  party_id uuid references parties on delete cascade,
  amount numeric not null default 0,
  type text check (type in ('gave', 'got')) not null,
  date date default current_date,
  note text,
  bill_no text,
  created_at timestamptz default now(),
  user_id uuid references auth.users on delete cascade
);

-- Invoices (Billing)
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  party_id uuid references parties on delete cascade,
  date date default current_date,
  due_date date,
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  cgst numeric default 0,
  sgst numeric default 0,
  igst numeric default 0,
  total numeric default 0,
  status text check (status in ('draft', 'sent', 'paid', 'cancelled')) default 'draft',
  notes text,
  created_at timestamptz default now(),
  user_id uuid references auth.users on delete cascade
);

-- Indexes
create index if not exists idx_parties_user on parties(user_id);
create index if not exists idx_transactions_party on transactions(party_id);
create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_invoices_party on invoices(party_id);
create index if not exists idx_invoices_user on invoices(user_id);

-- Enable Row Level Security
alter table parties enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;
alter table invoices enable row level security;

-- Policies (Owner + Father share the same user_id via auth)
create policy "Users can manage their own parties"
  on parties for all using (auth.uid() = user_id);

create policy "Users can manage their own products"
  on products for all using (auth.uid() = user_id);

create policy "Users can manage their own transactions"
  on transactions for all using (auth.uid() = user_id);

create policy "Users can manage their own invoices"
  on invoices for all using (auth.uid() = user_id);