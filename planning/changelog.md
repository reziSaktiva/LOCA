# Changelog

Catatan perubahan besar selama proses pengembangan.

Mengikuti prinsip:

* Tambahkan entri baru di bagian atas.
* Jangan menghapus riwayat perubahan.

---

## 2026-07-07 (3)

### Added

- Implementasi **M4.7 — Admin Catalog API**:
  - `src/modules/catalog/domain/catalog-entities.ts` — tambah `CreateCategoryCommand` dan `UpdateCategoryCommand`.
  - `src/modules/catalog/domain/catalog-repository.ts` — perluas interface: `findCategoryById`, `existsCategoryWithSlug`, `createCategory`, `updateCategory`.
  - `src/modules/catalog/infrastructure/in-memory-catalog-repository.ts` — implementasi 4 method baru (category CRUD).
  - `src/modules/catalog/infrastructure/prisma-catalog-repository.ts` — implementasi 4 method baru (category CRUD via Prisma).
  - `src/modules/catalog/application/manage-category.ts` — application service baru: `createCategory`, `updateCategory` dengan typed error (`CATEGORY_NOT_FOUND`, `SLUG_INVALID`, `SLUG_CONFLICT`).
  - `src/shared/infrastructure/auth/admin-guard.ts` — utility `requireAdmin()`: verifikasi autentikasi + role admin via Supabase `app_metadata.role`.
  - `src/modules/catalog/public/catalog-admin-service.ts` — admin facade baru dengan re-export types, fungsi: `adminListProducts`, `adminGetProductById`, `adminCreateProduct`, `adminUpdateProduct`, `adminUpdateProductStatus`, `adminArchiveProduct`, `adminGetVariantsByProduct`, `adminCreateVariant`, `adminUpdateVariant`, `adminListCategories`, `adminGetCategoryById`, `adminCreateCategory`, `adminUpdateCategory`.
  - Admin route handlers:
    - `GET/POST /api/v1/admin/products`
    - `GET/PATCH/DELETE /api/v1/admin/products/[id]`
    - `PATCH /api/v1/admin/products/[id]/status`
    - `GET/POST /api/v1/admin/products/[id]/variants`
    - `PATCH /api/v1/admin/products/[id]/variants/[variantId]`
    - `GET/POST /api/v1/admin/categories`
    - `GET/PATCH /api/v1/admin/categories/[id]`

### Verified

- `bun run check` (lint + typecheck + test) — hijau, 78 test lolos, 0 error.

### Notes

- Semua admin endpoint dilindungi oleh `requireAdmin()` yang memverifikasi Supabase session + `app_metadata.role === "admin"`.
- Import boundary dipatuhi: route handler hanya import dari `public` dan `presentation` layer.
- M4.7 exit criteria terpenuhi.

---

## 2026-07-07 (2)

### Added

- Implementasi **M4.6 — Prisma Catalog Repository**:
  - `src/modules/catalog/infrastructure/prisma-catalog-repository.ts` — `PrismaCatalogRepository` yang mengimplementasikan seluruh `CatalogRepository` contract dengan Prisma client nyata.
  - Mappers internal: `toCategory`, `toProduct`, `toVariant` untuk konversi Prisma row ke domain type.
  - Semua method diimplementasikan: `listCategories`, `listProducts`, `findProductBySlug`, `findProductById`, `existsProductWithSlug`, `createProduct`, `updateProduct`, `updateProductStatus`, `findVariantsByProductId`, `findVariantById`, `existsVariantWithSku`, `createVariant`, `updateVariant`, `getVariantSnapshot`.
  - `createVariant` dan `updateVariant` menggunakan `prisma.$transaction` untuk menjamin konsistensi denormalized fields (`variantCount`, `priceFrom`, `priceTo`) di tabel `products`.
  - Helper privat `syncProductDenormalizedFields` untuk rekalkulasi dan sync di dalam transaksi.
  - Soft delete aware: semua query menyertakan `isDeleted: false`.

### Changed

- `src/modules/catalog/public/catalog-public-service.ts` — ganti `InMemoryCatalogRepository` dengan `PrismaCatalogRepository`; module `catalog` sekarang terhubung ke database Supabase PostgreSQL sungguhan.

### Verified

- `bun run check` (lint + typecheck + test) — hijau, 78 test lolos.
- Tidak ada linter error di file baru maupun yang diubah.

### Notes

- `InMemoryCatalogRepository` tetap tersedia di `infrastructure/` untuk kebutuhan unit test (application service tests menggunakannya langsung dan tidak terpengaruh perubahan ini).
- Exit criteria M4.6 tercapai: catalog terhubung ke database sungguhan, quality gate lolos.

---

