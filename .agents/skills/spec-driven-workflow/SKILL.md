---
name: spec-driven-workflow
description: Alur kerja wajib untuk mengerjakan task implementasi apapun di project Loca (Brand Hub + D2C E-Commerce, Modular Monolith Next.js) — mulai dari membaca source of truth, validasi boundary arsitektur, implementasi vertical slice, hingga quality gate dan Definition of Done. Gunakan setiap kali memulai fitur baru, bug fix, refactor, atau perubahan apapun pada codebase project ini.
---

# Spec-Driven Workflow (Loca)

Project ini menganut **Documentation First / Spec Driven Development**: dokumen di `docs/` adalah Single Source of Truth (SSOT), bukan asumsi atau preferensi implementasi.

## Langkah Wajib Sebelum Coding

1. **Cek `PROJECT_STATE.md`** — pastikan task selaras dengan phase/milestone yang sedang berjalan (jangan kerjakan sesuatu di luar current focus tanpa alasan).
2. **Baca requirement terkait** di `docs/03-functional-requirements.md`.
3. **Validasi boundary**:
   - `docs/04-system-architecture.md` — layering & folder target.
   - `docs/05-domain-modules.md` — module mana yang memiliki tanggung jawab ini, dependency ke module lain.
4. **Pastikan kontrak data/API** sesuai `docs/06-data-model.md` dan `docs/07-api-specification.md` — jangan buat entity/endpoint baru yang menyimpang tanpa mencatatnya (lihat skill `docs-sync`).
5. Kalau menyentuh UI, cek `docs/09-design-system.md` (token, komponen shadcn/ui, pola state).

## Source of Truth Priority

```
Urutan Prioritas jika dokumen bertentangan
01-business > 02-user-experience > 03-functional-requirements >
04-system-architecture > 05-domain-modules > 06-data-model >
07-api-specification > 08-technical-stack > 09-design-system >
10-development-rules > 11-development-roadmap
```

`docs/00-project-foundation.md` adalah draft awal — kalah prioritas dari dokumen 01 ke atas jika bertentangan.

## Implementasi

- Kerjakan **vertical slice kecil** yang bisa diuji end-to-end, bukan perubahan besar sekaligus.
- Business logic **hanya** boleh di layer `domain` dan `application` — dilarang di React component, route handler, server action, atau repository (lihat skill `module-scaffold` untuk struktur layer).
- Inter-module wajib lewat public service/facade, tidak boleh akses repository/tabel module lain langsung.
- Ikuti naming convention: folder & file `kebab-case`, component `PascalCase`, function/variable `camelCase`, constant `UPPER_SNAKE_CASE`, interface/type `PascalCase` (tanpa prefix `I`).
- Hindari: hardcoded value, dead code, duplicate code, circular dependency, magic number/string, over-engineering, premature optimization.
- State priority: URL state > server state > local state. Hindari global state kecuali benar-benar perlu.
- Sebelum menambah dependency baru, cek `docs/08-technical-stack.md` — apakah sudah ada stack resmi yang bisa dipakai.

## Quality Gate (jalankan sesuai konteks task)

- `lint`, `typecheck`, `test` — wajib lolos sebelum menganggap task selesai.
- Tidak ada `console.log` tertinggal, tidak ada warning penting.
- Error handling: jangan lempar raw error ke UI — harus punya `code`, `message`, dan dicatat ke logging bila relevan.
- Validasi wajib di server (client validation hanya untuk UX).
- Accessibility minimum: semantic HTML, keyboard navigation, visible focus, kontras WCAG AA.

## Definition of Done

Task dianggap selesai jika **semua** berikut terpenuhi:

- [ ] Requirement (functional + business rule) terpenuhi sesuai `docs/`.
- [ ] Selaras dengan module boundary & layering (`presentation -> application -> domain -> infrastructure`).
- [ ] Lint, build, typecheck lolos tanpa error.
- [ ] Tidak ada warning penting atau dead/duplicate code.
- [ ] Test relevan lulus (prioritas: business logic > domain service > API > UI).
- [ ] Responsive dan accessible.
- [ ] Dokumentasi terkait diperbarui bila requirement/kontrak berubah — lihat skill `docs-sync`.
- [ ] Laporkan hasil ke manusia dan **tunggu persetujuan** sebelum commit. Commit hanya dilakukan atas instruksi eksplisit, mengikuti format Conventional Commits.

## Batasan untuk AI Assistant

Jangan pernah:

- Mengubah business rule tanpa dasar dokumentasi.
- Menambah dependency tanpa alasan jelas.
- Membuat struktur folder baru di luar `docs/04-system-architecture.md` tanpa persetujuan eksplisit dari user.
- Mengubah API contract tanpa memperbarui `docs/07-api-specification.md`.
- **Melakukan `git commit` secara otomatis setelah task selesai.** Selesaikan pekerjaan → jalankan quality gate → laporkan hasil → **tunggu instruksi commit eksplisit dari manusia**. Manusia harus memeriksa dan menyetujui hasil kerja sebelum commit dilakukan.

Jika requirement tidak jelas atau dokumen tidak cukup untuk menjawab, **tanyakan ke user** daripada berasumsi.

## Skill Terkait

- Membuat/menambah domain module baru -> gunakan skill `module-scaffold`.
- Ada keputusan baru atau spesifikasi berubah -> gunakan skill `docs-sync`.
