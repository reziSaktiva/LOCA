# Implementation Context

Dokumen ini adalah snapshot implementasi terkini dan akan sering berubah.

## Current Phase

- Phase 0 (Planning & Documentation): **completed**
- Next target: **Phase 1 - Project Foundation (Implementation Setup)**
- Current implementation progress: **0%** (belum masuk build module production)

## Current Focus

- Documentation consistency hardening (selesai/sedang final pass).
- Menyiapkan transisi dari dokumen ke eksekusi codebase.

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

## Phase 1 (In Preparation)

Target setup awal:

- Next.js project baseline
- TypeScript, ESLint, Prettier, Tailwind, shadcn
- Prisma + Supabase integration
- Supabase Auth integration
- Environment schema + config baseline
- Folder structure final by module boundary
- Shared utilities + error handling + logger

## Module Build Plan (High-Level)

### Catalog Module

- Status: Not Started
- Target phase: Phase 2
- Deliverables: product/category/variant/detail/search/filter/sort

### Auth Module

- Status: Not Started (foundation planned in Phase 1)
- Scope awal: register/login/logout/reset + role guard

### Database

- Status: Not Started
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
- Final CI baseline (lint/typecheck/test minimum gates).
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
