-- Personas migration: one login (owner) can hold multiple profiles (personas).
-- Run in Supabase → SQL Editor. Safe to run once; backfills existing data.

-- 1. Decouple profile identity from the auth account.
--    profiles.id stops being an FK to auth.users; ownership moves to owner_id.
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();
alter table public.profiles add column if not exists owner_id uuid references auth.users(id) on delete cascade;
update public.profiles set owner_id = id where owner_id is null;
alter table public.profiles alter column owner_id set not null;
create index if not exists profiles_owner_id_idx on public.profiles (owner_id);

-- 2. Profiles RLS: owners manage all profiles they own; everyone can read.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Owners update their profiles" on public.profiles
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners create their profiles" on public.profiles
  for insert with check (auth.uid() = owner_id);

-- 3. Bets carry which persona posted them.
alter table public.bets add column if not exists profile_id uuid references public.profiles(id);
update public.bets set profile_id = user_id where profile_id is null;
create index if not exists bets_profile_id_idx on public.bets (profile_id);

-- 4. Bets insert must reference a persona the user owns (user_id stays = owner).
drop policy if exists "Users can insert own bets" on public.bets;
create policy "Users can insert own bets" on public.bets for insert with check (
  auth.uid() = user_id
  and (
    profile_id is null
    or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
  )
);

-- 5. Keep the signup trigger creating the primary persona (id = auth id, owner = self).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, owner_id, username, display_name)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
