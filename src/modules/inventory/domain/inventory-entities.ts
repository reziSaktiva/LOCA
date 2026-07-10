// ---------------------------------------------------------------------------
// Inventory Module — Domain Entities
// Sesuai docs/06-data-model.md §6.4 dan docs/05-domain-modules.md §8
// ---------------------------------------------------------------------------

export const INVENTORY_MOVEMENT_TYPES = [
  "STOCK_IN",
  "STOCK_OUT",
  "ADJUSTMENT",
  "RESERVE",
  "RELEASE",
  "COMMIT",
] as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const RESERVATION_STATUSES = ["ACTIVE", "COMMITTED", "RELEASED", "EXPIRED"] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Aggregate root: InventoryItem
// Menyimpan current stock per ProductVariant.
// availableQty = onHandQty - reservedQty (harus selalu konsisten).
// ---------------------------------------------------------------------------
export type InventoryItem = {
  id: string;
  variantId: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  createdAt: Date;
  updatedAt: Date;
};

// ---------------------------------------------------------------------------
// InventoryReservation
// Reservasi stok saat order dibuat/menunggu pembayaran.
// ---------------------------------------------------------------------------
export type InventoryReservation = {
  id: string;
  orderId: string;
  variantId: string;
  qty: number;
  reservationStatus: ReservationStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ---------------------------------------------------------------------------
// InventoryMovement (append-only audit trail)
// qtyDelta: positif untuk penambahan, negatif untuk pengurangan.
// ---------------------------------------------------------------------------
export type InventoryMovement = {
  id: string;
  variantId: string;
  movementType: InventoryMovementType;
  qtyDelta: number;
  reason: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
  createdBy: string | null;
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export type InitializeStockCommand = {
  variantId: string;
  initialQty: number;
  actorId: string;
};

export type IncreaseStockCommand = {
  variantId: string;
  qty: number;
  reason: string;
  actorId: string;
};

export type AdjustStockCommand = {
  variantId: string;
  newQty: number;
  reason: string;
  actorId: string;
};

/**
 * Upsert stok: initialize jika InventoryItem belum ada, adjust jika sudah ada.
 * Dipakai admin API agar satu endpoint bisa menangani stok pertama kali maupun koreksi.
 */
export type UpsertStockCommand = {
  variantId: string;
  newQty: number;
  reason: string;
  actorId: string;
};

export type ReserveStockItem = {
  variantId: string;
  qty: number;
};

export type ReserveStockCommand = {
  orderId: string;
  items: ReserveStockItem[];
  actorId: string;
};

export type CommitStockCommand = {
  orderId: string;
  actorId: string;
};

export type ReleaseStockCommand = {
  orderId: string;
  actorId: string;
};

export type ListMovementsQuery = {
  /** Jika diisi, hasil difilter untuk satu varian saja. Jika kosong, mengambil seluruh movement (admin). */
  variantId?: string;
  page?: number;
  limit?: number;
};

export type ListInventoryQuery = {
  page?: number;
  limit?: number;
};

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type InventoryError =
  | { code: "STOCK_NOT_FOUND"; message: string }
  | { code: "STOCK_ALREADY_EXISTS"; message: string }
  | { code: "INSUFFICIENT_STOCK"; message: string }
  | { code: "INVALID_QUANTITY"; message: string }
  | { code: "RESERVATION_NOT_FOUND"; message: string }
  | { code: "RESERVATION_ALREADY_COMMITTED"; message: string }
  | { code: "RESERVATION_ALREADY_RELEASED"; message: string };

export type InventoryResult<T> =
  { success: true; data: T } | { success: false; error: InventoryError };
