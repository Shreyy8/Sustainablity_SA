-- ============================================================================
-- SAAKSHI: AI-Powered CSR Evidence Vault
-- Supabase / Postgres 16 Schema with PostGIS, pgvector, and RLS
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "vector";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 1. Tenancy
create table if not exists organization (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('CORPORATE','NGO','ASSESSOR')) not null,
  name text not null,
  slug text unique not null,
  logo_public_id text,
  created_at timestamptz default now()
);

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organization(id) on delete cascade,
  role text check (role in ('FIELD','NGO_ADMIN','CORP_ADMIN','CORP_VIEWER','ASSESSOR','SUPER')) not null,
  name text not null,
  email text,
  phone text,
  language text default 'hi'
);

create table if not exists grant_ (
  id uuid primary key default gen_random_uuid(),
  corporate_id uuid references organization(id) not null,
  ngo_id uuid references organization(id) not null,
  title text not null,
  amount_inr numeric not null,
  schedule_vii text not null,
  start_date date not null,
  end_date date not null
);

create table if not exists project (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid references grant_(id) on delete cascade not null,
  name text not null,
  description text,
  activities text[] default '{}',
  state text,
  district text,
  cld_folder text
);

create table if not exists site (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references project(id) on delete cascade not null,
  name text not null,
  geofence geography(Polygon, 4326),
  centroid geography(Point, 4326)
);

create table if not exists milestone (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references project(id) on delete cascade not null,
  name text not null,
  expected_date date,
  expected_signals text[] default '{}',
  questions text[] default '{}'
);

-- 2. Media & Assets
create table if not exists asset (
  id uuid primary key default gen_random_uuid(),
  short_id text unique not null,
  cld_public_id text not null,
  cld_version bigint not null,
  cld_asset_id text unique,
  resource_type text default 'image',
  format text,
  bytes bigint,
  width int,
  height int,
  duration numeric,
  sha256 text,
  phash bit(64),
  uploader_id uuid references app_user(id),
  captured_at timestamptz not null default now(),
  uploaded_at timestamptz not null default now(),
  exif_taken_at timestamptz,
  exif jsonb,
  location geography(Point, 4326),
  gps_accuracy_m numeric,
  org_corporate_id uuid references organization(id),
  org_ngo_id uuid references organization(id),
  project_id uuid references project(id),
  site_id uuid references site(id),
  milestone_id uuid references milestone(id),
  assign_confidence numeric,
  status text check (status in ('pending','assigned','review','rejected')) default 'pending',
  trust_score int default 100,
  trust_band text check (trust_band in ('verified','review','flagged')) default 'verified',
  trust_checks jsonb default '[]'::jsonb,
  quality_score numeric,
  consent text default 'none',
  search_tsv tsvector,
  deleted_at timestamptz
);

create index if not exists idx_asset_location on asset using gist(location);
create index if not exists idx_asset_hierarchy on asset (project_id, site_id, captured_at);
create index if not exists idx_asset_tsv on asset using gin(search_tsv);

create table if not exists asset_ai (
  asset_id uuid primary key references asset(id) on delete cascade,
  tags jsonb default '[]'::jsonb,
  objects jsonb default '[]'::jsonb,
  activities jsonb default '[]'::jsonb,
  caption text,
  ocr_text text,
  transcript text,
  milestone_answers jsonb default '[]'::jsonb,
  moderation jsonb default '{}'::jsonb,
  embedding vector(1536),
  model_versions jsonb default '{}'::jsonb
);

create index if not exists idx_asset_ai_embedding on asset_ai using hnsw (embedding vector_cosine_ops);

-- 3. Derivatives, Pairs, and Duplicates
create table if not exists derivative (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references asset(id) on delete cascade not null,
  asset_version bigint not null,
  transformation text not null,
  url text not null,
  purpose text not null,
  created_by uuid references app_user(id),
  created_at timestamptz default now()
);

create table if not exists before_after_pair (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references site(id) on delete cascade not null,
  milestone_id uuid references milestone(id),
  before_asset_id uuid references asset(id) not null,
  after_asset_id uuid references asset(id) not null,
  composite_derivative_id uuid references derivative(id),
  change jsonb,
  score numeric,
  source text default 'auto'
);

create table if not exists duplicate_link (
  asset_id uuid references asset(id) on delete cascade not null,
  match_asset_id uuid references asset(id) on delete cascade not null,
  hamming int not null,
  resolution text check (resolution in ('open','legit','fraud')) default 'open',
  primary key (asset_id, match_asset_id)
);

-- 4. Outputs: Reports and Stories
create table if not exists report (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  template_version text not null,
  scope jsonb not null,
  status text check (status in ('draft','published')) default 'draft',
  title text not null,
  period text not null,
  pdf_public_id text,
  pdf_url text,
  prompt_hash text,
  model text,
  created_by uuid references app_user(id),
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists report_item (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references report(id) on delete cascade not null,
  derivative_id uuid references derivative(id),
  section text not null,
  caption text,
  position int not null
);

create table if not exists story (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references project(id) on delete cascade not null,
  format text not null,
  script jsonb not null,
  video_public_id text,
  url text,
  status text check (status in ('draft','rendered')) default 'draft',
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id bigserial primary key,
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  at timestamptz default now()
);

-- 5. Helper RPC Functions
create or replace function candidate_sites(p_lat float, p_lon float, p_buffer_m float default 500)
returns table(id uuid, project_id uuid, name text, inside boolean, distance_m float)
language sql stable as $$
  select s.id, s.project_id, s.name,
         st_contains(s.geofence::geometry, st_setsrid(st_makepoint(p_lon, p_lat), 4326)) as inside,
         st_distance(s.geofence, st_setsrid(st_makepoint(p_lon, p_lat), 4326)::geography) as distance_m
  from site s
  where st_dwithin(s.geofence, st_setsrid(st_makepoint(p_lon, p_lat), 4326)::geography, p_buffer_m)
  order by distance_m asc;
$$;

create or replace function phash_matches(p_asset uuid, p_max int default 10)
returns table(match_id uuid, hamming int, project_id uuid, site_id uuid, captured_at timestamptz)
language sql stable as $$
  select b.id, bit_count(a.phash # b.phash)::int, b.project_id, b.site_id, b.captured_at
  from asset a join asset b on b.id <> a.id and b.org_ngo_id = a.org_ngo_id
  where a.id = p_asset and b.phash is not null and b.deleted_at is null
    and bit_count(a.phash # b.phash) <= p_max
  order by 2 limit 20;
$$;
