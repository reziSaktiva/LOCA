# Domain Modules

## 1. Domain Overview

Dokumen ini mendefinisikan batas domain, tanggung jawab, dependency, dan kontrak antar module pada arsitektur modular monolith.

Tujuan utama:

- Menjaga business boundary tetap jelas.
- Mencegah coupling antar module.
- Memastikan alur core e-commerce (browse -> cart -> checkout -> payment -> shipping -> review) berjalan konsisten.
- Menjadi acuan implementasi folder, service contract, dan ownership data.

Prinsip yang digunakan:

- Setiap module memiliki data dan business rule sendiri.
- Akses lintas module hanya lewat public service.
- `admin` diposisikan sebagai interface/presentation layer, bukan domain module.
- `analytics`, `notification`, dan `reports` adalah cross-cutting capabilities yang membaca data domain melalui service contract.

---

## 2. Module Dependency Diagram

```text
Auth
  │
  ▼
Customer
  │
  ▼
Cart ────────────────► Inventory
  │                        ▲
  ▼                        │
Checkout ───────► Shipping │
  │              (rates)   │
  ▼                        │
Order ───────────► Payment │
  │                (init)  │
  │                        │
  ├──────────────► Shipping (fulfillment/tracking)
  │
  └──────────────► Inventory (reserve/commit/release stock)

Catalog ─────────► Inventory (stock availability by variant)
Catalog ─────────► Review (aggregate rating/read reviews)
Homepage ────────► Catalog (featured, bestseller, new arrival)
Review ──────────► Order (purchase verification)
```

Catatan:

- Dependency diagram di atas menunjukkan dependency business utama, bukan import code level.
- Dependency antar module harus via facade/public service module tujuan.

---

## 3. Module Dependency Matrix

Matriks ini menunjukkan arah dependency business antar module (`From -> To`).

Keterangan:

- `✓` = module pada baris bergantung ke module pada kolom.
- `-` = tidak ada dependency langsung.

| From \ To | Auth | Customer | Catalog | Inventory | Cart | Checkout | Order | Payment | Shipping | Review | Homepage |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | - | - | - | - | - | - | - | - | - | - | - |
| Customer | ✓ | - | - | - | - | - | ✓ | - | - | - | - |
| Catalog | - | - | - | ✓ | - | - | - | - | - | ✓ | - |
| Inventory | - | - | ✓ | - | - | - | ✓ | - | - | - | - |
| Cart | - | - | ✓ | ✓ | - | - | - | - | - | - | - |
| Checkout | - | ✓ | - | - | ✓ | - | ✓ | ✓ | ✓ | - | - |
| Order | - | - | - | ✓ | - | ✓ | - | ✓ | ✓ | - | - |
| Payment | - | - | - | - | - | - | ✓ | - | - | - | - |
| Shipping | - | - | - | - | - | - | ✓ | - | - | - | - |
| Review | - | - | ✓ | - | - | - | ✓ | - | - | - | - |
| Homepage | - | - | ✓ | - | - | - | - | - | - | - | - |

---

## 4. Shared Kernel

Shared kernel hanya untuk concern teknis lintas module, bukan tempat business rule.

Komponen yang diperbolehkan:

- Result/error primitives (`Result`, `AppError`, error code).
- Base types (`EntityId`, timestamp contract, pagination contract).
- Validation helpers generik lintas domain.
- Logger abstraction, config loader, env schema.
- Event bus contract (jika dipakai untuk internal async processing).

Komponen yang tidak diperbolehkan:

- Rule checkout, payment, shipping, stok, atau rule domain spesifik lain.
- Repository/query spesifik domain.
- Use case orchestration dari module tertentu.

---

## 5. Auth Module

### Purpose

Mengelola identitas, autentikasi, session, dan otorisasi role-based.

### Responsibilities

- Registrasi customer.
- Login customer dan admin.
- Logout/session invalidation.
- Password reset dan password update.
- Role & permission check untuk route guard.

### Public Services

