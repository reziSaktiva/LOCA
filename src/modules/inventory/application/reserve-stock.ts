import type {
  CommitStockCommand,
  InventoryResult,
  ReleaseStockCommand,
  ReserveStockCommand,
} from "../domain/inventory-entities";
import { canCommitReservation, canReleaseReservation, isStockSufficient } from "../domain/inventory-invariants";
import type { InventoryRepository } from "../domain/inventory-repository";

/**
 * Mereservasi stok untuk semua item dalam satu order.
 * Semua item harus tersedia — jika satu gagal, tidak ada yang di-reserve (all-or-nothing).
 */
export async function reserveStock(
  repository: InventoryRepository,
  command: ReserveStockCommand,
): Promise<InventoryResult<void>> {
  // Validasi ketersediaan stok seluruh item terlebih dahulu
  for (const item of command.items) {
    const stockItem = await repository.findByVariantId(item.variantId);

    if (!stockItem) {
      return {
        success: false,
        error: {
          code: "STOCK_NOT_FOUND",
          message: `Stok untuk varian ${item.variantId} tidak ditemukan.`,
        },
      };
    }

    if (!isStockSufficient(stockItem, item.qty)) {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message: `Stok tidak mencukupi untuk varian ${item.variantId}. Tersedia: ${stockItem.availableQty}, diminta: ${item.qty}.`,
        },
      };
    }
  }

  // Semua stok tersedia — lakukan reservasi per item
  for (const item of command.items) {
    await repository.createReservation(item, command.orderId, command.actorId);
  }

  return { success: true, data: undefined };
}

/**
 * Commit reservasi setelah payment dikonfirmasi.
 * Mengurangi onHandQty secara permanen.
 */
export async function commitStock(
  repository: InventoryRepository,
  command: CommitStockCommand,
): Promise<InventoryResult<void>> {
  const reservations = await repository.findActiveReservationsByOrderId(command.orderId);

  if (reservations.length === 0) {
    return {
      success: false,
      error: {
        code: "RESERVATION_NOT_FOUND",
        message: `Tidak ada reservasi aktif untuk order ${command.orderId}.`,
      },
    };
  }

  for (const reservation of reservations) {
    if (!canCommitReservation(reservation.reservationStatus)) {
      return {
        success: false,
        error: {
          code: "RESERVATION_ALREADY_COMMITTED",
          message: `Reservasi ${reservation.id} sudah di-commit atau bukan status ACTIVE.`,
        },
      };
    }
  }

  for (const reservation of reservations) {
    await repository.commitReservation(reservation.id, command.actorId);
  }

  return { success: true, data: undefined };
}

/**
 * Melepas reservasi saat order dibatalkan atau expired.
 * Mengembalikan availableQty.
 */
export async function releaseReservedStock(
  repository: InventoryRepository,
  command: ReleaseStockCommand,
): Promise<InventoryResult<void>> {
  const reservations = await repository.findActiveReservationsByOrderId(command.orderId);

  if (reservations.length === 0) {
    return {
      success: false,
      error: {
        code: "RESERVATION_NOT_FOUND",
        message: `Tidak ada reservasi untuk order ${command.orderId}.`,
      },
    };
  }

  for (const reservation of reservations) {
    if (!canReleaseReservation(reservation.reservationStatus)) {
      return {
        success: false,
        error: {
          code: "RESERVATION_ALREADY_RELEASED",
          message: `Reservasi ${reservation.id} sudah di-release atau di-commit.`,
        },
      };
    }
  }

  for (const reservation of reservations) {
    await repository.releaseReservation(reservation.id, command.actorId);
  }

  return { success: true, data: undefined };
}
