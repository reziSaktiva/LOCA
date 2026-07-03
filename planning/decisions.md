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

---

## Decision 007

Judul:

Materialisasi Folder Structure & Import Boundary Enforcement (M3.1).

Keputusan:

* Struktur folder target di `docs/04-system-architecture.md` §9 direalisasikan di `src/modules/<module>/{presentation,application,domain,infrastructure,public}` untuk 11 module MVP, dan `src/shared/{kernel,infrastructure,events,analytics,ui}`.
* Aturan import boundary (§7-8 dokumen yang sama) ditegakkan otomatis lewat rule `import/no-restricted-paths` di `eslint.config.mjs`, memakai `eslint-plugin-import` yang sudah tersedia sebagai dependency transitif `eslint-config-next` (tidak menambah dependency baru).
* Boundary yang ditegakkan: domain harus pure; infrastructure tidak boleh depend balik ke application/presentation; application tidak boleh depend ke presentation; presentation dilarang akses infrastructure langsung; route (`src/app`) tidak boleh melompati layer module; `shared/` tidak boleh depend ke `modules/`; antar module wajib lewat `public/`.

Alasan:

Exit criteria M3.1 mensyaratkan struktur folder dan boundary rules "disepakati sebagai acuan implementasi" — supaya benar-benar mengikat (bukan hanya dokumentasi naratif), aturan tersebut dijadikan lint rule yang gagal build bila dilanggar. Memakai `eslint-plugin-import` (sudah terpasang) dipilih dibanding menambah `eslint-plugin-boundaries` baru untuk menjaga dependency minimal sesuai `docs/10-development-rules.md` §22.

Dampak:

`eslint.config.mjs`, `src/modules/**`, `src/shared/**` (README + scaffold folder), `PROJECT_STATE.md` (M3.1 selesai). Sudah diverifikasi: `bun run lint` dan `tsc --noEmit` lolos, dan rule terbukti menangkap pelanggaran cross-layer/cross-module pada pengujian manual.

---

## Decision 008

Judul:

Package manager resmi proyek: Bun (bukan pnpm).

Keputusan:

* Bun ditetapkan sebagai package manager resmi proyek, menggantikan referensi pnpm di `docs/08-technical-stack.md`.

Alasan:

* Repo sudah dibootstrap dan berjalan memakai Bun (`bun.lock`, `package.json` memakai field khas Bun: `trustedDependencies`, `ignoreScripts`) sejak awal — tidak ada `pnpm-lock.yaml` yang pernah dibuat.
* Menghindari migrasi lockfile yang tidak perlu menjelang M3.2 (Bootstrap Workspace Ready); mengikuti kondisi nyata repo lebih murah dan lebih rendah risiko dibanding memaksa pindah ke pnpm.
* Bun tetap memenuhi prinsip pemilihan teknologi di `docs/08-technical-stack.md` §1 (stable, production-ready, komunitas aktif).

Dampak:

`docs/08-technical-stack.md` (§21 Development Tools), `context/ctx-technical-context.md`, `README.md`, `PROJECT_STATE.md` (Open Decisions -> Latest Decisions), `planning/questions.md` (pertanyaan dihapus karena sudah terjawab).

---

## Decision 009

Judul:

Inisialisasi baseline engineering M3.3 (lint, format, typecheck, test scaffold).

Keputusan:

* Baseline engineering untuk M3.3 bagian pertama diaktifkan dengan menambahkan `Prettier` dan `Vitest` sebagai tool resmi quality gate lokal.
* Script kualitas minimum distandarkan di `package.json`: `lint`, `typecheck`, `test` (ditambah script pendukung `format`, `format:check`, `test:watch`).
* Ruang lingkup `format`/`format:check` dibatasi ke source dan file konfigurasi inti agar tidak memaksa reformat dokumen/markdown legacy yang belum menjadi target task saat ini.
* Test scaffold awal dibuat via `vitest.config.ts` dan smoke test `src/shared/kernel/engineering-baseline-smoke.test.ts` untuk memastikan pipeline test siap dipakai.

Alasan:

* Exit criteria M3.3 menuntut baseline quality gate minimum dapat dijalankan lokal secara konsisten.
* Menyiapkan formatter + test scaffold sejak awal mengurangi drift style dan memudahkan vertical slice berikutnya tanpa setup ulang.
* Pembatasan target formatter dipilih agar perubahan tetap kecil, fokus, dan tidak menimbulkan noise review lintas file non-prioritas.

Dampak:

`package.json`, `bun.lock`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `src/shared/kernel/engineering-baseline-smoke.test.ts`, `PROJECT_STATE.md`, `planning/changelog.md`.
