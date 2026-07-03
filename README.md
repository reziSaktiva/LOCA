# Loca — Brand Hub & D2C E-Commerce

Website **Brand Hub** sekaligus **Direct-to-Consumer (D2C) E-Commerce** untuk brand apparel essentials olahraga dan lifestyle. Dibangun dengan Next.js (App Router) memakai arsitektur **Modular Monolith, Feature-Based**.

Status proyek saat ini: lihat [`PROJECT_STATE.md`](./PROJECT_STATE.md).

## Dokumentasi

Project ini menganut **Documentation First / Spec Driven Development** — `docs/` adalah Single Source of Truth (SSOT), bukan asumsi implementasi. Sebelum mengerjakan apapun, baca sesuai urutan prioritas berikut (`docs/10-development-rules.md` §2):

1. [`docs/01-business.md`](./docs/01-business.md) — bisnis
2. [`docs/02-user-experience.md`](./docs/02-user-experience.md) — UX
3. [`docs/03-functional-requirements.md`](./docs/03-functional-requirements.md) — requirement fitur
4. [`docs/04-system-architecture.md`](./docs/04-system-architecture.md) — arsitektur sistem
5. [`docs/05-domain-modules.md`](./docs/05-domain-modules.md) — detail per module
6. [`docs/06-data-model.md`](./docs/06-data-model.md) — model data
7. [`docs/07-api-specification.md`](./docs/07-api-specification.md) — kontrak API
8. [`docs/08-technical-stack.md`](./docs/08-technical-stack.md) — stack teknis
9. [`docs/09-design-system.md`](./docs/09-design-system.md) — design system
10. [`docs/10-development-rules.md`](./docs/10-development-rules.md) — aturan development
11. [`docs/11-development-roadmap.md`](./docs/11-development-roadmap.md) — roadmap & fase

Ringkasan seluruh dokumen: [`planning/README.md`](./planning/README.md).

## Cara Mengerjakan Project Ini

Alur kerja resmi per fitur (`docs/11-development-roadmap.md`):

```
Planning -> Business Review -> Documentation Review -> Domain Design
   -> Implementation -> Unit Testing -> Integration Testing
   -> Code Review -> Manual Testing -> Documentation Update -> Release
```

Prinsip utama: **fondasi dulu, baru fitur**. Kerjakan fase sesuai urutan roadmap (Phase 1 Foundation → Phase 2 Catalog → … → Phase 11 Release), dan setiap fitur diimplementasikan sebagai **vertical slice** kecil yang bisa diuji end-to-end — bukan dipisah per layer horizontal (semua UI dulu, baru semua backend).

Checklist sebelum mulai task apapun:

1. Cek fase & milestone aktif di [`PROJECT_STATE.md`](./PROJECT_STATE.md).
2. Baca requirement terkait di `docs/03-functional-requirements.md`.
3. Validasi module boundary di `docs/04-system-architecture.md` dan `docs/05-domain-modules.md`.
4. Implementasi lewat layer `presentation -> application -> domain -> infrastructure` (lihat [`src/modules/README.md`](./src/modules/README.md)).
5. Jalankan quality gate: `lint`, `typecheck`, `test`.
6. Kalau muncul keputusan/spesifikasi baru, catat lewat alur `planning/` (lihat [`planning/README.md`](./planning/README.md)).

Definition of Done lengkap: `docs/10-development-rules.md` §25.

## Bekerja dengan AI Assistant (Cursor)

- **`.cursor/skills/`** — workflow otomatis yang selalu aktif untuk task implementasi apapun: `spec-driven-workflow`, `module-scaffold`, `docs-sync`.
- **`agents/`** — role/persona (product manager, backend engineer, security engineer, dst) yang dipakai manual lewat mention `@agents/<nama>.md`. Panduan lengkap: [`agents/README.md`](./agents/README.md).
- **`AGENTS.md`** — aturan operasional umum AI assistant di repo ini.

## Struktur Folder

```
src/
  app/            # Next.js App Router (route, layout, page, api)
  modules/        # domain module — lihat src/modules/README.md
  shared/         # shared kernel — lihat src/shared/README.md
```

## Tech Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + PostgreSQL), Prisma. Detail lengkap dan alasan pemilihan: `docs/08-technical-stack.md`.

## Development

```bash
bun install
bun dev
```

Script yang tersedia saat ini:

- `dev`, `build`, `start`
- `lint`, `typecheck`, `test`
- `format`, `format:check`
- `check` (lint + typecheck + test)
- `check:full` (check + format:check)

Package manager resmi proyek adalah **Bun** (lihat `docs/08-technical-stack.md` dan `planning/decisions.md` Decision 008).

Buka [http://localhost:3000](http://localhost:3000) setelah `bun dev` berjalan.
