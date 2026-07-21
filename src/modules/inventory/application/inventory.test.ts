import { describe, expect, it } from "vitest";
import type {
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
  ReservationStatus,
} from "../domain/inventory-entities";
import {
  canCommitReservation,
  canReleaseReservation,
  isInventoryItemConsistent,
  isStockSufficient,
  isValidAdjustmentReason,
  isValidStockQty,
} from "../domain/inventory-invariants";
import type {
  InventoryRepository,
  ListInventoryResult,
  ListMovementsResult,
} from "../domain/inventory-repository";
import { adjustStock, increaseStock, initializeStock, upsertStock } from "./manage-stock";
import {
  assertStockAvailable,
  getStockByVariantId,
  listInventoryItems,
  listStockMovements,
} from "./check-stock";
import { commitStock, releaseReservedStock, reserveStock } from "./reserve-stock";

// ---------------------------------------------------------------------------
// In-memory repository helper
// ---------------------------------------------------------------------------

function makeItem(override: Partial<InventoryItem> = {}): InventoryItem {
  const onHandQty = override.onHandQty ?? 10;
  const reservedQty = override.reservedQty ?? 0;
  return {
    id: "inv-1",
    variantId: "var-1",
    onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeReservation(override: Partial<InventoryReservation> = {}): InventoryReservation {
  return {
    id: "res-1",
    orderId: "order-1",
    variantId: "var-1",
    qty: 2,
    reservationStatus: "ACTIVE",
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

class InMemoryInventoryRepository implements InventoryRepository {
  private items: InventoryItem[] = [];
  private reservations: InventoryReservation[] = [];
  private movements: InventoryMovement[] = [];

  seed(items: InventoryItem[]) {
    this.items = [...items];
    return this;
  }
  seedReservations(reservations: InventoryReservation[]) {
    this.reservations = [...reservations];
    return this;
  }

  async findByVariantId(variantId: string) {
    return this.items.find((i) => i.variantId === variantId) ?? null;
  }

  async existsByVariantId(variantId: string) {
    return this.items.some((i) => i.variantId === variantId);
  }

  async createInventoryItem(command: { variantId: string; initialQty: number; actorId: string }) {
    const item: InventoryItem = {
      id: `inv-${this.items.length + 1}`,
      variantId: command.variantId,
      onHandQty: command.initialQty,
      reservedQty: 0,
      availableQty: command.initialQty,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    if (command.initialQty > 0) {
      this.movements.push({
        id: `mov-${this.movements.length + 1}`,
        variantId: command.variantId,
        movementType: "STOCK_IN",
        qtyDelta: command.initialQty,
        reason: "Initial stock",
        referenceType: null,
        referenceId: null,
        createdAt: new Date(),
        createdBy: command.actorId,
      });
    }
    return item;
  }

  async increaseStock(command: {
    variantId: string;
    qty: number;
    reason: string;
    actorId: string;
  }) {
    const idx = this.items.findIndex((i) => i.variantId === command.variantId);
    if (idx < 0) throw new Error("Stock not found");
    const item = this.items[idx];
    const updated: InventoryItem = {
      ...item,
      onHandQty: item.onHandQty + command.qty,
      availableQty: item.availableQty + command.qty,
      updatedAt: new Date(),
    };
    this.items[idx] = updated;
    this.movements.push({
      id: `mov-${this.movements.length + 1}`,
      variantId: command.variantId,
      movementType: "STOCK_IN",
      qtyDelta: command.qty,
      reason: command.reason,
      referenceType: null,
      referenceId: null,
      createdAt: new Date(),
      createdBy: command.actorId,
    });
    return updated;
  }

  async adjustStock(command: {
    variantId: string;
    newQty: number;
    reason: string;
    actorId: string;
  }) {
    const idx = this.items.findIndex((i) => i.variantId === command.variantId);
    if (idx < 0) throw new Error("Stock not found");
    const item = this.items[idx];
    const qtyDelta = command.newQty - item.onHandQty;
    const updated: InventoryItem = {
      ...item,
      onHandQty: command.newQty,
      availableQty: command.newQty - item.reservedQty,
      updatedAt: new Date(),
    };
    this.items[idx] = updated;
    this.movements.push({
      id: `mov-${this.movements.length + 1}`,
      variantId: command.variantId,
      movementType: "ADJUSTMENT",
      qtyDelta,
      reason: command.reason,
      referenceType: null,
      referenceId: null,
      createdAt: new Date(),
      createdBy: command.actorId,
    });
    return updated;
  }

  async createReservation(
    item: { variantId: string; qty: number },
    orderId: string,
    actorId: string,
  ) {
    const stockIdx = this.items.findIndex((i) => i.variantId === item.variantId);
    if (stockIdx < 0) throw new Error("Stock not found");
    const stock = this.items[stockIdx];
    this.items[stockIdx] = {
      ...stock,
      reservedQty: stock.reservedQty + item.qty,
      availableQty: stock.availableQty - item.qty,
      updatedAt: new Date(),
    };
    const reservation: InventoryReservation = {
      id: `res-${this.reservations.length + 1}`,
      orderId,
      variantId: item.variantId,
      qty: item.qty,
      reservationStatus: "ACTIVE",
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reservations.push(reservation);
    this.movements.push({
      id: `mov-${this.movements.length + 1}`,
      variantId: item.variantId,
      movementType: "RESERVE",
      qtyDelta: -item.qty,
      reason: `Order ${orderId}`,
      referenceType: "ORDER",
      referenceId: orderId,
      createdAt: new Date(),
      createdBy: actorId,
    });
    return reservation;
  }

  async findActiveReservationsByOrderId(orderId: string) {
    return this.reservations.filter(
      (r) =>
        r.orderId === orderId &&
        (r.reservationStatus === "ACTIVE" || r.reservationStatus === "EXPIRED"),
    );
  }

  async commitReservation(reservationId: string, actorId: string) {
    const resIdx = this.reservations.findIndex((r) => r.id === reservationId);
    if (resIdx < 0) throw new Error("Reservation not found");
    const res = this.reservations[resIdx];
    this.reservations[resIdx] = { ...res, reservationStatus: "COMMITTED", updatedAt: new Date() };

    const stockIdx = this.items.findIndex((i) => i.variantId === res.variantId);
    if (stockIdx >= 0) {
      const stock = this.items[stockIdx];
      this.items[stockIdx] = {
        ...stock,
        onHandQty: stock.onHandQty - res.qty,
        reservedQty: stock.reservedQty - res.qty,
        updatedAt: new Date(),
      };
    }
    this.movements.push({
      id: `mov-${this.movements.length + 1}`,
      variantId: res.variantId,
      movementType: "COMMIT",
      qtyDelta: -res.qty,
      reason: `Commit reservation ${reservationId}`,
      referenceType: "ORDER",
      referenceId: res.orderId,
      createdAt: new Date(),
      createdBy: actorId,
    });
  }

  async releaseReservation(reservationId: string, actorId: string) {
    const resIdx = this.reservations.findIndex((r) => r.id === reservationId);
    if (resIdx < 0) throw new Error("Reservation not found");
    const res = this.reservations[resIdx];
    this.reservations[resIdx] = { ...res, reservationStatus: "RELEASED", updatedAt: new Date() };

    const stockIdx = this.items.findIndex((i) => i.variantId === res.variantId);
    if (stockIdx >= 0) {
      const stock = this.items[stockIdx];
      this.items[stockIdx] = {
        ...stock,
        reservedQty: stock.reservedQty - res.qty,
        availableQty: stock.availableQty + res.qty,
        updatedAt: new Date(),
      };
    }
    this.movements.push({
      id: `mov-${this.movements.length + 1}`,
      variantId: res.variantId,
      movementType: "RELEASE",
      qtyDelta: res.qty,
      reason: `Release reservation ${reservationId}`,
      referenceType: "ORDER",
      referenceId: res.orderId,
      createdAt: new Date(),
      createdBy: actorId,
    });
  }

  async listMovements(query: {
    variantId?: string;
    page?: number;
    limit?: number;
  }): Promise<ListMovementsResult> {
    const filtered = query.variantId
      ? this.movements.filter((m) => m.variantId === query.variantId)
      : this.movements;
    const ordered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;
    return { items: ordered.slice(start, start + limit), total: ordered.length };
  }

  async listInventoryItems(query: { page?: number; limit?: number }): Promise<ListInventoryResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;
    return { items: this.items.slice(start, start + limit), total: this.items.length };
  }

  getMovements() {
    return this.movements;
  }
  getReservations() {
    return this.reservations;
  }
}

// ---------------------------------------------------------------------------
// Invariant tests
// ---------------------------------------------------------------------------

describe("isValidStockQty", () => {
  it("accepts integer >= 0", () => {
    expect(isValidStockQty(0)).toBe(true);
    expect(isValidStockQty(1)).toBe(true);
    expect(isValidStockQty(999)).toBe(true);
  });

  it("rejects negative numbers", () => {
    expect(isValidStockQty(-1)).toBe(false);
    expect(isValidStockQty(-100)).toBe(false);
  });

  it("rejects non-integer numbers", () => {
    expect(isValidStockQty(1.5)).toBe(false);
    expect(isValidStockQty(0.1)).toBe(false);
  });
});

describe("isInventoryItemConsistent", () => {
  it("passes for consistent item", () => {
    expect(
      isInventoryItemConsistent(makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 7 })),
    ).toBe(true);
    expect(
      isInventoryItemConsistent(makeItem({ onHandQty: 0, reservedQty: 0, availableQty: 0 })),
    ).toBe(true);
  });

  it("fails if availableQty != onHandQty - reservedQty", () => {
    expect(
      isInventoryItemConsistent(makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 8 })),
    ).toBe(false);
  });

  it("fails if reservedQty > onHandQty", () => {
    expect(
      isInventoryItemConsistent(makeItem({ onHandQty: 5, reservedQty: 6, availableQty: -1 })),
    ).toBe(false);
  });

  it("fails if negative qty fields", () => {
    expect(
      isInventoryItemConsistent(makeItem({ onHandQty: -1, reservedQty: 0, availableQty: -1 })),
    ).toBe(false);
  });
});

describe("isStockSufficient", () => {
  it("returns true if availableQty >= requested", () => {
    expect(isStockSufficient(makeItem({ availableQty: 5, onHandQty: 5, reservedQty: 0 }), 5)).toBe(
      true,
    );
    expect(
      isStockSufficient(makeItem({ availableQty: 10, onHandQty: 10, reservedQty: 0 }), 1),
    ).toBe(true);
  });

  it("returns false if availableQty < requested", () => {
    expect(isStockSufficient(makeItem({ availableQty: 3, onHandQty: 5, reservedQty: 2 }), 4)).toBe(
      false,
    );
    expect(isStockSufficient(makeItem({ availableQty: 0, onHandQty: 0, reservedQty: 0 }), 1)).toBe(
      false,
    );
  });
});

describe("canCommitReservation", () => {
  it("allows ACTIVE", () => expect(canCommitReservation("ACTIVE")).toBe(true));
  it("blocks COMMITTED, RELEASED, EXPIRED", () => {
    const blocked: ReservationStatus[] = ["COMMITTED", "RELEASED", "EXPIRED"];
    for (const s of blocked) expect(canCommitReservation(s)).toBe(false);
  });
});

describe("canReleaseReservation", () => {
  it("allows ACTIVE and EXPIRED", () => {
    expect(canReleaseReservation("ACTIVE")).toBe(true);
    expect(canReleaseReservation("EXPIRED")).toBe(true);
  });
  it("blocks COMMITTED and RELEASED", () => {
    expect(canReleaseReservation("COMMITTED")).toBe(false);
    expect(canReleaseReservation("RELEASED")).toBe(false);
  });
});

describe("isValidAdjustmentReason", () => {
  it("accepts non-empty reason", () => {
    expect(isValidAdjustmentReason("Stock opname")).toBe(true);
    expect(isValidAdjustmentReason("  reason  ")).toBe(true);
  });
  it("rejects empty or whitespace-only", () => {
    expect(isValidAdjustmentReason("")).toBe(false);
    expect(isValidAdjustmentReason("   ")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// manage-stock tests
// ---------------------------------------------------------------------------

describe("initializeStock", () => {
  it("creates a new inventory item", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await initializeStock(repo, {
      variantId: "var-new",
      initialQty: 20,
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onHandQty).toBe(20);
      expect(result.data.availableQty).toBe(20);
      expect(result.data.reservedQty).toBe(0);
    }
  });

  it("creates STOCK_IN movement when initialQty > 0", async () => {
    const repo = new InMemoryInventoryRepository();
    await initializeStock(repo, { variantId: "var-new", initialQty: 10, actorId: "admin-1" });
    const movements = repo.getMovements();
    expect(movements).toHaveLength(1);
    expect(movements[0].movementType).toBe("STOCK_IN");
    expect(movements[0].qtyDelta).toBe(10);
  });

  it("creates no movement when initialQty = 0", async () => {
    const repo = new InMemoryInventoryRepository();
    await initializeStock(repo, { variantId: "var-new", initialQty: 0, actorId: "admin-1" });
    expect(repo.getMovements()).toHaveLength(0);
  });

  it("returns STOCK_ALREADY_EXISTS for duplicate variantId", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await initializeStock(repo, {
      variantId: "var-1",
      initialQty: 5,
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("STOCK_ALREADY_EXISTS");
  });

  it("returns INVALID_QUANTITY for negative initialQty", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await initializeStock(repo, {
      variantId: "var-x",
      initialQty: -1,
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });
});

describe("increaseStock", () => {
  it("increases onHandQty and availableQty", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 0, availableQty: 10 }),
    ]);
    const result = await increaseStock(repo, {
      variantId: "var-1",
      qty: 5,
      reason: "Restock",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onHandQty).toBe(15);
      expect(result.data.availableQty).toBe(15);
    }
  });

  it("records STOCK_IN movement", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    await increaseStock(repo, {
      variantId: "var-1",
      qty: 3,
      reason: "Purchase",
      actorId: "admin-1",
    });
    const movements = repo.getMovements();
    expect(movements.some((m) => m.movementType === "STOCK_IN" && m.qtyDelta === 3)).toBe(true);
  });

  it("returns STOCK_NOT_FOUND for unknown variant", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await increaseStock(repo, {
      variantId: "unknown",
      qty: 5,
      reason: "x",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("STOCK_NOT_FOUND");
  });

  it("returns INVALID_QUANTITY for qty = 0", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await increaseStock(repo, {
      variantId: "var-1",
      qty: 0,
      reason: "x",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });
});

describe("adjustStock", () => {
  it("sets onHandQty to newQty and updates availableQty", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 2, availableQty: 8 }),
    ]);
    const result = await adjustStock(repo, {
      variantId: "var-1",
      newQty: 15,
      reason: "Stock opname",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onHandQty).toBe(15);
      expect(result.data.availableQty).toBe(13); // 15 - 2 reserved
    }
  });

  it("records ADJUSTMENT movement", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 0, availableQty: 10 }),
    ]);
    await adjustStock(repo, {
      variantId: "var-1",
      newQty: 8,
      reason: "Koreksi",
      actorId: "admin-1",
    });
    const movements = repo.getMovements();
    expect(movements.some((m) => m.movementType === "ADJUSTMENT" && m.qtyDelta === -2)).toBe(true);
  });

  it("returns INVALID_QUANTITY for negative newQty", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await adjustStock(repo, {
      variantId: "var-1",
      newQty: -1,
      reason: "x",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });

  it("returns INVALID_QUANTITY for empty reason", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await adjustStock(repo, {
      variantId: "var-1",
      newQty: 5,
      reason: "  ",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });
});

