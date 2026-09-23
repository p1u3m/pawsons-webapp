-- =========================================================
-- Pawsons Phase 2: Profiles Table Setup
-- Run this in Supabase Dashboard → SQL Editor → New query
-- =========================================================

-- 1. Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  assigned_character text,  -- MBTI type e.g. 'INFP', 'ENFJ'
  house text,               -- house id e.g. 'clover', 'lavender'
  vibe text,                -- special vibe from quiz e.g. 'สบาย', 'อบอุ่น'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Policies: users can read any profile, but only update their own
create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Drop the trigger if it already exists (safe re-run)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill existing users (like the user who just logged in)
insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

-- =========================================================
-- Pawsons Phase 3: Contents Table, Role & Admin CMS Security
-- =========================================================

-- 6. Add role column to profiles table
alter table public.profiles add column if not exists role text not null default 'user';

-- 7. Trigger to protect role column from unauthorized privilege escalation
create or replace function public.protect_profile_role()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    if current_user in ('postgres', 'supabase_admin', 'service_role') then
      return new;
    end if;

    if not exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    ) then
      raise exception 'Permission denied: Only administrators can modify user roles.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists tr_protect_profile_role on public.profiles;

create trigger tr_protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- Revoke direct RPC execution from anon and authenticated (triggers only)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;


-- 8. Create contents table (for 16 situations and future articles)
create table if not exists public.contents (
  id integer primary key,
  situation_title text not null,
  body_1 text,
  body_2 text,
  quote text,
  character_type text,
  cover_image_url text,
  category text not null default '16 Situations',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contents enable row level security;
grant select on public.contents to anon, authenticated;

-- Contents policies
create policy "contents_select_public"
  on public.contents for select
  using (true);

create policy "contents_update_admin"
  on public.contents for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

create policy "contents_insert_admin"
  on public.contents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