## 2026-07-07 (1)

### Added

- Implementasi **M4.5 — Prisma Schema Catalog**:
  - Model `ProductCategory` di `prisma/schema.prisma` — `id`, `name`, `slug` (unique), `isActive`, audit fields, soft delete fields.
  - Model `Product` (aggregate root) di `prisma/schema.prisma` — `id`, `name`, `slug` (unique), `brand`, `description`, `status` (enum ProductStatus), `categoryId` (FK), denormalized fields (`variantCount`, `priceFrom`, `priceTo`, `thumbnailUrl`), audit fields, soft delete fields. Index: `(status, categoryId, createdAt)`.
  - Model `ProductVariant` di `prisma/schema.prisma` — `id`, `productId` (FK), `sku` (unique), `price`, `compareAtPrice`, `variantLabel`, `status` (enum VariantStatus), audit fields, soft delete fields. Index: `(productId)`.
  - Model `VariantOption` di `prisma/schema.prisma` — `id`, `productId` (FK), `optionCode`, `optionName`, `displayOrder`, audit fields. Index: `(productId)`.
  - Model `VariantValue` di `prisma/schema.prisma` — `id`, `variantId` (FK), `optionId` (FK), `valueCode`, `valueLabel`, audit fields. Index: `(variantId)`.
  - Enum `ProductStatus`: `DRAFT`, `ACTIVE`, `OUT_OF_STOCK`, `ARCHIVED`.
  - Enum `VariantStatus`: `ACTIVE`, `INACTIVE`.
  - Migration SQL: `prisma/migrations/20260707030000_catalog_foundation/migration.sql`.
  - Migration lock: `prisma/migrations/migration_lock.toml`.

### Verified

- `bunx --bun prisma generate` — lolos, Prisma client di `src/generated/prisma` menyertakan catalog types (`ProductCategory`, `Product`, `ProductVariant`, `VariantOption`, `VariantValue`, `ProductStatus`, `VariantStatus`).
- `bunx --bun prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` — SQL valid, foreign key dan index sesuai dengan `docs/06-data-model.md`.
- `bun run check` (lint + typecheck + test) — hijau, 78 test lolos.

### Notes

- Migration `20260707030000_catalog_foundation` **sudah diapply ke database Supabase** via `bunx --bun prisma migrate dev`. Database sekarang sudah memiliki tabel `product_categories`, `products`, `product_variants`, `variant_options`, `variant_values`.
- `VariantOption` dan `VariantValue` diikutsertakan di M4.5 karena coupled erat dengan `Product`/`ProductVariant` sebagai bagian dari aggregate boundary catalog (`docs/06-data-model.md` section 7).
- `ProductMedia` dan `ProductSeo` ditunda ke M4.8 sesuai roadmap.

---

## 2026-07-06 (13)

### Planning

- Menetapkan roadmap task berikutnya setelah M4.4 untuk menyelesaikan **Phase 2 (Catalog Foundation)** sepenuhnya.
- Task baru didaftarkan di `PROJECT_STATE.md` (`Next Action` + `Milestone Checkpoint`):
  - **M4.5 — Prisma Schema Catalog**: model `ProductCategory`, `Product`, `ProductVariant` ke `prisma/schema.prisma` + migration.
  - **M4.6 — Prisma Catalog Repository**: `PrismaCatalogRepository` menggantikan in-memory; catalog terhubung ke database sungguhan.
  - **M4.7 — Admin Catalog API**: endpoint admin CRUD product/variant/category dengan auth guard (PRODUCT-001–004, PVAR-001–003).
  - **M4.8 — Product Media & SEO Dasar**: `ProductMedia` + `ProductSeo`; menutup backlog `catalog-product-media-seo`.
- Keputusan untuk menyelesaikan Phase 2 sepenuhnya sebelum lanjut ke Phase 3 (Customer & Homepage).

### Notes

- Setelah M4.5–M4.8 selesai, semua Phase 2 exit criteria terpenuhi:
  - ✅ Customer dapat melihat seluruh produk
  - ✅ Product Detail selesai
  - ✅ Search berjalan
  - ✅ Admin dapat mengelola katalog
- Phase 3 berikutnya: Auth module → Customer → Homepage.

---

## 2026-07-06 (12)

### Added

