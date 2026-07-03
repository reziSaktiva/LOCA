# Technical Stack

Dokumen ini mendefinisikan seluruh teknologi yang digunakan pada proyek beserta alasan pemilihannya.

Tujuan utama:

- Menjadi acuan seluruh developer.
- Menghindari penggunaan library yang tidak konsisten.
- Mendokumentasikan keputusan teknis.
- Mempermudah maintenance jangka panjang.

---

## 1. Technical Principles

Prinsip utama pemilihan teknologi:

- Stable over trendy.
- Production-ready.
- Long-term maintainability.
- Type-safe by default.
- AI-friendly ecosystem.
- Strong community support.
- Minimal dependency.
- Open source jika memungkinkan.

---

## 2. Runtime

| Technology | Purpose |
|------------|---------|
| Node.js LTS | Runtime |
| TypeScript | Programming Language |

---

## 3. Frontend

| Technology | Purpose |
|------------|---------|
| Next.js (App Router) | Web Framework |
| React | UI Library |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Lucide React | Icons  |
| Motion | Animation  |

---

## 4. Backend

| Technology | Purpose |
|------------|---------|
| Next.js Route Handler | API |
| Server Actions | Form Actions |
| Zod | Validation |

---

## 5. Backend as a Service (BaaS)

| Technology | Purpose |
|------------|---------|
| Supabase Auth | Authentication |
| Supabase PostgreSQL | Database |
| Supabase Storage | File Storage |

---

## 6. Authentication

| Technology | Purpose |
|------------|---------|
| Supabase Auth | Authentication |

---

## 7. Database

| Technology | Purpose |
|------------|---------|
| Supabase (PostgreSQL) | Primary Database |
| Prisma ORM | ORM |

---

## 8. Storage

| Technology | Purpose |
|------------|---------|
| Supabase Storage | Product Images |
| (Alternative) Cloudflare R2 | Optional |

---

## 9. Payment

| Technology | Purpose |
|------------|---------|
| Midtrans | Payment Gateway |

---

## 10. Shipping

| Technology | Purpose |
|------------|---------|
| Biteship | Shipping Gateway |

---

## 11. Email

| Technology | Purpose |
|------------|---------|
| Resend | Transactional Email |

---

## 12. Analytics

| Technology | Purpose |
|------------|---------|
| PostHog | Product Analytics |

---

## 13. State Management

| Technology | Purpose |
|------------|---------|
| React Server Components | Server State |
| URL Search Params | Filter State |
| React Context | Small Shared State |

Global client state library tidak digunakan pada MVP.

---

## 14. Data Fetching

| Technology | Purpose |
|------------|---------|
| Native Fetch | Data Fetching |
| Server Components | Initial Data |
| Server Actions | Mutations |

React Query/SWR belum digunakan pada MVP.

---

## 15. Forms

| Technology | Purpose |
|------------|---------|
| React Hook Form | Form State |
| Zod | Validation |

---

## 16. Images

| Technology | Purpose |
|------------|---------|
| Next/Image | Image Optimization |

---

## 17. SEO

| Technology | Purpose |
|------------|---------|
| Next.js Metadata API | Metadata |
| JSON-LD | Structured Data |
| sitemap.xml | Sitemap |
| robots.txt | Crawling Rules |

---

## 18. Testing

| Technology | Purpose |
|------------|---------|
| Vitest | Unit Test |
| Playwright | E2E Test |

---

## 19. Code Quality

| Technology | Purpose |
|------------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Husky | Git Hooks |
| lint-staged | Pre-commit Check |

---

## 20. Deployment

| Technology | Purpose |
|------------|---------|
| Vercel | Hosting |
| Supabase | Database Hosting (PostgreSQL) |
| GitHub | Source Code |

---

## 21. Development Tools

| Technology | Purpose |
|------------|---------|
| Cursor | AI IDE |
| Git | Version Control |
| Bun | Package Manager |

---

## 22. Future Stack

Teknologi berikut dipertimbangkan ketika kebutuhan proyek meningkat:

- Redis
- Queue (BullMQ)
- Meilisearch
- Sentry
- OpenTelemetry
- Temporal
- Background Workers
- CDN Cache Layer

Belum digunakan pada MVP untuk menjaga kompleksitas tetap rendah.

---

## 23. Technology Decision Rules

Prinsip pengambilan keputusan teknologi:

- Gunakan fitur bawaan framework sebelum menambah library baru.
- Hindari dependency yang memiliki fungsi tumpang tindih.
- Prioritaskan library dengan dokumentasi yang baik dan komunitas aktif.
- Evaluasi kebutuhan bisnis sebelum menambahkan teknologi baru.
- Semua penambahan dependency harus memiliki alasan yang jelas dan terdokumentasi.
- Untuk akses database inti, gunakan Prisma sebagai ORM utama karena type-safety end-to-end, migrasi schema yang terstruktur, dan konsistensi query lintas environment lebih baik dibanding penggunaan Supabase Client langsung.