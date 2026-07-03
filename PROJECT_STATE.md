# PROJECT STATE

> Single Source of Truth untuk status proyek saat ini.

---

# Project

Status: Phase 1 Kickoff (Implementation Setup In Progress)

Current Version: v0.8

Project Type:

Brand Website + E-Commerce

Architecture:

Modular Monolith

Project Goal:

Membangun website sebagai **Brand Hub** sekaligus **Direct-to-Consumer (D2C) E-Commerce** untuk brand apparel essentials yang berfokus pada olahraga dan lifestyle.

---

# Current Phase

✅ Phase 0 — Planning & Documentation (Completed)
⏳ Phase 1 — Project Foundation (Implementation Setup In Progress)

Progress:

- [x] Project Foundation
- [x] Business Documentation
- [x] User Experience
- [x] Functional Requirements
- [x] System Architecture
- [x] Technical Stack
- [x] Domain Modules
- [x] Data Model
- [x] API Specification
- [x] Design System
- [x] Development Rules
- [x] Development Roadmap
- [ ] Phase 1 Implementation Setup

---

# Current Focus

Sedang mengerjakan:

`phase-1 implementation setup kickoff`

Tujuan:

Memulai fase implementasi dengan fondasi engineering yang siap dipakai development harian, sambil menjaga konsistensi antara aturan agent, dokumentasi resmi, dan workflow eksekusi.

---

# Latest Decisions

## Business & Product

- Website berfungsi sebagai Brand Hub sekaligus Direct Sales.
- Marketplace (Shopee & TikTok Shop) tetap digunakan sebagai channel penjualan.
- Fokus utama MVP adalah membangun fondasi brand dan alur pembelian end-to-end yang stabil.
- Produk diposisikan sebagai Sports Apparel Essentials untuk target market mahasiswa dan young professionals.

---

## Architecture

- Modular Monolith.
- Feature-Based Architecture.
- Repository Pattern + Service Layer.
- Business Logic dipisahkan tegas dari UI/Route Handler.
- Inter-module communication wajib melalui public service.
- Shared kernel hanya untuk technical shared concerns, bukan business logic.
- `admin` diperlakukan sebagai interface/presentation layer, bukan domain module.
- `analytics` diperlakukan sebagai cross-cutting concern, bukan domain module.
- Domain module MVP: `auth`, `customer`, `catalog`, `inventory`, `cart`, `checkout`, `order`, `payment`, `shipping`, `review`, `homepage`.

---

## Technical

- Provider autentikasi resmi: **Supabase Auth**.
- Database utama: **Supabase PostgreSQL**.
- Deployment aplikasi: **Vercel**.
- ORM utama: **Prisma**.
- Kontrak status order diselaraskan ke model detail:
  - `PENDING -> WAITING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED` (+ `CANCELLED` path).
- Shipping status diselaraskan menggunakan `PICKED_UP`.
- Package manager resmi proyek: **Bun** (bukan pnpm). Lihat `planning/decisions.md` Decision 008.
- Baseline engineering M3.3 bagian pertama diaktifkan: `Prettier` + `Vitest`, script `typecheck`/`test`/`format`, dan smoke test awal. Lihat `planning/decisions.md` Decision 009.
- Standard command quality gate M3.3 ditetapkan: `bun run check` (lint + typecheck + test) dan `bun run check:full` (check + format:check). Lihat `planning/decisions.md` Decision 010.
- M3.4 plumbing selesai: Supabase Auth via `@supabase/ssr` (middleware proxy + browser/server client), Prisma 7 via `@prisma/adapter-pg` (pooled connection + env template). Lihat `planning/decisions.md` Decision 011.
- Skills project dipindah ke `.agents/skills/`, 2 skill Supabase ditambahkan, tracking via `skills-lock.json`. Lihat `planning/decisions.md` Decision 012.
- M3.5 UI Foundation selesai: shadcn/ui `base-nova` + 15 core components di `src/shared/ui/`, design tokens (semantic colors: success/warning/error/info; radius scale: xs-xl; shadow: sm/md/lg) aktif di `globals.css`, dependency stack UI lengkap (lucide-react, motion, react-hook-form, zod, next-themes, sonner), provider pattern aktif. Lihat `planning/decisions.md` Decision 014.

---

## Documentation Governance

- Source of Truth diperluas dan diselaraskan:
  - Business -> UX -> Functional -> System Architecture -> Domain -> Data Model -> API -> Technical Stack -> Design System -> Development Rules.
- `00-project-foundation.md` diperlakukan sebagai dokumen fondasi awal (draft baseline); jika terjadi konflik, dokumen bernomor 01+ menjadi acuan final.
- `AGENTS.md` diperbarui menjadi panduan operasional agent untuk implementasi agar selaras dengan `docs/10-development-rules.md`.

---

# Open Decisions

