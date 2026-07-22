# Development Roadmap

Dokumen ini mendefinisikan urutan pengembangan proyek dari fase persiapan hingga production release.

Tujuan utama:

- Menjadi panduan implementasi fitur.
- Menentukan prioritas development.
- Mengurangi rework.
- Memastikan setiap fitur dibangun di atas fondasi yang benar.

---

# Roadmap Principles

Seluruh roadmap mengikuti prinsip:

- Business First.
- Foundation Before Features.
- Build Incrementally.
- Release Early.
- Continuous Improvement.

Prioritas utama adalah menghasilkan MVP yang stabil sebelum mengembangkan fitur lanjutan.

---

# Phase 0 — Planning & Documentation

Status: ✅ Completed (2026-06-30)

Tujuan:

Menyusun seluruh dokumentasi sebagai fondasi proyek.

Deliverables:

- Business Documentation
- User Experience
- Functional Requirements
- System Architecture
- Technical Stack
- Domain Modules
- Data Model
- API Specification
- Design System
- Development Rules
- Development Roadmap

Exit Criteria:

- Semua dokumentasi selesai.
- Tidak ada keputusan arsitektur yang menggantung.
- Siap masuk tahap implementasi.

---

# Phase 1 — Project Foundation

Status: ✅ Completed (2026-07-06)

Tujuan:

Membangun fondasi teknis aplikasi.

Deliverables:

- Inisialisasi project Next.js.
- Konfigurasi TypeScript.
- Konfigurasi ESLint.
- Konfigurasi Prettier.
- Konfigurasi Tailwind CSS.
- Konfigurasi shadcn/ui.
- Konfigurasi Motion.
- Konfigurasi Prisma.
- Konfigurasi Supabase.
- Konfigurasi Authentication.
- Environment variables.
- Folder structure.
- Shared utilities.
- Error handling.
- Logger.
- CI (opsional).

Modules:

- Shared
- Auth Foundation

Exit Criteria:

- Project dapat dijalankan.
- Build berhasil.
- Database terkoneksi.
- Authentication berjalan.
- Struktur project final.

---

# Phase 2 — Catalog Foundation

Status: ✅ Completed (2026-07-07)

Tujuan:

Membangun seluruh kemampuan browse produk.

Deliverables:

- Product Category.
- Product.
- Product Variant.
- Product Media.
- Product SEO.
- Product Detail.
- Search.
- Filter.
- Sorting.

Modules:

- Catalog

Exit Criteria:

- Customer dapat melihat seluruh produk.
- Product Detail selesai.
- Search berjalan.
- Admin dapat mengelola katalog.

---

# Phase 3 — Customer & Homepage

Status: ✅ Completed (2026-07-09)

Tujuan:

Membangun pengalaman dasar customer.

Deliverables:

- Homepage.
- Hero Banner.
- Featured Products.
- Best Seller.
- New Arrival.
- Customer Profile.
- Customer Address.
- Account Page.

Modules:

- Homepage
- Customer

Exit Criteria:

- Homepage selesai. ✅
- Customer dapat login. ✅
- Customer dapat mengelola profil. ✅

---

# Phase 4 — Cart & Inventory

Status: ✅ Completed (2026-07-21)

Tujuan:

Membangun kemampuan keranjang belanja dan manajemen stok sebagai prasyarat checkout. Setelah backend selesai, halaman-halaman customer-facing dibangun dalam milestone UI catch-up yang mencakup semua domain yang sudah ada (Homepage, Catalog, Auth, Customer, Cart).

Deliverables:

Backend:
- Inventory Item (stok per variant).
- Inventory Movement (audit trail stok).
- Inventory Reservation (reservasi stok untuk order).
- Admin Inventory API (stock adjustment + movement history).
- Cart (keranjang aktif customer).
- Cart Item (item keranjang dengan snapshot harga).
- Cart CRUD API (add, update, remove, clear).
- Stock validation real-time saat cart operation.
- Cross-module contracts (cart → catalog, cart → inventory) via port pattern.

UI (Catch-up Phase 2–4):
- Route group setup `(store)`, `(auth)`, `(admin)` dengan layout masing-masing.
- Homepage publik (`/`) — banner + featured products + new arrivals + best sellers.
- Product listing (`/products`) — grid, filter, pagination.
- Product detail (`/products/[slug]`) — galeri, variant selector, add to cart.
- Search results (`/search`).
- Login (`/login`) + Register (`/register`).
- Customer account (`/account`) — profil + alamat.
- Cart (`/cart`) — item list, quantity control, remove, summary.

Modules:

- Inventory
- Cart

Milestones:

