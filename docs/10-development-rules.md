# Development Rules

Dokumen ini mendefinisikan standar pengembangan proyek agar seluruh implementasi tetap konsisten, mudah dipelihara, dan AI-friendly.

Tujuan utama:

- Menjaga kualitas codebase.
- Menstandarkan cara pengembangan fitur.
- Mengurangi technical debt.
- Menjadi acuan untuk developer maupun AI assistant.

---

# 1. Core Development Principles

Seluruh development wajib mengikuti prinsip berikut:

- Documentation First.
- Spec Driven Development.
- Business First.
- Simplicity over Cleverness.
- Readability over Brevity.
- Composition over Inheritance.
- Convention over Configuration.
- AI Friendly Architecture.

---

# 2. Source of Truth

Urutan prioritas dokumentasi:

1. Business Documentation
2. User Experience
3. Functional Requirements
4. System Architecture
5. Domain Modules
6. Data Model
7. API Specification
8. Technical Stack
9. Design System
10. Development Rules

Apabila terjadi konflik antar dokumen, gunakan urutan di atas sebagai acuan.

Catatan: `00-project-foundation.md` merupakan dokumen fondasi/draft awal proyek. Apabila isinya berbeda dengan dokumen bernomor 01 ke atas, dokumen bernomor 01 ke atas yang berlaku sebagai acuan final.

---

# 3. General Coding Principles

Seluruh code harus:

- Mudah dibaca.
- Mudah diuji.
- Mudah dipelihara.
- Tidak over-engineering.
- Tidak membuat abstraction tanpa kebutuhan nyata.
- Menghindari duplikasi (DRY) tanpa mengorbankan readability.

---

# 4. Naming Convention

## Folder

Gunakan:

```
kebab-case
```

Contoh:

```
product-detail
shopping-cart
```

---

## File

Gunakan:

```
kebab-case.ts
```

Contoh:

```
create-order.ts
update-stock.ts
```

---

## Component

Gunakan:

```
PascalCase
```

Contoh:

```
ProductCard
CheckoutSummary
```

---

## Function

Gunakan:

```
camelCase
```

Contoh:

```
createOrder()
calculateSubtotal()
```

---

## Variable

Gunakan:

```
camelCase
```

---

## Constant

Gunakan:

```
UPPER_SNAKE_CASE
```

---

## Enum

Gunakan:

```
PascalCase
```

Value enum:

```
UPPER_SNAKE_CASE
```

---

## Interface

Gunakan:

```
PascalCase
```

Tidak perlu prefix `I`.

---

## Type

Gunakan:

```
PascalCase
```

---

# 5. Project Structure Rules

Project mengikuti Feature-Based Architecture.

Setiap module memiliki struktur:

```
module/

presentation/

application/

domain/

infrastructure/
```

Setiap folder hanya bertanggung jawab pada layer tersebut.

---

# 6. Module Rules

Setiap module wajib:

- Independent.
- Memiliki aggregate sendiri.
- Memiliki repository sendiri.
- Tidak mengakses database module lain secara langsung.
- Berkomunikasi melalui public service.

---

# 7. Business Logic Rules

Business logic hanya boleh berada pada:

- Domain
- Application

Business logic dilarang berada pada:

- React Component
- Route Handler
- Server Action
- API Route
- Repository

---

# 8. UI Rules

Komponen UI harus:

- Reusable.
- Stateless bila memungkinkan.
- Tidak berisi business logic.
- Mengikuti Design System.
- Menggunakan shadcn/ui sebagai base component.

---

# 9. State Management Rules

Gunakan state seminimal mungkin.

Prioritas:

1. URL State
2. Server State
3. Local State

Hindari global state apabila belum diperlukan.

---

# 10. API Rules

Semua endpoint harus:

- RESTful.
- Konsisten.
- Menggunakan validation.
- Mengembalikan response yang seragam.

Error response harus memiliki:

- code
- message
- details (opsional)

---

# 11. Validation Rules

Seluruh input wajib divalidasi.

Validasi dilakukan pada:

- Client
- Server

Client validation hanya untuk UX.

Server validation adalah sumber kebenaran.

---

# 12. Error Handling Rules

Jangan pernah melempar error mentah ke UI.

Seluruh error harus:

- Memiliki kode.
- Memiliki pesan yang jelas.
- Dicatat ke logging.

---

# 13. Logging Rules

Log hanya digunakan untuk:

- Error
- Warning
- Audit
- External Integration

