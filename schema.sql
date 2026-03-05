-- ================================================================
-- NEXUS STICKERS — Supabase Database Schema
-- Copiez ce SQL dans l'éditeur SQL de votre projet Supabase
-- ================================================================

create extension if not exists "uuid-ossp";

-- Profils utilisateurs (liés à auth.users)
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  bio           text,
  contact_link  text,
  is_admin      boolean default false,
  is_banned     boolean default false,
  created_at    timestamptz default now()
);

-- Packs de stickers
create table if not exists packs (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references profiles(id) on delete cascade not null,
  name           text not null,
  description    text,
  cover_url      text,
  is_public      boolean default false,
  download_count int default 0,
  sticker_count  int default 0,
  created_at     timestamptz default now()
);

-- Stickers individuels
create table if not exists stickers (
  id         uuid default uuid_generate_v4() primary key,
  pack_id    uuid references packs(id) on delete cascade not null,
  image_url  text not null,
  created_at timestamptz default now()
);

-- Réactions sur les packs
create table if not exists reactions (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  pack_id    uuid references packs(id) on delete cascade,
  emoji      text not null default '❤️',
  created_at timestamptz default now(),
  unique(user_id, pack_id)
);

-- Abonnements (followers)
create table if not exists followers (
  follower_id  uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key(follower_id, following_id)
);

-- Signalements
create table if not exists reports (
  id          uuid default uuid_generate_v4() primary key,
  reporter_id uuid references profiles(id),
  pack_id     uuid references packs(id),
  reason      text not null,
  status      text default 'pending', -- pending, resolved, banned
  created_at  timestamptz default now()
);

-- Annonces / Publicités (admin)
create table if not exists announcements (
  id         uuid default uuid_generate_v4() primary key,
  title      text not null,
  content    text,
  image_url  text,
  link       text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- Posts communauté
create table if not exists community_posts (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- Visites de profil
create table if not exists profile_visits (
  id          uuid default uuid_generate_v4() primary key,
  profile_id  uuid references profiles(id) on delete cascade,
  visitor_id  uuid references profiles(id),
  visited_at  timestamptz default now()
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

alter table profiles        enable row level security;
alter table packs           enable row level security;
alter table stickers        enable row level security;
alter table reactions       enable row level security;
alter table followers       enable row level security;
alter table reports         enable row level security;
alter table announcements   enable row level security;
alter table community_posts enable row level security;
alter table profile_visits  enable row level security;

-- Profiles
create policy "Profils visibles par tous" on profiles for select using (true);
create policy "Utilisateur modifie son profil" on profiles for update using (auth.uid() = id);

-- Packs
create policy "Packs publics visibles" on packs for select using (is_public = true or auth.uid() = user_id);
create policy "CRUD packs propres" on packs for all using (auth.uid() = user_id);

-- Stickers
create policy "Stickers visibles avec pack" on stickers for select using (
  exists (select 1 from packs where id = pack_id and (is_public = true or user_id = auth.uid()))
);
create policy "CRUD stickers propres" on stickers for all using (
  exists (select 1 from packs where id = pack_id and user_id = auth.uid())
);

-- Reactions
create policy "Reactions visibles" on reactions for select using (true);
create policy "CRUD reactions propres" on reactions for all using (auth.uid() = user_id);

-- Followers
create policy "Followers visibles" on followers for select using (true);
create policy "CRUD followers propres" on followers for all using (auth.uid() = follower_id);

-- Reports
create policy "Insert reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Voir ses signalements" on reports for select using (auth.uid() = reporter_id);
create policy "Admin voit tous signalements" on reports for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Announcements
create policy "Annonces visibles" on announcements for select using (is_active = true);
create policy "Admin gère annonces" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Community posts
create policy "Posts visibles" on community_posts for select using (true);
create policy "CRUD posts propres" on community_posts for insert with check (auth.uid() = user_id);
create policy "Admin supprime posts" on community_posts for delete using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Profile visits
create policy "Insert visites" on profile_visits for insert with check (true);
create policy "Voir visites de son profil" on profile_visits for select using (auth.uid() = profile_id);

-- ================================================================
-- Trigger: créer un profil automatiquement à l'inscription
-- ================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), ' ', '_')),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- Storage Buckets (créer manuellement dans Supabase Dashboard)
-- ================================================================
-- 1. Bucket "stickers" — Public
-- 2. Bucket "avatars"  — Public
-- ================================================================
-- Après le déploiement, accordez l'accès admin au compte Nexus Labs :
-- UPDATE profiles SET is_admin = true WHERE username = 'nexuslabsword';
-- ================================================================
