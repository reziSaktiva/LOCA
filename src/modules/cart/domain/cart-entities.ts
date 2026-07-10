// ---------------------------------------------------------------------------
// Cart Module — Domain Entities
// Sesuai docs/06-data-model.md §6.5 dan docs/05-domain-modules.md §9
// ---------------------------------------------------------------------------

export const CART_STATUSES = ["ACTIVE", "CHECKED_OUT", "ABANDONED"] as const;

export type CartStatus = (typeof CART_STATUSES)[number];

// ---------------------------------------------------------------------------
// Aggregate root: Cart
// Keranjang aktif milik satu customer. MVP hanya mendukung actor Customer
// (lihat docs/07-api-specification.md §Cart — seluruh endpoint bersifat Customer-only).
// ---------------------------------------------------------------------------
export type Cart = {
  id: string;
  customerId: string;
  cartStatus: CartStatus;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

// ---------------------------------------------------------------------------
// CartItem
// Item keranjang. unitPriceSnapshot diambil dari catalog saat item ditambahkan
// dan tidak berubah otomatis saat harga produk berubah (immutable snapshot).
// ---------------------------------------------------------------------------
export type CartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineSubtotal: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Snapshot cart lengkap dengan item dan kalkulasi total.
 * Kontrak ini dipakai consumer lintas module (mis. checkout) — jangan ubah shape
 * tanpa menyesuaikan consumer.
 */
export type CartSnapshot = {
  cart: Cart;
  items: CartItem[];
  subtotal: number;
  total: number;
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export type AddItemToCartCommand = {
  customerId: string;
  variantId: string;
  quantity: number;
};

export type UpdateCartItemQuantityCommand = {
  customerId: string;
  itemId: string;
  quantity: number;
};

export type ChangeCartItemVariantCommand = {
  customerId: string;
  itemId: string;
  newVariantId: string;
};

export type RemoveCartItemCommand = {
  customerId: string;
  itemId: string;
};

export type ClearCartCommand = {
  customerId: string;
};

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type CartError =
  | { code: "ITEM_NOT_FOUND"; message: string }
  | { code: "VARIANT_NOT_FOUND"; message: string }
  | { code: "VARIANT_INACTIVE"; message: string }
  | { code: "INVALID_QUANTITY"; message: string }
  | { code: "INSUFFICIENT_STOCK"; message: string }
  | { code: "DUPLICATE_VARIANT"; message: string };

export type CartResult<T> = { success: true; data: T } | { success: false; error: CartError };
