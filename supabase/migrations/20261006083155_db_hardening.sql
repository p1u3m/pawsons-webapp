-- Database hardening from the Oct 2026 review.
--
-- 1. Drop the legacy public.protect_profile_role trigger; private.protect_profile_role
--    (trigger "protect_profile_role") already blocks role changes for API users.
-- 2. profiles were readable by everyone, which leaked every member's role. Now a
--    member reads their own row; admins read all (admin pages).
-- 3. One permissive SELECT policy per table instead of two (admin OR owner/public).
-- 4. Index the unindexed FK shop_order_events.actor.
-- 5. Keep updated_at honest on profiles, contents and shop_products.
--
-- admin_* RPCs stay executable by "authenticated" on purpose: they run with the
-- caller's session and re-check private.is_admin() inside.

-- 1. Legacy duplicate role guard
drop trigger if exists tr_protect_profile_role on public.profiles;
drop function if exists public.protect_profile_role();

-- 2. profiles: own row or admin. A policy cannot query profiles inline for the
--    admin check (infinite recursion), so it calls private.is_admin(), which only
--    ever reports the caller's own status.
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Anyone can view profiles" on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

-- 3. Merge duplicate permissive SELECT policies
drop policy if exists shop_orders_admin_read on public.shop_orders;
drop policy if exists shop_orders_owner_read on public.shop_orders;
create policy shop_orders_read on public.shop_orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists shop_order_items_admin_read on public.shop_order_items;
drop policy if exists shop_order_items_owner_read on public.shop_order_items;
create policy shop_order_items_read on public.shop_order_items
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.shop_orders o
      where o.id = shop_order_items.order_id and o.user_id = (select auth.uid())
    )
  );

drop policy if exists shop_products_admin_read on public.shop_products;
drop policy if exists shop_products_public_read on public.shop_products;
create policy shop_products_read_anon on public.shop_products
  for select to anon using (active);
create policy shop_products_read on public.shop_products
  for select to authenticated using (active or (select private.is_admin()));

-- 4. FK index
create index if not exists shop_order_events_actor_idx
  on public.shop_order_events (actor);

-- 5. updated_at triggers
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

drop trigger if exists touch_updated_at on public.profiles;
create trigger touch_updated_at before update on public.profiles
  for each row execute function private.touch_updated_at();
drop trigger if exists touch_updated_at on public.contents;
create trigger touch_updated_at before update on public.contents
  for each row execute function private.touch_updated_at();
drop trigger if exists touch_updated_at on public.shop_products;
create trigger touch_updated_at before update on public.shop_products
  for each row execute function private.touch_updated_at();
