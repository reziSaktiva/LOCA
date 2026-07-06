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

---

## Decision 012

Judul:

Reorganisasi skills ke `.agents/skills/` dan penambahan skill Supabase.

Keputusan:

* Folder skills project dipindah dari `.cursor/skills/` ke `.agents/skills/` agar selaras dengan konvensi Cursor terbaru.
* 3 core skill lama (`spec-driven-workflow`, `module-scaffold`, `docs-sync`) tetap tersedia di lokasi baru.
* 2 skill baru ditambahkan dari registry `supabase/agent-skills`: `supabase` dan `supabase-postgres-best-practices`.
* File `skills-lock.json` ditambahkan di root project untuk tracking versi skill yang terpasang (mirip `package-lock.json`).

Alasan:

* Cursor menyediakan direktori `.agents/skills/` sebagai lokasi standar baru untuk project-level skills.
* Skill `supabase` dan `supabase-postgres-best-practices` relevan langsung dengan M3.4 (Data & Auth Plumbing) dan fase implementasi database ke depan.
* `skills-lock.json` memungkinkan reproducibility skill di environment berbeda.

Dampak:

* `PROJECT_STATE.md` (Agent Governance), `planning/changelog.md`.

---

## Decision 011

Judul:

Setup M3.4 — Data & Auth Plumbing dengan Supabase Auth + Prisma 7.

Keputusan:

* Supabase Auth diintegrasikan menggunakan `@supabase/ssr@0.12.0` (pengganti resmi `auth-helpers-nextjs`), dengan dua client utility:
  - `src/shared/infrastructure/supabase/client.ts` — browser client (`createBrowserClient`)
  - `src/shared/infrastructure/supabase/server.ts` — server client (`createServerClient` + cookie handlers)
* Middleware Next.js di `src/middleware.ts` berfungsi sebagai Proxy untuk refresh token otomatis menggunakan `getClaims()` (bukan `getSession()`) sesuai spec Supabase Auth terbaru.
* Prisma 7 disetup dengan `@prisma/adapter-pg` sebagai driver adapter wajib (breaking change Prisma 7):
  - `prisma.config.ts` load dari `.env.local`, gunakan `DIRECT_URL` untuk CLI migrations
  - `src/shared/infrastructure/database/client.ts` — Prisma singleton dengan PgBouncer-compatible pooled connection
* Env vars distandarkan: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (pooled, port 6543), `DIRECT_URL` (direct, port 5432).
* `.env.example` ditambahkan sebagai template yang di-commit ke repo (`.env.local` tetap di-ignore).

Alasan:

* Supabase Auth SSR terbaru mengharuskan `getClaims()` untuk validasi JWT secara lokal — lebih aman dari `getSession()` yang tidak memvalidasi ulang token di server.
* Prisma 7 breaking change: driver adapter wajib — tidak bisa lagi `new PrismaClient()` tanpa adapter.
* Pemisahan `DATABASE_URL` (pooled) dan `DIRECT_URL` (direct) diperlukan karena PgBouncer tidak kompatibel dengan DDL commands yang dijalankan Prisma CLI saat migrations.

Dampak:

* `package.json`, `bun.lock`, `.env.example`, `.gitignore`, `prisma/schema.prisma`, `prisma.config.ts`, `src/shared/infrastructure/env.ts`, `src/shared/infrastructure/supabase/`, `src/shared/infrastructure/database/`, `src/middleware.ts`, `PROJECT_STATE.md`.

---

## Decision 010

Judul:

Finalisasi standardisasi script quality gate M3.3.

Keputusan:

* Menetapkan command standar harian `bun run check` sebagai pintu tunggal quality gate minimum (`lint + typecheck + test`).
* Menetapkan command tambahan `bun run check:full` untuk validasi lengkap lokal (`check + format:check`).
* Menyelesaikan status M3.3 menjadi completed karena seluruh exit criteria quality gate minimum sudah lolos konsisten di lokal.

Alasan:

* Workflow satu perintah mengurangi variasi eksekusi manual dan membuat quality gate lebih konsisten sebelum commit/PR.
* Pemisahan `check` dan `check:full` menjaga kecepatan iterasi (minimum gate tetap cepat), sambil tetap menyediakan validasi format saat dibutuhkan.
* Exit criteria M3.3 mensyaratkan script minimum terstandar dan lolos lokal; kondisi ini sudah terpenuhi.

Dampak:

`package.json`, `README.md`, `PROJECT_STATE.md`, `planning/changelog.md`.

---

## Decision 013

Judul:

Menambahkan skill `progress-sync` untuk otomasi pelaporan progress.

Keputusan:

