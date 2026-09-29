-- Product photos: one image per product, stored in a public bucket and written only by admins.
alter table public.shop_products
  add column image_path text
  check (image_path is null or image_path ~ '^[a-z0-9-]+/[A-Za-z0-9._-]+$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-images',
  'shop-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public URLs serve reads, so select is limited to admins (needed for remove()).
create policy shop_images_admin_select on storage.objects for select to authenticated using (
  bucket_id = 'shop-images'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_images_admin_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'shop-images'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_images_admin_update on storage.objects for update to authenticated using (
  bucket_id = 'shop-images'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
create policy shop_images_admin_delete on storage.objects for delete to authenticated using (
  bucket_id = 'shop-images'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