- `registerCustomer(input)`
- `loginWithEmail(input)`
- `logout(sessionId)`
- `requestPasswordReset(email)`
- `resetPassword(token, newPassword)`
- `changePassword(userId, payload)`
- `getCurrentSession(context)`
- `requireRole(context, role)`

### Owned Entities

- `AuthIdentity`
- `AuthCredential`
- `AuthSession`
- `AuthRoleAssignment`
- `PasswordResetToken`

### Aggregate Root

- `AuthIdentity`

### Business Invariants

- Email harus unik.
- Credential harus terikat ke identity yang valid.
- Session aktif hanya boleh dimiliki identity yang valid.
- Password reset token memiliki masa berlaku dan hanya bisa dipakai sekali.
- Role assignment wajib mereferensikan role yang terdaftar.

### Lifecycle

```text
Registered
   │
   ▼
Active Session
   │
   ├──► Password Reset Requested
   │           │
   │           ▼
   │       Password Updated
   │
   ▼
Session Revoked / Logged Out
```

### Complexity

`Medium`

### Dependencies

- Shared kernel.
- External auth provider adapter (Supabase Auth).

### External Providers

- Supabase Auth

### Events

- `auth.customer_registered`
- `auth.user_logged_in`
- `auth.password_reset_requested`
- `auth.password_changed`
- `auth.session_revoked`

### Future Scope

- Social login.
- MFA / passkey.
- Device/session management UI.

---

## 6. Customer Module

### Purpose

Mengelola profil customer, alamat pengiriman, dan riwayat pembelian.

### Responsibilities

- CRUD profil customer.
- CRUD alamat customer.
- Menyajikan order history customer (read via `order` public service).
- Menyediakan customer summary untuk admin.

### Public Services

- `getCustomerProfile(customerId)`
- `updateCustomerProfile(customerId, payload)`
- `uploadCustomerAvatar(customerId, file)`
- `listCustomerAddresses(customerId)`
- `addCustomerAddress(customerId, payload)`
- `updateCustomerAddress(customerId, addressId, payload)`
- `removeCustomerAddress(customerId, addressId)`
- `getCustomerPurchaseHistory(customerId, query)`

### Owned Entities

- `CustomerProfile`
- `CustomerAddress`
- `CustomerPreference`

### Aggregate Root

- `CustomerProfile`

### Business Invariants

- Satu profile hanya boleh dimiliki satu customer identity.
- Customer wajib memiliki minimal satu alamat aktif sebelum checkout.
- Alamat default (jika ada) harus unik per customer.
- Customer hanya boleh mengubah data miliknya sendiri.

### Complexity

`Medium`

### Dependencies

- `auth` (identity binding, role check).
- `order` (purchase history read contract).

### Events

- `customer.profile_updated`
- `customer.address_added`
- `customer.address_updated`
- `customer.address_removed`

### Future Scope

- Customer preference engine.
- Wishlist.
- Loyalty/member profile.

---

## 7. Catalog Module

### Purpose

Mengelola produk, kategori, varian, atribut, dan pencarian katalog publik.

### Responsibilities

- CRUD produk.
- CRUD kategori.
- CRUD varian produk (SKU, atribut, harga).
- Menjaga product status lifecycle (draft, active, archived, out_of_stock).
- Menyediakan listing, detail produk, search, dan filter.

### Public Services

- `createProduct(payload)`
- `updateProduct(productId, payload)`
- `archiveProduct(productId)`
- `setProductStatus(productId, status)`
- `addVariant(productId, payload)`
- `updateVariant(variantId, payload)`
- `getProductBySlug(slug)`
- `listProducts(query)`
- `searchProducts(query)`
- `getVariantSnapshot(variantId)`

### Owned Entities

- `Product`
- `ProductCategory`
- `ProductVariant`
- `VariantAttribute`
- `ProductMedia`
- `ProductSeo`

### Aggregate Root

- `Product`

### Business Invariants

- Product wajib memiliki minimal satu variant sebelum status `active`.
- SKU variant harus unik.
- Product yang `archived` tidak boleh tampil di katalog publik.
- Harga variant tidak boleh negatif.
- Slug product harus unik.

