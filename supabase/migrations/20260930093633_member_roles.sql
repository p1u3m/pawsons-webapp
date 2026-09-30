-- Admins manage member roles from /admin/members.
--
-- Roles stay locked for API users (the protect_profile_role triggers); the only
-- way to change one is admin_set_member_role(), which runs as the owner, checks
-- that the caller is an admin, refuses to demote the caller (so at least one
-- admin always remains) and logs every change in profile_role_events.

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

create table public.profile_role_events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  old_role text not null,
  new_role text not null,
  actor uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index profile_role_events_created_idx
  on public.profile_role_events (created_at desc);
create index profile_role_events_profile_idx
  on public.profile_role_events (profile_id);
create index profile_role_events_actor_idx
  on public.profile_role_events (actor);

alter table public.profile_role_events enable row level security;

-- Read-only for admins; rows are written by admin_set_member_role() only.
create policy "Admins can view role events"
  on public.profile_role_events for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;

create function public.admin_set_member_role(target uuid, new_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous text;
begin
  if not private.is_admin() then
    raise exception 'Only administrators can change roles' using errcode = '42501';
  end if;
  if new_role not in ('user', 'admin') then
    raise exception 'Unknown role %', new_role using errcode = '22023';
  end if;
  if target = (select auth.uid()) then
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
    values (target, previous, new_role, (select auth.uid()));
  return previous;
end;
$$;

-- Emails live in auth.users; admins see them to tell members apart.
create function public.admin_member_emails(ids uuid[])
returns table (id uuid, email text, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only administrators can read member emails' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.last_sign_in_at
    from auth.users u
    where u.id = any (ids);
end;
$$;

-- Name or email search for the "add admin" picker (at most 10 rows).
create function public.admin_search_members(term text)
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
  if not private.is_admin() then
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

revoke all on function public.admin_set_member_role(uuid, text) from public, anon;
revoke all on function public.admin_member_emails(uuid[]) from public, anon;
revoke all on function public.admin_search_members(text) from public, anon;
grant execute on function public.admin_set_member_role(uuid, text) to authenticated;
grant execute on function public.admin_member_emails(uuid[]) to authenticated;
grant execute on function public.admin_search_members(text) to authenticated;