describe("upsertStock", () => {
  it("initializes stock when InventoryItem does not exist", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await upsertStock(repo, {
      variantId: "var-new",
      newQty: 25,
      reason: "First stock",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onHandQty).toBe(25);
      expect(result.data.availableQty).toBe(25);
    }
    const item = await repo.findByVariantId("var-new");
    expect(item).not.toBeNull();
  });

  it("adjusts stock when InventoryItem already exists", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 2, availableQty: 8 }),
    ]);
    const result = await upsertStock(repo, {
      variantId: "var-1",
      newQty: 20,
      reason: "Stock opname",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onHandQty).toBe(20);
      expect(result.data.availableQty).toBe(18); // 20 - 2 reserved
    }
  });

  it("returns INVALID_QUANTITY for negative newQty", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await upsertStock(repo, {
      variantId: "var-1",
      newQty: -1,
      reason: "x",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });

  it("returns INVALID_QUANTITY for empty reason", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await upsertStock(repo, {
      variantId: "var-1",
      newQty: 5,
      reason: "  ",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });
});

describe("listInventoryItems", () => {
  it("returns paginated items", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ id: "inv-1", variantId: "var-1" }),
      makeItem({ id: "inv-2", variantId: "var-2" }),
    ]);
    const { items, total } = await listInventoryItems(repo, { page: 1, limit: 1 });
    expect(items).toHaveLength(1);
    expect(total).toBe(2);
  });

  it("returns empty list when no items", async () => {
    const repo = new InMemoryInventoryRepository();
    const { items, total } = await listInventoryItems(repo, {});
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// check-stock tests
// ---------------------------------------------------------------------------

describe("getStockByVariantId", () => {
  it("returns item when exists", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const item = await getStockByVariantId(repo, "var-1");
    expect(item).not.toBeNull();
    expect(item?.variantId).toBe("var-1");
  });

  it("returns null when not found", async () => {
    const repo = new InMemoryInventoryRepository();
    const item = await getStockByVariantId(repo, "nonexistent");
    expect(item).toBeNull();
  });
});

describe("assertStockAvailable", () => {
  it("returns success when stock sufficient", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 0, availableQty: 10 }),
    ]);
    const result = await assertStockAvailable(repo, "var-1", 5);
    expect(result.success).toBe(true);
  });

  it("returns INSUFFICIENT_STOCK when not enough", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 3, reservedQty: 0, availableQty: 3 }),
    ]);
    const result = await assertStockAvailable(repo, "var-1", 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("returns STOCK_NOT_FOUND when variant has no inventory", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await assertStockAvailable(repo, "var-unknown", 1);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("STOCK_NOT_FOUND");
  });
});

