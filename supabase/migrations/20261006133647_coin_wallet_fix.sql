-- Fix: a spend (negative amount) failed even when the balance was enough,
-- because the balance >= 0 check ran on the row about to be inserted before it
-- was merged with the existing balance. Create the wallet at 0 first, then add
-- the amount with an update (the check then sees the real new balance).

create or replace function private.coin_apply_to_wallet()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coin_wallets (user_id, balance)
  values (new.user_id, 0)
  on conflict (user_id) do nothing;
  update public.coin_wallets
  set balance = balance + new.amount, updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;
