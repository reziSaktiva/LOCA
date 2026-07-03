# Modules

Setiap domain module di sini bersifat independen (Modular Monolith, Feature-Based Architecture) dan wajib mengikuti 5 layer berikut:

```
modules/<module-name>/
  presentation/     # UI component, hook, form khusus module ini
  application/      # use case / orchestrasi business logic
  domain/           # entity, aggregate, business rule, invariant (pure, no framework)
  infrastructure/   # repository (Prisma/Supabase), adapter provider eksternal
  public/           # satu-satunya kontrak yang boleh dipakai module lain
```

## Aturan Wajib

- Dependency arah: `presentation -> application -> domain`. `infrastructure` mengimplementasikan contract dari `application`/`domain`.
- Business logic **hanya** di `domain` dan `application`.
- `domain` tidak boleh depend ke layer lain atau framework — harus pure.
- `presentation` dilarang mengakses `infrastructure` langsung.
- Module lain **hanya** boleh masuk lewat `public/` — dilarang import `presentation`/`application`/`domain`/`infrastructure` module lain secara langsung.
- Aturan ini ditegakkan otomatis lewat `import/no-restricted-paths` di `eslint.config.mjs`.

## Module MVP

`auth, customer, catalog, inventory, cart, checkout, order, payment, shipping, review, homepage`

`admin` = presentation/interface layer (bukan domain module). `analytics` = cross-cutting concern (lihat `shared/analytics`).

Referensi lengkap: `docs/04-system-architecture.md`, `docs/05-domain-modules.md`. Untuk workflow membuat module baru, lihat skill `.cursor/skills/module-scaffold/SKILL.md`.
