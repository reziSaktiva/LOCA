# Domain Context (Ringkasan)

Dokumen ini merangkum domain model dalam format:
**Module -> Ownership -> Dependency -> Aggregate -> Public Service**

## Boundary Rules

- Setiap aggregate punya satu owner module.
- Module lain tidak boleh menulis langsung data module owner.
- Komunikasi lintas module hanya lewat public service/facade.
- `admin` adalah interface layer; bukan domain module.

## Module Map

### auth

- Ownership:
  - identity, credential, session, role assignment
- Dependency:
  - shared kernel, auth provider adapter (Supabase Auth)
- Aggregate:
  - `AuthIdentity`
- Public Service:
  - `registerCustomer`
  - `loginWithEmail`
  - `logout`
  - `requestPasswordReset`
  - `resetPassword`
  - `changePassword`
  - `getCurrentSession`
  - `requireRole`

### customer

- Ownership:
  - profile, address, preference
- Dependency:
  - `auth` (identity/role), `order` (history read)
- Aggregate:
  - `CustomerProfile`
- Public Service:
  - `getCustomerProfile`
  - `updateCustomerProfile`
  - `listCustomerAddresses`
  - `addCustomerAddress`
  - `updateCustomerAddress`
  - `removeCustomerAddress`
  - `getCustomerPurchaseHistory`

### catalog

- Ownership:
  - product, category, variant, media, SEO
- Dependency:
  - `inventory` (stock availability), `review` (rating summary)
- Aggregate:
  - `Product`
- Public Service:
  - `createProduct`
  - `updateProduct`
  - `archiveProduct`
  - `setProductStatus`
  - `addVariant`
  - `updateVariant`
  - `getProductBySlug`
  - `listProducts`
  - `searchProducts`

### inventory

- Ownership:
  - stock item, reservation, movement
- Dependency:
  - `catalog` (variant reference), `order` (commit/release trigger)
- Aggregate:
  - `InventoryItem`
- Public Service:
  - `getAvailableStock`
  - `assertStockAvailable`
  - `reserveStock`
  - `commitStock`
  - `releaseReservedStock`
  - `increaseStock`
  - `adjustStock`
  - `listStockMovements`

### cart

- Ownership:
  - cart, cart item
- Dependency:
  - `catalog` (variant/product status), `inventory` (availability check)
- Aggregate:
  - `Cart`
- Public Service:
  - `getActiveCart`
  - `addItem`
  - `removeItem`
  - `changeItemQuantity`
  - `changeItemVariant`
  - `clearCart`
  - `recalculateCart`

### checkout

- Ownership:
  - checkout session, checkout snapshot
- Dependency:
  - `cart`, `customer`, `shipping`, `order`, `payment`
- Aggregate:
  - `CheckoutSession`
- Public Service:
  - `prepareCheckout`
  - `getShippingOptions`
  - `selectShippingOption`
  - `selectPaymentMethod`
  - `placeOrder`

### order

- Ownership:
  - order, order item, timeline, status transition
- Dependency:
  - `checkout`, `payment`, `shipping`, `inventory`
- Aggregate:
  - `Order`
- Public Service:
  - `createOrderFromCheckout`
  - `getOrder`
  - `listCustomerOrders`
  - `listOrdersForAdmin`
  - `transitionOrderStatus`
  - `cancelOrder`
  - `markOrderPaid`
  - `attachShippingInfo`

### payment

- Ownership:
  - payment transaction, payment attempt, webhook log
- Dependency:
  - `order`, payment adapter (Midtrans)
- Aggregate:
  - `PaymentTransaction`
- Public Service:
  - `initiatePayment`
  - `getPaymentStatus`
  - `handleGatewayCallback`
  - `expirePayment`
  - `refundPayment` (future-ready)

### shipping

- Ownership:
  - shipment, rate quote, tracking event
- Dependency:
  - `order`, shipping adapter (Biteship)
- Aggregate:
  - `Shipment`
- Public Service:
  - `getShippingRates`
  - `createShipment`
  - `assignTrackingNumber`
  - `syncTrackingStatus`
  - `getShipmentByOrder`

### review

- Ownership:
  - review, rating summary, moderation log
- Dependency:
  - `order` (purchase verification), `catalog` (product reference)
- Aggregate:
  - `Review`
- Public Service:
  - `createReview`
  - `updateReview`
  - `hideReview`
  - `listProductReviews`
  - `getProductRatingSummary`
  - `canCustomerReviewProduct`

### homepage

- Ownership:
  - homepage section, banner, feature slot, schedule
- Dependency:
  - `catalog` (product reference/availability)
- Aggregate:
  - `HomepageSection`
- Public Service:
  - `getHomepageComposition`
  - `updateHeroSection`
  - `upsertBanner`
  - `setFeaturedProducts`
  - `setBestSellerProducts`
  - `setNewArrivalProducts`
  - `reorderHomepageSections`
  - `scheduleSectionVisibility`

## Dependency Chain (Ringkas)

`Auth -> Customer -> Cart -> Checkout -> Order -> Payment/Shipping`

Pendukung:

- `Catalog -> Inventory`
- `Catalog -> Review`
- `Homepage -> Catalog`
- `Review -> Order`

## Cross-Cutting (Bukan Domain Module)

- notification
- analytics
- reports

Mereka membaca data domain via service contract, tidak mengambil alih ownership domain.
