# Project Snapshot

## Project Ini Sebenarnya Apa?

Project ini adalah website **Brand Hub + D2C E-Commerce** untuk brand apparel essentials olahraga dan lifestyle.

Website berfungsi ganda:

- sebagai pusat identitas brand (trust, storytelling, positioning), dan
- sebagai channel penjualan langsung ke customer.

Marketplace (Shopee dan TikTok Shop) tetap dipakai sebagai channel tambahan, tetapi MVP website berjalan independen terlebih dahulu.

## Tujuan Project

### Tujuan Jangka Pendek (MVP)

- Meluncurkan website profesional yang siap transaksi end-to-end.
- Menyediakan alur beli lengkap: browse -> cart -> checkout -> payment -> shipping -> review.
- Menjadikan website sebagai aset brand, bukan hanya toko online.

### Tujuan Jangka Menengah

- Memperkuat kredibilitas brand dan pengalaman belanja premium.
- Meningkatkan repeat order melalui pengalaman yang konsisten.
- Menyiapkan fondasi sistem agar mudah dikembangkan.

## Target User

### Primary Segment

- Mahasiswa
- Young professionals
- Komunitas olahraga (running, padel, gym, golf)
- Rentang usia utama: 18-35

### Karakter User

- Aktif, mobile-first, ingin produk esensial yang nyaman.
- Mencari keseimbangan antara kualitas, harga, dan tampilan profesional.

## Product Scope

### In Scope (MVP)

- Kaos kaki
- Manset
- Celana pendek
- Boxer
- Sandal

### Out of Scope (Saat Ini)

- Marketplace sync (produk/stok/order lintas channel)
- POS
- Loyalty/referral
- Mobile app
- Fitur promo kompleks

## Architecture (Ringkas)

- Pendekatan: **Modular Monolith** (single deployable app).
- Struktur: **Feature-based modules** dengan boundary tegas.
- Pattern wajib:
  - `Presentation -> Application -> Domain -> Infrastructure`
  - inter-module hanya lewat **public service/facade**
- `admin` adalah presentation/interface layer, bukan domain module.
- `analytics/notification/reports` diposisikan sebagai cross-cutting capability.

## Tech Stack (Ringkas)

- Framework: Next.js (App Router), React, TypeScript.
- UI: Tailwind CSS, shadcn/ui, Motion.
- Backend pattern: Route Handler + Server Actions + Zod validation.
- Auth: Supabase Auth.
- Database: Supabase PostgreSQL + Prisma ORM.
- Integrasi eksternal: Midtrans (payment), Biteship (shipping), Resend (email), PostHog (analytics).
- Deployment: Vercel.

## Roadmap Sekarang

### Current Status

- Phase 0 (Planning & Documentation): **Completed**.
- Sekarang menuju Phase 1 (Implementation Setup / Project Foundation).

### Fokus Saat Ini

- Finalisasi struktur implementasi dan module boundaries.
- Setup baseline engineering (lint, typecheck, test scaffold).
- Setup auth + database integration.
- Menyiapkan readiness untuk memulai module `catalog`.

### Open Decisions yang Masih Pending

- Final branding (nama, logo, warna, typography, tone).
- Detail strategi CI/testing yang final.
- SOP operasional order/shipping untuk tahap eksekusi.
