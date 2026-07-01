# Project Foundation v0.1

> Last Updated: 30 Juni 2026

---

# Project Overview

## Project Type

Brand Website + E-Commerce

Website ini bukan sekadar toko online, tetapi merupakan pusat identitas (brand hub) yang bertujuan membangun kepercayaan pelanggan, memperkuat citra brand, dan menjadi aset jangka panjang bisnis.

Marketplace seperti Shopee dan TikTok Shop tetap digunakan sebagai channel penjualan, sedangkan website menjadi pusat pengalaman brand.

---

# Business Goals

## Tujuan Jangka Pendek

- Membangun toko online yang profesional.
- Menjual produk apparel essentials.
- Memiliki identitas brand yang kuat.
- Memberikan pengalaman belanja yang lebih eksklusif dibanding marketplace.

## Tujuan Jangka Panjang

- Membangun brand apparel yang dikenal.
- Menjadikan website sebagai pusat brand.
- Memudahkan ekspansi bisnis di masa depan.
- Memiliki arsitektur aplikasi yang mudah dikembangkan.

---

# Target Audience

Target utama:

- Mahasiswa
- Remaja
- Young Professional

Target aktivitas:

- Padel
- Golf
- Gym
- Running
- Aktivitas olahraga ringan
- Daily casual sportswear

---

# Product Catalog

Produk yang akan dijual:

- Kaos kaki
- Manset
- Celana pendek
- Boxer
- Sandal

Ke depannya masih memungkinkan menambah kategori produk baru.

---

# Brand Positioning

Website dibangun sebagai brand apparel essentials.

Fokus utama bukan menjual pakaian fashion, tetapi menyediakan kebutuhan dasar (essentials) yang nyaman, berkualitas, dan cocok digunakan untuk olahraga maupun aktivitas sehari-hari.

Beberapa ide positioning yang dapat dikembangkan:

- Everyday Sports Essentials
- Performance Basics
- Essentials For Every Game

(Posisi ini masih dapat berubah ketika branding mulai dibuat.)

---

# Marketplace Strategy

Penjualan dilakukan melalui beberapa channel:

- Website
- Shopee
- TikTok Shop

## Keputusan Saat Ini

Versi MVP belum melakukan sinkronisasi marketplace.

Website akan berjalan secara independen.

Integrasi marketplace akan dipertimbangkan pada versi berikutnya.

Namun struktur database akan disiapkan agar mudah mendukung integrasi di masa depan.

---

# Architecture Decision

## Arsitektur yang Dipilih

Modular Monolith

Alasan:

- Mudah dikembangkan.
- Tidak terlalu kompleks.
- Cocok untuk tim kecil.
- Mudah dimigrasikan menjadi Headless Architecture apabila diperlukan.

Target utama adalah menjaga agar setiap domain bisnis memiliki batas tanggung jawab yang jelas.

---

# Development Principles

Beberapa prinsip yang telah disepakati:

- Menggunakan Modular Monolith.
- Menggunakan Feature-Based Architecture.
- Business Logic tidak boleh berada di UI.
- UI tidak boleh mengakses database secara langsung.
- Antar module berkomunikasi melalui service masing-masing.
- Database dianggap sebagai detail implementasi.
- Repository Pattern akan digunakan.
- Seluruh business logic ditempatkan di domain/module.

---

# Initial Tech Stack

Framework

- Next.js (App Router)

Styling

- Tailwind CSS

UI

- shadcn/ui
- Radix UI
- Lucide Icons

Animation

- Motion

Validation

- Zod

Form

- React Hook Form

Database

- PostgreSQL

ORM

- Prisma

Authentication

- Better Auth

Payment

- Midtrans

Shipping

- Biteship (opsi utama)

Email

- Resend

Analytics

- PostHog

Deployment

- Vercel

Storage

- Cloudflare R2 atau Supabase Storage

Catatan:  
Stack ini masih dapat berubah apabila ditemukan kebutuhan baru.

---

# MVP Features

## Customer

- Landing Page
- Product Catalog
- Product Detail
- Product Variant
- Shopping Cart
- Checkout
- Payment
- Order Tracking
- Review & Rating (opsional untuk MVP)

## Admin

- Dashboard
- Product Management
- Category Management
- Inventory Management
- Banner Management
- Order Management
- Customer Management
- Sales Analytics

---

# Future Features

Belum menjadi prioritas pada MVP:

- POS
- Marketplace Synchronization
- Loyalty Program
- Membership
- Referral
- Flash Sale
- Bundle Product
- Mobile Application

---

# User Flow

## Visitor

1. Landing Page
2. Browse Product
3. Product Detail
4. Login / Register
5. Checkout

Alur: `Landing Page -> Browse Product -> Product Detail -> Login / Register -> Checkout`

## Customer

1. Landing
2. Browse Product
3. Product Detail
4. Select Variant
5. Cart
6. Checkout
7. Payment
8. Shipping
9. Order Completed
10. Review

Alur: `Landing -> Browse Product -> Product Detail -> Select Variant -> Cart -> Checkout -> Payment -> Shipping -> Order Completed -> Review`

## Admin

1. Dashboard
2. Products
3. Categories
4. Inventory
5. Orders
6. Customers
7. Banner
8. Analytics

Alur: `Dashboard -> Products -> Categories -> Inventory -> Orders -> Customers -> Banner -> Analytics`

---

# Business Modules

Module yang telah disepakati:

Core Modules

- Auth
- Customer
- Catalog
- Inventory
- Cart
- Checkout
- Order
- Payment
- Shipping
- Content
- Analytics
- Admin

## Auth

Bertanggung jawab terhadap:

- Login
- Register
- Session
- Password
- Role
- Permission

## Customer

Bertanggung jawab terhadap:

- Profile
- Address
- Wishlist
- Customer Preferences
- Purchase History

## Admin

Bertanggung jawab terhadap:

- Dashboard
- Product Management
- Order Management
- Inventory
- Analytics
- Website Settings

Keputusan penting:

Tidak akan dibuat module bernama **User** karena dianggap terlalu ambigu. Sistem akan memisahkan tanggung jawab menjadi Auth, Customer, dan Admin.

---

# Current Project Status

Phase 0 — Planning & Architecture

Status: In Progress

Checklist:

- Menentukan tujuan bisnis
- Menentukan target audience
- Menentukan jenis produk
- Menentukan arsitektur utama
- Menentukan tech stack awal
- Menentukan MVP
- Menentukan modul bisnis awal
- Menentukan struktur folder
- Menentukan database model
- Menentukan API Contract
- Menentukan UI Design System
- Menentukan Coding Convention
- Menyusun [AGENTS.md](http://AGENTS.md)
- Menyusun Context
- Menyusun Skills

---

# Next Milestone

Checkpoint berikutnya akan berfokus pada:

1. Menentukan struktur setiap Business Module.
2. Mendesain relasi antar module.
3. Mendesain Entity Relationship Diagram (ERD).
4. Mendesain struktur folder proyek.
5. Menyusun standar coding sebagai dasar pembuatan [AGENTS.md](http://AGENTS.md).

