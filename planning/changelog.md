# Changelog

Catatan perubahan besar selama proses pengembangan.

Mengikuti prinsip:

* Tambahkan entri baru di bagian atas.
* Jangan menghapus riwayat perubahan.

---

## 2026-07-21 (3)

### Added

- **M6.6 — UI Route Groups + Shared Layout**: fondasi UI route groups sesuai Decision 022 + `docs/04-system-architecture.md` §9.
  - Route groups: `src/app/(store)/`, `(auth)/`, `(admin)/admin/`.
  - Shared layout: `src/shared/ui/layout/` — `Navbar`, `NavbarMobileMenu` (Sheet), `Footer`, `AdminSidebar`.
  - Placeholder pages: `/` (skeleton homepage), `/login`, `/register`, `/admin/dashboard|products|orders|inventory|homepage`.
  - shadcn: `sheet`, `skeleton`, `separator`.

### Changed

- `docs/04-system-architecture.md` — struktur `(admin)/admin/` diklarasikan agar URL `/admin/*` eksplisit.
- Fetch kategori + cart count dilakukan di `(store)/layout.tsx` (bukan di `shared/ui`) agar boundary `shared ↛ modules` tetap valid.

### Verified

- `bun run check` hijau (229 test).
- `bun run build` hijau — routes `/`, `/login`, `/register`, `/admin/*` terdaftar.

### Notes

- Next: **M6.7 — UI Homepage + Catalog + Product Detail**.

---

## 2026-07-21 (2)

### Added

- **M6.5 — Phase 4 Backend Exit Validation**: exit gate backend Phase 4 selesai.
  - Smoke + contract test: `src/modules/cart/application/phase-4-backend-exit.test.ts`
    - Flow: addItem → stock validated → cart total → remove → empty.
    - Surface check: `getCartSnapshotForCheckout`, `inventoryReserveStock` / `inventoryCommitStock` / `inventoryReleaseReservedStock`.
  - Decision 025: kontrak lintas module Phase 5 + mapping nama facade.

### Changed

- `docs/05-domain-modules.md` §Inventory & §Cart — Public Services dipetakan ke nama facade implementasi (siap dikonsumsi checkout/order).
- Folder migrasi kosong lokal `20260710065425_add_cart_item_quantity_check_and_unique_active_cart` dihapus (memblokir `prisma migrate status`; tidak ada `migration.sql`).

### Verified

- Cross-module: `cart` hanya import `catalog`/`inventory` dari `public/` (port wiring di `cart-service.ts`).
- Migrations: `bunx prisma migrate status` → **Database schema is up to date** (6 migrations, termasuk inventory + cart).
- `bun run check` hijau (lint + typecheck + test): **229 test lolos** (+3 dari exit smoke/contract).

### Notes

- Backend Phase 4 exit criteria terpenuhi. Next: **M6.6 — UI Route Groups + Shared Layout** (UI catch-up Decision 022).
- Gap tetap tercatat: wiring otomatis `catalog createVariant → inventory initializeStock` belum ada (admin set stok manual).

---

## 2026-07-21 (1)

### Added

- **M6.4 — Cart Customer API**: endpoint customer untuk mengelola cart sesuai `docs/07-api-specification.md` §Cart dan acceptance criteria `planning/backlog.md` M6.4.
  - Application: `get-cart-customer-view.ts` — membangun `CartCustomerView` (cartId, items dengan display fields, subtotal, itemCount) dari snapshot + `CartCatalogPort`.
  - Presentation: `cart-http.ts` — `cartErrorStatus` (ITEM/VARIANT_NOT_FOUND → 404; stock/validation errors → 400).
  - Public facade: `cartGetCustomerView` di `cart-service.ts`.
  - Routes (semua dilindungi `requireCustomer()`):
    - `GET /api/v1/cart` — cart aktif (auto-create jika belum ada).
    - `POST /api/v1/cart/items` — tambah item; 201 + cart terbaru; 400 jika stok tidak cukup.
    - `PATCH /api/v1/cart/items/[id]` — update `quantity` dan/atau `variantId`; 200 + cart terbaru.
    - `DELETE /api/v1/cart/items/[id]` — hapus item; 204.
    - `DELETE /api/v1/cart` — clear cart; 204.

