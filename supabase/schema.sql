-- ================================================================
-- Gestion Comercial - Esquema y RLS
-- ================================================================

create extension if not exists "pgcrypto";

-- Tabla de perfiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'vendedor')),
  nombre_local text not null,
  nombre_persona text not null,
  telefono text,
  created_at timestamptz default now()
);

-- Inventario
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nombre text not null,
  precio_compra numeric(10, 2) not null default 0,
  precio_venta numeric(10, 2) not null default 0,
  stock integer not null default 0,
  created_at timestamptz default now()
);

-- Ventas
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  total_usd numeric(10, 2) not null default 0,
  total_bs numeric(10, 2) not null default 0,
  moneda_usada text not null check (moneda_usada in ('USD', 'BS')),
  tasa_bs numeric(10, 2) not null default 0,
  fecha timestamptz not null default now()
);

-- Detalle de ventas
create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  inventory_id uuid not null references inventory(id) on delete restrict,
  cantidad integer not null,
  precio_unitario numeric(10, 2) not null
);

-- Facturas
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_inventory_user on inventory(user_id);
create index if not exists idx_sales_user on sales(user_id);
create index if not exists idx_sale_items_sale on sale_items(sale_id);
create index if not exists idx_invoices_user on invoices(user_id);

-- RLS
alter table profiles enable row level security;
alter table inventory enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table invoices enable row level security;

-- Policies para profiles (solo propio perfil)
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- Policies para inventory
create policy "inventory_select_own" on inventory
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "inventory_insert_own" on inventory
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "inventory_update_own" on inventory
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  ) with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "inventory_delete_own" on inventory
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

-- Policies para sales
create policy "sales_select_own" on sales
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "sales_insert_own" on sales
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "sales_update_own" on sales
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  ) with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "sales_delete_own" on sales
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

-- Policies para sale_items (por la venta del usuario)
create policy "sale_items_select_own" on sale_items
  for select using (
    exists (
      select 1 from sales s
      join profiles p on p.id = s.user_id
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
        and p.role = 'vendedor'
    )
  );

create policy "sale_items_insert_own" on sale_items
  for insert with check (
    exists (
      select 1 from sales s
      join profiles p on p.id = s.user_id
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
        and p.role = 'vendedor'
    )
  );

create policy "sale_items_update_own" on sale_items
  for update using (
    exists (
      select 1 from sales s
      join profiles p on p.id = s.user_id
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
        and p.role = 'vendedor'
    )
  )
  with check (
    exists (
      select 1 from sales s
      join profiles p on p.id = s.user_id
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
        and p.role = 'vendedor'
    )
  );

create policy "sale_items_delete_own" on sale_items
  for delete using (
    exists (
      select 1 from sales s
      join profiles p on p.id = s.user_id
      where s.id = sale_items.sale_id
        and s.user_id = auth.uid()
        and p.role = 'vendedor'
    )
  );

-- Policies para invoices
create policy "invoices_select_own" on invoices
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "invoices_insert_own" on invoices
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "invoices_update_own" on invoices
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  ) with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "invoices_delete_own" on invoices
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );
