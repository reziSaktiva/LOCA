# Planning Folder

Folder ini digunakan sebagai ruang kerja (working area) selama proses perencanaan dan pengembangan proyek.

Berbeda dengan folder `docs/`, isi folder ini **tidak dianggap sebagai sumber kebenaran (Single Source of Truth)**.

Dokumen di dalam folder ini dapat berubah sewaktu-waktu selama proses diskusi.

## Tujuan

* Menyimpan ide yang belum diputuskan.
* Menyimpan backlog pekerjaan.
* Mencatat keputusan penting beserta alasannya.
* Menyimpan pertanyaan yang belum memiliki jawaban.
* Mencatat perubahan besar selama proyek berjalan.

## Perbedaan dengan folder docs

### planning/

* Bersifat sementara.
* Digunakan untuk brainstorming.
* Berisi ide, diskusi, dan catatan.
* Tidak menjadi acuan implementasi.

### docs/

* Bersifat resmi.
* Menjadi Single Source of Truth.
* Menjadi acuan development.
* Digunakan oleh AI dan developer sebagai referensi utama.

## Workflow

Alur utama:

1. Ide baru ditulis di `ideas.md`.
2. Jika ide disetujui, pindahkan ke `backlog.md`.
3. Ketika keputusan sudah final, catat di `decisions.md`.
4. Jika memengaruhi spesifikasi, perbarui dokumen di folder `docs/`.
5. Catat perubahan penting di `changelog.md`.

### Detail proses per tahap

#### 1) Menulis ide di `ideas.md`

Saat menulis ide baru, usahakan formatnya jelas agar mudah dievaluasi:

- Judul ide.
- Latar belakang masalah.
- Tujuan ide.
- Dampak ke bisnis/UX/teknis.
- Risiko atau trade-off.
- Indikator sukses sederhana.

Contoh format singkat:

```md
## Idea: Ganti hosting Vercel ke Railway

Masalah:
- Biaya/fitur deployment saat ini kurang sesuai.

Tujuan:
- Menurunkan biaya operasional dan menyederhanakan pipeline deployment.

Dampak:
- Perlu update dokumen arsitektur dan technical stack.

Risiko:
- Perubahan environment, setup CI/CD, dan proses rollback.
```

#### 2) Evaluasi ide (diterima, ditunda, atau ditolak)

Setiap ide sebaiknya diberi status agar tidak menggantung:

- `proposed`: baru diusulkan, belum diputuskan.
- `approved`: disetujui, siap masuk `backlog.md`.
- `deferred`: ditunda (bukan ditolak), tunggu kondisi tertentu.
- `rejected`: ditolak karena tidak cocok dengan prioritas/constraint saat ini.

Jika ide ditunda/ditolak, tetap simpan alasannya singkat agar keputusan bisa ditinjau ulang di masa depan.

#### 3) Jika ide disetujui -> pindah ke `backlog.md`

Saat ide masuk backlog, pecah menjadi pekerjaan yang bisa dieksekusi:

- Scope kerja yang jelas.
- Dependencies.
- Prioritas (misalnya high/medium/low).
- Definisi selesai (done criteria).

Tujuannya agar backlog berisi task implementasi, bukan diskusi mentah.

#### 4) Jika keputusan final -> catat di `decisions.md`

Dokumen `decisions.md` menyimpan keputusan resmi beserta konteks:

- Tanggal.
- Judul keputusan.
- Keputusan final.
- Alasan.
- Dampak ke dokumen/implementasi.

Prinsip penting: keputusan final harus bisa ditelusuri, bukan hanya "katanya pernah diputuskan".

#### 5) Jika memengaruhi spesifikasi -> update `docs/`

Begitu keputusan menyentuh spesifikasi, dokumen resmi wajib diperbarui agar tetap sinkron.

Contoh:

- Perubahan deployment: update `04-system-architecture.md`, `08-technical-stack.md`, dan dokumen terkait lain.
- Perubahan API: update `07-api-specification.md`.
- Perubahan rule bisnis: update `01-business.md`, lalu dokumen turunan yang terdampak.

Gunakan urutan Source of Truth di `docs/10-development-rules.md` jika ada konflik antar dokumen.

#### 6) Catat perubahan penting di `changelog.md`

Setiap perubahan besar dicatat agar riwayat proyek transparan:

- Apa yang berubah.
- Kenapa berubah.
- Dokumen/file mana yang terdampak.

---

### Penanganan jika ide gagal diterapkan

Tidak semua ide berhasil diimplementasikan, dan itu normal. Jika gagal:

1. Catat status di `backlog.md` atau `ideas.md` sebagai `blocked` / `cancelled`.
2. Tulis akar masalah singkat (misalnya constraint biaya, kompleksitas, dependency eksternal).
3. Catat keputusan akhir di `decisions.md`:
   - dibatalkan permanen, atau
   - ditunda untuk fase/release berikutnya.
4. Jika sempat ada perubahan dokumen resmi yang belum valid, lakukan penyesuaian balik agar `docs/` tetap konsisten.
5. Catat peristiwa ini di `changelog.md` sebagai pelajaran (lesson learned).

Tujuan utama: kegagalan ide tidak meninggalkan dokumentasi setengah benar.

---

### Prinsip praktis

- `planning/` adalah ruang eksperimen.
- `docs/` adalah referensi resmi implementasi.
- Ide boleh cepat berubah, tetapi keputusan final harus terdokumentasi dan konsisten.

