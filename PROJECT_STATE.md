# PROJECT STATE

> Single Source of Truth untuk status proyek saat ini.

---

# Project

Status: Planning Phase

Current Version: v0.4

Project Type:

Brand Website + E-Commerce

Architecture:

Modular Monolith

Project Goal:

Membangun website sebagai **Brand Hub** sekaligus **Direct-to-Consumer (D2C) E-Commerce** untuk brand apparel essentials yang berfokus pada olahraga dan lifestyle.

---

# Current Phase

✅ Phase 0 — Planning & Discovery

Progress:

- [x] Project Foundation
- [x] Business Documentation
- [x] User Experience
- [x] Functional Requirements
- [x] System Architecture
- [ ] Technical Stack
- [x] Domain Modules
- [ ] Data Model
- [ ] API Specification
- [ ] Design System
- [ ] Development Roadmap
- [ ] Development Rules
- [ ] AGENTS.md
- [ ] Context
- [ ] Skills

---

# Current Task

Sedang mengerjakan:

`docs/06-data-model.md`

Tujuan:

Menyusun struktur entity, relasi, dan constraint database yang selaras dengan domain modules.

---

# Latest Decisions

## Business

- Website berfungsi sebagai Brand Hub sekaligus Direct Sales.
- Marketplace (Shopee & TikTok Shop) tetap digunakan sebagai channel penjualan.
- Fokus utama MVP adalah membangun brand terlebih dahulu, bukan mengejar kompleksitas fitur.
- Target market adalah mahasiswa dan young professionals dengan lifestyle olahraga modern.
- Produk diposisikan sebagai Sports Apparel Essentials.

---

## Architecture

- Modular Monolith.
- Feature-Based Architecture.
- Repository Pattern.
- Service Layer.
- Business Logic dipisahkan dari UI.
- Domain Driven Module.
- API First Internal Design.
- Siap dipisahkan menjadi Headless Commerce apabila diperlukan di masa depan.
- Inter-module communication wajib melalui Public Service.
- Shared Kernel hanya untuk technical shared concerns, bukan business logic.
- Analytics diperlakukan sebagai cross-cutting concern, bukan domain module.
- Admin diperlakukan sebagai interface, bukan domain module.
- Domain module MVP: Auth, Customer, Catalog, Inventory, Cart, Checkout, Order, Payment, Shipping, Review, Homepage.

---

## Documentation

Seluruh proyek menggunakan pendekatan:

- Documentation First
- Specification Driven Development
- AI Friendly Documentation

Urutan dokumentasi menjadi acuan utama implementasi.

---

## Functional Requirements

Setiap module memiliki:

- Purpose
- Actors
- Requirement ID
- Dependencies
- Functional Requirements
- Business Rules
- Validation

Requirement menggunakan format:

```
MODULE-001
```

Contoh:

```
PRODUCT-001
ORDER-003
CHECKOUT-005
```

---

# Open Decisions

Belum diputuskan:

## Branding

- Nama Brand
- Logo
- Warna Brand
- Typography
- Tone of Voice
- Brand Story

## Design

- Design System
- UI Components
- Motion Guidelines
- Illustration Style
- Photography Style

## Technical

- Folder Structure Detail (nama akhir dan aturan import)
- Database Design
- API Design
- Coding Convention
- Testing Strategy
- CI/CD
- Deployment Strategy

## AI Development

- AGENTS.md
- Context Files
- Skills
- Prompt Library

---

# Important Business Notes

## Target Audience

Primary

- Mahasiswa
- Mahasiswa yang sudah bekerja
- Mahasiswa yang memiliki bisnis
- Young Professionals

Target Persona

Customer ingin terlihat:

- Modern
- Aktif
- Mapan
- Profesional
- Stylish

Produk dibeli bukan hanya karena kebutuhan, tetapi juga karena image yang dibangun.

---

## Target Community

- Padel
- Running
- Gym
- Golf
- Lifestyle Community

---

## Product Categories (MVP)

- Kaos Kaki
- Manset
- Boxer
- Celana Pendek
- Sandal

Future:

- Kaos
- Jersey
- Hoodie
- Jaket
- Topi
- Tas
- Aksesoris lainnya

---

# Development Principles

- Documentation First
- Business Driven Development
- Spec Driven Development
- Long-term Maintainability
- AI Friendly Architecture
- Modular Design
- Clean Architecture
- Simplicity First
- Build MVP, Scale Later

---

# Current Repository Status

## Completed Documents

- ✅ 00-project-foundation.md
- ✅ 01-business.md
- ✅ 02-user-experience.md
- ✅ 03-functional-requirements.md
- ✅ 04-system-architecture.md
- ✅ 05-domain-modules.md

---

## In Progress

- 🚧 06-data-model.md

---

## Planned

- 06-data-model.md
- 07-api-specification.md
- 08-technical-stack.md
- 09-design-system.md
- 10-development-roadmap.md
- 11-development-rules.md

---

# Next Action

Selesaikan:

`docs/06-data-model.md`

Fokus pembahasan:

- Entity per module
- Relasi antar entitas
- Primary key dan foreign key
- Unique constraints
- Enum/status domain utama
- Audit fields (`created_at`, `updated_at`, `deleted_at`)

Setelah selesai lanjutkan ke:

`docs/07-api-specification.md`

---

# Overall Progress

Planning Progress

```
█████████████████░░░ 50%
```

Business Analysis

```
████████████████████ 100%
```

User Experience

```
████████████████████ 100%
```

Functional Specification

```
████████████████████ 100%
```

System Design

```
████░░░░░░░░░░░░░░░░  20%
```

Implementation

```
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

## 🚧 Milestone 2 — System Design (Next)

Target Deliverables:

- System Architecture
- Technical Stack
- Domain Modules
- Data Model
- API Specification

Status:

**In Progress**

---

# Notes

Seluruh keputusan bisnis utama telah ditetapkan.

Dokumen `04-system-architecture.md` telah selesai dan menjadi baseline arsitektur implementasi.
Dokumen `05-domain-modules.md` telah selesai dan menjadi baseline domain boundary.
Fokus saat ini berpindah ke `06-data-model.md` untuk memetakan entitas dan relasi berdasarkan domain modules sebelum masuk ke API specification.

Perubahan requirement bisnis sebaiknya diminimalkan agar desain sistem, database, API, dan implementasi dapat berkembang secara stabil.