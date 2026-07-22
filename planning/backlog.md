# Product Backlog

Daftar pekerjaan yang telah disetujui tetapi belum menjadi prioritas.

## Priority

* P0 = Sangat Penting
* P1 = Penting
* P2 = Normal
* P3 = Future

---

## Current Backlog

### Checkout & Order Phase 5 (M7.1–M7.7)

Priority: P0

Status: In Progress — kicked off 2026-07-22; milestone breakdown Decision 027

Owner: `checkout` module, `order` module

Tujuan:

Membangun proses transaksi end-to-end dari cart hingga order terbuat (status hingga `WAITING_PAYMENT`), termasuk API customer/admin order dan UI checkout + order history. Shipping/payment di Phase 5 via stub/port adapter; Midtrans/Biteship di Phase 6.

Prasyarat (sudah siap):
- `getCartSnapshotForCheckout` (Decision 025)
- `inventoryReserveStock` / `inventoryCommitStock` / `inventoryReleaseReservedStock`
- Customer address API/UI, cart API/UI

Immediate next: **M7.2 — Order Domain Foundation**

---

#### M7.1 — Checkout Domain Foundation

Priority: P0

Status: Completed (2026-07-22)

Feature: `checkout-domain`

Output:
- Domain layer module `checkout` aktif: entity, invariant, repository contract, port contracts.
- Application services untuk prepare/select/place (tanpa HTTP dulu).
- Public facade siap dikonsumsi API layer.
- Stub ports shipping + payment method (Decision 027).
- Unit test domain + application lolos.

Scope implementasi:

1. **Domain entities** (`src/modules/checkout/domain/`):
   - `CheckoutSession` — aggregate root (customerId, cartId, addressId, shippingOption, paymentMethod, status, totals).
   - `CheckoutSnapshot` — immutable snapshot saat place order (items + prices + shipping + payment + address).
   - Enum status lifecycle: `STARTED` → `ADDRESS_CONFIRMED` → `SHIPPING_SELECTED` → `PAYMENT_METHOD_SELECTED` → `ORDER_PLACED` (+ expired/cancelled jika diperlukan).
   - Typed `CheckoutResult<T>` / `CheckoutError`.

2. **Invariants**:
   - Cart tidak kosong; alamat valid milik customer; shipping + payment wajib sebelum place order.
   - Snapshot immutable setelah `ORDER_PLACED`.

3. **Ports** (`application/checkout-ports.ts`):
   - `CheckoutCartPort` → `getCartSnapshotForCheckout`.
   - `CheckoutCustomerPort` → alamat customer.
   - `CheckoutShippingPort` → **stub** daftar opsi kurir + biaya.
   - `CheckoutPaymentMethodPort` → **stub** daftar metode bayar (metadata saja).
   - `CheckoutOrderPort` → `createOrderFromCheckout` (diisi penuh setelah M7.2).

4. **Application services**: `prepareCheckout`, `selectShippingOption`, `selectPaymentMethod`, `placeOrder` (orchestrate snapshot + order port + clear/checkout cart sesuai rule).
5. **Repository contract** + Prisma model `CheckoutSession` (jika session perlu persist; boleh in-memory/session DB sesuai data model).
6. **Public facade** `checkout-service.ts`.

Acceptance criteria:
- ✅ `prepareCheckout` gagal jika cart kosong / tidak ada alamat.
- ✅ Select shipping/payment hanya dari opsi stub yang valid.
- ✅ `placeOrder` menolak jika prasyarat belum lengkap; order port stub → `ORDER_MODULE_UNAVAILABLE` tanpa clear cart.
- ✅ Tidak ada import langsung ke internal module lain (hanya ports/facade).
- ✅ Migration `20260722030000_checkout_domain_foundation` applied.
- ✅ `bun run check` hijau (253 test).

Dependency:
- Cart + customer + inventory facades stabil (Phase 3–4 ✅).
- Order create port di-stub (`ORDER_MODULE_UNAVAILABLE`) sampai M7.2 selesai, lalu di-wire.

---

#### M7.2 — Order Domain Foundation

Priority: P0

Status: Ready (setelah / paralel akhir M7.1)

Feature: `order-domain`

Output:
- Domain layer module `order` aktif: entity, state machine, repository contract.
- Application: create dari checkout snapshot, transition status, cancel (policy MVP).
- Integrasi reserve stock via inventory facade saat order dibuat.
- Public facade untuk `checkout` dan API layer.
- Unit test domain + application lolos.

Scope implementasi:

1. **Domain entities**:
   - `Order`, `OrderItem`, `OrderTimeline` / `OrderStatusTransition`.
   - Status: `PENDING` → `WAITING_PAYMENT` → … (+ `CANCELLED`) sesuai `docs/03` / `docs/06`.
2. **Invariants**: minimal 1 item; total ≥ 0; currency konsisten; transisi status legal; completed/cancelled immutable sesuai rule.
3. **Application**:
   - `createOrderFromCheckout(snapshot)` → persist order + timeline + `inventoryReserveStock` → status `WAITING_PAYMENT` (atau `PENDING` lalu segera `WAITING_PAYMENT` sesuai model detail).
   - `transitionOrderStatus`, `cancelOrder` (release reserved stock jika applicable).
