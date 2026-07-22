# PROJECT STATE

> Single Source of Truth untuk status proyek saat ini.

---

# Project

Status: Phase 5 In Progress — M7.3 Checkout Customer API selesai; next M7.4

Current Version: v0.99

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
✅ Phase 2 — Catalog Foundation (Completed)
✅ Phase 3 — Customer & Homepage (Completed)
✅ Phase 4 — Cart & Inventory (Completed)
🔄 Phase 5 — Checkout & Order (In Progress — kicked off 2026-07-22)

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

Sedang dikerjakan:

`phase-5 checkout & order` — **M7.4 Order Customer + Admin API** (next)

Tujuan:

Membangun proses transaksi end-to-end dari cart hingga order `WAITING_PAYMENT` (M7.1–M7.7). Shipping/payment Phase 5 via stub/port adapter; Midtrans/Biteship di Phase 6 (Decision 027). M7.1–M7.3 selesai: domain checkout/order + customer checkout API (prepare → shipping → payment → place-order).

---

# Latest Decisions

## Business & Product

- Website berfungsi sebagai Brand Hub sekaligus Direct Sales.
- Marketplace (Shopee & TikTok Shop) tetap digunakan sebagai channel penjualan.
- Fokus utama MVP adalah membangun fondasi brand dan alur pembelian end-to-end yang stabil.
- Produk diposisikan sebagai Sports Apparel Essentials untuk target market mahasiswa dan young professionals.
- **Brand LOCA ditetapkan final**: nama brand, brand story (Lifestyle Movement), logo (Wordmark), color direction (Black + Off-White + Cobalt Blue `#1D4ED8`), typography (**Plus Jakarta Sans**), tone of voice (Confident & Minimal). Lihat `planning/decisions.md` Decision 018 + 023.
- **SOP Operasional MVP ditetapkan**: KPI harian (Total Order + Revenue + Stok Habis), SOP order handling (3-step), SLA shipping (1-2 hari kerja). Lihat `planning/decisions.md` Decision 020.

---

## Development Workflow

- **Workflow diubah ke UI paralel per phase** (Decision 022, 2026-07-09): setelah backend sebuah phase selesai, milestone UI dikerjakan dalam phase yang sama sebelum pindah ke phase berikutnya. Sebelumnya UI hanya ada di Phase 8.
- **Route group strategy ditetapkan**: `src/app/(store)/`, `(auth)/`, `(admin)/` dengan layout terpisah per audience. Lihat `docs/04-system-architecture.md` §9.
- **Phase 5 milestones M7.1–M7.7 ditetapkan** (Decision 027, 2026-07-22): backend checkout/order → exit gate → UI checkout + orders. Shipping/payment memakai stub/port adapter hingga Phase 6.

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

- Logo final (file asset) — ditetapkan saat produksi brand asset

## Phase 1 Engineering

- Branch protection policy — ✅ dikonfigurasi di GitHub repo settings (Ruleset "Protect main": Restrict deletions + Require status checks (lint/typecheck/test) + Block force pushes). Lihat Decision 024.
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
- `planning/decisions.md` memuat keputusan teknis terbaru sampai **Decision 026** (proactive-clarification skill).
- `planning/changelog.md` memuat log update terbaru tanggal **2026-07-22** (entry 6 — M7.3).

## Agent Governance

