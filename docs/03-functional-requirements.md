# Functional Requirements

## 1. Authentication

### Purpose

Mengelola autentikasi dan otorisasi pengguna agar hanya pengguna yang berhak dapat mengakses fitur sesuai perannya.

### Actors

- Visitor
- Customer
- Admin

### Requirement ID

`AUTH`

### Dependencies

- Customer Management
- Admin Dashboard

### Functional Requirements

- AUTH-001: Customer dapat melakukan registrasi akun.
- AUTH-002: Customer dapat login menggunakan email dan password.
- AUTH-003: Customer dapat logout.
- AUTH-004: Customer dapat melakukan reset password.
- AUTH-005: Customer dapat mengubah password.
- AUTH-006: Admin dapat login ke dashboard.
- AUTH-007: Sistem mendukung session yang aman.
- AUTH-008: Sistem membatasi akses berdasarkan role.

### Business Rules

- Email harus unik.
- Password disimpan dalam bentuk hash.
- Customer tidak dapat mengakses halaman admin.
- Admin tidak dapat menggunakan halaman customer sebagai dashboard utama.

### Validation

- Email wajib valid.
- Password minimal 8 karakter.
- Password dan konfirmasi password harus sama.

---

## 2. Customer Management

### Purpose

Mengelola data customer yang melakukan pembelian melalui website.

### Actors

- Customer
- Admin

### Requirement ID

`CUSTOMER`

### Dependencies

- Authentication
- Order

### Functional Requirements

- CUSTOMER-001: Customer dapat mengubah profil.
- CUSTOMER-002: Customer dapat mengubah foto profil.
- CUSTOMER-003: Customer dapat mengelola alamat pengiriman.
- CUSTOMER-004: Customer dapat melihat riwayat pesanan.
- CUSTOMER-005: Customer dapat melihat detail pesanan.
- CUSTOMER-006: Admin dapat melihat daftar customer.
- CUSTOMER-007: Admin dapat melihat histori pembelian customer.

### Business Rules

- Satu customer dapat memiliki banyak alamat.
- Satu customer dapat memiliki banyak pesanan.

### Validation

- Nama wajib diisi.
- Nomor telepon wajib valid.

---

## 3. Product Catalog

### Purpose

Mengelola seluruh produk yang dijual oleh brand.

### Actors

- Admin

### Requirement ID

`PRODUCT`

### Dependencies

- Product Variant
- Inventory
- Homepage Management
- Search

### Functional Requirements

- PRODUCT-001: Admin dapat membuat produk baru.
- PRODUCT-002: Admin dapat mengubah produk.
- PRODUCT-003: Admin dapat menghapus produk.
- PRODUCT-004: Admin dapat mengarsipkan produk.
- PRODUCT-005: Produk memiliki slug.
- PRODUCT-006: Produk memiliki kategori.
- PRODUCT-007: Produk memiliki brand.
- PRODUCT-008: Produk memiliki status.
- PRODUCT-009: Produk memiliki gallery.
- PRODUCT-010: Produk memiliki thumbnail.
- PRODUCT-011: Produk memiliki deskripsi.
- PRODUCT-012: Produk memiliki SEO.

### Product Status

- Draft
- Active
- Archived
- Out of Stock

### Business Rules

- Produk harus memiliki minimal satu varian.
- Produk yang diarsipkan tidak tampil pada katalog.

### Validation

- Nama wajib unik.
- Slug otomatis dibuat.
- Thumbnail wajib ada.

---

## 4. Product Detail

### Purpose

Menampilkan informasi lengkap mengenai suatu produk.

### Actors

- Visitor
- Customer

### Requirement ID

`PDETAIL`

### Dependencies

- Product Catalog
- Product Variant
- Review

### Functional Requirements

- PDETAIL-001: Menampilkan nama produk.
- PDETAIL-002: Menampilkan galeri produk.
- PDETAIL-003: Menampilkan harga.
- PDETAIL-004: Menampilkan varian.
- PDETAIL-005: Menampilkan stok.
- PDETAIL-006: Menampilkan deskripsi.
- PDETAIL-007: Menampilkan spesifikasi.
- PDETAIL-008: Menampilkan review.
- PDETAIL-009: Menampilkan produk terkait.

### Business Rules

- Produk yang tidak aktif tidak dapat diakses.

---

## 5. Product Variant

### Purpose

Mengelola variasi produk berdasarkan atribut tertentu.

### Actors

- Admin

### Requirement ID

`PVAR`

### Dependencies

- Product Catalog
- Inventory

### Functional Requirements

- PVAR-001: Admin dapat membuat varian.
- PVAR-002: Admin dapat mengubah varian.
- PVAR-003: Admin dapat menghapus varian.
- PVAR-004: Varian memiliki SKU.
- PVAR-005: Varian memiliki harga.
- PVAR-006: Varian memiliki stok.
- PVAR-007: Varian memiliki atribut.

