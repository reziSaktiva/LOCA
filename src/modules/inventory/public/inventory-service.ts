/**
 * Inventory Public Service / Facade
 *
 * Entry point untuk semua consumer lintas module (Cart, Checkout, Order, Admin).
 * Semua akses ke Inventory harus melalui fungsi di file ini.
 */

import {
  adjustStock,
  increaseStock,
  initializeStock,
  upsertStock,
} from "../application/manage-stock";
import {
  assertStockAvailable,
  getStockByVariantId,
  listInventoryItems,
  listStockMovements,
} from "../application/check-stock";
import { commitStock, releaseReservedStock, reserveStock } from "../application/reserve-stock";
import { PrismaInventoryRepository } from "../infrastructure/prisma-inventory-repository";
import type {
  AdjustStockCommand,
  CommitStockCommand,
  IncreaseStockCommand,
  InitializeStockCommand,
  InventoryItem,
  InventoryMovement,
  InventoryResult,
  ListInventoryQuery,
  ListMovementsQuery,
  ReleaseStockCommand,
  ReserveStockCommand,
  UpsertStockCommand,
} from "../domain/inventory-entities";
import type { ListInventoryResult } from "../domain/inventory-repository";

export type {
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
  InventoryMovementType,
  ReservationStatus,
  InventoryError,
  InventoryResult,
  ReserveStockItem,
  InitializeStockCommand,
  IncreaseStockCommand,
  AdjustStockCommand,
  UpsertStockCommand,
  ReserveStockCommand,
  CommitStockCommand,
  ReleaseStockCommand,
  ListInventoryQuery,
  ListMovementsQuery,
} from "../domain/inventory-entities";
export type { ListInventoryResult } from "../domain/inventory-repository";

const repository = new PrismaInventoryRepository();

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Mengambil data stok suatu varian. Null jika belum ada InventoryItem. */
export async function inventoryGetStock(variantId: string): Promise<InventoryItem | null> {
  return getStockByVariantId(repository, variantId);
}

/**
 * Mengambil daftar seluruh InventoryItem dengan pagination.
 * Consumer: Admin (halaman daftar stok).
 */
export async function inventoryListItems(query: ListInventoryQuery): Promise<ListInventoryResult> {
  return listInventoryItems(repository, query);
}

/**
 * Memastikan stok tersedia untuk suatu qty.
 * Consumer: Cart, Checkout, Product Detail.
 */
export async function inventoryAssertStockAvailable(
  variantId: string,
  qty: number,
): Promise<InventoryResult<InventoryItem>> {
  return assertStockAvailable(repository, variantId, qty);
}

/** Melihat riwayat movement stok suatu varian. */
export async function inventoryListMovements(
  query: ListMovementsQuery,
): Promise<{ items: InventoryMovement[]; total: number }> {
  return listStockMovements(repository, query);
}

// ---------------------------------------------------------------------------
// Write (Admin)
// ---------------------------------------------------------------------------

/** Inisialisasi stok baru untuk varian. Dipanggil saat varian dibuat. */
export async function inventoryInitializeStock(
  command: InitializeStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  return initializeStock(repository, command);
}

/** Menambah stok varian (STOCK_IN). */
export async function inventoryIncreaseStock(
  command: IncreaseStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  return increaseStock(repository, command);
}

/**
 * Adjustment stok ke nilai absolut baru.
 * Wajib sertakan alasan untuk audit trail.
 */
export async function inventoryAdjustStock(
  command: AdjustStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  return adjustStock(repository, command);
}

/**
 * Upsert stok: initialize jika belum ada InventoryItem, adjust jika sudah ada.
 * Dipakai admin API `PATCH /admin/inventory/{variantId}` agar satu endpoint menangani kedua kasus.
 */
export async function inventoryUpsertStock(
  command: UpsertStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  return upsertStock(repository, command);
}

// ---------------------------------------------------------------------------
// Write (System — Cart, Order, Payment)
// ---------------------------------------------------------------------------

/**
 * Mereservasi stok untuk semua item order.
 * All-or-nothing: jika satu item gagal, tidak ada yang di-reserve.
 * Consumer: Cart (saat checkout), Order.
 */
export async function inventoryReserveStock(
  command: ReserveStockCommand,
): Promise<InventoryResult<void>> {
  return reserveStock(repository, command);
}

/**
 * Commit reservasi setelah payment dikonfirmasi.
 * Consumer: Payment (setelah webhook confirmed).
 */
export async function inventoryCommitStock(
  command: CommitStockCommand,
): Promise<InventoryResult<void>> {
  return commitStock(repository, command);
}

/**
 * Release reservasi saat order dibatalkan atau expired.
 * Consumer: Order (saat cancel), Payment (saat expired).
 */
export async function inventoryReleaseReservedStock(
  command: ReleaseStockCommand,
): Promise<InventoryResult<void>> {
  return releaseReservedStock(repository, command);
}
