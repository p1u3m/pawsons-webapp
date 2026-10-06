-- Coin: a stored-value balance for members (1 Coin = 1 baht).
--
-- coin_transactions is an append-only ledger: every grant or spend is a row.
-- coin_wallets holds each member's balance, kept in step by a trigger on the
-- ledger; the balance can never go below zero. Members read their own rows,
-- admins read all; nothing is written through the API directly. Rewards are
-- written by triggers (signup, first quiz) or by service-role functions (admin).
--
-- Reward amounts live in private.coin_reward() so they are changed in one place.

create table public.coin_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.coin_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- positive = received, negative = spent or removed
  amount integer not null check (amount <> 0 and abs(amount) <= 1000000),
  kind text not null check (
    kind in ('signup', 'quiz', 'admin_grant', 'admin_deduct', 'purchase', 'spend', 'refund')
  ),
  reason text check (char_length(reason) <= 200),
  -- Idempotency key: the same (user, ref) can be recorded only once.
  ref text check (char_length(ref) <= 100),
  actor uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index coin_transactions_user_idx on public.coin_transactions (user_id, created_at desc);
create index coin_transactions_actor_idx on public.coin_transactions (actor);
create unique index coin_transactions_user_ref_key
  on public.coin_transactions (user_id, ref) where ref is not null;

alter table public.coin_wallets enable row level security;
alter table public.coin_transactions enable row level security;
revoke all on public.coin_wallets from anon, authenticated;
revoke all on public.coin_transactions from anon, authenticated;
grant select on public.coin_wallets to authenticated;
grant select on public.coin_transactions to authenticated;
create policy coin_wallets_read on public.coin_wallets
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy coin_transactions_read on public.coin_transactions
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- The ledger is append-only.
create function private.coin_ledger_immutable()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'coin_transactions is append-only' using errcode = '42501';
end;
$$;
revoke all on function private.coin_ledger_immutable() from public, anon, authenticated;
create trigger coin_ledger_immutable before update or delete on public.coin_transactions
  for each row execute function private.coin_ledger_immutable();

-- Keep the wallet in step with the ledger. A spend larger than the balance
-- breaks the balance >= 0 check and the whole insert fails.
create function private.coin_apply_to_wallet()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coin_wallets as w (user_id, balance)
  values (new.user_id, new.amount)
  on conflict (user_id) do update
    set balance = w.balance + excluded.balance, updated_at = now();
  return new;
end;
$$;
revoke all on function private.coin_apply_to_wallet() from public, anon, authenticated;
create trigger coin_apply_to_wallet after insert on public.coin_transactions
  for each row execute function private.coin_apply_to_wallet();

-- How many Coin each automatic reward gives.
create function private.coin_reward(p_kind text)
returns integer language sql immutable set search_path = '' as $$
  select case p_kind when 'signup' then 100 when 'quiz' then 50 else 0 end;
$$;
revoke all on function private.coin_reward(text) from public, anon, authenticated;

-- Welcome Coin for every new profile.
create function private.coin_welcome()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coin_transactions (user_id, amount, kind, reason, ref)
  values (new.id, private.coin_reward('signup'), 'signup', 'ของขวัญต้อนรับสมาชิกใหม่', 'signup')
  on conflict (user_id, ref) where ref is not null do nothing;
  return new;
end;
$$;
revoke all on function private.coin_welcome() from public, anon, authenticated;
create trigger coin_welcome after insert on public.profiles
  for each row execute function private.coin_welcome();

-- Coin for finishing the quiz, once per account (the first time a character is saved).
create function private.coin_quiz_reward()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coin_transactions (user_id, amount, kind, reason, ref)
  values (new.id, private.coin_reward('quiz'), 'quiz', 'ทำแบบทดสอบครั้งแรก', 'quiz-first')
  on conflict (user_id, ref) where ref is not null do nothing;
  return new;
end;
$$;
revoke all on function private.coin_quiz_reward() from public, anon, authenticated;
create trigger coin_quiz_on_insert after insert on public.profiles
  for each row when (new.assigned_character is not null)
  execute function private.coin_quiz_reward();
create trigger coin_quiz_on_update after update of assigned_character on public.profiles
  for each row when (old.assigned_character is null and new.assigned_character is not null)
  execute function private.coin_quiz_reward();

-- Existing members get the same rewards they would have earned.
insert into public.coin_transactions (user_id, amount, kind, reason, ref)
select p.id, private.coin_reward('signup'), 'signup', 'ของขวัญต้อนรับสมาชิกใหม่', 'signup'
from public.profiles p
on conflict (user_id, ref) where ref is not null do nothing;
insert into public.coin_transactions (user_id, amount, kind, reason, ref)
select p.id, private.coin_reward('quiz'), 'quiz', 'ทำแบบทดสอบครั้งแรก', 'quiz-first'
from public.profiles p
where p.assigned_character is not null
on conflict (user_id, ref) where ref is not null do nothing;

-- Admin grants or removes Coin. Service role only; `actor` is the admin the
-- server verified, and is checked again here. Raises 23514 when a removal is
-- larger than the member's balance.
create function public.admin_coin_adjust(actor uuid, target uuid, amount integer, reason text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  new_balance integer;
begin
  if not exists (select 1 from public.profiles where id = actor and role = 'admin') then
    raise exception 'Only administrators can adjust Coin' using errcode = '42501';
  end if;
  if amount is null or amount = 0 or abs(amount) > 1000000 then
    raise exception 'Invalid amount' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(reason, ''))) not between 1 and 200 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = target) then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
  insert into public.coin_transactions (user_id, amount, kind, reason, actor)
  values (target, amount, case when amount > 0 then 'admin_grant' else 'admin_deduct' end, btrim(reason), actor);
  select balance into new_balance from public.coin_wallets where user_id = target;
  return coalesce(new_balance, 0);
end;
$$;
revoke all on function public.admin_coin_adjust(uuid, uuid, integer, text) from public, anon, authenticated;
grant execute on function public.admin_coin_adjust(uuid, uuid, integer, text) to service_role;
