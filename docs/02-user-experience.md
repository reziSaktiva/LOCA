# User Experience Specification

## Experience Principles

Website harus memberikan pengalaman yang mencerminkan identitas brand.

Prinsip utama:

- Membangun kepercayaan sejak halaman pertama.
- Menampilkan produk sebagai bagian dari gaya hidup, bukan sekadar barang.
- Mengutamakan kesederhanaan dalam setiap interaksi.
- Mengurangi langkah yang tidak perlu saat berbelanja.
- Memberikan kesan premium melalui pengalaman, bukan hanya visual.
- Mendorong customer untuk kembali berkunjung melalui pengalaman yang konsisten.

## Trust Experience

Website harus mampu membangun rasa percaya melalui:

- Foto produk berkualitas tinggi.
- Informasi produk yang lengkap.
- Review pelanggan.
- Informasi pengiriman yang jelas.
- Kebijakan retur yang transparan.
- Pembayaran yang aman.
- Branding yang konsisten.

## 1. User Types

### Visitor

Belum login.

Tujuan:

- Mengenal brand
- Melihat katalog
- Mencari produk

---

### Customer

Sudah login.

Tujuan:

- Membeli produk
- Melihat order
- Tracking pengiriman
- Memberikan review

---

### Admin

Mengelola seluruh operasional website.

Tujuan:

- Mengelola produk
- Mengelola order
- Mengelola homepage
- Mengelola inventory

## 2. User Goals
### Visitor

- Mengenal brand.
- Percaya terhadap brand.
- Menemukan produk.

### Customer

- Checkout cepat.
- Tracking mudah.
- Belanja nyaman.

### Admin

- Mengelola toko dengan efisien.

## 3. User Journey

Alur singkat:

`Visitor -> Melihat Instagram/Tiktok/Shopee -> Masuk Website -> Melihat Landing Page -> Percaya Brand -> Lihat Produk -> Checkout -> Tracking -> Repeat Order`

## 4. User Flow

### Visitor Flow

1. Landing
2. Brand Story
3. Catalog
4. Product Detail
5. Login / Register
6. Checkout

Alur lengkap:

`Landing -> Brand Story -> Catalog -> Product Detail -> Login / Register -> Checkout`

### Customer Flow

1. Landing
2. Catalog
3. Product Detail
4. Select Variant
5. Add to Cart
6. Cart
7. Checkout
8. Payment
9. Waiting Payment
10. Paid
11. Shipping
12. Delivered
13. Review

Alur lengkap:

`Landing -> Catalog -> Product Detail -> Select Variant -> Add to Cart -> Cart -> Checkout -> Payment -> Waiting Payment -> Paid -> Shipping -> Delivered -> Review`

### Admin Flow

1. Login
2. Dashboard
3. Products
4. Orders
5. Inventory
6. Reports

Alur lengkap:

`Login -> Dashboard -> Products -> Orders -> Inventory -> Reports`

## 5. Information Architecture

- Home
  - New Arrival
  - Best Seller
  - Categories
  - About Brand
  - Blog (Future)
  - Contact
  - FAQ
  - Shipping Policy
  - Return Policy
  - Privacy Policy
  - Terms
  - Size Guide
  - Footer

- Catalog
  - Socks
  - Boxer
  - Shorts
  - Sandals
  - Manset

- Customer
  - Account
    - Orders
    - Wishlist (Future)
    - Addresses
    - Profile
    - Settings

- Admin
  - Dashboard
    - Products
    - Categories
    - Orders
    - Customers
    - Homepage
    - Inventory
    - Reports

## 6. Navigation Structure

- Desktop
  - Navbar
    - Logo
    - Categories
    - Search
    - Cart
    - Account

- Mobile
  - Bottom Navigation
    - Home
    - Search
    - Category
    - Cart
    - Account

## 7. UX Principles

- Mobile first.
- Checkout sesingkat mungkin.
- Maksimal 3 klik menuju produk.
- Tidak ada halaman kosong.
- CTA selalu jelas.
- Konsisten di seluruh halaman.
- Seluruh informasi harga harus jelas.
- Seluruh informasi stok harus terlihat.

## 8. Accessibility

- Keyboard navigation.
- Alt text.
- Semantic HTML.
- Color contrast.
- Screen reader friendly.
- Touch target minimal 44px.
- Form memiliki label.
- Focus state terlihat jelas.

## 9. Responsive Experience

- Mobile: Primary Experience.
- Tablet: Adaptive Experience.
- Desktop: Enhanced Experience.

## 10. Empty & Error States
- Empty Cart: Produk belum ada.
- Order Empty: Belum pernah membeli.
- Search Empty: Produk tidak ditemukan.
- 404: Halaman tidak ditemukan.
- 500: Terjadi kesalahan.

## 11. Future Experience

- Blog
- Event
- Community
- Live Shopping
- Marketplace Sync

## 12. UX Success Criteria

- Visitor dapat menemukan produk dalam ≤3 klik.
- Checkout dapat selesai dalam ≤5 langkah.
- Customer dapat melihat status order tanpa menghubungi admin.
- Admin dapat mengelola produk tanpa bantuan developer.
- Website nyaman digunakan pada perangkat mobile.