- Implementasi **M4.4 — Catalog Public Search Endpoint**:
  - Application service baru `src/modules/catalog/application/search-public-products.ts`:
    - `SearchPublicProductsQuery` type (`q` required, pagination/sort/filter optional).
    - Full-text search mencakup `name`, `description`, DAN `brand` (berbeda dari listing yang hanya `name`).
    - Filter: category, minPrice, maxPrice, pagination, sort.
    - Typed error result: `QUERY_EMPTY` jika `q` kosong/whitespace.
  - Public facade di `catalog-public-service.ts`: `searchPublicProductsFromSearchParams` + `SearchProductsResult` type.
  - Route handler baru: `src/app/api/v1/products/search/route.ts` (`GET /api/v1/products/search`); mengembalikan HTTP 400 jika `q` kosong.
  - Test file baru `search-public-products.test.ts`: 13 test case (match name/description/brand, case-insensitive, filter, pagination, sort, empty result, error QUERY_EMPTY).

### Verified

- `bun run check` (lint + typecheck + test) lolos — 78 test, 6 test file, 0 error.

### Notes

- M4.4 adalah milestone terakhir Catalog Foundation (M4.1–M4.4 selesai).
- Search endpoint dibedakan dari listing: `q` wajib, scope lebih luas (name+description+brand).
- Next: mulai module berikutnya (Auth/Inventory) atau lanjut ke catalog admin CRUD + Prisma persistence.

---

## 2026-07-06 (11)

### Changed

* `AGENTS.md` §7 (Git and Change Hygiene) — ditambahkan aturan eksplisit: agent tidak boleh commit otomatis setelah task selesai; wajib lapor hasil dan tunggu instruksi commit dari manusia.
* `.agents/skills/spec-driven-workflow/SKILL.md` — dua tempat diperbarui:
  - Bagian **Batasan untuk AI Assistant**: larangan commit otomatis ditambahkan secara eksplisit dengan alur kerja yang jelas (selesai → quality gate → lapor → tunggu).
  - Bagian **Definition of Done**: checklist commit diubah menjadi kewajiban menunggu persetujuan manusia sebelum commit dilakukan.
* Mencatat keputusan pada `planning/decisions.md` (Decision 021).

---

## 2026-07-06 (10)

### Added

* Implementasi **M4.3 — Catalog Variant Pricing & Attributes Dasar**:
  - Type baru di `catalog-entities.ts`: `CatalogVariantStatus`, `CatalogVariant`, `VariantSnapshot`, `CreateVariantCommand`, `UpdateVariantCommand`.
  - Invariant baru di `catalog-invariants.ts`: `isVariantPriceValid` (price >= 0, finite), `isValidSku` (non-empty setelah trim).
  - Repository contract diperluas: `findVariantsByProductId`, `findVariantById`, `existsVariantWithSku`, `createVariant`, `updateVariant`, `getVariantSnapshot`.
  - `InMemoryCatalogRepository` diperluas: in-memory variant store dengan seed 7 varian untuk 3 produk; semua method baru diimplementasikan; `createVariant`/`updateVariant` otomatis sync `priceFrom`/`priceTo`/`variantCount` di product induk.
  - Application service baru: `manage-variant.ts` (`createVariant`, `updateVariant`) dengan error-typed result (`PRODUCT_NOT_FOUND`, `VARIANT_NOT_FOUND`, `SKU_INVALID`, `SKU_CONFLICT`, `PRICE_INVALID`).
  - Public facade diperluas: `getVariantSnapshotForCart` tersedia di `catalog-public-service.ts` sebagai kontrak lintas module untuk consumer `cart`.
* Test baru:
  - `catalog-invariants.test.ts` diperluas: 10 test case baru (isVariantPriceValid, isValidSku). Total 27 test di file ini.
  - `manage-variant.test.ts` baru: 20 test case (createVariant, updateVariant, getVariantSnapshot). Total 65 test lolos seluruh suite.

---

## 2026-07-06 (9)

### Added

* Implementasi **M4.2 — Catalog Product Lifecycle Dasar**:
  - `PRODUCT_STATUS_TRANSITIONS` map ditambahkan ke `catalog-entities.ts` (lifecycle DRAFT/ACTIVE/OUT_OF_STOCK/ARCHIVED).
  - Field `description` dan `brand` ditambahkan ke `CatalogProduct` entity.
  - Type `CreateProductCommand` dan `UpdateProductCommand` ditambahkan.
  - Invariant baru di `catalog-invariants.ts`: `canActivateProduct`, `isAllowedStatusTransition`, `isValidSlug`.
  - Repository contract diperluas: `findProductBySlug`, `findProductById`, `existsProductWithSlug`, `createProduct`, `updateProduct`, `updateProductStatus`.
  - `InMemoryCatalogRepository` direfactor jadi instance-based; semua method baru diimplementasikan; seed data diperluas dengan field `description`/`brand`.
  - Application service baru: `get-product-by-slug.ts` dan `manage-product-lifecycle.ts`.
  - Public facade `catalog-public-service.ts` diperluas: `getPublicProductBySlug`, type `PublicProductDetail`.
  - Endpoint publik baru: `GET /api/v1/products/slug/[slug]`.
