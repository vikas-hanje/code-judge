-- Code Judge schema and RLS policies
-- Safe to run multiple times

-- Extensions (optional)
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar text,
  bio text,
  created_at timestamptz default now()
);

-- Problems
create table if not exists public.problems (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  statement text not null,
  time_limit_ms int default 2000,
  memory_limit_kb int default 65536,
  created_at timestamptz default now()
);

-- Testcases
create table if not exists public.testcases (
  id bigserial primary key,
  problem_id bigint not null references public.problems(id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_sample boolean default false,
  created_at timestamptz default now()
);

-- Submissions
create table if not exists public.submissions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id bigint references public.problems(id) on delete set null,
  language_id int not null,
  source_code text not null,
  stdin text,
  stdout text,
  stderr text,
  status text,
  time_ms int,
  memory_kb int,
  is_submission boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.testcases enable row level security;
alter table public.submissions enable row level security;

-- Profiles policies: users can read and update their own profile
create policy if not exists "profiles_select_own" on public.profiles
for select using ( auth.uid() = id );

create policy if not exists "profiles_upsert_own" on public.profiles
for insert with check ( auth.uid() = id );

create policy if not exists "profiles_update_own" on public.profiles
for update using ( auth.uid() = id );

-- Problems policies: readable by any authenticated user
create policy if not exists "problems_read_all" on public.problems
for select using ( auth.role() = 'authenticated' );

-- Testcases policies:
-- allow reading sample testcases to authenticated users
create policy if not exists "testcases_read_samples" on public.testcases
for select using ( auth.role() = 'authenticated' and is_sample = true );

-- Submissions policies: users can read their own submissions and insert new ones; updates are done by service role
create policy if not exists "submissions_select_own" on public.submissions
for select using ( auth.uid() = user_id );

create policy if not exists "submissions_insert_own" on public.submissions
for insert with check ( auth.uid() = user_id );

-- Notes:
-- Service role (used in Next.js API routes) bypasses RLS to evaluate non-sample testcases and update submissions.
