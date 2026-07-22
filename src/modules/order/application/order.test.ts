import { describe, expect, it } from "vitest";
import type {
  CreateOrderFromCheckoutInput,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
} from "../domain/order-entities";
import {
  canActorCancelOrder,
  canTransitionOrderStatus,
  isCancellableStatus,
  isGrandTotalConsistent,
} from "../domain/order-invariants";
import type {
  CreateOrderPersistCommand,
  ListOrdersQuery,
  ListOrdersResult,
  OrderRepository,
  UpdateOrderStatusPersistCommand,
} from "../domain/order-repository";
import { cancelOrder } from "./cancel-order";
import { createOrderFromCheckout } from "./create-order-from-checkout";
import { getOrderDetail } from "./get-order";
import type { OrderCatalogPort, OrderInventoryPort, OrderVariantSnapshot } from "./order-ports";
import { transitionOrderStatus } from "./transition-order-status";

// ---------------------------------------------------------------------------
// In-memory helpers
// ---------------------------------------------------------------------------

class InMemoryOrderRepository implements OrderRepository {
  orders = new Map<string, Order>();
  items = new Map<string, OrderItem[]>();
  history = new Map<string, OrderStatusHistory[]>();

  async findById(orderId: string) {
    return this.orders.get(orderId) ?? null;
  }

  async findByOrderNumber(orderNumber: string) {
    return [...this.orders.values()].find((o) => o.orderNumber === orderNumber) ?? null;
  }

  async listByCustomerId(customerId: string, query: ListOrdersQuery): Promise<ListOrdersResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    let rows = [...this.orders.values()].filter((o) => o.customerId === customerId);
    if (query.status) rows = rows.filter((o) => o.orderStatus === query.status);
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = rows.length;
    const start = (page - 1) * limit;
    return { items: rows.slice(start, start + limit), total, page, limit };
  }

  async listAll(query: ListOrdersQuery): Promise<ListOrdersResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    let rows = [...this.orders.values()];
    if (query.status) rows = rows.filter((o) => o.orderStatus === query.status);
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = rows.length;
    const start = (page - 1) * limit;
    return { items: rows.slice(start, start + limit), total, page, limit };
  }

  async listItems(orderId: string) {
    return this.items.get(orderId) ?? [];
  }

  async listStatusHistory(orderId: string) {
    return this.history.get(orderId) ?? [];
  }

  async create(command: CreateOrderPersistCommand): Promise<Order> {
    const now = new Date();
    const order: Order = {
      id: command.id,
      orderNumber: command.orderNumber,
      customerId: command.customerId,
      checkoutSessionId: command.checkoutSessionId,
      orderStatus: command.orderStatus,
      currency: command.currency,
      subtotal: command.subtotal,
      shippingFee: command.shippingFee,
      discountTotal: command.discountTotal,
      grandTotal: command.grandTotal,
      shippingRecipientName: command.shippingRecipientName,
      shippingPhone: command.shippingPhone,
      shippingStreet: command.shippingStreet,
      shippingDistrict: command.shippingDistrict,
      shippingCity: command.shippingCity,
      shippingProvince: command.shippingProvince,
      shippingPostalCode: command.shippingPostalCode,
      shippingProvider: command.shippingProvider,
      shippingServiceCode: command.shippingServiceCode,
      shippingServiceName: command.shippingServiceName,
      paymentMethod: command.paymentMethod,
      paymentMethodLabel: command.paymentMethodLabel,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    this.items.set(
      order.id,
      command.items.map((item, index) => ({
        id: `item-${order.id}-${index}`,
        orderId: order.id,
        ...item,
      })),
    );
    this.history.set(
      order.id,
      command.initialHistory.map((entry, index) => ({
        id: `hist-${order.id}-${index}`,
        orderId: order.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedAt: now,
        changedBy: entry.changedBy,
        reason: entry.reason,
      })),
    );
    return order;
  }

  async updateStatus(command: UpdateOrderStatusPersistCommand): Promise<Order> {
    const order = this.orders.get(command.orderId);
    if (!order) throw new Error("not found");
    const updated: Order = {
      ...order,
      orderStatus: command.toStatus,
      updatedAt: new Date(),
    };
    this.orders.set(order.id, updated);
    const history = this.history.get(order.id) ?? [];
    history.push({
      id: `hist-${order.id}-${history.length}`,
      orderId: order.id,
      fromStatus: command.fromStatus,
      toStatus: command.toStatus,
      changedAt: new Date(),
      changedBy: command.changedBy,
      reason: command.reason,
    });
    this.history.set(order.id, history);
    return updated;
  }

  async deleteById(orderId: string): Promise<void> {
    this.orders.delete(orderId);
    this.items.delete(orderId);
    this.history.delete(orderId);
  }
}