### Lifecycle

```text
Draft
  │
  ▼
Active
  │
  ├──► Out Of Stock
  │         │
  │         └──► Active (restocked)
  │
  ▼
Archived
```

### Complexity

`High`

### Dependencies

- `inventory` (stock availability per variant).
- `review` (rating summary, review preview).

### Events

- `catalog.product_created`
- `catalog.product_updated`
- `catalog.product_archived`
- `catalog.variant_created`
- `catalog.variant_updated`
- `catalog.product_status_changed`

### Future Scope

- Bundle/kit products.
- Advanced merchandising rules.
- Marketplace catalog sync.

---

## 8. Inventory Module

### Purpose

Mengelola stok per varian, movement historis, dan konsistensi stok terhadap order lifecycle.

### Responsibilities

- Menyimpan current stock per variant.
- Validasi stok untuk cart/checkout.
- Reserve stock saat order dibuat (opsional sesuai strategi).
- Commit stock reduction setelah payment confirmed.
- Release stock ketika order dibatalkan/expired.
- Menyimpan stock movement audit trail.

### Public Services

Entry point implementasi: `src/modules/inventory/public/inventory-service.ts`.

- `getAvailableStock(variantId)` — facade: `inventoryGetStock`
- `assertStockAvailable(variantId, qty)` — facade: `inventoryAssertStockAvailable` (dikonsumsi `cart`)
- `reserveStock(orderId, items)` — facade: `inventoryReserveStock` (kontrak Phase 5 / `order`)
- `commitStock(orderId)` — facade: `inventoryCommitStock` (kontrak Phase 5 / `payment` → `order`)
- `releaseReservedStock(orderId)` — facade: `inventoryReleaseReservedStock` (kontrak Phase 5 / `order`)
- `increaseStock(variantId, qty, reason)` — facade: `inventoryIncreaseStock`
- `adjustStock(variantId, qty, reason)` — facade: `inventoryAdjustStock` / `inventoryUpsertStock` (admin)
- `listStockMovements(query)` — facade: `inventoryListMovements`
- `listInventoryItems(query)` — facade: `inventoryListItems` (admin)

### Owned Entities

- `InventoryItem`
- `InventoryReservation`
- `InventoryMovement`

### Aggregate Root

- `InventoryItem`

### Business Invariants

- Stock tidak boleh negatif.
- Reservation tidak boleh melebihi available stock.
- Commit stock hanya boleh berasal dari reservation aktif.
- Release reservation hanya berlaku untuk reservation yang belum di-commit/expired.
- Setiap adjustment wajib memiliki alasan/audit trail.

### Lifecycle

```text
In Stock
  │
  ├──► Reserved
  │         │
  │         ├──► Committed (order paid)
  │         └──► Released (cancel/expire)
  │
  ▼
Adjusted
```

### Complexity

`High`

### Dependencies

- `catalog` (variant identity/reference).
- `order` (status source untuk commit/release).

### Events

- `inventory.stock_reserved`
- `inventory.stock_committed`
- `inventory.stock_released`
- `inventory.stock_adjusted`
- `inventory.low_stock_detected`

### Future Scope

- Multi-warehouse.
- Safety stock threshold automation.
- Inventory forecasting.

---

## 9. Cart Module

### Purpose

Mengelola item yang dipilih customer sebelum checkout.

### Responsibilities

- Add/remove/update cart item.
- Validasi variant aktif dan stok saat perubahan cart.
- Kalkulasi subtotal dan total dasar.
- Menyediakan cart snapshot untuk checkout.

### Public Services

Entry point implementasi: `src/modules/cart/public/cart-service.ts`.
Untuk MVP, `actorContext` disederhanakan menjadi `customerId` (cart bersifat Customer-only).

