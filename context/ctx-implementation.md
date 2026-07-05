# Implementation Context

Dokumen ini adalah snapshot implementasi terkini dan akan sering berubah.

## Current Phase

- Phase 0 (Planning & Documentation): **completed**
- Phase 1 (Project Foundation / Implementation Setup): **completed**
- Phase 2 (Catalog Foundation): **in progress**
- Current implementation progress: **20%** (vertical slice awal catalog public listing sudah berjalan)

## Current Focus

- `phase-2 catalog vertical slice 01`
- Vertical slice awal module `catalog` sudah diimplementasikan untuk read-path publik.
- Next active item: **M4.2 - Catalog Product Lifecycle Dasar (Admin + Slug Detail Foundation)**

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
- **M3.6 - CI Baseline Ready (completed)**
  - Workflow CI minimum sudah ditambahkan: `.github/workflows/ci.yml`.
  - Step `bunx --bun prisma generate` ditambahkan sebelum gate quality agar Prisma client tersedia saat CI menjalankan `typecheck`.
  - Trigger: `pull_request` + `push` ke `main`.
  - Gates: `lint`, `typecheck`, `test`.
  - Blocker SSL lokal (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) sudah terselesaikan; `bun install` berhasil.
  - Verifikasi gate minimum lokal (`bun run check`) sudah lolos.
  - Verifikasi full lokal (`bun run check:full`) sudah kembali hijau setelah sinkronisasi formatting.
  - Pipeline minimum sudah hijau pada PR (exit criteria tercapai).
- **M3.7 - Catalog Start Gate (Definition of Ready) (completed)**
  - Backlog feature `catalog` disusun per vertical slice di `planning/backlog.md`.
  - Acceptance criteria untuk feature utama `catalog` tersedia.
  - Dependency antar module diverifikasi (`catalog -> inventory`, `catalog -> review`, downstream `homepage` dan `cart`).
  - Readiness checklist implementasi `catalog` dinyatakan lengkap; module siap kickoff implementasi.

## Phase 2 (Next Targets)

Target setup awal:

- **M4.1 - Catalog Vertical Slice 01 (Category + Product Listing Public)**
  - Implementasi domain + application service dasar untuk category dan listing produk publik.
  - Delivery endpoint awal: `GET /products` dan `GET /products/categories`.
- **Status M4.1: Completed**
  - Domain invariant dasar katalog sudah aktif (`ACTIVE` + minimal 1 variant, archived/non-active tidak tampil publik).
  - Endpoint publik aktif di App Router: `GET /api/v1/products` dan `GET /api/v1/products/categories`.
  - Test domain + application untuk listing publik sudah ditambahkan dan lolos quality gate.

- **M4.2 - Catalog Product Lifecycle Dasar (Admin + Slug Detail Foundation)**
  - Target berikutnya: service dasar create/update/archive product, slug uniqueness, dan fondasi detail by slug.

## Module Build Plan (High-Level)

### Catalog Module

- Status: In Progress (M4.1 completed)
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

Status:

- **Completed** pada M3.7 (lihat `planning/backlog.md` dan `planning/decisions.md` Decision 017).