* Menambahkan skill baru `.agents/skills/progress-sync/SKILL.md` yang mewajibkan agent memperbarui `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` di akhir setiap task implementasi (fitur, fix, setup engineering, milestone, refactor) secara otomatis tanpa harus diminta user.
* Skill ini melengkapi (bukan menggantikan) `docs-sync` — `docs-sync` fokus ke perubahan spesifikasi/keputusan besar, `progress-sync` fokus ke pelaporan status implementasi rutin setiap task selesai.
* Urutan update ditetapkan tetap: `PROJECT_STATE.md` -> `planning/changelog.md` -> `context/ctx-implementation.md`.

Alasan:

* Sebelumnya update ke 3 file status ini bergantung pada user secara manual meminta setiap kali, menyebabkan drift (mis. `context/ctx-implementation.md` sempat tertinggal beberapa milestone).
* Skill memaksa agent menjadikan pelaporan status sebagai bagian dari Definition of Done task, bukan langkah opsional terpisah.

Dampak:

* `.agents/skills/progress-sync/SKILL.md` (baru), `PROJECT_STATE.md` (Agent Governance), `planning/changelog.md`.

---

## Decision 014

Judul:

M3.5 — UI Foundation: shadcn/ui (base-nova), shared/ui path, design tokens, dan dependency stack.

Keputusan:

* Menggunakan shadcn/ui versi terbaru dengan style `base-nova` (Base UI primitives + Nova visual theme) sebagai fondasi komponen UI.
* Seluruh komponen shadcn/ui di-install ke `src/shared/ui/` (bukan default `src/components/ui/`) agar selaras dengan arsitektur Modular Monolith; `components.json` aliases diupdate: `ui` dan `utils` keduanya menunjuk ke `@/shared/ui`.
* Design token struktur diselaraskan dengan `docs/09-design-system.md`: radius tokens (xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px), semantic color tokens (success, warning, error alias ke destructive, info) ditambah ke `globals.css` menggunakan oklch color space. Nilai primary masih placeholder (branding TBD).
* 15 core components dari design system inventory diinstall: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `badge`, `card`, `dialog`, `dropdown-menu`, `tabs`, `table`, `pagination`, `sonner`.
* Dependency stack UI dilengkapi: `lucide-react` (icons), `motion` (animation), `react-hook-form` (form state), `zod` (validation), `next-themes` (dark mode), `sonner` (toast).
* Provider pattern ditetapkan: `src/app/providers.tsx` (client component) wrapping `ThemeProvider` + `Toaster`, dipanggil dari `src/app/layout.tsx` (Server Component).
* Barrel export `src/shared/ui/index.ts` tersedia agar modul dapat import clean dari `@/shared/ui`.
* `Container` component primitif ditambahkan ke `src/shared/ui/container.tsx` sebagai layout building block.
* `lang="id"` ditetapkan di root HTML element.

Alasan:

* shadcn/ui `base-nova` dipilih karena selaras dengan design philosophy "clarity, functional, modern" dan sudah mendukung Tailwind v4 (menggunakan `@theme inline`).
* Path ke `src/shared/ui/` selaras dengan module boundary rules — shared UI tidak milik modul domain manapun.
* Design tokens oklch future-proof untuk dark mode dan color manipulation, konsisten dengan shadcn default.
* Branding final masih open decision — token structure disiapkan agar mudah di-swap saat brand colors diputuskan.

Dampak:

`package.json`, `bun.lock`, `components.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/providers.tsx`, `src/shared/ui/` (seluruh folder), `PROJECT_STATE.md`, `planning/changelog.md`, `context/ctx-implementation.md`.

---

## Decision 015

Tanggal: 2026-07-03

Judul:

Fix: `middleware.ts` → `proxy.ts` (Next.js 16) dan `suppressHydrationWarning` untuk `next-themes`.

Keputusan:

* **`src/middleware.ts` dihapus, diganti `src/proxy.ts`** dengan exported function `proxy()` (bukan `middleware()`). Ini mengikuti konvensi file baru Next.js 16 yang mengganti nama `middleware` → `proxy`. Logika Supabase Auth token refresh tetap sama.
* **`suppressHydrationWarning` ditambahkan ke `<html>` di `src/app/layout.tsx`** untuk menghilangkan hydration mismatch yang disebabkan oleh `next-themes`. Server tidak tahu preferensi tema user saat render, sehingga `ThemeProvider` (client-side) menambahkan `style={{color-scheme:"dark"}}` setelah hydration — memunculkan diff antara server HTML dan client DOM.

Alasan:

