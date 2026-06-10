-- Run this in Supabase → SQL Editor → New query

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bets
create table public.bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  bet_type text not null check (bet_type in ('Single','Double','Treble','Accumulator')),
  stake numeric(10,2) not null,
  result text not null default 'open' check (result in ('open','win','loss','void')),
  profit numeric(10,2),
  bookmaker text,
  is_public boolean default false,
  analysis text,
  is_maxbet boolean default false,
  created_at timestamptz default now()
);
alter table public.bets enable row level security;
create policy "Users can view own bets" on public.bets for select using (auth.uid() = user_id);
create policy "Users can view public bets" on public.bets for select using (is_public = true);
create policy "Users can insert own bets" on public.bets for insert with check (auth.uid() = user_id);
create policy "Users can update own bets" on public.bets for update using (auth.uid() = user_id);
create policy "Users can delete own bets" on public.bets for delete using (auth.uid() = user_id);

-- Selections (legs of a bet)
create table public.selections (
  id uuid default gen_random_uuid() primary key,
  bet_id uuid references public.bets on delete cascade not null,
  sport text not null,
  match text not null,
  market text not null,
  line text,
  odds numeric(8,3) not null,
  closing_odds numeric(8,3),
  sort_order int default 0
);
alter table public.selections enable row level security;
create policy "Selections follow bet visibility" on public.selections for select
  using (exists (
    select 1 from public.bets
    where bets.id = selections.bet_id
    and (bets.user_id = auth.uid() or bets.is_public = true)
  ));
create policy "Users can insert own selections" on public.selections for insert
  with check (exists (
    select 1 from public.bets where bets.id = bet_id and bets.user_id = auth.uid()
  ));
create policy "Users can update own selections" on public.selections for update
  using (exists (
    select 1 from public.bets where bets.id = bet_id and bets.user_id = auth.uid()
  ));
create policy "Users can delete own selections" on public.selections for delete
  using (exists (
    select 1 from public.bets where bets.id = bet_id and bets.user_id = auth.uid()
  ));
