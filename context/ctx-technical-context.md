# Technical Context (Ringkasan)

## Prinsip Pemilihan Teknologi

- Stable over trendy
- Production-ready
- Type-safe by default
- Maintainable untuk jangka panjang
- Minim dependency yang overlap

## Core Runtime & Framework

- Node.js LTS
- TypeScript
- Next.js (App Router)
- React

## Frontend Stack

- Styling: Tailwind CSS
- UI primitives/components: shadcn/ui
- Icons: Lucide React
- Animation: Motion
- Form: React Hook Form
- Validation: Zod

## Backend Pattern

- Next.js Route Handlers untuk endpoint.
- Server Actions untuk mutasi form use case tertentu.
- Validasi input wajib di server (Zod sebagai baseline).
- Arsitektur service/repository mengikuti boundary module.

## Auth, Data, Storage

- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- ORM: Prisma (akses data inti via Prisma sebagai standar)
- Storage utama: Supabase Storage
- Storage alternatif: Cloudflare R2

## External Integrations

- Payment Gateway: Midtrans
- Shipping Gateway: Biteship
- Email: Resend
- Product Analytics: PostHog

## Data Fetching & State Strategy

- Prioritas state:
  1. URL state
  2. Server state (RSC)
  3. Local state
- Tidak memakai global client state library pada MVP kecuali benar-benar perlu.
- Fetching utama: native `fetch`, Server Components, Server Actions.

## Quality & Testing

- Linting: ESLint
- Formatting: Prettier
- Git hooks: Husky + lint-staged
- Unit test: Vitest
- E2E test: Playwright

## SEO & Performance Baseline

- Next.js Metadata API
- JSON-LD
- sitemap.xml + robots.txt
- Next/Image untuk optimasi gambar
- Fokus Core Web Vitals dan target Lighthouse >= 90

## Deployment & Dev Tools

- Hosting App: Vercel
- Source control: GitHub
- Package manager: pnpm
- IDE utama: Cursor

## MVP Technology Constraints

- Belum menggunakan: Redis, queue, Meilisearch, Sentry, OpenTelemetry, Temporal.
- Tambah teknologi baru hanya jika ada kebutuhan bisnis/teknis yang jelas.
- Dahulukan fitur bawaan Next.js sebelum menambah library tambahan.
