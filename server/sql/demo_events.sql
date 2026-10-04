create table if not exists public.demo_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event text not null,
  domain text,
  resume_count int not null default 0
);
alter table public.demo_events enable row level security;