- `getActiveCart(customerId)` — facade: `cartGetSnapshot`
- `getCartSnapshot(customerId)` — facade: `getCartSnapshotForCheckout` (kontrak Phase 5 / `checkout`)
- `getCartCustomerView(customerId)` — facade: `cartGetCustomerView` (DTO REST customer)
- `addItem(customerId, payload)` — facade: `cartAddItem`
- `removeItem(customerId, itemId)` — facade: `cartRemoveItem`
- `changeItemQuantity(customerId, itemId, qty)` — facade: `cartUpdateItemQuantity`
- `changeItemVariant(customerId, itemId, variantId)` — facade: `cartChangeItemVariant`
- `clearCart(customerId)` — facade: `cartClear`

Cross-module dependency (wajib via port di application; wiring ke public facade di `cart-service.ts`):

- `catalog` → `getVariantSnapshotForCart(variantId)`
- `inventory` → `inventoryAssertStockAvailable(variantId, qty)`

### Owned Entities

- `Cart`
- `CartItem`

### Aggregate Root

- `Cart`

### Business Invariants

- Cart item quantity minimal 1.
- Quantity item tidak boleh melebihi stock available saat validasi.
- Satu cart tidak boleh memiliki duplikasi variant pada item terpisah.
- Subtotal dan total cart tidak boleh negatif.

### Complexity

`Medium`

### Dependencies

- `catalog` (validasi variant/product status).
- `inventory` (cek availability).

### Events

- `cart.item_added`
- `cart.item_removed`
- `cart.item_quantity_changed`
- `cart.item_variant_changed`
- `cart.checked_out`

### Future Scope

- Persistent guest cart merge on login.
- Promo/coupon pre-check at cart level.

---

## 10. Checkout Module

### Purpose

Mengubah cart valid menjadi order draft siap pembayaran.

### Responsibilities

- Validasi prasyarat checkout.
- Validasi alamat customer.
- Mengambil shipping rate.
- Menentukan metode pembayaran.
- Membuat order draft terstandar untuk module `order`.

### Public Services

- `prepareCheckout(customerId)` — facade: `prepareCheckoutForCustomer` / `checkoutPrepare`
- `getShippingOptions(customerId, cartId, destination)` — facade: `getShippingOptionsForCustomer` / `checkoutGetShippingOptions` (destination dari alamat terpilih di session)
- `selectShippingOption(customerId, cartId, optionId)` — facade: `checkoutSelectShippingOption`
- `selectPaymentMethod(customerId, cartId, method)` — facade: `checkoutSelectPaymentMethod`
- `placeOrder(customerId, payload)` — facade: `placeOrderForCustomer` / `checkoutPlaceOrder` (M7.2: `CheckoutOrderPort` → `createOrderFromCheckout`)
- Tambahan M7.1: `checkoutSelectAddress(customerId, addressId)` untuk lifecycle `ADDRESS_CONFIRMED`

### Owned Entities

- `CheckoutSession`
- `CheckoutSnapshot`

### Aggregate Root

- `CheckoutSession`

### Business Invariants

- Checkout hanya valid jika cart memiliki minimal satu item.
- Customer wajib memiliki alamat pengiriman valid.
- Shipping option dan payment method wajib dipilih sebelum place order.
- Snapshot checkout immutable setelah order berhasil dibuat.

### Lifecycle

```text
Started
  │
  ▼
Address Confirmed
  │
  ▼
Shipping Selected
  │
  ▼
Payment Method Selected
  │
  ▼
Order Placed
```

### Complexity

`High`

### Dependencies

- `cart` (cart snapshot).
- `customer` (shipping address).
- `shipping` (rates/service option).
- `order` (create order draft).
- `payment` (payment channel availability metadata).

### Phase 5 note (Decision 027)

Hingga Phase 6, dependency `shipping` dan `payment` di-checkout diakses via **port adapter stub** di application layer `checkout` (opsi kurir & metode bayar tetap/mock). Kontrak public service checkout tetap sama; Phase 6 mengganti implementasi port ke provider nyata (Biteship / Midtrans metadata) tanpa mengubah flow customer `prepare → select → place-order`.

### Events

- `checkout.started`
- `checkout.shipping_selected`
- `checkout.payment_method_selected`
- `checkout.order_placed`

### Future Scope

