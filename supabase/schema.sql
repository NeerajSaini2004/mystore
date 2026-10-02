-- ==============================================================================
-- LOCAL STORE DIGITAL CATALOGUE PLATFORM
-- Multi-Store Architecture, Row Level Security (RLS) & Seed Migration Script
-- ==============================================================================

-- 1. Create STORES table
create table if not exists public.stores (
  id text primary key default ('store_' || substr(md5(random()::text), 1, 10)),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  location text,
  city text default 'Sikar',
  state text default 'Rajasthan',
  pincode text,
  phone text,
  whatsapp text,
  google_maps_url text,
  opening_hours text default '8:00 AM – 9:00 PM',
  is_open boolean default true,
  theme_color text default '#064e3b',
  accent_color text default '#d97706',
  logo_url text,
  hero_image_url text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create CATEGORIES table
create table if not exists public.categories (
  id text primary key default ('cat_' || substr(md5(random()::text), 1, 10)),
  store_id text not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text default '📦',
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Create PRODUCTS table
create table if not exists public.products (
  id text primary key default ('prod_' || substr(md5(random()::text), 1, 10)),
  store_id text not null references public.stores(id) on delete cascade,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  brand text,
  pack_size text,
  mrp numeric(10,2) not null,
  cost_price numeric(10,2), -- PRIVATE: Admin / Owner only, never exposed publicly!
  selling_price numeric(10,2) not null,
  is_available boolean default true,
  is_featured boolean default false,
  image_url text,
  description text,
  keywords text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for lightning fast searches on mobile
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_available on public.products(is_available);
create index if not exists idx_products_name_trgm on public.products using gin (to_tsvector('simple', name || ' ' || coalesce(brand, '') || ' ' || coalesce(keywords, '')));
create index if not exists idx_categories_store_id on public.categories(store_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- STORES: Anyone can view store basic info (for the customer website)
create policy "Stores are viewable by everyone"
  on public.stores for select
  using (true);

-- STORES: Only the store owner can update their store
create policy "Store owners can update their store"
  on public.stores for update
  using (auth.uid() = owner_id);

-- CATEGORIES: Anyone can view active categories
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (is_active = true);

-- CATEGORIES: Store owners can manage categories
create policy "Store owners can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id and s.owner_id = auth.uid()
    )
  );

-- PRODUCTS: Store owners can do full CRUD on their products (including cost_price)
create policy "Store owners have full access to products"
  on public.products for all
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- 5. SECURE PUBLIC CUSTOMER VIEW
-- CRITICAL SECURITY RULE: cost_price and profit MUST NEVER be exposed to customers!
-- Customers query public_store_products instead of raw products table.
-- ==============================================================================
create or replace view public.public_store_products as
select
  p.id,
  p.store_id,
  p.category_id,
  p.name,
  p.brand,
  p.pack_size,
  p.mrp,
  p.selling_price,
  round(((p.mrp - p.selling_price) / nullif(p.mrp, 0)) * 100, 2) as discount_percent,
  p.is_available,
  p.is_featured,
  p.image_url,
  p.description,
  p.keywords,
  c.name as category_name,
  c.icon as category_icon,
  p.created_at
from public.products p
left join public.categories c on p.category_id = c.id;

-- Grant public read access to the sanitized view
grant select on public.public_store_products to anon, authenticated;

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION (for product & shop images)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('store-media', 'store-media', true)
on conflict (id) do nothing;

create policy "Public Access to Store Media"
  on storage.objects for select
  using (bucket_id = 'store-media');

create policy "Authenticated users can upload Store Media"
  on storage.objects for insert
  with check (bucket_id = 'store-media' and auth.role() = 'authenticated');

create policy "Authenticated users can update their Store Media"
  on storage.objects for update
  using (bucket_id = 'store-media' and auth.role() = 'authenticated');

-- ==============================================================================
-- 7. INITIAL SEED DATA FOR SAINI GENERAL STORE, SIKAR
-- ==============================================================================
insert into public.stores (
  id, slug, name, tagline, description, location, city, state, pincode,
  phone, whatsapp, google_maps_url, opening_hours, is_open, theme_color, accent_color,
  logo_url, hero_image_url
) values (
  'store_saini_001',
  'saini-general-store',
  'Saini General Store',
  'Your Everyday Needs, Under One Roof',
  'Your trusted neighborhood store in Sikar. High-quality groceries, student stationery, snacks, packaged drinks, and household supplies at the best local prices.',
  'Station Road, Near Bus Stand, Sikar, Rajasthan',
  'Sikar',
  'Rajasthan',
  '332001',
  '+91 98290 12345',
  '919829012345',
  'https://maps.google.com/?q=Station+Road+Sikar+Rajasthan',
  '8:00 AM – 9:00 PM',
  true,
  '#064e3b',
  '#d97706',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&auto=format&fit=crop&q=80'
) on conflict (id) do nothing;