describe("listStockMovements", () => {
  it("returns movements for a variant", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    await increaseStock(repo, {
      variantId: "var-1",
      qty: 5,
      reason: "Restock",
      actorId: "admin-1",
    });
    await increaseStock(repo, { variantId: "var-1", qty: 3, reason: "Top-up", actorId: "admin-1" });
    const { items, total } = await listStockMovements(repo, { variantId: "var-1" });
    expect(items.length).toBe(2);
    expect(total).toBe(2);
  });

  it("returns empty for variant with no movements", async () => {
    const repo = new InMemoryInventoryRepository();
    const { items, total } = await listStockMovements(repo, { variantId: "var-1" });
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });

  it("returns movements across all variants when variantId is omitted", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ id: "inv-1", variantId: "var-1" }),
      makeItem({ id: "inv-2", variantId: "var-2" }),
    ]);
    await increaseStock(repo, {
      variantId: "var-1",
      qty: 5,
      reason: "Restock",
      actorId: "admin-1",
    });
    await increaseStock(repo, {
      variantId: "var-2",
      qty: 3,
      reason: "Restock",
      actorId: "admin-1",
    });
    const { items, total } = await listStockMovements(repo, {});
    expect(items.length).toBe(2);
    expect(total).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// reserve-stock tests
// ---------------------------------------------------------------------------

