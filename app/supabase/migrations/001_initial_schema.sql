-- AI Tarot Platform — Initial Schema
-- Run this in Supabase SQL Editor or via migration

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  language text not null default 'en' check (language in ('en', 'fa', 'ar')),
  tier text not null default 'free' check (tier in ('free', 'pro', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Readings
create table public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spread_type text not null check (spread_type in ('single', 'three-card', 'celtic-cross')),
  question text,
  cards jsonb not null,
  interpretation text,
  model_used text not null,
  language text not null default 'en',
  tokens_used integer default 0,
  created_at timestamptz not null default now()
);

-- Follow-up messages within a reading
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tokens_used integer default 0,
  created_at timestamptz not null default now()
);

-- Weekly usage tracking (for free tier limits)
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  single_count integer not null default 0,
  three_card_count integer not null default 0,
  celtic_cross_count integer not null default 0,
  constraint unique_user_week unique (user_id, week_start)
);

-- Waitlist (pre-launch)
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  language text default 'en',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_readings_user_id on public.readings(user_id);
create index idx_readings_created_at on public.readings(created_at desc);
create index idx_follow_ups_reading_id on public.follow_ups(reading_id);
create index idx_usage_user_week on public.usage(user_id, week_start);

-- Row-Level Security
alter table public.profiles enable row level security;
alter table public.readings enable row level security;
alter table public.follow_ups enable row level security;
alter table public.usage enable row level security;
alter table public.waitlist enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Readings: users can read/create own readings
create policy "Users can view own readings"
  on public.readings for select using (auth.uid() = user_id);
create policy "Users can create readings"
  on public.readings for insert with check (auth.uid() = user_id);
create policy "Users can update own readings"
  on public.readings for update using (auth.uid() = user_id);

-- Follow-ups: users can read/create on their own readings
create policy "Users can view own follow-ups"
  on public.follow_ups for select
  using (reading_id in (select id from public.readings where user_id = auth.uid()));
create policy "Users can create follow-ups"
  on public.follow_ups for insert
  with check (reading_id in (select id from public.readings where user_id = auth.uid()));

-- Usage: users can manage own usage
create policy "Users can view own usage"
  on public.usage for select using (auth.uid() = user_id);
create policy "Users can insert own usage"
  on public.usage for insert with check (auth.uid() = user_id);
create policy "Users can update own usage"
  on public.usage for update using (auth.uid() = user_id);

-- Waitlist: anyone can insert, no one reads (admin only via service role)
create policy "Anyone can join waitlist"
  on public.waitlist for insert with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'language', 'en')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