### Changed

- `CartVariant` di `cart-ports.ts` diperluas dengan `productName`, `variantLabel`, `thumbnailUrl` agar customer view bisa di-enrich tanpa akses domain catalog langsung.
- Mapping catalog port di `cart-service.ts` meneruskan field display dari `VariantSnapshot`.

### Verified

- `bun run check` hijau (lint + typecheck + test): **226 test lolos** (+5: `getCartCustomerView` + `cartErrorStatus`).

### Notes

- Next: **M6.5 — Phase 4 Backend Exit Validation** sebelum UI catch-up M6.6–M6.8.

---

## 2026-07-10 (2)

### Added

- **M6.3 — Cart Domain Foundation**: module `cart` diimplementasikan penuh sesuai `docs/05-domain-modules.md` §9 dan `docs/06-data-model.md` §6.5.
  - Domain: `Cart`, `CartItem` entity + enum `CartStatus` (`ACTIVE`/`CHECKED_OUT`/`ABANDONED`) + `CartSnapshot` (kontrak lintas module untuk `checkout`) + commands + typed `CartResult<T>`.
  - Invariants (`cart-invariants.ts`): `isValidQuantity`, `calculateLineSubtotal`, `calculateCartTotal`, `hasDuplicateVariant`, `isValidCartAmount`, `isCartEditable`.
  - Repository contract: `CartRepository` (11 method, termasuk `findCartItemByVariantId` untuk mencegah duplikasi variant per cart).
  - Port pattern (`application/cart-ports.ts`): `CartCatalogPort` (getVariantSnapshot) dan `CartInventoryPort` (assertStockAvailable) — sesuai dependency matrix Cart → Catalog + Inventory.
  - Application services: `get-cart.ts` (getOrCreateActiveCart, getCartSnapshot), `manage-cart-item.ts` (addItemToCart, updateCartItemQuantity, changeCartItemVariant, removeCartItem, clearCart). `addItemToCart` menggabungkan quantity ke item yang sudah ada jika variant sama sudah di cart (menjaga invariant no-duplicate-variant). Semua operasi item memverifikasi ownership via `cart.customerId`.
  - Infrastructure: `PrismaCartRepository` (unique constraint `[cartId, variantId]` di level DB sebagai pengaman tambahan invariant no-duplicate-variant).
  - Public facade: `cart-service.ts` — `cartGetSnapshot`, `cartAddItem`, `cartUpdateItemQuantity`, `cartChangeItemVariant`, `cartRemoveItem`, `cartClear`, plus `getCartSnapshotForCheckout` untuk consumer `checkout`.
  - Prisma schema: model `Cart`, `CartItem` + enum `CartStatus`. Migration `20260710042405_cart_domain_foundation` **sudah diapply ke Supabase**.

### Changed

- Catalog: `VariantSnapshot` (`domain/catalog-entities.ts`) diperluas dengan field `status: CatalogVariantStatus` — dibutuhkan cart untuk memvalidasi invariant "variant aktif" sebelum ditambahkan ke keranjang. Kedua implementasi (`PrismaCatalogRepository`, `InMemoryCatalogRepository`) diperbarui. Tipe `VariantSnapshot` kini di-re-export dari `catalog-public-service.ts` agar consumer lintas module mengaksesnya lewat public facade, bukan domain langsung.

### Verified

- `bun run check` hijau (lint + typecheck + test): **221 test lolos** (34 test baru dari cart: invariants + `get-cart` + `manage-cart-item`).
- Migration `20260710042405_cart_domain_foundation` berhasil diapply ke Supabase (`prisma migrate dev`), `prisma generate` lolos.

### Notes