4. **Prisma models** + migration: `Order`, `OrderItem`, timeline/transitions.
5. **Public facade** `order-service.ts` — termasuk export untuk `CheckoutOrderPort`.

Acceptance criteria:
- Order dari snapshot valid tersimpan dengan item + total konsisten.
- Reserve stock dipanggil saat create; gagal stok → order tidak terbentuk (transaksi atomic).
- Transisi ilegal ditolak typed error.
- `bun run check` hijau.

Dependency:
- M7.1 ports order terdefinisi.
- Inventory reserve/release facade (Decision 025) ✅.

---

#### M7.3 — Checkout Customer API

Priority: P0

Status: Ready (setelah M7.1 + M7.2)

Feature: `checkout-customer-api`

Output:
- Endpoint customer checkout sesuai `docs/07-api-specification.md` §Checkout.
- Dilindungi `requireCustomer()`.
- Place-order E2E via API hingga `WAITING_PAYMENT`.

Scope implementasi:

1. Routes (`src/app/api/v1/checkout/`):
   - `GET /api/v1/checkout` — session / prepare view.
   - `POST /api/v1/checkout/shipping` — select shipping.
   - `POST /api/v1/checkout/payment` — select payment method.
   - `POST /api/v1/checkout/place-order` — place order.
2. HTTP mapping error → status code; presentation helpers di module checkout.
3. Wire ports ke cart/customer/order/inventory facades + stub shipping/payment.

Acceptance criteria:
- Flow prepare → shipping → payment → place-order berhasil untuk customer beralamat + cart terisi.
- Response place-order mengandung `orderId` + status `WAITING_PAYMENT`.
- Unauthorized tanpa session.
- `bun run check` hijau.

Dependency: M7.1 ✅, M7.2 ✅.

---

#### M7.4 — Order Customer + Admin API

Priority: P0

Status: Ready (setelah M7.2; bisa paralel akhir M7.3)

Feature: `order-api`

Output:
- Customer: list, detail, cancel order.
- Admin: list, detail, patch status.
- Auth: `requireCustomer()` / `requireAdmin()`.

Scope implementasi:

1. Customer routes (`/api/v1/orders`):
   - `GET /` list, `GET /{id}` detail, `POST /{id}/cancel`.
2. Admin routes (`/api/v1/admin/orders`):
   - `GET /` list (+ filter), `GET /{id}` detail, `PATCH /{id}/status`.
3. Ownership check: customer hanya order miliknya.

Acceptance criteria:
- Customer melihat hanya order sendiri; admin melihat semua.
- Cancel me-release reserved stock bila policy MVP mengizinkan.
- Admin status update mengikuti state machine.
- `bun run check` hijau.

Dependency: M7.2 ✅.

---

#### M7.5 — Phase 5 Backend Exit Validation

Priority: P0

Status: Ready (setelah M7.1–M7.4)

Feature: `phase-5-backend-exit`

Output:
- Exit gate backend Phase 5 lolos.
- Smoke/contract test flow checkout → order → reserve stock.
- Docs/facade naming selaras (pola Decision 025).

Scope validasi:

1. Cross-module: `checkout`/`order` hanya via ports + public facades.
2. Smoke: prepare → select shipping/payment → place-order → `WAITING_PAYMENT` + reservation ACTIVE → customer get order → (opsional) cancel → RELEASED.
3. Migrations order/checkout applied.
4. `bun run check` hijau; tidak ada boundary violation.

Acceptance criteria:
- Seluruh kriteria backend Phase 5 di roadmap terpenuhi.
- Kontrak siap untuk UI M7.6–M7.7 dan Phase 6 payment initiation.

Dependency: M7.1–M7.4 ✅.

---

#### M7.6 — UI: Checkout Flow

Priority: P0

Status: Ready (setelah M7.5)

Feature: `checkout-ui`

Output:
- Halaman `/checkout` berfungsi penuh.
- CTA cart "Lanjut ke Checkout" diaktifkan.
- Presentation components di `src/modules/checkout/presentation/`.

Scope implementasi:

1. Page `(store)/checkout` — pilih alamat, opsi shipping (stub), metode bayar (stub), ringkasan, place order.
2. Redirect sukses ke `/orders/[id]` (atau confirmation state).
3. Empty cart / no address → empty/error state yang jelas.
4. Protected: redirect login dengan `next=/checkout`.

Acceptance criteria:
- Customer dapat menyelesaikan checkout di browser hingga order `WAITING_PAYMENT`.
- Responsive + accessible (WCAG AA minimum).
- `bun run check` + `bun run build` hijau.

Dependency: M7.5 ✅.

---

#### M7.7 — UI: Order History + Detail

Priority: P0

Status: Ready (setelah M7.3/M7.4 API; idealnya setelah M7.6)

Feature: `order-ui`

Output:
- `/orders` — daftar pesanan customer.
- `/orders/[id]` — detail, status timeline, items, shipping/payment summary.
- Presentation di `src/modules/order/presentation/`.
- Phase 5 UI exit criteria terpenuhi → **Phase 5 selesai**.

Acceptance criteria:
- Customer melihat history + detail order milik sendiri.
- Status/timeline terbaca; empty state jika belum ada order.
- Responsive + accessible.
- `bun run check` + `bun run build` hijau.

Dependency: M7.4 ✅; M7.6 ✅ (untuk E2E visual dari cart → checkout → order).

---

