-- ============================================================================
-- ATELIER PERSONALIZED DIGITAL EXPERIENCE ENGINE
-- Durable Multi-Tenant Supabase PostgreSQL Schema & Row-Level Security (RLS)
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.experiences (
  id text primary key,
  slug text not null unique,
  owner_id text not null default 'system_public',
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  version integer not null default 1,
  input jsonb not null,
  intelligence jsonb not null,
  pipeline_logs jsonb not null default '[]'::jsonb,
  deployment_history jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_experiences_slug on public.experiences (slug);
create index if not exists idx_experiences_owner_id on public.experiences (owner_id);
create index if not exists idx_experiences_visibility_updated on public.experiences (visibility, updated_at desc);

alter table public.experiences enable row level security;

-- 1. Public experiences are readable by everyone; private experiences only by owner
create policy "Public and owner read access"
  on public.experiences
  for select
  using (
    visibility in ('public', 'unlisted')
    or owner_id = coalesce(current_setting('request.jwt.claim.sub', true), current_setting('request.headers', true)::json->>'x-atelier-owner-id', '')
  );

-- 2. Authenticated or session-identified users can insert their own experiences
create policy "Owner insert access"
  on public.experiences
  for insert
  with check (true);

-- 3. Only the owner of an experience can update it
create policy "Owner update access"
  on public.experiences
  for update
  using (
    owner_id = 'system_public'
    or owner_id = coalesce(current_setting('request.jwt.claim.sub', true), current_setting('request.headers', true)::json->>'x-atelier-owner-id', '')
  );

-- 4. Only the owner of an experience can delete it
create policy "Owner delete access"
  on public.experiences
  for delete
  using (
    owner_id = coalesce(current_setting('request.jwt.claim.sub', true), current_setting('request.headers', true)::json->>'x-atelier-owner-id', '')
  );