### Business Rules

- SKU harus unik.
- Harga dapat berbeda antar varian.
- Setiap varian memiliki stok sendiri.

### Validation

- SKU wajib unik.

---

## 6. Inventory

### Purpose

Mengelola stok seluruh produk.

### Actors

- Admin

### Requirement ID

`INVENTORY`

### Dependencies

- Product Variant
- Order

### Functional Requirements

- INVENTORY-001: Melihat stok.
- INVENTORY-002: Menambah stok.
- INVENTORY-003: Mengurangi stok.
- INVENTORY-004: Melihat histori perubahan stok.

### Inventory Movement

- Stock In
- Stock Out
- Adjustment

### Business Rules

- Stok tidak boleh negatif.
- Pengurangan stok dilakukan setelah pesanan dikonfirmasi.

### Validation

- Jumlah stok tidak boleh kurang dari nol.

---

## 7. Cart

### Purpose

Menyimpan produk yang ingin dibeli customer.

### Actors

- Visitor
- Customer

### Requirement ID

`CART`

### Dependencies

- Product Catalog
- Product Variant
- Inventory

### Functional Requirements

- CART-001: Menambah produk.
- CART-002: Menghapus produk.
- CART-003: Mengubah quantity.
- CART-004: Mengubah variant.
- CART-005: Menghitung subtotal.
- CART-006: Menghitung total.

### Business Rules

- Quantity tidak boleh melebihi stok.
- Quantity minimal satu.

### Validation

- Variant wajib dipilih.

---

## 8. Checkout

### Purpose

Mengubah isi keranjang menjadi pesanan.

### Actors

- Customer

### Requirement ID

`CHECKOUT`

### Dependencies

- Cart
- Customer Management
- Payment
- Shipping

### Functional Requirements

- CHECKOUT-001: Memilih alamat pengiriman.
- CHECKOUT-002: Memilih kurir.
- CHECKOUT-003: Memilih metode pembayaran.
- CHECKOUT-004: Melihat ringkasan pesanan.
- CHECKOUT-005: Membuat pesanan.

### Business Rules

- Checkout hanya dapat dilakukan jika cart tidak kosong.
- Customer wajib memiliki alamat.

### Validation

- Alamat wajib dipilih.
- Metode pembayaran wajib dipilih.

---

## 9. Order

### Purpose

Mengelola seluruh transaksi pembelian.

### Actors

- Customer
- Admin

### Requirement ID

`ORDER`

### Dependencies

- Checkout
- Payment
- Shipping

### Functional Requirements

- ORDER-001: Customer melihat daftar pesanan.
- ORDER-002: Customer melihat detail pesanan.
- ORDER-003: Admin melihat seluruh pesanan.
- ORDER-004: Admin mengubah status pesanan.
- ORDER-005: Admin membatalkan pesanan.

### Order Status