describe("reserveStock", () => {
  it("reserves stock for order items", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 0, availableQty: 10 }),
    ]);
    const result = await reserveStock(repo, {
      orderId: "order-1",
      items: [{ variantId: "var-1", qty: 3 }],
      actorId: "system",
    });
    expect(result.success).toBe(true);
    const updated = await repo.findByVariantId("var-1");
    expect(updated?.reservedQty).toBe(3);
    expect(updated?.availableQty).toBe(7);
  });

  it("records RESERVE movements", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 10, reservedQty: 0, availableQty: 10 }),
    ]);
    await reserveStock(repo, {
      orderId: "order-1",
      items: [{ variantId: "var-1", qty: 2 }],
      actorId: "system",
    });
    expect(repo.getMovements().some((m) => m.movementType === "RESERVE")).toBe(true);
  });

  it("returns INSUFFICIENT_STOCK if qty exceeds available", async () => {
    const repo = new InMemoryInventoryRepository().seed([
      makeItem({ onHandQty: 2, reservedQty: 0, availableQty: 2 }),
    ]);
    const result = await reserveStock(repo, {
      orderId: "order-1",
      items: [{ variantId: "var-1", qty: 5 }],
      actorId: "system",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("returns STOCK_NOT_FOUND for unknown variant", async () => {
    const repo = new InMemoryInventoryRepository();
    const result = await reserveStock(repo, {
      orderId: "order-1",
      items: [{ variantId: "unknown", qty: 1 }],
      actorId: "system",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("STOCK_NOT_FOUND");
  });
});

describe("commitStock", () => {
  it("commits active reservations and reduces onHandQty", async () => {
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 7 })])
      .seedReservations([makeReservation({ qty: 3, reservationStatus: "ACTIVE" })]);
    const result = await commitStock(repo, { orderId: "order-1", actorId: "system" });
    expect(result.success).toBe(true);
    const updated = await repo.findByVariantId("var-1");
    expect(updated?.onHandQty).toBe(7);
    expect(updated?.reservedQty).toBe(0);
  });

  it("records COMMIT movement", async () => {
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 7 })])
      .seedReservations([makeReservation({ qty: 3 })]);
    await commitStock(repo, { orderId: "order-1", actorId: "system" });
    expect(repo.getMovements().some((m) => m.movementType === "COMMIT")).toBe(true);
  });

  it("returns RESERVATION_NOT_FOUND if no active reservations", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await commitStock(repo, { orderId: "order-nonexistent", actorId: "system" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("RESERVATION_NOT_FOUND");
  });

  it("returns RESERVATION_NOT_FOUND when all reservations are already committed", async () => {
    // findActiveReservationsByOrderId hanya mengembalikan ACTIVE/EXPIRED.
    // Jika reservasi sudah COMMITTED, hasilnya kosong → RESERVATION_NOT_FOUND.
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem()])
      .seedReservations([makeReservation({ reservationStatus: "COMMITTED" })]);
    const result = await commitStock(repo, { orderId: "order-1", actorId: "system" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("RESERVATION_NOT_FOUND");
  });
});