- M6.3 murni domain/application foundation — belum ada API route customer (menyusul di M6.4 sesuai `docs/07-api-specification.md` §Cart: `GET/DELETE /cart`, `POST/PATCH/DELETE /cart/items/{id}`).
- MVP hanya mendukung actor Customer (auth wajib) untuk cart, selaras dengan seluruh endpoint Cart di API spec yang berstatus Customer-only. Guest/visitor cart merge dicatat sebagai Future Scope di `docs/05-domain-modules.md`, belum diimplementasikan.
- Subtotal cart == total cart untuk MVP (belum ada fee/discount di level cart); shipping/tax/diskon akan dihitung di module `checkout`.

---

## 2026-07-10 (1)

### Added

- **M6.2 — Admin Inventory API**: endpoint admin untuk mengelola stok sesuai `docs/07-api-specification.md` §Admin/Inventory.
  - Domain: `UpsertStockCommand`, `ListInventoryQuery` baru; `ListMovementsQuery.variantId` diubah menjadi opsional agar movement bisa dilihat lintas varian.
  - Repository contract `InventoryRepository` diperluas: `listInventoryItems(query)`.
  - Application service baru: `upsertStock` di `manage-stock.ts` (initialize stok jika `InventoryItem` belum ada, adjust jika sudah ada — satu endpoint PATCH menangani kedua kasus), `listInventoryItems` di `check-stock.ts`.
  - Infrastructure: `PrismaInventoryRepository.listInventoryItems` (pagination) dan `listMovements` diperbarui untuk filter `variantId` opsional.
  - Public facade `inventory-service.ts` diperluas: `inventoryListItems`, `inventoryUpsertStock`.
  - Admin routes baru:
    - `GET /api/v1/admin/inventory` — daftar stok semua varian (pagination).
    - `PATCH /api/v1/admin/inventory/[variantId]` — upsert/adjust stok (body: `newQty`, `reason`).
    - `GET /api/v1/admin/inventory/movements` — riwayat movement stok (filter opsional `variantId`, pagination).

### Verified

- `bun run check` hijau (lint + typecheck + test): **187 test lolos** (7 test baru untuk `upsertStock`, `listInventoryItems`, dan movement lintas varian).

### Notes

- `PATCH /admin/inventory/{variantId}` didesain sebagai upsert (bukan hanya adjust murni) supaya admin bisa menetapkan stok pertama kali untuk varian baru tanpa endpoint tambahan di luar kontrak `docs/07-api-specification.md`.
- Wiring otomatis "catalog create variant -> inventory initializeStock" belum ada; admin masih perlu set stok manual via endpoint ini setelah membuat varian baru. Dicatat sebagai gap yang bisa diselesaikan di milestone berikutnya jika diperlukan.

---

## 2026-07-09 (7)

### Added

- **M6.1 — Inventory Domain Foundation**: module `inventory` diimplementasikan penuh.
  - Domain: `InventoryItem`, `InventoryReservation`, `InventoryMovement` entity + enum `InventoryMovementType` / `ReservationStatus` + commands + typed `InventoryResult<T>`.
  - Invariants: `isValidStockQty`, `isInventoryItemConsistent`, `isStockSufficient`, `canCommitReservation`, `canReleaseReservation`, `isValidAdjustmentReason`.
  - Repository contract: `InventoryRepository` (8 method: findByVariantId, existsByVariantId, createInventoryItem, increaseStock, adjustStock, createReservation, findActiveReservationsByOrderId, commitReservation, releaseReservation, listMovements).
  - Application services: `manage-stock.ts` (initializeStock/increaseStock/adjustStock), `check-stock.ts` (getStockByVariantId/assertStockAvailable/listStockMovements), `reserve-stock.ts` (reserveStock/commitStock/releaseReservedStock).
  - Infrastructure: `PrismaInventoryRepository` (semua operasi menggunakan `prisma.$transaction` untuk konsistensi stock + movement).
  - Public facade: `inventory-service.ts` (9 fungsi publik siap dipakai Cart, Checkout, Order, Admin).
  - Prisma schema: model `InventoryItem`, `InventoryReservation`, `InventoryMovement` + enum `InventoryMovementType` + `ReservationStatus`.
  - Migration `20260709160000_inventory_foundation` **sudah diapply ke Supabase**.

### Verified

