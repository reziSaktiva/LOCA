# PROJECT STATE

> Single Source of Truth untuk status proyek saat ini.

---

# Project

Status: Planning Finalization (Ready for Implementation Setup)

Current Version: v0.7

Project Type:

Brand Website + E-Commerce

Architecture:

Modular Monolith

Project Goal:

Membangun website sebagai **Brand Hub** sekaligus **Direct-to-Consumer (D2C) E-Commerce** untuk brand apparel essentials yang berfokus pada olahraga dan lifestyle.

---

# Current Phase

✅ Phase 0 — Planning & Documentation (Completed)

Progress:

- [x] Project Foundation
- [x] Business Documentation
- [x] User Experience
- [x] Functional Requirements
- [x] System Architecture
- [x] Technical Stack
- [x] Domain Modules
- [x] Data Model
- [x] API Specification
- [x] Design System
- [x] Development Rules
- [x] Development Roadmap
- [ ] Phase 1 Implementation Setup

---

# Current Focus

Sedang mengerjakan:

`documentation consistency hardening`

Tujuan:

Menjaga seluruh dokumen di folder `docs/` tetap sinkron sebelum masuk ke fase implementasi, agar tidak terjadi konflik aturan saat coding, review, atau penggunaan AI assistant.

---

# Latest Decisions

## Business & Product

- Website berfungsi sebagai Brand Hub sekaligus Direct Sales.
- Marketplace (Shopee & TikTok Shop) tetap digunakan sebagai channel penjualan.
- Fokus utama MVP adalah membangun fondasi brand dan alur pembelian end-to-end yang stabil.
- Produk diposisikan sebagai Sports Apparel Essentials untuk target market mahasiswa dan young professionals.

---

## Architecture

- Modular Monolith.
- Feature-Based Architecture.
- Repository Pattern + Service Layer.
- Business Logic dipisahkan tegas dari UI/Route Handler.
- Inter-module communication wajib melalui public service.
- Shared kernel hanya untuk technical shared concerns, bukan business logic.
- `admin` diperlakukan sebagai interface/presentation layer, bukan domain module.
- `analytics` diperlakukan sebagai cross-cutting concern, bukan domain module.
- Domain module MVP: `auth`, `customer`, `catalog`, `inventory`, `cart`, `checkout`, `order`, `payment`, `shipping`, `review`, `homepage`.

---

## Technical

- Provider autentikasi resmi: **Supabase Auth**.
- Database utama: **Supabase PostgreSQL**.
- Deployment aplikasi: **Vercel**.
- ORM utama: **Prisma**.
- Kontrak status order diselaraskan ke model detail:
  - `PENDING -> WAITING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED` (+ `CANCELLED` path).
- Shipping status diselaraskan menggunakan `PICKED_UP`.

---

## Documentation Governance

- Source of Truth diperluas dan diselaraskan:
  - Business -> UX -> Functional -> System Architecture -> Domain -> Data Model -> API -> Technical Stack -> Design System -> Development Rules.
- `00-project-foundation.md` diperlakukan sebagai dokumen fondasi awal (draft baseline); jika terjadi konflik, dokumen bernomor 01+ menjadi acuan final.

---

# Open Decisions

Belum diputuskan:

## Branding

- Nama brand final
- Logo final
- Warna brand final
- Typography brand final
- Tone of voice final
- Brand story final

## Phase 1 Engineering

- Folder structure implementasi final (nama akhir + import boundary enforcement)
- Testing strategy detail per layer (unit/integration/e2e)
- CI baseline (lint, typecheck, test minimum)
- Deployment flow detail (preview, release, rollback)

## Operations

- KPI dashboard prioritas awal
- SOP operasional order handling
- SLA internal untuk proses shipping

---

# Current Repository Status

## Documentation State

- ✅ `docs/00-project-foundation.md`
- ✅ `docs/01-business.md`
- ✅ `docs/02-user-experience.md`
- ✅ `docs/03-functional-requirements.md`
- ✅ `docs/04-system-architecture.md`
- ✅ `docs/05-domain-modules.md`
- ✅ `docs/06-data-model.md`
- ✅ `docs/07-api-specification.md`
- ✅ `docs/08-technical-stack.md`
- ✅ `docs/09-design-system.md`
- ✅ `docs/10-development-rules.md`
- ✅ `docs/11-development-roadmap.md`

## Planning Workspace

- `planning/README.md` sudah memuat ringkasan seluruh dokumen `docs/`.
- `planning/decisions.md` memuat keputusan sinkronisasi terbaru (Decision 006).
- `planning/changelog.md` memuat audit update tanggal 2026-07-02.

---

# Next Action

Masuk ke **Phase 1 — Project Foundation (Implementation Setup)**:

1. Finalisasi struktur folder implementasi mengikuti domain boundaries.
2. Inisialisasi baseline engineering (lint, format, type-safety, test scaffold).
3. Setup auth + database integration sesuai keputusan final stack.
4. Menetapkan definition of ready untuk mulai build module pertama (`catalog`).

---

# Overall Progress

```
Planning & Documentation
████████████████████ 100%
```

```
System Design Readiness
████████████████████ 100%
```

```
Implementation
░░░░░░░░░░░░░░░░░░░░   0%
```

---

# Milestone Checkpoint

## ✅ Milestone 1 — Business Planning (Completed)

Deliverables:

- Project Foundation
- Business Specification
- User Experience Specification
- Functional Requirements

Status:

**Completed**

---

## ✅ Milestone 2 — System Design & Documentation (Completed)

Deliverables:

- System Architecture
- Technical Stack
- Domain Modules
- Data Model
- API Specification
- Design System
- Development Rules
- Development Roadmap

Status:

**Completed**

---

## ⏳ Milestone 3 — Implementation Foundation (Next)

Target:

- Project bootstrap siap development harian.
- Baseline quality gates berjalan.
- Module implementation dapat dimulai tanpa ambiguity dokumen.
