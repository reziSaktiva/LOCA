# PROJECT STATE

> Single Source of Truth untuk status proyek saat ini.

---

# Project

Status: Phase 2 In Progress (Catalog Vertical Slice Started)

Current Version: v0.8

Project Type:

Brand Website + E-Commerce

Architecture:

Modular Monolith

Project Goal:

Membangun website sebagai **Brand Hub** sekaligus **Direct-to-Consumer (D2C) E-Commerce** untuk brand apparel essentials yang berfokus pada olahraga dan lifestyle.

---

# Current Phase

✅ Phase 0 — Planning & Documentation (Completed)
✅ Phase 1 — Project Foundation (Completed)
⏳ Phase 2 — Catalog Foundation (In Progress)

Progress:

- [x] Project Foundation
- [x] Business Documentation
- [x] User Experience
- [x] Functional Requirements
- [x] System Architecture
- [x] Technical Stack
- [x] Domain Modules
- [x] Data Model
- [x] API Specification
- [x] Design System
- [x] Development Rules
- [x] Development Roadmap
- [x] Phase 1 Implementation Setup

---

# Current Focus

Sedang mengerjakan:

`phase-2 catalog vertical slice 06`

Tujuan:

M4.6 selesai — `PrismaCatalogRepository` diimplementasikan dan menggantikan `InMemoryCatalogRepository` di public service. Catalog kini terhubung ke database Supabase PostgreSQL sungguhan. Next: M4.7 (Admin Catalog API).

---

# Latest Decisions

## Business & Product

- Website berfungsi sebagai Brand Hub sekaligus Direct Sales.
- Marketplace (Shopee & TikTok Shop) tetap digunakan sebagai channel penjualan.
- Fokus utama MVP adalah membangun fondasi brand dan alur pembelian end-to-end yang stabil.
- Produk diposisikan sebagai Sports Apparel Essentials untuk target market mahasiswa dan young professionals.
- **Brand LOCA ditetapkan final**: nama brand, brand story (Lifestyle Movement), logo (Wordmark), color direction (Black + Off-White + 1 Accent), typography (Geometric Sans: Outfit/Plus Jakarta Sans), tone of voice (Confident & Minimal). Lihat `planning/decisions.md` Decision 018.
- **SOP Operasional MVP ditetapkan**: KPI harian (Total Order + Revenue + Stok Habis), SOP order handling (3-step), SLA shipping (1-2 hari kerja). Lihat `planning/decisions.md` Decision 020.

---

## Architecture

- Modular Monolith.
- Feature-Based Architecture.
- Repository Pattern + Service Layer.
- Business Logic dipisahkan tegas dari UI/Route Handler.
- Inter-module communication wajib melalui public service.
- Shared kernel hanya untuk technical shared concerns, bukan business logic.
- `admin` diperlakukan sebagai interface/presentation layer, bukan domain module.
- `analytics` diperlakukan sebagai cross-cutting concern, bukan domain module.
- Domain module MVP: `auth`, `customer`, `catalog`, `inventory`, `cart`, `checkout`, `order`, `payment`, `shipping`, `review`, `homepage`.

---

## Technical

- Provider autentikasi resmi: **Supabase Auth**.
- Database utama: **Supabase PostgreSQL**.
- Deployment aplikasi: **Vercel**.
- ORM utama: **Prisma**.
- Kontrak status order diselaraskan ke model detail:
  - `PENDING -> WAITING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED` (+ `CANCELLED` path).