function makeSnapshot(
  override: Partial<CreateOrderFromCheckoutInput> = {},
): CreateOrderFromCheckoutInput {
  return {
    sessionId: "sess-1",
    customerId: "customer-1",
    cartId: "cart-1",
    currency: "IDR",
    items: [
      {
        variantId: "var-1",
        quantity: 2,
        unitPriceSnapshot: 50_000,
        lineSubtotal: 100_000,
      },
    ],
    itemsSubtotal: 100_000,
    shippingFee: 15_000,
    grandTotal: 115_000,
    address: {
      addressId: "addr-1",
      recipientName: "Rezi",
      phone: "08123456789",
      street: "Jl. Merdeka 1",
      district: "Menteng",
      city: "Jakarta",
      province: "DKI Jakarta",
      postalCode: "10310",
    },
    shipping: {
      optionId: "stub-regular",
      provider: "STUB",
      serviceCode: "REG",
      serviceName: "Regular",
      estimatedDays: 3,
      shippingFee: 15_000,
    },
    payment: {
      method: "BANK_TRANSFER",
      label: "Bank Transfer",
    },
    ...override,
  };
}

function makeCatalogPort(
  variants: Record<string, OrderVariantSnapshot | null> = {
    "var-1": {
      variantId: "var-1",
      sku: "SKU-1",
      productName: "Run Socks",
      variantLabel: "M / Black",
      thumbnailUrl: "/img.jpg",
      brand: "LOCA",
      categoryName: "Socks",
      status: "ACTIVE",
    },
  },
): OrderCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      return variants[variantId] ?? null;
    },
  };
}