* Next.js 16 mendeprecate konvensi file `middleware.ts` dan merekomendasikan migrasi ke `proxy.ts`. Warning `⚠ The "middleware" file convention is deprecated` muncul di console setiap request jika tidak dimigrasi.
* `suppressHydrationWarning` adalah solusi resmi untuk masalah ini: atribut yang dikelola oleh third-party (seperti `next-themes` pada `<html>`) boleh berbeda antara server/client tanpa menjadi bug — React tidak akan mencoba mempatch perbedaan ini.

Dampak:

`src/middleware.ts` (dihapus), `src/proxy.ts` (baru), `src/app/layout.tsx`.

---

## Decision 016

Tanggal: 2026-07-05

Judul:

M3.6 CI baseline workflow ditetapkan dengan gate minimum lint, typecheck, test.

Keputusan:

* Menambahkan workflow GitHub Actions `.github/workflows/ci.yml` sebagai baseline CI project.
* Trigger workflow pada `pull_request` dan `push` ke branch `main`.
* Menjalankan gate minimum secara berurutan: `bun run lint`, `bun run typecheck`, `bun run test`.
* Menetapkan `concurrency` untuk membatalkan run lama pada ref yang sama agar feedback CI lebih cepat.

Alasan:

* Exit criteria M3.6 mensyaratkan pipeline minimum aktif untuk PR.
* Gate minimum harus konsisten dengan standar engineering yang sudah ditetapkan di script `package.json`.
* Menjaga kualitas perubahan tetap terverifikasi otomatis sebelum merge.

Dampak:

`.github/workflows/ci.yml`, `PROJECT_STATE.md`, `planning/changelog.md`, `context/ctx-implementation.md`.

---

## Decision 021

Tanggal:

2026-07-06

Judul:

Aturan commit — agent tidak boleh commit otomatis tanpa persetujuan manusia.

Keputusan:

* Agent AI **dilarang melakukan `git commit` secara otomatis** setelah menyelesaikan task implementasi.
* Alur yang diwajibkan: selesaikan pekerjaan → jalankan quality gate → laporkan hasil ke manusia → **tunggu instruksi commit eksplisit** sebelum menjalankan perintah git apapun yang bersifat permanen.
* Aturan ini ditegakkan di dua tempat:
  - `AGENTS.md` §7 (Git and Change Hygiene) — sebagai aturan operasional global agent.
  - `.agents/skills/spec-driven-workflow/SKILL.md` — di bagian Batasan dan Definition of Done sebagai pengingat kontekstual saat task implementasi berjalan.

Alasan:

* Manusia perlu kesempatan memeriksa, menguji, dan menyetujui hasil kerja sebelum riwayat git tertulis secara permanen.
* Commit yang terburu-buru atau tidak diinspeksi dapat memperkenalkan bug, pelanggaran convention, atau perubahan yang tidak dikehendaki ke dalam riwayat repo.
* Memberi kontrol penuh ke pemilik repo atas kapan dan apa yang masuk ke commit history.

Dampak:

* `AGENTS.md`, `.agents/skills/spec-driven-workflow/SKILL.md`, `planning/changelog.md`.

---

## Decision 020

Tanggal: 2026-07-06

Judul:

Penetapan SOP Operasional MVP (KPI Dashboard, Order Handling, SLA Shipping).

Keputusan:

* **KPI Dashboard Prioritas Awal**: Total Order + Revenue + Stok Habis. Dipilih sebagai data operasional minimum yang cukup untuk solo operator pada fase MVP.
* **SOP Order Handling**: Simple 3-step — Terima order → Kemas → Drop ke kurir. Tanpa konfirmasi manual via WA atau otomasi penuh, sesuai asumsi operasional mandiri tanpa tim CS.
* **SLA Internal Shipping**: 1-2 hari kerja setelah payment confirmed. Target realistis dan kompetitif untuk operasional mandiri tanpa gudang besar.

Alasan:

* Operasional dilakukan sendiri (solo operator) dengan penjualan awal yang masih kecil — SOP dan KPI harus sederhana agar tidak membebani.
* SLA 1-2 hari kerja cukup untuk membangun kepercayaan customer tanpa memaksakan same-day yang berisiko gagal dipenuhi.
* KPI Total Order + Revenue + Stok Habis cukup untuk mengambil keputusan operasional harian pada MVP.

Dampak:

* `docs/01-business.md` (Success Metrics + Business Rules Operational), `PROJECT_STATE.md`, `planning/changelog.md`.

---

## Decision 019

Tanggal: 2026-07-06

Judul:

Penetapan Engineering Policy: Testing Strategy, Branch Protection, dan Deployment Flow.

Keputusan:

