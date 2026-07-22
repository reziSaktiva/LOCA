/**
 * M7.5 — Phase 5 Backend Exit Validation (checkout side)
 *
 * Smoke + contract checks yang mengunci exit criteria Phase 5 backend
 * (docs/11-development-roadmap.md §Phase 5, planning/backlog.md M7.5):
 *
 * 1. Flow checkout terpadu: prepareCheckout → pilih shipping → pilih payment
 *    → placeOrder, hingga `CheckoutSnapshot` immutable siap dikonsumsi order
 *    (`CheckoutOrderPort`).
 * 2. Kontrak lintas module (`checkout` → `order`) hanya lewat port —
 *    `CheckoutOrderPort` di sini di-stub selaras kontrak asli
 *    (lihat `order/application/phase-5-backend-exit.test.ts` untuk validasi
 *    sisi order: WAITING_PAYMENT + reserve ACTIVE → cancel → RELEASED).
 * 3. Public facade `order` tetap mengekspos kontrak yang dipakai checkout
 *    (`createOrderFromCheckout`) dan API/UI Phase 5.
 *
 * Catatan arsitektur: file ini TIDAK boleh mengimpor layer internal module
 * `order` (application/domain/infrastructure) — hanya `order/public/*` —
 * sesuai boundary rule `import/no-restricted-paths` (eslint.config.mjs).
 */

import { describe, expect, it } from "vitest";
import type {
  CheckoutSession,
  CheckoutSnapshot,
} from "../domain/checkout-entities";
import type {
  CheckoutRepository,
  CreateCheckoutSessionCommand,
  UpdateCheckoutSessionCommand,
} from "../domain/checkout-repository";
import type {
  CheckoutAddress,
  CheckoutCartPort,
  CheckoutCartSnapshot,
  CheckoutCustomerPort,
  CheckoutOrderPort,
} from "./checkout-ports";
import { selectCheckoutPaymentMethod, selectCheckoutShippingOption } from "./manage-checkout-selection";
import { placeOrder } from "./place-order";
import { prepareCheckout } from "./prepare-checkout";
import { createStubPaymentMethodPort } from "./stub-payment-method-port";
import { createStubShippingPort } from "./stub-shipping-port";

// ---------------------------------------------------------------------------
// In-memory Checkout repository + ports (mirror checkout.test.ts)
// ---------------------------------------------------------------------------

class InMemoryCheckoutRepository implements CheckoutRepository {
  private sessions: CheckoutSession[] = [];
  private snapshots = new Map<string, CheckoutSnapshot>();
  private counter = 0;

  async findById(sessionId: string) {
    return this.sessions.find((s) => s.id === sessionId) ?? null;
  }

  async findOpenByCustomerId(customerId: string) {
    return (
      this.sessions.find(
        (s) => s.customerId === customerId && s.checkoutStatus !== "ORDER_PLACED",
      ) ?? null
    );
  }

