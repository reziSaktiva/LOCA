# Data Model Specification

Dokumen ini mendefinisikan model data **berbasis domain bisnis**, bukan model teknis ORM.
Tujuan utamanya adalah memastikan struktur data benar-benar merepresentasikan alur bisnis e-commerce:

`browse -> cart -> checkout -> payment -> shipping -> review`

## 1. Modeling Principles

Prinsip pemodelan data:

1. **Business-first**
   - Struktur mengikuti kebutuhan bisnis dan lifecycle domain, bukan struktur framework/database.
2. **Module ownership**
   - Setiap entitas memiliki module owner tunggal.
   - Perubahan data hanya boleh dilakukan oleh owner module.
3. **Aggregate consistency**
   - Aturan konsistensi dijaga di dalam aggregate root.
4. **Explicit lifecycle**
   - Entitas penting harus punya status/lifecycle yang jelas.
5. **Append-only history untuk data kritikal**
   - Riwayat status order, tracking, dan inventory movement bersifat append-only.
6. **Snapshot for financial integrity**
   - Harga dan metadata penting disalin ke snapshot pada saat checkout/order agar tidak berubah ketika katalog berubah.
   - Snapshot ini menjadi sumber tampilan historis untuk invoice, email, dan order history.
7. **Future-ready**
   - Struktur siap berkembang ke marketplace sync, bundle, dan return/refund tanpa redesign besar.

---

## 2. Naming Convention

Konvensi nama:

- Entity: `PascalCase` (contoh: `ProductVariant`, `OrderStatusHistory`)
- Field: `camelCase` (contoh: `createdAt`, `defaultAddressId`)
- Enum: `UPPER_SNAKE_CASE` untuk value status
- Event: `snake_case` dengan namespace module (contoh: `order.status_changed`)
- ID: `entityNameId` (contoh: `productId`, `orderItemId`)

Aturan relasi:

- Child entity dalam aggregate menggunakan `parentId`.
- Cross-module reference hanya menyimpan foreign reference dan snapshot yang diperlukan bisnis, bukan menyalin seluruh entity owner module lain.

---

## 3. Base Entities & Value Objects

Komponen dasar lintas module:

- `EntityId`
  - Identifier unik per entity.
- `Money`
  - `{ amount, currency }`
  - Wajib dipakai untuk field nilai uang (price, subtotal, total, shippingFee).
- `AddressSnapshot`
  - Snapshot alamat pengiriman saat checkout/order.
- `ActorContext`
  - Informasi aktor (`customer`, `admin`, `system`) untuk audit.
- `AuditStamp`
  - `{ createdAt, createdBy, updatedAt, updatedBy }`
- `SoftDeleteStamp` (opsional per entity)
  - `{ isDeleted, deletedAt, deletedBy, deleteReason }`

### 3.1 Currency Policy

Business rule currency untuk fase MVP:

1. Seluruh transaksi menggunakan `IDR`.
2. Semua nilai `Money` pada cart, checkout, order, payment, shipping fee, dan refund menggunakan `currency = IDR`.
3. Field `currency` tetap wajib disimpan pada value object `Money` untuk kesiapan multi-currency di fase berikutnya.
4. Sistem tidak mengizinkan mixed-currency dalam satu transaksi/order.
5. Jika di masa depan multi-currency diaktifkan, perubahan dilakukan pada layer policy dan pricing, bukan mengganti struktur `Money`.

---

## 4. Module Data Ownership

Ringkasan ownership data:

- `auth`: `AuthIdentity`, `AuthCredential`, `AuthSession`, `AuthRoleAssignment`, `PasswordResetToken`
- `customer`: `CustomerProfile`, `CustomerAddress`, `CustomerPreference`
- `catalog`: `ProductCategory`, `Product`, `ProductVariant`, `VariantOption`, `VariantValue`, `ProductMedia`, `ProductSeo`
- `inventory`: `InventoryItem`, `InventoryReservation`, `InventoryMovement`
- `cart`: `Cart`, `CartItem`
- `checkout`: `CheckoutSession`, `CheckoutSnapshot`
- `order`: `Order`, `OrderItem`, `OrderStatusHistory`
- `payment`: `PaymentTransaction`, `PaymentAttempt`, `PaymentWebhookLog`
- `shipping`: `Shipment`, `ShipmentRateQuote`, `ShipmentTrackingEvent`
- `review`: `Review`, `ReviewRatingSummary`, `ReviewModerationLog`
- `homepage`: `HomepageSection`, `HomepageBanner`, `HomepageFeatureSlot`, `HomepageSchedule`

