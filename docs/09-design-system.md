# Design System

Dokumen ini mendefinisikan prinsip visual, komponen, dan aturan desain yang digunakan pada proyek.

Tujuan utama:

- Menjaga konsistensi UI di seluruh produk.
- Mempercepat proses desain dan development.
- Mengurangi inkonsistensi antar halaman/fitur.
- Menjadi referensi tunggal untuk tim desain dan engineering.

---

## 1. Design Philosophy

Prinsip utama desain produk:

- Clarity over decoration.
- Functional first.
- Consistent and predictable.
- Fast and accessible.

---

## 2. Brand Personality

Karakter brand yang harus tercermin di seluruh UI:

- Modern
- Friendly
- Trustworthy
- Practical

---

## 3. Color System

| Token Group | Purpose | Example |
|------------|---------|---------|
| Primary | Aksi utama, CTA | `primary-500` |
| Neutral | Teks, background, border | `neutral-100` |
| Semantic Success | Status berhasil | `success-500` |
| Semantic Warning | Status peringatan | `warning-500` |
| Semantic Error | Status error/destructive | `error-500` |
| Semantic Info | Status informasi | `info-500` |

Catatan:
- Hindari penggunaan warna di luar token yang sudah didefinisikan.
- Pastikan kontras warna memenuhi standar aksesibilitas.

---

## 4. Typography

| Element | Style |
|--------|-------|
| Display | `text-4xl` / `font-bold` |
| Heading 1 | `text-3xl` / `font-semibold` |
| Heading 2 | `text-2xl` / `font-semibold` |
| Heading 3 | `text-xl` / `font-medium` |
| Body | `text-base` / `font-normal` |
| Caption | `text-sm` / `font-normal` |

---

## 5. Spacing System

Gunakan skala spacing berbasis 4px.

| Token | Value |
|------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |

---

## 6. Radius

| Token | Value | Use Case |
|------|-------|----------|
| `radius-xs` | 4px | Small elements |
| `radius-sm` | 8px | Input, badge |
| `radius-md` | 12px | Card, button |
| `radius-lg` | 16px | Modal, panel |
| `radius-xl` | 24px | Large container |

---

## 7. Shadow

| Token | Value | Use Case |
|------|-------|----------|
| `shadow-sm` | Subtle | Input focus state |
| `shadow-md` | Medium | Card default |
| `shadow-lg` | Strong | Modal / popover |

---

## 8. Iconography

Aturan icon:

- Gunakan style icon yang konsisten (outline/duotone jangan dicampur sembarang).
- Ukuran default: 16/20/24.
- Ikon harus selalu memiliki makna fungsional, bukan dekorasi berlebihan.

---

## 9. Illustration Style

Prinsip ilustrasi:

- Simple and minimal.
- Konsisten dengan warna brand.
- Digunakan untuk empty state, onboarding, dan feedback non-kritis.

---

## 10. Component Rules

Aturan komponen:

- Gunakan komponen reusable sebelum membuat komponen baru.
- Variants harus konsisten (`default`, `secondary`, `destructive`, dll).
- State wajib lengkap: `default`, `hover`, `focus`, `disabled`, `loading`, `error` (jika relevan).

---

## 11. Layout Rules

Aturan layout:

- Gunakan container dan grid yang konsisten.
- Maksimalkan alignment berbasis spacing token.
- Hindari margin/padding custom yang tidak mengikuti skala.

---

## 12. Responsive Rules

Strategi responsive:

- Mobile-first.
- Breakpoint standar:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

---

## 13. Motion Rules

Aturan motion:

- Motion digunakan untuk memperjelas perubahan state, bukan dekorasi.
- Durasi singkat (umumnya 150ms-250ms).
- Gunakan easing yang konsisten di seluruh aplikasi.
- Hormati preferensi `prefers-reduced-motion`.

---

## 14. Accessibility Rules

Standar aksesibilitas minimum:

- Kontras teks mengikuti WCAG AA.
- Semua kontrol interaktif dapat diakses keyboard.
- Focus state harus selalu terlihat.
- Form wajib punya label yang jelas.
- Gunakan semantic HTML untuk struktur konten.

---

## 15. Dark Mode Strategy

Pendekatan dark mode:

- Gunakan token terpisah untuk mode terang/gelap.
- Hindari warna hardcoded langsung di komponen.
- Pastikan kontras tetap aman pada kedua mode.