* Test baru:
  - `catalog-invariants.test.ts` direnovasi total: helper `makeProduct`, 17 test case (isProductPubliclyListable, canActivateProduct, isAllowedStatusTransition, isValidSlug).
  - `product-lifecycle.test.ts` baru: 14 test case (getProductBySlug, createProduct, updateProductStatus, archiveProduct).

### Changed

* Memperbarui `PROJECT_STATE.md`: M4.2 selesai, progress implementation 25%, next action ke M4.3.
* Memperbarui `context/ctx-implementation.md`: M4.2 completed dicatat, Open Decisions diselesaikan.

### Verified

* `bun run check` — lolos (`lint`, `typecheck`, `test`). Total 36 test hijau.

### Notes

* Repository in-memory sekarang instance-based (bukan module-level) agar state antar test tidak bocor.
* Endpoint detail publik hanya mengembalikan produk yang `isProductPubliclyListable` — ARCHIVED dan DRAFT tidak terekspos.

---

## 2026-07-06 (8)

### Added

* Menetapkan **Branding Final LOCA** (Decision 018):
  - Nama brand: **LOCA** (final).
  - Logo: Wordmark — nama "LOCA" dengan typography kuat, clean, minimal.
  - Color direction: Black + Off-White + 1 Accent Color.
  - Typography: Geometric Sans (Outfit / Plus Jakarta Sans).
  - Tone of voice: Confident & Minimal.
  - Brand story: Lifestyle Movement.
* Menetapkan **Engineering Policy** (Decision 019):
  - Testing strategy: Unit test domain layer + Integration test API endpoint.
  - Branch protection: CI gate wajib (lint + typecheck + test) sebelum merge ke `main`.
  - Deployment flow: Manual deploy untuk saat ini.
* Menetapkan **SOP Operasional MVP** (Decision 020):
  - KPI harian: Total Order + Revenue + Stok Habis.
  - SOP order handling: Terima order → Kemas → Drop ke kurir (simple 3-step).
  - SLA shipping: 1-2 hari kerja setelah payment confirmed.

### Changed

* Memperbarui `docs/01-business.md`:
  - Menambahkan Brand Identity section (nama, logo, color, typography, tone of voice).
  - Menambahkan Brand Story Lifestyle Movement.
  - Menambahkan Business Rules §Operational (SOP + SLA + KPI).
  - Melengkapi Operational KPI di Success Metrics.
* Memperbarui `docs/09-design-system.md`:
  - Color System diperbarui dengan arah palette Black + Off-White + 1 Accent.
  - Typography diperbarui dengan pilihan Geometric Sans (Outfit / Plus Jakarta Sans).
* Memperbarui `PROJECT_STATE.md`:
  - Latest Decisions: Business & Product dan Technical diperbarui.
  - Open Decisions: dikurangi signifikan — item Branding, Engineering, dan Operations yang sudah diputuskan dipindahkan ke Latest Decisions.
* Menambahkan Decision 018, 019, 020 di `planning/decisions.md`.

### Notes

* Warna accent final dan font final (Outfit vs Plus Jakarta Sans) masih ditetapkan saat produksi brand asset/implementasi UI — keduanya tidak memblokir implementasi kode saat ini.

---

## 2026-07-05 (7)

### Added

* Menambahkan implementasi vertical slice awal module `catalog`:
  - domain entity + invariant publik (`src/modules/catalog/domain/`),
  - application service listing produk/kategori publik (`src/modules/catalog/application/`),
  - in-memory repository seed awal (`src/modules/catalog/infrastructure/in-memory-catalog-repository.ts`),
  - public facade + response helper (`src/modules/catalog/public/`, `src/modules/catalog/presentation/`),
  - endpoint `GET /api/v1/products` dan `GET /api/v1/products/categories` (`src/app/api/v1/products/**`).
* Menambahkan test baru untuk domain invariant dan application service katalog publik:
  - `src/modules/catalog/domain/catalog-invariants.test.ts`
  - `src/modules/catalog/application/catalog-public-listing.test.ts`

### Changed

* Memperbarui `PROJECT_STATE.md`:
  - menandai **M4.1 — Catalog Vertical Slice 01** sebagai selesai,
  - menggeser next action ke **M4.2 — Catalog Product Lifecycle Dasar**,
  - membuka checkpoint **Milestone 4 — Catalog Foundation (In Progress)**.
* Memperbarui `context/ctx-implementation.md` agar sinkron dengan status terbaru Phase 2 (M4.1 completed).

### Verified

* `bun run check` — lolos (`lint`, `typecheck`, `test`).

### Notes