---

## 5. Entity Relationship Overview

Relasi bisnis utama:

1. `CustomerProfile` memiliki banyak `CustomerAddress`.
2. `Product` berada dalam satu `ProductCategory`.
3. `Product` memiliki banyak `ProductVariant`.
4. `Product` memiliki banyak `VariantOption` (contoh: warna, ukuran).
5. `ProductVariant` memiliki banyak `VariantValue` (kombinasi nilai option per variant).
6. `ProductVariant` memiliki satu `InventoryItem`.
7. `Cart` memiliki banyak `CartItem` yang mereferensikan `ProductVariant`.
8. `CheckoutSession` mengambil snapshot dari `Cart`, alamat, shipping option, dan payment method.
9. `Order` memiliki banyak `OrderItem` dan banyak `OrderStatusHistory`.
10. `Order` memiliki relasi 1-1 aktif ke `PaymentTransaction`.
11. `Order` memiliki relasi 1-1 ke `Shipment` (MVP, split shipment future).
12. `Review` valid jika customer memiliki `OrderItem` yang sesuai.
13. `HomepageFeatureSlot` mereferensikan `Product` yang status-nya publik.

---

## 6. Entity Definitions

### 6.1 Auth

- `AuthIdentity` (aggregate root)
  - Mewakili identitas user.
  - Key fields: `email`, `identityStatus`.
- `AuthCredential`
  - Menyimpan data autentikasi (hash password/provider identity).
- `AuthSession`
  - Session aktif user, termasuk expiry/revocation.
- `AuthRoleAssignment`
  - Relasi role ke identity.
- `PasswordResetToken`
  - Token sekali pakai dengan masa berlaku.

### 6.2 Customer

- `CustomerProfile` (aggregate root)
  - Profil customer dan binding ke `AuthIdentity`.
  - Key fields: `displayName`, `phone`, `avatarUrl`.
- `CustomerAddress`
  - Alamat pengiriman customer.
  - Key fields: `recipientName`, `phone`, `street`, `district`, `city`, `province`, `postalCode`, `isDefault`.
- `CustomerPreference`
  - Preferensi non-kritikal (future personalization).

### 6.3 Catalog

- `ProductCategory`
  - Kategori produk (socks, boxer, shorts, dsb).
  - Key fields: `name`, `slug`, `isActive`.
- `Product` (aggregate root)
  - Entitas produk utama untuk katalog publik.
  - Key fields: `name`, `slug`, `brand`, `description`, `productStatus`, `categoryId`.
- `ProductVariant`
  - Unit jual nyata dengan SKU dan harga.
  - Key fields: `productId`, `sku`, `price`, `compareAtPrice`, `variantStatus`.
- `VariantOption`
  - Definisi dimensi varian pada level product.
  - Contoh: `color`, `size`, `model`.
  - Key fields: `productId`, `optionCode`, `optionName`, `displayOrder`.
- `VariantValue`
  - Nilai option yang dipakai oleh varian tertentu.
  - Contoh: `color=black`, `size=L`.
  - Key fields: `variantId`, `optionId`, `valueCode`, `valueLabel`.
- `ProductMedia`
  - Media katalog lintas owner (product atau variant).
  - Dapat dipakai untuk product image, variant image, video, 360 asset, dan manual PDF tanpa redesign entity.
  - Key fields: `ownerType`, `ownerId`, `mediaType`, `url`, `altText`, `sortOrder`.
- `ProductSeo`
  - Metadata SEO untuk halaman detail produk.
  - Key fields: `metaTitle`, `metaDescription`, `canonicalUrl`.

### 6.4 Inventory

- `InventoryItem` (aggregate root)
  - Stok per `ProductVariant`.
  - Key fields: `variantId`, `onHandQty`, `reservedQty`, `availableQty`.
- `InventoryReservation`
  - Reservasi stok saat order dibuat/menunggu pembayaran.
  - Key fields: `orderId`, `variantId`, `qty`, `reservationStatus`, `expiresAt`.
- `InventoryMovement`
  - Audit trail perubahan stok (stock in, stock out, adjustment, reserve, release, commit).
  - Key fields: `variantId`, `movementType`, `qtyDelta`, `reason`, `referenceType`, `referenceId`.

Stock policy (MVP):

- Formula utama: `availableQty = onHandQty - reservedQty`
- Invariant:
  - `onHandQty >= 0`
  - `reservedQty >= 0`
  - `availableQty >= 0`
  - `reservedQty <= onHandQty`
