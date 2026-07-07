# Implementation Context

Dokumen ini adalah snapshot implementasi terkini dan akan sering berubah.

## Current Phase

- Phase 0 (Planning & Documentation): **completed**
- Phase 1 (Project Foundation / Implementation Setup): **completed**
- Phase 2 (Catalog Foundation): **completed** (M4.1–M4.8 selesai)
- Current implementation progress: **60%** (M4.1–M4.8 catalog selesai, Phase 2 complete)

## Current Focus

- `phase-3 cart & checkout foundation`
- Phase 2 selesai. M4.8 (Product Media & SEO) sudah completed.
- Next active item: **Phase 3 — Cart Foundation** (vertical slice: add item, view cart, update qty, remove item)

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
  - Status: **Completed**
  - Lifecycle invariants baru: `canActivateProduct`, `isAllowedStatusTransition`, `isValidSlug`.
  - `CatalogProduct` entity diperluas: field `description` dan `brand` ditambahkan.
  - `PRODUCT_STATUS_TRANSITIONS` map dipindahkan ke domain entities (DRAFT/ACTIVE/OUT_OF_STOCK/ARCHIVED).
  - Repository contract diperluas: `findProductBySlug`, `findProductById`, `existsProductWithSlug`, `createProduct`, `updateProduct`, `updateProductStatus`.
  - `InMemoryCatalogRepository` diupdate: instance-based (bukan module-level), semua method baru diimplementasikan.
  - Application service baru: `get-product-by-slug.ts` dan `manage-product-lifecycle.ts` (create/update/archive/updateStatus).
  - Public facade diperluas: `getPublicProductBySlug` tersedia di `catalog-public-service.ts`.
  - Endpoint publik baru: `GET /api/v1/products/slug/[slug]`.
  - Test: `catalog-invariants.test.ts` (direnovasi + diperluas, 17 test) dan `product-lifecycle.test.ts` baru (14 test). Total 36 test lolos.
  - `bun run check` hijau.

- **M4.3 - Catalog Variant Pricing & Attributes Dasar**
  - Status: **Completed**
  - Type baru: `CatalogVariantStatus`, `CatalogVariant`, `VariantSnapshot`, `CreateVariantCommand`, `UpdateVariantCommand`.
  - Invariant baru: `isVariantPriceValid` (price >= 0, finite), `isValidSku` (non-empty setelah trim).
  - Repository contract diperluas: `findVariantsByProductId`, `findVariantById`, `existsVariantWithSku`, `createVariant`, `updateVariant`, `getVariantSnapshot`.
  - `InMemoryCatalogRepository` diperluas: variant store dengan 7 seed variant; sync `priceFrom`/`priceTo`/`variantCount` otomatis setelah mutasi.
  - Application service: `manage-variant.ts` dengan error-typed result (5 error codes).
  - Public facade: `getVariantSnapshotForCart` sebagai kontrak lintas module untuk consumer `cart`.
  - 65 test lolos, `bun run check` hijau.

- **M4.4 - Catalog Public Search Endpoint**
  - Status: **Completed**
  - Application service: `search-public-products.ts` — full-text search (name+description+brand), filter category/minPrice/maxPrice, pagination, sort. Typed error `QUERY_EMPTY`.
  - Public facade: `searchPublicProductsFromSearchParams` di `catalog-public-service.ts`.
  - Endpoint baru: `GET /api/v1/products/search` — HTTP 400 jika `q` kosong.
  - 78 test lolos, `bun run check` hijau.

- **M4.5 - Prisma Schema Catalog**
  - Status: **Completed**
  - Model `ProductCategory`, `Product`, `ProductVariant`, `VariantOption`, `VariantValue` ditambahkan ke `prisma/schema.prisma`.
  - Enum `ProductStatus` (DRAFT/ACTIVE/OUT_OF_STOCK/ARCHIVED) dan `VariantStatus` (ACTIVE/INACTIVE) aktif.
  - Audit fields, soft delete fields, dan index pola akses bisnis sesuai `docs/06-data-model.md`.
  - Migration `20260707030000_catalog_foundation` sudah diapply ke database Supabase.
  - `prisma generate` lolos; Prisma client menyertakan catalog types. 78 test lolos.