### Cart & Inventory Phase 4 (M6.1–M6.8)

Priority: P0

Status: Completed — M6.1–M6.8 ✅ (Phase 4 selesai); digantikan fokus Phase 5

Owner: `cart` module, `inventory` module

Tujuan:

Membangun kemampuan manajemen keranjang belanja dan stok inventori sesuai roadmap Phase 4. Inventory menjadi fondasi stok yang dikonsumsi Cart, dan keduanya menjadi prasyarat Checkout (Phase 5).

---

#### M6.1 — Inventory Domain Foundation

Priority: P0

Status: Completed

Feature: `inventory-domain`

Output:
- Domain layer module `inventory` aktif dengan entity, invariant, dan repository contract.
- Application services untuk baca dan kelola stok.
- Public facade tersedia sebagai cross-module contract untuk `cart` dan `checkout`.
- Unit test domain + application service lolos.

Scope implementasi:

1. **Domain entities** (`src/modules/inventory/domain/`):
   - `InventoryItem` — stok per variant (`variantId`, `onHandQty`, `reservedQty`, `availableQty`).
   - `InventoryReservation` — reservasi stok saat order dibuat (`orderId`, `variantId`, `qty`, `reservationStatus`, `expiresAt`).
   - `InventoryMovement` — audit trail perubahan stok (`variantId`, `movementType`, `qtyDelta`, `reason`, `referenceType`, `referenceId`). Append-only.
   - Enum: `ReservationStatus` (ACTIVE, COMMITTED, RELEASED, EXPIRED), `MovementType` (STOCK_IN, STOCK_OUT, ADJUSTMENT, RESERVE, RELEASE, COMMIT).
   - Types: `InventoryError`, `InventoryResult<T>`.

2. **Invariants** (`inventory-invariants.ts`):
   - `isValidQty(qty)` — qty >= 0 dan integer.
   - `isAvailableStockSufficient(item, requestedQty)` — `availableQty >= requestedQty`.
   - `isReservationCommittable(reservation)` — status ACTIVE dan belum expired.
   - `isReservationReleasable(reservation)` — status ACTIVE (belum commit).
   - `computeAvailableQty(onHandQty, reservedQty)` — turunan deterministik.

3. **Repository contract** (`inventory-repository.ts`):
   - `findByVariantId(variantId)` — ambil InventoryItem per variant.
   - `findManyByVariantIds(variantIds)` — batch read.
   - `upsertInventoryItem(data)` — create or update item stok.
   - `createMovement(data)` — append movement record.
   - `listMovements(query)` — list dengan filter variantId, type, pagination.
   - `createReservation(data)` — buat reservasi baru.
   - `findReservationByOrderAndVariant(orderId, variantId)` — lookup reservasi.
   - `updateReservation(id, data)` — update status reservasi.

4. **Application services** (`src/modules/inventory/application/`):
   - `get-stock.ts`:
     - `getAvailableStock(variantId)` — return availableQty.
     - `assertStockAvailable(variantId, qty)` — throw error jika tidak cukup.
     - `getBatchStockAvailability(variantIds)` — bulk read.
   - `manage-stock.ts`:
     - `increaseStock(variantId, qty, reason, actorId)` — tambah stok + append movement STOCK_IN.
     - `adjustStock(variantId, qtyDelta, reason, actorId)` — adjustment + append movement ADJUSTMENT.
     - `listStockMovements(query)` — list movements dengan pagination.
   - `manage-reservation.ts` (dipakai oleh `checkout`/`order` di Phase 5):
     - `reserveStock(orderId, items)` — buat reservasi per item order.
     - `commitStock(orderId)` — ubah reservasi ACTIVE → COMMITTED.
     - `releaseStock(orderId)` — ubah reservasi ACTIVE → RELEASED.

5. **Public facade** (`src/modules/inventory/public/inventory-service.ts`):
   - Re-export: `getAvailableStock`, `assertStockAvailable`, `getBatchStockAvailability`, `increaseStock`, `adjustStock`, `listStockMovements`.
   - Reserve/commit/release dikontrak tapi diaktifkan saat Phase 5 (diekspos tapi implementasinya selesai di M6.1 agar Phase 5 tinggal integrate).

6. **Unit tests** (`inventory.test.ts`):
   - Invariant: qty valid, availability check, compute formula.
   - Service: increaseStock, adjustStock, assertStockAvailable (lolos + gagal).

Acceptance criteria:
- `getAvailableStock(variantId)` return `{ availableQty, onHandQty, reservedQty }`.
- `assertStockAvailable` throw `OUT_OF_STOCK` jika availableQty < qty.
- `increaseStock` update onHandQty dan append STOCK_IN movement dalam satu transaksi.
- `adjustStock` support delta positif (restock) dan negatif (koreksi).
- `availableQty` selalu = `onHandQty - reservedQty` (invariant konsistensi).
- Stok tidak boleh negatif: `increaseStock` dan `adjustStock` menolak jika hasilnya < 0.
- Semua error menggunakan typed error code (`STOCK_NOT_FOUND`, `INSUFFICIENT_STOCK`, `INVALID_QTY`).
- `bun run check` hijau.

Dependency:
- Catalog public facade sudah stabil (Phase 2 ✅) — `variantId` berasal dari catalog.
- Prisma schema model `InventoryItem`, `InventoryReservation`, `InventoryMovement` perlu ditambahkan (dikerjakan di milestone ini).