- `availableQty` adalah nilai turunan dari `onHandQty` dan `reservedQty` (harus konsisten setiap perubahan stok/reservasi).

### 6.5 Cart

- `Cart` (aggregate root)
  - Keranjang aktif milik visitor/customer.
  - Key fields: `actorType`, `actorId`, `cartStatus`, `currency`.
- `CartItem`
  - Item keranjang.
  - Key fields: `cartId`, `variantId`, `quantity`, `unitPriceSnapshot`, `lineSubtotal`.

### 6.6 Checkout

- `CheckoutSession` (aggregate root)
  - Proses checkout dari cart hingga order placement.
  - Key fields: `customerId`, `cartId`, `checkoutStatus`, `selectedAddressId`, `selectedShippingOptionId`, `selectedPaymentMethod`.
- `CheckoutSnapshot`
  - Snapshot final sebelum create order.
  - Key fields: `itemsSnapshot`, `pricingSnapshot`, `addressSnapshot`, `shippingSnapshot`, `paymentSnapshot`.

### 6.7 Order

- `Order` (aggregate root)
  - Source of truth transaksi pembelian.
  - Key fields: `orderNumber`, `customerId`, `orderStatus`, `subtotal`, `shippingFee`, `discountTotal`, `grandTotal`, `currency`.
- `OrderItem`
  - Item transaksi sebagai snapshot immutable saat order dibuat.
  - Key fields: `orderId`, `variantId`, `productNameSnapshot`, `skuSnapshot`, `variantLabelSnapshot`, `thumbnailSnapshot`, `categorySnapshot`, `brandSnapshot`, `unitPriceSnapshot`, `quantity`, `lineTotal`.
- `OrderStatusHistory`
  - Riwayat perubahan status order (append-only).
  - Key fields: `orderId`, `fromStatus`, `toStatus`, `changedAt`, `changedBy`, `reason`.

### 6.8 Payment

- `PaymentTransaction` (aggregate root)
  - Transaksi pembayaran untuk order.
  - Key fields: `orderId`, `paymentMethod`, `paymentStatus`, `amount`, `provider`, `providerReference`, `paidAt`, `expiredAt`.
- `PaymentAttempt`
  - Upaya pembayaran (redirect/retry/manual attempt).
  - Key fields: `paymentTransactionId`, `attemptNo`, `attemptStatus`, `requestedAt`, `responseCode`.
- `PaymentWebhookLog`
  - Log webhook/callback untuk idempotency dan audit.
  - Key fields: `provider`, `eventType`, `eventId`, `payloadHash`, `processedAt`, `processingResult`.

### 6.9 Shipping

- `Shipment` (aggregate root)
  - Data pengiriman utama untuk order.
  - Key fields: `orderId`, `shippingProvider`, `serviceCode`, `shipmentStatus`, `trackingNumber`, `shippedAt`, `deliveredAt`.
- `ShipmentRateQuote`
  - Penawaran ongkir saat checkout.
  - Key fields: `checkoutSessionId`, `provider`, `serviceCode`, `serviceName`, `estimatedDays`, `shippingFee`.
- `ShipmentTrackingEvent`
  - Riwayat tracking (append-only).
  - Key fields: `shipmentId`, `trackingStatus`, `eventTime`, `location`, `description`.

### 6.10 Review

- `Review` (aggregate root)
  - Ulasan customer terhadap produk/varian yang dibeli.
  - Key fields: `customerId`, `productId`, `variantId`, `orderItemId`, `rating`, `reviewText`, `reviewStatus`.
  - Catatan scope:
    - Review dapat ditulis pada level varian untuk membedakan pengalaman antar varian (contoh: warna hitam vs warna putih).
    - `variantId` harus konsisten dengan `orderItemId` yang direview.
- `ReviewRatingSummary`
  - Ringkasan agregat rating per produk.
  - Key fields: `productId`, `averageRating`, `totalReviews`, `ratingBreakdown`.
- `ReviewModerationLog`
  - Audit moderasi review oleh admin.
  - Key fields: `reviewId`, `action`, `reason`, `moderatedBy`, `moderatedAt`.

### 6.11 Homepage

- `HomepageSection` (aggregate root)
  - Komposisi section homepage.
  - Key fields: `sectionCode`, `title`, `isVisible`, `displayOrder`, `sectionType`.
- `HomepageBanner` (aggregate root campaign)
  - Hero/banner campaign.
  - Key fields: `bannerType`, `mediaUrl`, `ctaLabel`, `ctaLink`, `isActive`.