- Shipping status diselaraskan menggunakan `PICKED_UP`.
- Package manager resmi proyek: **Bun** (bukan pnpm). Lihat `planning/decisions.md` Decision 008.
- Baseline engineering M3.3 bagian pertama diaktifkan: `Prettier` + `Vitest`, script `typecheck`/`test`/`format`, dan smoke test awal. Lihat `planning/decisions.md` Decision 009.
- Standard command quality gate M3.3 ditetapkan: `bun run check` (lint + typecheck + test) dan `bun run check:full` (check + format:check). Lihat `planning/decisions.md` Decision 010.
- M3.4 plumbing selesai: Supabase Auth via `@supabase/ssr` (middleware proxy + browser/server client), Prisma 7 via `@prisma/adapter-pg` (pooled connection + env template). Lihat `planning/decisions.md` Decision 011.
- Skills project dipindah ke `.agents/skills/`, 2 skill Supabase ditambahkan, tracking via `skills-lock.json`. Lihat `planning/decisions.md` Decision 012.
- M3.5 UI Foundation selesai: shadcn/ui `base-nova` + 15 core components di `src/shared/ui/`, design tokens (semantic colors: success/warning/error/info; radius scale: xs-xl; shadow: sm/md/lg) aktif di `globals.css`, dependency stack UI lengkap (lucide-react, motion, react-hook-form, zod, next-themes, sonner), provider pattern aktif. Lihat `planning/decisions.md` Decision 014.
- Baseline workflow CI minimum ditetapkan di `.github/workflows/ci.yml` dengan step `Generate Prisma client` + gate `lint`, `typecheck`, `test` (trigger `pull_request` + `push main`) sebagai eksekusi M3.6. Blocker SSL lokal (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) sudah terselesaikan; verifikasi gate minimum lokal kini lolos. Lihat `planning/decisions.md` Decision 016.
- M3.7 Catalog Start Gate selesai: backlog feature `catalog`, acceptance criteria, verifikasi dependency antar module, dan readiness checklist implementasi ditetapkan di `planning/backlog.md`. Module `catalog` dinyatakan siap untuk kickoff vertical slice. Lihat `planning/decisions.md` Decision 017.
- **Engineering policy ditetapkan**: testing strategy (unit domain + integration API), branch protection (CI gate wajib), deployment flow (manual deploy). Lihat `planning/decisions.md` Decision 019.

---

## Documentation Governance

- Source of Truth diperluas dan diselaraskan:
  - Business -> UX -> Functional -> System Architecture -> Domain -> Data Model -> API -> Technical Stack -> Design System -> Development Rules.
- `00-project-foundation.md` diperlakukan sebagai dokumen fondasi awal (draft baseline); jika terjadi konflik, dokumen bernomor 01+ menjadi acuan final.
- `AGENTS.md` diperbarui menjadi panduan operasional agent untuk implementasi agar selaras dengan `docs/10-development-rules.md`.

---

# Open Decisions

Belum diputuskan:

## Branding

- Warna accent brand final (1 warna, ditetapkan saat produksi logo/brand asset)
- Logo final (file asset)
- Typography final (Outfit vs Plus Jakarta Sans — ditetapkan saat implementasi UI)

## Phase 1 Engineering

- Branch protection policy untuk mewajibkan status check CI sebelum merge (sudah disepakati CI gate, belum dikonfigurasi di GitHub repo settings)
- Deployment flow detail (preview, release, rollback) — untuk fase post-MVP

## Operations

- KPI dashboard kuantitatif target (conversion rate, AOV, repeat customer) — ditetapkan setelah operasional berjalan

---

# Current Repository Status

## Documentation State

- ✅ `docs/00-project-foundation.md`
- ✅ `docs/01-business.md`
- ✅ `docs/02-user-experience.md`
- ✅ `docs/03-functional-requirements.md`
- ✅ `docs/04-system-architecture.md`
- ✅ `docs/05-domain-modules.md`
- ✅ `docs/06-data-model.md`
- ✅ `docs/07-api-specification.md`
- ✅ `docs/08-technical-stack.md`
- ✅ `docs/09-design-system.md`
- ✅ `docs/10-development-rules.md`
- ✅ `docs/11-development-roadmap.md`

## Planning Workspace

- `planning/README.md` sudah memuat ringkasan seluruh dokumen `docs/`.
- `planning/decisions.md` memuat keputusan teknis terbaru sampai **Decision 017** (M3.7 Catalog Start Gate).
- `planning/changelog.md` memuat log update terbaru tanggal **2026-07-05** (entry 6).

## Agent Governance

- ✅ `AGENTS.md` sudah ditingkatkan dari reminder minimal menjadi implementation guide operasional.
- ✅ Folder `agents/` sudah berisi role profiles inti (`backend`, `frontend`, `database`, `security`, `qa`, `code-review`, `product`, `solution-architect`, `ui`) untuk mendukung eksekusi Phase 1.
- ✅ Folder `.agents/skills/` sudah berisi 6 skill aktif: 4 core skill project (`spec-driven-workflow`, `module-scaffold`, `docs-sync`, `progress-sync`) + 2 skill dari registry `supabase/agent-skills` (`supabase`, `supabase-postgres-best-practices`). Tracking versi skill registry via `skills-lock.json`. Detail: `planning/decisions.md` Decision 012-013.
- ✅ Skill `progress-sync` memaksa agent otomatis melaporkan progress task ke `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` di akhir setiap task implementasi, tanpa harus diminta user. Detail: `planning/decisions.md` Decision 013.

