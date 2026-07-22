/**
 * M7.5 — Phase 5 Backend Exit Validation (order side)
 *
 * Smoke + contract checks yang mengunci exit criteria Phase 5 backend
 * (docs/11-development-roadmap.md §Phase 5, planning/backlog.md M7.5):
 *
 * 1. Flow order terpadu: `createOrderFromCheckout` (dipanggil checkout lewat
 *    `CheckoutOrderPort`) → order `WAITING_PAYMENT` + reservasi stok `ACTIVE`
 *    → customer `getOrder` → cancel → reservasi stok `RELEASED`.
 * 2. Input yang dipakai meniru shape `CheckoutSnapshot` (docs/06 §6.6) persis
 *    seperti yang dikirim `checkout/application/place-order.ts` — lihat
 *    `checkout/application/phase-5-backend-exit.test.ts` untuk validasi sisi
 *    checkout (prepare → shipping → payment → place order).
 * 3. Public facade `checkout` tetap mengekspos kontrak yang dikonsumsi API/UI
 *    Phase 5 (M7.6/M7.7).
 *
 * Catatan arsitektur: file ini TIDAK boleh mengimpor layer internal module
 * `checkout` (application/domain/infrastructure) — hanya `checkout/public/*`
 * — sesuai boundary rule `import/no-restricted-paths` (eslint.config.mjs).
 */

import { describe, expect, it } from "vitest";
import { cancelOrder } from "./cancel-order";
import { createOrderFromCheckout } from "./create-order-from-checkout";
import { getOrderDetail } from "./get-order";
import type {
  OrderCatalogPort,
  OrderInventoryPort,
  OrderVariantSnapshot,
} from "./order-ports";
import type {
  CreateOrderFromCheckoutInput,
  Order,
  OrderItem,
  OrderStatusHistory,
} from "../domain/order-entities";
import type {
  CreateOrderPersistCommand,
  ListOrdersQuery,
  ListOrdersResult,
  OrderRepository,
  UpdateOrderStatusPersistCommand,
} from "../domain/order-repository";

// ---------------------------------------------------------------------------
// In-memory Order repository + ports (mirror order.test.ts)
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
    const updated: Order = { ...order, orderStatus: command.toStatus, updatedAt: new Date() };
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

const CATALOG_SNAPSHOTS: Record<string, OrderVariantSnapshot> = {
  "var-exit-1": {
    variantId: "var-exit-1",
    sku: "SKU-EXIT-1",
    productName: "Exit Gate Tee",
    variantLabel: "M",
    thumbnailUrl: "/exit-tee.jpg",
    brand: "LOCA",
    categoryName: "Apparel",
    status: "ACTIVE",
  },
  "var-exit-2": {
    variantId: "var-exit-2",
    sku: "SKU-EXIT-2",
    productName: "Exit Gate Cap",
    variantLabel: "One Size",
    thumbnailUrl: "/exit-cap.jpg",
    brand: "LOCA",
    categoryName: "Accessories",
    status: "ACTIVE",
  },
};

function makeOrderCatalogPort(): OrderCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      return CATALOG_SNAPSHOTS[variantId] ?? null;
    },
  };
}

/** Reservation registry — simulasi stok inventory ACTIVE/RELEASED per order. */
function makeOrderInventoryPort(
  reservations: Map<string, "ACTIVE" | "RELEASED">,
): OrderInventoryPort {
  return {
    async reserveStock(input) {
      reservations.set(input.orderId, "ACTIVE");
      return { success: true };
    },
    async releaseReservedStock(input) {
      if (reservations.get(input.orderId) !== "ACTIVE") {
        return { success: false, code: "RESERVATION_NOT_FOUND", message: "no active reservation" };
      }
      reservations.set(input.orderId, "RELEASED");
      return { success: true };
    },
  };
}

/**
 * Input meniru `CheckoutSnapshot` (docs/06-data-model.md §6.6) persis seperti
 * yang dikirim `checkout/application/place-order.ts` lewat `CheckoutOrderPort`.
 */
function makeCheckoutSnapshotInput(
  override: Partial<CreateOrderFromCheckoutInput> = {},
): CreateOrderFromCheckoutInput {
  return {
    sessionId: "session-exit-1",
    customerId: "customer-exit-1",
    cartId: "cart-exit-1",
    currency: "IDR",
    items: [
      { variantId: "var-exit-1", quantity: 2, unitPriceSnapshot: 150_000, lineSubtotal: 300_000 },
      { variantId: "var-exit-2", quantity: 1, unitPriceSnapshot: 50_000, lineSubtotal: 50_000 },
    ],
    itemsSubtotal: 350_000,
    shippingFee: 15_000,
    grandTotal: 365_000,
    address: {
      addressId: "addr-exit-1",
      recipientName: "Rezi Saktiva",
      phone: "081234567890",
      street: "Jl. Sudirman No. 1",
      district: "Setiabudi",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12910",
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
      label: "Transfer Bank",
    },
    ...override,
  };
}

// ---------------------------------------------------------------------------
// Phase 5 backend exit — order flow smoke
// ---------------------------------------------------------------------------

