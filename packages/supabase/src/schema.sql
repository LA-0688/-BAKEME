-- SUPABASE SCHEMA FOR ARTISANAL BAKERY E-COMMERCE

-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (extends auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    full_name text,
    phone text,
    role text default 'customer' check (role in ('customer', 'admin')),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. PRODUCTS TABLE (bread & pastry catalog)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    image_url text,
    category text not null check (category in ('Sourdough', 'Croissants', 'Patisserie', 'Beverages')),
    stock integer default 0 check (stock >= 0),
    is_available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Helper Function: Check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
end;
$$ language plpgsql security definer;

-- 3. CART ITEMS TABLE (syncs real-time cart state)
create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer default 1 check (quantity > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, product_id)
);

-- Enable RLS on cart_items
alter table public.cart_items enable row level security;

-- 4. ORDERS TABLE (bakery purchases)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete set null,
    status text default 'pending' check (status in ('pending', 'paid', 'preparing', 'completed', 'cancelled')),
    total_amount numeric(10, 2) not null check (total_amount >= 0),
    payment_gateway_order_id text,
    payment_id text,
    delivery_type text default 'pickup' check (delivery_type in ('pickup', 'delivery')),
    delivery_address text,
    scheduled_time timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

-- 5. ORDER ITEMS TABLE (order line items)
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    quantity integer not null check (quantity > 0),
    price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0)
);

-- Enable RLS on order_items
alter table public.order_items enable row level security;


-- ==================== RLS POLICIES ====================

-- --- Profiles Policies ---
create policy "Allow users to read their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Allow users to update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Allow admin to read all profiles"
    on public.profiles for select
    using (public.is_admin());

create policy "Allow admin to update all profiles"
    on public.profiles for update
    using (public.is_admin());

-- --- Products Policies ---
create policy "Allow public read-only access to products"
    on public.products for select
    using (true);

create policy "Allow admins to insert products"
    on public.products for insert
    with check (public.is_admin());

create policy "Allow admins to update products"
    on public.products for update
    using (public.is_admin());

create policy "Allow admins to delete products"
    on public.products for delete
    using (public.is_admin());

-- --- Cart Items Policies ---
create policy "Allow users to read their own cart"
    on public.cart_items for select
    using (auth.uid() = user_id);

create policy "Allow users to insert into their own cart"
    on public.cart_items for insert
    with check (auth.uid() = user_id);

create policy "Allow users to update their own cart items"
    on public.cart_items for update
    using (auth.uid() = user_id);

create policy "Allow users to delete their own cart items"
    on public.cart_items for delete
    using (auth.uid() = user_id);

-- --- Orders Policies ---
create policy "Allow users to read their own orders"
    on public.orders for select
    using (auth.uid() = user_id or public.is_admin());

create policy "Allow users to create their own orders"
    on public.orders for insert
    with check (auth.uid() = user_id);

create policy "Allow admins to update orders"
    on public.orders for update
    using (public.is_admin());

-- --- Order Items Policies ---
create policy "Allow users to read their own order items"
    on public.order_items for select
    using (
        exists (
            select 1 from public.orders
            where id = order_items.order_id 
              and (user_id = auth.uid() or public.is_admin())
        )
    );

create policy "Allow users to insert order items of their own orders"
    on public.order_items for insert
    with check (
        exists (
            select 1 from public.orders
            where id = order_items.order_id 
              and user_id = auth.uid()
        )
    );


-- ==================== AUTOMATIONS & TRIGGERS ====================

-- Automatic profile creation on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, phone, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        new.phone,
        'customer'
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Automatic updated_at timestamps for profiles
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger on_profile_updated
    before update on public.profiles
    for each row execute procedure public.handle_update_timestamp();
