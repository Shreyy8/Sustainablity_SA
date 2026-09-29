-- ============================================================================
-- PLURIBUS: Row Level Security (RLS) Policies for Production Multi-Tenancy
-- Companies Act 2013 Section 135 & India DPDP Act 2023 Tenant Isolation
-- ============================================================================

-- 1. Enable RLS on core tables
alter table organization enable row level security;
alter table app_user enable row level security;
alter table grant_ enable row level security;
alter table project enable row level security;
alter table site enable row level security;
alter table milestone enable row level security;
alter table asset enable row level security;
alter table audit_log enable row level security;

-- 2. Organization Policies
-- Users can only view their own organization, except assessors and super admins
create policy "Users can view their own organization"
  on organization for select
  using (
    id in (
      select org_id from app_user where id = auth.uid()
    )
    or exists (
      select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER')
    )
  );

-- 3. Grants Policies
-- Corporates see grants they funded; NGOs see grants they received
create policy "Tenants can view their associated grants"
  on grant_ for select
  using (
    corporate_id in (select org_id from app_user where id = auth.uid())
    or ngo_id in (select org_id from app_user where id = auth.uid())
    or exists (select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER'))
  );

-- 4. Projects and Sites Policies
-- Restricted by parent grant partnership
create policy "Partners can view projects"
  on project for select
  using (
    grant_id in (
      select id from grant_
      where corporate_id in (select org_id from app_user where id = auth.uid())
         or ngo_id in (select org_id from app_user where id = auth.uid())
    )
    or exists (select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER'))
  );

create policy "Partners can view sites"
  on site for select
  using (
    project_id in (
      select p.id from project p
      join grant_ g on g.id = p.grant_id
      where g.corporate_id in (select org_id from app_user where id = auth.uid())
         or g.ngo_id in (select org_id from app_user where id = auth.uid())
    )
    or exists (select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER'))
  );

-- 5. Asset Policies
-- Field officers can insert assets for their NGO sites; Corporate can read verified assets
create policy "NGO users can insert assets"
  on asset for insert
  with check (
    org_ngo_id in (select org_id from app_user where id = auth.uid())
  );

create policy "Tenants can view relevant assets"
  on asset for select
  using (
    org_corporate_id in (select org_id from app_user where id = auth.uid())
    or org_ngo_id in (select org_id from app_user where id = auth.uid())
    or exists (select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER'))
  );

-- 6. Audit Log Policies
-- Append-only for all actors, read-only for Assessors and Super Admins
create policy "System can append audit logs"
  on audit_log for insert
  with check (true);

create policy "Only auditors and super admins can read audit logs"
  on audit_log for select
  using (
    exists (select 1 from app_user where id = auth.uid() and role in ('ASSESSOR', 'SUPER'))
  );
