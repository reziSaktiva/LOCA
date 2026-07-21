---
name: proactive-clarification
description: >-
  Memandu AI untuk secara proaktif mengidentifikasi keputusan yang belum ditentukan
  sebelum mengeksekusi tugas di project Loca — dokumentasi, fitur, arsitektur,
  konfigurasi, UX/UI, atau interaksi lain. AI harus bertanya terlebih dahulu dengan
  pilihan terbaik di kelasnya (selaras stack & SSOT Loca), bukan langsung berasumsi.
  Gunakan sebelum mengerjakan tugas apapun yang memiliki fork keputusan belum jelas.
---

# Proactive Clarification (Loca)

Sebelum mengerjakan tugas apapun, identifikasi apakah ada keputusan penting yang belum ditentukan — yang kalau diasumsikan bisa menghasilkan output salah arah. Jika ada, **tanya dulu**. Baru kerjakan.

Skill ini melengkapi `spec-driven-workflow`: baca SSOT dulu; jika SSOT + decisions belum menjawab fork, jangan berasumsi — klarifikasi ke manusia.

---

## Prinsip Dasar

**Jangan berasumsi, tanya dulu** — berlaku untuk SEMUA jenis tugas:

- Membuat atau merevisi dokumentasi (`docs/`, `planning/`)
- Membangun fitur, module, atau vertical slice
- Memilih library, tool, atau service **di luar** stack yang sudah ditetapkan
- Merancang arsitektur, kontrak API, atau flow antar module
- Konfigurasi environment atau infrastruktur
- Keputusan desain UX/UI di luar pola `docs/09-design-system.md`

**Pengecualian — jangan tanya ulang** jika keputusan sudah ada di baseline:

1. `docs/` (prioritas SSOT — lihat `AGENTS.md` / `docs/10-development-rules.md`)
2. `planning/decisions.md`
3. `PROJECT_STATE.md` → Latest Decisions / Open Decisions (item yang sudah closed)
4. Stack resmi di `docs/08-technical-stack.md` (contoh: Next.js, Bun, Supabase Auth, Prisma, shadcn/ui)

---

## Baseline yang Sudah Diputuskan (jangan tanya ulang)

| Area | Keputusan aktif |
|------|-----------------|
| Auth | Supabase Auth |
| Database / ORM | Supabase PostgreSQL + Prisma |
| Package manager | Bun |
| UI primitives | shadcn/ui + Tailwind + design tokens LOCA |
| Arsitektur | Modular Monolith, layer `presentation → application → domain → infrastructure` |
| Inter-module | Hanya lewat public service/facade |
| Workflow phase | Backend selesai → UI catch-up dalam phase yang sama (Decision 022) |
| Commit | Tidak auto-commit; tunggu instruksi eksplisit manusia (Decision 021) |

Jika user meminta sesuatu yang **bertentangan** dengan baseline di atas, **tanya konfirmasi eksplisit** sebelum melanjutkan (jangan diam-diam override).

---

## Kapan Harus Bertanya

Tanya sebelum eksekusi jika ada **fork keputusan** yang:

1. **Belum ada di baseline** — tidak ada di `docs/`, `planning/decisions.md`, atau item closed di `PROJECT_STATE.md`
2. **Berdampak signifikan pada output** — pilihan berbeda menghasilkan dokumen / kode / kontrak / struktur yang berbeda secara substansial
3. **Memiliki opsi valid yang setara** — tidak ada satu jawaban yang "jelas benar" dari SSOT

### Contoh Fork yang Harus Ditanyakan (konteks Loca)

| Konteks | Contoh pertanyaan |
|---------|-------------------|
| Checkout / payment | Strategi stock reservation kapan? (saat place order vs saat payment confirmed) — jika belum final di docs |
| Shipping | Detail SLA / opsi kurir MVP mana yang di-expose ke customer? |
| Admin UX | Pattern navigasi admin untuk fitur baru? (tambah item sidebar vs nested route) |
| Catalog UI | Empty / error / loading state mengikuti pola mana jika belum ada di design system? |
| API contract | Breaking change vs versioned additive? (jika mengubah `docs/07`) |
| Cross-module | Module mana yang memiliki entity X jika boundary di `docs/05` masih ambigu |
| Scope milestone | Potong scope ke vertical slice lebih kecil, atau kerjakan full acceptance criteria backlog? |
| Open Decisions | Item di `PROJECT_STATE.md` → Open Decisions yang relevan dengan task saat ini |

### Contoh yang TIDAK Perlu Ditanyakan

