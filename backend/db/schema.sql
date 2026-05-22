-- Run once against your Neon Postgres (SQL Editor or npm run db:migrate)

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  role text,
  team_size int,
  audit_id text not null,
  monthly_savings int,
  audit_state text,
  created_at timestamptz default now()
);

create table if not exists audits (
  id text primary key,
  payload jsonb not null,
  use_case text not null,
  team_size int not null,
  monthly_savings int not null default 0,
  created_at timestamptz default now()
);

create index if not exists leads_email_idx on leads (email);
create index if not exists leads_created_at_idx on leads (created_at desc);
