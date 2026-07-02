# Design Context (Ringkasan)

## Design Philosophy

- Clarity over decoration
- Functional first
- Consistent and predictable
- Fast and accessible

UI harus mencerminkan brand: modern, friendly, trustworthy, practical.

## Design Tokens (Prinsip)

- Gunakan token terstandar untuk:
  - color
  - typography
  - spacing
  - radius
  - shadow
  - motion
  - z-index
- Hindari hardcoded style value langsung di komponen.

## Color System

Gunakan grup token:

- Primary (aksi utama/CTA)
- Neutral (text/background/border)
- Success/Warning/Error/Info (semantic status)

Pastikan contrast sesuai WCAG AA.

## Typography & Spacing

- Hierarki typography harus konsisten (display -> heading -> body -> caption).
- Spacing memakai skala 4px (4, 8, 12, 16, 24, 32, dst).
- Gunakan whitespace untuk menjaga hierarchy dan fokus.

## Component Rules

- Reuse sebelum membuat komponen baru.
- Variant komponen konsisten (`default`, `secondary`, `destructive`, dll).
- State komponen lengkap saat relevan:
  - default
  - hover
  - focus
  - disabled
  - loading
  - error

## Layout & Responsive

- Mobile-first sebagai baseline.
- Breakpoint standar:
  - `sm` 640
  - `md` 768
  - `lg` 1024
  - `xl` 1280
- Struktur halaman umum:
  - page header
  - main content
  - supporting actions

## Motion Rules

- Motion harus fungsional (menjelaskan perubahan state), bukan dekoratif.
- Durasi singkat, umumnya 150-250ms.
- Konsisten easing.
- Hormati `prefers-reduced-motion`.

## Accessibility Baseline

- Semantic HTML
- Keyboard navigable controls
- Focus state terlihat
- Label form jelas
- Touch target memadai
- Alt text untuk konten visual bermakna

## Pattern Wajib di UI

- Empty state: judul jelas + deskripsi singkat + aksi lanjutan.
- Loading state: skeleton untuk konten utama, spinner untuk area kecil/aksi singkat.
- Feedback state:
  - Success: konfirmasi jelas
  - Error: jelas + arah perbaikan
  - Warning: tampilkan risiko sebelum aksi penting
  - Info: update non-kritis

## Komponen Inti

- Button, Input, Select, Checkbox, Radio, Switch
- Badge, Card, Dialog, Dropdown, Tabs
- Table, Pagination, Toast

Komponen domain-specific wajib tetap mengikuti token dan pattern global.