---

#### M6.2 — Admin Inventory API

Priority: P0

Status: Completed

Feature: `inventory-admin-api`

Output:
- Admin dapat melihat stok per variant.
- Admin dapat melakukan stock adjustment via API.
- Admin dapat melihat riwayat perubahan stok.
- Semua operasi admin terlindungi `requireAdmin()`.

Scope implementasi:

1. **Admin route handlers** (`src/app/api/v1/admin/inventory/`):
   - `GET /api/v1/admin/inventory` — list inventory items dengan filter (variantId, lowStock threshold), pagination.
   - `GET /api/v1/admin/inventory/[variantId]` — detail stok satu variant.
   - `POST /api/v1/admin/inventory/[variantId]/adjust` — lakukan adjustment stok (body: `qtyDelta`, `reason`).
   - `GET /api/v1/admin/inventory/movements` — list stock movement history dengan filter (variantId, movementType, dateRange, pagination).

2. **Facade extension** (jika perlu) — `inventory-admin-service.ts` atau langsung pakai `inventory-service.ts`.

Acceptance criteria:
- `GET /api/v1/admin/inventory` mengembalikan list inventory dengan `variantId`, `onHandQty`, `reservedQty`, `availableQty`.
- `POST /api/v1/admin/inventory/[variantId]/adjust` dengan `qtyDelta: -5` mengurangi stok dan append movement ADJUSTMENT.
- Adjustment yang menyebabkan stok negatif ditolak (return 400 + error code `INVALID_QTY`).
- `GET /api/v1/admin/inventory/movements` mendukung filter `variantId` dan pagination.
- Semua endpoint dilindungi `requireAdmin()`.
- `bun run check` hijau.

Dependency:
- M6.1 selesai (inventory domain + facade aktif).

---

#### M6.3 — Cart Domain Foundation

Priority: P0

Status: Completed

Feature: `cart-domain`

Output:
- Domain layer module `cart` aktif dengan entity, invariant, dan repository contract.
- Application service cart CRUD lengkap.
- Public facade tersedia sebagai cross-module contract untuk `checkout`.
- Kalkulasi subtotal dan total cart deterministik.
- Unit test domain + application service lolos.

Scope implementasi:

1. **Domain entities** (`src/modules/cart/domain/`):
   - `Cart` (aggregate root) — `actorType`, `actorId`, `cartStatus`, `currency`, `subtotal`, `total`, `itemCount`.
   - `CartItem` — `cartId`, `variantId`, `quantity`, `unitPriceSnapshot`, `lineSubtotal`.
   - Enum: `CartStatus` (ACTIVE, CHECKED_OUT, ABANDONED).
   - Types: `CartError`, `CartResult<T>`, `AddItemCommand`, `UpdateItemCommand`.

2. **Invariants** (`cart-invariants.ts`):
   - `isValidItemQuantity(qty)` — qty >= 1 dan integer.
   - `isDuplicateVariant(items, variantId)` — tidak ada item dengan variantId sama.
   - `computeLineSubtotal(unitPrice, qty)` — deterministic, tidak boleh negatif.
   - `computeCartTotal(items)` — sum lineSubtotal, tidak boleh negatif.

3. **Repository contract** (`cart-repository.ts`):
   - `findActiveCartByActor(actorType, actorId)` — ambil cart aktif.
   - `findCartById(cartId)` — by id.
   - `createCart(data)` — buat cart baru.
   - `updateCart(cartId, data)` — update cart (status, subtotal, total, itemCount).
   - `findCartItem(cartId, itemId)` — ambil satu item.
   - `findCartItemByVariant(cartId, variantId)` — cek duplikasi.
   - `createCartItem(data)` — tambah item.
   - `updateCartItem(itemId, data)` — update qty/price.
   - `deleteCartItem(itemId)` — hapus item.
   - `clearCartItems(cartId)` — hapus semua item.

4. **Application services** (`src/modules/cart/application/`):
   - `manage-cart.ts`:
     - `getActiveCart(actorContext)` — return cart aktif atau buat baru jika belum ada.
     - `addItem(actorContext, payload)` — validasi variant aktif + stok → tambah item / tingkatkan qty jika variant sudah ada → recalculate totals.
     - `removeItem(actorContext, itemId)` — hapus item → recalculate totals.
     - `changeItemQuantity(actorContext, itemId, qty)` — validasi stok → update qty → recalculate totals.
     - `changeItemVariant(actorContext, itemId, variantId)` — update ke variant baru (validasi stok) → recalculate.
     - `clearCart(actorContext)` — hapus semua item → reset totals.
     - `recalculateCart(actorContext)` — refresh price snapshot dan totals (berguna saat harga berubah).

5. **Port pattern** (`cart-catalog-port.ts`, `cart-inventory-port.ts`):
   - `CartCatalogPort`: `getVariantSnapshot(variantId)` — ambil snapshot harga dan status variant dari catalog.
   - `CartInventoryPort`: `assertStockAvailable(variantId, qty)` — validasi ketersediaan stok dari inventory.
   - Port diinjeksikan ke application service untuk menjaga cross-module boundary.

6. **Public facade** (`src/modules/cart/public/cart-service.ts`):
   - Re-export: `getActiveCart`, `addItem`, `removeItem`, `changeItemQuantity`, `changeItemVariant`, `clearCart`.
   - Kontrak `getCartSnapshot(actorContext)` — dipakai oleh `checkout` di Phase 5.