- ✅ `AGENTS.md` sudah ditingkatkan dari reminder minimal menjadi implementation guide operasional.
- ✅ Folder `agents/` sudah berisi role profiles inti (`backend`, `frontend`, `database`, `security`, `qa`, `code-review`, `product`, `solution-architect`, `ui`) untuk mendukung eksekusi Phase 1.
- ✅ Folder `.agents/skills/` berisi core skill project (`spec-driven-workflow`, `module-scaffold`, `docs-sync`, `progress-sync`, `proactive-clarification`) + skill registry (`supabase`, `supabase-postgres-best-practices`, `shadcn`). Tracking versi skill registry via `skills-lock.json`. Detail: `planning/decisions.md` Decision 012-013, 026.
- ✅ Skill `progress-sync` memaksa agent otomatis melaporkan progress task ke `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` di akhir setiap task implementasi, tanpa harus diminta user. Detail: `planning/decisions.md` Decision 013.
- ✅ Skill `proactive-clarification` mewajibkan agent mengidentifikasi fork keputusan yang belum ada di SSOT/`planning/decisions.md` sebelum eksekusi, lalu bertanya dengan opsi terkurasi (bukan berasumsi). Detail: `planning/decisions.md` Decision 026.

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
- ✅ **M4.7 — Admin Catalog API**: Admin route handlers aktif di `src/app/api/v1/admin/` (products, variants, categories). Auth guard `requireAdmin()` di `src/shared/infrastructure/auth/admin-guard.ts` memverifikasi Supabase session + `app_metadata.role === "admin"`. `CatalogRepository` diperluas dengan category CRUD. Facade `catalog-admin-service.ts` mengekspos semua operasi admin. Import boundary dipatuhi. `bun run check` hijau (78 test).
- ✅ **M4.8 — Product Media & SEO Dasar**: Enum `MediaOwnerType`/`ProductMediaType`, type `ProductMedia`/`ProductSeo` aktif di domain. Prisma model `ProductMedia` + `ProductSeo` ditambah, migration `20260707061153_catalog_media_seo` diapply ke Supabase. Application service `manage-product-media.ts` (addMedia, removeMedia, getProductSeo, upsertProductSeo). Invariant `canActivateProduct` diperluas: thumbnail wajib ada + minimal 1 variant. Admin routes: `GET/POST /api/v1/admin/products/[id]/media`, `DELETE /api/v1/admin/products/[id]/media/[mediaId]`, `GET/PUT /api/v1/admin/products/[id]/seo`. `bun run check` hijau (78 test).
- ✅ **M5.1 — Customer Auth Foundation**: Module `auth` diimplementasikan. Domain layer: `CustomerAccount`, `AuthSession`, `AuthResult`, `AuthError`, `RegisterCustomerCommand`, `LoginCommand`, invariant `isValidEmail`/`isValidPassword`. Application services: `register-customer.ts`, `login-customer.ts`, `logout-customer.ts`, `get-current-session.ts`. Infrastructure: `SupabaseAuthRepository` (wraps Supabase `signUp`, `signInWithPassword`, `signOut`, `getUser`). Public facade: `customer-auth-service.ts`. Session guard: `requireCustomer()` di `src/shared/infrastructure/auth/customer-guard.ts`. Shared helper: `src/shared/kernel/api-response.ts`. API routes aktif: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`. `bun run check` hijau (96 test).
- ✅ **M5.2 — Customer Profile & Address**: Module `customer` diimplementasikan. Domain layer: `CustomerProfile`, `CustomerAddress`, `UpsertCustomerProfileCommand`, `CreateAddressCommand`, `UpdateAddressCommand`, `CustomerError`, `CustomerResult`. Invariant: `isValidDisplayName`, `isValidPhone`. Application services: `manage-customer-profile.ts` (getProfile, upsertProfile), `manage-customer-address.ts` (list, create, update, delete). Infrastructure: `PrismaCustomerRepository` (upsert profile, CRUD address, clearDefault, softDelete). Public facade: `customer-service.ts`. Prisma models `CustomerProfile` + `CustomerAddress`, migration `20260709044351_customer_profile_and_address` sudah diapply ke Supabase. API routes: `GET/PATCH /api/v1/customers/me`, `GET/POST /api/v1/customers/addresses`, `PATCH/DELETE /api/v1/customers/addresses/[id]`. `bun run check` hijau (118 test).
- ✅ **M5.3 — Homepage Foundation**: Module `homepage` diimplementasikan. Domain layer: `HomepageBanner`, `CreateBannerCommand`, `UpdateBannerCommand`, `HomepageError`, `HomepageResult`. Invariant: `isValidBannerTitle` (2–200 char), `isValidMediaUrl` (http/https valid). Application services: `manage-banner.ts` (create, update, delete dengan typed errors), `get-homepage-data.ts` (composite via `HomepageCatalogPort` — featured, new arrival, best seller). Infrastructure: `PrismaHomepageRepository`. Public facade: `homepage-service.ts` (menggunakan `listActiveProductsForHomepage` dari catalog public service — boundary patuh). Catalog diperluas: `listActiveProductsForHomepage(limit)` di `catalog-public-service.ts`. Prisma model `HomepageBanner`, migration `20260709130000_homepage_banner` sudah diapply ke Supabase. API route: `GET /api/v1/homepage`. Admin routes: `GET/POST /api/v1/admin/homepage/banners`, `PATCH/DELETE /api/v1/admin/homepage/banners/[id]`. `bun run check` hijau (133 test).
- ✅ **M6.1 — Inventory Domain Foundation**: Module `inventory` diimplementasikan. Domain layer: `InventoryItem`, `InventoryReservation`, `InventoryMovement` entity + enum `InventoryMovementType`/`ReservationStatus` + typed `InventoryResult<T>`. Invariants: `isValidStockQty`, `isInventoryItemConsistent`, `isStockSufficient`, `canCommitReservation`, `canReleaseReservation`, `isValidAdjustmentReason`. Repository contract: `InventoryRepository` (10 method). Application services: `manage-stock.ts` (initializeStock/increaseStock/adjustStock), `check-stock.ts` (getStockByVariantId/assertStockAvailable/listStockMovements), `reserve-stock.ts` (reserveStock/commitStock/releaseReservedStock). Infrastructure: `PrismaInventoryRepository` (semua write menggunakan `prisma.$transaction`). Public facade: `inventory-service.ts` (9 fungsi publik). Prisma schema diperluas + migration `20260709160000_inventory_foundation` sudah diapply ke Supabase. `bun run check` hijau (180 test).
- ✅ **M6.2 — Admin Inventory API**: Endpoint admin inventory aktif sesuai `docs/07-api-specification.md` §Admin/Inventory. Domain diperluas: `UpsertStockCommand`, `ListInventoryQuery`, `ListMovementsQuery.variantId` kini opsional (mendukung list movement lintas varian). Repository contract `InventoryRepository` diperluas: `listInventoryItems`. Application service baru: `upsertStock` di `manage-stock.ts` (initialize jika `InventoryItem` belum ada, adjust jika sudah ada — dipakai admin agar satu endpoint PATCH menangani kedua kasus), `listInventoryItems` di `check-stock.ts`. `PrismaInventoryRepository.listMovements` diperbarui untuk filter opsional per varian. Public facade diperluas: `inventoryListItems`, `inventoryUpsertStock`. Admin routes: `GET /api/v1/admin/inventory` (list stok, pagination), `PATCH /api/v1/admin/inventory/[variantId]` (upsert/adjust stok), `GET /api/v1/admin/inventory/movements` (riwayat movement, filter opsional `variantId`). `bun run check` hijau (187 test).
- ✅ **M6.3 — Cart Domain Foundation**: Module `cart` diimplementasikan. Domain layer: `Cart`, `CartItem` entity + enum `CartStatus` (`ACTIVE`/`CHECKED_OUT`/`ABANDONED`) + `CartSnapshot` (cart + items + subtotal + total, kontrak lintas module untuk `checkout`) + typed `CartResult<T>`. Invariants: `isValidQuantity`, `calculateLineSubtotal`, `calculateCartTotal`, `hasDuplicateVariant`, `isValidCartAmount`, `isCartEditable`. Repository contract: `CartRepository` (11 method: findCartById, findActiveCartByCustomerId, createCart, findCartItems, findCartItemById, findCartItemByVariantId, addItem, updateItemQuantity, updateItemVariant, removeItem, clearItems). Port pattern (sesuai `docs/05-domain-modules.md` dependency Cart → Catalog + Inventory): `CartCatalogPort` (getVariantSnapshot) dan `CartInventoryPort` (assertStockAvailable), didefinisikan di `application/cart-ports.ts`. Application services: `get-cart.ts` (getOrCreateActiveCart, getCartSnapshot), `manage-cart-item.ts` (addItemToCart — merge quantity jika variant sudah ada, updateCartItemQuantity, changeCartItemVariant, removeCartItem, clearCart — semua dengan ownership check via cart.customerId). Infrastructure: `PrismaCartRepository`. Public facade: `cart-service.ts` (6 fungsi publik + `getCartSnapshotForCheckout` untuk consumer `checkout`). Catalog diperluas: `VariantSnapshot` kini menyertakan field `status` (dibutuhkan invariant "variant aktif" di cart) dan di-re-export dari `catalog-public-service.ts`. Prisma schema: model `Cart`, `CartItem` + enum `CartStatus`, migration `20260710042405_cart_domain_foundation` **sudah diapply ke Supabase**. `bun run check` hijau (221 test).
- ✅ **M6.4 — Cart Customer API**: Endpoint customer cart aktif sesuai `docs/07-api-specification.md` §Cart. Application: `get-cart-customer-view.ts` (DTO customer-facing + enrich display fields via `CartCatalogPort`). Presentation: `cart-http.ts` (`cartErrorStatus` mapping). Public facade diperluas: `cartGetCustomerView`. `CartVariant` port diperluas dengan `productName`/`variantLabel`/`thumbnailUrl`. Routes: `GET/DELETE /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH/DELETE /api/v1/cart/items/[id]` — semua dilindungi `requireCustomer()`. POST/PATCH return cart terbaru; DELETE return 204; INSUFFICIENT_STOCK → 400. `bun run check` hijau (226 test).
- ✅ **M6.5 — Phase 4 Backend Exit Validation**: Exit gate backend Phase 4 lolos. Cross-module: cart hanya mengakses catalog/inventory via public facade + ports. Kontrak Phase 5: `getCartSnapshotForCheckout`, `inventoryReserveStock` / `inventoryCommitStock` / `inventoryReleaseReservedStock`. Smoke test flow add→stock→total→remove→empty. Migrations inventory+cart applied (`prisma migrate status` up to date). Docs Public Services dipetakan ke facade names. Decision 025. `bun run check` hijau (229 test).
- ✅ **M6.6 — UI Route Groups + Shared Layout**: Route groups `(store)`, `(auth)`, `(admin)` aktif. Shared layout di `src/shared/ui/layout/` (`Navbar`, `Footer`, `AdminSidebar`, `Container` re-export). Store layout fetch kategori + cart count lalu inject ke Navbar (boundary shared↛modules dipatuhi). Auth layout minimalist + redirect jika sudah login. Admin layout + topbar + `requireAdmin()` (401→`/login`, 403→`/`). Placeholder pages: `/`, `/login`, `/register`, `/admin/*`. shadcn `sheet`/`skeleton`/`separator`. `bun run check` + `bun run build` hijau.
- ✅ **M6.7 — UI Homepage + Catalog + Product Detail**: Slice 1+2 selesai. Homepage + `/products` + `/products/[slug]` + `/search`. `getPublicProductBySlug` diperkaya (variants ACTIVE + media + stok via Inventory port). Presentation: `ProductGallery`, `VariantSelector`, `ProductDetailPanel`, `AddToCartButton`, `SearchForm`. Docs `07` diperbarui untuk shape detail. `bun run check` hijau (236 test) + `bun run build` hijau.
- ✅ **M6.8 — UI Auth + Account + Cart**: `/login`, `/register`, `/account`, `/cart` berfungsi penuh. Auth presentation: `LoginForm`, `RegisterForm`, `LogoutButton`, `safeRedirectPath`. Customer presentation: `ProfileForm`, `AddressCard`, `AddressForm`, `AddressSection`. Cart presentation: `CartPanel`, `CartItemRow`, `CartSummary`, `QuantityStepper`. Protected pages redirect ke `/login?next=…`. Checkout CTA disabled (aktif di Phase 5). `formatIdr` dipindah ke `src/shared/kernel/`. `bun run check` hijau (239 test) + `bun run build` hijau. **Phase 4 selesai.**
- ✅ **M7.1 — Checkout Domain Foundation**: Module `checkout` aktif. Domain: `CheckoutSession`, `CheckoutSnapshot`, status lifecycle, typed `CheckoutResult`/`CheckoutError`, invariants (`isCartNonEmpty`, `isReadyToPlaceOrder`, …). Ports: cart/customer/shipping/payment/order. Application: `prepareCheckout`, `selectCheckoutAddress`, `selectCheckoutShippingOption`, `selectCheckoutPaymentMethod`, `placeOrder`. Stub shipping/payment (Decision 027). Infrastructure: `PrismaCheckoutRepository`. Public facade: `checkout-service.ts`. Migration `20260722030000_checkout_domain_foundation` diapply ke Supabase.
- ✅ **M7.2 — Order Domain Foundation**: Module `order` aktif. Domain: `Order`, `OrderItem`, `OrderStatusHistory`, state machine `ORDER_STATUS_TRANSITIONS`, typed `OrderResult`/`OrderError`, invariants (item/total/currency/transition/cancel policy). Application: `createOrderFromCheckout` (reserve stock dulu → persist `WAITING_PAYMENT`; gagal stok → order tidak terbentuk), `transitionOrderStatus`, `cancelOrder` (release stock), `getOrderDetail`. Ports: catalog + inventory. Infrastructure: `PrismaOrderRepository`. Public facade: `order-service.ts`. `CheckoutOrderPort` di-wire ke order facade. `VariantSnapshot` catalog diperkaya `brand` + `categoryName`. Migration `20260722040000_order_domain_foundation` diapply ke Supabase. `bun run check` hijau (268 test).
- ✅ **M7.3 — Checkout Customer API**: Endpoint customer checkout aktif di `src/app/api/v1/checkout/`. `GET /api/v1/checkout` (prepare), `POST /api/v1/checkout/shipping` (`optionId`), `POST /api/v1/checkout/payment` (`method`), `POST /api/v1/checkout/place-order` → `orderId` + status `WAITING_PAYMENT` (201). Dilindungi `requireCustomer()`. Presentation: `checkoutErrorStatus` di `src/modules/checkout/presentation/checkout-http.ts`. Facade existing (`checkoutPrepare` / select / place). Alamat default di-auto-confirm saat prepare. `bun run check` hijau (271 test).

---

# Next Action

**Phase 5 — Checkout & Order** in progress (Decision 027).

Immediate next: **M7.4 — Order Customer + Admin API**.

Workflow (Decision 022): **Backend selesai → UI dikerjakan dalam phase yang sama, sebelum pindah ke phase berikutnya.**

Prasyarat Phase 5 (sudah siap):
- ✅ `getCartSnapshotForCheckout` (cart public facade)
- ✅ `inventoryReserveStock` / `inventoryCommitStock` / `inventoryReleaseReservedStock`
- ✅ Customer profile + address API/UI
- ✅ Cart customer API/UI
- ✅ Checkout domain + stub shipping/payment ports (M7.1)
- ✅ Order domain + `createOrderFromCheckout` + reserve stock (M7.2)
- ✅ Checkout Customer API (M7.3)

Urutan milestone Phase 5:

Backend:
1. ✅ **M7.1 — Checkout Domain Foundation**
2. ✅ **M7.2 — Order Domain Foundation**
3. ✅ **M7.3 — Checkout Customer API**
4. ⏳ **M7.4 — Order Customer + Admin API** ← next
5. ⏳ **M7.5 — Phase 5 Backend Exit Validation**

UI:
6. ⏳ **M7.6 — UI: Checkout Flow**
7. ⏳ **M7.7 — UI: Order History + Detail**

Urutan milestone Phase 4 (semua ✅ — closed):

Backend:
1. ✅ **M6.1 — Inventory Domain Foundation**
2. ✅ **M6.2 — Admin Inventory API**
3. ✅ **M6.3 — Cart Domain Foundation**
4. ✅ **M6.4 — Cart Customer API**
5. ✅ **M6.5 — Phase 4 Backend Exit Validation**

UI Catch-up (Phase 2–4):
6. ✅ **M6.6 — UI Route Groups + Shared Layout**
7. ✅ **M6.7 — UI: Homepage + Catalog + Product Detail**
8. ✅ **M6.8 — UI: Auth + Account + Cart**

---

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

14. ✅ **M4.7 — Admin Catalog API**

- ✅ Auth guard `requireAdmin()` aktif di `src/shared/infrastructure/auth/admin-guard.ts`.
- ✅ `CatalogRepository` diperluas: `findCategoryById`, `existsCategoryWithSlug`, `createCategory`, `updateCategory`.
- ✅ Application service `manage-category.ts` (create/update dengan typed error).
- ✅ Facade `catalog-admin-service.ts` dengan re-export types; semua admin operasi tersedia.
- ✅ Admin routes aktif:
  - `GET/POST /api/v1/admin/products`
  - `GET/PATCH/DELETE /api/v1/admin/products/[id]`
  - `PATCH /api/v1/admin/products/[id]/status`
  - `GET/POST /api/v1/admin/products/[id]/variants`
  - `PATCH /api/v1/admin/products/[id]/variants/[variantId]`
  - `GET/POST /api/v1/admin/categories`
  - `GET/PATCH /api/v1/admin/categories/[id]`
- ✅ Exit criteria: admin dapat mengelola katalog via API; quality gate lolos (78 test).

15. ✅ **M4.8 — Product Media & SEO Dasar**

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
███████████████████░  98%
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

## ✅ Milestone 4 — Catalog Foundation (Completed)

Breakdown:

- [x] M4.1 Catalog Vertical Slice 01 (Category + Product Listing Public)
- [x] M4.2 Catalog Product Lifecycle Dasar
- [x] M4.3 Catalog Variant Pricing & Attributes Dasar
- [x] M4.4 Catalog Public Search Endpoint
- [x] M4.5 Prisma Schema Catalog
- [x] M4.6 Prisma Catalog Repository
- [x] M4.7 Admin Catalog API
- [x] M4.8 Product Media & SEO Dasar

Target Outcome:

- API katalog publik dasar siap dipakai consumer awal.
- Invariant domain katalog utama tervalidasi oleh test.
- Catalog terhubung ke database sungguhan (bukan in-memory).
- Admin dapat mengelola produk, varian, dan kategori via API.
- Phase 2 exit criteria terpenuhi sepenuhnya.

---

## 🔄 Milestone 7 — Checkout & Order (In Progress)

Breakdown — Backend:

- [x] M7.1 Checkout Domain Foundation
- [x] M7.2 Order Domain Foundation
- [ ] M7.3 Checkout Customer API ← next
- [ ] M7.4 Order Customer + Admin API
- [ ] M7.5 Phase 5 Backend Exit Validation

Breakdown — UI:

- [ ] M7.6 UI: Checkout Flow
- [ ] M7.7 UI: Order History + Detail

Target Outcome:

Backend:
- Customer dapat place-order hingga `WAITING_PAYMENT` via API.
- Stok di-reserve saat place order; admin dapat kelola status order.
- Shipping/payment options via stub ports (Decision 027); provider real di Phase 6.

UI:
- `/checkout`, `/orders`, `/orders/[id]` berfungsi di browser.
- Responsive + accessible (WCAG AA minimum).

---

## ✅ Milestone 6 — Cart, Inventory & UI Catch-up (Completed)

Breakdown — Backend:

- [x] M6.1 Inventory Domain Foundation
- [x] M6.2 Admin Inventory API
- [x] M6.3 Cart Domain Foundation
- [x] M6.4 Cart Customer API
- [x] M6.5 Phase 4 Backend Exit Validation

Breakdown — UI Catch-up Phase 2–4:

- [x] M6.6 UI: Route Groups + Shared Layout
- [x] M6.7 UI: Homepage + Catalog + Product Detail
- [x] M6.8 UI: Auth + Account + Cart

Target Outcome:

Backend:
- ✅ Customer dapat menambahkan produk ke cart via API.
- ✅ Stok divalidasi real-time saat operasi cart.
- ✅ Admin dapat mengelola stok via API.
- ✅ Kontrak `getCartSnapshot` dan `reserveStock/commitStock/releaseStock` siap untuk Phase 5.

UI:
- ✅ Customer dapat browse, login, dan melihat cart di browser.
- ✅ Halaman responsive (mobile-first), accessible, tidak ada halaman kosong.
- ✅ Route groups aktif dengan layout terpisah per audience (Decision 022).

---

## ✅ Milestone 5 — Customer & Homepage (Completed)

Breakdown:

- [x] M5.1 Customer Auth Foundation
- [x] M5.2 Customer Profile & Address
- [x] M5.3 Homepage Foundation

Target Outcome:

- Customer dapat register, login, dan logout via Supabase Auth.
- Customer dapat mengelola profil dan alamat pengiriman.
- Homepage menampilkan data dinamis dari catalog (featured, new arrival, best seller).
- Phase 3 exit criteria terpenuhi.

### ✅ M5.1 — Customer Auth Foundation (Completed)

- Domain layer, application services, infrastructure, public facade, guard, API routes aktif.
- 96 test lolos. `bun run check` hijau.

### ✅ M5.2 — Customer Profile & Address (Completed)

Scope (selesai):

- Domain: `CustomerProfile`, `CustomerAddress` entity + repository contract.
- Application service: `manage-customer-profile.ts`, `manage-customer-address.ts`.
- Prisma schema: model `CustomerProfile`, `CustomerAddress` + migration `20260709044351_customer_profile_and_address`.
- Infrastructure: `PrismaCustomerRepository`.
- Public facade: `customer-service.ts`.
- API routes: `GET/PATCH /api/v1/customers/me`, `GET/POST /api/v1/customers/addresses`, `PATCH/DELETE /api/v1/customers/addresses/[id]`.

Exit criteria:

- ✅ Customer dapat melihat dan mengubah profil.
- ✅ Customer dapat menambah, mengubah, dan menghapus alamat.
- ✅ Satu alamat dapat ditandai sebagai default.
- ✅ Quality gate lolos (118 test).

### ✅ M5.3 — Homepage Foundation (Completed)

Scope (selesai):

- Domain: `HomepageBanner` entity, invariant `isValidBannerTitle`/`isValidMediaUrl`, `HomepageRepository` contract.
- Application service: `manage-banner.ts` (create/update/delete), `get-homepage-data.ts` (composite via `HomepageCatalogPort`).
- Catalog diperluas: `listActiveProductsForHomepage(limit)` di `catalog-public-service.ts` sebagai cross-module contract.
- Prisma schema: model `HomepageBanner` + migration `20260709130000_homepage_banner`.
- Infrastructure: `PrismaHomepageRepository`.
- Public facade: `homepage-service.ts`.
- API route: `GET /api/v1/homepage`.
- Admin routes: `GET/POST /api/v1/admin/homepage/banners`, `PATCH/DELETE /api/v1/admin/homepage/banners/[id]`.

Exit criteria:

- ✅ Endpoint homepage mengembalikan banner aktif + produk featured/new arrival/best seller.
- ✅ Admin dapat mengelola banner via API.
- ✅ Quality gate lolos (133 test).
