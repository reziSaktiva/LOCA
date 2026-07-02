# Architecture Context (Ringkasan)

## System Architecture

### Arsitektur Utama

- Model: **Modular Monolith**.
- Runtime: satu aplikasi Next.js sebagai single deployable unit.
- Alasan:
  - cocok untuk tim kecil/satu developer,
  - delivery MVP lebih cepat,
  - boundary domain tetap jelas,
  - siap diekstrak ke service terpisah jika nanti dibutuhkan.

### Komponen Inti Sistem

- Web customer/visitor (landing, catalog, checkout, account, tracking).
- Admin interface (operasional produk/order/inventory/homepage).
- Domain modules (auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage).
- Shared infrastructure (DB, storage, payment/shipping/email/analytics providers).

## Layering Rule (Wajib)

- `Presentation -> Application -> Domain -> Infrastructure`
- Business logic hanya boleh di `application` dan `domain`.
- UI/route/server action tidak boleh menyimpan business rule.
- Domain tidak boleh tergantung detail framework/provider.

## Inter-Module Communication Rule

- Module hanya boleh berkomunikasi melalui **public service/facade**.
- Dilarang akses repository atau tabel module lain secara langsung.
- Shared kernel hanya untuk concern teknis umum (error/result/type/config), bukan business rule lintas domain.

## Functional Capability Map (MVP)

### Core Flow

1. Auth
2. Catalog + Product Detail + Search
3. Cart
4. Checkout
5. Order
6. Payment
7. Shipping
8. Review

### Supporting Flow

- Customer profile/address/history
- Homepage content management
- Admin operations

## Functional Requirements (Ringkas Per Domain)

### Auth

- Register/login/logout/reset password.
- Role-based access untuk customer vs admin.

### Customer

- Kelola profil dan alamat.
- Lihat riwayat/detail pesanan.

### Catalog & Variant

- CRUD produk/varian/kategori/media/SEO.
- Product status: draft, active, archived, out_of_stock.

### Inventory

- Kelola stok, mutasi stok, validasi stok.
- Stok tidak boleh negatif.

### Cart

- Add/remove/update item dan quantity.
- Quantity tidak boleh melebihi stok.

### Checkout

- Pilih alamat, shipping option, payment method.
- Place order dari cart yang valid.

### Order

- Menjadi source of truth lifecycle transaksi.
- Status kontrak:
  - `PENDING -> WAITING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED`
  - jalur pembatalan: `CANCELLED`

### Payment

- Inisiasi pembayaran dan pemrosesan callback.
- Satu order memiliki satu transaksi pembayaran aktif.

### Shipping

- Kalkulasi ongkir, assign resi, tracking status.
- Status ringkas: `WAITING -> PACKED -> PICKED_UP -> IN_TRANSIT -> DELIVERED`

### Review

- Hanya pembeli terverifikasi yang bisa memberi review.
- Admin bisa hide review.

### Homepage

- Kelola hero/banner/featured/new arrival/best seller.

## Non-Functional Requirements (MVP)

- Performance: target Lighthouse >= 90, Core Web Vitals baik.
- Security: hash password, HTTPS, validasi input, proteksi CSRF/XSS.
- Maintainability: struktur konsisten, mudah diuji, mudah dikembangkan.
- Accessibility: semantic HTML, keyboard navigation, alt text, contrast memadai.
- SEO: metadata, sitemap, robots, structured data.

## Scalability Strategy (Praktis)

- Fokus scale-up dan optimasi query/caching dulu.
- Gunakan async/background process saat beban meningkat.
- Boundary module dijaga agar siap ekstraksi bertahap (candidate awal: payment/shipping) jika ada kebutuhan nyata.
