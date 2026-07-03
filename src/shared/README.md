# Shared Kernel

`shared/` hanya untuk **technical shared concern**, bukan business logic lintas domain.

```
shared/
  kernel/           # base types, Result/Either, error, guard
  infrastructure/   # db client, logger, env, config
  events/           # domain event contract & event dispatcher
  analytics/        # tracking abstraction (PostHog, dsb.)
  ui/                # shared UI primitives lintas module (bila dibutuhkan)
```

## Aturan Wajib

- Boleh berisi: error abstraction, result type, pagination primitives, base DTO/entity teknis, logger, validator primitives, config/env loader.
- Dilarang berisi: business rule/domain policy, use case spesifik module, query/repository spesifik module.
- Dependency wajib satu arah: `modules/* -> shared/*`. `shared/` tidak boleh depend balik ke `modules/*` — ditegakkan lewat `import/no-restricted-paths` di `eslint.config.mjs`.
- Jika kode hanya relevan untuk satu domain module, kode tersebut tetap tinggal di module itu, bukan di sini.

Referensi lengkap: `docs/04-system-architecture.md` (§9-10).
