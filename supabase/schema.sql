-- ==============================================================================
-- LOCAL STORE DIGITAL CATALOGUE PLATFORM
-- Database Schema, Tables, Public View, RLS Policies & Seed Data
-- Run this entire script in Supabase SQL Editor (Green "Run" button)
-- ==============================================================================

-- 1. Create STORES table
create table if not exists public.stores (
  id text primary key,
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
  id text primary key,
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
  id text primary key,
  store_id text not null references public.stores(id) on delete cascade,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  brand text,
  pack_size text,
  mrp numeric(10,2) not null,
  cost_price numeric(10,2), -- PRIVATE: Admin / Owner only
  selling_price numeric(10,2) not null,
  is_available boolean default true,
  is_featured boolean default false,
  image_url text,
  description text,
  keywords text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Basic Indexes
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_available on public.products(is_available);
create index if not exists idx_categories_store_id on public.categories(store_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Drop existing policies if any to prevent duplicate errors
drop policy if exists "Public can read stores" on public.stores;
drop policy if exists "Authenticated users can update stores" on public.stores;
drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Authenticated users can manage categories" on public.categories;
drop policy if exists "Public can read products via safe view" on public.products;
drop policy if exists "Authenticated users have full product access" on public.products;

-- STORES: Anyone can view, Authenticated admin can update
create policy "Public can read stores"
  on public.stores for select
  using (true);

create policy "Authenticated users can update stores"
  on public.stores for all
  to authenticated
  using (true)
  with check (true);

-- CATEGORIES: Anyone can view, Authenticated admin can manage
create policy "Public can read active categories"
  on public.categories for select
  using (true);

create policy "Authenticated users can manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

-- PRODUCTS: Authenticated admins can CRUD all products
create policy "Authenticated users have full product access"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- ==============================================================================
-- 5. SECURE PUBLIC CUSTOMER VIEW (no cost_price or profit exposed)
-- ==============================================================================
drop view if exists public.public_store_products;

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

grant select on public.public_store_products to anon, authenticated;

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION (for product & shop photos)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('store-media', 'store-media', true)
on conflict (id) do nothing;

drop policy if exists "Public Access to Store Media" on storage.objects;
drop policy if exists "Authenticated users can upload Store Media" on storage.objects;

create policy "Public Access to Store Media"
  on storage.objects for select
  using (bucket_id = 'store-media');

create policy "Authenticated users can upload Store Media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'store-media')
  with check (bucket_id = 'store-media');

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

-- Categories
insert into public.categories (id, store_id, name, slug, icon, description, display_order) values
('cat_stationery', 'store_saini_001', 'Stationery', 'stationery', '📚', 'Notebooks, pens, pencils, geometry kits & school supplies', 1),
('cat_grocery', 'store_saini_001', 'Grocery', 'grocery', '🛒', 'Daily food grains, pulses, tea, sugar, and flour', 2),
('cat_cold_drinks', 'store_saini_001', 'Cold Drinks', 'cold-drinks', '🥤', 'Chilled soft drinks, juices, energy drinks, and packaged water', 3),
('cat_snacks', 'store_saini_001', 'Snacks', 'snacks', '🍪', 'Crispy biscuits, namkeen, wafers, and instant noodles', 4),
('cat_personal_care', 'store_saini_001', 'Personal Care', 'personal-care', '🧴', 'Soaps, shampoos, toothpaste, skin creams, and hair oils', 5),
('cat_household', 'store_saini_001', 'Household', 'household', '🧹', 'Detergents, floor cleaners, mosquito repellents & dishwash', 6),
('cat_oil_spices', 'store_saini_001', 'Oil & Spices', 'oil-spices', '🛢️', 'Mustard oil, refined cooking oil, turmeric, cumin & garam masala', 7)
on conflict (id) do nothing;

-- Products
insert into public.products (id, store_id, category_id, name, brand, pack_size, mrp, cost_price, selling_price, is_available, is_featured, image_url, description, keywords) values
('prod_001', 'store_saini_001', 'cat_stationery', 'Classmate Notebook', 'Classmate', 'Single Book (172 Pages / Ruled)', 130, 90, 110, true, true, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'Premium quality smooth 172-page ruled single line notebook from Classmate ITC.', 'classmate notebook copy spiral ruled books stationary'),
('prod_002', 'store_saini_001', 'cat_stationery', 'Classmate Long Book', 'Classmate', 'Single Book (240 Pages / Register)', 160, 115, 140, true, false, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', 'Heavy duty register long book suitable for college and school assignments.', 'register long book copy assignment classmate'),
('prod_003', 'store_saini_001', 'cat_stationery', 'Drawing Book', 'Navneet', '40 Pages (Cartridge Paper)', 80, 52, 70, true, false, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80', 'Thick cartridge drawing paper ideal for crayons and sketches.', 'drawing book sketch pad navneet art craft'),
('prod_004', 'store_saini_001', 'cat_stationery', 'Faber-Castell Colour Pencils', 'Faber-Castell', 'Pack of 12 Shades', 120, 84, 105, true, true, 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=600&auto=format&fit=crop&q=80', 'Vibrant triangular color pencils with break-resistant lead.', 'faber castell color pencils drawing colors stationery'),
('prod_005', 'store_saini_001', 'cat_stationery', 'Camlin Gel Pen (Blue)', 'Camlin', 'Pack of 5 Pens', 50, 32, 45, true, false, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', 'Smooth flowing waterproof Japanese ink gel pen.', 'camlin pen gel pen blue ball pen writing'),
('prod_006', 'store_saini_001', 'cat_stationery', 'Doms Zoom Triangle Pencil', 'Doms', 'Pack of 10 with Sharpener & Eraser', 60, 40, 52, true, false, 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80', 'Dark HB graphite pencil with ergonomic triangular grip.', 'doms pencil lead pencil sharpener eraser stationery'),
('prod_007', 'store_saini_001', 'cat_stationery', 'Apsara Non-Dust Eraser', 'Apsara', 'Pack of 5 Erasers', 25, 16, 22, true, false, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'Soft non-dust rubber eraser that leaves minimal residue.', 'apsara eraser rubber stationery pencil'),
('prod_008', 'store_saini_001', 'cat_grocery', 'Tata Tea Premium', 'Tata Tea', '250g Pouch', 160, 130, 145, true, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', 'Desh ki Chai! Perfect blend of medium and large tea leaves.', 'tata tea premium chai patti grocery'),
('prod_009', 'store_saini_001', 'cat_grocery', 'Red Label Tea', 'Brooke Bond', '500g Carton', 280, 232, 255, true, true, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop&q=80', 'Brooke Bond Red Label crafted with select CTC leaves.', 'red label tea brooke bond chai grocery'),
('prod_010', 'store_saini_001', 'cat_grocery', 'Aashirvaad Shudh Chakki Atta', 'Aashirvaad', '5 kg Bag', 260, 220, 242, true, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', '100% whole wheat flour ground using traditional stone chakki.', 'aashirvaad atta wheat flour gehu aata grocery'),
('prod_011', 'store_saini_001', 'cat_cold_drinks', 'Coca-Cola', 'Coca-Cola', '500ml Chilled Bottle', 40, 31, 38, true, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', 'Refreshing carbonated soft drink served chilled straight from our cooler.', 'coca cola coke cold drink soda beverage chilled'),
('prod_012', 'store_saini_001', 'cat_cold_drinks', 'Thums Up Charged', 'Thums Up', '750ml Bottle', 45, 36, 43, true, false, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', 'Taste the Thunder! Intense carbonation and spicy cola kick.', 'thums up cold drink soda beverage'),
('prod_013', 'store_saini_001', 'cat_cold_drinks', 'Frooti Fresh Mango Drink', 'Frooti', '600ml Bottle', 40, 32, 38, false, false, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80', 'Made with real ripe Alphonso mangoes.', 'frooti mango juice beverage cold drink'),
('prod_014', 'store_saini_001', 'cat_snacks', 'Haldiram Bikaneri Bhujia', 'Haldiram', '400g Pouch', 145, 118, 132, true, true, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80', 'Classic Rajasthani authentic spicy moth and besan crispy bhujia sev.', 'haldirams bhujia bikaneri namkeen snacks'),
('prod_015', 'store_saini_001', 'cat_snacks', 'Maggi 2-Minute Masala Noodles', 'Nestle Maggi', 'Pack of 4 (280g)', 60, 48, 55, true, true, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', 'Favorite instant masala noodles made with 10 roasted spices.', 'maggi noodles masala 2 minute snacks nestle'),
('prod_016', 'store_saini_001', 'cat_personal_care', 'Dettol Original Bathing Soap', 'Dettol', 'Buy 4 Get 1 Free (5 x 125g)', 235, 185, 210, true, true, 'https://images.unsplash.com/photo-1607006314605-78e71869e0ee?w=600&auto=format&fit=crop&q=80', 'Trusted antibacterial germ protection formula with pine fragrance.', 'dettol soap bathing personal care germ protection'),
('prod_017', 'store_saini_001', 'cat_personal_care', 'Colgate Strong Teeth Toothpaste', 'Colgate', '300g Saver Saver Pack (2 x 150g)', 190, 150, 170, true, false, 'https://images.unsplash.com/photo-1559567244-49a7a92c3008?w=600&auto=format&fit=crop&q=80', 'Amino Shakti calcium formula that strengthens tooth enamel.', 'colgate toothpaste dental care oral hygiene personal care'),
('prod_018', 'store_saini_001', 'cat_household', 'Surf Excel Quick Wash Detergent Powder', 'Surf Excel', '1 kg Pouch', 155, 125, 142, true, true, 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80', 'Removes tough stains inside the washing machine or bucket.', 'surf excel detergent powder washing clothes household'),
('prod_019', 'store_saini_001', 'cat_oil_spices', 'Fortune Kachi Ghani Mustard Oil', 'Fortune', '1 Litre Pouch', 165, 142, 154, true, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', 'Cold-pressed authentic mustard oil with strong pungency and traditional aroma.', 'fortune sarson tel mustard oil cooking oil spices'),
('prod_020', 'store_saini_001', 'cat_oil_spices', 'MDH Deggi Mirch Powder', 'MDH', '100g Carton', 92, 72, 84, true, false, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', 'Blend of Kashmiri & red chillies gives stunning natural red color.', 'mdh deggi mirch red chilli powder spices masala')
on conflict (id) do nothing;

-- 8. Refresh Supabase Schema Cache
notify pgrst, 'reload schema';
