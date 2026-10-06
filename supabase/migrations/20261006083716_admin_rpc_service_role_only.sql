-- admin_* RPCs become service-role only.
--
-- They used to be callable by every signed-in user through /rest/v1/rpc and
-- relied on private.is_admin() (auth.uid()) inside. Now the Next.js server
-- verifies the session user is an admin, then calls them with the service-role
-- client and passes that user's id as `actor`; the functions re-check that the
-- actor is an admin. Only service_role can execute them.

drop function if exists public.admin_set_member_role(uuid, text);
drop function if exists public.admin_member_emails(uuid[]);
drop function if exists public.admin_search_members(text);

create function public.admin_set_member_role(actor uuid, target uuid, new_role text)
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
  insert into public.profile_role_events (profile_id, old_role, new_role, actor)
    values (target, previous, new_role, actor);
  return previous;
end;
$$;

create function public.admin_member_emails(actor uuid, ids uuid[])
returns table (id uuid, email text, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where profiles.id = actor and profiles.role = 'admin') then
    raise exception 'Only administrators can read member emails' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.last_sign_in_at
    from auth.users u
    where u.id = any (ids);
end;
$$;

create function public.admin_search_members(actor uuid, term text)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  email text,
  role text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  pattern text := '%' || replace(replace(replace(btrim(term), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  if not exists (select 1 from public.profiles a where a.id = actor and a.role = 'admin') then
    raise exception 'Only administrators can search members' using errcode = '42501';
  end if;
  if char_length(btrim(term)) < 2 then
    return;
  end if;
  return query
    select p.id, p.display_name, p.avatar_url, u.email::text, p.role
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.display_name ilike pattern or u.email ilike pattern
    order by (p.role = 'admin'), p.display_name
    limit 10;
end;
$$;

revoke all on function public.admin_set_member_role(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.admin_member_emails(uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.admin_search_members(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_member_role(uuid, uuid, text) to service_role;
grant execute on function public.admin_member_emails(uuid, uuid[]) to service_role;
grant execute on function public.admin_search_members(uuid, text) to service_role;
