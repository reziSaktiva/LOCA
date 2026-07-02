# Project Decisions

Dokumen ini mencatat keputusan penting yang telah disepakati selama proses pengembangan.

## Format

Tanggal:

Judul:

Keputusan:

Alasan:

Dampak:

---

## Decision 001

Judul:

Menggunakan Modular Monolith.

Keputusan:

Project menggunakan Modular Monolith sebagai arsitektur utama.

Alasan:

* Mudah dikembangkan.
* Tidak terlalu kompleks.
* Cocok untuk tim kecil.
* Mudah dimigrasikan ke Headless Architecture.

---

## Decision 002

Judul:

Website sebagai Brand Hub.

Keputusan:

Website tidak hanya digunakan sebagai toko online.

Alasan:

Memperkuat identitas brand.

---

## Decision 003

Judul:

Marketplace berjalan independen.

Keputusan:

Website, Shopee, dan TikTok Shop tidak disinkronkan pada MVP.

Alasan:

Mengurangi kompleksitas pengembangan awal.

---

## Decision 004

Judul:

Tidak menggunakan module User.

Keputusan:

Module dipisahkan menjadi:

* Auth
* Customer
* Admin

Alasan:

Mengurangi ambiguitas dan memperjelas tanggung jawab setiap module.

---

## Decision 005

Judul:

Documentation First.

Keputusan:

Semua fitur harus memiliki dokumentasi sebelum implementasi.

Alasan:

Mempermudah pengembangan berbasis AI dan menjaga konsistensi proyek.

---

## Decision 006

Judul:

Selaraskan mismatch dokumentasi hasil audit `docs/`.

Keputusan:

* Authentication resmi menggunakan **Supabase Auth** (bukan Better Auth). Diperbarui di `00-project-foundation.md` dan `05-domain-modules.md`.
* Database hosting menggunakan **Supabase** (PostgreSQL). Referensi Railway PostgreSQL di `08-technical-stack.md` bagian Deployment dihapus/diganti.
* Business module inti resmi: `auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage`. `Admin` adalah interface/presentation layer, `Analytics` adalah cross-cutting concern — bukan domain module. Diperbarui di `00-project-foundation.md` agar sesuai `04-system-architecture.md` dan `05-domain-modules.md`.
* Order Status resmi memisahkan `PENDING` dan `WAITING_PAYMENT` sebagai dua state berbeda (bukan digabung jadi "Pending Payment"). Diperbarui di `03-functional-requirements.md`.
* Shipping Status resmi menggunakan istilah `Picked Up` (bukan `Shipped`) di antara `Packed` dan `In Transit`. Diperbarui di `03-functional-requirements.md`.
* Daftar prioritas "Source of Truth" di `10-development-rules.md` diperluas menyertakan `00-project-foundation.md` (sebagai draft awal, kalah prioritas dari dokumen 01+), `04-system-architecture.md`, dan `08-technical-stack.md`.

Alasan:

Dokumen-dokumen tersebut diisi pada waktu yang berbeda sehingga muncul beberapa istilah dan keputusan teknis yang saling bertentangan. Diselaraskan ke versi yang paling baru dan paling detail (umumnya dokumen bernomor lebih besar/lebih baru) agar `docs/` tetap konsisten sebagai Single Source of Truth.

Dampak:

`00-project-foundation.md`, `03-functional-requirements.md`, `05-domain-modules.md`, `08-technical-stack.md`, `10-development-rules.md` diperbarui. Lihat `planning/changelog.md` untuk detail.