7. **Unit tests** (`cart.test.ts`):
   - Invariant: valid qty, duplicate variant check, total computation.
   - Service: addItem (sukses, stok kurang, variant duplikat), removeItem, changeItemQuantity, clearCart.

Acceptance criteria:
- `addItem` dengan variant baru membuat CartItem baru dan update totals.
- `addItem` dengan variant yang sudah ada di cart menambah quantity (tidak duplikasi baris).
- `addItem` ditolak jika stok tidak cukup (`OUT_OF_STOCK`).
- `addItem` ditolak jika variant tidak aktif (`VARIANT_UNAVAILABLE`).
- `changeItemQuantity` ditolak jika qty < 1 (`INVALID_QTY`).
- `changeItemQuantity` ditolak jika qty > available stock (`OUT_OF_STOCK`).
- Total cart selalu konsisten: `sum(lineSubtotal)` dari semua items.
- Error codes typed: `CART_NOT_FOUND`, `ITEM_NOT_FOUND`, `VARIANT_UNAVAILABLE`, `OUT_OF_STOCK`, `INVALID_QTY`, `DUPLICATE_VARIANT`.
- `bun run check` hijau.

Dependency:
- M6.1 selesai (inventory public facade aktif untuk `CartInventoryPort`).
- Catalog public facade sudah stabil (Phase 2 ✅) untuk `CartCatalogPort`.
- Prisma schema model `Cart`, `CartItem` perlu ditambahkan (dikerjakan di milestone ini).

---

#### M6.4 — Cart Customer API

Priority: P0

Status: Completed

Feature: `cart-customer-api`

Output:
- Customer dapat mengelola cart via REST API.
- Semua endpoint dilindungi `requireCustomer()`.
- Stock validation real-time saat add/update item.

Scope implementasi:

1. **Customer route handlers** (`src/app/api/v1/cart/`):
   - `GET /api/v1/cart` — ambil cart aktif beserta items (buat baru jika belum ada).
   - `POST /api/v1/cart/items` — tambah item ke cart (body: `variantId`, `quantity`).
   - `PATCH /api/v1/cart/items/[id]` — update item (body: `quantity` atau `variantId`).
   - `DELETE /api/v1/cart/items/[id]` — hapus satu item dari cart.
   - `DELETE /api/v1/cart` — clear seluruh cart (return 204).

2. **Response shape** (GET /api/v1/cart):
   ```json
   {
     "success": true,
     "data": {
       "cartId": "...",
       "items": [
         {
           "itemId": "...",
           "variantId": "...",
           "productName": "...",
           "variantLabel": "...",
           "thumbnailUrl": "...",
           "unitPrice": 150000,
           "quantity": 2,
           "lineSubtotal": 300000
         }
       ],
       "subtotal": 300000,
       "itemCount": 2
     }
   }
   ```

3. **Error handling** — semua error response mengikuti standar API (`success: false`, `error.code`, `error.message`).

Acceptance criteria:
- `GET /api/v1/cart` return cart aktif; jika belum ada, auto-create dan return empty cart.
- `POST /api/v1/cart/items` return 201 + cart terbaru; return 400 jika stok tidak cukup.
- `PATCH /api/v1/cart/items/[id]` return 200 + cart terbaru; return 404 jika item tidak ditemukan.
- `DELETE /api/v1/cart/items/[id]` return 204.
- `DELETE /api/v1/cart` return 204 dan cart kosong.
- Semua endpoint return 401 jika customer tidak login.
- `bun run check` hijau.

Dependency:
- M6.3 selesai (cart domain + facade aktif).
- M6.1 selesai (inventory facade untuk stock validation).

---

#### M6.6 — UI: Route Groups & Shared Layout Foundation

Priority: P0

Status: Completed (2026-07-21)

Feature: `ui-route-groups`

Output:
- Struktur route group `(store)`, `(auth)`, `(admin)` aktif di `src/app/`.
- Layout terpisah per audience berjalan tanpa konflik.
- Navbar, footer, dan sidebar admin tersedia sebagai shared layout component.

Scope implementasi:

1. **Route groups** (`src/app/`):
   - `(store)/layout.tsx` — layout dengan Navbar + Footer.
   - `(auth)/layout.tsx` — layout minimalist, hanya logo + centered form.
   - `(admin)/layout.tsx` — layout dengan Sidebar admin + topbar.

2. **Shared layout components** (`src/shared/ui/layout/`):
   - `Navbar` — logo, navigasi kategori, search icon, cart icon (jumlah), account icon. Responsive: hamburger menu di mobile.
   - `Footer` — kolom: brand tagline, navigasi cepat, sosial media.
   - `AdminSidebar` — navigasi admin: Dashboard, Products, Orders, Inventory, Homepage.
   - `Container` — max-width wrapper dengan padding konsisten.

3. **Root page placeholder** (`src/app/(store)/page.tsx`) — redirect ke homepage sementara loading skeleton.

Acceptance criteria:
- `(store)` route menampilkan Navbar di atas dan Footer di bawah.
- `(auth)` route menampilkan layout clean tanpa navbar.
- `(admin)` route menampilkan sidebar admin dan dilindungi `requireAdmin()`.
- Layout tidak ada broken styling, responsive di mobile (360px) dan desktop (1280px).
- `bun run check` hijau.

