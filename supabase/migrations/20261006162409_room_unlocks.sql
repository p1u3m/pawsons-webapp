-- Rooms: each house has a room in /room. A member gets the room of their own
-- house when they take the quiz, and can unlock the other rooms with Coin.
--
-- room_unlocks records which rooms a member owns. Members read their own rows,
-- admins read all; nothing is written through the API directly. Rows come from
-- a trigger (quiz result) or from unlock_room() (service role only), which
-- spends the Coin and records the unlock in one transaction.

create table public.room_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  room_id text not null check (room_id in ('lavender', 'clover', 'forget-me-not', 'dandelion')),
  source text not null check (source in ('quiz', 'coin')),
  created_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

alter table public.room_unlocks enable row level security;
revoke all on public.room_unlocks from anon, authenticated;
grant select on public.room_unlocks to authenticated;
create policy room_unlocks_read on public.room_unlocks
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Price of one room, in Coin. Change it here only.
create function private.room_price()
returns integer language sql immutable set search_path = '' as $$
  select 100;
$$;
revoke all on function private.room_price() from public, anon, authenticated;

-- The house (= room) of a character, in the order of src/lib/data.ts:
-- four characters per house.
create function private.room_for_character(p_character text)
returns text language sql immutable set search_path = '' as $$
  select case
    when upper(p_character) in ('INTJ', 'INTP', 'ENTJ', 'ENTP') then 'lavender'
    when upper(p_character) in ('INFJ', 'INFP', 'ENFJ', 'ENFP') then 'clover'
    when upper(p_character) in ('ISTJ', 'ISFJ', 'ESTJ', 'ESFJ') then 'forget-me-not'
    when upper(p_character) in ('ISTP', 'ISFP', 'ESTP', 'ESFP') then 'dandelion'
  end;
$$;
revoke all on function private.room_for_character(text) from public, anon, authenticated;

-- The quiz result unlocks the member's own house room (also when they retake
-- the quiz and land in another house; earlier rooms stay unlocked).
create function private.room_quiz_unlock()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  room text := private.room_for_character(new.assigned_character);
begin
  if room is not null then
    insert into public.room_unlocks (user_id, room_id, source)
    values (new.id, room, 'quiz')
    on conflict (user_id, room_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.room_quiz_unlock() from public, anon, authenticated;
create trigger room_quiz_on_insert after insert on public.profiles
  for each row when (new.assigned_character is not null)
  execute function private.room_quiz_unlock();
create trigger room_quiz_on_update after update of assigned_character on public.profiles
  for each row when (new.assigned_character is not null
    and new.assigned_character is distinct from old.assigned_character)
  execute function private.room_quiz_unlock();

-- Members who already took the quiz get their house room.
insert into public.room_unlocks (user_id, room_id, source)
select p.id, private.room_for_character(p.assigned_character), 'quiz'
from public.profiles p
where private.room_for_character(p.assigned_character) is not null
on conflict (user_id, room_id) do nothing;

-- Unlocks a room with Coin. Service role only; `member` is the user the server
-- verified. Returns the new balance. Raises 23505 when the room is already
-- unlocked, 23514 when the balance is too low, 22023 for an unknown room.
create function public.unlock_room(member uuid, room text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  price integer := private.room_price();
  new_balance integer;
begin
  if room is null or room not in ('lavender', 'clover', 'forget-me-not', 'dandelion') then
    raise exception 'Unknown room' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = member) then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.room_unlocks where user_id = member and room_id = room) then
    raise exception 'Room already unlocked' using errcode = '23505';
  end if;
  -- Breaks the wallet check (balance >= 0) when the member cannot afford it.
  insert into public.coin_transactions (user_id, amount, kind, reason, ref)
  values (member, -price, 'spend', 'ปลดล็อคห้อง ' || room, 'room-' || room);
  insert into public.room_unlocks (user_id, room_id, source) values (member, room, 'coin');
  select balance into new_balance from public.coin_wallets where user_id = member;
  return coalesce(new_balance, 0);
end;
$$;
revoke all on function public.unlock_room(uuid, text) from public, anon, authenticated;
grant execute on function public.unlock_room(uuid, text) to service_role;