describe("releaseReservedStock", () => {
  it("releases active reservations and restores availableQty", async () => {
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 7 })])
      .seedReservations([makeReservation({ qty: 3 })]);
    const result = await releaseReservedStock(repo, { orderId: "order-1", actorId: "system" });
    expect(result.success).toBe(true);
    const updated = await repo.findByVariantId("var-1");
    expect(updated?.reservedQty).toBe(0);
    expect(updated?.availableQty).toBe(10);
  });

  it("records RELEASE movement", async () => {
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem({ onHandQty: 10, reservedQty: 3, availableQty: 7 })])
      .seedReservations([makeReservation({ qty: 3 })]);
    await releaseReservedStock(repo, { orderId: "order-1", actorId: "system" });
    expect(repo.getMovements().some((m) => m.movementType === "RELEASE")).toBe(true);
  });

  it("returns RESERVATION_NOT_FOUND when no reservations found", async () => {
    const repo = new InMemoryInventoryRepository().seed([makeItem()]);
    const result = await releaseReservedStock(repo, {
      orderId: "order-nonexistent",
      actorId: "system",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("RESERVATION_NOT_FOUND");
  });

  it("returns RESERVATION_NOT_FOUND when all reservations are already released", async () => {
    // findActiveReservationsByOrderId hanya mengembalikan ACTIVE/EXPIRED.
    // Jika reservasi sudah RELEASED, hasilnya kosong → RESERVATION_NOT_FOUND.
    const repo = new InMemoryInventoryRepository()
      .seed([makeItem()])
      .seedReservations([makeReservation({ reservationStatus: "RELEASED" })]);
    const result = await releaseReservedStock(repo, { orderId: "order-1", actorId: "system" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("RESERVATION_NOT_FOUND");
  });
});
