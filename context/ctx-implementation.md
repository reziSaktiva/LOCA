# Implementation Context

Dokumen ini adalah snapshot implementasi terkini dan akan sering berubah.

## Current Phase

- Phase 0 (Planning & Documentation): **completed**
- Phase 1 (Project Foundation / Implementation Setup): **completed**
- Phase 2 (Catalog Foundation): **completed** (M4.1–M4.8 selesai)
- Phase 3 (Customer & Homepage): **completed** (M5.1–M5.3 selesai, migration `20260709130000_homepage_banner` sudah diapply ke Supabase)
- Phase 4 (Cart & Inventory): **completed** — M6.1–M6.8 selesai (backend + UI catch-up)
- Phase 5 (Checkout & Order): **completed** — Backend M7.1–M7.5 ✅ + UI M7.6–M7.7 ✅ selesai penuh
- Current implementation progress: **99%**

## Current Focus

- **Phase 5 — Checkout & Order** ✅ selesai penuh (Decision 027: M7.1–M7.7).
- Immediate next: **Phase 6 — Payment & Shipping** (Midtrans + Biteship, `docs/11-development-roadmap.md`). Backlog/milestone Phase 6 (M8.x) belum disusun — perlu Definition of Ready sebelum kickoff.
- Shipping/payment Phase 5 via **stub/port adapter**; Midtrans/Biteship di Phase 6.
- Workflow **UI paralel per phase** (Decision 022) tetap berlaku.
- Route groups aktif: `(store)`, `(auth)`, `(admin)/admin/*` — layout + shared components di `src/shared/ui/layout/`.
- Decision 025: kontrak Phase 5 (`getCartSnapshotForCheckout`, inventory reserve/commit/release) siap dipakai.
- M7.2: `createOrderFromCheckout` + reserve stock; `CheckoutOrderPort` wired.
- M7.3: customer checkout API `GET/POST /api/v1/checkout/*` hingga place-order `WAITING_PAYMENT`.
- M7.4: customer/admin order API (`/api/v1/orders`, `/api/v1/admin/orders`).
- M7.5: exit gate backend Phase 5 — smoke test `checkout/application/phase-5-backend-exit.test.ts` + `order/application/phase-5-backend-exit.test.ts` (dipecah 2 file agar patuh boundary rule), migrations checkout/order terverifikasi urut. `bun run check` hijau (286 test).
- M7.6: halaman `/checkout` aktif — alamat view-only, pilih shipping/payment via API, place order, sukses inline (Decision 028, tanpa endpoint select-address baru & tanpa redirect ke `/orders/[id]` yang belum ada). CTA "Lanjut ke Checkout" di cart diaktifkan. `bun run check` (286 test) + `bun run build` hijau.
- M7.7: halaman `/orders` (list + pagination + empty state) dan `/orders/[id]` (status timeline, item, ringkasan biaya, alamat/kirim/bayar snapshot, cancel dialog) aktif. `isOrderCancellable` menjembatani invariant domain `isCancellableStatus` ke layer route tanpa melanggar `import/no-restricted-paths`. Tidak ada endpoint baru — memakai facade M7.4. `AccountPage` mendapat tombol "Pesanan Saya". `bun run check` (288 test) + `bun run build` hijau. **Phase 5 selesai penuh.**

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

## Phase 3 (Targets)

Target Phase 3 — Customer & Homepage:

- **M5.1 — Customer Auth Foundation** ✅ **Completed**
  - Domain, application services, SupabaseAuthRepository, public facade, `requireCustomer()` guard aktif.
  - API routes: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
  - 96 test lolos. `bun run check` hijau.

- **M5.2 — Customer Profile & Address** ✅ **Completed**
  - Domain: `CustomerProfile`, `CustomerAddress` entity + repository contract. Invariant: `isValidDisplayName`, `isValidPhone`.
  - Application service: `manage-customer-profile.ts`, `manage-customer-address.ts`.
  - Prisma schema: model `CustomerProfile`, `CustomerAddress` + migration `20260709044351_customer_profile_and_address` (diapply ke Supabase).
  - Infrastructure: `PrismaCustomerRepository` (upsert, CRUD address, soft-delete, clearDefault).
  - Public facade: `customer-service.ts`.
  - API routes: `GET/PATCH /api/v1/customers/me`, `GET/POST /api/v1/customers/addresses`, `PATCH/DELETE /api/v1/customers/addresses/[id]`.
  - 118 test lolos. `bun run check` hijau.

