-- Post categories ("tags") become rows admins can add, rename and remove.
-- layout picks how a post is written and shown:
--   situation  title + two body lines (+ situation_no)
--   quote      the quote itself + its author
-- situation and quote are the built-in tags; code falls back to them.

create table public.content_categories (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  label text not null check (char_length(btrim(label)) between 1 and 40),
  english text not null default '' check (char_length(english) <= 40),
  layout text not null default 'situation' check (layout in ('situation', 'quote')),
  sort_order smallint not null default 100,
  created_at timestamptz not null default now()
);

insert into public.content_categories (slug, label, english, layout, sort_order) values
  ('situation', 'สถานการณ์', 'Situations', 'situation', 10),
  ('quote', 'คำคม', 'Quotes', 'quote', 20);

-- Posts point at a tag; a tag in use cannot be deleted, and renaming a slug follows through.
alter table public.contents
  drop constraint contents_category_check,
  add constraint contents_category_fkey foreign key (category)
    references public.content_categories (slug)
    on update cascade on delete restrict;

create index contents_category_idx on public.contents (category);

alter table public.content_categories enable row level security;

create policy "content_categories_select_public"
  on public.content_categories for select
  using (true);

create policy "content_categories_insert_admin"
  on public.content_categories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

create policy "content_categories_update_admin"
  on public.content_categories for update
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

create policy "content_categories_delete_admin"
  on public.content_categories for delete
  to authenticated
  using (
    slug not in ('situation', 'quote')
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );
