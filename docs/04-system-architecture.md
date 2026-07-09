# System Architecture

## 1. Architecture Overview

Arsitektur aplikasi ini menggunakan pendekatan **modular monolith**.
Keputusan ini dipilih karena:

1. Proyek saat ini dikerjakan oleh satu developer, sehingga arsitektur perlu sederhana untuk dioperasikan.
2. Fokus utama adalah pengembangan MVP, jadi kecepatan delivery lebih penting daripada kompleksitas infrastruktur.
3. Struktur modular tetap menjaga codebase mudah dikembangkan, diuji, dan dipelihara seiring bertambahnya fitur.
4. Batas modul yang jelas membuat sistem siap dipisahkan menjadi microservices di masa depan bila benar-benar dibutuhkan.

## 2. Architectural Principles

Prinsip utama arsitektur:

1. **Business-first modules**: struktur sistem mengikuti domain bisnis (Auth, Catalog, Cart, Order, dan lain-lain), bukan mengikuti layer teknis murni.
2. **Separation of concerns**: UI hanya menangani presentasi dan interaksi; business logic berada di module domain.
3. **Clear boundaries**: setiap module memiliki tanggung jawab, kontrak, dan data access sendiri.
4. **Dependency inversion**: domain tidak bergantung langsung pada framework atau provider eksternal.
5. **Incremental delivery**: desain memprioritaskan kebutuhan MVP tanpa mengunci opsi scale di masa depan.
6. **Testable by design**: use case dan service dibuat mudah diuji secara unit maupun integrasi.

## 3. High Level Architecture

Sistem dijalankan sebagai satu aplikasi Next.js (single deployable unit) dengan pola modular monolith:

- **Frontend Web (Customer + Visitor)**: landing page, katalog, product detail, cart, checkout, account, tracking.
- **Admin Interface**: dashboard untuk manajemen produk, order, inventory, konten homepage, dan laporan.
- **Application Modules**: modul bisnis independen dalam satu codebase.
- **Shared Infrastructure**: database PostgreSQL, object storage, payment gateway, shipping gateway, email service, analytics.

Selain perspektif komponen sistem di atas, arsitektur juga dilihat dari perspektif actor flow:

### Actor Flow (Customer)

`Customer -> Browser -> Next.js (Web Layer) -> Modules -> Database / External Services`

Contoh external services: Midtrans (payment), Biteship (shipping), Resend (email), PostHog (analytics), object storage.

### Actor Flow (Admin)

`Admin -> Dashboard (Next.js Admin Layer) -> Modules -> Database / External Services`

### Actor Flow (Visitor)

`Visitor -> Browser -> Next.js (Public Pages) -> Catalog/Homepage Modules -> Database`

Alur data internal utama:

`Client -> Route Handler / Server Action -> Application Service -> Domain Service -> Repository -> PostgreSQL`

Catatan: diagram visual high-level architecture akan dibuat pada fase dokumentasi berikutnya agar actor flow dan komponen flow terlihat lebih jelas.

## 4. Layer Architecture

Setiap module mengikuti layer berikut:

1. **Presentation Layer**
   - Next.js App Router (`page`, `layout`, route handler, server action).
   - Validasi input awal, auth guard, mapping request/response.

2. **Application Layer**
   - Use case orchestration (contoh: create order, confirm payment, update stock).
   - Menjalankan aturan workflow lintas entitas.

3. **Domain Layer**
   - Entity, value object, domain rule, domain service.
   - Tidak mengetahui detail framework, database, atau provider pihak ketiga.

4. **Infrastructure Layer**
   - Implementasi detail teknis: repository, external adapter, persistence, storage, messaging.
   - Contoh external adapter: Midtrans, Biteship, Resend, PostHog.
   - Translasi domain contract ke implementasi teknis.

Aturan penting: business logic tidak boleh berada di komponen UI atau route handler.

## 5. Module Architecture

Module inti MVP:

- `auth`: registrasi, login, session, role, permission.
- `customer`: profil, alamat, histori pembelian.
- `catalog`: produk, kategori, detail produk, pencarian.
- `inventory`: stok, movement, sinkronisasi stok per varian.
- `cart`: item keranjang, quantity, kalkulasi subtotal.
- `checkout`: validasi alamat, kurir, payment method, order draft.
- `order`: lifecycle pesanan dari pending sampai completed/cancelled.
- `payment`: inisiasi, verifikasi callback, status pembayaran.
- `shipping`: ongkir, resi, tracking status.
- `review`: rating dan review dari customer yang sudah membeli.
- `homepage`: hero, banner, featured section, best seller, new arrival.

Catatan boundary:

- `admin` bukan domain module, melainkan interface (presentation layer) untuk mengelola domain modules.
- `analytics` dan `events` diperlakukan sebagai shared cross-cutting concerns, bukan business domain module.

Ketergantungan antar module harus lewat service contract internal, bukan akses langsung ke tabel module lain.

## 6. Request Flow

Contoh alur utama customer checkout:

1. Customer menambahkan varian produk ke cart.
2. Module `cart` memvalidasi stok terhadap `inventory`.
3. Customer submit checkout (alamat, kurir, metode pembayaran).
4. Module `checkout` membuat order melalui `order`.
5. Module `payment` membuat transaksi dan mengembalikan payment instruction.
6. Callback pembayaran diterima, status di `payment` diperbarui.
7. Module `order` mengubah status menjadi paid/processing.
8. Module `inventory` melakukan pengurangan stok sesuai item order.
9. Module `shipping` menyimpan data pengiriman dan tracking.
10. Customer melihat status order melalui halaman account.

Contoh alur admin:

- Admin update produk/varian -> `catalog` dan `inventory` diperbarui -> perubahan langsung tercermin pada katalog aktif.

## 7. Communication Pattern

Pola komunikasi antar layer dan antar module wajib mengikuti contract service:

### Intra-Module Pattern (wajib)

`Presentation -> Application Service -> Domain Service -> Repository/Adapter`

Aturan:

- Presentation tidak boleh langsung memanggil repository.
- Application service menjadi orchestrator utama use case.
- Repository dan external adapter hanya dipanggil dari dalam module yang memilikinya.

### Inter-Module Pattern (wajib)

`Module A -> Module B Public Service -> Module B Internal Layer`

Aturan:

- Antar module berkomunikasi hanya melalui public service/interface yang diekspos module tujuan.
- Module pemanggil tidak boleh mengakses repository milik module lain.

Contoh:

- Benar: `Order -> InventoryService`
- Salah: `Order -> InventoryRepository`

Tujuan pola ini: menjaga boundary tegas, mencegah spaghetti dependency, dan memudahkan refactor/ekstraksi service di masa depan.

## 8. Dependency Rules

Aturan dependency yang wajib dijaga:

1. Presentation boleh memanggil application layer, tidak boleh langsung ke repository.
2. Application boleh memanggil domain dan contract repository milik module sendiri.
3. Domain tidak boleh import framework/library yang bersifat infrastruktur.
4. Infrastructure hanya mengimplementasikan contract dari application/domain.
5. Antar module wajib lewat public service, tidak boleh akses repository/data internal module lain.
6. Integrasi eksternal (Midtrans, Biteship, Resend, PostHog) harus melalui adapter per module.
7. Shared utility hanya untuk concern umum (logger, error type, result type), bukan menampung business logic.

## 9. Folder Structure Strategy

Strategi struktur folder (target):

```text
src/
  app/                          # App Router (route segments, layout, page, api)
    (store)/                    # Customer-facing pages — layout dengan navbar + footer
      page.tsx                  # / — Homepage
      products/
        page.tsx                # /products — Product listing
        [slug]/
          page.tsx              # /products/[slug] — Product detail
      cart/
        page.tsx                # /cart — Cart
      checkout/
        page.tsx                # /checkout — Checkout
      orders/
        page.tsx                # /orders — Order history
        [id]/
          page.tsx              # /orders/[id] — Order detail
      account/
        page.tsx                # /account — Profile & address
      search/
        page.tsx                # /search — Search results
    (auth)/                     # Auth pages — layout minimalist tanpa navbar
      login/
        page.tsx                # /login
      register/
        page.tsx                # /register
    (admin)/                    # Admin pages — layout dengan sidebar admin
      dashboard/
        page.tsx                # /admin/dashboard
      products/
        page.tsx                # /admin/products
        [id]/
          page.tsx              # /admin/products/[id]
      orders/
        page.tsx                # /admin/orders
      inventory/
        page.tsx                # /admin/inventory
      homepage/
        page.tsx                # /admin/homepage
    api/
      v1/                       # Seluruh API route handler
  modules/
    auth/
      presentation/             # Komponen & hooks terkait auth UI
      application/
      public/                   # public service contract/module facade
      domain/
      infrastructure/
    catalog/
    cart/
    checkout/
    order/
    payment/
    shipping/
    inventory/
    customer/
    review/
    homepage/
  shared/
    kernel/                     # base types, result, error, guard
    infrastructure/             # db client, logger, env, config
    events/                     # domain event contract & event dispatcher
    analytics/                  # tracking abstraction (PostHog, dsb.)
    ui/                         # shared UI primitives (shadcn/ui components)
```

Aturan route group:

- `(store)` — layout dengan navbar customer, cart icon, account menu, footer. Accessible oleh Visitor dan Customer.
- `(auth)` — layout minimalist tanpa navbar, hanya logo. Redirect ke `(store)` jika sudah login.
- `(admin)` — layout dengan sidebar admin. Dilindungi `requireAdmin()`. Terpisah penuh dari halaman customer.

Aturan `presentation/` layer per module:

- Komponen yang spesifik untuk domain fitur disimpan di `src/modules/<module>/presentation/`.
- Komponen yang dipakai lintas halaman tanpa domain spesifik disimpan di `src/shared/ui/`.
- `src/app/(store|auth|admin)/` hanya berisi `page.tsx`, `layout.tsx`, dan `loading.tsx` — tidak mengandung komponen reusable.

Setiap module menyimpan file berdasarkan flow fitur agar coupling antar module tetap rendah.

## 10. Shared Kernel

