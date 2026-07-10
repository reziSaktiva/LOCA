import type { InventoryItem, ReservationStatus } from "./inventory-entities";

// ---------------------------------------------------------------------------
// Stock quantity invariants
// Sesuai docs/06-data-model.md §6.4 Stock policy (MVP)
// ---------------------------------------------------------------------------

/**
 * Jumlah stok harus integer non-negatif.
 */
export function isValidStockQty(qty: number): boolean {
  return Number.isInteger(qty) && qty >= 0;
}

/**
 * Validasi konsistensi internal InventoryItem:
 * onHandQty >= 0, reservedQty >= 0, availableQty >= 0, reservedQty <= onHandQty.
 */
export function isInventoryItemConsistent(item: InventoryItem): boolean {
  if (item.onHandQty < 0) return false;
  if (item.reservedQty < 0) return false;
  if (item.availableQty < 0) return false;
  if (item.reservedQty > item.onHandQty) return false;
  if (item.availableQty !== item.onHandQty - item.reservedQty) return false;
  return true;
}

/**
 * Stok tersedia cukup untuk memenuhi qty yang diminta.
 */
export function isStockSufficient(item: InventoryItem, requestedQty: number): boolean {
  return item.availableQty >= requestedQty;
}

/**
 * Reservation hanya bisa di-commit jika masih ACTIVE.
 */
export function canCommitReservation(status: ReservationStatus): boolean {
  return status === "ACTIVE";
}

/**
 * Reservation hanya bisa di-release jika masih ACTIVE atau EXPIRED (belum COMMITTED/RELEASED).
 */
export function canReleaseReservation(status: ReservationStatus): boolean {
  return status === "ACTIVE" || status === "EXPIRED";
}

/**
 * Alasan adjustment wajib non-empty.
 */
export function isValidAdjustmentReason(reason: string): boolean {
  return reason.trim().length > 0;
}
