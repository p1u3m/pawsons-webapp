-- Orders belong to a signed-in customer, reserve stock when placed, and carry
-- fulfillment + tracking so customers can follow a shipment.
-- Orders created before this migration have no user_id and never reserved stock.

alter table public.shop_orders
  add column user_id uuid references auth.users(id) on delete set null,
  add column stock_reserved boolean not null default false,
  add column customer_name text check (char_length(customer_name) <= 200),
  add column phone text check (char_length(phone) <= 40),
  add column shipping_address jsonb,
  add column fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled', 'preparing', 'shipped', 'delivered')),
  add column carrier text
    check (carrier in ('thailand_post', 'flash', 'kerry', 'jt', 'other')),
  add column tracking_number text
    check (tracking_number ~ '^[A-Za-z0-9-]{6,40}$'),
  add column shipped_at timestamptz,
  add column delivered_at timestamptz,
  add constraint shop_orders_fulfill_paid_only
    check (fulfillment_status = 'unfulfilled' or status = 'paid'),
  add constraint shop_orders_shipped_has_tracking
    check (fulfillment_status in ('unfulfilled', 'preparing')
      or (carrier is not null and tracking_number is not null));

create index shop_orders_user_created_idx on public.shop_orders (user_id, created_at desc);

-- Customers read their own orders; admins update fulfillment columns only.
create policy shop_orders_owner_read on public.shop_orders for select to authenticated using (
  user_id = (select auth.uid())
);
grant update (fulfillment_status, carrier, tracking_number) on public.shop_orders to authenticated;
create policy shop_orders_admin_update on public.shop_orders for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create policy shop_order_items_owner_read on public.shop_order_items for select to authenticated using (
  exists (select 1 from public.shop_orders o where o.id = order_id and o.user_id = (select auth.uid()))
);

-- Timeline of what happened to an order, written only by the trigger below.
create table public.shop_order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  kind text not null check (kind in ('placed', 'paid', 'canceled', 'preparing', 'shipped', 'delivered', 'tracking_updated')),
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index shop_order_events_order_idx on public.shop_order_events (order_id, created_at);
alter table public.shop_order_events enable row level security;
revoke all on public.shop_order_events from anon, authenticated;
grant select on public.shop_order_events to authenticated;
create policy shop_order_events_read on public.shop_order_events for select to authenticated using (
  exists (select 1 from public.shop_orders o where o.id = order_id and o.user_id = (select auth.uid()))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create or replace function private.shop_orders_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.fulfillment_status is distinct from old.fulfillment_status then
    if new.fulfillment_status = 'shipped' then new.shipped_at := coalesce(old.shipped_at, now()); end if;
    if new.fulfillment_status = 'delivered' then
      new.shipped_at := coalesce(old.shipped_at, now());
      new.delivered_at := now();
    end if;
    if new.fulfillment_status in ('unfulfilled', 'preparing') then
      new.shipped_at := null;
      new.delivered_at := null;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.shop_orders_stamp() from public, anon, authenticated;
create trigger shop_orders_stamp before update on public.shop_orders
for each row execute function private.shop_orders_stamp();

create or replace function private.shop_orders_log()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.shop_order_events (order_id, kind, actor) values (new.id, 'placed', actor);
    return new;
  end if;
  if new.status is distinct from old.status and new.status in ('paid', 'canceled') then
    insert into public.shop_order_events (order_id, kind, actor) values (new.id, new.status, actor);
  end if;
  if new.fulfillment_status is distinct from old.fulfillment_status and new.fulfillment_status <> 'unfulfilled' then
    insert into public.shop_order_events (order_id, kind, actor) values (new.id, new.fulfillment_status, actor);
  elsif new.fulfillment_status = old.fulfillment_status
    and (new.carrier, new.tracking_number) is distinct from (old.carrier, old.tracking_number)
    and new.tracking_number is not null then
    insert into public.shop_order_events (order_id, kind, actor) values (new.id, 'tracking_updated', actor);
  end if;
  return new;
end;
$$;
revoke all on function private.shop_orders_log() from public, anon, authenticated;
create trigger shop_orders_log after insert or update on public.shop_orders
for each row execute function private.shop_orders_log();

-- Atomically reserve stock and create a pending order at catalog prices.
-- items: [{"slug": text, "quantity": int}]. Raises 'unavailable' if any line cannot be sold.
create or replace function public.shop_place_order(p_user_id uuid, p_email text, p_items jsonb)
returns uuid language plpgsql set search_path = '' as $$
declare
  order_id uuid := gen_random_uuid();
  item record;
  product record;
  total integer := 0;
begin
  insert into public.shop_orders (id, user_id, email, total_satang, stock_reserved)
  values (order_id, p_user_id, p_email, 0, true);
  -- Lock rows in a stable order so concurrent checkouts cannot deadlock.
  for item in
    select x.slug, x.quantity
    from jsonb_to_recordset(p_items) as x(slug text, quantity integer)
    order by x.slug
  loop
    update public.shop_products
    set stock_qty = stock_qty - item.quantity
    where slug = item.slug and active and is_test and price_satang >= 100
      and item.quantity between 1 and 10 and stock_qty >= item.quantity
    returning slug, title, price_satang into product;
    if not found then
      raise exception 'unavailable' using errcode = 'P0001', detail = item.slug;
    end if;
    insert into public.shop_order_items (order_id, product_slug, title, unit_price_satang, quantity)
    values (order_id, product.slug, product.title, product.price_satang, item.quantity);
    total := total + product.price_satang * item.quantity;
  end loop;
  if total = 0 then raise exception 'unavailable' using errcode = 'P0001'; end if;
  update public.shop_orders set total_satang = total where id = order_id;
  return order_id;
end;
$$;

-- Cancel a pending order once and give its reserved stock back. Returns false if it was not pending.
create or replace function public.shop_cancel_order(p_order_id uuid)
returns boolean language plpgsql set search_path = '' as $$
declare
  reserved boolean;
begin
  update public.shop_orders set status = 'canceled'
  where id = p_order_id and status = 'pending'
  returning stock_reserved into reserved;
  if not found then return false; end if;
  if reserved then
    update public.shop_products p
    set stock_qty = p.stock_qty + i.quantity
    from public.shop_order_items i
    where i.order_id = p_order_id and i.product_slug = p.slug;
  end if;
  return true;
end;
$$;

revoke all on function public.shop_place_order(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.shop_cancel_order(uuid) from public, anon, authenticated;
grant execute on function public.shop_place_order(uuid, text, jsonb) to service_role;
grant execute on function public.shop_cancel_order(uuid) to service_role;