Jangan melakukan logging berlebihan.

Data sensitif tidak boleh ditulis ke log.

---

# 14. Security Rules

Wajib:

- HTTPS.
- Input validation.
- Output sanitization.
- Authentication.
- Authorization.
- CSRF Protection.
- XSS Protection.

Rahasia aplikasi tidak boleh di-hardcode.

Gunakan environment variables.

---

# 15. Database Rules

Seluruh akses database melalui repository.

Dilarang:

- Query langsung dari UI.
- Query langsung dari Route Handler.
- Query lintas module.

Migration harus versioned.

---

# 16. Performance Rules

Prioritaskan:

- Server Components.
- Lazy Loading.
- Image Optimization.
- Pagination.
- Caching bila diperlukan.

Hindari premature optimization.

---

# 17. Accessibility Rules

Minimum standar:

- Semantic HTML.
- Keyboard Navigation.
- Visible Focus.
- WCAG AA Contrast.
- Alt Text.
- ARIA bila diperlukan.

---

# 18. Git Rules

Gunakan Conventional Commits.

Contoh:

```
feat: add checkout page

fix: inventory validation

refactor: simplify order service

docs: update api specification

test: add cart unit test

chore: update dependencies
```

---

# 19. Branch Strategy

Gunakan:

```
main
```

Untuk development individu.

Jika tim bertambah:

```
main

develop

feature/*

fix/*
```

---

# 20. Code Review Checklist

Sebelum merge, pastikan:

- Business requirement sudah sesuai.
- Functional requirement terpenuhi.
- Tidak ada duplicate code.
- Tidak ada dead code.
- Tidak ada hardcoded value.
- Tidak ada console.log.
- Error handling lengkap.
- Validation lengkap.
- Type aman.
- Accessibility terpenuhi.
- Responsive.
- Test lulus.

---

# 21. Testing Rules

Prioritas testing:

1. Business Logic
2. Domain Service
3. API
4. UI

Fokus pada perilaku (behavior), bukan implementasi.

---

# 22. Dependency Rules

Sebelum menambah package baru:

- Apakah benar-benar diperlukan?
- Apakah bisa diselesaikan dengan library yang sudah ada?
- Apakah package masih aktif dipelihara?
- Apakah ukuran package masuk akal?

Kurangi dependency seminimal mungkin.

---

# 23. AI Development Rules

Seluruh AI assistant wajib mengikuti dokumentasi proyek.

AI tidak boleh:

- Mengubah business rule tanpa dokumentasi.
- Menambah dependency tanpa alasan.
- Membuat struktur folder baru tanpa persetujuan.
- Menulis business logic di UI.
- Mengubah API contract tanpa memperbarui dokumentasi.

AI harus:

- Mengikuti Design System.
- Mengikuti Domain Modules.
- Mengikuti Data Model.
- Mengikuti API Specification.
- Menghasilkan code yang konsisten dengan project.

---

# 24. Documentation Rules

Setiap perubahan besar harus memperbarui dokumentasi terkait.

Contoh:

Business berubah

↓

Update:

- Business
- Functional Requirements
- Domain
- Data Model

API berubah

↓

Update:

- API Specification

UI berubah

↓

Update:

- Design System

---

# 25. Definition of Done

Suatu task dianggap selesai apabila:

- Requirement terpenuhi.
- Code mengikuti Development Rules.
- Lint berhasil.
- Build berhasil.
- Tidak ada error TypeScript.
- Tidak ada warning penting.
- Responsive.
- Accessible.
- Dokumentasi diperbarui bila diperlukan.
- Siap untuk production.

---

# 26. Things to Avoid

Hindari:

- Over-engineering.
- Premature optimization.
- Hardcoded configuration.
- Circular dependency.
- Business logic di UI.
- Copy-paste code.
- Magic number.
- Magic string.
- Dead code.
- Comment yang menjelaskan hal yang sudah jelas.
- Dependency yang tidak digunakan.

---

# 27. Long-Term Maintainability

Seluruh keputusan development harus mempertimbangkan:

- Mudah dipahami developer baru.
- Mudah dikembangkan AI.
- Mudah di-refactor.
- Mudah di-test.
- Mudah di-scale.
- Konsisten dengan arsitektur modular monolith.

Apabila terdapat beberapa solusi yang sama-sama benar, pilih solusi yang paling sederhana, paling mudah dipelihara, dan paling konsisten dengan dokumentasi proyek.