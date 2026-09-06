-- Idées Lum — schéma à exécuter dans le SQL Editor du projet Supabase "carte-lum".

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  likes      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_ranking_idx
  on public.posts (likes desc, created_at desc);

-- Pas d'authentification pour le MVP : lecture, création et suppression publiques.
alter table public.posts enable row level security;

drop policy if exists "posts_select_public" on public.posts;
drop policy if exists "posts_insert_public" on public.posts;
drop policy if exists "posts_delete_public" on public.posts;

create policy "posts_select_public" on public.posts for select using (true);
create policy "posts_insert_public" on public.posts for insert with check (true);
create policy "posts_delete_public" on public.posts for delete using (true);

-- Pas de policy UPDATE : les likes passent uniquement par cette fonction,
-- qui incrémente de 1 de façon atomique.
create or replace function public.like_post(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set likes = likes + 1 where id = post_id;
$$;

grant execute on function public.like_post(uuid) to anon, authenticated;

-- Commentaires attachés à un post-it.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx
  on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
drop policy if exists "comments_insert_public" on public.comments;

create policy "comments_select_public" on public.comments for select using (true);
create policy "comments_insert_public" on public.comments for insert with check (true);
