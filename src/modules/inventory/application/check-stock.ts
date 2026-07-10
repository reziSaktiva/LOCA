import type {
  InventoryItem,
  InventoryMovement,
  InventoryResult,
  ListInventoryQuery,
  ListMovementsQuery,
} from "../domain/inventory-entities";
import { isStockSufficient } from "../domain/inventory-invariants";
import type {
  InventoryRepository,
  ListInventoryResult,
  ListMovementsResult,
} from "../domain/inventory-repository";

/**
 * Mengambil data stok suatu varian. Null jika belum diinisialisasi.
 */
export async function getStockByVariantId(
  repository: InventoryRepository,
  variantId: string,
): Promise<InventoryItem | null> {
  return repository.findByVariantId(variantId);
}

/**
 * Mengambil daftar seluruh InventoryItem dengan pagination.
 * Consumer: Admin (halaman daftar stok).
 */
export async function listInventoryItems(
  repository: InventoryRepository,
  query: ListInventoryQuery,
): Promise<ListInventoryResult> {
  return repository.listInventoryItems(query);
}

/**
 * Memastikan stok varian tersedia minimal sejumlah qty.
 * Mengembalikan error STOCK_NOT_FOUND atau INSUFFICIENT_STOCK jika gagal.
 * Dipakai oleh Cart dan Checkout sebelum menambah item.
 */
export async function assertStockAvailable(
  repository: InventoryRepository,
  variantId: string,
  qty: number,
): Promise<InventoryResult<InventoryItem>> {
  const item = await repository.findByVariantId(variantId);

  if (!item) {
    return {
      success: false,
      error: { code: "STOCK_NOT_FOUND", message: "Stok varian tidak ditemukan." },
    };
  }

  if (!isStockSufficient(item, qty)) {
    return {
      success: false,
      error: {
        code: "INSUFFICIENT_STOCK",
        message: `Stok tidak mencukupi. Tersedia: ${item.availableQty}, diminta: ${qty}.`,
      },
    };
  }

  return { success: true, data: item };
}

/**
 * Mengembalikan riwayat movement stok suatu varian dengan pagination.
 */
export async function listStockMovements(
  repository: InventoryRepository,
  query: ListMovementsQuery,
): Promise<{ items: InventoryMovement[]; total: number }> {
  const result: ListMovementsResult = await repository.listMovements(query);
  return result;
}