---

## 16. Component Inventory

Daftar komponen inti:

- Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Card
- Dialog
- Dropdown Menu
- Tabs
- Table
- Pagination
- Toast

---

## 17. Design Tokens

Kategori token:

- Color tokens
- Typography tokens
- Spacing tokens
- Radius tokens
- Shadow tokens
- Motion tokens
- Z-index tokens

Semua token harus didefinisikan terpusat dan dipakai lintas komponen.

---

## 18. Future Design Evolution

Area pengembangan berikutnya:

- Dokumentasi komponen interaktif (dengan contoh penggunaan).
- Design audit berkala untuk menjaga konsistensi.
- Penambahan token untuk kebutuhan tema lanjutan.
- Standardisasi pattern halaman per domain fitur.

---

## 19. Component Naming Convention

Aturan penamaan komponen:

- Gunakan `PascalCase` untuk nama komponen (`ProductCard`, `CheckoutForm`).
- Gunakan nama berbasis fungsi, bukan tampilan visual (`PrimaryButton` hanya jika terkait variant resmi).
- Prefix domain untuk komponen spesifik fitur (`CartItemRow`, `OrderSummaryCard`).
- Hindari singkatan yang ambigu.

---

## 20. Page Composition Rules

Aturan komposisi halaman:

- Struktur standar: `Page Header` -> `Main Content` -> `Supporting Actions`.
- Gunakan hierarchy visual yang jelas (judul, subjudul, aksi utama).
- Maksimal 1 primary CTA per viewport area utama.
- Pisahkan blok informasi dengan spacing token, bukan garis berlebihan.

---

## 21. Empty State Pattern

Pattern empty state:

- Wajib berisi judul singkat yang menjelaskan kondisi kosong.
- Sertakan deskripsi 1 kalimat dan aksi lanjutan yang relevan.
- Gunakan ilustrasi hanya jika membantu konteks.
- Hindari nada error untuk empty state normal.

---

## 22. Loading Pattern

Pattern loading:

- Gunakan skeleton untuk area konten utama.
- Gunakan spinner hanya untuk proses singkat atau area kecil.
- Tampilkan status loading pada tombol saat submit aksi.
- Hindari layout shift saat data selesai dimuat.

---

## 23. Feedback Pattern

Pattern feedback UI:

- `Success`: konfirmasi tindakan berhasil dengan pesan jelas.
- `Error`: jelaskan masalah dan langkah perbaikan jika memungkinkan.
- `Warning`: tampilkan risiko sebelum aksi penting.
- `Info`: gunakan untuk update status non-kritis.

---

## 24. Form Guidelines

Pedoman form:

- Label selalu berada dekat dengan input.
- Validasi real-time untuk format penting (email, nomor telepon).
- Error message harus spesifik dan mudah dipahami.
- Field wajib diberi indikator yang konsisten.
- Group field berdasarkan konteks untuk mengurangi beban kognitif.

---

## 25. Data Display Pattern

Aturan tampilan data:

- Gunakan table untuk data komparatif, card/list untuk data ringkas.
- Angka, mata uang, dan tanggal harus konsisten formatnya.
- Prioritaskan data terpenting di posisi awal.
- Sediakan state lengkap: loading, empty, error, success.

---

## 26. Empty Space Rules

Aturan whitespace:

- Gunakan whitespace untuk membuat fokus dan hirarki visual.
- Pertahankan ritme vertikal yang konsisten antar section.
- Hindari area terlalu padat tanpa jarak antar elemen.
- Pastikan komponen punya ruang napas cukup di semua breakpoint.

---

## 27. Animation Principles

Prinsip animasi:

- Animasi harus fungsional, bukan dekoratif.
- Prioritaskan transisi halus pada perubahan state.
- Durasi default 150ms-250ms; interaksi kompleks maksimal 300ms.
- Gunakan easing konsisten dan hormati `prefers-reduced-motion`.

---

## 28. Design Do & Don't

Do:

- Gunakan token dan komponen yang sudah distandarkan.
- Jaga konsistensi spacing, typography, dan hierarchy.
- Validasi aksesibilitas sebelum rilis.

Don't:

- Hardcode warna, radius, atau shadow langsung di komponen.
- Buat variant baru tanpa kebutuhan produk yang jelas.
- Menggabungkan terlalu banyak pola visual dalam satu layar.