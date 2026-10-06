-- Discount codes for the shop.
--
-- Admins create codes (percent or fixed baht, optional expiry, optional total use
-- limit). Customers enter a code in the cart; the server validates it and the
-- order stores the discount. A use is counted when the order is placed (like
-- stock) and given back when a pending order is canceled or expires.

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),
  kind text not null check (kind in ('percent', 'fixed')),
  -- percent: 1-100. fixed: satang (so 5000 = 50 baht).
  value integer not null check (value > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint discount_codes_percent_range check (kind <> 'percent' or value <= 100),
  constraint discount_codes_used_within_max check (max_uses is null or used_count <= max_uses)
);

alter table public.discount_codes enable row level security;
revoke all on public.discount_codes from anon, authenticated;
grant select on public.discount_codes to authenticated;
grant insert (code, kind, value, max_uses, expires_at, active) on public.discount_codes to authenticated;
-- The code, its value and its use count are fixed once created.
grant update (active, expires_at, max_uses) on public.discount_codes to authenticated;
grant delete on public.discount_codes to authenticated;

create policy discount_codes_admin_read on public.discount_codes
  for select to authenticated using ((select private.is_admin()));
create policy discount_codes_admin_insert on public.discount_codes
  for insert to authenticated with check ((select private.is_admin()));
create policy discount_codes_admin_update on public.discount_codes
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
-- Only a code nobody has used can be deleted; otherwise switch it off.
create policy discount_codes_admin_delete on public.discount_codes
  for delete to authenticated using ((select private.is_admin()) and used_count = 0);

-- What each order recorded.
alter table public.shop_orders
  add column subtotal_satang integer check (subtotal_satang >= 0),
  add column discount_satang integer not null default 0 check (discount_satang >= 0),
  add column discount_code text,
  add column discount_code_id uuid references public.discount_codes (id) on delete set null;
create index shop_orders_discount_code_idx on public.shop_orders (discount_code_id);

-- Discount for a subtotal. Never takes the payable amount below 10 baht
-- (Stripe's minimum charge).
create function public.shop_discount_amount(p_kind text, p_value integer, p_subtotal integer)
returns integer language sql immutable set search_path = '' as $$
  select greatest(0, least(
    case p_kind when 'percent' then (p_subtotal::bigint * p_value / 100)::integer else p_value end,
    p_subtotal - 1000
  ));
$$;

-- Price a cart with a code without reserving anything (for the cart preview).
-- Raises 'invalid_code' when the code is unknown, off, expired or used up.
create function public.shop_quote_discount(p_code text, p_items jsonb)
returns table (subtotal_satang integer, discount_satang integer, total_satang integer, code text)
language plpgsql stable set search_path = '' as $$
declare
  dc record;
  sub integer;
begin
  select coalesce(sum(p.price_satang * x.quantity), 0)::integer into sub
  from jsonb_to_recordset(p_items) as x(slug text, quantity integer)
  join public.shop_products p
    on p.slug = x.slug and p.active and p.is_test and p.price_satang >= 100
  where x.quantity between 1 and 10;

  select d.code, d.kind, d.value into dc
  from public.discount_codes d
  where d.code = upper(btrim(p_code)) and d.active
    and (d.expires_at is null or d.expires_at > now())
    and (d.max_uses is null or d.used_count < d.max_uses);
  if not found then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  return query select sub,
    public.shop_discount_amount(dc.kind, dc.value, sub),
    sub - public.shop_discount_amount(dc.kind, dc.value, sub),
    dc.code;
end;
$$;

-- shop_place_order now takes an optional code.
drop function public.shop_place_order(uuid, text, jsonb);
create function public.shop_place_order(p_user_id uuid, p_email text, p_items jsonb, p_code text default null)
returns uuid language plpgsql set search_path = '' as $$
declare
  order_id uuid := gen_random_uuid();
  item record;
  product record;
  total integer := 0;
  discount integer := 0;
  v_code_id uuid;
  v_code text;
  v_kind text;
  v_value integer;
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

  if nullif(btrim(coalesce(p_code, '')), '') is not null then
    update public.discount_codes d
    set used_count = d.used_count + 1
    where d.code = upper(btrim(p_code)) and d.active
      and (d.expires_at is null or d.expires_at > now())
      and (d.max_uses is null or d.used_count < d.max_uses)
    returning d.id, d.code, d.kind, d.value into v_code_id, v_code, v_kind, v_value;
    if not found then
      raise exception 'invalid_code' using errcode = 'P0001';
    end if;
    discount := public.shop_discount_amount(v_kind, v_value, total);
  end if;

  update public.shop_orders
  set total_satang = total - discount,
      subtotal_satang = total,
      discount_satang = discount,
      discount_code = v_code,
      discount_code_id = v_code_id
  where id = order_id;
  return order_id;
end;
$$;

-- Cancel a pending order once; give back its stock and its code use.
create or replace function public.shop_cancel_order(p_order_id uuid)
returns boolean language plpgsql set search_path = '' as $$
declare
  reserved boolean;
  v_code_id uuid;
begin
  update public.shop_orders set status = 'canceled'
  where id = p_order_id and status = 'pending'
  returning stock_reserved, discount_code_id into reserved, v_code_id;
  if not found then return false; end if;
  if reserved then
    update public.shop_products p
    set stock_qty = p.stock_qty + i.quantity
    from public.shop_order_items i
    where i.order_id = p_order_id and i.product_slug = p.slug;
  end if;
  if v_code_id is not null then
    update public.discount_codes
    set used_count = greatest(used_count - 1, 0)
    where id = v_code_id;
  end if;
  return true;
end;
$$;

revoke all on function public.shop_discount_amount(text, integer, integer) from public, anon, authenticated;
revoke all on function public.shop_quote_discount(text, jsonb) from public, anon, authenticated;
revoke all on function public.shop_place_order(uuid, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.shop_cancel_order(uuid) from public, anon, authenticated;
grant execute on function public.shop_discount_amount(text, integer, integer) to service_role;
grant execute on function public.shop_quote_discount(text, jsonb) to service_role;
grant execute on function public.shop_place_order(uuid, text, jsonb, text) to service_role;
grant execute on function public.shop_cancel_order(uuid) to service_role;