---

## Ringkasan Isi `docs/`

Penjelasan singkat setiap dokumen resmi (Single Source of Truth) di folder `docs/`, diurutkan sesuai nomor file:

| File | Isi Singkat |
|------|-------------|
| `00-project-foundation.md` | Dokumen fondasi awal proyek (v0.1): jenis proyek, tujuan bisnis, target audience, katalog produk awal, positioning, strategi marketplace, keputusan arsitektur, tech stack awal, MVP/future features, user flow, dan daftar business module. Berfungsi sebagai draft awal sebelum dokumen lain dipecah lebih detail. |
| `01-business.md` | Spesifikasi bisnis lengkap: overview, objectives, brand positioning & DNA, target market, customer persona, cakupan produk (in/out of scope), sales channel, business rules, success metrics, dan arah bisnis jangka panjang. |
| `02-user-experience.md` | Spesifikasi UX: prinsip pengalaman, tipe user (visitor/customer/admin), user journey & flow, information architecture, navigasi, prinsip UX, aksesibilitas, responsive experience, empty/error state, dan kriteria sukses UX. |
| `03-functional-requirements.md` | Daftar functional requirement per modul fitur (Auth, Customer, Catalog, Cart, Checkout, Order, Payment, Shipping, Review, Homepage, Search, Dashboard, Notification, Reports, dsb), lengkap dengan business rules, validasi, dan non-functional requirements. |
| `04-system-architecture.md` | Arsitektur sistem: keputusan Modular Monolith, prinsip arsitektur, layer architecture, daftar module inti, request flow, pola komunikasi antar module, dependency rules, struktur folder target, shared kernel, strategi scalability, deployment, dan rencana migrasi ke microservices di masa depan. |
| `05-domain-modules.md` | Detail tiap domain module (Auth, Customer, Catalog, Inventory, Cart, Checkout, Order, Payment, Shipping, Review, Homepage): purpose, responsibilities, public service, owned entities, aggregate root, business invariant, lifecycle, dependency, events, dan future scope. Juga memuat matrix dependency antar module. |
| `06-data-model.md` | Model data berbasis domain bisnis (bukan model ORM): base entity/value object, ownership data per module, entity relationship, definisi entity per module, aggregate boundary, domain events, enumerasi status, audit fields, soft delete strategy, indexing, ID strategy, transaction boundary, retention policy, dan read model (projection layer). |
| `07-api-specification.md` | Kontrak API (REST): prinsip API, base URL, autentikasi, format response standar, HTTP status code, pagination/sorting/filtering/search, versioning, rate limiting, daftar endpoint per modul (customer & admin), error codes, dan daftar webhook (Midtrans, Biteship). |
| `08-technical-stack.md` | Daftar lengkap teknologi yang dipakai per kategori (frontend, backend, BaaS, auth, database, storage, payment, shipping, email, analytics, state management, testing, code quality, deployment, dev tools) beserta alasan pemilihannya dan future stack yang dipertimbangkan. |
| `09-design-system.md` | Panduan desain: filosofi desain, brand personality, color/typography/spacing/radius/shadow token, iconography, komponen inti, aturan layout/responsive/motion/accessibility, dark mode, pola empty state/loading/feedback/form, dan prinsip do & don't desain. |
| `10-development-rules.md` | Standar pengembangan: prinsip coding, urutan source of truth dokumentasi, naming convention, aturan struktur project, aturan business logic/UI/state/API/validasi/error handling/logging/security/database, git rules, code review checklist, testing, dependency rules, aturan khusus untuk AI assistant, dan definition of done. |
| `11-development-roadmap.md` | Roadmap pengembangan dari Phase 0 (Planning) sampai Phase 11 (Production Release), termasuk deliverable & exit criteria tiap phase, rencana rilis lanjutan (Release 2-5), development workflow, milestone, MVP scope, dan success criteria. |

### Catatan Konsistensi

Dokumen di atas secara umum saling melengkapi mengikuti urutan: bisnis → UX → requirement → arsitektur → domain → data → API → stack → desain → aturan → roadmap.

Pada audit tanggal 2 Juli 2026, ditemukan beberapa ketidaksesuaian antar dokumen (karena diisi di waktu berbeda) dan **sudah diperbaiki** di `docs/`:

- Provider autentikasi: `00` & `05` sempat menyebut *Better Auth*, sudah diselaraskan ke *Supabase Auth* (mengikuti `08`).
- `08` bagian Database (Supabase) vs bagian Deployment (sempat mencantumkan Railway PostgreSQL) sudah diselaraskan; Deployment kini mencantumkan Supabase untuk hosting database.
- Daftar business module inti di `00` (sempat menyebut `Content`, `Analytics` sebagai module) sudah diselaraskan ke `04`/`05` (`review`, `homepage`; `Admin` ditandai sebagai interface layer, `Analytics` sebagai cross-cutting concern).
- Detail status Order & Shipping di `03` sudah diselaraskan dengan versi lebih rinci di `05`/`06` (`PENDING` dan `WAITING_PAYMENT` sebagai dua state terpisah; istilah "Picked Up" menggantikan "Shipped" pada shipping status).
- Daftar prioritas "Source of Truth" di `10` sudah diperluas menyertakan `00` (dengan catatan bahwa `00` adalah draft awal), `04`, dan `08`.

Detail keputusan dicatat di `planning/decisions.md` (Decision 006) dan riwayat perubahan di `planning/changelog.md`.
