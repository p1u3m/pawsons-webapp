-- The pull quote from the old 16-situation stories. Posts now keep a quote in
-- situation_title (with quote_author), so this column is empty and unused.
alter table public.contents drop column if exists quote;
