# AI Context Pack

Folder `context/` berisi ringkasan dokumen proyek dalam format singkat (1-3 halaman per file) agar AI agent cepat memahami konteks tanpa membaca semua file di `docs/`.

## Tujuan Folder

- Menjadi entry point konteks proyek untuk AI assistant.
- Menyediakan versi padat dari dokumen `docs/` yang panjang.
- Menjaga konsistensi jawaban AI terhadap keputusan proyek terbaru.
- Mempercepat onboarding saat memulai sesi implementasi baru.

## Cara Membaca Context

1. Baca dari umum ke spesifik.
2. Gunakan file ringkasan untuk orientasi cepat.
3. Jika ada konflik informasi:
   - prioritas pertama: dokumen final di `docs/01+`
   - prioritas kedua: file ringkasan di `context/`
   - `docs/00-project-foundation.md` dipakai sebagai fondasi awal, bukan acuan final saat konflik.
4. Untuk keputusan coding, selalu cocokkan dengan:
   - `context/ctx-development.md`
   - `context/ctx-architecture.md`
   - `context/ctx-domain.md`

## Urutan Baca (Disarankan)

1. `context/ctx-project.md`
2. `context/ctx-business.md`
3. `context/ctx-architecture.md`
4. `context/ctx-domain.md`
5. `context/ctx-technical-context.md`
6. `context/ctx-development.md`
7. `context/ctx-design.md`
8. `context/ctx-implementation.md`

## Mapping ke Dokumen Lengkap

- `ctx-project.md` -> ringkasan lintas `PROJECT_STATE.md` + fondasi utama.
- `ctx-business.md` -> ringkasan `docs/01-business.md`.
- `ctx-architecture.md` -> ringkasan `docs/04-system-architecture.md` + `docs/03-functional-requirements.md`.
- `ctx-domain.md` -> ringkasan `docs/05-domain-modules.md`.
- `ctx-technical-context.md` -> ringkasan `docs/08-technical-stack.md`.
- `ctx-development.md` -> ringkasan `docs/10-development-rules.md`.
- `ctx-design.md` -> ringkasan `docs/09-design-system.md`.
- `ctx-implementation.md` -> snapshot progress dari `PROJECT_STATE.md` + `docs/11-development-roadmap.md` + `planning/backlog.md`.

## Aturan Update

- Update file context setiap ada perubahan besar pada:
  - scope bisnis
  - arsitektur
  - module boundaries
  - stack
  - rules development
  - phase implementasi
- Prioritaskan update `ctx-implementation.md` karena sifatnya paling dinamis.
- Jaga setiap file tetap ringkas, langsung ke poin penting, dan mudah dipakai AI.
