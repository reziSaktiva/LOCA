---
name: module-scaffold
description: Membuat atau menambah domain module baru sesuai struktur Modular Monolith feature-based project Loca (layer presentation/application/domain/infrastructure + public service facade). Gunakan saat membuat folder module baru (mis. catalog, cart, checkout, payment), menambah fitur ke module yang sudah ada, atau saat perlu memvalidasi apakah suatu kode berada di layer/module yang benar.
---

# Module Scaffold (Loca)

Project menggunakan **Modular Monolith** dengan **Feature-Based Architecture**. Setiap domain module independen, punya aggregate & repository sendiri, dan hanya berkomunikasi lewat public service.

## Target Folder Structure

```text
src/
  app/                        # App Router (route segments, layout, page, api)
  modules/
    <module-name>/
      presentation/           # UI component, hook, form khusus module ini
      application/            # use case / orchestrasi business logic
      public/                 # public service/facade — satu-satunya pintu masuk dari module lain
      domain/                 # entity, aggregate, business rule, invariant
      infrastructure/         # repository, adapter provider eksternal
  shared/
    kernel/                   # base types, Result/Either, error, guard
    infrastructure/           # db client, logger, env, config
    events/                   # domain event contract & dispatcher
    analytics/                # tracking abstraction (PostHog, dsb.)
    ui/                       # shared UI primitives (jika dibutuhkan lintas module)
```

Module MVP resmi: `auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage`.

Catatan posisi khusus:
- `admin` = presentation/interface layer, **bukan** domain module.
- `analytics`, `notification`, `reports` = cross-cutting concern, **bukan** domain module.

## Aturan Setiap Layer

| Layer | Boleh berisi | Dilarang berisi |
|---|---|---|
| `presentation` | Komponen UI, hook, form binding, state UI lokal | Business logic, akses repository langsung |
| `application` | Use case, orchestrasi antar domain/service, validasi input (Zod) | Detail framework/provider eksternal |
| `domain` | Entity, aggregate root, business invariant, domain event | Dependency ke framework/provider (harus pure) |
| `infrastructure` | Repository (akses Prisma/Supabase), adapter provider eksternal (Midtrans, Biteship, Resend) | Business rule |
| `public` | Service/facade yang diekspor untuk dipakai module lain | Implementasi detail internal |

Business logic **hanya** boleh berada di `domain` dan `application` — dilarang di React component, route handler, server action, atau repository.

## Aturan Antar-Module

- Module lain **hanya** boleh memanggil lewat `public/` (service/facade), tidak boleh import langsung ke `domain`/`infrastructure` module lain.
- Dilarang query database lintas module secara langsung — selalu lewat public service pemilik data.
- `shared/kernel` hanya untuk technical shared concern (error, result type, guard), **bukan** tempat business rule lintas domain.

## Naming Convention

- Folder & file: `kebab-case` (`product-detail/`, `create-order.ts`).
- Component: `PascalCase` (`ProductCard`, `CheckoutSummary`).
- Function & variable: `camelCase` (`createOrder()`, `calculateSubtotal()`).
- Constant: `UPPER_SNAKE_CASE`.
- Enum & Interface & Type: `PascalCase` (enum value: `UPPER_SNAKE_CASE`, interface tanpa prefix `I`).

## Checklist Membuat Module Baru

- [ ] Buat 5 subfolder: `presentation`, `application`, `public`, `domain`, `infrastructure`.
- [ ] Definisikan aggregate root & entity di `domain/` sesuai `docs/06-data-model.md`.
- [ ] Definisikan public service di `public/` sebagai satu-satunya kontrak yang boleh dipakai module lain.
- [ ] Repository di `infrastructure/` akses data lewat Prisma — jangan expose Prisma client langsung ke layer lain.
- [ ] Validasi dependency ke module lain sesuai matrix di `docs/05-domain-modules.md` — pastikan tidak menciptakan circular dependency.
- [ ] Cek functional requirement module terkait di `docs/03-functional-requirements.md` sebelum menulis use case.

## Referensi

- Struktur lengkap & alasan arsitektur: `docs/04-system-architecture.md`.
- Detail per module (purpose, entities, invariant, dependency matrix): `docs/05-domain-modules.md`.
- Model data & aggregate boundary: `docs/06-data-model.md`.
