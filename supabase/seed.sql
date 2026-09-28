-- ============================================================================
-- PLURIBUS: AI-Powered CSR Evidence Vault — Seed Data (PostgreSQL / Supabase)
-- ============================================================================

-- 1. Organizations
insert into organization (id, type, name, slug, logo_public_id) values
  ('org-corp-1', 'CORPORATE', 'Tata Sustainability Trust', 'tata-trust', 'pluribus/logos/tata_trust'),
  ('org-ngo-1', 'NGO', 'Gramin Vikas Sansthan', 'gramin-vikas', 'pluribus/logos/gramin_vikas'),
  ('org-ngo-2', 'NGO', 'Yuva Parivartan Foundation', 'yuva-parivartan', 'pluribus/logos/yuva_parivartan'),
  ('org-assessor-1', 'ASSESSOR', 'Social Impact Audit Services LLP', 'sias-audit', null)
on conflict (id) do nothing;

-- 2. App Users
insert into app_user (id, org_id, role, name, email, phone, language) values
  ('user-corp-1', 'org-corp-1', 'CORP_ADMIN', 'Arjun Mehta (CSR Head)', 'arjun.mehta@tatatrust.org', null, 'en'),
  ('user-ngo-1', 'org-ngo-1', 'NGO_ADMIN', 'Meena Sharma (Program Director)', 'meena@graminvikas.org', null, 'hi'),
  ('user-field-1', 'org-ngo-1', 'FIELD', 'Ravi Kumar (Field Officer)', null, '+91 98765 43210', 'hi'),
  ('user-assessor-1', 'org-assessor-1', 'ASSESSOR', 'Priya Nair (Lead Impact Auditor)', 'priya.nair@sias-audit.com', null, 'en')
on conflict (id) do nothing;

-- 3. Grants
insert into grant_ (id, corporate_id, ngo_id, title, amount_inr, schedule_vii, start_date, end_date) values
  ('grant-1', 'org-corp-1', 'org-ngo-1', 'Rajasthan Rural WASH & Sanitation Mission', 35000000, 'Item (i) - Eradicating hunger, poverty, sanitation, safe drinking water', '2025-04-01', '2026-03-31'),
  ('grant-2', 'org-corp-1', 'org-ngo-2', 'Maharashtra BALA Model Classrooms & Early Learning', 28000000, 'Item (ii) - Promoting education, vocational skills', '2025-04-01', '2026-03-31'),
  ('grant-3', 'org-corp-1', 'org-ngo-1', 'Bihar Community Afforestation & Water Harvesting', 18000000, 'Item (iv) - Environmental sustainability, agroforestry, conservation', '2025-06-01', '2026-05-31')
on conflict (id) do nothing;

-- 4. Projects
insert into project (id, grant_id, name, description, activities, state, district, cld_folder) values
  ('proj-1', 'grant-1', 'Barmer Clean Water & School Sanitation', 'Installation of community hand pumps, school toilet blocks, and handwashing stations across 12 villages in Barmer.', array['borewell_handpump', 'toilet_block', 'handwashing_station'], 'Rajasthan', 'Barmer', 'pluribus/tata-trust/gramin-vikas/barmer-wash'),
  ('proj-2', 'grant-2', 'Nashik Smart Classrooms & Anganwadi Renovation', 'Structural overhaul of 8 village schools with durable tin roofing, BALA murals, and student study desks.', array['classroom_construction', 'smart_class', 'anganwadi_renovation'], 'Maharashtra', 'Nashik', 'pluribus/tata-trust/yuva-parivartan/nashik-edu'),
  ('proj-3', 'grant-3', 'Gaya Community Plantation & Pond Rejuvenation', 'Desilting village ponds combined with 2,500 tree saplings protected by metal guards and drip irrigation.', array['plantation', 'pond_rejuvenation', 'solar_install'], 'Bihar', 'Gaya', 'pluribus/tata-trust/gramin-vikas/gaya-environment')
on conflict (id) do nothing;

-- 5. Sites
insert into site (id, project_id, name, centroid, geofence) values
  ('site-1', 'proj-1', 'Chohtan Primary School Site',
   st_setsrid(st_makepoint(71.3985, 25.7512), 4326)::geography,
   st_geogfromtext('POLYGON((71.394 25.7485, 71.394 25.7545, 71.403 25.7545, 71.403 25.7485, 71.394 25.7485))')),
  ('site-2', 'proj-1', 'Baytu Gram Panchayat Kiosk',
   st_setsrid(st_makepoint(71.771, 25.882), 4326)::geography,
   st_geogfromtext('POLYGON((71.765 25.878, 71.765 25.886, 71.777 25.886, 71.777 25.878, 71.765 25.878))')),
  ('site-3', 'proj-2', 'Trimbak Zilla Parishad School',
   st_setsrid(st_makepoint(73.535, 19.9385), 4326)::geography,
   st_geogfromtext('POLYGON((73.53 19.934, 73.53 19.943, 73.541 19.943, 73.541 19.934, 73.53 19.934))')),
  ('site-4', 'proj-2', 'Dindori Anganwadi Center',
   st_setsrid(st_makepoint(73.834, 20.201), 4326)::geography,
   st_geogfromtext('POLYGON((73.829 20.196, 73.829 20.206, 73.839 20.206, 73.839 20.196, 73.829 20.196))')),
  ('site-5', 'proj-3', 'Bodh Gaya Bio-Diversity Grove',
   st_setsrid(st_makepoint(84.991, 24.698), 4326)::geography,
   st_geogfromtext('POLYGON((84.985 24.692, 84.985 24.704, 84.997 24.704, 84.997 24.692, 84.985 24.692))'))
on conflict (id) do nothing;

-- 6. Milestones
insert into milestone (id, project_id, name, expected_date, expected_signals, questions) values
  ('m-101', 'proj-1', 'Hand Pump Borewell & Concrete Apron', '2025-08-30', array['handpump', 'borewell', 'concrete platform'], array['Is concrete apron crack-free?', 'Is water actively flowing?']),
  ('m-102', 'proj-1', 'Child-Friendly Handwashing Station', '2025-11-15', array['multi-tap', 'soap dispenser', 'children'], array['Are multiple taps operational?', 'Is soap dispenser present?']),
  ('m-103', 'proj-1', 'School Sanitation Block Completion', '2026-02-28', array['toilet block', 'doors', 'water pipe'], array['Are doors installed and lockable?', 'Is running water plumbed?']),
  ('m-201', 'proj-2', 'Roofing & Weatherproofing Overhaul', '2025-07-20', array['roof', 'tin sheets', 'steel rafters'], array['Is roof sealed against rain?']),
  ('m-202', 'proj-2', 'Dual Desk Delivery & Room Furnishing', '2025-10-10', array['desks', 'benches', 'students'], array['Are dual study desks arranged in rows?']),
  ('m-302', 'proj-3', 'Afforestation Sapling Planting', '2025-11-30', array['saplings', 'tree guards', 'plantation pits'], array['Are saplings protected by metal guards?'])
on conflict (id) do nothing;
