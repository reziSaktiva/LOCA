import type {
  InventoryItem as PrismaInventoryItem,
  InventoryMovement as PrismaInventoryMovement,
  InventoryReservation as PrismaInventoryReservation,
} from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type {
  AdjustStockCommand,
  IncreaseStockCommand,
  InitializeStockCommand,
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
  ReserveStockItem,
} from "../domain/inventory-entities";
import type {
  InventoryRepository,
  ListInventoryQuery,
  ListInventoryResult,
  ListMovementsQuery,
  ListMovementsResult,
} from "../domain/inventory-repository";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toInventoryItem(row: PrismaInventoryItem): InventoryItem {
  return {
    id: row.id,
    variantId: row.variantId,
    onHandQty: row.onHandQty,
    reservedQty: row.reservedQty,
    availableQty: row.availableQty,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toInventoryReservation(row: PrismaInventoryReservation): InventoryReservation {
  return {
    id: row.id,
    orderId: row.orderId,
    variantId: row.variantId,
    qty: row.qty,
    reservationStatus: row.reservationStatus,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toInventoryMovement(row: PrismaInventoryMovement): InventoryMovement {
  return {
    id: row.id,
    variantId: row.variantId,
    movementType: row.movementType,
    qtyDelta: row.qtyDelta,
    reason: row.reason,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class PrismaInventoryRepository implements InventoryRepository {
  async findByVariantId(variantId: string): Promise<InventoryItem | null> {
    const row = await prisma.inventoryItem.findUnique({ where: { variantId } });
    return row ? toInventoryItem(row) : null;
  }

  async existsByVariantId(variantId: string): Promise<boolean> {
    const count = await prisma.inventoryItem.count({ where: { variantId } });
    return count > 0;
  }

  async listInventoryItems(query: ListInventoryQuery): Promise<ListInventoryResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rows, total] = await prisma.$transaction([
      prisma.inventoryItem.findMany({
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventoryItem.count(),
    ]);

    return { items: rows.map(toInventoryItem), total };
  }

  async createInventoryItem(command: InitializeStockCommand): Promise<InventoryItem> {
    return prisma.$transaction(async (tx) => {
      const row = await tx.inventoryItem.create({
        data: {
          variantId: command.variantId,
          onHandQty: command.initialQty,
          reservedQty: 0,
          availableQty: command.initialQty,
          createdBy: command.actorId,
          updatedBy: command.actorId,
        },
      });

      if (command.initialQty > 0) {
        await tx.inventoryMovement.create({
          data: {
            variantId: command.variantId,
            movementType: "STOCK_IN",
            qtyDelta: command.initialQty,
            reason: "Initial stock",
            createdBy: command.actorId,
          },
        });
      }

      return toInventoryItem(row);
    });
  }

  async increaseStock(command: IncreaseStockCommand): Promise<InventoryItem> {
    return prisma.$transaction(async (tx) => {
      const row = await tx.inventoryItem.update({
        where: { variantId: command.variantId },
        data: {
          onHandQty: { increment: command.qty },
          availableQty: { increment: command.qty },
          updatedBy: command.actorId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: command.variantId,
          movementType: "STOCK_IN",
          qtyDelta: command.qty,
          reason: command.reason,
          createdBy: command.actorId,
        },
      });

      return toInventoryItem(row);
    });
  }

  async adjustStock(command: AdjustStockCommand): Promise<InventoryItem> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.inventoryItem.findUnique({
        where: { variantId: command.variantId },
      });
      if (!current) throw new Error(`InventoryItem not found for variant ${command.variantId}`);

      const qtyDelta = command.newQty - current.onHandQty;
      const newAvailableQty = command.newQty - current.reservedQty;

      const row = await tx.inventoryItem.update({
        where: { variantId: command.variantId },
        data: {
          onHandQty: command.newQty,
          availableQty: newAvailableQty,
          updatedBy: command.actorId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: command.variantId,
          movementType: "ADJUSTMENT",
          qtyDelta,
          reason: command.reason,
          createdBy: command.actorId,
        },
      });

      return toInventoryItem(row);
    });
  }

  async createReservation(
    item: ReserveStockItem,
    orderId: string,
    actorId: string,
  ): Promise<InventoryReservation> {
    return prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { variantId: item.variantId },
        data: {
          reservedQty: { increment: item.qty },
          availableQty: { decrement: item.qty },
          updatedBy: actorId,
        },
      });

      const reservation = await tx.inventoryReservation.create({
        data: {
          orderId,
          variantId: item.variantId,
          qty: item.qty,
          reservationStatus: "ACTIVE",
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          movementType: "RESERVE",
          qtyDelta: -item.qty,
          reason: `Order ${orderId}`,
          referenceType: "ORDER",
          referenceId: orderId,
          createdBy: actorId,
        },
      });

      return toInventoryReservation(reservation);
    });
  }

  async findActiveReservationsByOrderId(orderId: string): Promise<InventoryReservation[]> {
    const rows = await prisma.inventoryReservation.findMany({
      where: {
        orderId,
        reservationStatus: { in: ["ACTIVE", "EXPIRED"] },
      },
    });
    return rows.map(toInventoryReservation);
  }

  async commitReservation(reservationId: string, actorId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) throw new Error(`Reservation ${reservationId} not found`);

      await tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { reservationStatus: "COMMITTED", updatedBy: actorId },
      });

      await tx.inventoryItem.update({
        where: { variantId: reservation.variantId },
        data: {
          onHandQty: { decrement: reservation.qty },
          reservedQty: { decrement: reservation.qty },
          updatedBy: actorId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: reservation.variantId,
          movementType: "COMMIT",
          qtyDelta: -reservation.qty,
          reason: `Commit reservation ${reservationId}`,
          referenceType: "ORDER",
          referenceId: reservation.orderId,
          createdBy: actorId,
        },
      });
    });
  }

  async releaseReservation(reservationId: string, actorId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) throw new Error(`Reservation ${reservationId} not found`);

      await tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { reservationStatus: "RELEASED", updatedBy: actorId },
      });

      await tx.inventoryItem.update({
        where: { variantId: reservation.variantId },
        data: {
          reservedQty: { decrement: reservation.qty },
          availableQty: { increment: reservation.qty },
          updatedBy: actorId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: reservation.variantId,
          movementType: "RELEASE",
          qtyDelta: reservation.qty,
          reason: `Release reservation ${reservationId}`,
          referenceType: "ORDER",
          referenceId: reservation.orderId,
          createdBy: actorId,
        },
      });
    });
  }

  async listMovements(query: ListMovementsQuery): Promise<ListMovementsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = query.variantId ? { variantId: query.variantId } : {};

    const [rows, total] = await prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { items: rows.map(toInventoryMovement), total };
  }
}
