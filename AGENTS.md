<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS Guide

Panduan ini adalah aturan operasional untuk AI assistant saat bekerja di repository ini.

## 1) Core Principles

- Documentation first, spec driven development.
- Business rules lebih penting daripada preferensi implementasi.
- Simplicity over cleverness.
- Readability, testability, maintainability sebagai prioritas utama.

## 2) Source of Truth Priority

Jika ada konflik antar dokumen, gunakan urutan berikut:

1. `docs/01-business.md`
2. `docs/02-user-experience.md`
3. `docs/03-functional-requirements.md`
4. `docs/04-system-architecture.md`
5. `docs/05-domain-modules.md`
6. `docs/06-data-model.md`
7. `docs/07-api-specification.md`
8. `docs/08-technical-stack.md`
9. `docs/09-design-system.md`
10. `docs/10-development-rules.md`
11. `docs/11-development-roadmap.md`

Catatan: `docs/00-project-foundation.md` adalah baseline awal, bukan acuan final jika bertentangan dengan dokumen 01+.

## 3) Architecture Guardrails

- Arsitektur: Modular Monolith (feature based).
- Layer wajib dipisah: `presentation -> application -> domain -> infrastructure`.
- Inter-module communication hanya melalui public service/facade.
- Dilarang menaruh business logic di UI, route handler, atau komponen presentasi.
- Shared kernel hanya untuk technical shared concern, bukan business rule.
- `admin` diperlakukan sebagai interface/presentation layer.
- `analytics` diperlakukan sebagai cross-cutting concern.

## 4) Technical Baseline

- Framework: Next.js + React + TypeScript.
- Auth: Supabase Auth.
- Database: Supabase PostgreSQL.
- ORM: Prisma.
- Ikuti stack resmi di `docs/08-technical-stack.md` sebelum menambah dependency baru.

## 5) Working Workflow for Agents

Untuk setiap task implementasi:

1. Baca requirement terkait di `docs/03-functional-requirements.md`.
2. Validasi boundary di `docs/04-system-architecture.md` dan `docs/05-domain-modules.md`.
3. Pastikan kontrak data/API sesuai `docs/06-data-model.md` dan `docs/07-api-specification.md`.
4. Implementasi vertikal kecil, bisa diuji end-to-end.
5. Jalankan quality checks minimum: lint, typecheck, test (sesuai konteks task).
6. Jika ada perubahan aturan/kontrak, update dokumentasi terkait.

## 6) Code Quality Rules

- Hindari hardcoded value, dead code, duplicate code, dan circular dependency.
- Gunakan naming convention dari `docs/10-development-rules.md`.
- Fokus testing pada behavior, bukan detail implementasi.
- Aksesibilitas minimum: semantic HTML, keyboard navigation, visible focus, WCAG AA contrast.

## 7) Git and Change Hygiene

- Gunakan Conventional Commits.
- Buat perubahan sekecil mungkin per task agar mudah direview.
- Jangan ubah scope di luar requirement tanpa mencatat keputusan.

## 8) Documentation Sync Rules

Wajib update dokumen saat terjadi perubahan berikut:

- Business rule berubah -> update business/functional/domain/data docs.
- API contract berubah -> update `docs/07-api-specification.md`.
- UI pattern/design token berubah -> update `docs/09-design-system.md`.
- Keputusan engineering besar -> catat di `planning/decisions.md` dan `planning/changelog.md`.

## 9) Definition of Done (Minimum)

Task dianggap selesai jika:

- Requirement terpenuhi.
- Selaras dengan arsitektur module boundaries.
- Lint, build, dan type safety lolos.
- Tidak ada warning/error penting.
- Dokumentasi diperbarui bila terdampak.