Dependency:
- M6.4 selesai (cart API aktif untuk cart count di navbar).
- shadcn/ui + Tailwind + Motion sudah aktif (M3.5 ✅).

---

#### M6.7 — UI: Homepage + Catalog + Product Detail

Priority: P0

Status: Completed

Feature: `ui-store-catalog`

Output:
- ✅ Homepage menampilkan banner, featured products, new arrivals, best sellers.
- ✅ Halaman listing produk dengan filter dan pagination.
- ✅ Halaman detail produk dengan galeri, variant selector, dan add-to-cart.
- ✅ Halaman search results.

Scope implementasi:

1. ✅ **Homepage** (`src/app/(store)/page.tsx`):
   - Hero section dengan banner aktif dari `homepageGetData` (public facade).
   - Section Featured Products, New Arrivals, Best Sellers (grid).
   - Data fetching via Server Component.

2. ✅ **Product listing** (`src/app/(store)/products/page.tsx`):
   - Grid produk responsif (2 kolom mobile, 3–4 kolom desktop).
   - Filter: kategori (slug), range harga.
   - Sorting: terbaru, harga terendah/tertinggi.
   - Pagination.
   - Data dari `listPublicProductsFromSearchParams`.

3. ✅ **Product detail** (`src/app/(store)/products/[slug]/page.tsx`):
   - Galeri gambar produk (thumbnail + full view).
   - Informasi: nama, brand, harga, deskripsi.
   - Variant selector — pilihan ACTIVE; stok dari inventory.
   - Stok indicator (tersedia / habis).
   - Tombol "Add to Cart" — `POST /api/v1/cart/items` (401 → `/login?next=`).
   - Data dari `getPublicProductBySlug` (variants + media + stock).

4. ✅ **Search** (`src/app/(store)/search/page.tsx`):
   - Input search (URL params `?q=`) + debounce navigasi.
   - Hasil grid produk.
   - Empty state jika tidak ditemukan / q kosong.
   - Data dari `searchPublicProductsFromSearchParams`.

5. **Komponen domain** (`src/modules/catalog/presentation/`):
   - ✅ `ProductCard`, `ProductGrid`, `ProductFilters`, `CatalogPagination`, `PriceDisplay`.
   - ✅ `VariantSelector`, `ProductGallery`, `ProductDetailPanel`, `AddToCartButton`, `SearchForm`.

Acceptance criteria:
- ✅ Homepage load dengan data real (bukan mock).
- ✅ Product listing menampilkan produk aktif dengan pagination.
- ✅ Product detail menampilkan info + Add to Cart (login required).
- ✅ Search mengembalikan hasil relevan dengan debounce.
- ✅ Responsive di mobile.
- ✅ `bun run check` hijau.

Dependency:
- M6.6 selesai (layout aktif).
- Catalog API sudah stable (Phase 2 ✅).
- Homepage API sudah stable (M5.3 ✅).

---

#### M6.8 — UI: Auth + Account + Cart

Priority: P0

Status: Completed (2026-07-21)

Feature: `ui-auth-account-cart`

Output:
- Halaman login dan register berfungsi penuh.
- Halaman account customer (profil + alamat).
- Halaman cart dengan operasi lengkap.

Scope implementasi:

1. **Login** (`src/app/(auth)/login/page.tsx`):
   - Form: email + password.
   - Error handling: credentials salah, akun tidak ditemukan.
   - Redirect ke `(store)/` setelah berhasil.
   - Memanggil `POST /api/v1/auth/login`.

2. **Register** (`src/app/(auth)/register/page.tsx`):
   - Form: email + password + konfirmasi password.
   - Validasi client + server.
   - Redirect ke login setelah berhasil.
   - Memanggil `POST /api/v1/auth/register`.

3. **Account** (`src/app/(store)/account/page.tsx`) — dilindungi session:
   - Tab atau section: Profil, Alamat.
   - Profil: form edit nama + telepon. Memanggil `PATCH /api/v1/customers/me`.
   - Alamat: list alamat + tambah/edit/hapus + set default. Memanggil `/api/v1/customers/addresses`.

4. **Cart** (`src/app/(store)/cart/page.tsx`) — dilindungi session:
   - List item cart: thumbnail, nama, variant, harga, quantity stepper, tombol remove.
   - Subtotal dan total.
   - Tombol "Lanjut ke Checkout" (akan aktif di Phase 5).
   - Empty state jika cart kosong.
   - Data dari `GET /api/v1/cart`; mutasi via `PATCH/DELETE /api/v1/cart/items/[id]`.

5. **Komponen domain**:
   - `src/modules/auth/presentation/` — `LoginForm`, `RegisterForm`.
   - `src/modules/customer/presentation/` — `ProfileForm`, `AddressCard`, `AddressForm`.
   - `src/modules/cart/presentation/` — `CartItemRow`, `CartSummary`, `QuantityStepper`.

Acceptance criteria:
- Customer dapat login dan logout.
- Customer dapat register akun baru.
- Customer dapat lihat dan edit profil + alamat.
- Cart menampilkan item real dari API; quantity dapat diubah; item dapat dihapus.
- Semua protected pages redirect ke `/login` jika tidak ada session.
- Semua halaman responsive di mobile.
- `bun run check` hijau.

