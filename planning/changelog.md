# Changelog

Catatan perubahan besar selama proses pengembangan.

Mengikuti prinsip:

* Tambahkan entri baru di bagian atas.
* Jangan menghapus riwayat perubahan.

---

## 2026-07-05 (4)

### Changed

* Memperbarui workflow CI di `.github/workflows/ci.yml` dengan step `Generate Prisma client` (`bunx --bun prisma generate`) sebelum `lint`, `typecheck`, dan `test`.
* Menambahkan env dummy `DIRECT_URL` dan `DATABASE_URL` di step generate agar Prisma config tetap valid saat berjalan di environment CI.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` untuk mencatat mitigasi error CI `Cannot find module '../../../generated/prisma/client'`.

### Notes

* Tujuan perubahan: memastikan Prisma client selalu tersedia pada job CI sebelum `tsc --noEmit` dijalankan.

---

## 2026-07-05 (3)

### Changed

* Menjalankan formatter pada scope resmi project (`src/**/*.{ts,tsx,css}` dan `*.{json,mjs,ts}`) untuk menyelesaikan formatting drift lintas file.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` agar status M3.6 mencatat bahwa `check:full` sudah kembali hijau.

### Verified

* `bun run format` — berhasil menormalkan formatting pada seluruh file dalam scope formatter.
* `bun run check:full` — lolos penuh (`lint`, `typecheck`, `test`, `format:check`).

### Notes

* Remaining exit criteria M3.6: pipeline PR harus hijau.

---

## 2026-07-05 (2)

### Changed

* Menyesuaikan script test di `package.json` agar Vitest dijalankan melalui runtime Bun (`bun --bun ./node_modules/vitest/vitest.mjs`) untuk menghindari error startup ESM pada environment Node saat ini.
* Memperbarui `PROJECT_STATE.md` dan `context/ctx-implementation.md` agar status M3.6 mencerminkan blocker SSL lokal yang sudah selesai dan verifikasi gate minimum yang sudah lolos.

### Verified