- `bun run check` hijau (lint + typecheck + test): **180 test lolos** (47 test baru dari inventory).

---

## 2026-07-09 (6)

### Added

- **Typography final ditetapkan: Plus Jakarta Sans** (Decision 023). `src/app/layout.tsx` diperbarui: Geist Sans/Mono diganti dengan `Plus_Jakarta_Sans` dari `next/font/google` (weight 200–800, display swap). CSS variable `--font-plus-jakarta-sans` aktif.
- **Accent color final ditetapkan: Cobalt Blue `#1D4ED8`** (Decision 023). Token baru `--brand-accent` (`oklch(0.47 0.23 265)` light, `oklch(0.81 0.13 260)` dark) dan `--brand-accent-foreground` ditambahkan ke `src/app/globals.css`. Tailwind utility `bg-brand-accent`, `text-brand-accent`, `border-brand-accent` tersedia.
- Decision 023 dicatat di `planning/decisions.md`.
- Decision 024 dicatat di `planning/decisions.md` (Branch Protection policy konfirmasi + command konfigurasi).

### Changed

- `src/app/globals.css` — `--font-sans` dan `--font-heading` diperbarui ke `var(--font-plus-jakarta-sans)`, `--font-mono` dihapus (tidak digunakan). Brand accent token ditambahkan di `:root` dan `.dark`.
- `docs/09-design-system.md` — §3 Color System: palette difinalisasi dengan nilai konkret (`#1D4ED8` Cobalt Blue, oklch token, dark mode variant, WCAG note). §4 Typography: Plus Jakarta Sans ditetapkan final, Outfit tidak dipilih, rationale dicatat.
- `docs/01-business.md` — §4 Brand Identity: typography dan color diperbarui ke nilai final.
- `PROJECT_STATE.md` — "Warna accent brand final" dan "Typography final" dihapus dari Open Decisions. "Branch protection policy" ditutup. Latest Decisions (Business & Product) diperbarui dengan nilai branding final.

### Verified

- `bun run check` (lint + typecheck + test) — **133 test passed**, hijau setelah perubahan font dan token warna.

### Notes

- Branch protection belum dikonfigurasi di GitHub Settings — memerlukan `gh auth login` terlebih dahulu. Lihat Decision 024 untuk command lengkap atau instruksi GitHub UI.
- Cobalt Blue dark mode menggunakan blue-300 equivalent (`oklch(0.81 0.13 260)`) agar tetap kontras pada background gelap. Foreground berubah ke dark (`oklch(0.145 0 0)`) untuk aksesibilitas.

---

## 2026-07-09 (5)

### Changed

- **Workflow diubah ke UI paralel per phase** (Decision 022). Sebelumnya UI hanya ada di Phase 8; sekarang setiap phase punya milestone UI setelah backend selesai.
- `docs/04-system-architecture.md` §9 — route group strategy ditambahkan: `(store)`, `(auth)`, `(admin)` dengan aturan layout dan komponen per audience.
- `docs/11-development-roadmap.md` — Phase 4, 5, 6 diperluas dengan UI deliverables dan exit criteria UI.
- `planning/backlog.md` — M6.6 (Route Groups + Layout), M6.7 (Homepage + Catalog + Product Detail), M6.8 (Auth + Account + Cart) ditambahkan sebagai milestone resmi Phase 4.
- `planning/decisions.md` — Decision 022 dicatat.
- `context/ctx-implementation.md` — disinkronkan ke status terkini (Phase 3 complete, migration applied, Phase 4 planning done, workflow baru).
- `PROJECT_STATE.md` — Milestone 6 diperluas dengan UI milestones; workflow decision dicatat di Latest Decisions.

---

## 2026-07-09 (4)

### Planning

- **Phase 4 — Cart & Inventory planning selesai.** Dokumentasi milestone M6.1–M6.5 dibuat di `planning/backlog.md` mencakup: Inventory Domain Foundation, Admin Inventory API, Cart Domain Foundation, Cart Customer API, dan Phase 4 Exit Validation. Roadmap `docs/11-development-roadmap.md` diperbarui: Phase 3 ditandai Completed, Phase 4 diperlengkap dengan deliverables dan exit criteria. `PROJECT_STATE.md` diperluas dengan urutan milestone dan Milestone Checkpoint M6.

