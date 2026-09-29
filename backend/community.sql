-- Run once in a new Supabase project. No service-role key belongs in the browser.
create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id integer not null check (game_id between 0 and 249),
 display_name text not null check (char_length(display_name) between 1 and 60),
 rating integer not null check (rating between 1 and 5),
 hours numeric not null check (hours between 0 and 100000),
 body text not null check (char_length(body) between 10 and 1000),
 spoiler boolean not null default false,
 created_at timestamptz not null default now(),
 unique(user_id,game_id)
);
create table public.topics (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id integer not null check (game_id between 0 and 249),
 display_name text not null check (char_length(display_name) between 1 and 60),
 title text not null check (char_length(title) between 5 and 120),
 body text not null check (char_length(body) between 10 and 4000),
 spoiler boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.replies (
 id uuid primary key default gen_random_uuid(),
 topic_id uuid not null references public.topics(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 1 and 60),
 body text not null check (char_length(body) between 3 and 2000),
 created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
alter table public.topics enable row level security;
alter table public.replies enable row level security;
create policy "Read reviews" on public.reviews for select using (true);
create policy "Read topics" on public.topics for select using (true);
create policy "Read replies" on public.replies for select using (true);
create policy "Create own review" on public.reviews for insert to authenticated with check (auth.uid()=user_id);
create policy "Create own topic" on public.topics for insert to authenticated with check (auth.uid()=user_id);
create policy "Create own reply" on public.replies for insert to authenticated with check (auth.uid()=user_id);
create policy "Delete own review" on public.reviews for delete to authenticated using (auth.uid()=user_id);
create policy "Delete own topic" on public.topics for delete to authenticated using (auth.uid()=user_id);
create policy "Delete own reply" on public.replies for delete to authenticated using (auth.uid()=user_id);
grant select on public.reviews,public.topics,public.replies to anon,authenticated;
grant insert,delete on public.reviews,public.topics,public.replies to authenticated;
-- Basic server-side posting cooldown. Lock per account prevents parallel bypass.
create function public.community_cooldown() returns trigger language plpgsql security definer set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtext(new.user_id::text));
 if exists(select 1 from public.reviews where user_id=new.user_id and created_at>now()-interval '20 seconds')
 or exists(select 1 from public.topics where user_id=new.user_id and created_at>now()-interval '20 seconds')
 or exists(select 1 from public.replies where user_id=new.user_id and created_at>now()-interval '20 seconds') then
 raise exception 'Vui lòng chờ 20 giây giữa các lần đăng.';
 end if;
 new.created_at=now();
 return new;
end $$;
create trigger review_cooldown before insert on public.reviews for each row execute function public.community_cooldown();
create trigger topic_cooldown before insert on public.topics for each row execute function public.community_cooldown();
create trigger reply_cooldown before insert on public.replies for each row execute function public.community_cooldown();
