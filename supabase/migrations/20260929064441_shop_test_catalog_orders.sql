-- Test-only catalog and sandbox orders. Product prices are stored as integer satang.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.protect_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user <> 'service_role' and current_user <> 'postgres' then
    if tg_op = 'INSERT' then
      new.role := 'user';
    elsif new.role is distinct from old.role then
      raise exception 'Profile role cannot be changed by this user';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.protect_profile_role() from public, anon, authenticated;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before insert or update on public.profiles
for each row execute function private.protect_profile_role();

create table public.shop_products (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  kind text not null check (kind in ('sticker', 'postcard')),
  character_type text not null check (character_type ~ '^[A-Z]{4}$'),
  price_satang integer not null check (price_satang >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  active boolean not null default false,
  is_test boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shop_products_visible_idx on public.shop_products (sort_order, slug) where active;
alter table public.shop_products enable row level security;
revoke all on public.shop_products from anon, authenticated;
grant select on public.shop_products to anon, authenticated;
grant insert, update, delete on public.shop_products to authenticated;
create policy shop_products_public_read on public.shop_products for select to anon, authenticated using (active);
create policy shop_products_admin_read on public.shop_products for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_products_admin_insert on public.shop_products for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_products_admin_update on public.shop_products for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_products_admin_delete on public.shop_products for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'canceled')),
  email text,
  total_satang integer not null check (total_satang >= 0),
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index shop_orders_created_idx on public.shop_orders (created_at desc);
alter table public.shop_orders enable row level security;
revoke all on public.shop_orders from anon, authenticated;
grant select on public.shop_orders to authenticated;
create policy shop_orders_admin_read on public.shop_orders for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create table public.shop_order_items (
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_slug text not null references public.shop_products(slug),
  title text not null,
  unit_price_satang integer not null check (unit_price_satang >= 0),
  quantity integer not null check (quantity between 1 and 10),
  primary key (order_id, product_slug)
);
create index shop_order_items_product_idx on public.shop_order_items (product_slug);
alter table public.shop_order_items enable row level security;
revoke all on public.shop_order_items from anon, authenticated;
grant select on public.shop_order_items to authenticated;
create policy shop_order_items_admin_read on public.shop_order_items for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

insert into public.shop_products (slug,title,description,kind,character_type,price_satang,stock_qty,active,is_test,sort_order) values
('infp-sticker','INFP · Sticker','สติกเกอร์เพื่อนตัวน้อยสำหรับแต่งสมุดและของใช้','sticker','INFP',5900,25,true,true,1),
('intp-postcard','INTP · Postcard','โปสการ์ดส่งความคิดถึงในวันสบาย ๆ','postcard','INTP',7900,25,true,true,2),
('esfj-sticker','ESFJ · Sticker','สติกเกอร์เพื่อนตัวน้อยสำหรับแต่งสมุดและของใช้','sticker','ESFJ',5900,25,true,true,3),
('isfj-postcard','ISFJ · Postcard','โปสการ์ดส่งความคิดถึงในวันสบาย ๆ','postcard','ISFJ',7900,25,true,true,4),
('intj-sticker','INTJ · Sticker','สติกเกอร์เพื่อนตัวน้อยสำหรับแต่งสมุดและของใช้','sticker','INTJ',5900,25,true,true,5),
('infj-postcard','INFJ · Postcard','โปสการ์ดส่งความคิดถึงในวันสบาย ๆ','postcard','INFJ',7900,25,true,true,6),
('enfp-sticker','ENFP · Sticker','สติกเกอร์เพื่อนตัวน้อยสำหรับแต่งสมุดและของใช้','sticker','ENFP',5900,25,true,true,7),
('estp-postcard','ESTP · Postcard','โปสการ์ดส่งความคิดถึงในวันสบาย ๆ','postcard','ESTP',7900,25,true,true,8);