Dependency:
- M6.6 selesai (layout aktif).
- M6.4 selesai (cart API aktif).
- Auth API sudah stable (M5.1 ✅).
- Customer API sudah stable (M5.2 ✅).

---

#### M6.5 — Phase 4 Exit Validation

Priority: P0

Status: Completed (2026-07-21)

Feature: `phase-4-exit-gate`

Output:
- Seluruh milestone M6.1–M6.4 selesai dan terpadu.
- Quality gate penuh lolos.
- Kontrak lintas module untuk Phase 5 (Checkout & Order) sudah terpasang.

Scope validasi:

1. **Cross-module contract check**:
   - `cart` module mengkonsumsi `inventory` public facade via port tanpa import langsung ke layer internal.
   - `cart` module mengkonsumsi `catalog` public facade via port tanpa import langsung.
   - `getCartSnapshot(actorContext)` tersedia di cart public facade — siap dikonsumsi `checkout`.
   - `reserveStock`, `commitStock`, `releaseStock` tersedia di inventory public facade — siap dikonsumsi `order`.

2. **Integration smoke test**:
   - Flow lengkap: addItem → stok tervalidasi → cart total dihitung → item terhapus → cart kosong.

3. **Migration applied**:
   - `InventoryItem`, `InventoryReservation`, `InventoryMovement` applied ke Supabase.
   - `Cart`, `CartItem` applied ke Supabase.

4. **Quality gate**:
   - `bun run check` hijau (lint + typecheck + test).
   - Tidak ada import boundary violation (ESLint `import/no-restricted-paths`).

Acceptance criteria:
- Seluruh test lolos.
- Tidak ada linter / typecheck error.
- Tidak ada cross-layer import violation.
- `cart` hanya mengakses `inventory` dan `catalog` via public facade.
- Kontrak untuk Phase 5 terpasang dan terdokumentasi.

---

### Customer & Homepage Phase 3 (M5.1–M5.3)

Priority: P0

Status: Ready

Owner: `customer` module, `homepage` module

Tujuan:

Membangun pengalaman dasar customer: autentikasi, profil, alamat, dan homepage dinamis sesuai roadmap Phase 3.

---

#### M5.1 — Customer Auth Foundation

Priority: P0

Status: Ready — next to implement

Feature: `customer-auth`

Output:
- Customer dapat register, login, dan logout.
- Session aktif via Supabase Auth.
- API endpoint auth tersedia dan terlindungi.

Acceptance criteria:
- `POST /api/v1/auth/register` membuat akun baru; return 409 jika email sudah terdaftar.
- `POST /api/v1/auth/login` mengembalikan session; return 401 jika credentials salah.
- `POST /api/v1/auth/logout` menginvalidasi session.
- `requireCustomer()` memblokir request tanpa session valid (return 401).
- Password minimal 8 karakter; email harus valid format.
- Error response mengikuti format standar API (`success: false`, `error.code`, `error.message`).

Dependency:
- Supabase Auth plumbing sudah aktif (M3.4 ✅).
- `src/modules/customer/` folder sudah ada (M3.1 ✅).

---

#### M5.2 — Customer Profile & Address

Priority: P0

Status: Planned

Feature: `customer-profile`, `customer-address`

Output:
- Customer dapat melihat dan mengubah profil (nama, nomor telepon).
- Customer dapat mengelola daftar alamat pengiriman.

Acceptance criteria:
- `GET /api/v1/customer/profile` mengembalikan profil customer yang sedang login.
- `PATCH /api/v1/customer/profile` mengubah nama dan nomor telepon.
- `POST /api/v1/customer/addresses` menambah alamat baru.
- `PATCH /api/v1/customer/addresses/[id]` mengubah alamat.
- `DELETE /api/v1/customer/addresses/[id]` menghapus alamat.
- Satu alamat dapat ditandai sebagai `isDefault`; saat satu diset default, yang lain otomatis unset.
- Semua endpoint dilindungi `requireCustomer()`.

Dependency:
- M5.1 selesai (session guard aktif).
- Prisma schema `CustomerProfile` dan `CustomerAddress` perlu ditambahkan.

---

#### M5.3 — Homepage Foundation

Priority: P1

Status: Planned

Feature: `homepage-data`, `homepage-banner`

Output:
- Endpoint homepage mengembalikan data dinamis: banner aktif + produk featured/new arrival/best seller.
- Admin dapat mengelola banner homepage via API.

Acceptance criteria:
- `GET /api/v1/homepage` mengembalikan: `banners[]`, `featuredProducts[]`, `newArrivals[]`, `bestSellers[]`.
- Featured/new arrival/best seller diambil dari `catalog` public service (tidak duplicate query logic).
- `POST /api/v1/admin/homepage/banners` membuat banner baru.
- Banner memiliki urutan (`sortOrder`) dan status aktif/tidak aktif.
- Hanya banner aktif yang muncul di endpoint publik.
- Admin endpoints dilindungi `requireAdmin()`.

Dependency:
- Catalog public service sudah stabil (Phase 2 ✅).
- Prisma schema `HomepageBanner` perlu ditambahkan.

---

### Catalog Module Start Gate (M3.7)

Priority: P0

Status: Ready

Owner: Catalog module

Tujuan:

