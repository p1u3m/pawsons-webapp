-- Fulfillment ends at "shipped": the shop cannot see delivery, customers follow the tracking number.

create or replace function private.shop_orders_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.fulfillment_status is distinct from old.fulfillment_status then
    if new.fulfillment_status = 'shipped' then new.shipped_at := coalesce(old.shipped_at, now()); end if;
    if new.fulfillment_status in ('unfulfilled', 'preparing') then new.shipped_at := null; end if;
  end if;
  return new;
end;
$$;

alter table public.shop_orders
  drop column delivered_at,
  drop constraint shop_orders_fulfillment_status_check,
  add constraint shop_orders_fulfillment_status_check
    check (fulfillment_status in ('unfulfilled', 'preparing', 'shipped'));

alter table public.shop_order_events
  drop constraint shop_order_events_kind_check,
  add constraint shop_order_events_kind_check
    check (kind in ('placed', 'paid', 'canceled', 'preparing', 'shipped', 'tracking_updated'));