Belum diputuskan:

## Branding

- Nama brand final
- Logo final
- Warna brand final
- Typography brand final
- Tone of voice final
- Brand story final

## Phase 1 Engineering

- Testing strategy detail per layer (unit/integration/e2e)
- CI baseline (lint, typecheck, test minimum)
- Deployment flow detail (preview, release, rollback)

## Operations

- KPI dashboard prioritas awal
- SOP operasional order handling
- SLA internal untuk proses shipping

---

# Current Repository Status

## Documentation State

- ✅ `docs/00-project-foundation.md`
- ✅ `docs/01-business.md`
- ✅ `docs/02-user-experience.md`
- ✅ `docs/03-functional-requirements.md`
- ✅ `docs/04-system-architecture.md`
- ✅ `docs/05-domain-modules.md`
- ✅ `docs/06-data-model.md`
- ✅ `docs/07-api-specification.md`
- ✅ `docs/08-technical-stack.md`
- ✅ `docs/09-design-system.md`
- ✅ `docs/10-development-rules.md`
- ✅ `docs/11-development-roadmap.md`

## Planning Workspace

- `planning/README.md` sudah memuat ringkasan seluruh dokumen `docs/`.
- `planning/decisions.md` memuat keputusan teknis terbaru sampai **Decision 014** (M3.5 UI Foundation).
- `planning/changelog.md` memuat log update terbaru tanggal **2026-07-03** (entry 9).

## Agent Governance

- ✅ `AGENTS.md` sudah ditingkatkan dari reminder minimal menjadi implementation guide operasional.
- ✅ Folder `agents/` sudah berisi role profiles inti (`backend`, `frontend`, `database`, `security`, `qa`, `code-review`, `product`, `solution-architect`, `ui`) untuk mendukung eksekusi Phase 1.
- ✅ Folder `.agents/skills/` sudah berisi 6 skill aktif: 4 core skill project (`spec-driven-workflow`, `module-scaffold`, `docs-sync`, `progress-sync`) + 2 skill dari registry `supabase/agent-skills` (`supabase`, `supabase-postgres-best-practices`). Tracking versi skill registry via `skills-lock.json`. Detail: `planning/decisions.md` Decision 012-013.
- ✅ Skill `progress-sync` memaksa agent otomatis melaporkan progress task ke `PROJECT_STATE.md`, `planning/changelog.md`, dan `context/ctx-implementation.md` di akhir setiap task implementasi, tanpa harus diminta user. Detail: `planning/decisions.md` Decision 013.

## Implementation State

- ✅ **M3.1 — Folder Structure Ready**: struktur folder `src/modules/<module>/{presentation,application,domain,infrastructure,public}` (11 module MVP) dan `src/shared/{kernel,infrastructure,events,analytics,ui}` sudah dibuat sesuai `docs/04-system-architecture.md`. Import boundary rules ditegakkan otomatis lewat `import/no-restricted-paths` di `eslint.config.mjs` (terverifikasi lolos `lint` + `tsc --noEmit`, dan terbukti menangkap pelanggaran cross-layer/cross-module saat diuji manual). Detail: `planning/decisions.md` Decision 007.
- ✅ **M3.2 — Bootstrap Workspace Ready**: project Next.js (App Router) + TypeScript + Tailwind CSS terverifikasi berjalan di lokal dengan Bun (`bun install`, `bun dev`, `bun run build`, `bun run lint`, `tsc --noEmit` — semua lolos tanpa warning). Boilerplate default `create-next-app` (metadata title, konten marketing `page.tsx`) dibersihkan agar mencerminkan identitas project sementara (`Loca`), tanpa membangun fitur `homepage` module (ditunda ke fase implementasi module sesuai roadmap).
- ✅ **M3.3 — Engineering Baseline Ready**: baseline engineering selesai dan distandarkan untuk workflow harian — `prettier` + `vitest` aktif, script minimum `lint`/`typecheck`/`test` tersedia, command agregat `check` + `check:full` tersedia, dan seluruh gate minimum terverifikasi lolos di lokal. Detail: `planning/decisions.md` Decision 009-010.
- ✅ **M3.4 — Data & Auth Plumbing Ready**: Supabase Auth (`@supabase/ssr@0.12.0`) dan Prisma 7 (`@prisma/adapter-pg`) terinstall dan terkonfigurasi. Browser/server Supabase client tersedia di `src/shared/infrastructure/supabase/`, Prisma singleton di `src/shared/infrastructure/database/`, dan Next.js proxy untuk token refresh aktif di `src/proxy.ts` (dimigrasi dari `middleware.ts` sesuai Next.js 16). Lihat `planning/decisions.md` Decision 015. Env template `.env.example` siap. Detail: `planning/decisions.md` Decision 011.
- ✅ **M3.5 — UI Foundation Ready**: shadcn/ui (`base-nova`) diinisialisasi, 15 core components dari design system inventory diinstall ke `src/shared/ui/`, design tokens (semantic colors, radius scale, shadow) dikonfigurasi di `globals.css`, dependency stack UI dilengkapi (`lucide-react`, `motion`, `react-hook-form`, `zod`, `next-themes`, `sonner`), provider pattern aktif di `src/app/providers.tsx`, barrel export tersedia di `src/shared/ui/index.ts`. Detail: `planning/decisions.md` Decision 014.