- Voucher/promo engine integration.
- One-page checkout optimization.

---

## 11. Order Module

### Purpose

Menjadi source of truth lifecycle transaksi pembelian.

### Responsibilities

- Membuat order dari checkout snapshot.
- Menjaga state machine order status.
- Menyajikan order list/detail untuk customer/admin.
- Menangani cancelation policy.
- Menjadi anchor relasi payment dan shipping.

### Public Services

- `createOrderFromCheckout(payload)` — facade: `createOrderFromCheckout` / `orderCreateFromCheckout`
- `getOrder(orderId, actorContext)` — facade: `getOrder` / `orderGetDetail` (actor authorization di API layer M7.4)
- `listCustomerOrders(customerId, query)` — facade: `listCustomerOrders` / `orderListForCustomer`
- `listOrdersForAdmin(query)` — facade: `listOrdersForAdmin` / `orderListForAdmin`
- `transitionOrderStatus(orderId, nextStatus, reason?)` — facade: `transitionOrderStatusForActor` / `orderTransitionStatus`
- `cancelOrder(orderId, actorContext, reason)` — facade: `cancelOrderForActor` / `orderCancel` (release reserved stock)
- `markOrderPaid(orderId, paymentRef)` — Phase 6 (payment webhook)
- `attachShippingInfo(orderId, shipmentRef)` — Phase 6 (shipping)

### Owned Entities

- `Order`
- `OrderItem`
- `OrderTimeline`
- `OrderStatusTransition`

### Aggregate Root

- `Order`

### Business Invariants

- Order minimal memiliki satu item.
- Total order tidak boleh negatif.
- Currency seluruh item dalam satu order harus sama.
- Order `paid` tidak boleh kembali ke `pending` atau `waiting_payment`.
- Order `completed` tidak boleh diubah.
- Order `cancelled` tidak boleh diproses kembali.

### Lifecycle

```text
Pending
  │
  ▼
Waiting Payment
  │
  ├──► Cancelled
  │
  ▼
Paid
  │
  ▼
Processing
  │
  ▼
Shipped
  │
  ▼
Delivered
  │
  ▼
Completed
```

### Complexity

`High`

### Dependencies

- `checkout` (input source).
- `payment` (payment outcome).
- `shipping` (shipment state).
- `inventory` (reserve/commit/release orchestration).

### Events

- `order.created`
- `order.status_changed`
- `order.cancelled`
- `order.paid`
- `order.shipped`
- `order.completed`

### Future Scope

- Split shipment.
- Return/refund workflow.
- Order fraud/risk scoring.

---

## 12. Payment Module

### Purpose

Mengelola inisiasi transaksi pembayaran, status pembayaran, dan sinkronisasi callback gateway.

### Responsibilities

- Membuat payment transaction untuk order.
- Menyimpan payment instructions/reference.
- Memproses webhook/callback Midtrans dengan idempotent handling.
- Memetakan status gateway ke payment status internal.

### Public Services

- `initiatePayment(orderId, method)`
- `getPaymentStatus(orderId)`
- `handleGatewayCallback(payload, signature)`
- `expirePayment(paymentId)`
- `refundPayment(paymentId, reason)` (future-readiness)

### Owned Entities

- `PaymentTransaction`
- `PaymentAttempt`
- `PaymentWebhookLog`

### Aggregate Root

- `PaymentTransaction`

### Business Invariants

- Satu order hanya boleh memiliki satu payment transaction aktif.
- Nominal payment harus sama dengan total order saat inisiasi.
- Callback gateway harus diproses idempotent.
- Status `paid` bersifat final kecuali flow refund.
- Status `expired`/`failed` tidak boleh langsung menjadi `paid` tanpa transaksi baru yang valid.

### Lifecycle

```text
Pending
  │
  ├──► Paid
  ├──► Failed
  ├──► Expired
  └──► Refunded
```

### Complexity

`High`

### Dependencies

- `order` (target order dan status update).
- External payment adapter (Midtrans).

### External Providers

- Midtrans

### Events

