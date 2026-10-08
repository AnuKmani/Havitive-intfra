-- Storage hardening.
-- Site images: only real raster images (no SVG, which can carry scripts), at most 2 MB.
-- The admin resizes and compresses images in the browser, so normal uploads stay far below this.
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'upload';

-- Job applications: visitors may only add CVs inside the cvs/ folder with a safe file name.
alter policy "anyone uploads application" on storage.objects
  with check (bucket_id = 'applications' and name ~ '^cvs/[A-Za-z0-9._-]{1,200}$');