---

## 2026-07-09 (3)

### Milestone

- **Phase 3 — Customer & Homepage selesai penuh.** Migration `20260709130000_homepage_banner` sudah diapply ke Supabase (`bunx prisma migrate deploy`). Database production tersinkron. Siap lanjut ke Phase 4 (Cart & Checkout Foundation).

---

## 2026-07-09 (2)

### Added

- `src/modules/homepage/domain/homepage-entities.ts` — type `HomepageBanner`, `CreateBannerCommand`, `UpdateBannerCommand`, `HomepageError`, `HomepageResult<T>`.
- `src/modules/homepage/domain/homepage-invariants.ts` — `isValidBannerTitle` (2–200 karakter), `isValidMediaUrl` (valid http/https URL).
- `src/modules/homepage/domain/homepage-repository.ts` — interface `HomepageRepository` (listActiveBanners, listAllBanners, findBannerById, createBanner, updateBanner, softDeleteBanner).
- `src/modules/homepage/application/manage-banner.ts` — `listAllBanners`, `createBanner`, `updateBanner`, `deleteBanner` dengan typed error result.
- `src/modules/homepage/application/get-homepage-data.ts` — `getHomepageData` (composite dari `HomepageCatalogPort`: featured, new arrival, best seller). Port pattern memungkinkan dependency catalog diinjeksikan tanpa coupling langsung.
- `src/modules/homepage/application/homepage.test.ts` — 15 unit test (invariant, manage-banner, getHomepageData).
- `src/modules/homepage/infrastructure/prisma-homepage-repository.ts` — `PrismaHomepageRepository` mengimplementasikan seluruh `HomepageRepository` contract dengan Prisma client.
- `src/modules/homepage/public/homepage-service.ts` — public facade: `homepageGetData`, `homepageListAllBanners`, `homepageCreateBanner`, `homepageUpdateBanner`, `homepageDeleteBanner`. Menggunakan `listActiveProductsForHomepage` dari catalog public service (import boundary patuh).
- `src/modules/catalog/public/catalog-public-service.ts` — method baru `listActiveProductsForHomepage(limit)` sebagai entry point lintas module untuk consumer `homepage`.
- `src/app/api/v1/homepage/route.ts` — `GET /api/v1/homepage` (public, mengembalikan banners + featured/new arrivals/best sellers).
- `src/app/api/v1/admin/homepage/banners/route.ts` — `GET /api/v1/admin/homepage/banners` (list all), `POST /api/v1/admin/homepage/banners` (create). Dilindungi `requireAdmin()`.
- `src/app/api/v1/admin/homepage/banners/[id]/route.ts` — `PATCH /api/v1/admin/homepage/banners/[id]` (update), `DELETE /api/v1/admin/homepage/banners/[id]` (soft delete, 204). Dilindungi `requireAdmin()`.
- Prisma schema: model `HomepageBanner` (title, subtitle, mediaUrl, ctaLabel, ctaLink, displayOrder, isActive, audit fields, soft delete fields, index `isActive+displayOrder`) ditambahkan ke `prisma/schema.prisma`.
- Migration SQL `prisma/migrations/20260709130000_homepage_banner/migration.sql` dibuat (perlu diapply ke Supabase via `bunx prisma migrate deploy`).

### Changed

- `prisma/schema.prisma` — model `HomepageBanner` ditambahkan di section Homepage Module.
- `src/modules/catalog/public/catalog-public-service.ts` — tambah `listActiveProductsForHomepage` sebagai public contract baru.

### Verified

- `bun run check` (lint + typecheck + test) hijau.
- 133 test lolos (naik dari 118, +15 test baru dari M5.3).
- Import boundary violation ditemukan dan diselesaikan selama implementasi: homepage tidak boleh import dari layer internal catalog.

### Notes

