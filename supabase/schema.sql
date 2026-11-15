-- ============================================================================
-- SCHEMA SUPABASE — OPEN HUB BY ANARCHY
-- À copier-coller une seule fois dans : Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Profils utilisateurs (lié à l'email / pseudo + avatar personnalisé)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  pseudo text not null,
  bio text default '',
  avatar_style text default 'acid-cyber',
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

-- 3. Mur social / Activités / Collaborations
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_pseudo text not null,
  author_avatar_style text default 'acid-cyber',
  author_avatar_url text default '',
  category text default 'STATUT',
  content text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- 4. Sons communauté + Stems ZIP
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

-- Active Row Level Security (lecture publique, écriture ouverte pour démarrage rapide)
alter table public.profiles enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_posts enable row level security;
alter table public.community_tracks enable row level security;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public insert profiles" on public.profiles for insert with check (true);
create policy "Public update profiles" on public.profiles for update using (true);

create policy "Public read follows" on public.social_follows for select using (true);
create policy "Public write follows" on public.social_follows for all using (true) with check (true);

create policy "Public read social_posts" on public.social_posts for select using (true);
create policy "Public insert social_posts" on public.social_posts for insert with check (true);
create policy "Public update social_posts" on public.social_posts for update using (true);

create policy "Public read community_tracks" on public.community_tracks for select using (true);
create policy "Public insert community_tracks" on public.community_tracks for insert with check (true);
create policy "Public update community_tracks" on public.community_tracks for update using (true);