## Implementation State

- ✅ **M3.1 — Folder Structure Ready**: struktur folder `src/modules/<module>/{presentation,application,domain,infrastructure,public}` (11 module MVP) dan `src/shared/{kernel,infrastructure,events,analytics,ui}` sudah dibuat sesuai `docs/04-system-architecture.md`. Import boundary rules ditegakkan otomatis lewat `import/no-restricted-paths` di `eslint.config.mjs` (terverifikasi lolos `lint` + `tsc --noEmit`, dan terbukti menangkap pelanggaran cross-layer/cross-module saat diuji manual). Detail: `planning/decisions.md` Decision 007.
- ✅ **M3.2 — Bootstrap Workspace Ready**: project Next.js (App Router) + TypeScript + Tailwind CSS terverifikasi berjalan di lokal dengan Bun (`bun install`, `bun dev`, `bun run build`, `bun run lint`, `tsc --noEmit` — semua lolos tanpa warning). Boilerplate default `create-next-app` (metadata title, konten marketing `page.tsx`) dibersihkan agar mencerminkan identitas project sementara (`Loca`), tanpa membangun fitur `homepage` module (ditunda ke fase implementasi module sesuai roadmap).
- ✅ **M3.3 — Engineering Baseline Ready**: baseline engineering selesai dan distandarkan untuk workflow harian — `prettier` + `vitest` aktif, script minimum `lint`/`typecheck`/`test` tersedia, command agregat `check` + `check:full` tersedia, dan seluruh gate minimum terverifikasi lolos di lokal. Detail: `planning/decisions.md` Decision 009-010.
- ✅ **M3.4 — Data & Auth Plumbing Ready**: Supabase Auth (`@supabase/ssr@0.12.0`) dan Prisma 7 (`@prisma/adapter-pg`) terinstall dan terkonfigurasi. Browser/server Supabase client tersedia di `src/shared/infrastructure/supabase/`, Prisma singleton di `src/shared/infrastructure/database/`, dan Next.js proxy untuk token refresh aktif di `src/proxy.ts` (dimigrasi dari `middleware.ts` sesuai Next.js 16). Lihat `planning/decisions.md` Decision 015. Env template `.env.example` siap. Detail: `planning/decisions.md` Decision 011.
- ✅ **M3.5 — UI Foundation Ready**: shadcn/ui (`base-nova`) diinisialisasi, 15 core components dari design system inventory diinstall ke `src/shared/ui/`, design tokens (semantic colors, radius scale, shadow) dikonfigurasi di `globals.css`, dependency stack UI dilengkapi (`lucide-react`, `motion`, `react-hook-form`, `zod`, `next-themes`, `sonner`), provider pattern aktif di `src/app/providers.tsx`, barrel export tersedia di `src/shared/ui/index.ts`. Detail: `planning/decisions.md` Decision 014.
- ✅ **M3.6 — CI Baseline Ready**: workflow CI minimum telah ditambahkan di `.github/workflows/ci.yml` (trigger `pull_request` + `push main`) dan menyertakan step `bunx --bun prisma generate` sebelum gate `bun run lint`, `bun run typecheck`, `bun run test` untuk memastikan Prisma client tersedia saat CI typecheck. Blocker SSL lokal (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) sudah teratasi, `bun install` berhasil, gate minimum lokal lolos via `bun run check`, `bun run check:full` hijau setelah sinkronisasi formatting, dan pipeline minimum pada PR sudah hijau (exit criteria tercapai).
- ✅ **M3.7 — Catalog Start Gate (Definition of Ready)**: readiness implementasi module `catalog` telah ditetapkan di `planning/backlog.md` mencakup feature backlog vertical slice, acceptance criteria per feature, verifikasi dependency lintas module (`inventory`, `review`, downstream `homepage`/`cart`), dan checklist DoR. Exit criteria M3.7 tercapai; `catalog` siap diimplementasikan. Detail: `planning/decisions.md` Decision 017.
- ✅ **M4.1 — Catalog Vertical Slice 01 (Category + Product Listing Public)**: module `catalog` mulai terimplementasi dengan struktur layer lengkap untuk read-path publik (`domain`, `application`, `infrastructure`, `public`, `presentation`), invariant dasar katalog (`ACTIVE` + minimal 1 variant, produk `ARCHIVED`/non-active tidak tampil), endpoint `GET /api/v1/products` (pagination/filter/sort dasar) dan `GET /api/v1/products/categories` (kategori aktif dengan produk publik), serta unit test domain+application. Exit criteria M4.1 tercapai dan quality gate minimum lolos (`bun run check`).
- ✅ **M4.3 — Catalog Variant Pricing & Attributes Dasar**: type variant lengkap (`CatalogVariant`, `VariantSnapshot`, commands), invariant `isVariantPriceValid` + `isValidSku`, repository contract diperluas (findVariantsByProductId, existsVariantWithSku, createVariant, updateVariant, getVariantSnapshot), in-memory store dengan 7 seed variant + sync otomatis priceFrom/priceTo/variantCount, application service `manage-variant.ts` (create/update dengan 5 error code typed), public facade `getVariantSnapshotForCart` sebagai kontrak lintas module. 65 test lolos, `bun run check` hijau.
- ✅ **M4.4 — Catalog Public Search Endpoint**: application service `search-public-products.ts` (full-text search: name+description+brand, filter category+minPrice+maxPrice, pagination, sort), public facade `searchPublicProductsFromSearchParams`, endpoint `GET /api/v1/products/search` aktif (400 jika q kosong). 78 test lolos, `bun run check` hijau.
- ✅ **M4.5 — Prisma Schema Catalog**: model `ProductCategory`, `Product`, `ProductVariant`, `VariantOption`, `VariantValue` ditambahkan ke `prisma/schema.prisma` sesuai `docs/06-data-model.md` (enum ProductStatus/VariantStatus, audit fields, soft delete fields, index pola akses bisnis). Migration `20260707030000_catalog_foundation` **sudah diapply ke database Supabase**. `prisma generate` lolos, Prisma client menyertakan catalog types. `bun run check` hijau (78 test).
- ✅ **M4.6 — Prisma Catalog Repository**: `PrismaCatalogRepository` di `src/modules/catalog/infrastructure/prisma-catalog-repository.ts` mengimplementasikan seluruh `CatalogRepository` contract dengan Prisma client nyata. `createVariant`/`updateVariant` menggunakan `prisma.$transaction` untuk menjaga konsistensi denormalized fields. `InMemoryCatalogRepository` digantikan di public service; catalog kini terhubung ke database Supabase PostgreSQL sungguhan. `bun run check` hijau (78 test).