* Implementasi M4.1 masih menggunakan repository in-memory sebagai fondasi vertical slice read-path publik; persistence Prisma akan dihubungkan di slice berikutnya.

---

## 2026-07-05 (6)

### Added

* Menambahkan paket **Catalog Start Gate (M3.7)** di `planning/backlog.md` berisi feature backlog vertical slice `catalog`, acceptance criteria per feature, verifikasi dependency antar module, dan readiness checklist (Definition of Ready).
* Menambahkan keputusan baru di `planning/decisions.md` sebagai **Decision 017** untuk menetapkan M3.7 sebagai completion gate sebelum kickoff implementasi module `catalog`.

### Changed

* Memperbarui `PROJECT_STATE.md`:
  - menandai **M3.7 — Catalog Start Gate** sebagai selesai,
  - menutup **Milestone 3 — Implementation Foundation** sebagai completed,
  - menggeser next action ke **M4.1 — Catalog Vertical Slice 01**.
* Memperbarui `context/ctx-implementation.md` agar sinkron dengan status terbaru: M3.7 completed, fase berikutnya siap mulai implementasi `catalog`.

### Notes

* Exit criteria M3.7 terpenuhi seluruhnya: backlog, acceptance criteria, dependency verification, dan readiness dokumentasi `catalog`.

---

## 2026-07-05 (5)

### Changed

* Memperbarui `PROJECT_STATE.md` untuk menandai **M3.6 — CI Baseline Ready** sebagai selesai: status implementation state berubah ke ✅, checklist Milestone 3 menandai M3.6 selesai, dan exit criteria dicatat telah terpenuhi.
* Memperbarui `context/ctx-implementation.md` agar `Current Focus` berpindah ke **M3.7 — Catalog Start Gate** dan status M3.6 tercatat completed.

### Verified

* Pipeline minimum PR (`lint`, `typecheck`, `test`) berhasil hijau.

### Notes

* Fokus Phase 1 berikutnya: menutup **M3.7 — Catalog Start Gate (Definition of Ready)**.

---

## 2026-07-05 (4)

### Changed

* Memperbarui workflow CI di `.github/workflows/ci.yml` dengan step `Generate Prisma client` (`bunx --bun prisma generate`) sebelum `lint`, `typecheck`, dan `test`.
* Menambahkan env dummy `DIRECT_URL` dan `DATABASE_URL` di step generate agar Prisma config tetap valid saat berjalan di environment CI.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` untuk mencatat mitigasi error CI `Cannot find module '../../../generated/prisma/client'`.

### Notes

* Tujuan perubahan: memastikan Prisma client selalu tersedia pada job CI sebelum `tsc --noEmit` dijalankan.

---

## 2026-07-05 (3)

### Changed

* Menjalankan formatter pada scope resmi project (`src/**/*.{ts,tsx,css}` dan `*.{json,mjs,ts}`) untuk menyelesaikan formatting drift lintas file.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` agar status M3.6 mencatat bahwa `check:full` sudah kembali hijau.

### Verified

* `bun run format` — berhasil menormalkan formatting pada seluruh file dalam scope formatter.
* `bun run check:full` — lolos penuh (`lint`, `typecheck`, `test`, `format:check`).

### Notes

* Remaining exit criteria M3.6: pipeline PR harus hijau.

---

## 2026-07-05 (2)

### Changed

* Menyesuaikan script test di `package.json` agar Vitest dijalankan melalui runtime Bun (`bun --bun ./node_modules/vitest/vitest.mjs`) untuk menghindari error startup ESM pada environment Node saat ini.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` agar status M3.6 mencerminkan blocker SSL lokal yang sudah selesai dan verifikasi gate minimum yang sudah lolos.

### Verified

* `bun install` — berhasil tanpa error `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
* `bun run check` — lolos (`lint`, `typecheck`, `test`).
* `bun run check:full` — masih gagal pada `format:check` karena formatting drift lintas file.

### Notes

* Exit criteria M3.6 tetap: pipeline minimum harus hijau pada PR.
* Pekerjaan lanjutan disarankan: rapikan formatting drift agar `check:full` kembali hijau.

---

## 2026-07-05

### Added

* Menambahkan baseline workflow CI di `.github/workflows/ci.yml` dengan trigger `pull_request` dan `push` ke `main`.
* Menambahkan quality gates minimum CI: `bun run lint`, `bun run typecheck`, `bun run test`.
* Mencatat keputusan pada `planning/decisions.md` (Decision 016).

### Changed

* Memperbarui `PROJECT_STATE.md` untuk menandai progres M3.6 (workflow sudah dibuat, verifikasi lokal masih pending).
* Memperbarui `context/ctx-implementation.md` agar snapshot implementasi mencerminkan status terbaru M3.6.