- **M5.3 — Homepage Foundation** ✅ **Completed**
  - Domain: `HomepageBanner` entity, invariant `isValidBannerTitle`/`isValidMediaUrl`, repository contract.
  - Application service: `manage-banner.ts` (create/update/delete dengan typed errors), `get-homepage-data.ts` (composite via `HomepageCatalogPort`).
  - Prisma schema: model `HomepageBanner` + migration `20260709130000_homepage_banner` (perlu diapply ke Supabase).
  - Infrastructure: `PrismaHomepageRepository`.
  - Catalog public service diperluas: `listActiveProductsForHomepage(limit)` sebagai kontrak lintas module.
  - Public facade: `homepage-service.ts`.
  - API route publik: `GET /api/v1/homepage`.
  - Admin routes: `GET/POST /api/v1/admin/homepage/banners`, `PATCH/DELETE /api/v1/admin/homepage/banners/[id]`.
  - 133 test lolos. `bun run check` hijau.

---

## Phase 2 Completed Targets

Target setup awal (Phase 2 selesai):

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

- Status: **M5.1 Completed** — domain, application services, SupabaseAuthRepository, public facade, `requireCustomer()` guard, dan API routes auth aktif.
- 96 test lolos.

### Customer Module

- Status: **M5.2 Completed** — domain, application services, PrismaCustomerRepository, public facade, dan API routes customer aktif.
- Prisma models `CustomerProfile` + `CustomerAddress` sudah di-migrate ke Supabase.
- 118 test lolos (total seluruh suite pada M5.2).

### Homepage Module

- Status: **M5.3 Completed** — domain, application services, PrismaHomepageRepository, public facade, dan API routes homepage aktif.
- Prisma model `HomepageBanner` + migration `20260709130000_homepage_banner` sudah diapply ke Supabase.
- 133 test lolos (total seluruh suite pada M5.3). Phase 3 selesai.

### Database

- Status: Foundation plumbing completed in Phase 1 (M3.4), schema catalog selesai (M4.5), Prisma Catalog Repository aktif (M4.6)
- Scope awal: schema baseline, migration strategy, repository contract
- Current: catalog terhubung ke database sungguhan via `PrismaCatalogRepository`

## Phase 4 (Completed)

### Inventory Module

- Status: **M6.1–M6.2 Completed** — domain, application services, PrismaInventoryRepository, public facade, dan admin API aktif.
- Prisma models `InventoryItem`, `InventoryReservation`, `InventoryMovement` sudah di-migrate ke Supabase.
- M6.2: admin routes `GET /api/v1/admin/inventory`, `PATCH /api/v1/admin/inventory/[variantId]` (upsert stok), `GET /api/v1/admin/inventory/movements` (filter opsional `variantId`).
- Migration `20260709160000_inventory_foundation` diapply.
- Gap tercatat: wiring otomatis `catalog createVariant -> inventory initializeStock` belum ada; admin set stok manual via `PATCH /admin/inventory/[variantId]`.

### Cart Module

- Status: **M6.3–M6.5 Completed** — domain foundation + customer API + Phase 4 backend exit validation.
- M6.3: domain (`Cart`, `CartItem`, `CartStatus`, `CartSnapshot`), invariants, repository contract, port pattern, application services, `PrismaCartRepository`, public facade. Migration `20260710042405_cart_domain_foundation` diapply.
- M6.4: customer routes `GET/DELETE /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH/DELETE /api/v1/cart/items/[id]` (semua `requireCustomer()`). Application `get-cart-customer-view.ts` + presentation `cart-http.ts`. Facade `cartGetCustomerView`.
- M6.5: exit gate — smoke/contract test `phase-4-backend-exit.test.ts`; migrations up to date; kontrak Phase 5 terpasang (Decision 025).
- 229 test lolos pada M6.5; suite terkini 239 test (setelah M6.8).