---

# Next Action

Eksekusi **Milestone 3 — Implementation Foundation** secara bertahap:

1. ✅ **M3.1 — Folder Structure Ready** (Selesai)
   - Finalisasi struktur folder implementasi.
   - Tetapkan aturan import boundary antar layer/module.
   - Exit criteria: struktur folder + boundary rules disepakati sebagai acuan implementasi. — Tercapai, lihat `planning/decisions.md` Decision 007.

2. ✅ **M3.2 — Bootstrap Workspace Ready** (Selesai)
   - Bootstrap project Next.js sebagai baseline implementasi.
   - Sinkronkan setup awal workspace dengan stack resmi proyek.
   - Exit criteria: project Next.js berhasil dijalankan di lokal. — Tercapai.

3. ✅ **M3.3 — Engineering Baseline Ready** (Selesai)
   - ✅ Inisialisasi baseline engineering: lint, format, type-safety, test scaffold.
   - ✅ Standarisasi script kualitas minimum (`lint`, `typecheck`, `test`) untuk workflow harian.
   - ✅ Exit criteria: semua quality script minimum lolos di lokal.

4. ✅ **M3.4 — Data & Auth Plumbing Ready** (Selesai)
   - ✅ Setup integrasi Supabase Auth (`@supabase/ssr`, browser/server client, middleware proxy).
   - ✅ Setup integrasi Supabase PostgreSQL + Prisma 7 baseline (driver adapter, singleton, env template).
   - ✅ Exit criteria: auth + database siap dipakai untuk pengembangan module. — Tercapai.

5. ✅ **M3.5 — UI Foundation Ready** (Selesai)
   - ✅ shadcn/ui (`base-nova`) diinisialisasi, 15 core components diinstall ke `src/shared/ui/`.
   - ✅ Design tokens aktif: semantic colors, radius scale (xs-xl), shadow tokens.
   - ✅ Dependency stack UI lengkap: `lucide-react`, `motion`, `react-hook-form`, `zod`, `next-themes`, `sonner`.
   - ✅ Provider pattern aktif di `src/app/providers.tsx`, barrel export di `src/shared/ui/index.ts`.
   - ✅ Exit criteria: fondasi UI siap dipakai konsisten untuk implementasi module. — Tercapai.

6. **M3.6 — CI Baseline Ready**
   - Tetapkan baseline CI minimum: lint, typecheck, test.
   - Exit criteria: pipeline minimum berjalan hijau pada PR.

7. **M3.7 — Catalog Start Gate (Definition of Ready)**
   - Tetapkan Definition of Ready implementasi module pertama (`catalog`).
   - Exit criteria:
     - Feature backlog `catalog` telah disusun.
     - Acceptance criteria tersedia.
     - Dependency antar module telah diverifikasi.
     - Seluruh kebutuhan implementasi terdokumentasi.
     - Module `catalog` siap diimplementasikan menggunakan vertical slice.

---

# Overall Progress

```
Planning & Documentation
████████████████████ 100%
```

```
System Design Readiness
████████████████████ 100%
```

```
Implementation
░░░░░░░░░░░░░░░░░░░░   0%
```

---

# Milestone Checkpoint

## ✅ Milestone 1 — Business Planning (Completed)

Deliverables:

- Project Foundation
- Business Specification
- User Experience Specification
- Functional Requirements

Status:

**Completed**

---

## ✅ Milestone 2 — System Design & Documentation (Completed)

Deliverables:

- System Architecture
- Technical Stack
- Domain Modules
- Data Model
- API Specification
- Design System
- Development Rules
- Development Roadmap

Status:

**Completed**

---

## ⏳ Milestone 3 — Implementation Foundation (Next)

Breakdown:

- [x] M3.1 Folder Structure Ready
- [x] M3.2 Bootstrap Workspace Ready
- [x] M3.3 Engineering Baseline Ready
- [x] M3.4 Data & Auth Plumbing Ready
- [x] M3.5 UI Foundation Ready
- [ ] M3.6 CI Baseline Ready
- [ ] M3.7 Catalog Start Gate (Definition of Ready)

Target Outcome:

- Project bootstrap siap untuk development harian.
- Baseline quality gates aktif dari lokal sampai CI.
- Implementasi module pertama (`catalog`) dapat dimulai tanpa ambiguity dokumen.
