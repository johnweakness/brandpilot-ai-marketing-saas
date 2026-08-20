alter table public.brand_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.generations add column if not exists user_id uuid references auth.users(id) on delete cascade;
create unique index if not exists brand_profiles_user_id_idx on public.brand_profiles(user_id);
create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.brand_profiles enable row level security;
alter table public.generations enable row level security;
alter table public.subscriptions enable row level security;
drop policy if exists "Users manage own brand" on public.brand_profiles;
create policy "Users manage own brand" on public.brand_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own generations" on public.generations;
create policy "Users manage own generations" on public.generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users view own subscription" on public.subscriptions;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