`shared/` adalah shared kernel untuk concern teknis lintas module, bukan tempat business logic.

Yang boleh ada di shared kernel:

- Error abstraction (`AppError`, error code, error mapper).
- Result type (`Result<T, E>`, `Either` pattern bila dipakai).
- Pagination primitives (offset/cursor contract).
- Cursor primitives dan helper umum.
- Base DTO contract untuk transport lintas layer (bukan business behavior).
- Base entity abstraction teknis (identifier, timestamp contract), jika benar-benar generik.
- Logger abstraction dan implementasi default.
- Validator primitives untuk input umum lintas module.
- Config loader, environment schema validation, constants teknis global.

Yang tidak boleh ada di shared kernel:

- Business rules/domain policy (contoh: rule checkout, rule stok, rule pembayaran).
- Use case spesifik module.
- Query/repository spesifik module.
- DTO yang mengandung perilaku domain spesifik.
- Ketergantungan yang membuat module domain saling terikat.

Prinsip: jika kode hanya relevan untuk satu domain module, kode tersebut harus tetap tinggal di module itu.

## 11. Cross Cutting Concerns

Concern lintas module yang harus konsisten:

- **Security**: auth guard, role-based authorization, secure session, input validation.
- **Observability**: logging terstruktur, audit trail untuk aksi admin, error monitoring.
- **Performance**: caching selektif untuk katalog, optimasi query inventory/order, image optimization.
- **Reliability**: idempotency pada callback payment, retry untuk integrasi eksternal, graceful error handling.
- **Data Consistency**: transaksi database untuk proses kritikal (checkout, payment confirmation, stock update).
- **SEO & Content**: metadata produk, sitemap, slug konsisten untuk katalog publik.

## 12. Scalability Strategy

Strategi scale dalam konteks modular monolith:

1. **Scale up dulu**: optimasi query, caching, dan vertical scaling deployment.
2. **Scale read-heavy path**: katalog dan homepage dapat diberi caching layer lebih agresif.
3. **Background processing**: notifikasi, sinkronisasi status pengiriman, dan event tracking dipindah ke async job saat beban meningkat.
4. **Database readiness**: indexing by access pattern (SKU, slug, order status, payment status, created_at).
5. **Module extraction readiness**: setiap module disiapkan contract agar mudah dipisah menjadi service mandiri jika throughput/kompleksitas menuntut.
6. **Configuration readiness**: terapkan configuration management yang jelas (per environment), kelola secrets secara aman, dan standarkan environment variables dengan validasi saat aplikasi startup.

## 13. Deployment Architecture

Arsitektur deployment MVP (single environment, simple operation):

- **Runtime**: Next.js application (web + admin + API) sebagai satu deployment unit.
- **Database**: PostgreSQL terpusat.
- **Storage**: Cloudflare R2 atau Supabase Storage untuk aset statis/produk.
- **External Services**:
  - Payment Gateway (Midtrans)
  - Shipping Provider (Biteship)
  - Email Provider (Resend)
  - Product Analytics (PostHog)
- **Hosting**: Vercel (disarankan untuk iterasi cepat MVP).

Lingkungan minimum:

- Development
- Production

Staging dapat ditambahkan ketika ritme release meningkat.

## 14. Future Migration Strategy

Jika dibutuhkan migrasi ke microservices, urutan yang direkomendasikan:

1. **Tetapkan service boundary final** berdasarkan module dengan perubahan tinggi dan beban tinggi.
2. **Pisahkan integration adapters** dari business logic untuk mengurangi coupling.
3. **Perkenalkan asynchronous communication** (event/queue) untuk alur non-kritis.
4. **Ekstrak module bertahap** (contoh awal: `payment` atau `shipping`) karena paling dekat ke external integration.
5. **Implement anti-corruption layer** agar service baru tetap kompatibel dengan monolith yang tersisa.
6. **Migrasi database bertahap**: mulai dari shared DB dengan schema boundary, lalu move ke database per service jika benar-benar diperlukan.

Prinsip migrasi: lakukan hanya saat ada kebutuhan bisnis/operasional yang nyata, bukan karena tren arsitektur.

## 15. Architecture Design Decisions

Keputusan arsitektur yang disepakati untuk fase MVP:

- Menggunakan **Modular Monolith**.
- Tidak menggunakan **Microservices** pada fase ini.
- Tidak menggunakan **Event-Driven Architecture** sebagai pola utama.
- Tidak menggunakan **CQRS** pada fase ini.
- Tidak menggunakan **GraphQL** pada fase ini (REST/Route Handler cukup untuk MVP).
- Tidak menerapkan **DDD secara penuh**; hanya mengambil prinsip boundary dan separation yang relevan.
- Menggunakan **Repository Pattern**.
- Menggunakan **Service Layer** untuk orchestration use case.
- Menggunakan **Feature-Based Folder Structure**.
- Menggunakan **Next.js App Router**.
- Menggunakan **Server Actions** secara selektif sesuai kebutuhan use case.

Alasan utama: menjaga kecepatan delivery MVP, mengurangi kompleksitas operasional, dan tetap mempertahankan arah scale yang terkontrol.