* **Testing Strategy per Layer**: Unit test domain layer + Integration test API endpoint. Unit test fokus pada business invariant dan logic di domain layer; integration test memvalidasi kontrak endpoint. E2E tidak diprioritaskan pada MVP.
* **Branch Protection Policy**: CI harus hijau (lint + typecheck + test) sebelum merge ke `main`. Selaras dengan gate yang sudah ada di `.github/workflows/ci.yml`.
* **Deployment Flow**: Deploy manual untuk sekarang — tidak ada auto-deploy ke production. Preview Vercel dari PR tetap aktif sebagai verifikasi visual sebelum deploy manual.

Alasan:

* Solo developer + MVP — testing strategy harus memberikan coverage bermakna (domain invariant + API contract) tanpa overhead penulisan E2E yang besar.
* Branch protection CI-gate melindungi `main` dari broken code tanpa memerlukan peer review (solo project).
* Deploy manual dipilih agar tidak ada perubahan tidak disengaja yang masuk production; developer tetap punya kontrol penuh saat awal operasional.

Dampak:

* `.github/workflows/ci.yml` (tidak ada perubahan file, ini adalah policy resmi yang mengikat workflow yang sudah ada), `PROJECT_STATE.md`, `planning/changelog.md`.

---

## Decision 018

Tanggal: 2026-07-06

Judul:

Penetapan Branding Final LOCA.

Keputusan:

* **Nama Brand**: **LOCA** — nama brand final, bukan placeholder.
* **Arah Logo**: Wordmark — nama "LOCA" dengan typography kuat, clean, minimal. Tanpa simbol tambahan.
* **Color Direction**: Black + Off-White + 1 Accent Color. Palette timeless, premium, minimal yang cocok dengan brand personality Modern + Minimal.
* **Typography**: Geometric Sans — **Outfit** atau **Plus Jakarta Sans** sebagai kandidat utama. Font yang clean, modern, readable, dan cocok untuk brand Sports Apparel generasi muda.
* **Tone of Voice**: Confident & Minimal — kalimat pendek, to the point, tidak basa-basi. Berlaku untuk semua konten brand (produk, marketing, notifikasi).
* **Brand Story**: Lifestyle Movement — LOCA bukan sekadar apparel, melainkan simbol dari mindset aktif dan disiplin. Customer membeli LOCA bukan hanya karena fungsi, tetapi karena ingin menjadi bagian dari lifestyle tersebut.

Alasan:

* Nama LOCA sudah digunakan sejak awal project dan memiliki karakter yang kuat, singkat, mudah diingat.
* Wordmark dipilih karena selaras dengan brand personality minimal — typography yang kuat sudah cukup sebagai identitas visual.
* Black + Off-White + Accent adalah palette paling timeless untuk brand apparel modern; mudah diaplikasikan ke produk fisik maupun digital.
* Geometric Sans mendukung kesan modern dan clean tanpa terasa kaku; dapat diaplikasikan dari body text hingga display heading.
* Tone Confident & Minimal mencerminkan brand promise "Simple. Comfortable. Confident." secara langsung.
* Brand story Lifestyle Movement membedakan LOCA dari brand generik — menjadikan produk sebagai simbol identitas, bukan sekadar komoditas.

Dampak:

* `docs/01-business.md` (Brand Story, Brand Personality), `docs/09-design-system.md` (Color System, Typography), `PROJECT_STATE.md` (Open Decisions → Latest Decisions), `planning/changelog.md`.

---

## Decision 017

Tanggal: 2026-07-05

Judul:

M3.7 Catalog Start Gate ditetapkan sebagai Definition of Ready implementasi module pertama.

Keputusan:

* Menetapkan paket readiness implementasi `catalog` pada `planning/backlog.md` mencakup:
  - Feature backlog berbasis vertical slice (`catalog-category-management`, `catalog-product-lifecycle`, `catalog-variant-pricing-attributes`, `catalog-public-listing-search`, `catalog-product-media-seo`).
  - Acceptance criteria eksplisit per feature.
  - Verifikasi dependency antar module (`catalog -> inventory`, `catalog -> review`) dan downstream consumer (`homepage`, `cart`).
  - Checklist Definition of Ready untuk kickoff Phase 2.
* Menandai M3.7 sebagai completed di `PROJECT_STATE.md` dan memindahkan fokus berikutnya ke implementasi vertical slice `catalog`.

Alasan:

* Exit criteria M3.7 mensyaratkan backlog fitur, acceptance criteria, verifikasi dependency, dan dokumentasi kesiapan implementasi sebelum coding module pertama dimulai.
* Menyepakati readiness package sebelum coding mengurangi ambiguity implementasi, mencegah scope drift, dan menjaga konsistensi dengan pendekatan spec-driven.

Dampak:

`planning/backlog.md`, `PROJECT_STATE.md`, `planning/changelog.md`, `context/ctx-implementation.md`.
