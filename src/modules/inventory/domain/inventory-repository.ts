import type {
  AdjustStockCommand,
  IncreaseStockCommand,
  InitializeStockCommand,
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
  ListMovementsQuery,
  ReserveStockItem,
} from "./inventory-entities";

export type { ListMovementsQuery };

export type ListMovementsResult = {
  items: InventoryMovement[];
  total: number;
};

export interface InventoryRepository {
  // ---------------------------------------------------------------------------
  // InventoryItem
  // ---------------------------------------------------------------------------
  findByVariantId(variantId: string): Promise<InventoryItem | null>;
  existsByVariantId(variantId: string): Promise<boolean>;

  /**
   * Membuat InventoryItem baru untuk suatu varian.
   * Juga mencatat STOCK_IN movement jika initialQty > 0.
   */
  createInventoryItem(command: InitializeStockCommand): Promise<InventoryItem>;

  /**
   * Menambah stok (STOCK_IN). Mencatat movement dalam transaksi yang sama.
   */
  increaseStock(command: IncreaseStockCommand): Promise<InventoryItem>;

  /**
   * Adjustment stok ke nilai baru (ADJUSTMENT). Mencatat movement dalam transaksi yang sama.
   */
  adjustStock(command: AdjustStockCommand): Promise<InventoryItem>;

  // ---------------------------------------------------------------------------
  // InventoryReservation
  // ---------------------------------------------------------------------------

  /**
   * Membuat reservasi stok untuk satu item order.
   * Juga mengurangi availableQty dan mencatat RESERVE movement dalam transaksi yang sama.
   */
  createReservation(
    item: ReserveStockItem,
    orderId: string,
    actorId: string,
  ): Promise<InventoryReservation>;

  findActiveReservationsByOrderId(orderId: string): Promise<InventoryReservation[]>;

  /**
   * Commit reservasi (setelah payment confirmed).
   * Mengurangi onHandQty, set status COMMITTED, mencatat COMMIT movement.
   */
  commitReservation(reservationId: string, actorId: string): Promise<void>;

  /**
   * Release reservasi (order dibatalkan/expired).
   * Mengembalikan availableQty, set status RELEASED, mencatat RELEASE movement.
   */
  releaseReservation(reservationId: string, actorId: string): Promise<void>;

  // ---------------------------------------------------------------------------
  // InventoryMovement
  // ---------------------------------------------------------------------------
  listMovements(query: ListMovementsQuery): Promise<ListMovementsResult>;
}