---

# Next Action

**Milestone 3 — Implementation Foundation** sudah selesai. **M4.1, M4.2, M4.3, M4.4, M4.5, dan M4.6 Catalog Foundation** sudah selesai.

Next action: **M4.7 — Admin Catalog API** — endpoint admin dengan auth guard untuk mengelola catalog (create/update/archive product, create/update variant, create/update category).

1. ✅ **M3.1 — Folder Structure Ready** (Selesai)
   - Finalisasi struktur folder implementasi.
   - Tetapkan aturan import boundary antar layer/module.
   - Exit criteria: struktur folder + boundary rules disepakati sebagai acuan implementasi. — Tercapai, lihat `planning/decisions.md` Decision 007.

2. ✅ **M3.2 — Bootstrap Workspace Ready** (Selesai)
   - Bootstrap project Next.js sebagai baseline implementasi.
   - Sinkronkan setup awal workspace dengan stack resmi proyek.
   - Exit criteria: project Next.js berhasil dijalankan di lokal. — Tercapai.

3. ✅ **M3.3 — Engineering Baseline Ready** (Selesai)
   - ✅ Inisialisasi baseline engineering: lint, format, type-safety, test scaffold.
   - ✅ Standarisasi script kualitas minimum (`lint`, `typecheck`, `test`) untuk workflow harian.
   - ✅ Exit criteria: semua quality script minimum lolos di lokal.

4. ✅ **M3.4 — Data & Auth Plumbing Ready** (Selesai)
   - ✅ Setup integrasi Supabase Auth (`@supabase/ssr`, browser/server client, middleware proxy).
   - ✅ Setup integrasi Supabase PostgreSQL + Prisma 7 baseline (driver adapter, singleton, env template).
   - ✅ Exit criteria: auth + database siap dipakai untuk pengembangan module. — Tercapai.

