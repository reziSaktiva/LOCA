# Implementation Context

Dokumen ini adalah snapshot implementasi terkini dan akan sering berubah.

## Current Phase

- Phase 0 (Planning & Documentation): **completed**
- Phase 1 (Project Foundation / Implementation Setup): **in progress**
- Current implementation progress: **0%** (belum masuk build module production)

## Current Focus

- `phase-1 implementation setup kickoff`
- Menuntaskan fondasi implementasi agar siap development harian.
- Next active item: **M3.6 - CI Baseline Ready (in progress)**

## Completed (Planning Side)

- Project foundation
- Business specification
- UX specification
- Functional requirements
- System architecture
- Technical stack
- Domain modules
- Data model
- API specification
- Design system
- Development rules
- Development roadmap

## Completed (Implementation Foundation)

Sudah selesai pada Milestone 3:

- **M3.1 - Folder Structure Ready**
  - Struktur `src/modules/<module>/{presentation,application,domain,infrastructure,public}` untuk 11 module MVP.
  - Struktur shared `src/shared/{kernel,infrastructure,events,analytics,ui}`.
  - Import boundary rules aktif via ESLint (`import/no-restricted-paths`).
- **M3.2 - Bootstrap Workspace Ready**
  - Next.js App Router + TypeScript + Tailwind CSS bootstrap stabil di Bun.
  - Command baseline lokal (`dev`, `build`, `lint`, `typecheck`) terverifikasi lolos.
- **M3.3 - Engineering Baseline Ready**
  - `Prettier` + `Vitest` aktif.
  - Script standar: `lint`, `typecheck`, `test`, `check`, `check:full`.
  - Quality gate minimum terverifikasi lolos.
- **M3.4 - Data & Auth Plumbing Ready**
  - Supabase Auth via `@supabase/ssr` (browser/server client + middleware proxy).
  - Prisma 7 via `@prisma/adapter-pg` (pooled connection + singleton).
  - Env template `.env.example` siap.
- **M3.5 - UI Foundation Ready**
  - shadcn/ui `base-nova` diinisialisasi; 15 core components di `src/shared/ui/`.
  - Design tokens aktif: semantic colors (success/warning/error/info), radius scale (xs–xl), shadow (sm/md/lg).
  - Dependency stack UI: `lucide-react`, `motion`, `react-hook-form`, `zod`, `next-themes`, `sonner`.
  - Provider pattern aktif (`src/app/providers.tsx`); barrel export di `src/shared/ui/index.ts`.
- **M3.6 - CI Baseline Ready (in progress)**
  - Workflow CI minimum sudah ditambahkan: `.github/workflows/ci.yml`.
  - Trigger: `pull_request` + `push` ke `main`.
  - Gates: `lint`, `typecheck`, `test`.
  - Verifikasi lokal sementara terblokir karena `bun install --frozen-lockfile` gagal `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

## Phase 1 (Next Targets)

Target setup awal:

- **M3.6 - CI Baseline Ready**
  - Pipeline minimum: lint + typecheck + test.
  - Next: verifikasi pipeline hijau di PR setelah blocker SSL environment lokal terselesaikan.
- **M3.7 - Catalog Start Gate (Definition of Ready)**
  - Backlog catalog, acceptance criteria, verifikasi dependency antar module, dan readiness docs.

## Module Build Plan (High-Level)

### Catalog Module

- Status: Not Started
- Target phase: Phase 2
- Deliverables: product/category/variant/detail/search/filter/sort

### Auth Module

- Status: Foundation plumbing completed in Phase 1 (M3.4), fitur module belum dimulai
- Scope awal: register/login/logout/reset + role guard

### Database

- Status: Foundation plumbing completed in Phase 1 (M3.4), schema domain belum dimulai
- Scope awal: schema baseline, migration strategy, repository contract

## Remaining Priority Flows

### Checkout

- Belum diimplementasikan.
- Bergantung pada stabilitas cart, customer address, shipping option, payment method.

### Payment

- Belum diimplementasikan.
- Integrasi Midtrans + webhook idempotency perlu desain implementasi detail.

### Shipping

- Belum diimplementasikan.
- Integrasi Biteship + tracking status synchronization.

## Open Decisions

- Final branding assets (name, logo, color, typography, tone).
- Branch protection policy agar status check CI wajib sebelum merge.
- Detail testing strategy per layer (unit/integration/e2e granularity).
- Detail deployment flow (preview/release/rollback).
- SOP operasional order handling dan shipping SLA.

## Backlog (Post-MVP / Lower Priority)

- Marketplace integration (Shopee/TikTok sync)
- POS
- Loyalty program
- Referral system
- Mobile app
- Advanced analytics dashboard

## Definition of Ready (Sebelum Build Modul Pertama)

Module pertama (catalog) baru mulai jika:

- project bootstrap berjalan stabil,
- auth dan database foundation aktif,
- folder boundaries final disepakati,
- quality gates dasar (lint/typecheck/test baseline) tersedia,
- context docs sinkron dengan dokumen utama.
