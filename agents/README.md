# Agents

Folder ini berisi **role/persona profile** untuk mendampingi development project Loca. Setiap file adalah panduan peran (Role, Responsibility, Rules, Output Format) yang bisa dipakai untuk memberi AI assistant sudut pandang dan batasan spesifik saat mengerjakan sebuah task.

## Beda dengan `.cursor/skills/`

| | `agents/*.md` | `.cursor/skills/*/SKILL.md` |
|---|---|---|
| Cara aktif | Manual — mention pakai `@agents/<nama>.md` | Otomatis — AI memilih sendiri berdasarkan `description` |
| Isi | Persona/role (siapa yang "bicara") | Prosedur/aturan kerja (bagaimana mengerjakan) |
| Contoh | `@agents/code-reviewer.md` | `spec-driven-workflow`, `module-scaffold`, `docs-sync` |

Gunakan keduanya bersamaan: skill menjaga alur kerja tetap konsisten di semua task, persona agent memberi sudut pandang/expertise spesifik untuk request tertentu.

## Cara Pakai

1. Ketik `@` di chat Cursor, pilih file agent yang sesuai — contoh: `@agents/backend-engineer.md`.
2. Tulis instruksi task seperti biasa. AI akan mengikuti Role/Responsibility/Rules/Output Format dari file tersebut untuk request itu saja (tidak permanen ke pesan/sesi lain).
3. Boleh gabung beberapa role sekaligus untuk multi-perspektif, contoh:

   ```
   @agents/code-reviewer.md @agents/security-engineer.md — review perubahan checkout ini
   ```

## Daftar Role

| File | Kapan dipakai |
|---|---|
| `product-manager.md` | Menyusun requirement, acceptance criteria, prioritas backlog |
| `solution-architect.md` | Keputusan arsitektur besar, trade-off, ADR |
| `backend-engineer.md` | Implementasi API/service/business logic |
| `frontend-engineer.md` | Implementasi UI flow, integrasi frontend-backend |
| `ui-engineer.md` | Desain komponen, design system, mockup |
| `database-engineer.md` | Schema, migration, query performance |
| `security-engineer.md` | Threat modeling, review keamanan |
| `qa-engineer.md` | Test plan, bug report, release readiness |
| `code-reviewer.md` | Review PR/perubahan kode sebelum merge |

## Contoh Prompt

- `@agents/product-manager.md` — susun acceptance criteria untuk fitur wishlist (catat sebagai backlog, di luar MVP).
- `@agents/solution-architect.md` — evaluasi trade-off pakai Redis untuk cache katalog vs tanpa cache di MVP.
- `@agents/database-engineer.md` — review schema Prisma module order, ada indexing yang kurang?
- `@agents/qa-engineer.md` — buatkan test plan untuk flow checkout end-to-end.
- `@agents/code-reviewer.md @agents/security-engineer.md` — review PR module payment ini.

## Referensi Terkait

- `AGENTS.md` — aturan operasional umum AI assistant di repo ini.
- `.cursor/skills/` — workflow otomatis (spec-driven workflow, module scaffold, docs sync).
- `README.md` (root) — panduan cara mengerjakan project ini secara keseluruhan.