Backend:
- ✅ M6.1 — Inventory Domain Foundation
- ✅ M6.2 — Admin Inventory API
- ✅ M6.3 — Cart Domain Foundation
- ✅ M6.4 — Cart Customer API
- ✅ M6.5 — Phase 4 Backend Exit Validation

UI Catch-up:
- ✅ M6.6 — UI Foundation: Route Groups + Shared Layout
- ✅ M6.7 — UI: Homepage + Catalog + Product Detail
- ✅ M6.8 — UI: Auth + Account + Cart

Exit Criteria:

Backend (✅ terpenuhi M6.5):
- Customer dapat menambahkan produk ke cart via API. ✅
- Stok divalidasi real-time saat operasi cart. ✅
- Admin dapat mengelola stok via API. ✅
- Kontrak `getCartSnapshot` (`getCartSnapshotForCheckout`) dan `reserveStock` (`inventoryReserveStock`) siap untuk Phase 5 (Checkout & Order). ✅
- `bun run check` hijau. ✅

UI (✅ terpenuhi M6.8):
- Customer dapat mengakses homepage, browse produk, login, dan melihat cart di browser. ✅
- Halaman responsive (mobile-first), accessible (WCAG AA minimum), tidak ada halaman kosong. ✅
- Route groups aktif dengan layout terpisah per audience. ✅

---

# Phase 5 — Checkout & Order

Status: 🔄 In Progress (kicked off 2026-07-22)

Tujuan:

Membangun proses transaksi end-to-end dari cart hingga order terbuat. Shipping rate & payment method di Phase 5 memakai stub/port adapter; integrasi Midtrans/Biteship di Phase 6 (Decision 027).

Deliverables:

Backend:
- Checkout session (validasi cart, alamat, shipping option, payment method).
- Order creation dari checkout snapshot.
- Order status lifecycle (PENDING → WAITING_PAYMENT → ...).
- Order list + detail API untuk customer.
- Admin order management API.
- Stock reservation saat place order (via inventory public facade).

UI:
- Checkout flow (`/checkout`) — address selection, shipping, payment method, order summary.
- Order history (`/orders`).
- Order detail (`/orders/[id]`) — status timeline, item list, shipping info.
- Aktifkan CTA "Lanjut ke Checkout" di `/cart`.

Modules:

- Checkout
- Order

Milestones:

Backend:
- ⏳ M7.1 — Checkout Domain Foundation
- ⏳ M7.2 — Order Domain Foundation
- ⏳ M7.3 — Checkout Customer API
- ⏳ M7.4 — Order Customer + Admin API
- ⏳ M7.5 — Phase 5 Backend Exit Validation

UI:
- ⏳ M7.6 — UI: Checkout Flow
- ⏳ M7.7 — UI: Order History + Detail

Exit Criteria:

Backend (target M7.5):
- Customer dapat `prepareCheckout` → pilih alamat/shipping/payment → `place-order` hingga status `WAITING_PAYMENT` via API.
- Stok di-reserve saat place order; cart ditandai checked-out / dikosongkan sesuai rule domain.
- Admin dapat list/detail/update status order via API.
- Kontrak lintas module (`checkout` → cart/customer/order; `order` → inventory) hanya via public facade/ports.
- `bun run check` hijau.

UI (target M7.7):
- Customer dapat menyelesaikan checkout di browser hingga order `WAITING_PAYMENT`.
- Customer dapat melihat daftar + detail order.
- Halaman responsive (mobile-first), accessible (WCAG AA minimum).

---

# Phase 6 — Payment & Shipping

Status: ⏳ Planned

Tujuan:

Mengintegrasikan layanan eksternal untuk pembayaran dan pengiriman.

Deliverables:

Backend:
- Midtrans Integration (payment initiation + webhook callback).
- Biteship Integration (shipping rate + shipment creation + tracking sync).
- Payment status lifecycle.
- Shipment tracking event.

UI:
- Payment instruction page — VA number / QR code / redirect sesuai metode.
- Order tracking page (`/orders/[id]/tracking`) — status timeline shipment.
- Payment status polling UI.

Modules:

- Payment
- Shipping

Exit Criteria:

- Pembayaran berhasil via Midtrans.
- Tracking dapat dilihat customer di browser.
- Order status berubah otomatis setelah payment callback.
- Halaman payment + tracking responsive dan accessible.

---

# Phase 7 — Review & Notification

Status: ⏳ Planned

Tujuan:

Meningkatkan pengalaman setelah pembelian.

Deliverables:

- Product Review.
- Rating.
- Email Notification.
- Order Notification.
- Shipping Notification.

Modules:

- Review
- Notification

Exit Criteria:

- Customer dapat memberikan review.
- Email berjalan.
- Status dikirim otomatis.

---