### Verified

* Verifikasi quality gate lokal belum bisa dijalankan karena `bun install --frozen-lockfile` gagal dengan `UNABLE_TO_VERIFY_LEAF_SIGNATURE` pada environment saat ini.

### Notes

* Exit criteria M3.6 tetap: pipeline minimum harus hijau pada PR. Verifikasi final dilakukan setelah isu SSL sertifikat pada environment lokal terselesaikan.

---

## 2026-07-03 (10)

### Fixed

* **Next.js 16: `middleware.ts` → `proxy.ts`** — `src/middleware.ts` dihapus, diganti `src/proxy.ts` dengan exported function `proxy()`. Warning deprecasi `⚠ The "middleware" file convention is deprecated` tidak muncul lagi. Logika Supabase Auth token refresh tidak berubah.
* **Hydration mismatch `next-themes`** — menambahkan `suppressHydrationWarning` pada `<html>` di `src/app/layout.tsx`. `ThemeProvider` dari `next-themes` menambahkan `style={{color-scheme:"dark"}}` di sisi client setelah hydration (server tidak tahu preferensi tema user), yang memunculkan diff React. `suppressHydrationWarning` adalah solusi resmi untuk kasus ini.
* Mencatat keputusan pada `planning/decisions.md` (Decision 015).

---

## 2026-07-03 (9)

### Added

* **shadcn/ui initialized** — style `base-nova` (Base UI primitives), dikonfigurasi via `components.json` dengan `ui` alias menunjuk ke `src/shared/ui/`.
* **15 core UI components** installed ke `src/shared/ui/`: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `badge`, `card`, `dialog`, `dropdown-menu`, `tabs`, `table`, `pagination`, `sonner`.
* **Barrel export** `src/shared/ui/index.ts` — semua komponen dan utilities dapat diimport dari `@/shared/ui`.
* **Container component** `src/shared/ui/container.tsx` — layout primitive responsif (max-w-7xl, horizontal padding `sm`/`lg`).
* **Provider pattern** `src/app/providers.tsx` — client component wrapping `ThemeProvider` (next-themes) + `Toaster` (sonner).
* **Design tokens** dikonfigurasi di `src/app/globals.css`:
  - Semantic colors: `success`, `warning`, `error` (alias ke `destructive`), `info` — tersedia sebagai CSS variable dan Tailwind utilities (`bg-success`, `text-info`, dll).
  - Radius scale: `radius-xs` (4px) → `radius-xl` (24px).
  - Shadow tokens: `shadow-sm`, `shadow-md`, `shadow-lg`.
  - Font reference diperbaiki: `--font-sans: var(--font-geist-sans)`.
* **Dependency stack UI** dilengkapi: `lucide-react@1.23.0`, `motion@12.42.2`, `react-hook-form@7.80.0`, `zod@4.4.3`, `next-themes@0.4.6`, `sonner@2.0.7`.
* Mencatat keputusan pada `planning/decisions.md` (Decision 014).

### Changed

* `src/app/layout.tsx` — tambah `Providers` wrapper, ubah `lang="en"` ke `lang="id"`.
* `src/app/globals.css` — diperbarui total: menambah design tokens, semantic colors, memperbaiki font reference, mempertahankan shadcn theme variables.
* `components.json` — `aliases.ui` dan `aliases.utils` diupdate ke `@/shared/ui`.

### Verified

* `bun run check` (lint + typecheck + test) — semua lolos.

### Notes

* Nilai primary masih placeholder (neutral dark) — akan diupdate saat brand colors difinalisasi (Open Decision).
* Komponen shadcn menggunakan oklch color space — kompatibel dengan dark mode via `next-themes`.

---

## 2026-07-03 (8)

### Added

* Menambahkan skill baru `.agents/skills/progress-sync/SKILL.md` yang mewajibkan agent otomatis melaporkan progress task implementasi ke `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` tanpa harus diminta user — mencegah drift status antar dokumen.
* Mencatat keputusan pada `planning/decisions.md` (Decision 013).

### Changed

* Memperbarui `context/ctx-implementation.md` agar mencerminkan progress M3.1-M3.4 yang sudah selesai (sebelumnya masih menampilkan status "0%, belum dimulai" yang usang).
* Memperbarui `PROJECT_STATE.md` (Agent Governance) untuk mencatat penambahan skill `progress-sync`.

### Notes

* Skill ini melengkapi `docs-sync`: `docs-sync` untuk perubahan spesifikasi/keputusan besar, `progress-sync` untuk pelaporan status implementasi rutin di akhir setiap task.

---

## 2026-07-03 (7)

### Changed