- **M4.6 - Prisma Catalog Repository**
  - Status: **Completed**
  - `PrismaCatalogRepository` di `src/modules/catalog/infrastructure/prisma-catalog-repository.ts` mengimplementasikan seluruh `CatalogRepository` contract.
  - `createVariant`/`updateVariant` menggunakan `prisma.$transaction` untuk menjaga konsistensi denormalized fields.
  - `InMemoryCatalogRepository` digantikan di `catalog-public-service.ts`; catalog terhubung ke Supabase PostgreSQL.
  - 78 test lolos, `bun run check` hijau.

- **M4.7 - Admin Catalog API**
  - Status: **Completed**
  - Auth guard `requireAdmin()` di `src/shared/infrastructure/auth/admin-guard.ts` (Supabase session + `app_metadata.role === "admin"`).
  - `CatalogRepository` diperluas dengan category CRUD (`findCategoryById`, `existsCategoryWithSlug`, `createCategory`, `updateCategory`).
  - Application service `manage-category.ts` dengan typed errors.
  - Facade `catalog-admin-service.ts` dengan re-export types sesuai import boundary rules.
  - Admin routes aktif: products (GET/POST/PATCH/DELETE), product status, variants (GET/POST/PATCH), categories (GET/POST/PATCH).
  - 78 test lolos, `bun run check` hijau.

- **M4.8 - Product Media & SEO Dasar**
  - Status: **Completed**
  - Enum baru: `MediaOwnerType` (`PRODUCT`/`VARIANT`), `ProductMediaType` (`IMAGE`/`VIDEO`/`THREE_SIXTY`/`MANUAL_PDF`).
  - Type domain baru: `ProductMedia`, `ProductSeo`, `AddProductMediaCommand`, `UpsertProductSeoCommand`.
  - Prisma model `ProductMedia` + `ProductSeo` + migration `20260707061153_catalog_media_seo` diapply ke Supabase.
  - Application service `manage-product-media.ts`: 5 fungsi dengan typed errors.
  - Invariant diperluas: thumbnail wajib ada saat produk diaktifkan (`CANNOT_ACTIVATE_WITHOUT_THUMBNAIL`).
  - `thumbnailUrl` auto-sync saat media IMAGE pertama ditambahkan.
  - Admin routes baru: `GET/POST /api/v1/admin/products/[id]/media`, `DELETE /api/v1/admin/products/[id]/media/[mediaId]`, `GET/PUT /api/v1/admin/products/[id]/seo`.
  - 78 test lolos, `bun run check` hijau.

## Module Build Plan (High-Level)

### Catalog Module

- Status: **Completed** (M4.1–M4.8 all done, Phase 2 selesai)
- Target phase: Phase 2 ✅
- Deliverables: product/category/variant/detail/search/filter/sort + admin CRUD API + media + SEO
- Database: terhubung ke Supabase PostgreSQL via `PrismaCatalogRepository`

### Auth Module

- Status: Foundation plumbing completed in Phase 1 (M3.4), fitur module belum dimulai
- Scope awal: register/login/logout/reset + role guard

### Database

- Status: Foundation plumbing completed in Phase 1 (M3.4), schema catalog selesai (M4.5), Prisma Catalog Repository aktif (M4.6)
- Scope awal: schema baseline, migration strategy, repository contract
- Current: catalog terhubung ke database sungguhan via `PrismaCatalogRepository`

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

- Open Decisions: sudah diselesaikan pada 2026-07-06 (branding, engineering policy, operations SOP). Lihat `planning/decisions.md` Decision 018-020.

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
