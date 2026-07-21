# API Specification

Dokumen ini mendefinisikan kontrak komunikasi antara client dan sistem.

Dokumen ini **tidak menjelaskan business rules, domain model, ataupun implementasi internal**, karena seluruh informasi tersebut sudah didokumentasikan pada:

- `01-business.md`
- `02-user-experience.md`
- `03-functional-requirements.md`
- `04-system-architecture.md`
- `05-domain-modules.md`
- `06-data-model.md`

Fokus dokumen ini hanya pada **API Contract**.

---

# 1. API Principles

Prinsip utama API:

- RESTful API.
- Resource-oriented endpoint.
- JSON request & response.
- Stateless communication.
- Consistent naming.
- Versioned API.
- Predictable error response.
- Idempotent jika diperlukan.
- Authentication menggunakan Bearer Token.
- Semua endpoint private wajib membutuhkan autentikasi.

---

# 2. Base URL

Development

```
http://localhost:3000/api/v1
```

Production

```
https://your-domain.com/api/v1
```

---

# 3. Authentication

Protected endpoint menggunakan:

```
Authorization: Bearer <access_token>
```

Role yang digunakan:

- Public
- Customer
- Admin

---

# 4. Content Type

Request

```
Content-Type: application/json
```

Response

```
Content-Type: application/json
```

File upload

```
multipart/form-data
```

---

# 5. Standard Response Format

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

---

# 6. HTTP Status Code

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# 7. Pagination

Query

```
?page=1
&limit=20
```

Response

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# 8. Sorting

Format

```
?sort=name
?sort=-createdAt
```

---

# 9. Filtering

Contoh

```
?category=socks

?status=ACTIVE

?brand=my-brand

?minPrice=100000

?maxPrice=300000
```

---

# 10. Search

```
?q=running+socks
```

---

# 11. API Versioning

Versi API menggunakan URL.

```
/api/v1
```

Perubahan breaking change akan dibuat pada versi baru.

Contoh

```
/api/v2
```

---

# 12. Rate Limiting

Default policy:

- Public API memiliki rate limit.
- Auth endpoint memiliki rate limit lebih ketat.
- Admin API hanya dapat diakses oleh user yang telah terautentikasi.

---

# 13. Endpoint Convention

Resource menggunakan bentuk plural.

Contoh

```
/products

/orders

/customers
```

Identifier menggunakan id.

```
/products/{id}
```

Slug menggunakan endpoint khusus.

```
/products/slug/{slug}
```

---

# 14. API Modules

## Authentication

Base Path

```
/auth
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | /register | Register customer | Public |
| POST | /login | Login | Public |
| POST | /logout | Logout | Customer/Admin |
| POST | /forgot-password | Request password reset | Public |
| POST | /reset-password | Reset password | Public |
| POST | /change-password | Change password | Customer/Admin |
| GET | /me | Current user | Customer/Admin |

---

## Customer

Base Path

```
/customers
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /me | Customer profile | Customer |
| PATCH | /me | Update profile | Customer |
| POST | /avatar | Upload avatar | Customer |
| GET | /addresses | List addresses | Customer |
| POST | /addresses | Create address | Customer |
| PATCH | /addresses/{id} | Update address | Customer |
| DELETE | /addresses/{id} | Delete address | Customer |

---

## Catalog

Base Path

```
/products
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Product listing | Public |
| GET | /slug/{slug} | Product detail (variants ACTIVE + media + stok `availableQty`/`inStock`) | Public |
| GET | /search | Search products | Public |
| GET | /categories | Categories | Public |

Catatan `GET /slug/{slug}` response `data`:

- Field dasar: `id`, `name`, `slug`, `description`, `brand`, `categoryId`, `priceFrom`, `priceTo`, `thumbnailUrl`
- `variants[]`: `id`, `sku`, `price`, `compareAtPrice`, `variantLabel`, `availableQty`, `inStock`
- `media[]`: `id`, `url`, `altText`, `sortOrder`, `mediaType` (fallback ke thumbnail bila gallery kosong)

---

## Cart

Base Path

```
/cart
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Active cart | Customer |
| POST | /items | Add item | Customer |
| PATCH | /items/{id} | Update item | Customer |
| DELETE | /items/{id} | Remove item | Customer |
| DELETE | / | Clear cart | Customer |

---

## Checkout

Base Path

```
/checkout
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Checkout session | Customer |
| POST | /shipping | Select shipping | Customer |
| POST | /payment | Select payment | Customer |
| POST | /place-order | Place order | Customer |

---

## Orders

Base Path

```
/orders
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Customer orders | Customer |
| GET | /{id} | Order detail | Customer |
| POST | /{id}/cancel | Cancel order | Customer |

---

## Payments

Base Path

```
/payments
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /{orderId} | Payment status | Customer |
| POST | /callback | Payment callback | System |

---

## Shipping

Base Path

```
/shipments
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | /{orderId} | Shipment detail | Customer |
| GET | /{orderId}/tracking | Tracking history | Customer |

---

## Reviews

Base Path

```
/reviews
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | / | Create review | Customer |
| PATCH | /{id} | Update review | Customer |
| GET | /product/{productId} | Product reviews | Public |

---

## Homepage

Base Path

```
/homepage
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Homepage content | Public |

---

## Admin

Base Path

```
/admin
```

### Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /products | List products |
| POST | /products | Create product |
| GET | /products/{id} | Product detail |
| PATCH | /products/{id} | Update product |
| DELETE | /products/{id} | Archive product |

### Categories

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /categories | List categories |
| POST | /categories | Create category |
| PATCH | /categories/{id} | Update category |
| DELETE | /categories/{id} | Archive category |

### Inventory

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /inventory | Inventory list |
| PATCH | /inventory/{variantId} | Adjust stock |
| GET | /inventory/movements | Stock movements |

### Orders

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /orders | Order list |
| GET | /orders/{id} | Order detail |
| PATCH | /orders/{id}/status | Update order status |

### Homepage

| Method | Endpoint | Description |
|---------|----------|-------------|
| PATCH | /homepage | Update homepage |

### Dashboard

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /dashboard | Dashboard summary |

### Reports

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /reports/sales | Sales report |
| GET | /reports/products | Product report |
| GET | /reports/customers | Customer report |
| GET | /reports/inventory | Inventory report |

---

# 15. Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Validation failed |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Permission denied |
| NOT_FOUND | Resource not found |
| CONFLICT | Resource conflict |
| OUT_OF_STOCK | Stock unavailable |
| PAYMENT_FAILED | Payment failed |
| PAYMENT_EXPIRED | Payment expired |
| ORDER_CANCELLED | Order cancelled |
| INTERNAL_ERROR | Unexpected server error |

---

# 16. Webhooks

External callback endpoints.

| Provider | Endpoint |
|----------|----------|
| Midtrans | /payments/callback |
| Biteship | /shipments/webhook |

Semua webhook wajib:

- Signature verification.
- Idempotency.
- Audit logging.

---

# 17. API Evolution Policy

Aturan perubahan API:

- Endpoint yang sudah dipublikasikan tidak boleh diubah secara breaking.
- Breaking change dibuat pada versi API baru.
- Penambahan field response diperbolehkan selama tidak mengubah kontrak lama.
- Deprecated endpoint harus memiliki masa transisi sebelum dihapus.

---

# 18. Out of Scope

Dokumen ini tidak membahas:

- Business Rules
- Database Design
- ORM Model
- Repository Pattern
- Service Layer
- Internal Module Communication
- Domain Events
- Folder Structure
- Framework Implementation

Seluruh detail tersebut telah dijelaskan pada dokumen sebelumnya.