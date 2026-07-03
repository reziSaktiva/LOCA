---
name: progress-sync
description: Melaporkan progress implementasi yang baru selesai dikerjakan ke PROJECT_STATE.md, planning/changelog.md, dan context/ctx-implementation.md secara otomatis tanpa harus diminta user. Gunakan di akhir setiap task implementasi (fitur, fix, setup engineering, milestone, refactor) sebelum menyatakan task selesai, agar status project selalu sinkron.
---

# Progress Sync (Loca)

Project ini melacak status implementasi di 3 tempat yang **wajib selalu sinkron** setiap kali sebuah unit kerja implementasi selesai:

1. `PROJECT_STATE.md` — status resmi project (source of truth status/milestone).
2. `planning/changelog.md` — log historis perubahan (append-only, entry terbaru di paling atas).
3. `context/ctx-implementation.md` — snapshot ringkas untuk AI context (turunan dari `PROJECT_STATE.md`).

**Jangan menunggu user meminta.** Jalankan alur ini sendiri di akhir task yang mengubah status implementasi, sebelum melaporkan "selesai" ke user.

## Kapan Dijalankan

Jalankan setelah:

- Menyelesaikan/menutup task, milestone, atau exit criteria (mis. M3.x selesai).
- Menambah/mengubah setup engineering (dependency baru, config, tooling, plumbing infra).
- Menyelesaikan implementasi module/fitur/vertical slice.
- Memperbaiki bug signifikan yang mengubah status suatu bagian implementasi.

**Skip** untuk:

- Task murni membaca/menjawab pertanyaan tanpa perubahan file.
- Perubahan trivial yang tidak mengubah status project (typo, formatting kecil, komentar).
- Eksperimen/percobaan yang di-revert sebelum selesai.

## Alur Wajib

```
urutan tetap
1. PROJECT_STATE.md               -> update status/checklist/next action
2. planning/changelog.md          -> tambah entry baru (paling atas)
3. context/ctx-implementation.md  -> selaraskan snapshot dengan PROJECT_STATE.md
```

### 1. Update `PROJECT_STATE.md`

Sesuaikan hanya bagian yang relevan (jangan menulis ulang seluruh file):

- `Current Focus` — kalau fokus kerja berpindah.
- `Latest Decisions` — kalau ada keputusan teknis/arsitektur baru (lihat juga skill `docs-sync`).
- `Implementation State` — tambah/perbarui bullet status milestone, format: `✅ **M#.# — Nama**: ringkasan singkat. Lihat 'planning/decisions.md' Decision 0XX` (kalau ada decision terkait).
- `Next Action` — centang item selesai (`[ ]` -> `[x]`, tandai ✅), majukan pointer ke task berikutnya.
- `Milestone Checkpoint` — centang breakdown checklist milestone terkait.
- `Overall Progress` (ASCII bar) — update persentase kalau task menyelesaikan bagian signifikan dari fase Implementation.

### 2. Tambah entry di `planning/changelog.md`

Tambahkan entry BARU di paling atas (setelah heading judul + intro), jangan pernah menghapus riwayat lama.

Format tanggal: `## YYYY-MM-DD` (tanggal hari ini). Jika sudah ada entry di tanggal yang sama, tambahkan urutan `(n)` (mis. entry terakhir `(7)` -> entry baru `(8)`).

Gunakan subsection sesuai kebutuhan (boleh skip yang tidak relevan):

```md
## YYYY-MM-DD (n)

### Added

- <hal baru yang ditambahkan, sebutkan file/path>

### Changed

- <hal yang diubah>

### Verified

- <command/quality gate yang lolos, mis. `bun run check`>

### Notes

- <catatan penting, keputusan terkait, atau hal yang perlu diperhatikan berikutnya>

---
```

### 3. Selaraskan `context/ctx-implementation.md`

Ikuti aturan update di `context/README.md`. Pastikan minimal bagian berikut konsisten dengan `PROJECT_STATE.md` yang baru diupdate:

- `Current Phase` & `Current Focus`
- Bagian completed relevan (mis. `Completed (Implementation Foundation)`)
- Bagian next target relevan (mis. `Phase 1 (Next Targets)`)
- Status module di `Module Build Plan` kalau task menyentuh module tertentu

## Cross-Reference ke Skill Lain

- Task mengandung **keputusan teknis/arsitektur/business baru** -> jalankan juga skill `docs-sync` (catat di `planning/decisions.md`, update `docs/` terkait).
- Task adalah **awal** sebuah pekerjaan implementasi (bukan akhir) -> lihat skill `spec-driven-workflow` untuk validasi sebelum coding.

## Prinsip

- Update dilakukan sebagai bagian dari penyelesaian task, bukan langkah terpisah yang harus diminta user.
- Proporsional: task kecil -> update ringkas; milestone besar -> update lengkap ke 3 file.
- Jangan pernah menghapus riwayat di `planning/changelog.md`.
- Kalau ragu apakah perubahan cukup signifikan untuk dicatat, lebih baik dicatat singkat daripada dilewati.