- Best seller di M5.3 menggunakan fallback newest products karena modul `order` belum aktif. Akan diupdate saat order data tersedia.
- Migration `20260709130000_homepage_banner` perlu diapply manual ke Supabase dari terminal lokal (tidak bisa dari sandbox karena network restriction).

---

## 2026-07-09 (1)

### Added

- `src/modules/customer/domain/customer-entities.ts` — type `CustomerProfile`, `CustomerAddress`, `UpsertCustomerProfileCommand`, `CreateAddressCommand`, `UpdateAddressCommand`, `CustomerError`, `CustomerResult<T>`.
- `src/modules/customer/domain/customer-invariants.ts` — `isValidDisplayName` (2–100 karakter), `isValidPhone` (format Indonesia: 08xx, +62xx, 62xx).
- `src/modules/customer/domain/customer-repository.ts` — interface `CustomerRepository` (findProfileByCustomerId, upsertProfile, listAddresses, findAddressById, createAddress, updateAddress, softDeleteAddress, clearDefaultAddress, setDefaultAddress).
- `src/modules/customer/application/manage-customer-profile.ts` — `getCustomerProfile`, `upsertCustomerProfile` dengan typed error result.
- `src/modules/customer/application/manage-customer-address.ts` — `listCustomerAddresses`, `createCustomerAddress`, `updateCustomerAddress`, `deleteCustomerAddress` dengan typed error result dan default address logic.
- `src/modules/customer/application/customer.test.ts` — 22 unit test (invariant, profile service, address service).
- `src/modules/customer/infrastructure/prisma-customer-repository.ts` — `PrismaCustomerRepository` mengimplementasikan seluruh `CustomerRepository` contract. `softDeleteAddress` menggunakan soft-delete fields. `setDefaultAddress` menggunakan `prisma.$transaction`.
- `src/modules/customer/public/customer-service.ts` — public facade: `customerGetProfile`, `customerUpsertProfile`, `customerListAddresses`, `customerCreateAddress`, `customerUpdateAddress`, `customerDeleteAddress`.
- `src/app/api/v1/customers/me/route.ts` — `GET /api/v1/customers/me` (get profile), `PATCH /api/v1/customers/me` (upsert profile). Dilindungi `requireCustomer()`.
- `src/app/api/v1/customers/addresses/route.ts` — `GET /api/v1/customers/addresses` (list), `POST /api/v1/customers/addresses` (create). Dilindungi `requireCustomer()`.
- `src/app/api/v1/customers/addresses/[id]/route.ts` — `PATCH /api/v1/customers/addresses/[id]` (update), `DELETE /api/v1/customers/addresses/[id]` (soft delete, 204). Dilindungi `requireCustomer()`.
- Prisma schema: model `CustomerProfile` (id = Supabase user ID, displayName, phone, avatarUrl, audit fields) dan `CustomerAddress` (recipientName, phone, address fields, isDefault, audit fields, soft delete fields) ditambahkan ke `prisma/schema.prisma`.
- Migration `20260709044351_customer_profile_and_address` sudah diapply ke database Supabase.

### Changed

- `PROJECT_STATE.md` — M5.2 ditandai completed, Current Focus diperbarui ke M5.3, implementation progress 70%, version v0.9.
- `context/ctx-implementation.md` — Customer module status diperbarui, next target digeser ke M5.3.

### Verified

- `bunx --bun prisma generate` — lolos, Prisma client menyertakan `CustomerProfile` dan `CustomerAddress`.
- `bunx --bun prisma migrate dev --name customer_profile_and_address` — migration berhasil diapply ke Supabase PostgreSQL.
- `bun run check` (lint + typecheck + test) lolos — **118 test passed**, 0 error, 0 warning.

### Notes

- `CustomerProfile.id` menggunakan Supabase user ID langsung (bukan CUID baru) agar lookup per user O(1) tanpa JOIN.
- `softDeleteAddress` menggunakan soft-delete fields (`isDeleted`, `deletedAt`, `deletedBy`) sesuai `docs/06-data-model.md §11`.
- Default address logic: saat `isDefault=true` di create/update, `clearDefaultAddress` dipanggil dulu untuk unset semua default sebelum set yang baru — menjamin hanya satu default per customer.
- Endpoint path mengikuti API spec `docs/07-api-specification.md` §14 (`/customers/me`, `/customers/addresses`).

