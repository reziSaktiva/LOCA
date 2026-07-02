# Development Context (Rule Ringkas)

## Core Principles

- Documentation first
- Spec driven development
- Business first
- Simplicity over cleverness
- Readability over brevity
- Convention over configuration

## Source of Truth Priority

Jika ada konflik dokumen, urutan acuan:

1. Business
2. User Experience
3. Functional Requirements
4. System Architecture
5. Domain Modules
6. Data Model
7. API Specification
8. Technical Stack
9. Design System
10. Development Rules

Catatan: `docs/00-project-foundation.md` adalah fondasi awal; dokumen `01+` tetap acuan final saat konflik.

## Architecture & Module Rules

- Gunakan feature-based modular monolith.
- Setiap module harus independen, punya aggregate dan repository sendiri.
- Dilarang query lintas module secara langsung.
- Inter-module hanya lewat public service/facade.
- Business logic hanya di application/domain.
- UI, route handler, server action tidak boleh menyimpan business rule.

## Naming Convention

- Folder/file: `kebab-case`
- Component: `PascalCase`
- Function/variable: `camelCase`
- Constant: `UPPER_SNAKE_CASE`
- Type/interface/enum name: `PascalCase`

## API & Validation Rules

- Endpoint konsisten dan tervalidasi.
- Response error wajib seragam: `code`, `message`, `details?`.
- Validasi client untuk UX, validasi server adalah source of truth.

## Database Rules

- Akses database hanya melalui repository.
- Tidak boleh query DB dari UI/route secara langsung.
- Migration wajib versioned.
- Jaga boundary ownership per module.

## Security Rules

- HTTPS wajib
- Input validation + output sanitization
- Auth + authorization wajib
- Proteksi CSRF/XSS wajib
- Secret tidak boleh hardcoded

## UI/UX Rules

- Gunakan reusable component.
- Komponen sebisa mungkin stateless.
- Ikuti design system secara konsisten.
- Gunakan shadcn/ui sebagai base component.

## Performance & Accessibility

- Prioritaskan server components, lazy loading, image optimization, pagination.
- Hindari premature optimization.
- Minimum aksesibilitas: semantic HTML, keyboard nav, visible focus, WCAG AA contrast, alt text.

## Git & Review Rules

- Gunakan Conventional Commits.
- Hindari dead code, hardcoded values, console log.
- Pastikan error handling, validation, typing, aksesibilitas, dan responsive terpenuhi sebelum merge.

## Definition of Done (Ringkas)

Task dianggap selesai jika:

- requirement terpenuhi,
- lint/build/typecheck lolos,
- tidak ada warning penting,
- dokumentasi terkait sudah diupdate bila ada perubahan besar,
- siap production secara kualitas dasar.
