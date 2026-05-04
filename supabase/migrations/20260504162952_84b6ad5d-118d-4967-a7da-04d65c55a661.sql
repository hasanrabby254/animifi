
-- Results table
create table public.results (
  id uuid primary key default gen_random_uuid(),
  selfie_url text,
  morph_url text,
  animal text not null,
  confidence int not null default 0,
  traits jsonb not null default '[]'::jsonb,
  personality text,
  top_matches jsonb not null default '[]'::jsonb,
  style text not null default 'realistic',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;

-- Anyone can read any result by id (sharing via link). Gallery filters is_public.
create policy "Public read results" on public.results for select using (true);
create policy "Anyone can insert result" on public.results for insert with check (true);

-- Storage bucket for images (public read for share previews)
insert into storage.buckets (id, name, public) values ('animify', 'animify', true)
on conflict (id) do nothing;

create policy "Public read animify" on storage.objects for select using (bucket_id = 'animify');
create policy "Anyone upload animify" on storage.objects for insert with check (bucket_id = 'animify');