# Phase 8 — Admin Dashboard

Status: ⏳ Planned

Tujuan:

Menyediakan operasional internal.

Deliverables:

- Dashboard.
- Product Management.
- Category Management.
- Order Management.
- Customer Management.
- Homepage Management.
- Inventory Management.

Modules:

- Admin

Exit Criteria:

- Seluruh operasional dapat dilakukan dari dashboard.

---

# Phase 9 — Analytics & Reports

Status: ⏳ Planned

Tujuan:

Menyediakan insight bisnis.

Deliverables:

- Dashboard Metrics.
- Sales Report.
- Customer Report.
- Inventory Report.
- Analytics Event.
- Funnel Tracking.

Modules:

- Analytics
- Reports

Exit Criteria:

- Owner dapat melihat performa bisnis.

---

# Phase 10 — Optimization

Status: ⏳ Planned

Tujuan:

Meningkatkan kualitas aplikasi.

Deliverables:

- Performance Optimization.
- SEO Optimization.
- Accessibility Audit.
- Lighthouse Optimization.
- Security Review.
- Code Cleanup.
- Refactoring.

Exit Criteria:

- Lighthouse ≥ 90.
- Core Web Vitals baik.
- Tidak ada major issue.

---

# Phase 11 — Production Release

Status: ⏳ Planned

Tujuan:

Merilis aplikasi ke production.

Deliverables:

- Production Environment.
- Domain.
- SSL.
- Monitoring.
- Backup.
- Error Tracking.
- Analytics Verification.

Exit Criteria:

- Website live.
- Monitoring aktif.
- Backup berjalan.

---

# Future Releases

Setelah MVP selesai, roadmap berlanjut ke fitur berikut:

## Release 2

- Wishlist.
- Blog.
- Promotion Engine.
- Coupon.
- Referral Program.

---

## Release 3

- Loyalty Program.
- Marketplace Synchronization.
- POS Integration.
- Customer Segment.
- Personalization.

---

## Release 4

- Mobile Application.
- Push Notification.
- Advanced Analytics.
- Campaign Management.
- Marketing Automation.

---

## Release 5

- Multi Warehouse.
- Return & Refund.
- Split Shipment.
- Multi Channel Inventory.
- AI Recommendation.

---

# Development Workflow

Setiap fitur dikembangkan menggunakan alur berikut:

```
Planning
    ↓
Business Review
    ↓
Documentation Review
    ↓
Domain Design
    ↓
Implementation
    ↓
Unit Testing
    ↓
Integration Testing
    ↓
Code Review
    ↓
Manual Testing
    ↓
Documentation Update
    ↓
Release
```

Tidak ada fitur yang langsung diimplementasikan tanpa mengacu pada dokumentasi yang telah dibuat.

---

# Milestones

| Milestone | Target |
|-----------|--------|
| M1 | Project Foundation selesai |
| M2 | Catalog & Homepage selesai |
| M3 | Customer, Cart & Inventory selesai |
| M4 | Checkout & Order selesai |
| M5 | Payment & Shipping selesai |
| M6 | Admin Dashboard selesai |
| M7 | Analytics & Reports selesai |
| M8 | Production Ready |
| M9 | MVP Release |

---

# MVP Scope

Fitur yang wajib tersedia pada MVP:

- Authentication
- Homepage
- Product Catalog
- Product Detail
- Search
- Customer Profile
- Customer Address
- Cart
- Inventory
- Checkout
- Order
- Payment
- Shipping
- Review
- Admin Dashboard
- Basic Analytics
- Basic Reports

Semua fitur di luar daftar ini dianggap sebagai pengembangan setelah MVP.

---

# Success Criteria

MVP dianggap berhasil apabila:

- Customer dapat melakukan pembelian dari awal hingga selesai.
- Admin dapat mengelola operasional toko.
- Pembayaran berjalan stabil.
- Pengiriman dapat dilacak.
- Website cepat, responsif, dan mudah digunakan.
- Dokumentasi tetap sinkron dengan implementasi.
- Seluruh modul mengikuti arsitektur yang telah ditetapkan.

---

# Long-Term Vision

Setelah MVP stabil, pengembangan difokuskan pada:

- Skalabilitas aplikasi.
- Otomasi operasional.
- Integrasi marketplace.
- Personalisasi pengalaman pengguna.
- Peningkatan konversi dan retensi customer.
- Evolusi modular monolith menuju arsitektur yang siap diekstraksi menjadi services jika kebutuhan bisnis meningkat.

Prinsip utama roadmap:

> Bangun fondasi yang kuat terlebih dahulu, kemudian kembangkan fitur secara bertahap tanpa mengorbankan kualitas, konsistensi, dan maintainability.