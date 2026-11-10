-- LIRE: shared reading library, per-user progress, AI usage limits.
-- Run once in the Supabase SQL editor (or `supabase db push`).

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid references auth.users(id) on delete cascade, -- null = created by the system
  visibility  text not null default 'private' check (visibility in ('private','shared')),
  language    text not null check (language in ('fr','zh','ms','th')),
  script      text,
  title       text not null,
  category    text not null default '',
  level       text not null,
  duration    text not null default '',
  content     text not null,
  translation text not null default '',
  vocabulary  jsonb not null default '[]',
  glossary    jsonb not null default '[]',
  grammar     jsonb not null default '[]',
  questions   jsonb not null default '[]',
  analysis    text not null default 'none' check (analysis in ('none','pending','ready','error')),
  -- shared-library cache key: same language+level+script+topic -> reuse the saved article
  topic_key   text,
  -- provenance for imported articles (attribution is required by most open licences)
  source_url  text,
  license     text,
  created_at  timestamptz not null default now()
);

create unique index lessons_shared_topic_idx
  on public.lessons (language, level, coalesce(script,''), topic_key)
  where visibility = 'shared' and topic_key is not null;
create index lessons_shared_lang_idx on public.lessons (language, created_at desc) where visibility = 'shared';
create index lessons_owner_idx on public.lessons (owner);

alter table public.lessons enable row level security;

-- everyone (even signed-out) can read the shared library; owners read their private lessons
create policy "read shared or own" on public.lessons for select
  using (visibility = 'shared' or owner = auth.uid());
-- users may only create PRIVATE lessons for themselves (shared ones are written by the edge function)
create policy "insert own private" on public.lessons for insert to authenticated
  with check (owner = auth.uid() and visibility = 'private');
create policy "update own private" on public.lessons for update to authenticated
  using (owner = auth.uid() and visibility = 'private')
  with check (owner = auth.uid() and visibility = 'private');
create policy "delete own private" on public.lessons for delete to authenticated
  using (owner = auth.uid() and visibility = 'private');

-- per-user tracker
create table public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  completed  text[] not null default '{}',
  saved      text[] not null default '{}',
  read_log   jsonb  not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.user_progress enable row level security;
create policy "own progress" on public.user_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AI usage per user per day (only the edge function touches it)
create table public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security; -- no policies: service role only

-- global switches you can edit in the dashboard
create table public.app_settings (
  key   text primary key,
  value jsonb not null
);
alter table public.app_settings enable row level security; -- service role only
insert into public.app_settings (key, value) values
  ('ai_enabled', 'true'),        -- flip to false to switch AI off for everyone
  ('daily_limit', '10');         -- AI calls per user per day (generate + analyze of NEW texts)

-- atomic "use one call or refuse" used by the edge function
create or replace function public.consume_ai_call(p_user uuid, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into ai_usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
  returning count into c;
  if c > p_limit then
    update ai_usage set count = count - 1 where user_id = p_user and day = current_date;
    return false;
  end if;
  return true;
end $$;
revoke all on function public.consume_ai_call(uuid, int) from public, anon, authenticated;