---

## 2026-07-07 (6)

### Added

- `src/modules/auth/domain/auth-entities.ts` — type `CustomerAccount`, `AuthSession`, `AuthResult<T>`, `AuthError`, `RegisterCustomerCommand`, `LoginCommand`.
- `src/modules/auth/domain/auth-invariants.ts` — `isValidEmail`, `isValidPassword`, `MIN_PASSWORD_LENGTH`.
- `src/modules/auth/domain/auth-repository.ts` — interface `AuthRepository` (register, login, logout, getCurrentSession).
- `src/modules/auth/application/register-customer.ts` — validasi email+password, delegate ke repository.
- `src/modules/auth/application/login-customer.ts` — validasi email, delegate ke repository.
- `src/modules/auth/application/logout-customer.ts` — delegate ke repository.
- `src/modules/auth/application/get-current-session.ts` — delegate ke repository.
- `src/modules/auth/application/auth.test.ts` — 18 unit test (invariant + application service dengan mock repository).
- `src/modules/auth/infrastructure/supabase-auth-repository.ts` — `SupabaseAuthRepository` wraps Supabase Auth `signUp`, `signInWithPassword`, `signOut`, `getUser`.
- `src/modules/auth/public/customer-auth-service.ts` — public facade: `authRegisterCustomer`, `authLoginCustomer`, `authLogoutCustomer`, `authGetCurrentSession`.
- `src/shared/infrastructure/auth/customer-guard.ts` — `requireCustomer()` guard (validasi JWT via `supabase.auth.getUser()`).
- `src/shared/kernel/api-response.ts` — shared helper `apiSuccess` + `apiError` untuk route handlers.
- `src/app/api/v1/auth/register/route.ts` — `POST /api/v1/auth/register` (public).
- `src/app/api/v1/auth/login/route.ts` — `POST /api/v1/auth/login` (public).
- `src/app/api/v1/auth/logout/route.ts` — `POST /api/v1/auth/logout` (requires customer session).
- `src/app/api/v1/auth/me/route.ts` — `GET /api/v1/auth/me` (requires customer session).

### Changed

- `PROJECT_STATE.md` — M5.1 ditandai completed, Current Focus diperbarui ke M5.2, implementation progress 65%.
- `context/ctx-implementation.md` — Auth module status diperbarui, next target digeser ke M5.2.

### Verified

- `bun run check` (lint + typecheck + test) lolos — **96 test passed**.

### Notes

- `SupabaseAuthRepository` menggunakan `getUser()` (bukan `getSession()`) untuk validasi JWT server-side sesuai rekomendasi Supabase SSR.
- `src/shared/kernel/api-response.ts` ditambahkan sebagai shared technical helper — dapat digunakan oleh route handlers lintas module tanpa melanggar boundary rules.
- `.gitkeep` dihapus dari seluruh subfolder `src/modules/auth/` yang kini terisi file implementasi.

---

## 2026-07-07 (5)

### Changed

- `docs/11-development-roadmap.md` — update status: Phase 0/1/2 ditandai ✅ Completed (dengan tanggal), Phase 3 ditandai 🔄 In Progress.
- `PROJECT_STATE.md` — koreksi referensi phase berikutnya dari "Phase 3 Cart & Checkout" ke "Phase 3 Customer & Homepage" sesuai roadmap resmi; tambah Milestone 5 breakdown (M5.1–M5.3) dengan scope dan exit criteria per milestone.
- `context/ctx-implementation.md` — Current Focus diperbarui ke Phase 3 Customer & Homepage; Phase 3 targets ditambahkan secara detail (M5.1–M5.3); section lama dipisah sebagai "Phase 2 Completed Targets".

### Added

- `planning/backlog.md` — backlog Phase 3 (M5.1–M5.3) ditambahkan: acceptance criteria, dependency, dan status per milestone.

### Notes