- `HomepageFeatureSlot`
  - Slot daftar produk pada section tertentu (featured, best seller, new arrival).
  - Key fields: `sectionId`, `productId`, `slotOrder`.
- `HomepageSchedule`
  - Jadwal tampil/sembunyi section/banner.
  - Key fields: `targetType`, `targetId`, `startAt`, `endAt`, `scheduleStatus`.

---

## 7. Aggregate Boundaries

Batas aggregate utama:

- `AuthIdentity` memayungi credential/session/role.
- `CustomerProfile` memayungi address/preference.
- `Product` memayungi variant/option/value/media/seo.
- `InventoryItem` memayungi reservation/movement terkait stok varian.
- `Cart` memayungi cart item.
- `CheckoutSession` memayungi checkout snapshot.
- `Order` memayungi order item + order status history.
- `PaymentTransaction` memayungi payment attempt + webhook process record.
- `Shipment` memayungi tracking event.
- `Review` memayungi moderation state review.

Aturan penting:

- Konsistensi wajib dijaga di dalam aggregate masing-masing.
- Cross-aggregate update dilakukan via application service orchestration dan domain events.

---

## 8. Domain Events

Contoh event penting lintas module:

- Catalog
  - `catalog.product_created`
  - `catalog.product_status_changed`
  - `catalog.variant_updated`
- Cart / Checkout
  - `cart.item_added`
  - `checkout.order_placed`
- Order
  - `order.created`
  - `order.status_changed`
  - `order.cancelled`
- Payment
  - `payment.initiated`
  - `payment.paid`
  - `payment.failed`
  - `payment.expired`
- Inventory
  - `inventory.stock_reserved`
  - `inventory.stock_committed`
  - `inventory.stock_released`
- Shipping
  - `shipping.shipment_created`
  - `shipping.status_updated`
  - `shipping.delivered`
- Review
  - `review.created`
  - `review.hidden`

Event payload minimum:

- `eventId`
- `eventName`
- `occurredAt`
- `actorType`
- `actorId`
- `aggregateType`
- `aggregateId`
- `data` (payload domain)

---

## 9. Enumerations

Enum utama domain:

- `ProductStatus`
  - `DRAFT`, `ACTIVE`, `OUT_OF_STOCK`, `ARCHIVED`
- `VariantStatus`
  - `ACTIVE`, `INACTIVE`
- `CartStatus`
  - `ACTIVE`, `CHECKED_OUT`, `ABANDONED`
- `CheckoutStatus`
  - `STARTED`, `ADDRESS_CONFIRMED`, `SHIPPING_SELECTED`, `PAYMENT_METHOD_SELECTED`, `ORDER_PLACED`, `EXPIRED`
- `OrderStatus`
  - `PENDING`, `WAITING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`
- `PaymentStatus`
  - `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `REFUNDED`
- `ShipmentStatus`
  - `WAITING`, `PACKED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`
- `ReviewStatus`
  - `PUBLISHED`, `HIDDEN`, `REPORTED`
- `InventoryMovementType`
  - `STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `RESERVE`, `RELEASE`, `COMMIT`
- `MediaOwnerType`
  - `PRODUCT`, `VARIANT`
- `ProductMediaType`
  - `IMAGE`, `VIDEO`, `THREE_SIXTY`, `MANUAL_PDF`
- `CurrencyCode`
  - MVP: `IDR` (single currency)

### 9.1 Order Lifecycle & Allowed Transition

Status lifecycle order (happy path):

`PENDING -> WAITING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED`

Cancel path:

`PENDING -> CANCELLED`

Allowed transition untuk `OrderStatus`:

- `PENDING` -> `WAITING_PAYMENT`, `CANCELLED`
- `WAITING_PAYMENT` -> `PAID`, `CANCELLED`
- `PAID` -> `PROCESSING`
- `PROCESSING` -> `SHIPPED`
- `SHIPPED` -> `DELIVERED`
- `DELIVERED` -> `COMPLETED`
- `COMPLETED` -> (final, tidak boleh transisi)
- `CANCELLED` -> (final, tidak boleh transisi)

Aturan implementasi:

- Setiap transisi status wajib menulis `OrderStatusHistory` (append-only).
- Transisi di luar daftar di atas harus ditolak oleh `Order Service`.
- Status final (`COMPLETED`, `CANCELLED`) tidak boleh berubah kembali.

---

## 10. Audit Fields