5. ✅ **M3.5 — UI Foundation Ready** (Selesai)
   - ✅ shadcn/ui (`base-nova`) diinisialisasi, 15 core components diinstall ke `src/shared/ui/`.
   - ✅ Design tokens aktif: semantic colors, radius scale (xs-xl), shadow tokens.
   - ✅ Dependency stack UI lengkap: `lucide-react`, `motion`, `react-hook-form`, `zod`, `next-themes`, `sonner`.
   - ✅ Provider pattern aktif di `src/app/providers.tsx`, barrel export di `src/shared/ui/index.ts`.
   - ✅ Exit criteria: fondasi UI siap dipakai konsisten untuk implementasi module. — Tercapai.

6. ✅ **M3.6 — CI Baseline Ready** (Selesai)
   - ✅ Tetapkan baseline CI minimum: lint, typecheck, test.
   - ✅ Workflow CI dibuat: `.github/workflows/ci.yml` (PR + push main).
   - ✅ Verifikasi lokal gate minimum lolos: `bun install` + `bun run check`.
   - ✅ Verifikasi full local gate lolos: `bun run check:full`.
   - ✅ Exit criteria: pipeline minimum berjalan hijau pada PR.

7. ✅ **M3.7 — Catalog Start Gate (Definition of Ready)** (Selesai)
   - ✅ Definition of Ready implementasi module pertama (`catalog`) ditetapkan.
   - ✅ Feature backlog `catalog` disusun (vertical slice).
   - ✅ Acceptance criteria tersedia.
   - ✅ Dependency antar module diverifikasi.
   - ✅ Kebutuhan implementasi terdokumentasi.
   - ✅ Module `catalog` siap diimplementasikan menggunakan vertical slice.

8. ✅ **M4.1 — Catalog Vertical Slice 01 (Category + Product Listing Public)** (Selesai)
   - ✅ Domain + application service untuk category dan product listing publik.
   - ✅ Public endpoint `GET /api/v1/products` dan `GET /api/v1/products/categories`.
   - ✅ Validasi business invariant dasar katalog.
   - ✅ Exit criteria tercapai: listing publik berjalan, endpoint kategori tersedia, test + quality gate minimum lolos.

9. ✅ **M4.2 — Catalog Product Lifecycle Dasar** (Selesai)
   - ✅ Lifecycle invariants: `canActivateProduct`, `isAllowedStatusTransition`, `isValidSlug`.
   - ✅ Repository diperluas: `findProductBySlug`, `findProductById`, `existsProductWithSlug`, `createProduct`, `updateProduct`, `updateProductStatus`.
   - ✅ Application service: `get-product-by-slug`, `manage-product-lifecycle` (create/update/archive).
   - ✅ Public endpoint: `GET /api/v1/products/slug/[slug]`.
   - ✅ 36 test lolos, quality gate minimum hijau.

10. ✅ **M4.3 — Catalog Variant Pricing & Attributes Dasar** (Selesai)

- ✅ Type variant: `CatalogVariant`, `VariantSnapshot`, `CreateVariantCommand`, `UpdateVariantCommand`.
- ✅ Invariant: `isVariantPriceValid` (price >= 0, finite), `isValidSku` (non-empty).
- ✅ Service variant `manage-variant.ts`: create/update dengan 5 typed error code.
- ✅ Kontrak `getVariantSnapshotForCart` tersedia di public facade untuk consumer `cart`.
- ✅ 65 test lolos, quality gate minimum hijau.

11. ✅ **M4.4 — Catalog Public Search Endpoint** (Selesai)

- ✅ Application service `search-public-products.ts`: full-text search (name+description+brand), filter category/minPrice/maxPrice, pagination, sort.
- ✅ Public facade `searchPublicProductsFromSearchParams` di `catalog-public-service.ts`.
- ✅ Endpoint `GET /api/v1/products/search` aktif; 400 jika `q` kosong.
- ✅ 78 test lolos, `bun run check` hijau.

12. ✅ **M4.5 — Prisma Schema Catalog** (Selesai)

- ✅ Model `ProductCategory`, `Product`, `ProductVariant`, `VariantOption`, `VariantValue` ditambahkan ke `prisma/schema.prisma`.
- ✅ Enum `ProductStatus` (DRAFT/ACTIVE/OUT_OF_STOCK/ARCHIVED) dan `VariantStatus` (ACTIVE/INACTIVE) didefinisikan.
- ✅ Audit fields (`createdAt/By`, `updatedAt/By`), soft delete fields (`isDeleted`, `deletedAt/By`, `deleteReason`), dan index pola akses bisnis sesuai `docs/06-data-model.md`.
- ✅ Migration SQL tersimpan di `prisma/migrations/20260707030000_catalog_foundation/migration.sql`.
- ✅ `prisma generate` lolos, Prisma client menyertakan catalog types.
- ✅ `bun run check` hijau (78 test).