### UI — Phase 4 (Catch-up M6.6–M6.8)

- Status: **M6.6–M6.8 Completed** (Phase 4 selesai).
- M6.6: `(store)` Navbar+Footer, `(auth)` logo-centered, `(admin)` Sidebar+`requireAdmin()`.
- M6.7: `/`, `/products`, `/products/[slug]`, `/search` — data real; Add to Cart via API; search debounce.
- M6.8: `/login`, `/register`, `/account`, `/cart` — auth forms, profil+alamat, cart ops; protected redirect ke login.
- 239 test lolos; `bun run build` hijau.
- Route strategy: `(store)`, `(auth)`, `(admin)/admin/*` — lihat `docs/04-system-architecture.md` §9
- Closed. Active work moved to Phase 5.

## Phase 5 (Completed — M7.1–M7.7)

Milestones:
1. ✅ M7.1 Checkout Domain Foundation
2. ✅ M7.2 Order Domain Foundation
3. ✅ M7.3 Checkout Customer API
4. ✅ M7.4 Order Customer + Admin API
5. ✅ M7.5 Phase 5 Backend Exit Validation
6. ✅ M7.6 UI: Checkout Flow
7. ✅ M7.7 UI: Order History + Detail

### Checkout Module

- Status: **M7.1 + M7.3 + M7.5 + M7.6 Completed** — domain/application/Prisma/facade + customer REST API + exit validation + UI checkout flow.
- Routes: `GET /api/v1/checkout`, `POST .../shipping|payment|place-order` (`requireCustomer`).
- Migration `20260722030000_checkout_domain_foundation` applied.
- `CheckoutOrderPort` wired ke `createOrderFromCheckout` (M7.2).
- Smoke test: `checkout/application/phase-5-backend-exit.test.ts`.
- UI: `/checkout` (alamat view-only, shipping/payment `RadioGroup`, ringkasan, place order, sukses inline). Presentation: `CheckoutEmptyState`, `CheckoutAddressSummary`, `CheckoutOrderSummary`, `CheckoutFlow`.
- Target phase: Phase 5 ✅ — closed.

### Order Module

- Status: **M7.2 + M7.4 + M7.5 + M7.7 Completed** — domain + customer/admin REST API + exit validation + UI order history/detail.
- Routes customer: `GET /api/v1/orders`, `GET .../[id]`, `POST .../[id]/cancel`.
- Routes admin: `GET /api/v1/admin/orders`, `GET .../[id]`, `PATCH .../[id]/status`.
- Migration `20260722040000_order_domain_foundation` applied.
- Smoke test: `order/application/phase-5-backend-exit.test.ts`.
- UI: `/orders` (list + pagination + empty state), `/orders/[id]` (status timeline, item, ringkasan biaya, alamat/kirim/bayar snapshot, cancel dialog). Presentation: `OrderStatusBadge`, `OrderEmptyState`, `OrderList`/`OrderListItem`, `OrderListPagination`, `OrderItemRow`, `OrderCostSummary`, `OrderShippingInfo`, `OrderStatusTimeline`, `OrderCancelDialog`.
- Target phase: Phase 5 ✅ — closed.
- Depends on: inventory reserve/commit/release (Decision 025), checkout snapshot input.

## Remaining Priority Flows

### Checkout & Order

- M7.1–M7.7 selesai penuh (backend + UI checkout flow + order history/detail).
- Target: Phase 5 ✅ **selesai**.

### Payment

- Belum diimplementasikan.
- Target: Phase 6. Integrasi Midtrans + webhook idempotency.

### Shipping

- Belum diimplementasikan.
- Target: Phase 6. Integrasi Biteship + tracking status synchronization.

- Open Decisions: sudah diselesaikan pada 2026-07-06 (branding, engineering policy, operations SOP). Lihat `planning/decisions.md` Decision 018-020.
- Decision 022 (2026-07-09): Workflow diubah ke UI paralel per phase. Lihat `planning/decisions.md`.

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