function makeInventoryPort(options?: {
  failReserveCode?: string;
  failReserveMessage?: string;
  onReserve?: (orderId: string) => void;
  onRelease?: (orderId: string) => void;
  reserved?: Set<string>;
}): OrderInventoryPort {
  const reserved = options?.reserved ?? new Set<string>();
  return {
    async reserveStock(input) {
      if (options?.failReserveCode) {
        return {
          success: false,
          code: options.failReserveCode,
          message: options.failReserveMessage ?? "reserve failed",
        };
      }
      reserved.add(input.orderId);
      options?.onReserve?.(input.orderId);
      return { success: true };
    },
    async releaseReservedStock(input) {
      options?.onRelease?.(input.orderId);
      if (!reserved.has(input.orderId)) {
        return {
          success: false,
          code: "RESERVATION_NOT_FOUND",
          message: "no reservation",
        };
      }
      reserved.delete(input.orderId);
      return { success: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Domain invariants
// ---------------------------------------------------------------------------

describe("order invariants", () => {
  it("allows legal transitions and rejects illegal ones", () => {
    expect(canTransitionOrderStatus("PENDING", "WAITING_PAYMENT")).toBe(true);
    expect(canTransitionOrderStatus("WAITING_PAYMENT", "PAID")).toBe(true);
    expect(canTransitionOrderStatus("PAID", "WAITING_PAYMENT")).toBe(false);
    expect(canTransitionOrderStatus("COMPLETED", "CANCELLED")).toBe(false);
  });

  it("marks only PENDING/WAITING_PAYMENT as cancellable", () => {
    expect(isCancellableStatus("WAITING_PAYMENT")).toBe(true);
    expect(isCancellableStatus("PAID")).toBe(false);
  });

  it("validates grand total consistency", () => {
    expect(
      isGrandTotalConsistent({
        itemsSubtotal: 100,
        shippingFee: 15,
        discountTotal: 0,
        grandTotal: 115,
      }),
    ).toBe(true);
    expect(
      isGrandTotalConsistent({
        itemsSubtotal: 100,
        shippingFee: 15,
        discountTotal: 0,
        grandTotal: 110,
      }),
    ).toBe(false);
  });

  it("restricts customer cancel to own order", () => {
    const order = {
      customerId: "customer-1",
    } as Order;
    expect(
      canActorCancelOrder(order, { actorId: "customer-1", actorRole: "CUSTOMER" }),
    ).toBe(true);
    expect(
      canActorCancelOrder(order, { actorId: "other", actorRole: "CUSTOMER" }),
    ).toBe(false);
    expect(canActorCancelOrder(order, { actorId: "admin-1", actorRole: "ADMIN" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createOrderFromCheckout
// ---------------------------------------------------------------------------

describe("createOrderFromCheckout", () => {
  it("creates WAITING_PAYMENT order with items, history, and reserved stock", async () => {
    const repo = new InMemoryOrderRepository();
    const reserved = new Set<string>();
    const result = await createOrderFromCheckout(
      repo,
      makeCatalogPort(),
      makeInventoryPort({ reserved }),
      makeSnapshot(),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.orderStatus).toBe("WAITING_PAYMENT");
    expect(result.data.grandTotal).toBe(115_000);
    expect(result.data.orderNumber).toMatch(/^LOC-\d{8}-[A-Z0-9]{6}$/);
    expect(reserved.has(result.data.id)).toBe(true);

    const detail = await getOrderDetail(repo, result.data.id);
    expect(detail.success).toBe(true);
    if (!detail.success) return;
    expect(detail.data.items).toHaveLength(1);
    expect(detail.data.items[0]?.productNameSnapshot).toBe("Run Socks");
    expect(detail.data.items[0]?.brandSnapshot).toBe("LOCA");
    expect(detail.data.statusHistory.map((h) => h.toStatus)).toEqual([
      "PENDING",
      "WAITING_PAYMENT",
    ]);
  });

  it("does not persist order when stock reserve fails", async () => {
    const repo = new InMemoryOrderRepository();
    const result = await createOrderFromCheckout(
      repo,
      makeCatalogPort(),
      makeInventoryPort({
        failReserveCode: "INSUFFICIENT_STOCK",
        failReserveMessage: "not enough",
      }),
      makeSnapshot(),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("INSUFFICIENT_STOCK");
    expect(repo.orders.size).toBe(0);
  });

  it("rejects empty items", async () => {
    const result = await createOrderFromCheckout(
      new InMemoryOrderRepository(),
      makeCatalogPort(),
      makeInventoryPort(),
      makeSnapshot({ items: [], itemsSubtotal: 0, grandTotal: 15_000 }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("EMPTY_ORDER");
  });

  it("rejects missing catalog variant", async () => {
    const result = await createOrderFromCheckout(
      new InMemoryOrderRepository(),
      makeCatalogPort({ "var-1": null }),
      makeInventoryPort(),
      makeSnapshot(),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VARIANT_NOT_FOUND");
  });

  it("rejects inconsistent grand total", async () => {
    const result = await createOrderFromCheckout(
      new InMemoryOrderRepository(),
      makeCatalogPort(),
      makeInventoryPort(),
      makeSnapshot({ grandTotal: 999 }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_TOTAL");
  });
});

// ---------------------------------------------------------------------------
// transition + cancel
// ---------------------------------------------------------------------------

describe("transitionOrderStatus", () => {
  async function seedWaitingPayment(): Promise<{
    repo: InMemoryOrderRepository;
    orderId: string;
  }> {
    const repo = new InMemoryOrderRepository();
    const created = await createOrderFromCheckout(
      repo,
      makeCatalogPort(),
      makeInventoryPort(),
      makeSnapshot(),
    );
    if (!created.success) throw new Error("seed failed");
    return { repo, orderId: created.data.id };
  }

  it("allows admin PAID transition from WAITING_PAYMENT", async () => {
    const { repo, orderId } = await seedWaitingPayment();
    const result = await transitionOrderStatus(repo, {
      orderId,
      nextStatus: "PAID",
      actor: { actorId: "admin-1", actorRole: "ADMIN" },
      reason: "Payment confirmed",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.orderStatus).toBe("PAID");
  });

  it("rejects illegal transition", async () => {
    const { repo, orderId } = await seedWaitingPayment();
    const result = await transitionOrderStatus(repo, {
      orderId,
      nextStatus: "SHIPPED" as OrderStatus,
      actor: { actorId: "admin-1", actorRole: "ADMIN" },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ILLEGAL_STATUS_TRANSITION");
  });

  it("rejects customer operational transition", async () => {
    const { repo, orderId } = await seedWaitingPayment();
    const result = await transitionOrderStatus(repo, {
      orderId,
      nextStatus: "PAID",
      actor: { actorId: "customer-1", actorRole: "CUSTOMER" },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });
});

describe("cancelOrder", () => {
  it("cancels WAITING_PAYMENT and releases stock", async () => {
    const repo = new InMemoryOrderRepository();
    const reserved = new Set<string>();
    const created = await createOrderFromCheckout(
      repo,
      makeCatalogPort(),
      makeInventoryPort({ reserved }),
      makeSnapshot(),
    );
    expect(created.success).toBe(true);
    if (!created.success) return;

    let released = false;
    const result = await cancelOrder(
      repo,
      makeInventoryPort({
        reserved,
        onRelease: () => {
          released = true;
        },
      }),
      {
        orderId: created.data.id,
        actor: { actorId: "customer-1", actorRole: "CUSTOMER" },
        reason: "Changed mind",
      },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.orderStatus).toBe("CANCELLED");
    expect(released).toBe(true);
    expect(reserved.has(created.data.id)).toBe(false);
  });

  it("rejects cancel after PAID", async () => {
    const repo = new InMemoryOrderRepository();
    const reserved = new Set<string>();
    const created = await createOrderFromCheckout(
      repo,
      makeCatalogPort(),
      makeInventoryPort({ reserved }),
      makeSnapshot(),
    );
    if (!created.success) throw new Error("seed failed");

    await transitionOrderStatus(repo, {
      orderId: created.data.id,
      nextStatus: "PAID",
      actor: { actorId: "admin-1", actorRole: "ADMIN" },
    });

    const result = await cancelOrder(repo, makeInventoryPort({ reserved }), {
      orderId: created.data.id,
      actor: { actorId: "admin-1", actorRole: "ADMIN" },
      reason: "too late",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ORDER_NOT_CANCELLABLE");
  });
});
