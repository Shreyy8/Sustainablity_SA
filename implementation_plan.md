# Implementation Plan — Saakshi: AI-Powered CSR Evidence Vault

| Field | Value |
|---|---|
| Companion to | `prd.md` v1.0 |
| Version | 1.0 — 28 Sep 2026 |
| Scope | Full build: hackathon MVP (36 h) → production v1 (12 weeks) |
| Team assumed | 4 engineers: **A** Frontend, **B** Backend/DB, **C** AI/Pipeline, **D** Cloudinary/Media + DevOps |

> **How to use this plan.** Work through the phases in order. Each phase lists its **goal**, **tasks** (with IDs, the files they touch and an owner), **key code**, **acceptance criteria (AC)** and an **estimate**. Tasks tagged 🏁 are required for the hackathon MVP. Everything else belongs to the 12-week product track. §19 maps tasks to the calendar.

---

## Table of contents
1. [Architecture decisions](#1-architecture-decisions)
2. [Repository structure](#2-repository-structure)
3. [Phase 0 — Accounts, environments and Cloudinary provisioning](#phase-0--accounts-environments-and-cloudinary-provisioning)
4. [Phase 1 — Foundation: DB, auth, RLS, app shell](#phase-1--foundation-db-auth-rls-app-shell)
5. [Phase 2 — Ingestion: signed upload, webhook, job pipeline](#phase-2--ingestion-signed-upload-webhook-job-pipeline)
6. [Phase 3 — AI enrichment](#phase-3--ai-enrichment)
7. [Phase 4 — Auto-assignment and trust engine](#phase-4--auto-assignment-and-trust-engine)
8. [Phase 5 — Project views: timeline and map](#phase-5--project-views-timeline-and-map)
9. [Phase 6 — Search](#phase-6--search)
10. [Phase 7 — Before/after engine](#phase-7--beforeafter-engine)
11. [Phase 8 — Evidence page and lineage](#phase-8--evidence-page-and-lineage)
12. [Phase 9 — Review inbox and corporate dashboard](#phase-9--review-inbox-and-corporate-dashboard)
13. [Phase 10 — Report generator](#phase-10--report-generator)
14. [Phase 11 — Story / reel studio](#phase-11--story--reel-studio)
15. [Phase 12 — Privacy, security hardening](#phase-12--privacy-security-hardening)
16. [Phase 13 — Offline PWA, i18n, voice notes](#phase-13--offline-pwa-i18n-voice-notes)
17. [Phase 14 — Production readiness](#phase-14--production-readiness)
18. [Testing strategy](#18-testing-strategy)
19. [Schedules: hackathon and 12-week](#19-schedules)
20. [Seed data and demo preparation](#20-seed-data-and-demo-preparation)
21. [Definition of Done and checklists](#21-definition-of-done-and-checklists)
22. [Dependency and risk register](#22-dependency-and-risk-register)

---

## 1. Architecture decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| AD-1 | Repo layout | **pnpm + Turborepo monorepo** | Shared domain logic between the web app and workers |
| AD-2 | Web framework | **Next.js 15 (App Router) + React 19 + TypeScript (strict)** | SSR, route handlers, server actions, PWA support |
| AD-3 | UI | Tailwind v4 + shadcn/ui + lucide-react | Fast, accessible primitives |
| AD-4 | Media | **Cloudinary** (`cloudinary` Node SDK v2, `next-cloudinary`) | System of record for media, AI and delivery |
| AD-5 | Database | **Supabase** (Postgres 16 + PostGIS + pgvector + Auth + Realtime + RLS) | Geo, vector and auth in one managed service |
| AD-6 | Migrations | Supabase CLI SQL migrations (`supabase/migrations`) + generated TS types | Plain SQL is the best fit for PostGIS/pgvector/RLS |
| AD-7 | Data access | `@supabase/ssr` + typed queries; SQL functions (RPC) for geo, vector and search | Keeps heavy logic close to the data |
| AD-8 | Background jobs | **Inngest** (functions served from Next.js `/api/inngest`) | Retries, step functions, idempotency and concurrency limits without running infrastructure |
| AD-9 | Heavy rendering | Separate **render service** (`apps/render`, Fastify + Puppeteer) on Railway/Fly | Headless Chromium doesn't fit serverless size and time limits |
| AD-10 | LLM | Anthropic Claude (vision + text) via `@anthropic-ai/sdk`, structured outputs validated with **zod** | Grounded JSON outputs |
| AD-11 | Embeddings | 1536-dim text embeddings (provider behind an interface; e.g. OpenAI `text-embedding-3-small`) + optional CLIP 512-dim (P1) | Matches `vector(1536)` in the schema |
| AD-12 | Maps | MapLibre GL (`react-map-gl/maplibre`) + OSM tiles; **Terra Draw** for geofences | Free, no vendor lock-in |
| AD-13 | Lineage graph | `@xyflow/react` (React Flow) | Easy DAG rendering |
| AD-14 | PWA / offline | **Serwist** (service worker) + **Dexie** (IndexedDB) | Maintained successor to next-pwa |
| AD-15 | i18n | `next-intl` (en, hi) | App Router-native |
| AD-16 | Testing | Vitest (unit), Playwright (E2E), MSW (HTTP mocks), pgTAP (RLS) | Coverage at each layer |
| AD-17 | Observability | Sentry (errors), PostHog (product), Inngest dashboard (jobs), Axiom/Logtail (logs) | |
| AD-18 | Hosting | Vercel (web + Inngest endpoint), Railway (render), Supabase Cloud (Mumbai region `ap-south-1`) | Low latency for Indian users; data stays in India |

**Integration principle:** direct Cloudinary SDK calls live in exactly one place, `packages/media`. The app talks to it through typed functions (`uploadParams()`, `buildComposite()`, `analyzeWithVision()`…). If a Cloudinary API changes or an add-on is missing, only that package changes.

---

## 2. Repository structure

```
saakshi/
├─ apps/
│  ├─ web/                          # Next.js 15 app (UI + API routes + Inngest endpoint)
│  │  ├─ app/
│  │  │  ├─ [locale]/
│  │  │  │  ├─ (auth)/login/page.tsx
│  │  │  │  ├─ (app)/layout.tsx                 # sidebar shell, org switcher
│  │  │  │  ├─ (app)/dashboard/page.tsx         # S2 portfolio
│  │  │  │  ├─ (app)/projects/[id]/page.tsx     # S3 project page
│  │  │  │  ├─ (app)/search/page.tsx            # S4
│  │  │  │  ├─ (app)/assets/[id]/page.tsx       # S5 internal evidence view
│  │  │  │  ├─ (app)/pairs/[id]/page.tsx        # S6 before/after studio
│  │  │  │  ├─ (app)/review/page.tsx            # S7
│  │  │  │  ├─ (app)/reports/new/page.tsx       # S8
│  │  │  │  ├─ (app)/reports/[id]/page.tsx
│  │  │  │  ├─ (app)/stories/new/page.tsx       # S9
│  │  │  │  ├─ (app)/setup/...                  # S10 orgs/grants/projects/sites/milestones
│  │  │  │  └─ capture/page.tsx                 # S1 PWA capture (mobile-first)
│  │  │  ├─ e/[shortId]/page.tsx                # public evidence page
│  │  │  └─ api/
│  │  │     ├─ cloudinary/sign/route.ts
│  │  │     ├─ webhooks/cloudinary/route.ts
│  │  │     ├─ inngest/route.ts
│  │  │     ├─ search/route.ts
│  │  │     ├─ search/image/route.ts
│  │  │     ├─ assets/[id]/route.ts
│  │  │     ├─ assets/[id]/lineage/route.ts
│  │  │     ├─ projects/[id]/timeline/route.ts
│  │  │     ├─ projects/[id]/map/route.ts
│  │  │     ├─ review/route.ts
│  │  │     ├─ pairs/route.ts  pairs/[id]/route.ts
│  │  │     ├─ reports/route.ts reports/[id]/publish/route.ts
│  │  │     └─ stories/route.ts
│  │  ├─ components/ (ui/, map/, media/, trust/, lineage/, report/, story/)
│  │  ├─ inngest/ (client.ts, functions/*.ts)
│  │  ├─ lib/ (supabase/, auth.ts, rbac.ts, analytics.ts)
│  │  ├─ messages/ (en.json, hi.json)
│  │  └─ public/ (manifest.webmanifest, icons/)
│  └─ render/                       # Fastify + Puppeteer PDF service
│     ├─ src/server.ts
│     └─ src/templates/ (quarterly.tsx, annexure.tsx, impact-pack.tsx)
├─ packages/
│  ├─ core/                         # pure domain logic (no I/O) — heavily unit-tested
│  │  ├─ taxonomy/ (taxonomy.yaml, index.ts)
│  │  ├─ trust/ (score.ts, checks/*.ts)
│  │  ├─ assign/ (score.ts)
│  │  ├─ pairs/ (candidates.ts)
│  │  ├─ report/ (select.ts, facts.ts, citations.ts)
│  │  ├─ story/ (script.ts)
│  │  └─ geo/ (distance.ts)
│  ├─ media/                        # ALL Cloudinary code lives here
│  │  ├─ client.ts                  # configured SDK instance
│  │  ├─ upload.ts                  # sign params, preset names
│  │  ├─ webhook.ts                 # signature verification, payload types
│  │  ├─ urls.ts                    # named transformations, composite, stamp, reel URL builders
│  │  ├─ vision.ts                  # AI Vision (tagging/moderation/general) + LLM fallback
│  │  ├─ metadata.ts                # SMD write-back, tags
│  │  ├─ search.ts                  # Search API + Visual Search wrappers
│  │  └─ explicit.ts                # eager/explicit pre-render
│  ├─ ai/                           # LLM + embeddings wrappers, prompts, zod schemas
│  │  ├─ llm.ts  embed.ts  prompts/*.ts  schemas/*.ts
│  ├─ db/                           # generated Supabase types + typed query helpers
│  └─ config/                       # eslint, tsconfig, tailwind presets
├─ supabase/
│  ├─ migrations/ (0001_extensions.sql … 0012_rls.sql)
│  ├─ seed.sql
│  └─ tests/ (rls.test.sql — pgTAP)
├─ scripts/
│  ├─ cloudinary-setup.ts           # idempotent provisioning (SMD, presets, named transformations)
│  ├─ seed-media.ts                 # uploads demo dataset with injected EXIF/GPS
│  └─ eval/ (assign-eval.ts, dup-eval.ts, search-eval.ts)
├─ e2e/ (playwright specs)
├─ .github/workflows/ (ci.yml, deploy.yml)
├─ turbo.json  pnpm-workspace.yaml  .env.example  README.md
```

---

## Phase 0 — Accounts, environments and Cloudinary provisioning

**Goal:** every service is provisioned and repeatable from scripts, so any teammate can run `pnpm setup` and get a working environment.
**Owner:** D (with B) · **Estimate:** 🏁 3 h (hackathon) / 2 days (product)

### Tasks
| ID | Task | Owner | 🏁 |
|---|---|---|---|
| P0-1 | Create Cloudinary product environments: `saakshi-dev`, `saakshi-prod` | D | 🏁 |
| P0-2 | Enable add-ons: **Cloudinary AI Content Analysis**, **Cloudinary AI Vision**, **OCR Text Detection**, **Google AI Video Transcription**, **AWS Rekognition (moderation)**; request **Visual Search** enablement | D | 🏁 |
| P0-3 | Console settings: **Strict transformations ON**, **Backup ON**, allowed fetch domains = none, Upload notification URL (default) | D | 🏁 |
| P0-4 | Supabase project (Mumbai region); enable `postgis`, `vector`, `pg_trgm`, `pgcrypto` | B | 🏁 |
| P0-5 | Inngest app + signing keys; Anthropic key; embeddings key; Sentry, PostHog projects | B | 🏁 (Sentry/PostHog optional) |
| P0-6 | Vercel project linked to `apps/web`; Railway service for `apps/render` | D | 🏁 |
| P0-7 | Write `scripts/cloudinary-setup.ts` (idempotent) | D | 🏁 |
| P0-8 | `.env.example`, secrets in Vercel/Railway; `pnpm setup` script | D | 🏁 |
| P0-9 | Public tunnel for local webhooks (`cloudflared` or `ngrok`) documented in README | D | 🏁 |

### Key code — `scripts/cloudinary-setup.ts`
```ts
import { v2 as cld } from "cloudinary";
cld.config({ secure: true }); // reads CLOUDINARY_URL

const SMD = [
  { external_id: "sk_org_corp",   label: "Corporate",   type: "string" },
  { external_id: "sk_org_ngo",    label: "NGO",         type: "string" },
  { external_id: "sk_project",    label: "Project",     type: "string" },
  { external_id: "sk_site",       label: "Site",        type: "string" },
  { external_id: "sk_milestone",  label: "Milestone",   type: "string" },
  { external_id: "sk_captured_at",label: "Captured at", type: "date" },
  { external_id: "sk_lat",        label: "Latitude",    type: "number" },
  { external_id: "sk_lng",        label: "Longitude",   type: "number" },
  { external_id: "sk_trust",      label: "Trust score", type: "integer" },
  { external_id: "sk_trust_band", label: "Trust band",  type: "enum",
    datasource: { values: ["verified","review","flagged"].map(v => ({ external_id: v, value: v })) } },
  { external_id: "sk_consent",    label: "Consent",     type: "enum",
    datasource: { values: ["none","verbal","written"].map(v => ({ external_id: v, value: v })) } },
  { external_id: "sk_status",     label: "Status",      type: "enum",
    datasource: { values: ["pending","assigned","review","rejected"].map(v => ({ external_id: v, value: v })) } },
  { external_id: "sk_activity",   label: "Activity",    type: "set",
    datasource: { values: taxonomyKeys().map(k => ({ external_id: k, value: k })) } },
];

const NAMED = {
  sk_thumb:       "c_fill,g_auto,w_400,h_300/q_auto/f_auto",
  sk_report:      "c_limit,w_1600/e_improve/q_auto:good/f_jpg",
  sk_public:      "e_blur_faces:800/c_limit,w_1600/q_auto/f_auto",
  sk_reel_frame:  "c_fill,g_auto,ar_9:16,w_1080/q_auto",
  sk_carousel:    "c_fill,g_auto,ar_1:1,w_1080/q_auto",
};

const PRESETS = [
  { name: "saakshi_field_signed", unsigned: false, overwrite: false, unique_filename: true,
    use_asset_folder_as_public_id_prefix: true,
    phash: true, media_metadata: true, quality_analysis: true,
    auto_tagging: 0.6, categorization: "google_tagging", detection: "coco_v2",
    ocr: "adv_ocr", moderation: "aws_rek",
    notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
    eager_async: true, eager: "t_sk_thumb|t_sk_report" },
  { name: "saakshi_video_signed", unsigned: false, overwrite: false, resource_type: "video",
    raw_convert: "google_speech:vtt", notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
    eager_async: true, eager: "e_preview:duration_12/c_fill,g_auto,ar_9:16,w_720/q_auto|so_auto/c_fill,g_auto,w_400,h_300/f_jpg" },
];

async function upsert<T>(label: string, create: () => Promise<T>) {
  try { await create(); console.log("✓", label); }
  catch (e: any) { if (/already exists/i.test(e?.error?.message ?? e?.message)) console.log("=", label); else throw e; }
}

(async () => {
  for (const f of SMD) await upsert(`smd ${f.external_id}`, () => cld.api.add_metadata_field(f as any));
  for (const [n, t] of Object.entries(NAMED)) await upsert(`t_${n}`, () => cld.api.create_transformation(n, t));
  for (const p of PRESETS) await upsert(`preset ${p.name}`,
    () => cld.api.create_upload_preset(p as any).catch(() => cld.api.update_upload_preset(p.name, p as any)));
})();
```
> ⚠️ Check each add-on's parameter value (`categorization`, `detection`, `ocr`, `moderation`, `raw_convert`) against the current Cloudinary docs **for the add-ons enabled on your account**. The script should log and skip any parameter the account rejects rather than fail. Named transformations can only be created after the account has strict-transformation permissions set.

### AC
- `pnpm setup` runs twice with no errors (idempotent).
- In the Cloudinary console, all 13 SMD fields, 5 named transformations and 2 presets are visible.
- A test upload through the preset returns `phash`, `image_metadata`, `tags`, `info.detection` and `quality_analysis` in the response.

---

## Phase 1 — Foundation: DB, auth, RLS, app shell

**Goal:** a signed-in user sees an org-scoped app shell, with the schema and RLS in place and seed data loaded.
**Owners:** B (DB), A (UI) · **Estimate:** 🏁 5 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P1-1 | Monorepo scaffold (pnpm, turbo, tsconfig strict, eslint, prettier) | root | D | 🏁 |
| P1-2 | Next.js app with Tailwind + shadcn; theme tokens; `next-intl` | `apps/web` | A | 🏁 |
| P1-3 | Migrations: extensions, tenancy, project/site/milestone, asset/asset_ai, derivative, pairs, duplicates, report/story, audit_log (per PRD §15) | `supabase/migrations/0001…0010` | B | 🏁 |
| P1-4 | Extra columns and indexes: `asset.org_corporate_id`, `asset.org_ngo_id` (denormalized for RLS speed), `asset.search_tsv tsvector`, HNSW on `asset_ai.embedding`, GIST on `site.geofence` & `asset.location` | `0011_indexes.sql` | B | 🏁 |
| P1-5 | RLS policies + helper `auth_org_ids()` SQL function | `0012_rls.sql` | B | 🏁 |
| P1-6 | pgTAP tests for RLS (corp can't see other corp; NGO can't see other NGO; field user insert limits) | `supabase/tests` | B | |
| P1-7 | Supabase Auth: email OTP + phone OTP (field workers) | `lib/supabase`, `(auth)` | A | 🏁 email only |
| P1-8 | App shell: sidebar, org switcher, role-aware nav | `(app)/layout.tsx` | A | 🏁 |
| P1-9 | Setup screens: org/grant/project CRUD, **site geofence drawing (Terra Draw)**, milestones with expected signals + questions | `(app)/setup/*` | A | 🏁 (project + site draw only; rest seeded) |
| P1-10 | `seed.sql`: 1 corporate, 2 NGOs, 3 grants, 3 projects, 6 sites (real polygons in 3 districts), 12 milestones, 5 users | `supabase/seed.sql` | B | 🏁 |
| P1-11 | Generate DB types → `packages/db` (`supabase gen types`) | `packages/db` | B | 🏁 |
| P1-12 | `audit()` helper writing to `audit_log` from server actions | `lib/audit.ts` | B | |

### Key code — RLS core
```sql
create or replace function auth_org_ids() returns uuid[]
language sql stable security definer as $$
  select array_agg(org_id) from app_user where id = auth.uid()
$$;

alter table asset enable row level security;
create policy asset_read on asset for select using (
  org_ngo_id = any(auth_org_ids()) or org_corporate_id = any(auth_org_ids())
  or exists (select 1 from assessor_share s
             where s.grant_id = asset.grant_id and s.user_id = auth.uid() and s.expires_at > now())
);
create policy asset_insert_field on asset for insert with check (
  exists (select 1 from project_member pm
          where pm.user_id = auth.uid() and pm.project_id = asset.project_hint_id)
);
```
*(Add `project_member(project_id, user_id, role)` and `assessor_share(grant_id, user_id, expires_at)` tables. `asset.project_hint_id` is the project the uploader picked, which may differ from the final `project_id`.)*

### AC
- Logging in as corp admin shows only that corporate's grants. NGO admin sees only their own. pgTAP tests pass.
- A site geofence drawn on the map is saved as a PostGIS polygon and shown again on reload.

---

## Phase 2 — Ingestion: signed upload, webhook, job pipeline

**Goal:** a photo taken on a phone lands in Cloudinary, gets an `asset` row, and triggers an idempotent pipeline whose progress shows in real time.
**Owners:** D (Cloudinary), B (webhook/jobs), A (capture UI) · **Estimate:** 🏁 6 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P2-1 | `packages/media/upload.ts`: `buildUploadParams({user, project, geo})` → folder, tags, context, metadata | media | D | 🏁 |
| P2-2 | `POST /api/cloudinary/sign`: auth → check project membership → sign with `api_sign_request` | web/api | B | 🏁 |
| P2-3 | Capture page: `CldUploadWidget` (camera + local, multiple), GPS capture with accuracy, milestone picker, upload progress list | `capture/page.tsx` | A | 🏁 |
| P2-4 | Desktop bulk upload (drag folder/zip). The Upload Widget handles multiple files; EXIF comes back via `media_metadata` | `components/media/BulkUpload.tsx` | A | 🏁 |
| P2-5 | Client `onSuccess` → `POST /api/assets` creates a `pending` row (upserts on `cld_asset_id`) so the UI shows the card straight away | web/api | B | 🏁 |
| P2-6 | `POST /api/webhooks/cloudinary`: verify signature, upsert asset from payload, emit `asset/uploaded` Inngest event keyed on `asset_id:version` | web/api, media/webhook.ts | B | 🏁 |
| P2-7 | Inngest pipeline `asset.process` with steps: `enrich → vision → caption-embed → assign → verify → index → pair` (bodies stubbed in this phase) | `inngest/functions/processAsset.ts` | C | 🏁 |
| P2-8 | Realtime: `asset` row status changes pushed via a Supabase Realtime channel; the UI card updates its status (Processing → Assigned/Review/Flagged) | `components/media/AssetCard.tsx` | A | 🏁 |
| P2-9 | Video path: `saakshi_video_signed` preset; transcription completion arrives as a separate notification → `asset/transcribed` event | media, inngest | D | |
| P2-10 | Dead-letter handling: failed steps after N retries set `status='error'` and appear in the admin view | inngest | C | |

### Key code — webhook
```ts
// apps/web/app/api/webhooks/cloudinary/route.ts
import { verifyWebhook, type CldNotification } from "@saakshi/media/webhook";
import { inngest } from "@/inngest/client";
import { upsertAssetFromUpload } from "@/lib/assets";

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers)) return new Response("bad sig", { status: 401 });
  const n = JSON.parse(raw) as CldNotification;

  switch (n.notification_type) {
    case "upload": {
      const asset = await upsertAssetFromUpload(n);         // idempotent on cld_asset_id
      await inngest.send({ name: "asset/uploaded", id: `${n.asset_id}:${n.version}`,
                           data: { assetId: asset.id } });
      break;
    }
    case "info":        // add-on async completions (e.g. transcription)
      await inngest.send({ name: "asset/addon-complete", id: `${n.asset_id}:${n.info_kind}`, data: n });
      break;
    case "eager":       // derivatives ready — record in `derivative`
      await inngest.send({ name: "asset/eager-ready", data: n });
      break;
  }
  return Response.json({ ok: true });
}
```

```ts
// packages/media/webhook.ts
import { v2 as cld } from "cloudinary";
export function verifyWebhook(body: string, h: Headers) {
  const ts = Number(h.get("x-cld-timestamp")); const sig = h.get("x-cld-signature") ?? "";
  return cld.utils.verifyNotificationSignature(body, ts, sig, 600);
}
```

### Key code — pipeline skeleton
```ts
export const processAsset = inngest.createFunction(
  { id: "asset-process", concurrency: { limit: 10 }, retries: 4 },
  { event: "asset/uploaded" },
  async ({ event, step }) => {
    const { assetId } = event.data;
    const enriched = await step.run("enrich",        () => enrich(assetId));
    const vision   = await step.run("vision",        () => visionTag(assetId, enriched));
    await            step.run("caption-embed",       () => captionAndEmbed(assetId));
    const assign   = await step.run("assign",        () => assignAsset(assetId));
    const trust    = await step.run("verify",        () => computeTrust(assetId));
    await            step.run("index",               () => writeBack(assetId, { assign, trust }));
    if (assign.siteId) await step.sendEvent("pair", { name: "asset/assigned", data: { assetId } });
  }
);
```

### AC
- Upload 10 photos from a phone: all 10 show up as cards within 5 s, and each reaches a final status within 60 s.
- Replaying a webhook (same payload) creates no duplicate rows or jobs.
- An invalid signature returns 401.

---

## Phase 3 — AI enrichment

**Goal:** every asset has normalized tags, objects with counts, OCR text, EXIF, quality, activity taxonomy labels, milestone Q&A answers, a caption and an embedding.
**Owner:** C (with D for Cloudinary APIs) · **Estimate:** 🏁 6 h / 1.5 weeks

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P3-1 | `enrich()`: fetch the full resource via Admin API `resource(public_id, {image_metadata:true, phash:true, quality_analysis:true})` if the webhook payload lacks fields; normalize tags (source-labelled), `info.detection` objects → counts, `info.ocr` → text; store EXIF, phash → `bit(64)` | `packages/core` + `inngest/steps/enrich.ts` | C | 🏁 |
| P3-2 | Taxonomy file `taxonomy.yaml` (≈40 activities with descriptions, Schedule VII, SDG) + loader | `packages/core/taxonomy` | C | 🏁 |
| P3-3 | `media/vision.ts`: `visionTag(url, taxonomy)` → Cloudinary **AI Vision – Tagging** with tag definitions (name + description) | media | D | 🏁 |
| P3-4 | `visionAsk(url, questions[])` → AI Vision **General** mode for milestone questions | media | D | 🏁 |
| P3-5 | `visionModerate(url)` → AI Vision **Moderation** mode ("identifiable child face?", "nudity/violence?") | media | D | |
| P3-6 | **LLM fallback** for P3-3/4/5 with the same zod output schema (Claude vision, image passed by URL of the `t_sk_report` derivative) | `packages/ai` | C | 🏁 |
| P3-7 | Caption: LLM given image + tags + OCR → 1–2 sentence factual caption (≤200 chars) | ai/prompts/caption.ts | C | 🏁 |
| P3-8 | Embedding: `embed(caption + activities + tags + ocr + transcript)` → `asset_ai.embedding`; update `asset.search_tsv` | ai/embed.ts | C | 🏁 |
| P3-9 | Result cache table `ai_cache(key text pk, result jsonb)`, keyed on `sha(asset_id:version:prompt_version)` | db + ai | C | 🏁 |
| P3-10 | Video enrichment: use `e_preview` + `so_auto` frame; run tagging on 3 keyframes (`so_10p`, `so_50p`, `so_90p`); ingest the transcript VTT | inngest | C | |
| P3-11 | Rate limiting: Inngest `throttle` on vision/LLM steps per provider | inngest | C | 🏁 |
| P3-12 | Eval harness `scripts/eval/tag-eval.ts` against a labelled seed set (precision@activity) | scripts | C | |

### Key code — AI Vision wrapper (with fallback)
```ts
// packages/media/vision.ts
const BASE = `https://api.cloudinary.com/v2/analysis/${CLOUD}/analyze`;
const auth = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

export async function visionTag(uri: string, defs: {name: string; description: string}[]) {
  try {
    const r = await fetch(`${BASE}/ai_vision_tagging`, {
      method: "POST", headers: { authorization: auth, "content-type": "application/json" },
      body: JSON.stringify({ source: { uri }, tag_definitions: defs }),
    });
    if (!r.ok) throw new Error(`vision ${r.status}`);
    return normalizeVisionTags(await r.json());                 // → [{key, confidence, source:'cld_ai_vision'}]
  } catch (e) {
    return llmTag(uri, defs);                                    // same schema, source:'llm'
  }
}
// visionAsk → /ai_vision_general with { source:{uri}, prompts:[...] }
// visionModerate → /ai_vision_moderation with { source:{uri}, rejection_questions:[...] }
```
> ⚠️ Confirm the exact endpoint paths and body field names against the AI Vision add-on docs for your account before wiring this up. The wrapper exists so only this file has to change.

### Key code — output schemas (zod)
```ts
export const ActivityTags = z.array(z.object({
  key: z.enum(TAXONOMY_KEYS), confidence: z.number().min(0).max(1),
}));
export const MilestoneAnswers = z.array(z.object({
  question: z.string(), answer: z.enum(["yes","no","unclear"]), detail: z.string().max(200),
}));
export const Caption = z.object({ caption: z.string().max(200), people_count: z.number().int().nullable() });
```

### AC
- On the 80-image seed set, the top activity is correct for ≥80% of images.
- Every processed asset has a caption, an embedding and ≥1 activity, or is explicitly routed to review.
- Turning off the AI Vision add-on (a feature flag) still completes the pipeline through the LLM fallback.

---

## Phase 4 — Auto-assignment and trust engine

**Goal:** assets are placed in the right project/site/milestone and scored for trust with explainable reasons.
**Owners:** C (logic), B (SQL) · **Estimate:** 🏁 5 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P4-1 | SQL RPC `candidate_sites(lat, lng, buffer_m)` → sites with `inside bool`, `distance_m` | migration | B | 🏁 |
| P4-2 | `core/assign/score.ts` (pure): geofence 0.5 + activity overlap 0.3 + date fit 0.2; milestone pick by signal overlap + date proximity | core | C | 🏁 |
| P4-3 | Assign step: threshold 0.75 → assign; else `status='review'` with top-3 suggestions in `asset.assign_suggestions jsonb` | inngest | C | 🏁 |
| P4-4 | SQL RPC `phash_matches(asset_id, max_hamming)` using `bit_count(a.phash # b.phash)` within tenant, excluding self | migration | B | 🏁 |
| P4-5 | `core/trust/checks/*.ts`: `duplicate`, `geofence`, `time`, `exif`, (`synthetic` P1). Each returns `{id, penalty, severity, reason, evidence}` | core | C | 🏁 |
| P4-6 | `core/trust/score.ts`: combine checks, clamp, band; burst rule (same site/milestone <24 h → no penalty, group as burst) | core | C | 🏁 |
| P4-7 | Persist `trust_score`, `trust_band`, `trust_checks`; insert `duplicate_link` rows | inngest | C | 🏁 |
| P4-8 | Write back to Cloudinary: `update_metadata` (`sk_*`), `add_tag(sk:activity:*)`, `remove_tag(sk:pending)` | media/metadata.ts | D | 🏁 |
| P4-9 | Re-score trigger: when an asset is reassigned or a duplicate resolved as "legit" → recompute affected assets | inngest | C | |
| P4-10 | Synthetic-image check (P1): pluggable detector interface; start with an LLM heuristic + EXIF absence + C2PA manifest presence check | core + ai | C | |
| P4-11 | Unit tests: 30+ table-driven cases for trust and assignment | core/**/*.test.ts | C | 🏁 (core cases) |

### Key code — trust scoring (pure)
```ts
export type Check = { id: string; penalty: number; reason: string; evidence?: unknown };

export function scoreTrust(input: TrustInput): { score: number; band: Band; checks: Check[] } {
  const checks = [
    duplicateCheck(input.matches, input.asset),   // ≤4 → 60, 5–10 → 30, burst → 0
    geofenceCheck(input.site, input.asset),       // 0 / 10 / 25, no GPS → 15
    timeCheck(input.asset, input.grant),          // exif vs device > 48h → 10; outside grant → 20; future → 20
    exifCheck(input.asset.exif),                  // none → 5; editor software → 10
  ].filter((c): c is Check => !!c && c.penalty > 0);
  const score = Math.max(0, Math.min(100, 100 - checks.reduce((s, c) => s + c.penalty, 0)));
  return { score, band: score >= 75 ? "verified" : score >= 50 ? "review" : "flagged", checks };
}
```

### Key code — phash RPC
```sql
create or replace function phash_matches(p_asset uuid, p_max int default 10)
returns table(match_id uuid, hamming int, project_id uuid, site_id uuid, captured_at timestamptz)
language sql stable as $$
  select b.id, bit_count(a.phash # b.phash)::int, b.project_id, b.site_id, b.captured_at
  from asset a join asset b on b.id <> a.id and b.org_ngo_id = a.org_ngo_id   -- MVP: within NGO
  where a.id = p_asset and b.phash is not null and b.deleted_at is null
    and bit_count(a.phash # b.phash) <= p_max
  order by 2 limit 20;
$$;
```
*Scaling note (P2):* split the 64-bit phash into *k* bands, store them with a GIN/B-tree index, and prefilter candidates that share at least one band exactly before computing the full Hamming distance. By the pigeonhole principle, a pair with Hamming distance *d* is guaranteed to share a band when *d < k*. To catch every match at ≤10, use 16 bands of 4 bits (or 11+ bands), trading some prefilter selectivity for guaranteed recall.

### AC
- All 6 planted duplicates are flagged (2 exact → Flagged, 4 near → Review or Flagged), with no false flags on the 20 same-site burst shots.
- An asset uploaded 3 km from its site gets a −25 geofence penalty with a readable reason.
- ≥80% auto-assignment accuracy on the seed set, with the rest in review with the correct option in the top 3.

---

## Phase 5 — Project views: timeline and map

**Goal:** a project page that tells the evidence story visually.
**Owner:** A (with B for APIs) · **Estimate:** 🏁 4 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P5-1 | `GET /api/projects/:id/timeline` → milestones with assets (sorted), coverage % per milestone | api | B | 🏁 |
| P5-2 | `GET /api/projects/:id/map` → GeoJSON: site polygons + asset points (trust band as a property) | api | B | 🏁 |
| P5-3 | Project header: grant, NGO, amount, dates, milestone progress track (planned vs evidenced) | components | A | 🏁 |
| P5-4 | Timeline strip (horizontal, grouped by milestone, `CldImage` with `t_sk_thumb`, trust badge) | components | A | 🏁 |
| P5-5 | Map (MapLibre): polygons, clustered points, click → asset drawer | components/map | A | 🏁 |
| P5-6 | Asset drawer: large image (`t_sk_report`), caption, tags, trust chips with reasons | components | A | 🏁 |
| P5-7 | AI project summary card (LLM over the facts bundle, cached per project and invalidated on new assets) | ai + api | C | |
| P5-8 | Video: `CldVideoPlayer` with the transcript as subtitles | components | A | |

### AC
- A project with 30 assets loads in <1.5 s on simulated fast 4G. Thumbnails are served as AVIF/WebP via `f_auto`.
- Clicking a map point opens the right asset. Trust badges match the DB.

---

## Phase 6 — Search

**Goal:** natural-language plus faceted search with "why it matched".
**Owners:** C (ranking), B (SQL), A (UI) · **Estimate:** 🏁 4 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P6-1 | Query parser: LLM → `{text, filters}` (zod), with date/place normalization; cache by query string | ai/prompts/query.ts | C | 🏁 |
| P6-2 | SQL RPC `search_assets(q_embedding, filters jsonb, q_text, limit)`: RLS-aware; hybrid score = 0.6·cosine + 0.2·trust + 0.1·quality + 0.1·recency, with a `ts_rank` boost from `search_tsv` | migration | B | 🏁 |
| P6-3 | `media/search.ts`: Cloudinary **Visual Search** (`visual_search({ text })`) when `FEATURE_CLD_VISUAL_SEARCH=1`; map returned asset_ids → DB rows (drop anything RLS hides); merge with reciprocal-rank fusion | media + api | D | |
| P6-4 | "Why matched": the terms from the query found in tags/caption/OCR, plus the matched filters | api | C | 🏁 |
| P6-5 | Facet counts (activity, project, state, trust band, type) via SQL `group by` over the filtered set | api | B | 🏁 |
| P6-6 | Search UI: one bar, parsed filter chips (editable), facet sidebar, masonry results, infinite scroll | `search/page.tsx` | A | 🏁 |
| P6-7 | Image-to-image search: upload query image (unsigned temp preset → deleted after 1 h) → CLIP embedding or Cloudinary Visual Search by image | api | C | |
| P6-8 | Eval: 20 golden queries → top-5 hit rate ≥ 80% (`scripts/eval/search-eval.ts`) | scripts | C | 🏁 |

### Key code — hybrid search RPC (sketch)
```sql
create or replace function search_assets(q_emb vector(1536), f jsonb, q_text text, lim int default 40)
returns table(id uuid, score float, caption text) language sql stable as $$
  with base as (
    select a.id, ai.caption, a.trust_score, a.quality_score, a.captured_at,
           1 - (ai.embedding <=> q_emb) as sim,
           ts_rank(a.search_tsv, plainto_tsquery('simple', q_text)) as kw
    from asset a join asset_ai ai on ai.asset_id = a.id
    where a.deleted_at is null and a.status <> 'rejected'
      and (f->>'project_id' is null or a.project_id = (f->>'project_id')::uuid)
      and (f->'activities' is null or ai.activities @> ... )      -- jsonb containment on keys
      and (f->>'state' is null or a.state = f->>'state')
      and (f->>'from' is null or a.captured_at >= (f->>'from')::timestamptz)
      and (f->>'to'   is null or a.captured_at <  (f->>'to')::timestamptz)
      and (f->>'trust_min' is null or a.trust_score >= (f->>'trust_min')::int)
    order by ai.embedding <=> q_emb limit 200
  )
  select id,
         0.6*sim + 0.2*coalesce(trust_score,0)/100.0 + 0.1*coalesce(quality_score,0)
         + 0.1*exp(-extract(epoch from now()-captured_at)/(86400*180)) + 0.2*kw as score,
         caption
  from base order by score desc limit lim;
$$;
```
*(Runs under the caller's RLS because the function is `security invoker`, the default.)*

### AC
- "handwashing station with children in Barmer" returns the seeded handwashing assets in the top 5.
- A corp user never sees another corporate's assets in results (E2E test).
- p95 search latency is <800 ms on 10k assets.

---

## Phase 7 — Before/after engine

**Goal:** automatic pairing, a Cloudinary-built composite, an AI change summary and a slider UI.
**Owners:** D (URLs), C (logic + AI), A (UI) · **Estimate:** 🏁 4 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P7-1 | `core/pairs/candidates.ts`: same site, ≥14 days apart, activity overlap ≥1, cosine ≥0.75; score = 0.4·sim + 0.3·gap_norm + 0.3·trust_avg | core | C | 🏁 |
| P7-2 | Inngest `asset/assigned` → find candidates → upsert the best `before_after_pair` per (site, milestone) | inngest | C | 🏁 |
| P7-3 | `media/urls.ts#buildComposite(before, after, labels)` → **signed** URL (side-by-side, labels, face blur) | media | D | 🏁 |
| P7-4 | Record the composite as a `derivative` (purpose `composite`) | inngest | D | 🏁 |
| P7-5 | Change analysis: AI Vision General (or LLM) on the composite URL → `ChangeSummary` zod schema | ai | C | 🏁 |
| P7-6 | Studio UI: slider (`react-compare-slider`), change chips, summary, "Add to report", manual pair picker | `pairs/[id]` | A | 🏁 |
| P7-7 | Alignment (P1): try `g_auto` with the same crop box on both; optional homography alignment in the render service with OpenCV (opencv-wasm) | render | D | |
| P7-8 | Quantified change (P2): vegetation index proxy (green-pixel ratio) for plantation projects | render | C | |

### Key code — composite URL builder
```ts
// packages/media/urls.ts
export function buildComposite(b: Ref, a: Ref, o: { w?: number; h?: number; labels: [string, string] }) {
  const w = o.w ?? 800, h = o.h ?? 600;
  const overlayId = a.publicId.replaceAll("/", ":");
  return cld.url(b.publicId, {
    version: b.version, sign_url: true, secure: true, format: "jpg",
    transformation: [
      { crop: "fill", gravity: "auto", width: w, height: h },
      { crop: "pad", width: w * 2, height: h, gravity: "west", background: "black" },
      { overlay: overlayId, crop: "fill", gravity: "auto", width: w, height: h },
      { flags: "layer_apply", gravity: "east" },
      { overlay: { font_family: "Arial", font_size: 36, font_weight: "bold", text: o.labels[0] },
        color: "white", background: "rgb:00000099" },
      { flags: "layer_apply", gravity: "north_west", x: 16, y: 16 },
      { overlay: { font_family: "Arial", font_size: 36, font_weight: "bold", text: o.labels[1] },
        color: "white", background: "rgb:00000099" },
      { flags: "layer_apply", gravity: "north_east", x: 16, y: 16 },
      { effect: "blur_faces" }, { quality: "auto" },
    ],
  });
}
```
*(Strict transformations are on, so dynamic transformations only render when the URL is **signed**, as it is here.)*

### AC
- All 4 seeded before/after sets are paired automatically.
- The composite URL renders in the browser; tampering with any character of the transformation returns 401/404.
- Change summary chips are relevant for ≥3 of 4 pairs, judged by hand.

---

## Phase 8 — Evidence page and lineage

**Goal:** every asset and output is traceable, and there's a public (blurred) share view.
**Owners:** A (UI), B (APIs), D (URLs) · **Estimate:** 🏁 3 h / 4 days

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P8-1 | `asset.short_id` generation (nanoid 8, URL-safe) at insert | migration | B | 🏁 |
| P8-2 | SHA-256 of the original: pipeline step downloads the original once (signed/authenticated URL), hashes it, stores `sha256` | inngest | C | 🏁 |
| P8-3 | `GET /api/assets/:id/lineage` → nodes (`original`, `derivative[]`, `report[]`, `story[]`, `pair[]`) + edges | api | B | 🏁 |
| P8-4 | Evidence page `/e/[shortId]`: viewer, metadata, trust breakdown, map pin, lineage graph (React Flow), used-in list | web | A | 🏁 |
| P8-5 | Public mode: when opened via a share token or not logged in → only `t_sk_public` (face-blurred) derivatives, redacted uploader, coarse location (2 decimals) | web | A | 🏁 |
| P8-6 | Share links: `share_link(token, entity, expires_at)`; signed and expiring | db + api | B | |
| P8-7 | Every URL the app generates goes through `recordDerivative()` so lineage is complete | media | D | 🏁 |

### AC
- Scanning a QR code from a report opens the evidence page and shows the lineage original → report derivative → report.
- In public mode, faces in the seed images come out blurred.

---

## Phase 9 — Review inbox and corporate dashboard

**Goal:** a fast human-in-the-loop queue and a portfolio overview for the buyer.
**Owners:** A, B · **Estimate:** 🏁 4 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P9-1 | `GET /api/review?queue=unassigned|low_trust|duplicate|moderation|missing_evidence` | api | B | 🏁 |
| P9-2 | Review card: image, top-3 suggestions, trust reasons, duplicate side-by-side (composite URL) | components | A | 🏁 |
| P9-3 | Actions (server actions, audited): assign, reject, mark duplicate legit/fraud, request re-capture | api | B | 🏁 |
| P9-4 | Keyboard shortcuts (A/R/D/J/K), bulk select | components | A | |
| P9-5 | "Missing evidence" job: daily Inngest cron flags milestones past their expected date with 0 verified assets | inngest | C | |
| P9-6 | Dashboard KPIs SQL view `v_portfolio_kpis` (per corporate): projects, assets this quarter, % milestones evidenced, avg trust, flagged count | migration | B | 🏁 |
| P9-7 | Dashboard UI: KPI tiles, map of all sites (freshness colours), trust distribution bar, flagged list, NGO scorecard table | dashboard | A | 🏁 |
| P9-8 | Notifications: email (Resend) for re-capture requests and weekly digest | api | B | |

### AC
- Resolving an item removes it from the queue within 1 s and writes to `audit_log`.
- Dashboard numbers match hand-computed values on seed data.

---

## Phase 10 — Report generator

**Goal:** grounded, cited, traceable PDF reports.
**Owners:** C (selection + narrative), D (render service), A (builder UI) · **Estimate:** 🏁 5 h / 1.5 weeks

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P10-1 | `core/report/select.ts`: filter trust ≥75 and not rejected; rank `quality × trust/100 × coverage_gain`; MMR diversity (λ=0.7) over site/milestone/embedding; cap N per project | core | C | 🏁 |
| P10-2 | `core/report/facts.ts`: build the facts bundle JSON (projects, milestones planned vs evidenced, counts, pair summaries, selected assets with IDs and captions) | core | C | 🏁 |
| P10-3 | Narrative prompt: "Only facts from the bundle; end each factual sentence with [asset:ID]"; zod schema per section | ai/prompts/report.ts | C | 🏁 |
| P10-4 | `core/report/citations.ts`: validator that splits sentences and requires ≥1 valid `[asset:ID]` for sentences containing digits or claim verbs; regenerate once, then strip | core | C | 🏁 |
| P10-5 | Render service (`apps/render`): `POST /render` {template, data} → React SSR → HTML → Puppeteer PDF (A4, header/footer, page numbers); QR codes via `qrcode` | render | D | 🏁 |
| P10-6 | Template **Quarterly Funder Update** (cover, portfolio summary, per-project page, flagged appendix) | render/templates | A | 🏁 |
| P10-7 | Images use `t_sk_report` + provenance stamp overlay (project · date · #shortId) through `recordDerivative()` | media | D | 🏁 |
| P10-8 | Upload the PDF to Cloudinary as `raw` in `saakshi/reports/{corp}/{reportId}.pdf`; store `pdf_public_id`, `prompt_hash`, `model`, `report_item` rows | inngest | D | 🏁 |
| P10-9 | Builder UI: template, scope, date range → evidence preview grid (swap/remove) → narrative preview with hover-citations → Generate → Publish (freezes) | reports/new | A | 🏁 |
| P10-10 | Templates **CSR Annual Annexure** and **Impact Assessment Pack**; **BRSR** social-section CSV/XLSX export | render | A/C | |
| P10-11 | Schedule VII + SDG mapping surfaced in the annexure (from the taxonomy) | core | C | |

### Key code — citation validator
```ts
const CITE = /\[asset:([a-z0-9-]{6,36})\]/gi;
const CLAIM = /\d|\b(built|installed|constructed|planted|trained|benefit|reached|completed)\b/i;

export function validateCitations(text: string, validIds: Set<string>) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const bad = sentences.filter(s => CLAIM.test(s) &&
    ![...s.matchAll(CITE)].some(m => validIds.has(m[1])));
  return { ok: bad.length === 0, bad };
}
```

### AC
- A report for 3 projects renders in <60 s, and every image QR resolves to its evidence page.
- The validator catches an injected unsupported claim (unit test).
- A published report can't be edited. Regenerating creates a new version.

---

## Phase 11 — Story / reel studio

**Goal:** campaign-ready reels and carousels generated from verified evidence.
**Owners:** D (video URLs), C (script), A (UI) · **Estimate:** 🏁 3 h / 1 week

### Tasks
| ID | Task | Files | Owner | 🏁 |
|---|---|---|---|---|
| P11-1 | Asset picker heuristic: best pair + top 3–5 clips/images by quality×trust + one transcript quote | core/story | C | 🏁 |
| P11-2 | Script prompt → beats `[{asset_id, duration_s, text}]` (hook → problem → action → change → CTA), zod | ai | C | 🏁 |
| P11-3 | `media/urls.ts#buildReel(beats, brand)`: first beat as the base; each next beat as `l_video:`/image layer with `du_`, `fl_splice`, `c_fill,g_auto,ar_9:16,w_1080`; text overlays per beat; logo; `e_blur_faces`; `f_mp4` | media | D | 🏁 |
| P11-4 | Pre-render with `explicit(public_id, {type:'upload', resource_type:'video', eager:[…], eager_async:true, notification_url})` and a status poll/webhook | media/explicit.ts | D | 🏁 |
| P11-5 | Carousel: N images with `t_sk_carousel` + text overlays → zip download or individual URLs | media | D | |
| P11-6 | Subtitles: build a VTT from beats (or transcript) → upload as raw → `l_subtitles:` layer | media | D | |
| P11-7 | Studio UI: format, beat list (reorder, swap asset, edit text), preview (`CldVideoPlayer`), export, suggested post copy | stories/new | A | 🏁 |
| P11-8 | Consent gate: unblurred output only if every asset has `consent='written'` | core + UI | C | |

> **Fallback:** if a long `fl_splice` chain gets too complex or too slow, build per-beat clips as separate derived assets (each 9:16, trimmed) and concatenate in the render service with FFmpeg, then upload the result back to Cloudinary as the story asset. Lineage is kept either way.

### AC
- A 30-s 9:16 reel with 5 beats, captions, logo and blurred faces renders and plays.
- The story's lineage shows every source asset.

---

## Phase 12 — Privacy, security hardening

**Goal:** safe by default for beneficiaries (especially children) and trustworthy for enterprise buyers.
**Owners:** B, D · **Estimate:** 1 week (partly 🏁)

| ID | Task | 🏁 |
|---|---|---|
| P12-1 | Originals uploaded as `type: authenticated` (or delivered only via signed URLs); `CldImage` for internal views uses signed derivatives | 🏁 (signed only) |
| P12-2 | Strict transformations ON; all dynamic URLs signed server-side; client never builds transformation URLs | 🏁 |
| P12-3 | Public surfaces use only `t_sk_public`; coarse location; no uploader identity | 🏁 |
| P12-4 | Consent capture on upload (none/verbal/written + optional consent-form photo linked to the asset) | |
| P12-5 | DPDP flows: data-subject deletion (soft delete → Cloudinary `delete_resources` after 30 days + invalidate CDN), data export per org, privacy notice in en/hi | |
| P12-6 | Security headers (CSP allowing `res.cloudinary.com`, `upload-widget.cloudinary.com`, map tiles), rate limits on API routes (Upstash Ratelimit), zod validation on every input | 🏁 (zod) |
| P12-7 | Secrets only on the server; `CLOUDINARY_API_SECRET` never in `NEXT_PUBLIC_*`; CI secret scanning (gitleaks) | 🏁 |
| P12-8 | Audit log immutability: `revoke update, delete on audit_log` for app roles | |
| P12-9 | Pen-test checklist: IDOR on `/api/assets/:id`, share-token brute force, webhook replay, SSRF (no user-supplied URLs sent to the fetch API) | |

---

## Phase 13 — Offline PWA, i18n, voice notes

**Goal:** works in villages with poor connectivity and speaks the field worker's language.
**Owners:** A, C · **Estimate:** 1.5 weeks

| ID | Task |
|---|---|
| P13-1 | Serwist service worker: precache the app shell for `/capture`; runtime cache for thumbnails |
| P13-2 | Offline capture: use `<input type="file" accept="image/*,video/*" capture>` when offline (the Upload Widget needs network); store blob + GPS + milestone in **Dexie** |
| P13-3 | Sync worker: on `online`/Background Sync, get signed params from `/api/cloudinary/sign` and upload directly with `fetch` to `https://api.cloudinary.com/v1_1/<cloud>/auto/upload` (chunked for >20 MB via `X-Unique-Upload-Id` + `Content-Range`); retry with backoff |
| P13-4 | Queue UI: badge count, per-item state, manual retry |
| P13-5 | Client-side image downscale (max 2560 px, JPEG 0.85) **only after reading EXIF** and passing original EXIF values as context metadata (downscaling strips EXIF) |
| P13-6 | Voice notes: record (MediaRecorder) → upload as video/audio resource → transcription add-on (or Whisper fallback) → attach transcript to the linked asset |
| P13-7 | `next-intl` translations en/hi for all capture + review screens; Devanagari fonts in PDF templates |
| P13-8 | Install prompt, app icons, splash; Lighthouse PWA audit ≥ 90 |

**AC:** capture 15 photos in airplane mode, reconnect, and all 15 upload with the correct GPS and capture times.

---

## Phase 14 — Production readiness

| ID | Task |
|---|---|
| P14-1 | Environments: `dev` (local + Cloudinary dev), `staging` (Vercel preview + Supabase branch + Cloudinary dev), `prod` |
| P14-2 | CI (`.github/workflows/ci.yml`): install → typecheck → lint → unit (Vitest) → pgTAP (Supabase local) → build → Playwright against preview |
| P14-3 | CD: Vercel auto-deploy on `main`; Railway deploy for `apps/render`; `supabase db push` gated on migration review |
| P14-4 | Observability: Sentry (web + render + Inngest), PostHog events (PRD §19), Inngest failure alerts to Slack |
| P14-5 | **Cost dashboard:** nightly job pulls Cloudinary `usage()` (credits, storage, transformations, add-on units) + LLM tokens by tenant → `usage_daily` table → admin page; alerts at 80% of plan |
| P14-6 | Performance: load test 50 concurrent uploads + 20 searches/s (k6); HNSW `ef_search` tuning |
| P14-7 | Backups: Supabase PITR; Cloudinary backup on; quarterly restore drill |
| P14-8 | Runbooks: webhook outage (replay via Admin API `resources` since timestamp → re-emit events), add-on quota exhausted (flip feature flag to LLM fallback), render service down |
| P14-9 | Feature flags (`flags` table or Vercel Edge Config): `CLD_VISUAL_SEARCH`, `CLD_AI_VISION`, `SYNTH_DETECT`, `STORY_FFMPEG_FALLBACK` |
| P14-10 | Docs: README, architecture diagram, API reference (OpenAPI from zod via `zod-to-openapi`), onboarding guide for NGOs (en/hi) |

---

## 18. Testing strategy

| Layer | Tool | What | Target |
|---|---|---|---|
| Domain logic | Vitest | `core/trust`, `core/assign`, `core/pairs`, `core/report` (table-driven) | ≥90% line coverage on `packages/core` |
| Cloudinary wrappers | Vitest + MSW | Upload params, signature, URL builders (snapshot the transformation strings), vision fallback path | All builders snapshot-tested |
| DB / RLS | pgTAP | Tenant isolation, field insert limits, assessor share expiry | Every policy has a positive + negative test |
| API | Vitest (route handlers) | Auth, zod validation, idempotent webhook | Critical routes |
| Pipeline | Inngest dev server + seed | End-to-end asset processing on 10 fixtures | Green on every PR touching `inngest/` |
| E2E | Playwright | Login → upload → see assigned → search → pair → report → evidence page QR | Runs on the preview deploy |
| AI quality | `scripts/eval/*` | Tag accuracy, assignment accuracy, duplicate recall/precision, search hit@5, report citation rate | Tracked per release in `eval_runs` |
| Accessibility | axe-playwright | Key screens | 0 serious violations |
| Performance | k6, Lighthouse | Upload burst, search latency, PWA score | NFR targets (PRD §18) |

**Golden dataset:** `fixtures/golden/` — 120 labelled images (activity, project, site, is_duplicate_of, pair_id) + 20 search queries with expected IDs. Checked in, with licences recorded.

---

## 19. Schedules

### 19.1 Hackathon track (36 h, team of 4). Only 🏁 tasks.

| Hours | A — Frontend | B — Backend/DB | C — AI/Pipeline | D — Cloudinary/DevOps |
|---|---|---|---|---|
| **0–3** | P1-2 app + shadcn + shell | P1-3/4 migrations, P1-11 types | P3-2 taxonomy, zod schemas | P0-1…P0-9, **run `cloudinary-setup.ts`** |
| **3–6** | P1-8 shell, P1-9 site geofence | P1-5 RLS, P1-10 seed | P2-7 pipeline skeleton | P1-1 monorepo, P2-1 upload params |
| **6–10** | P2-3 capture, P2-4 bulk | P2-2 sign, P2-5, P2-6 webhook | P3-1 enrich, P3-6 LLM fallback | P3-3/4 AI Vision wrapper, **seed media** (§20) |
| **10–14** | P2-8 realtime cards | P4-1, P4-4 RPCs | P3-7/8 caption + embed, P3-9 cache | P4-8 SMD write-back |
| **14–18** | P5-3/4/5/6 project page | P5-1/2 APIs | P4-2/3 assign, P4-5/6/7 trust | P7-3 composite builder |
| **18–22** | P6-6 search UI | P6-2 search RPC, P6-5 facets | P6-1 parser, P6-4 why-matched, P7-1/2 pairs | P7-4, P8-7 `recordDerivative` |
| **22–26** | P7-6 before/after studio | P8-1/3 lineage API | P7-5 change summary, P10-1/2 selection + facts | P10-5 render service |
| **26–30** | P8-4/5 evidence page, P9-7 dashboard | P9-1/3 review APIs, P9-6 KPIs | P10-3/4 narrative + citations | P10-7/8 stamp + PDF upload, P11-3 reel URL |
| **30–33** | P10-9 report builder, P11-7 story UI | Deploy prod, P12-2/3 | P11-1/2 story script, P6-8 eval | P11-4 pre-render, P12-1/7 |
| **33–36** | Polish, empty/loading states | Bug bash | Threshold tuning on seed | **Pre-render demo report + reel**, rehearse demo ×3 |

**Hackathon cut-lines if behind (drop in this order):** P9-7 dashboard → P11 story (show a pre-rendered one) → P6 NL parser (keep plain semantic search) → P5 map (keep the timeline). **Never cut:** upload → AI tags → duplicate flag → before/after → report with QR code linking to lineage.

### 19.2 Product track (12 weeks, after the hackathon)

| Sprint (2 wks) | Theme | Phases / tasks | Exit criteria |
|---|---|---|---|
| **S1 (W1–2)** | Harden MVP | Refactor hackathon code into packages; P1-6 pgTAP, P1-7 phone OTP, P1-12 audit; P2-9/10; P3-5; P12-1/2/6/7; CI (P14-2) | CI green; RLS tests; video pipeline works |
| **S2 (W3–4)** | Field-ready | P13-1…P13-8 offline + i18n + voice; P12-4 consent | Airplane-mode AC passes; Hindi UI |
| **S3 (W5–6)** | Trust & review | P4-9/10 re-score + synthetic check; P9-4/5/8; P3-10/12 video + tag eval | Duplicate precision ≥90%; review SLAs |
| **S4 (W7–8)** | Reporting for compliance | P10-10/11 annexure, impact pack, BRSR; P8-6 share links; P5-7/8 | 3 templates live; assessor share room |
| **S5 (W9–10)** | Discovery & stories | P6-3/7 Visual Search + image search; P7-7 alignment; P11-5/6/8 carousel, subtitles, consent gate | Search hit@5 ≥85%; subtitles on reels |
| **S6 (W11–12)** | Pilot & scale | P12-5/8/9 DPDP + pentest; P14-1/4/5/6/7/8/9/10; onboard 2 corporates + 10 NGOs | Pilot live; cost dashboard; runbooks |

**Milestones:** M1 Hackathon demo (h36) · M2 Field-ready beta (W4) · M3 Compliance-ready (W8) · M4 Pilot launch (W12).

---

## 20. Seed data and demo preparation

| Item | Detail |
|---|---|
| Sources | Openly licensed images from Wikimedia Commons, Unsplash and Pexels (schools, hand pumps, toilets, plantations, health camps, training). Record the licence and author in `fixtures/golden/LICENSES.csv` |
| Geography | 3 districts (e.g. Barmer–RJ, Nashik–MH, Gaya–BR); 6 site polygons |
| EXIF injection | `scripts/seed-media.ts` uses `exiftool-vendored` to write GPS (inside/outside geofences) and DateTimeOriginal (timeline over 6 months) before upload |
| Planted cases | 6 duplicates (2 exact, 2 cropped, 2 recompressed/colour-shifted) across different projects; 3 out-of-geofence; 2 outside the grant period; 1 with editor software EXIF; 4 before/after sets; 20 same-site burst shots (must **not** be flagged) |
| Video | 4 short clips (≤45 s) with Hindi/English speech for transcripts and reels |
| Pre-renders | Before demo: 1 quarterly report PDF + 1 reel pre-rendered and cached (live generation shown too, with the cached result as a fallback) |
| Demo accounts | `corp@demo` (CSR head), `ngo1@demo` (program manager), `field1@demo` (phone), `assessor@demo` |
| Rehearsal checklist | Network fallback (phone hotspot), webhook tunnel **not** used in prod demo, Cloudinary quota check, browser zoom 110%, QR scan tested on 2 phones |

---

## 21. Definition of Done and checklists

**Task DoD**
- [ ] Code merged via PR with 1 review; typecheck + lint + tests green
- [ ] Inputs validated with zod; errors handled with a user-facing message
- [ ] New Cloudinary calls live in `packages/media` only; any new URL is recorded via `recordDerivative()`
- [ ] RLS covers any new table (with a pgTAP test)
- [ ] Analytics event added if user-facing
- [ ] Accessible (keyboard, labels, contrast), with en/hi strings

**Release checklist**
- [ ] Migrations reviewed and applied to staging, then prod
- [ ] `cloudinary-setup.ts` run against the target env (idempotent)
- [ ] Eval scripts run; no regression >2 pts vs the last release
- [ ] Feature flags set; runbooks updated
- [ ] Usage/cost within budget

---

## 22. Dependency and risk register

| # | Dependency / risk | Affects | Mitigation | Owner |
|---|---|---|---|---|
| R1 | AI Vision / Visual Search not enabled or quota too low | P3, P6, P7 | Feature flags + LLM/pgvector fallbacks built first | D |
| R2 | Add-on async results arrive late (transcription) | P3-10, P11 | Pipeline handles `asset/addon-complete` separately; UI shows partial state | C |
| R3 | Complex `fl_splice` reels are slow or fail | P11 | Pre-render via `explicit`; FFmpeg fallback in render service | D |
| R4 | Puppeteer memory/timeouts | P10 | Dedicated Railway service (1 GB+), page-level image preloading, queue concurrency 2 | D |
| R5 | Webhook delivery gaps | P2 | Idempotent handlers + reconciliation cron (Admin API list by `created_at` since last sync) | B |
| R6 | EXIF stripped by messaging apps / client downscale | P4 | Capture GPS/time on device and pass as context; trust check treats "no EXIF + device GPS present" as a low penalty | C |
| R7 | LLM hallucination in reports/summaries | P10, P7 | Facts bundle, citation validator, human publish gate | C |
| R8 | RLS mistakes leaking tenant data | All | pgTAP suite, `security invoker` functions, E2E cross-tenant tests | B |
| R9 | Hackathon time overrun | All | Cut-lines in §19.1; pre-rendered demo artefacts | All |
| R10 | Cloudinary API/param names differ from assumptions | P0, P3, P7 | All calls isolated in `packages/media`; verify against docs during P0; snapshot tests | D |

---

### Appendix — Key packages
```
next@15 react@19 typescript tailwindcss@4 shadcn/ui lucide-react
cloudinary next-cloudinary
@supabase/supabase-js @supabase/ssr
inngest zod @anthropic-ai/sdk openai (embeddings)
react-map-gl maplibre-gl terra-draw
@xyflow/react react-compare-slider
@serwist/next dexie next-intl
fastify puppeteer qrcode exiftool-vendored
vitest @playwright/test msw axe-playwright
@sentry/nextjs posthog-js @upstash/ratelimit resend
```