```text
Pending
        ├────────────► Cancelled
        ▼
Waiting Payment
        ├────────────► Cancelled
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

### Business Rules

- Status pesanan mengikuti workflow di atas.
- Pesanan yang selesai tidak dapat diubah.
- Pesanan yang dibatalkan tidak dapat diproses kembali.

---

## 10. Payment

### Purpose

Mengelola proses pembayaran.

### Actors

- Customer
- Admin

### Requirement ID

`PAYMENT`

### Dependencies

- Order

### Functional Requirements

- PAYMENT-001: Memilih metode pembayaran.
- PAYMENT-002: Melakukan pembayaran.
- PAYMENT-003: Melihat status pembayaran.
- PAYMENT-004: Admin melakukan verifikasi pembayaran (jika manual).

### Payment Status

- Pending
- Paid
- Failed
- Expired
- Refunded

### Business Rules

- Satu pesanan hanya memiliki satu pembayaran.

---

## 11. Shipping

### Purpose

Mengelola proses pengiriman pesanan.

### Actors

- Customer
- Admin

### Requirement ID

`SHIPPING`

### Dependencies

- Order

### Functional Requirements

- SHIPPING-001: Memilih jasa pengiriman.
- SHIPPING-002: Menampilkan ongkir.
- SHIPPING-003: Menampilkan nomor resi.
- SHIPPING-004: Tracking pengiriman.
- SHIPPING-005: Admin menginput nomor resi.

### Shipping Status

- Waiting
- Packed
- Picked Up
- In Transit
- Delivered

### Business Rules

- Pengiriman hanya dapat dilakukan setelah pembayaran berhasil.

---

## 12. Review

### Purpose

Mengelola ulasan produk.

### Actors

- Customer
- Admin

### Requirement ID

`REVIEW`

### Dependencies

- Product Detail
- Order

### Functional Requirements

- REVIEW-001: Customer memberikan rating.
- REVIEW-002: Customer memberikan review.
- REVIEW-003: Admin menyembunyikan review.

### Business Rules

- Review hanya dapat diberikan oleh customer yang pernah membeli produk.

---

## 13. Homepage Management

### Purpose

Mengelola tampilan halaman utama website.

### Actors

- Admin

### Requirement ID

`HOMEPAGE`

### Dependencies

- Product Catalog

### Functional Requirements

- HOMEPAGE-001: Mengubah banner.
- HOMEPAGE-002: Mengatur hero section.
- HOMEPAGE-003: Mengatur featured products.
- HOMEPAGE-004: Mengatur best seller.
- HOMEPAGE-005: Mengatur new arrival.
- HOMEPAGE-006: Mengatur promo.
- HOMEPAGE-007: Mengatur urutan section.
- HOMEPAGE-008: Menampilkan/menyembunyikan section.
- HOMEPAGE-009: Menjadwalkan banner atau promo.

---

## 14. Search

### Purpose

Memudahkan customer menemukan produk.

### Actors

- Visitor
- Customer

### Requirement ID

`SEARCH`

### Dependencies

- Product Catalog

### Functional Requirements

- SEARCH-001: Mencari berdasarkan nama.
- SEARCH-002: Mencari berdasarkan kategori.
- SEARCH-003: Filter harga.
- SEARCH-004: Filter ukuran.
- SEARCH-005: Filter warna.
- SEARCH-006: Sorting produk.
- SEARCH-007: Autocomplete pencarian.
- SEARCH-008: Menampilkan riwayat pencarian.

---

## 15. Admin Dashboard

### Purpose

Memberikan ringkasan kondisi bisnis.

### Actors

- Admin

### Requirement ID

`DASHBOARD`

### Dependencies

- Product
- Order
- Customer
- Inventory
- Reports

### Functional Requirements

- DASHBOARD-001: Melihat total order.
- DASHBOARD-002: Melihat total penjualan.
- DASHBOARD-003: Melihat total customer.
- DASHBOARD-004: Melihat stok menipis.
- DASHBOARD-005: Melihat produk terlaris.

---

## 16. Notification

### Purpose

Memberikan informasi kepada customer dan admin.

### Actors

- Customer
- Admin

### Requirement ID

`NOTIFICATION`

### Dependencies

- Order
- Payment
- Shipping

### Functional Requirements

- NOTIFICATION-001: Notifikasi pesanan dibuat.
- NOTIFICATION-002: Notifikasi pembayaran berhasil.
- NOTIFICATION-003: Notifikasi pengiriman.
- NOTIFICATION-004: Notifikasi pesanan selesai.

### Notification Channels

Current MVP

- Email

Future

- WhatsApp
- Push Notification
- In-App Notification

---

## 17. Reports

### Purpose

Menyediakan laporan operasional dan penjualan.

### Actors

- Admin

### Requirement ID

`REPORT`

### Dependencies

- Order
- Product
- Customer
- Inventory

### Functional Requirements

- REPORT-001: Laporan penjualan.
- REPORT-002: Laporan produk.
- REPORT-003: Laporan customer.
- REPORT-004: Laporan stok.
- REPORT-005: Export laporan.

---

## 18. Non Functional Requirements

### Performance

- Website harus memiliki waktu muat yang cepat.
- Target Lighthouse Score ≥ 90.
- Mendukung Core Web Vitals yang baik.

### Security

- Password di-hash.
- Menggunakan HTTPS.
- Validasi seluruh input.
- Proteksi CSRF.
- Proteksi XSS.

### Scalability

- Menggunakan arsitektur Modular Monolith.
- Mudah dipisahkan menjadi service di masa depan.

### Maintainability

- Menggunakan struktur project yang konsisten.
- Mudah dikembangkan.
- Mudah diuji.

### Accessibility

- Semantic HTML.
- Keyboard Navigation.
- Alt Text.
- Screen Reader Friendly.

### SEO

- Metadata lengkap.
- Structured Data.
- Sitemap.
- robots.txt.

---

## 19. Future Features

- Wishlist
- Compare Product
- Blog
- Live Shopping
- Marketplace Synchronization
- POS
- Loyalty Program
- Referral Program
- Community
- Mobile Application

---

## 20. Module Dependencies

```text
Authentication
        │
        ▼
Customer
        │
        ▼
Cart
        │
        ▼
Checkout
        │
        ▼
Order
        ├───────────────┐
        ▼               ▼
Payment         Inventory
        │               ▲
        ▼               │
Shipping      Product Variant
        │               ▲
        ▼               │
Review      Product Catalog
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Homepage             Search
```