* `bun install` — berhasil tanpa error `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
* `bun run check` — lolos (`lint`, `typecheck`, `test`).
* `bun run check:full` — masih gagal pada `format:check` karena formatting drift lintas file.

### Notes

* Exit criteria M3.6 tetap: pipeline minimum harus hijau pada PR.
* Pekerjaan lanjutan disarankan: rapikan formatting drift agar `check:full` kembali hijau.

---

## 2026-07-05

### Added

* Menambahkan baseline workflow CI di `.github/workflows/ci.yml` dengan trigger `pull_request` dan `push` ke `main`.
* Menambahkan quality gates minimum CI: `bun run lint`, `bun run typecheck`, `bun run test`.
* Mencatat keputusan pada `planning/decisions.md` (Decision 016).

### Changed

* Memperbarui `PROJECT_STATE.md` untuk menandai progres M3.6 (workflow sudah dibuat, verifikasi lokal masih pending).
* Memperbarui `context/ctx-implementation.md` agar snapshot implementasi mencerminkan status terbaru M3.6.

### Verified

* Verifikasi quality gate lokal belum bisa dijalankan karena `bun install --frozen-lockfile` gagal dengan `UNABLE_TO_VERIFY_LEAF_SIGNATURE` pada environment saat ini.

### Notes

* Exit criteria M3.6 tetap: pipeline minimum harus hijau pada PR. Verifikasi final dilakukan setelah isu SSL sertifikat pada environment lokal terselesaikan.

---

## 2026-07-03 (10)

### Fixed

* **Next.js 16: `middleware.ts` → `proxy.ts`** — `src/middleware.ts` dihapus, diganti `src/proxy.ts` dengan exported function `proxy()`. Warning deprecasi `⚠ The "middleware" file convention is deprecated` tidak muncul lagi. Logika Supabase Auth token refresh tidak berubah.
* **Hydration mismatch `next-themes`** — menambahkan `suppressHydrationWarning` pada `<html>` di `src/app/layout.tsx`. `ThemeProvider` dari `next-themes` menambahkan `style={{color-scheme:"dark"}}` di sisi client setelah hydration (server tidak tahu preferensi tema user), yang memunculkan diff React. `suppressHydrationWarning` adalah solusi resmi untuk kasus ini.
* Mencatat keputusan pada `planning/decisions.md` (Decision 015).

---

## 2026-07-03 (9)

### Added

* **shadcn/ui initialized** — style `base-nova` (Base UI primitives), dikonfigurasi via `components.json` dengan `ui` alias menunjuk ke `src/shared/ui/`.
* **15 core UI components** installed ke `src/shared/ui/`: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `badge`, `card`, `dialog`, `dropdown-menu`, `tabs`, `table`, `pagination`, `sonner`.
* **Barrel export** `src/shared/ui/index.ts` — semua komponen dan utilities dapat diimport dari `@/shared/ui`.
* **Container component** `src/shared/ui/container.tsx` — layout primitive responsif (max-w-7xl, horizontal padding `sm`/`lg`).
* **Provider pattern** `src/app/providers.tsx` — client component wrapping `ThemeProvider` (next-themes) + `Toaster` (sonner).
* **Design tokens** dikonfigurasi di `src/app/globals.css`:
  - Semantic colors: `success`, `warning`, `error` (alias ke `destructive`), `info` — tersedia sebagai CSS variable dan Tailwind utilities (`bg-success`, `text-info`, dll).
  - Radius scale: `radius-xs` (4px) → `radius-xl` (24px).
  - Shadow tokens: `shadow-sm`, `shadow-md`, `shadow-lg`.
  - Font reference diperbaiki: `--font-sans: var(--font-geist-sans)`.
* **Dependency stack UI** dilengkapi: `lucide-react@1.23.0`, `motion@12.42.2`, `react-hook-form@7.80.0`, `zod@4.4.3`, `next-themes@0.4.6`, `sonner@2.0.7`.
* Mencatat keputusan pada `planning/decisions.md` (Decision 014).

### Changed

* `src/app/layout.tsx` — tambah `Providers` wrapper, ubah `lang="en"` ke `lang="id"`.
* `src/app/globals.css` — diperbarui total: menambah design tokens, semantic colors, memperbaiki font reference, mempertahankan shadcn theme variables.
* `components.json` — `aliases.ui` dan `aliases.utils` diupdate ke `@/shared/ui`.

### Verified

* `bun run check` (lint + typecheck + test) — semua lolos.

### Notes

* Nilai primary masih placeholder (neutral dark) — akan diupdate saat brand colors difinalisasi (Open Decision).
* Komponen shadcn menggunakan oklch color space — kompatibel dengan dark mode via `next-themes`.

---

## 2026-07-03 (8)

### Added

* Menambahkan skill baru `.agents/skills/progress-sync/SKILL.md` yang mewajibkan agent otomatis melaporkan progress task implementasi ke `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` tanpa harus diminta user — mencegah drift status antar dokumen.
* Mencatat keputusan pada `planning/decisions.md` (Decision 013).

### Changed

* Memperbarui `context/ctx-implementation.md` agar mencerminkan progress M3.1-M3.4 yang sudah selesai (sebelumnya masih menampilkan status "0%, belum dimulai" yang usang).
* Memperbarui `PROJECT_STATE.md` (Agent Governance) untuk mencatat penambahan skill `progress-sync`.

### Notes

* Skill ini melengkapi `docs-sync`: `docs-sync` untuk perubahan spesifikasi/keputusan besar, `progress-sync` untuk pelaporan status implementasi rutin di akhir setiap task.

---

## 2026-07-03 (7)

### Changed

* Memindahkan 3 core skill project (`spec-driven-workflow`, `module-scaffold`, `docs-sync`) dari `.cursor/skills/` ke `.agents/skills/` sesuai konvensi Cursor terbaru.

### Added

* Menambahkan 2 skill baru dari registry `supabase/agent-skills`: `supabase` dan `supabase-postgres-best-practices`.
* Menambahkan `skills-lock.json` di root project untuk tracking versi skill yang terpasang.
* Mencatat keputusan pada `planning/decisions.md` (Decision 012).

---

## 2026-07-03 (6)

### Added

* **Supabase Auth integration** — install `@supabase/supabase-js@2.110.0` dan `@supabase/ssr@0.12.0`.
* `src/shared/infrastructure/supabase/client.ts` — browser client (`createBrowserClient`).
* `src/shared/infrastructure/supabase/server.ts` — server client (`createServerClient`) dengan cookie handlers untuk Next.js App Router.
* `src/middleware.ts` — Next.js middleware Proxy untuk refresh token otomatis via `getClaims()`.
* **Prisma 7 + Supabase PostgreSQL baseline** — install `prisma@7.8.0`, `@prisma/adapter-pg@7.8.0`, `pg@8.22.0`.
* `prisma.config.ts` — konfigurasi Prisma CLI: load `.env.local`, gunakan `DIRECT_URL` untuk migrations (bypass PgBouncer).
* `prisma/schema.prisma` — schema baseline bersih, siap untuk penambahan model.
* `src/shared/infrastructure/database/client.ts` — Prisma singleton dengan PgBouncer-compatible pooled connection via `@prisma/adapter-pg`.
* `src/shared/infrastructure/env.ts` — diperluas dengan validasi `DATABASE_URL`.
* `.env.example` — template env yang di-commit ke repo.
* Mencatat keputusan pada `planning/decisions.md` (Decision 011).

### Changed

* `.gitignore` — menambahkan `!.env.example` agar template tidak ter-ignore.
* `.env.local` — diperluas dengan `DATABASE_URL` dan `DIRECT_URL`.

### Verified

* `bun run lint` dan `bun run typecheck` lolos bersih setelah setup.
* `bunx prisma generate` berhasil menghasilkan client ke `src/generated/prisma/`.

### Notes

* Milestone **M3.4 — Data & Auth Plumbing Ready** selesai. Exit criteria terpenuhi: Supabase Auth dan database siap dipakai untuk pengembangan module.
* Env vars aktual belum diisi — developer perlu mengisi `.env.local` dari Supabase Dashboard sebelum mulai development.

---

## 2026-07-03 (5)

### Added

* Menambahkan standard command quality gate harian di `package.json`: `check` (`lint + typecheck + test`) dan `check:full` (`check + format:check`).
* Mencatat keputusan finalisasi M3.3 pada `planning/decisions.md` (Decision 010).

### Changed

* Memperbarui `README.md` agar daftar script development mencerminkan baseline terbaru M3.3.
* Memperbarui `PROJECT_STATE.md` untuk menandai M3.3 selesai dan memindahkan next action ke M3.4.

### Verified

* Validasi lokal lolos: `bun run check` dan `bun run check:full`.

---

## 2026-07-03 (4)

### Added

* Menambahkan baseline quality tooling M3.3 bagian pertama: `prettier`, `vitest`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, dan smoke test awal `src/shared/kernel/engineering-baseline-smoke.test.ts`.
* Menstandarkan script kualitas di `package.json`: `typecheck`, `test`, `format`, `format:check`, `test:watch` (melengkapi script `lint` yang sudah ada).
* Mencatat keputusan resmi baseline engineering pada `planning/decisions.md` (Decision 009).

### Changed

* Menjalankan formatting pada file source/config yang termasuk scope script formatter sehingga `src/app/layout.tsx`, `src/app/page.tsx`, `eslint.config.mjs`, dan `next.config.ts` ikut tersinkronkan style-nya.

### Verified

* Seluruh quality gate minimum lolos lokal: `bun run lint`, `bun run typecheck`, `bun run test`, dan `bun run format:check`.

### Notes

* Scope formatter sengaja dibatasi ke source dan file konfigurasi inti agar tidak memicu reformat massal dokumen markdown yang berada di luar scope task M3.3 bagian pertama.

---

## 2026-07-03 (3)

### Changed

* Membersihkan boilerplate default `create-next-app` di `src/app/layout.tsx` (metadata title/description) dan `src/app/page.tsx` (konten marketing Next.js/Vercel diganti placeholder minimal identitas project).

### Verified

* Milestone **M3.2 — Bootstrap Workspace Ready** selesai: `bun install`, `bun dev`, `bun run build`, `bun run lint`, `tsc --noEmit` seluruhnya lolos tanpa warning.

### Notes

* Konten `page.tsx` sengaja dibuat minimal (bukan desain homepage final) — desain UI baru masuk di M3.5 (UI Foundation) dan implementasi fitur `homepage` module di fase berikutnya, sesuai roadmap.

---

## 2026-07-03 (2)

### Changed

* Memutuskan **Bun** sebagai package manager resmi proyek, menggantikan referensi pnpm di `docs/08-technical-stack.md` §21. Lihat `planning/decisions.md` (Decision 008).
* Memperbarui `context/ctx-technical-context.md` dan `README.md` agar konsisten menyebut Bun.
* Menghapus item "Package manager final" dari `planning/questions.md` (sudah terjawab) dan memindahkannya dari Open Decisions ke Latest Decisions di `PROJECT_STATE.md`.

### Notes

* Keputusan ini menutup mismatch yang dicatat pada entri 2026-07-03 sebelumnya, sebelum mulai M3.2 — Bootstrap Workspace Ready.

---

## 2026-07-03

### Added

* Menambahkan scaffold folder `src/modules/<module>/{presentation,application,domain,infrastructure,public}` untuk 11 module MVP dan `src/shared/{kernel,infrastructure,events,analytics,ui}`, lengkap `README.md` ringkas per folder.
* Menambahkan penegakan import boundary otomatis (`import/no-restricted-paths`) di `eslint.config.mjs` sesuai `docs/04-system-architecture.md` §7-8, tanpa dependency baru (memakai `eslint-plugin-import` bawaan `eslint-config-next`).
* Menambahkan 3 core skill di `.cursor/skills/` (`spec-driven-workflow`, `module-scaffold`, `docs-sync`) sebagai fondasi cara kerja AI assistant di project ini.
* Menambahkan `agents/README.md` — panduan cara memakai persona `@agents/*.md` (mention manual, beda dengan skill yang auto-aktif), lengkap tabel role dan contoh prompt.
* Menulis ulang `README.md` (sebelumnya masih default `create-next-app`) menjadi panduan onboarding project: dokumentasi SSOT, alur kerja/vertical slice, cara pakai skill + agents, struktur folder, dan tech stack.

### Notes

* Milestone M3.1 — Folder Structure Ready selesai. Lihat `planning/decisions.md` (Decision 007) untuk detail.
* Ditemukan mismatch: `docs/08-technical-stack.md` menyebut pnpm sebagai package manager resmi, tetapi repo memakai `bun.lock` (bootstrap awal via Bun). Belum diputuskan, dicatat di `planning/questions.md`/`backlog.md` untuk keputusan M3.2.

---

## 2026-07-02

### Changed

* Menyelaraskan provider autentikasi menjadi Supabase Auth di `00-project-foundation.md` dan `05-domain-modules.md` (sebelumnya menyebut Better Auth).
* Menghapus referensi Railway PostgreSQL yang bentrok dengan Supabase di bagian Deployment `08-technical-stack.md`.
* Menyelaraskan daftar Business Module inti di `00-project-foundation.md` menjadi `auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage`, dengan `Admin` sebagai interface layer dan `Analytics` sebagai cross-cutting concern (mengikuti `04-system-architecture.md`/`05-domain-modules.md`).
* Menyelaraskan Order Status di `03-functional-requirements.md` agar memisahkan `Pending` dan `Waiting Payment` (sebelumnya digabung jadi "Pending Payment").
* Menyelaraskan Shipping Status di `03-functional-requirements.md` menggunakan istilah "Picked Up" (sebelumnya "Shipped").
* Memperluas daftar prioritas Source of Truth di `10-development-rules.md` agar menyertakan `00-project-foundation.md`, `04-system-architecture.md`, dan `08-technical-stack.md`.

### Added

* Menambahkan ringkasan penjelasan seluruh file `docs/` di `planning/README.md`.

### Notes

Perubahan berasal dari audit konsistensi seluruh dokumen `docs/`. Lihat `planning/decisions.md` (Decision 006) untuk detail keputusan.

---

## 2026-06-30

### Added

* Menentukan tujuan bisnis.
* Menentukan target audience.
* Menentukan product catalog.
* Menentukan Marketplace Strategy.
* Menentukan Modular Monolith.
* Menentukan Tech Stack awal.
* Menentukan Business Modules.
* Menentukan MVP.
* Menentukan struktur dokumentasi.

### Changed

* Mengubah pendekatan dari "langsung membuat AGENTS.md" menjadi "Documentation First".

### Notes

Mulai membangun dokumentasi sebagai Single Source of Truth sebelum implementasi dimulai.
