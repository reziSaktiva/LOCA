---
name: docs-sync
description: Menjaga dokumentasi resmi (docs/) dan workspace perencanaan (planning/) project Loca tetap sinkron setiap kali ada keputusan baru, perubahan business rule, kontrak API, arsitektur, atau UI. Gunakan saat membuat keputusan engineering/produk, menyelesaikan task yang mengubah spesifikasi, atau saat user meminta mencatat ide/keputusan/perubahan.
---

# Docs Sync (Loca)

Project memisahkan dua ruang dokumentasi:

- **`docs/`** — resmi, Single Source of Truth, acuan implementasi.
- **`planning/`** — sementara, ruang brainstorming, tidak jadi acuan implementasi sampai dipromosikan ke `docs/`.

## Alur Wajib

```
Alur Ide
ideas.md -> backlog.md -> decisions.md -> docs/ (jika berdampak spesifikasi) -> changelog.md
```

1. **Ide baru** -> tulis di `planning/ideas.md` dengan status `proposed` / `approved` / `deferred` / `rejected`.
2. **Ide disetujui** -> pindahkan ke `planning/backlog.md` sebagai task dengan scope, dependency, prioritas (P0-P3), dan done criteria.
3. **Keputusan final** -> catat di `planning/decisions.md` memakai format: Tanggal, Judul, Keputusan, Alasan, Dampak. Keputusan harus bisa ditelusuri, bukan "katanya pernah diputuskan".
4. **Jika keputusan menyentuh spesifikasi** -> update dokumen resmi terkait di `docs/` (lihat tabel pemetaan di bawah).
5. **Catat di `planning/changelog.md`** — apa yang berubah, kenapa, file mana yang terdampak.

## Pemetaan Perubahan -> Dokumen yang Wajib Diupdate

| Jenis perubahan                                       | Dokumen `docs/` yang wajib diupdate                                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Business rule                                         | `01-business.md` -> turunan: `03-functional-requirements.md`, `05-domain-modules.md`, `06-data-model.md` |
| UX / user flow                                        | `02-user-experience.md`                                                                                  |
| API contract (endpoint, request/response, error code) | `07-api-specification.md`                                                                                |
| Arsitektur / deployment / folder structure            | `04-system-architecture.md`, `08-technical-stack.md`                                                     |
| Domain module (entity, invariant, dependency)         | `05-domain-modules.md`, `06-data-model.md`                                                               |
| UI pattern / design token                             | `09-design-system.md`                                                                                    |
| Aturan development / naming / testing                 | `10-development-rules.md`                                                                                |
| Milestone/phase/status project                        | `PROJECT_STATE.md`                                                                                       |

Gunakan urutan **Source of Truth** di `docs/10-development-rules.md` bila ada konflik antar dokumen.

## Template `decisions.md`

```md
## Decision 0XX

Judul:

<judul singkat>

Keputusan:

<keputusan final>

Alasan:

<alasan>

Dampak:

<dokumen/file yang terdampak>
```

## Template `changelog.md`

Catat: apa yang berubah, kenapa berubah, dokumen/file mana yang terdampak.

## Jika Ide/Perubahan Gagal Diterapkan

1. Tandai status `blocked` / `cancelled` di `backlog.md` / `ideas.md`.
2. Tulis akar masalah singkat.
3. Catat keputusan akhir di `decisions.md` (dibatalkan permanen atau ditunda ke fase berikutnya).
4. Jika sempat ada perubahan `docs/` yang belum valid, kembalikan agar `docs/` tetap konsisten.
5. Catat sebagai lesson learned di `changelog.md`.

## Prinsip

- `planning/` boleh cepat berubah — `docs/` tidak boleh berubah tanpa keputusan yang jelas.
- Jangan pernah mengubah `docs/` diam-diam tanpa mencatat keputusannya di `decisions.md`.
- Jika `PROJECT_STATE.md` mencerminkan status yang sudah usang setelah suatu task selesai (milestone/checklist), perbarui juga.
