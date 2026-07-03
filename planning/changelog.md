# Changelog

Catatan perubahan besar selama proses pengembangan.

Mengikuti prinsip:

* Tambahkan entri baru di bagian atas.
* Jangan menghapus riwayat perubahan.

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
