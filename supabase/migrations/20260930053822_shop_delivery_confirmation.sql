-- Recorded from the project's migration history: this was applied to Supabase
-- but never committed. Everything it creates (the confirm functions and the
-- hourly auto-confirm job) is removed again by 20260930071253_shop_drop_delivered.

create or replace function public.shop_confirm_delivery(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.shop_orders
  set fulfillment_status = 'delivered'
  where id = p_order_id
    and user_id = (select auth.uid())
    and status = 'paid'
    and fulfillment_status = 'shipped';
  return found;
end;
$$;
revoke all on function public.shop_confirm_delivery(uuid) from public, anon;
grant execute on function public.shop_confirm_delivery(uuid) to authenticated;

create or replace function private.shop_auto_confirm_delivery()
returns integer language plpgsql set search_path = '' as $$
declare
  closed integer;
begin
  update public.shop_orders
  set fulfillment_status = 'delivered'
  where status = 'paid'
    and fulfillment_status = 'shipped'
    and shipped_at < now() - interval '7 days';
  get diagnostics closed = row_count;
  return closed;
end;
$$;
revoke all on function private.shop_auto_confirm_delivery() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'shop-auto-confirm-delivery',
  '0 * * * *',
  $$select private.shop_auto_confirm_delivery()$$
);