* Memindahkan 3 core skill project (`spec-driven-workflow`, `module-scaffold`, `docs-sync`) dari `.cursor/skills/` ke `.agents/skills/` sesuai konvensi Cursor terbaru.

### Added

* Menambahkan 2 skill baru dari registry `supabase/agent-skills`: `supabase` dan `supabase-postgres-best-practices`.
* Menambahkan `skills-lock.json` di root project untuk tracking versi skill yang terpasang.
* Mencatat keputusan pada `planning/decisions.md` (Decision 012).

---

## 2026-07-03 (6)

### Added

* **Supabase Auth integration** — install `@supabase/supabase-js@2.110.0` dan `@supabase/ssr@0.12.0`.
* `src/shared/infrastructure/supabase/client.ts` — browser client (`createBrowserClient`).
* `src/shared/infrastructure/supabase/server.ts` — server client (`createServerClient`) dengan cookie handlers untuk Next.js App Router.
* `src/middleware.ts` — Next.js middleware Proxy untuk refresh token otomatis via `getClaims()`.
* **Prisma 7 + Supabase PostgreSQL baseline** — install `prisma@7.8.0`, `@prisma/adapter-pg@7.8.0`, `pg@8.22.0`.
* `prisma.config.ts` — konfigurasi Prisma CLI: load `.env.local`, gunakan `DIRECT_URL` untuk migrations (bypass PgBouncer).
* `prisma/schema.prisma` — schema baseline bersih, siap untuk penambahan model.
* `src/shared/infrastructure/database/client.ts` — Prisma singleton dengan PgBouncer-compatible pooled connection via `@prisma/adapter-pg`.
* `src/shared/infrastructure/env.ts` — diperluas dengan validasi `DATABASE_URL`.
* `.env.example` — template env yang di-commit ke repo.
* Mencatat keputusan pada `planning/decisions.md` (Decision 011).

### Changed

* `.gitignore` — menambahkan `!.env.example` agar template tidak ter-ignore.
* `.env.local` — diperluas dengan `DATABASE_URL` dan `DIRECT_URL`.

### Verified

* `bun run lint` dan `bun run typecheck` lolos bersih setelah setup.
* `bunx prisma generate` berhasil menghasilkan client ke `src/generated/prisma/`.

### Notes

* Milestone **M3.4 — Data & Auth Plumbing Ready** selesai. Exit criteria terpenuhi: Supabase Auth dan database siap dipakai untuk pengembangan module.
* Env vars aktual belum diisi — developer perlu mengisi `.env.local` dari Supabase Dashboard sebelum mulai development.

---

## 2026-07-03 (5)

### Added

* Menambahkan standard command quality gate harian di `package.json`: `check` (`lint + typecheck + test`) dan `check:full` (`check + format:check`).
* Mencatat keputusan finalisasi M3.3 pada `planning/decisions.md` (Decision 010).

### Changed

* Memperbarui `README.md` agar daftar script development mencerminkan baseline terbaru M3.3.
* Memperbarui `PROJECT_STATE.md` untuk menandai M3.3 selesai dan memindahkan next action ke M3.4.

### Verified

* Validasi lokal lolos: `bun run check` dan `bun run check:full`.

---

## 2026-07-03 (4)

### Added

* Menambahkan baseline quality tooling M3.3 bagian pertama: `prettier`, `vitest`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, dan smoke test awal `src/shared/kernel/engineering-baseline-smoke.test.ts`.
* Menstandarkan script kualitas di `package.json`: `typecheck`, `test`, `format`, `format:check`, `test:watch` (melengkapi script `lint` yang sudah ada).
* Mencatat keputusan resmi baseline engineering pada `planning/decisions.md` (Decision 009).

### Changed

* Menjalankan formatting pada file source/config yang termasuk scope script formatter sehingga `src/app/layout.tsx`, `src/app/page.tsx`, `eslint.config.mjs`, dan `next.config.ts` ikut tersinkronkan style-nya.

### Verified

* Seluruh quality gate minimum lolos lokal: `bun run lint`, `bun run typecheck`, `bun run test`, dan `bun run format:check`.

### Notes

* Scope formatter sengaja dibatasi ke source dan file konfigurasi inti agar tidak memicu reformat massal dokumen markdown yang berada di luar scope task M3.3 bagian pertama.

---

## 2026-07-03 (3)

### Changed

* Membersihkan boilerplate default `create-next-app` di `src/app/layout.tsx` (metadata title/description) dan `src/app/page.tsx` (konten marketing Next.js/Vercel diganti placeholder minimal identitas project).

### Verified

* Milestone **M3.2 — Bootstrap Workspace Ready** selesai: `bun install`, `bun dev`, `bun run build`, `bun run lint`, `tsc --noEmit` seluruhnya lolos tanpa warning.