  async create(command: CreateCheckoutSessionCommand) {
    this.counter += 1;
    const session: CheckoutSession = {
      id: `session-exit-${this.counter}`,
      customerId: command.customerId,
      cartId: command.cartId,
      checkoutStatus: command.checkoutStatus ?? "STARTED",
      selectedAddressId: command.selectedAddressId ?? null,
      selectedShippingOptionId: null,
      selectedShippingServiceName: null,
      selectedShippingFee: null,
      selectedPaymentMethod: null,
      currency: command.currency,
      itemsSubtotal: command.itemsSubtotal,
      shippingFee: 0,
      grandTotal: command.itemsSubtotal,
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.push(session);
    return session;
  }

  async update(command: UpdateCheckoutSessionCommand) {
    const index = this.sessions.findIndex((s) => s.id === command.sessionId);
    if (index < 0) throw new Error("session not found");
    const current = this.sessions[index]!;
    const next: CheckoutSession = {
      ...current,
      checkoutStatus: command.checkoutStatus ?? current.checkoutStatus,
      selectedAddressId:
        command.selectedAddressId !== undefined
          ? command.selectedAddressId
          : current.selectedAddressId,
      selectedShippingOptionId:
        command.selectedShippingOptionId !== undefined
          ? command.selectedShippingOptionId
          : current.selectedShippingOptionId,
      selectedShippingServiceName:
        command.selectedShippingServiceName !== undefined
          ? command.selectedShippingServiceName
          : current.selectedShippingServiceName,
      selectedShippingFee:
        command.selectedShippingFee !== undefined
          ? command.selectedShippingFee
          : current.selectedShippingFee,
      selectedPaymentMethod:
        command.selectedPaymentMethod !== undefined
          ? command.selectedPaymentMethod
          : current.selectedPaymentMethod,
      itemsSubtotal: command.itemsSubtotal ?? current.itemsSubtotal,
      shippingFee: command.shippingFee ?? current.shippingFee,
      grandTotal: command.grandTotal ?? current.grandTotal,
      cartId: command.cartId ?? current.cartId,
      orderId: command.orderId !== undefined ? command.orderId : current.orderId,
      updatedAt: new Date(),
    };
    this.sessions[index] = next;
    if (command.snapshot) {
      this.snapshots.set(command.sessionId, command.snapshot);
    }
    return next;
  }

  async findSnapshot(sessionId: string) {
    return this.snapshots.get(sessionId) ?? null;
  }
}

function makeAddress(): CheckoutAddress {
  return {
    id: "addr-exit-1",
    customerId: "customer-exit-1",
    recipientName: "Rezi Saktiva",
    phone: "081234567890",
    street: "Jl. Sudirman No. 1",
    district: "Setiabudi",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12910",
    isDefault: true,
  };
}

function makeCartSnapshot(): CheckoutCartSnapshot {
  return {
    cartId: "cart-exit-1",
    currency: "IDR",
    itemCount: 2,
    itemsSubtotal: 350_000,
    items: [
      { variantId: "var-exit-1", quantity: 2, unitPriceSnapshot: 150_000, lineSubtotal: 300_000 },
      { variantId: "var-exit-2", quantity: 1, unitPriceSnapshot: 50_000, lineSubtotal: 50_000 },
    ],
  };
}

function makeCartPort(onClear: () => void): CheckoutCartPort {
  let current = makeCartSnapshot();
  return {
    async getSnapshot() {
      return current;
    },
    async clearAfterCheckout() {
      current = { ...current, itemCount: 0, itemsSubtotal: 0, items: [] };
      onClear();
    },
  };
}

function makeCustomerPort(): CheckoutCustomerPort {
  const addresses = [makeAddress()];
  return {
    async listAddresses() {
      return addresses;
    },
  };
}

/**
 * Stub `CheckoutOrderPort` selaras kontrak produksi
 * (`checkout/public/checkout-service.ts` `makeOrderPort`) — sisi order
 * divalidasi terpisah di `order/application/phase-5-backend-exit.test.ts`
 * memakai use case order yang sesungguhnya (bukan mock).
 */
function makeOrderPort(orderId: string): CheckoutOrderPort {
  return {
    async createOrderFromCheckout() {
      return { success: true, orderId };
    },
  };
}

// ---------------------------------------------------------------------------
// Phase 5 backend exit — checkout flow smoke
// ---------------------------------------------------------------------------

describe("Phase 5 backend exit — checkout flow (prepare → shipping → payment → place order)", () => {
  it("produces an ORDER_PLACED session with an order-ready CheckoutSnapshot", async () => {
    const customerId = "customer-exit-1";
    const checkoutRepo = new InMemoryCheckoutRepository();
    const shippingPort = createStubShippingPort();
    const paymentPort = createStubPaymentMethodPort();
    const customerPort = makeCustomerPort();
    let cartCleared = false;
    const cartPort = makeCartPort(() => {
      cartCleared = true;
    });
    const orderPort = makeOrderPort("order-exit-1");

    // 1) prepareCheckout — cart + alamat default → sesi ADDRESS_CONFIRMED
    const prepared = await prepareCheckout(
      checkoutRepo,
      cartPort,
      customerPort,
      shippingPort,
      paymentPort,
      customerId,
    );
    expect(prepared.success).toBe(true);
    if (!prepared.success) return;
    expect(prepared.data.session.checkoutStatus).toBe("ADDRESS_CONFIRMED");
    expect(prepared.data.shippingOptions.map((o) => o.optionId)).toEqual([
      "stub-regular",
      "stub-express",
    ]);
    expect(prepared.data.paymentMethods.map((m) => m.method)).toEqual([
      "BANK_TRANSFER",
      "VIRTUAL_ACCOUNT",
    ]);

    // 2) Pilih shipping
    const shippingSelected = await selectCheckoutShippingOption(
      checkoutRepo,
      customerPort,
      shippingPort,
      { customerId, optionId: "stub-regular" },
    );
    expect(shippingSelected.success).toBe(true);
    if (!shippingSelected.success) return;
    expect(shippingSelected.data.checkoutStatus).toBe("SHIPPING_SELECTED");
    expect(shippingSelected.data.selectedShippingFee).toBe(15_000);

    // 3) Pilih payment
    const paymentSelected = await selectCheckoutPaymentMethod(checkoutRepo, paymentPort, {
      customerId,
      method: "BANK_TRANSFER",
    });
    expect(paymentSelected.success).toBe(true);
    if (!paymentSelected.success) return;
    expect(paymentSelected.data.checkoutStatus).toBe("PAYMENT_METHOD_SELECTED");

    // 4) placeOrder — snapshot immutable dikirim ke CheckoutOrderPort, cart dikosongkan
    const placed = await placeOrder(
      checkoutRepo,
      cartPort,
      customerPort,
      shippingPort,
      paymentPort,
      orderPort,
      { customerId },
    );
    expect(placed.success).toBe(true);
    if (!placed.success) return;

    expect(placed.data.orderId).toBe("order-exit-1");
    expect(placed.data.snapshot.itemsSubtotal).toBe(350_000);
    expect(placed.data.snapshot.shippingFee).toBe(15_000);
    expect(placed.data.snapshot.grandTotal).toBe(365_000);
    expect(placed.data.snapshot.items).toHaveLength(2);
    expect(placed.data.snapshot.address.addressId).toBe("addr-exit-1");
    expect(placed.data.snapshot.shipping.optionId).toBe("stub-regular");
    expect(placed.data.snapshot.payment.method).toBe("BANK_TRANSFER");
    expect(cartCleared).toBe(true);

    // Sesi ditutup (ORDER_PLACED) — tidak lagi "open" untuk customer ini.
    const openSession = await checkoutRepo.findOpenByCustomerId(customerId);
    expect(openSession).toBeNull();

    const closedSession = await checkoutRepo.findById(prepared.data.session.id);
    expect(closedSession?.checkoutStatus).toBe("ORDER_PLACED");
    expect(closedSession?.orderId).toBe("order-exit-1");

    const storedSnapshot = await checkoutRepo.findSnapshot(prepared.data.session.id);
    expect(storedSnapshot?.grandTotal).toBe(365_000);
  });

  it("rejects placeOrder when checkout is incomplete (missing shipping/payment)", async () => {
    const customerId = "customer-exit-2";
    const checkoutRepo = new InMemoryCheckoutRepository();
    const cartPort = makeCartPort(() => {});
    const customerPort = makeCustomerPort();
    const shippingPort = createStubShippingPort();
    const paymentPort = createStubPaymentMethodPort();
    const orderPort = makeOrderPort("order-exit-2");

    await prepareCheckout(checkoutRepo, cartPort, customerPort, shippingPort, paymentPort, customerId);

    const placed = await placeOrder(
      checkoutRepo,
      cartPort,
      customerPort,
      shippingPort,
      paymentPort,
      orderPort,
      { customerId },
    );

    expect(placed.success).toBe(false);
    if (!placed.success) expect(placed.error.code).toBe("CHECKOUT_INCOMPLETE");
  });
});

// ---------------------------------------------------------------------------
// Phase 5 readiness — order public facade contract surface
// (hanya memverifikasi export; tidak memanggil DB)
// ---------------------------------------------------------------------------

describe("Phase 5 backend exit — order public facade readiness", () => {
  it("order public facade exposes createOrderFromCheckout for CheckoutOrderPort wiring", async () => {
    const { createOrderFromCheckout, orderCreateFromCheckout } = await import(
      "../../order/public/order-service"
    );
    expect(typeof createOrderFromCheckout).toBe("function");
    expect(typeof orderCreateFromCheckout).toBe("function");
  });

  it("order public facade exposes getOrder/cancel surface consumed after place-order", async () => {
    const { getOrder, orderGetDetail, cancelOrderForActor, orderCancel, ORDER_STATUSES } =
      await import("../../order/public/order-service");
    expect(typeof getOrder).toBe("function");
    expect(typeof orderGetDetail).toBe("function");
    expect(typeof cancelOrderForActor).toBe("function");
    expect(typeof orderCancel).toBe("function");
    expect(ORDER_STATUSES).toContain("WAITING_PAYMENT");
    expect(ORDER_STATUSES).toContain("CANCELLED");
  });
});