Audit wajib untuk seluruh entity operasional:

- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

Audit tambahan untuk entity kritikal:

- `version` (optimistic concurrency candidate)
- `changeReason` (khusus perubahan status/adjustment/moderasi)

Catatan:

- Untuk `OrderStatusHistory`, `InventoryMovement`, `ShipmentTrackingEvent`, dan `PaymentWebhookLog`, data bersifat append-only.

---

## 11. Soft Delete Strategy

Strategi penghapusan:

1. **Soft delete default** untuk master data:
   - `Product`, `ProductVariant`, `ProductCategory`, `CustomerAddress`, `HomepageSection`, dll.
2. **Hard delete dilarang** untuk data finansial dan audit:
   - `Order`, `OrderItem`, `PaymentTransaction`, `PaymentWebhookLog`, `InventoryMovement`, `OrderStatusHistory`, `ShipmentTrackingEvent`.
3. **Archive over delete** untuk data yang tidak aktif:
   - produk gunakan status `ARCHIVED`, bukan hapus permanen.

Field soft delete:

- `isDeleted`
- `deletedAt`
- `deletedBy`
- `deleteReason`

---

## 12. Indexing Strategy (Business Access Pattern)

Index dirancang dari pola akses bisnis:

1. **Lookup identity**
   - `AuthIdentity.email` unik.
   - `Product.slug` unik.
   - `ProductVariant.sku` unik.
   - `Order.orderNumber` unik.
2. **Operational list**
   - Order by `customerId + createdAt`.
   - Admin order queue by `orderStatus + createdAt`.
   - Product listing by `productStatus + categoryId + createdAt`.
3. **Tracking & audit**
   - `OrderStatusHistory.orderId + changedAt`.
   - `ShipmentTrackingEvent.shipmentId + eventTime`.
   - `InventoryMovement.variantId + createdAt`.
4. **Payment idempotency**
   - unik untuk `provider + eventId` pada webhook log.

---

## 13. ID Strategy

Prinsip ID:

- Setiap entity menggunakan ID stabil, opaque, non-sequential publik.
- `orderNumber` dipisah dari `orderId`:
  - `orderId` untuk sistem internal.
  - `orderNumber` untuk customer/admin communication.
- Snapshot entity tetap menyimpan `id` referensi + data tampilan saat transaksi.

Rekomendasi format (dapat diputuskan di tahap teknis):

- ID internal: ULID/UUID.
- Nomor bisnis:
  - `ORD-YYYYMM-XXXX`
  - `PAY-YYYYMM-XXXX`

---

## 14. Transaction Boundaries

Boundary transaksi penting:

1. **Place order**
   - Validasi cart, validasi alamat, lock snapshot checkout, create order + order items + initial status history.
2. **Payment confirmation**
   - Idempotent callback, update payment status, transition order status, commit inventory reservation.
3. **Order cancelation**
   - Transition order status ke `CANCELLED`, release reservation inventory.
4. **Shipping update**
   - Update shipment status + append tracking event + sinkronisasi order status bila relevan.
5. **Inventory adjustment**
   - Update current stock + append inventory movement dalam satu transaksi.

Aturan:

- Tidak ada partial update untuk proses finansial/stok.
- Jika lintas module, orkestrasi dilakukan oleh application service pemilik use case.

---

## 15. Data Retention Policy

Kebijakan retensi data:

1. **Permanent retention (audit/financial)**
   - Order, payment, inventory movement, shipment tracking, status history.
2. **Long retention**
   - Customer profile & address (dengan kebijakan privasi dan anonimisasi bila diperlukan).
3. **Configurable retention**
   - Session, password reset token, checkout session, cart abandoned.
4. **Aggregated retention**
   - Review rating summary dan analytic rollup dapat disimpan jangka panjang dalam bentuk agregat.

Prinsip:

- Data penting untuk legal, audit, dan rekonsiliasi tidak boleh hilang.
- Data sensitif mengikuti kebijakan keamanan dan privasi.

---

## 16. Read Models (Projection Layer)

Seluruh entitas pada dokumen ini adalah **write model** (source of truth transaksi dan rule bisnis).

Untuk kebutuhan query, UI, dan analytics ringan, sistem juga perlu menyiapkan **read model** sebagai projection:

- Tidak menjadi owner rule bisnis.
- Tidak menjadi sumber mutasi transaksi.
- Dapat diimplementasikan sebagai SQL view, materialized view, search index, cache object, atau read table terpisah.
- Boleh bersifat denormalized untuk kecepatan baca.

