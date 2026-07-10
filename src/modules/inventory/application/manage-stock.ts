import type {
  AdjustStockCommand,
  IncreaseStockCommand,
  InitializeStockCommand,
  InventoryItem,
  InventoryResult,
} from "../domain/inventory-entities";
import { isValidAdjustmentReason, isValidStockQty } from "../domain/inventory-invariants";
import type { InventoryRepository } from "../domain/inventory-repository";

/**
 * Membuat InventoryItem untuk varian baru.
 * Hanya dipanggil sekali saat varian pertama kali membutuhkan stok (mis. dari admin).
 */
export async function initializeStock(
  repository: InventoryRepository,
  command: InitializeStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  if (!isValidStockQty(command.initialQty)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Jumlah stok awal tidak valid. Harus berupa integer >= 0." },
    };
  }

  const exists = await repository.existsByVariantId(command.variantId);
  if (exists) {
    return {
      success: false,
      error: { code: "STOCK_ALREADY_EXISTS", message: "Stok untuk varian ini sudah ada." },
    };
  }

  const item = await repository.createInventoryItem(command);
  return { success: true, data: item };
}

/**
 * Menambah stok varian (STOCK_IN).
 * qty harus > 0 dan reason wajib diisi.
 */
export async function increaseStock(
  repository: InventoryRepository,
  command: IncreaseStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  if (!isValidStockQty(command.qty) || command.qty === 0) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Jumlah tambah stok harus integer positif (> 0)." },
    };
  }

  if (!isValidAdjustmentReason(command.reason)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Alasan penambahan stok wajib diisi." },
    };
  }

  const existing = await repository.findByVariantId(command.variantId);
  if (!existing) {
    return {
      success: false,
      error: { code: "STOCK_NOT_FOUND", message: "Stok varian tidak ditemukan. Inisialisasi stok terlebih dahulu." },
    };
  }

  const item = await repository.increaseStock(command);
  return { success: true, data: item };
}

/**
 * Adjustment stok ke nilai absolut baru (ADJUSTMENT).
 * Wajib menyertakan alasan untuk audit trail.
 * newQty >= 0.
 */
export async function adjustStock(
  repository: InventoryRepository,
  command: AdjustStockCommand,
): Promise<InventoryResult<InventoryItem>> {
  if (!isValidStockQty(command.newQty)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Nilai stok baru tidak valid. Harus berupa integer >= 0." },
    };
  }

  if (!isValidAdjustmentReason(command.reason)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Alasan adjustment stok wajib diisi." },
    };
  }

  const existing = await repository.findByVariantId(command.variantId);
  if (!existing) {
    return {
      success: false,
      error: { code: "STOCK_NOT_FOUND", message: "Stok varian tidak ditemukan. Inisialisasi stok terlebih dahulu." },
    };
  }

  const item = await repository.adjustStock(command);
  return { success: true, data: item };
}