- Auth pakai apa? → sudah Supabase Auth
- ORM pakai apa? → sudah Prisma
- Commit sekarang? → hanya jika user belum bilang; default: jangan commit
- Business rule yang sudah tertulis di `docs/01`–`docs/03` → ikuti docs

---

## Cara Bertanya

### 1. Identifikasi Fork-nya

Sebelum bertanya, tentukan:

- Apa yang belum jelas?
- Apa dampaknya terhadap output (docs / API / module / UI)?
- Apa saja opsi terbaik yang **relevan untuk stack Loca**?

### 2. Sajikan Pilihan Terbaik

Berikan opsi yang **benar-benar terbaik di kelasnya** untuk konteks project ini — bukan daftar semua yang ada. Kuasi: maks 4–5 pilihan. Sertakan konteks singkat mengapa masing-masing menarik.

**Format conversational:**

```
Sebelum saya mulai, ada satu keputusan yang perlu kamu tentukan dulu:

**[Aspek yang perlu diputuskan]**

Pilihan terbaik:
- **[Opsi A]** — [mengapa menarik / kapan cocok untuk Loca]
- **[Opsi B]** — [mengapa menarik / kapan cocok untuk Loca]
- **[Opsi C]** — [mengapa menarik / kapan cocok untuk Loca]

Mana yang ingin kamu gunakan?
```

Jika tool `AskQuestion` tersedia, gunakan untuk jawaban terstruktur.

### 3. Satu Topik per Pertanyaan

Jangan tumpuk semua pertanyaan sekaligus. Jika ada lebih dari satu fork:

- Tanyakan yang paling berdampak dulu (biasanya: business rule / module ownership / API contract).
- Setelah dijawab, tanyakan berikutnya jika masih diperlukan.
- Atau batch dalam satu sesi AskQuestion jika semua fork memang blocking sebelum mulai.

---

## Kualitas Pilihan yang Disajikan

Pilihan harus:

- **Relevan** — cocok dengan Modular Monolith Loca, fase roadmap (`docs/11`), dan stack resmi
- **Terbaik di kelasnya** — proven, aktif dipakai, selaras konvensi repo
- **Dikurasi** — buang opsi outdated atau yang bertentangan dengan baseline tanpa alasan kuat
- **Berisi konteks** — satu kalimat mengapa menarik / kapan paling cocok

### Contoh Pilihan yang Baik (timing stock reservation)

```
- **Reserve saat place order** — stok terkunci lebih awal; cocok jika checkout → payment gap pendek
- **Reserve saat payment confirmed** — stok lebih longgar; butuh handling oversell / race di checkout
- **Soft-hold di cart + hard reserve di order** — UX cart tetap fleksibel; kompleksitas lebih tinggi
```

### Contoh Pilihan yang Buruk (jangan lakukan)

```
- Redis lock
- Database lock
- Optimistic UI only
- Manual admin adjust
- ...
```

Terlalu generik, tanpa konteks Loca, tidak dikurasi.

---

## Setelah Mendapat Jawaban

1. Konfirmasi pilihan dalam satu kalimat.
2. Jika keputusan bersifat permanen / berdampak spesifikasi → jalankan skill `docs-sync`:
   - catat di `planning/decisions.md`
   - update `docs/` terkait bila perlu
   - catat di `planning/changelog.md`
3. Lanjutkan eksekusi lewat `spec-driven-workflow` (baca SSOT → implementasi → quality gate → progress-sync).
4. **Jangan commit** kecuali manusia meminta eksplisit.

---

## Relasi dengan Skill Lain

| Situasi | Skill |
|---------|--------|
| Fork belum jelas sebelum kerja | **proactive-clarification** (ini) |
| Mulai implementasi setelah jelas | `spec-driven-workflow` |
| Module/folder baru | `module-scaffold` |
| Keputusan baru perlu dicatat | `docs-sync` |
| Task implementasi selesai | `progress-sync` |

---

## Aturan Kritis

- Jangan skip pertanyaan meski merasa sudah tahu jawabannya — kecuali sudah ada di baseline.
- Jangan ajukan pertanyaan trivial yang tidak mempengaruhi output secara substansial.
- Jangan listing opsi outdated, tidak relevan, atau yang sudah ditolak di `planning/decisions.md`.
- Jika user bilang "terserah kamu" / "kamu yang putuskan" — pilih opsi terbaik dengan alasan singkat, konfirmasi, lalu jalan.
- Jika jawaban user mengubah business rule atau API contract — **wajib** docs-sync sebelum atau segera setelah implementasi.
- Jangan mengubah scope milestone diam-diam; jika scope membesar, tanya dulu.
