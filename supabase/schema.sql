-- ==========================================================
--  misremates.com.mx — Supabase Database Schema
-- ==========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ==========================================================
-- USERS (extiende auth.users de Supabase)
-- ==========================================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'seller' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admin can view all users" on public.users
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Auto-create user on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================================
-- SELLER PROFILES
-- ==========================================================
create table public.seller_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  display_name text not null,
  phone text,
  city text,
  state text,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.seller_profiles enable row level security;

create policy "Sellers can manage own profile" on public.seller_profiles
  for all using (auth.uid() = user_id);

create policy "Public can view seller profiles" on public.seller_profiles
  for select using (true);

-- ==========================================================
-- PLANS
-- ==========================================================
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique check (name in ('free', 'basico', 'pro', 'premium')),
  monthly_price numeric(10,2) not null default 0,
  product_limit integer,
  max_total_inventory_value numeric(12,2),
  commission_percentage numeric(5,2) not null default 0,
  stripe_price_id text,
  features jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "Plans are publicly readable" on public.plans
  for select using (true);

-- Seed plans
insert into public.plans (name, monthly_price, product_limit, max_total_inventory_value, commission_percentage, features) values
  ('free',    0,   3,     null,    0,   '["3 productos", "Tienda pública", "WhatsApp"]'),
  ('basico',  99,  10,    1000,    8,   '["10 productos", "Valor max $1,000 MXN", "8% comisión", "WhatsApp"]'),
  ('pro',     299, 30,    30000,   5,   '["30 productos", "Valor max $30,000 MXN", "5% comisión", "Pagos en línea"]'),
  ('premium', 699, null,  null,    2.5, '["Ilimitados", "Sin límite valor", "2.5% comisión", "Pagos en línea", "Destacados", "Analytics"]');

-- ==========================================================
-- SUBSCRIPTIONS
-- ==========================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid references public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Service role can manage subscriptions" on public.subscriptions
  for all using (true);

-- ==========================================================
-- STORES
-- ==========================================================
create table public.stores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  seller_profile_id uuid references public.seller_profiles(id),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'paused', 'suspended')),
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;

create index idx_stores_slug on public.stores(slug);
create index idx_stores_user_id on public.stores(user_id);

create policy "Owners can manage own store" on public.stores
  for all using (auth.uid() = user_id);

create policy "Public can view active stores" on public.stores
  for select using (status = 'active');

-- ==========================================================
-- PRODUCTS
-- ==========================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price > 0),
  category text not null,
  condition text not null check (condition in ('nuevo', 'como_nuevo', 'buen_estado', 'usado')),
  images text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'active', 'sold', 'paused')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create index idx_products_store_id on public.products(store_id);
create index idx_products_user_id on public.products(user_id);
create index idx_products_status on public.products(status);
create index idx_products_slug on public.products(slug);

create policy "Owners can manage own products" on public.products
  for all using (auth.uid() = user_id);

create policy "Public can view active products" on public.products
  for select using (status = 'active');

-- ==========================================================
-- ORDERS
-- ==========================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_email text not null,
  buyer_name text not null,
  product_id uuid not null references public.products(id),
  seller_user_id uuid not null references public.users(id),
  store_id uuid not null references public.stores(id),
  amount numeric(12,2) not null,
  platform_fee numeric(12,2) not null default 0,
  seller_amount numeric(12,2) not null,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Sellers can view own orders" on public.orders
  for select using (auth.uid() = seller_user_id);

create policy "Service role can manage orders" on public.orders
  for all using (true);

-- ==========================================================
-- PAYMENTS
-- ==========================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id),
  amount numeric(12,2),
  platform_fee numeric(12,2),
  seller_amount numeric(12,2),
  stripe_charge_id text,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Service role can manage payments" on public.payments
  for all using (true);

-- ==========================================================
-- STORAGE BUCKETS
-- ==========================================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Anyone can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Users can delete own product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);