### Notes

* Konten `page.tsx` sengaja dibuat minimal (bukan desain homepage final) — desain UI baru masuk di M3.5 (UI Foundation) dan implementasi fitur `homepage` module di fase berikutnya, sesuai roadmap.

---

## 2026-07-03 (2)

### Changed

* Memutuskan **Bun** sebagai package manager resmi proyek, menggantikan referensi pnpm di `docs/08-technical-stack.md` §21. Lihat `planning/decisions.md` (Decision 008).
* Memperbarui `context/ctx-technical-context.md` dan `README.md` agar konsisten menyebut Bun.
* Menghapus item "Package manager final" dari `planning/questions.md` (sudah terjawab) dan memindahkannya dari Open Decisions ke Latest Decisions di `PROJECT_STATE.md`.

### Notes

* Keputusan ini menutup mismatch yang dicatat pada entri 2026-07-03 sebelumnya, sebelum mulai M3.2 — Bootstrap Workspace Ready.

---

## 2026-07-03

### Added

* Menambahkan scaffold folder `src/modules/<module>/{presentation,application,domain,infrastructure,public}` untuk 11 module MVP dan `src/shared/{kernel,infrastructure,events,analytics,ui}`, lengkap `README.md` ringkas per folder.
* Menambahkan penegakan import boundary otomatis (`import/no-restricted-paths`) di `eslint.config.mjs` sesuai `docs/04-system-architecture.md` §7-8, tanpa dependency baru (memakai `eslint-plugin-import` bawaan `eslint-config-next`).
* Menambahkan 3 core skill di `.cursor/skills/` (`spec-driven-workflow`, `module-scaffold`, `docs-sync`) sebagai fondasi cara kerja AI assistant di project ini.
* Menambahkan `agents/README.md` — panduan cara memakai persona `@agents/*.md` (mention manual, beda dengan skill yang auto-aktif), lengkap tabel role dan contoh prompt.
* Menulis ulang `README.md` (sebelumnya masih default `create-next-app`) menjadi panduan onboarding project: dokumentasi SSOT, alur kerja/vertical slice, cara pakai skill + agents, struktur folder, dan tech stack.

### Notes

* Milestone M3.1 — Folder Structure Ready selesai. Lihat `planning/decisions.md` (Decision 007) untuk detail.
* Ditemukan mismatch: `docs/08-technical-stack.md` menyebut pnpm sebagai package manager resmi, tetapi repo memakai `bun.lock` (bootstrap awal via Bun). Belum diputuskan, dicatat di `planning/questions.md`/`backlog.md` untuk keputusan M3.2.

---

## 2026-07-02

### Changed

* Menyelaraskan provider autentikasi menjadi Supabase Auth di `00-project-foundation.md` dan `05-domain-modules.md` (sebelumnya menyebut Better Auth).
* Menghapus referensi Railway PostgreSQL yang bentrok dengan Supabase di bagian Deployment `08-technical-stack.md`.
* Menyelaraskan daftar Business Module inti di `00-project-foundation.md` menjadi `auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage`, dengan `Admin` sebagai interface layer dan `Analytics` sebagai cross-cutting concern (mengikuti `04-system-architecture.md`/`05-domain-modules.md`).
* Menyelaraskan Order Status di `03-functional-requirements.md` agar memisahkan `Pending` dan `Waiting Payment` (sebelumnya digabung jadi "Pending Payment").
* Menyelaraskan Shipping Status di `03-functional-requirements.md` menggunakan istilah "Picked Up" (sebelumnya "Shipped").
* Memperluas daftar prioritas Source of Truth di `10-development-rules.md` agar menyertakan `00-project-foundation.md`, `04-system-architecture.md`, dan `08-technical-stack.md`.

### Added

* Menambahkan ringkasan penjelasan seluruh file `docs/` di `planning/README.md`.

### Notes

Perubahan berasal dari audit konsistensi seluruh dokumen `docs/`. Lihat `planning/decisions.md` (Decision 006) untuk detail keputusan.

---

## 2026-06-30

### Added

* Menentukan tujuan bisnis.
* Menentukan target audience.
* Menentukan product catalog.
* Menentukan Marketplace Strategy.
* Menentukan Modular Monolith.
* Menentukan Tech Stack awal.
* Menentukan Business Modules.
* Menentukan MVP.
* Menentukan struktur dokumentasi.

### Changed

* Mengubah pendekatan dari "langsung membuat AGENTS.md" menjadi "Documentation First".

### Notes

Mulai membangun dokumentasi sebagai Single Source of Truth sebelum implementasi dimulai.