### 16.1 Read Model Principles

1. **Read-optimized**
   - Bentuk data mengikuti kebutuhan layar/query, bukan bentuk aggregate write model.
2. **Eventually consistent**
   - Read model boleh memiliki delay sinkronisasi selama masih memenuhi kebutuhan UX/operasional.
3. **Disposable & rebuildable**
   - Read model harus bisa di-regenerate dari write model/events.
4. **No business mutation**
   - Perubahan status transaksi tetap harus melalui write model.

### 16.2 Candidate Read Models

#### Catalog / Homepage

- `ProductCardView`
  - Untuk kartu produk di listing/homepage.
  - Field contoh: `productId`, `slug`, `productName`, `primaryImageUrl`, `priceFrom`, `priceTo`, `isInStock`, `averageRating`, `reviewCount`.
- `ProductListingCard`
  - Optimasi untuk halaman katalog dengan sorting/filter/pagination.
  - Field contoh: `productId`, `categorySlug`, `tags`, `priceRange`, `stockBadge`, `createdAt`.
- `HomepageProductCard`
  - Representasi ringkas produk untuk komposisi section homepage.
- `HomepageFeaturedView`
  - Read model untuk section featured pada homepage.
  - Field contoh: `sectionCode`, `displayOrder`, `productCards[]`.
- `BestSellerView`
  - Menyediakan daftar produk best seller dalam periode tertentu.
  - Field contoh: `productId`, `salesQty`, `salesRank`, `periodStart`, `periodEnd`.

#### Customer

- `CustomerOrderSummary`
  - Ringkasan order list pada halaman account customer.
  - Field contoh: `orderId`, `orderNumber`, `orderDate`, `orderStatus`, `itemCount`, `grandTotal`, `lastTrackingStatus`.

#### Admin / Dashboard

- `DashboardSummary`
  - KPI utama dashboard admin.
  - Field contoh: `totalOrdersToday`, `grossSalesToday`, `pendingOrders`, `lowStockCount`.
- `DashboardStatistics`
  - Statistik periodik untuk chart/card dashboard.
  - Field contoh: `period`, `ordersCount`, `salesAmount`, `newCustomers`.

#### Search

- `ProductSearchDocument`
  - Dokumen pencarian (untuk full text / search engine).
  - Field contoh: `productId`, `title`, `category`, `keywords`, `price`, `rating`, `isActive`.
- `SearchResult`
  - Projection hasil pencarian siap render.
  - Field contoh: `query`, `totalHits`, `items[]`, `facets`, `appliedFilters`.

### 16.3 Initial Source Mapping

Contoh mapping sumber data ke read model:

- `ProductCardView` <- `Product`, `ProductVariant`, `InventoryItem`, `ReviewRatingSummary`
- `HomepageFeaturedView` <- `HomepageFeatureSlot`, `HomepageSection`, `ProductCardView`
- `BestSellerView` <- agregasi `OrderItem` + status order valid
- `CustomerOrderSummary` <- `Order`, `OrderItem`, `Shipment`
- `DashboardSummary` <- agregasi `Order`, `PaymentTransaction`, `InventoryItem`
- `ProductSearchDocument` <- `Product`, `ProductVariant`, `ProductCategory`, `ReviewRatingSummary`

### 16.4 Freshness & Consistency Policy

Kebijakan awal sinkronisasi read model:

- Homepage/catalog card: near real-time atau event-driven refresh.
- Dashboard KPI: periodik (misal per 1-5 menit) boleh.
- Search document: asynchronous reindex.
- Customer order summary: near real-time setelah event order/payment/shipping.

---

## 17. Future Data Model Evolution

Arah evolusi model data setelah MVP:

1. **Catalog**
   - Bundle/kit product.
   - Multi-channel catalog mapping (`website`, `shopee`, `tiktok`).
2. **Inventory**
   - Multi-warehouse + location-level stock.
3. **Order & fulfillment**
   - Split shipment.
   - Return/refund workflow.
4. **Promotion**
   - Voucher, coupon, campaign pricing, rule engine.
5. **Customer**
   - Wishlist, loyalty, segment, personalization.
6. **Marketplace sync**
   - Entitas sinkronisasi produk, stok, dan order lintas channel.

Prinsip evolusi:

- Tambahkan entity baru saat rule/lifecycle memang berbeda.
- Hindari membuat satu entity terlalu gemuk untuk banyak konteks bisnis.
- Validasi perubahan terhadap module ownership dan aggregate boundary yang sudah disepakati.