Menetapkan Definition of Ready untuk implementasi module pertama (`catalog`) menggunakan pendekatan vertical slice sesuai `docs/03-functional-requirements.md`, `docs/05-domain-modules.md`, `docs/06-data-model.md`, dan `docs/07-api-specification.md`.

Scope Phase 2 (Catalog Foundation):

- Product category management.
- Product management (draft/active/archived/out_of_stock).
- Product variant management (SKU, harga, atribut).
- Product detail by slug.
- Public catalog listing + search/filter/sort.

### Feature Backlog (Vertical Slice)

1) `catalog-category-management`

- Priority: P0
- Output:
  - Admin dapat membuat, mengubah, mengarsipkan category.
  - Public endpoint categories tersedia (`GET /products/categories`).
- Acceptance criteria:
  - Category memiliki `name` dan `slug` unik.
  - Category archived tidak tampil di kategori publik.
  - API response mengikuti format standar API (`success`, `data`/`error`).

2) `catalog-product-lifecycle`

- Priority: P0
- Output:
  - Admin CRUD product + archive + status transition.
  - Product detail publik via slug (`GET /products/slug/{slug}`).
- Acceptance criteria:
  - Product tidak bisa `ACTIVE` tanpa minimal 1 variant.
  - `slug` unik dan konsisten dipakai pada route publik.
  - Product `ARCHIVED` tidak muncul pada listing publik.

3) `catalog-variant-pricing-attributes`

- Priority: P0
- Output:
  - Admin dapat membuat/mengubah variant (SKU, harga, atribut).
  - Snapshot variant tersedia via public service (`getVariantSnapshot`).
- Acceptance criteria:
  - SKU variant wajib unik.
  - Harga variant tidak boleh negatif.
  - Variant terikat ke product owner yang valid.

4) `catalog-public-listing-search`

- Priority: P1
- Output:
  - Listing produk publik dengan pagination, sort, dan filter dasar.
  - Search produk publik (`GET /products/search`).
- Acceptance criteria:
  - Query `q`, `category`, `status`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` didukung sesuai kontrak.
  - Listing hanya menampilkan produk berstatus publik (`ACTIVE` dan available).
  - Empty state untuk hasil pencarian kosong tersedia di UI.

5) `catalog-product-media-seo`

- Priority: P1
- Output:
  - Product media dan metadata SEO tersedia pada detail produk.
- Acceptance criteria:
  - Thumbnail wajib tersedia untuk product yang dipublikasikan.
  - Metadata SEO (`metaTitle`, `metaDescription`, `canonicalUrl`) dapat dikelola.
  - Struktur data media mengikuti owner type (`PRODUCT`/`VARIANT`).

### Dependency Verification (Catalog)

Status dependency antar module untuk implementasi awal `catalog`:

- `catalog -> inventory` (wajib, phase-2 compatible)
  - Kebutuhan: stock availability per variant pada listing/detail.
  - Integrasi: lewat `inventory` public service (`getAvailableStock`, `assertStockAvailable`).
  - Risiko: jika inventory write flow belum aktif, gunakan fallback read-model stock seed pada fase awal dengan contract tetap.

- `catalog -> review` (wajib, phase-2 compatible)
  - Kebutuhan: rating summary dan review preview untuk product card/detail.
  - Integrasi: lewat `review` public service (`getProductRatingSummary`, `listProductReviews`).
  - Risiko: jika review module belum dibangun, tampilkan default summary (`0 review`, `0 rating`) tanpa melanggar contract.

- `homepage -> catalog` (downstream consumer, bukan blocker start gate)
  - Kebutuhan: homepage butuh reference produk aktif.
  - Status: tidak menghalangi kickoff `catalog`, tapi kontrak listing produk aktif harus stabil.

- `cart -> catalog` (downstream consumer, bukan blocker start gate)
  - Kebutuhan: validasi status product/variant aktif.
  - Status: tidak menghalangi kickoff `catalog`, namun `getVariantSnapshot` menjadi kontrak kunci untuk fase cart.

Kesimpulan verifikasi dependency:

- Tidak ada dependency blocker untuk memulai implementasi `catalog`.
- Contract lintas module yang dibutuhkan sudah terdokumentasi di `docs/05-domain-modules.md`.

### Implementation Readiness Checklist (DoR)

- [x] Feature backlog `catalog` disusun per vertical slice.
- [x] Acceptance criteria tersedia untuk tiap feature utama.
- [x] Dependency antar module diverifikasi (`inventory`, `review`, downstream `homepage`/`cart`).
- [x] Kontrak data/API kunci tervalidasi dengan `docs/06-data-model.md` dan `docs/07-api-specification.md`.
- [x] Batas arsitektur/layer untuk implementasi sudah jelas (`presentation -> application -> domain -> infrastructure`).
- [x] Module `catalog` dinyatakan siap untuk implementasi fase berikutnya.

---

### Marketplace Integration

Priority: P3

Status: Pending

Catatan:

Integrasi Shopee dan TikTok Shop.

---

### POS

Priority: P3

Status: Pending

---

### Loyalty Program

Priority: P3

Status: Pending

---

### Referral System

Priority: P3

Status: Pending

---

### Mobile App

Priority: P3

Status: Pending

---

### Analytics Dashboard

Priority: P2

Status: Pending

Catatan:

Dashboard analytics yang lebih lengkap dibanding MVP.