describe("Phase 5 backend exit — order flow (create → reserve ACTIVE → get → cancel → release)", () => {
  it(
    "createOrderFromCheckout → WAITING_PAYMENT + reservation ACTIVE → " +
      "customer getOrder → cancel → reservation RELEASED",
    async () => {
      const orderRepo = new InMemoryOrderRepository();
      const reservations = new Map<string, "ACTIVE" | "RELEASED">();
      const customerId = "customer-exit-1";

      // 1) createOrderFromCheckout — dipanggil checkout via CheckoutOrderPort
      const created = await createOrderFromCheckout(
        orderRepo,
        makeOrderCatalogPort(),
        makeOrderInventoryPort(reservations),
        makeCheckoutSnapshotInput({ customerId }),
      );
      expect(created.success).toBe(true);
      if (!created.success) return;

      const orderId = created.data.id;
      expect(created.data.orderStatus).toBe("WAITING_PAYMENT");
      expect(created.data.grandTotal).toBe(365_000);
      expect(created.data.orderNumber).toMatch(/^LOC-\d{8}-[A-Z0-9]{6}$/);
      expect(reservations.get(orderId)).toBe("ACTIVE");

      // 2) Customer getOrder — detail + items + status history
      const detail = await getOrderDetail(orderRepo, orderId);
      expect(detail.success).toBe(true);
      if (!detail.success) return;
      expect(detail.data.order.id).toBe(orderId);
      expect(detail.data.order.customerId).toBe(customerId);
      expect(detail.data.order.orderStatus).toBe("WAITING_PAYMENT");
      expect(detail.data.items).toHaveLength(2);
      expect(detail.data.items.map((i) => i.variantId).sort()).toEqual([
        "var-exit-1",
        "var-exit-2",
      ]);
      expect(detail.data.statusHistory.map((h) => h.toStatus)).toEqual([
        "PENDING",
        "WAITING_PAYMENT",
      ]);

      // 3) Cancel — release reserved stock (policy MVP: customer boleh cancel order sendiri)
      const cancelled = await cancelOrder(orderRepo, makeOrderInventoryPort(reservations), {
        orderId,
        actor: { actorId: customerId, actorRole: "CUSTOMER" },
        reason: "Customer changed mind",
      });
      expect(cancelled.success).toBe(true);
      if (!cancelled.success) return;
      expect(cancelled.data.orderStatus).toBe("CANCELLED");
      expect(reservations.get(orderId)).toBe("RELEASED");

      const finalDetail = await getOrderDetail(orderRepo, orderId);
      expect(finalDetail.success).toBe(true);
      if (!finalDetail.success) return;
      expect(finalDetail.data.statusHistory.map((h) => h.toStatus)).toEqual([
        "PENDING",
        "WAITING_PAYMENT",
        "CANCELLED",
      ]);
    },
  );

  it("does not persist order and leaves no reservation when stock reserve fails", async () => {
    const orderRepo = new InMemoryOrderRepository();
    const reservations = new Map<string, "ACTIVE" | "RELEASED">();
    const failingInventoryPort: OrderInventoryPort = {
      async reserveStock() {
        return { success: false, code: "INSUFFICIENT_STOCK", message: "not enough stock" };
      },
      async releaseReservedStock(input) {
        return makeOrderInventoryPort(reservations).releaseReservedStock(input);
      },
    };

    const result = await createOrderFromCheckout(
      orderRepo,
      makeOrderCatalogPort(),
      failingInventoryPort,
      makeCheckoutSnapshotInput(),
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INSUFFICIENT_STOCK");
    expect(orderRepo.orders.size).toBe(0);
    expect(reservations.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Phase 5 readiness — checkout public facade contract surface
// (hanya memverifikasi export; tidak memanggil DB)
// ---------------------------------------------------------------------------

describe("Phase 5 backend exit — checkout public facade readiness", () => {
  it("checkout public facade exposes prepare/select/place-order surface for API layer", async () => {
    const {
      checkoutPrepare,
      checkoutSelectAddress,
      checkoutSelectShippingOption,
      checkoutSelectPaymentMethod,
      checkoutListPaymentMethods,
      checkoutGetShippingOptions,
      checkoutPlaceOrder,
      prepareCheckoutForCustomer,
      getShippingOptionsForCustomer,
      placeOrderForCustomer,
    } = await import("../../checkout/public/checkout-service");

    expect(typeof checkoutPrepare).toBe("function");
    expect(typeof checkoutSelectAddress).toBe("function");
    expect(typeof checkoutSelectShippingOption).toBe("function");
    expect(typeof checkoutSelectPaymentMethod).toBe("function");
    expect(typeof checkoutListPaymentMethods).toBe("function");
    expect(typeof checkoutGetShippingOptions).toBe("function");
    expect(typeof checkoutPlaceOrder).toBe("function");
    expect(typeof prepareCheckoutForCustomer).toBe("function");
    expect(typeof getShippingOptionsForCustomer).toBe("function");
    expect(typeof placeOrderForCustomer).toBe("function");
  });
});