- Ditemukan inkonsistensi: `PROJECT_STATE.md` dan `context/ctx-implementation.md` sebelumnya menyebut next phase sebagai "Phase 3 Cart & Checkout", padahal `docs/11-development-roadmap.md` mendefinisikan Phase 3 = Customer & Homepage dan Phase 4 = Cart & Inventory. Inkonsistensi sudah dikoreksi.
- Disepakati: Phase 3 mengikuti roadmap asli — Customer Auth dulu (M5.1), lalu Customer Profile & Address (M5.2), lalu Homepage Foundation (M5.3).
- Task berikutnya: **M5.1 — Customer Auth Foundation**.

---

## 2026-07-07 (4)

### Added

- Implementasi **M4.8 — Product Media & SEO Dasar**:
  - `src/modules/catalog/domain/catalog-entities.ts` — tambah enum `MediaOwnerType`, `ProductMediaType`; type `ProductMedia`, `ProductSeo`; commands `AddProductMediaCommand`, `UpsertProductSeoCommand`.
  - `src/modules/catalog/domain/catalog-repository.ts` — perluas interface: `listProductMedia`, `addProductMedia`, `removeProductMedia`, `getProductSeo`, `upsertProductSeo`.
  - `src/modules/catalog/domain/catalog-invariants.ts` — perluas `canActivateProduct`: sekarang mewajibkan thumbnail + minimal 1 variant; tambah `getActivationBlockReason` + `ActivationBlockReason` type; update `isProductPubliclyListable` agar memvalidasi thumbnail.
  - `src/modules/catalog/application/manage-product-media.ts` — application service baru: `listProductMedia`, `addProductMedia`, `removeProductMedia`, `getProductSeo`, `upsertProductSeo` dengan typed errors (5 error codes).
  - `src/modules/catalog/application/manage-product-lifecycle.ts` — error code baru `CANNOT_ACTIVATE_WITHOUT_THUMBNAIL`; gunakan `getActivationBlockReason` untuk pesan error yang lebih akurat.
  - `src/modules/catalog/infrastructure/prisma-catalog-repository.ts` — implementasi 5 method baru media & SEO via Prisma.
  - `src/modules/catalog/infrastructure/in-memory-catalog-repository.ts` — implementasi 5 method baru media & SEO (in-memory store).
  - `src/modules/catalog/public/catalog-admin-service.ts` — re-export types baru; tambah fungsi admin: `adminListProductMedia`, `adminAddProductMedia`, `adminRemoveProductMedia`, `adminGetProductSeo`, `adminUpsertProductSeo`.
  - Admin route handlers baru:
    - `GET/POST /api/v1/admin/products/[id]/media`
    - `DELETE /api/v1/admin/products/[id]/media/[mediaId]`
    - `GET/PUT /api/v1/admin/products/[id]/seo`
  - Prisma schema: enum `MediaOwnerType` (`PRODUCT`/`VARIANT`) dan `ProductMediaType` (`IMAGE`/`VIDEO`/`THREE_SIXTY`/`MANUAL_PDF`); model `ProductMedia` dan `ProductSeo` ditambah; relasi `seo` ditambahkan ke `Product`.
  - Migration `20260707061153_catalog_media_seo` diapply ke database Supabase.

### Verified

- `bun run check` (lint + typecheck + test) — hijau, 78 test lolos, 0 error.
- Migration Prisma berhasil diapply ke Supabase PostgreSQL.
- `prisma generate` lolos; Prisma client menyertakan `ProductMedia` dan `ProductSeo`.

### Notes

- Invariant thumbnail wajib berlaku saat aktivasi: produk tidak bisa di-`ACTIVE` jika `thumbnailUrl` kosong + tidak ada variant. Error code `CANNOT_ACTIVATE_WITHOUT_THUMBNAIL` ditambah ke `ProductLifecycleError`.
- `thumbnailUrl` di `Product` di-sync otomatis saat `addProductMedia` dipanggil dengan IMAGE pertama (sortOrder 0) dan produk belum memiliki thumbnail.
- **Phase 2 (Catalog Foundation) dinyatakan selesai.** M4.1–M4.8 semua completed.

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