- `payment.initiated`
- `payment.paid`
- `payment.failed`
- `payment.expired`
- `payment.refunded`

### Future Scope

- Multi-gateway routing.
- Manual transfer verification dashboard.
- Auto-reconciliation.

---

## 13. Shipping Module

### Purpose

Mengelola kalkulasi ongkir, shipment fulfillment, resi, dan tracking.

### Responsibilities

- Menyediakan shipping rates saat checkout.
- Menyimpan shipment setelah order paid.
- Menyimpan dan memperbarui tracking status.
- Menampilkan tracking history ke customer/admin.

### Public Services

- `getShippingRates(origin, destination, items)`
- `createShipment(orderId, payload)`
- `assignTrackingNumber(orderId, trackingNumber, courier)`
- `syncTrackingStatus(shipmentId)`
- `getShipmentByOrder(orderId)`

### Owned Entities

- `Shipment`
- `ShipmentRateQuote`
- `ShipmentTrackingEvent`

### Aggregate Root

- `Shipment`

### Business Invariants

- Shipment hanya boleh dibuat untuk order berstatus `paid` atau setelahnya.
- Tracking number harus unik pada provider yang sama.
- Status shipment tidak boleh mundur (misal `in_transit` ke `waiting`).
- Event tracking harus bersifat append-only untuk audit trail.

### Lifecycle

```text
Waiting
  │
  ▼
Packed
  │
  ▼
Picked Up
  │
  ▼
In Transit
  │
  ▼
Delivered
```

### Complexity

`High`

### Dependencies

- `order` (shipment linked order).
- External shipping adapter (Biteship).

### External Providers

- Biteship

### Events

- `shipping.rate_quoted`
- `shipping.shipment_created`
- `shipping.tracking_number_assigned`
- `shipping.status_updated`
- `shipping.delivered`

### Future Scope

- Multi-courier smart selection.
- Scheduled pickup workflow.
- Shipping SLA analytics.

---

## 14. Review Module

### Purpose

Mengelola rating dan ulasan produk dari customer yang sudah membeli.

### Responsibilities

- Menambahkan review untuk produk yang memenuhi syarat.
- Moderasi review (hide/show) oleh admin.
- Menyajikan review list dan aggregate rating untuk katalog/detail produk.

### Public Services

- `createReview(customerId, payload)`
- `updateReview(customerId, reviewId, payload)`
- `hideReview(reviewId, adminContext)`
- `listProductReviews(productId, query)`
- `getProductRatingSummary(productId)`
- `canCustomerReviewProduct(customerId, productId)`

### Owned Entities

- `Review`
- `ReviewRatingSummary`
- `ReviewModerationLog`

### Aggregate Root

- `Review`

### Business Invariants

- Review hanya boleh dibuat oleh customer yang pernah membeli produk.
- Satu customer hanya boleh memiliki satu review aktif per order item.
- Rating berada pada rentang yang valid (misal 1-5).
- Review yang di-hide admin tidak tampil di kanal publik.

### Complexity

`Medium`

### Dependencies

- `order` (purchase verification).
- `catalog` (product reference).

### Events

- `review.created`
- `review.updated`
- `review.hidden`
- `review.published`

### Future Scope

- Photo/video review.
- Verified buyer badge detail.
- Abuse/spam detection.

---

## 15. Homepage Module

### Purpose

Mengelola konten dan komposisi halaman utama sebagai brand hub.

### Responsibilities

- Mengelola hero/banner.
- Mengelola featured products, best seller, new arrival.
- Mengatur urutan section.
- Menjadwalkan tampil/sembunyi konten.

### Public Services

- `getHomepageComposition(channel)`
- `updateHeroSection(payload)`
- `upsertBanner(payload)`
- `setFeaturedProducts(productIds)`
- `setBestSellerProducts(productIds)`
- `setNewArrivalProducts(productIds)`
- `reorderHomepageSections(payload)`
- `scheduleSectionVisibility(sectionId, schedule)`

### Owned Entities

- `HomepageSection`
- `HomepageBanner`
- `HomepageFeatureSlot`
- `HomepageSchedule`

