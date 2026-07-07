# Product Backlog

Daftar pekerjaan yang telah disetujui tetapi belum menjadi prioritas.

## Priority

* P0 = Sangat Penting
* P1 = Penting
* P2 = Normal
* P3 = Future

---

## Current Backlog

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
