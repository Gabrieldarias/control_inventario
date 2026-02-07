-- ================================================================
-- Gestion Comercial - Esquema y RLS
-- ================================================================

create extension if not exists "pgcrypto";

-- Tabla de perfiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  nombre_local text not null default 'Mi local',
  nombre_persona text not null default 'Vendedor',
  telefono text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nombre_local, nombre_persona)
  values (
    new.id,
    'vendedor',
    'Mi local',
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'Vendedor')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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

-- Pagos
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  metodo text not null,
  monto_usd numeric(10, 2) not null default 0,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_inventory_user on inventory(user_id);
create index if not exists idx_sales_user on sales(user_id);
create index if not exists idx_sale_items_sale on sale_items(sale_id);
create index if not exists idx_invoices_user on invoices(user_id);
create index if not exists idx_payments_user on payments(user_id);
create index if not exists idx_payments_sale on payments(sale_id);

-- RLS
alter table profiles enable row level security;
alter table inventory enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

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

-- Policies para payments
create policy "payments_select_own" on payments
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "payments_insert_own" on payments
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

create policy "payments_update_own" on payments
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

create policy "payments_delete_own" on payments
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'vendedor'
    )
  );

-- RPC: registrar venta y actualizar stock de forma atomica
create or replace function public.process_sale(
  p_items jsonb,
  p_total_usd numeric,
  p_total_bs numeric,
  p_tasa numeric,
  p_moneda text,
  p_pagos jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_inventory_id uuid;
  v_cantidad integer;
  v_precio_unitario numeric(10, 2);
  v_pago jsonb;
  v_metodo text;
  v_monto numeric(10, 2);
  v_items jsonb := coalesce(p_items, '[]'::jsonb);
  v_pagos jsonb := coalesce(p_pagos, '[]'::jsonb);
  v_total_pagos numeric := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'Items invalidos';
  end if;

  if p_moneda not in ('USD', 'BS') then
    raise exception 'Moneda invalida';
  end if;

  select coalesce(sum((value->>'monto_usd')::numeric), 0)
  into v_total_pagos
  from jsonb_array_elements(v_pagos) as value;

  if v_total_pagos <= 0 then
    raise exception 'Pagos invalidos';
  end if;

  if abs(v_total_pagos - p_total_usd) > 0.01 then
    raise exception 'La suma de pagos no coincide con el total';
  end if;

  insert into sales (user_id, total_usd, total_bs, moneda_usada, tasa_bs, fecha)
  values (v_user_id, p_total_usd, p_total_bs, p_moneda, p_tasa, now())
  returning id into v_sale_id;

  insert into invoices (sale_id, user_id)
  values (v_sale_id, v_user_id);

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_inventory_id := nullif(v_item->>'id', '')::uuid;
    v_cantidad := coalesce((v_item->>'cantidad')::integer, 0);
    v_precio_unitario := coalesce((v_item->>'precio_unitario')::numeric, 0);

    if v_inventory_id is null or v_cantidad <= 0 or v_precio_unitario < 0 then
      raise exception 'Item invalido';
    end if;

    perform 1
    from inventory
    where id = v_inventory_id
      and user_id = v_user_id
    for update;

    if not found then
      raise exception 'Producto no pertenece al usuario';
    end if;

    insert into sale_items (sale_id, inventory_id, cantidad, precio_unitario)
    values (v_sale_id, v_inventory_id, v_cantidad, v_precio_unitario);

    update inventory
    set stock = stock - v_cantidad
    where id = v_inventory_id
      and user_id = v_user_id;
  end loop;

  for v_pago in select * from jsonb_array_elements(v_pagos)
  loop
    v_metodo := v_pago->>'metodo';
    v_monto := coalesce((v_pago->>'monto_usd')::numeric, 0);

    if v_metodo is null or v_metodo = '' or v_monto <= 0 then
      raise exception 'Pago invalido';
    end if;

    insert into payments (sale_id, user_id, metodo, monto_usd)
    values (v_sale_id, v_user_id, v_metodo, v_monto);
  end loop;

  return v_sale_id;
end;
$$;

grant execute on function public.process_sale(
  jsonb,
  numeric,
  numeric,
  numeric,
  text,
  jsonb
) to authenticated;
