-- Remove the role-change history.
--
-- admin_set_member_role no longer logs to profile_role_events, and the table
-- (plus its policy and indexes) is dropped. The function keeps the same
-- signature and checks.

create or replace function public.admin_set_member_role(actor uuid, target uuid, new_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous text;
begin
  if not exists (select 1 from public.profiles where id = actor and role = 'admin') then
    raise exception 'Only administrators can change roles' using errcode = '42501';
  end if;
  if new_role not in ('user', 'admin') then
    raise exception 'Unknown role %', new_role using errcode = '22023';
  end if;
  if target = actor then
    raise exception 'Administrators cannot change their own role' using errcode = '42501';
  end if;

  select role into previous from public.profiles where id = target for update;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
  if previous = new_role then
    return previous;
  end if;

  update public.profiles
    set role = new_role, updated_at = now()
    where id = target;
  return previous;
end;
$$;

drop table if exists public.profile_role_events;
