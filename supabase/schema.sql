-- ============================================================================
-- SCHEMA COMPLET SUPABASE — OPEN HUB BY ANARCHY
-- Copier-coller ce fichier dans : Supabase -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1. Profils utilisateurs (email, pseudo, bio, avatar personnalisé, liens)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  pseudo text not null,
  bio text default '',
  avatar_style text default 'spectateur-a',
  avatar_url text default '',
  github_url text default '',
  soundcloud_url text default '',
  created_at timestamptz default now()
);

-- 2. Système de suivi (Followers / Following)
create table if not exists public.social_follows (
  id uuid primary key default gen_random_uuid(),
  follower_email text not null,
  following_pseudo text not null,
  created_at timestamptz default now(),
  unique (follower_email, following_pseudo)
);

-- 3. Mur social / Activités / Collaborations (/reseau)
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_pseudo text not null,
  author_avatar_style text default 'spectateur-a',
  author_avatar_url text default '',
  category text default 'STATUT',
  content text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- 4. Sons communauté + Stems ZIP + Remix (/sons-communaute)
create table if not exists public.community_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_pseudo text not null,
  artist_email text not null,
  bpm integer default 140,
  genre text default 'Techno / Psy',
  audio_url text default '',
  stems_zip_url text default '',
  parent_track_id uuid references public.community_tracks(id) on delete set null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- 5. VST Communauté (/)
create table if not exists public.community_vsts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  author_pseudo text not null,
  author_email text not null,
  github_url text default '',
  download_url text default '',
  format text default 'VST3',
  description text default '',
  created_at timestamptz default now()
);

-- 6. Samples & Presets Communauté (/samples)
create table if not exists public.community_samples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_pseudo text not null,
  kind text default 'SAMPLE',
  synth_category text default 'Serum',
  bpm integer default 140,
  file_url text default '',
  created_at timestamptz default now()
);

-- 7. Radio Générale & Ranking (/radio)
create table if not exists public.radio_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_pseudo text not null,
  audio_url text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- 8. Forum & Blog (/forum, /blog)
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_pseudo text not null,
  category text default 'DISCUSSION',
  content text not null,
  replies jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  author_pseudo text not null,
  section text default 'COMMUNAUTÉ',
  content text not null,
  created_at timestamptz default now()
);

-- 9. Bucket Storage public pour stocker audio, stems .zip, .vst3 et avatars
insert into storage.buckets (id, name, public)
values ('openhub-media', 'openhub-media', true)
on conflict (id) do nothing;

-- ============================================================================
-- PERMISSIONS (Row Level Security)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_posts enable row level security;
alter table public.community_tracks enable row level security;
alter table public.community_vsts enable row level security;
alter table public.community_samples enable row level security;
alter table public.radio_tracks enable row level security;
alter table public.forum_threads enable row level security;
alter table public.blog_posts enable row level security;

create policy "openhub_all_profiles" on public.profiles for all using (true) with check (true);
create policy "openhub_all_follows" on public.social_follows for all using (true) with check (true);
create policy "openhub_all_social_posts" on public.social_posts for all using (true) with check (true);
create policy "openhub_all_tracks" on public.community_tracks for all using (true) with check (true);
create policy "openhub_all_vsts" on public.community_vsts for all using (true) with check (true);
create policy "openhub_all_samples" on public.community_samples for all using (true) with check (true);
create policy "openhub_all_radio" on public.radio_tracks for all using (true) with check (true);
create policy "openhub_all_forum" on public.forum_threads for all using (true) with check (true);
create policy "openhub_all_blog" on public.blog_posts for all using (true) with check (true);

create policy "openhub_storage_read" on storage.objects for select using (bucket_id = 'openhub-media');
create policy "openhub_storage_write" on storage.objects for insert with check (bucket_id = 'openhub-media');