### Aggregate Root

- `HomepageSection` (composition root)
- `HomepageBanner` (campaign root untuk slot banner)

### Business Invariants

- Section order harus unik dalam satu composition.
- Product yang ditampilkan wajib berstatus publik/aktif.
- Schedule aktif tidak boleh overlap pada slot yang sama.
- Section yang mandatory untuk homepage tidak boleh dinonaktifkan bersamaan.

### Complexity

`Low`

### Dependencies

- `catalog` (product reference and product availability).

### External Providers

- Cloudflare R2 atau Supabase Storage (media assets)

### Events

- `homepage.hero_updated`
- `homepage.banner_updated`
- `homepage.section_reordered`
- `homepage.featured_products_updated`
- `homepage.section_visibility_scheduled`

### Future Scope

- Campaign landing composition.
- Personalization by segment.
- A/B testing integration.

---

## 16. Module Communication Rules

Aturan komunikasi lintas module:

1. Wajib lewat `public service/facade` module tujuan.
2. Dilarang mengakses repository/module internal secara langsung.
3. Dilarang melakukan query langsung ke tabel module lain.
4. DTO lintas module harus minimal dan stabil (hindari leaking internal entity).
5. Workflow lintas banyak module harus diorkestrasi di application layer module pemilik use case.
6. Integrasi eksternal hanya boleh dilakukan di infrastructure adapter module yang relevan.

Pattern wajib:

`Presentation -> Application Service -> Domain -> Repository/Adapter`

Inter-module:

`Module A Application Service -> Module B Public Service`

---

## 17. Module Ownership Rules

Prinsip ownership data:

- Setiap aggregate memiliki single owner module.
- Hanya owner module yang boleh membuat/mengubah aggregate tersebut.
- Module lain hanya boleh membaca atau meminta perubahan via public service owner.

Ringkasan ownership:

- `auth`: identity, credential, session, role assignment.
- `customer`: profile, address, preference.
- `catalog`: product, category, variant, media, SEO.
- `inventory`: stock, reservation, movement.
- `cart`: cart, cart item.
- `checkout`: checkout session/snapshot.
- `order`: order, order item, order timeline.
- `payment`: payment transaction, webhook log.
- `shipping`: shipment, tracking events.
- `review`: review dan moderation.
- `homepage`: homepage sections dan campaign slots.

---

## 18. Future Modules

Module yang belum masuk MVP tetapi sudah teridentifikasi:

- `search` (dapat dipisah dari `catalog` saat kebutuhan ranking/indexing meningkat).
- `notification` (email/wa/push orchestration terpusat).
- `reporting` (aggregated read model untuk dashboard/report).
- `promotion` (voucher, discount, campaign rules).
- `marketplace-sync` (sinkronisasi produk, stok, order ke channel eksternal).
- `cms/blog` (brand storytelling dan SEO content).

Strategi penambahan:

1. Mulai sebagai sub-capability di module terdekat saat scope kecil.
2. Ekstrak jadi module mandiri jika rule dan lifecycle sudah kompleks.
3. Tetap patuhi dependency dan ownership rules yang sama.

---

## 19. Module Complexity Matrix

Metrik kompleksitas ini digunakan untuk memberi sinyal area yang perlu kehati-hatian ekstra saat implementasi, testing, dan code review.

| Module | Complexity | Alasan Utama |
|---|---|---|
| Auth | Medium | Security, session, role authorization |
| Customer | Medium | Data profil/alamat dan privacy concern |
| Catalog | High | Product modeling, variant, status, search/filter |
| Inventory | High | Konsistensi stok, reservation, commit/release |
| Cart | Medium | Validasi stok dinamis dan kalkulasi |
| Checkout | High | Orkestrasi lintas module dan validasi final |
| Order | High | State machine inti transaksi |
| Payment | High | Gateway callback, idempotency, financial integrity |
| Shipping | High | Tracking lifecycle dan integrasi provider |
| Review | Medium | Purchase verification + moderation |
| Homepage | Low | Content composition dengan rule sederhana |