13. ✅ **M4.6 — Prisma Catalog Repository**

- ✅ `PrismaCatalogRepository` diimplementasikan di `src/modules/catalog/infrastructure/prisma-catalog-repository.ts`.
- ✅ `InMemoryCatalogRepository` digantikan di `catalog-public-service.ts`; catalog terhubung ke database sungguhan.
- ✅ Exit criteria: seluruh operasi catalog menggunakan database sungguhan; quality gate lolos (78 test).

14. **M4.7 — Admin Catalog API**

- Endpoint admin dengan auth guard untuk mengelola catalog:
  - `POST /api/v1/admin/products` — create product
  - `PATCH /api/v1/admin/products/{id}` — update product
  - `PATCH /api/v1/admin/products/{id}/status` — update status
  - `DELETE /api/v1/admin/products/{id}` — archive product
  - `POST /api/v1/admin/products/{productId}/variants` — create variant
  - `PATCH /api/v1/admin/products/{productId}/variants/{id}` — update variant
  - `POST /api/v1/admin/categories` — create category
  - `PATCH /api/v1/admin/categories/{id}` — update category
- Exit criteria: admin dapat mengelola katalog via API; selaras dengan PRODUCT-001–004 dan PVAR-001–003.

15. **M4.8 — Product Media & SEO Dasar**

- Tambahkan `ProductMedia` (thumbnailUrl, gallery) dan `ProductSeo` (metaTitle, metaDescription, canonicalUrl) ke domain + Prisma schema.
- Exit criteria: backlog `catalog-product-media-seo` terpenuhi; thumbnail wajib ada saat produk dipublikasikan.

---

# Overall Progress

```
Planning & Documentation
████████████████████ 100%
```

```
System Design Readiness
████████████████████ 100%
```

```
Implementation
█████████░░░░░░░░░░░  40%
```

---

# Milestone Checkpoint

## ✅ Milestone 1 — Business Planning (Completed)

Deliverables:

- Project Foundation
- Business Specification
- User Experience Specification
- Functional Requirements

Status:

**Completed**

---

## ✅ Milestone 2 — System Design & Documentation (Completed)

Deliverables:

- System Architecture
- Technical Stack
- Domain Modules
- Data Model
- API Specification
- Design System
- Development Rules
- Development Roadmap

Status:

**Completed**

---

## ✅ Milestone 3 — Implementation Foundation (Completed)

Breakdown:

- [x] M3.1 Folder Structure Ready
- [x] M3.2 Bootstrap Workspace Ready
- [x] M3.3 Engineering Baseline Ready
- [x] M3.4 Data & Auth Plumbing Ready
- [x] M3.5 UI Foundation Ready
- [x] M3.6 CI Baseline Ready
- [x] M3.7 Catalog Start Gate (Definition of Ready)

Target Outcome:

- ✅ Project bootstrap siap untuk development harian.
- ✅ Baseline quality gates aktif dari lokal sampai CI.
- ✅ Implementasi module pertama (`catalog`) dapat dimulai tanpa ambiguity dokumen.

---

## ⏳ Milestone 4 — Catalog Foundation (In Progress)

Breakdown:

- [x] M4.1 Catalog Vertical Slice 01 (Category + Product Listing Public)
- [x] M4.2 Catalog Product Lifecycle Dasar
- [x] M4.3 Catalog Variant Pricing & Attributes Dasar
- [x] M4.4 Catalog Public Search Endpoint
- [x] M4.5 Prisma Schema Catalog
- [x] M4.6 Prisma Catalog Repository
- [ ] M4.7 Admin Catalog API
- [ ] M4.8 Product Media & SEO Dasar

Target Outcome:

- API katalog publik dasar siap dipakai consumer awal.
- Invariant domain katalog utama tervalidasi oleh test.
- Catalog terhubung ke database sungguhan (bukan in-memory).
- Admin dapat mengelola produk, varian, dan kategori via API.
- Phase 2 exit criteria terpenuhi sepenuhnya.
