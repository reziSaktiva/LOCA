import { describe, expect, it } from "vitest";
import type {
  CheckoutSession,
  CheckoutSnapshot,
  CheckoutStatus,
  PaymentMethodOption,
  ShippingOption,
} from "../domain/checkout-entities";
import {
  calculateGrandTotal,
  isCartNonEmpty,
  isCheckoutEditable,
  isReadyToPlaceOrder,
  isValidMoneyAmount,
} from "../domain/checkout-invariants";
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
  CheckoutPaymentMethodPort,
  CheckoutShippingPort,
} from "./checkout-ports";
import {
  getShippingOptionsForCheckout,
  selectCheckoutAddress,
  selectCheckoutPaymentMethod,
  selectCheckoutShippingOption,
} from "./manage-checkout-selection";
import { placeOrder } from "./place-order";
import { prepareCheckout } from "./prepare-checkout";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    optionId: "stub-regular",
    provider: "STUB",
    serviceCode: "REG",
    serviceName: "Regular",
    estimatedDays: 3,
    shippingFee: 15_000,
  },
  {
    optionId: "stub-express",
    provider: "STUB",
    serviceCode: "EXP",
    serviceName: "Express",
    estimatedDays: 1,
    shippingFee: 30_000,
  },
];

const PAYMENT_METHODS: PaymentMethodOption[] = [
  { method: "BANK_TRANSFER", label: "Transfer Bank" },
  { method: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
];

function makeAddress(override: Partial<CheckoutAddress> = {}): CheckoutAddress {
  return {
    id: "addr-1",
    customerId: "customer-1",
    recipientName: "Rezi",
    phone: "08123456789",
    street: "Jl. Merdeka 1",
    district: "Menteng",
    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "10310",
    isDefault: true,
    ...override,
  };
}

function makeCartSnapshot(override: Partial<CheckoutCartSnapshot> = {}): CheckoutCartSnapshot {
  return {
    cartId: "cart-1",
    currency: "IDR",
    itemCount: 1,
    itemsSubtotal: 100_000,
    items: [
      {
        variantId: "var-1",
        quantity: 1,
        unitPriceSnapshot: 100_000,
        lineSubtotal: 100_000,
      },
    ],
    ...override,
  };
}

class InMemoryCheckoutRepository implements CheckoutRepository {
  private sessions: CheckoutSession[] = [];
  private snapshots = new Map<string, CheckoutSnapshot>();
  private counter = 0;

  seed(sessions: CheckoutSession[]) {
    this.sessions = [...sessions];
    this.counter = sessions.length;
    return this;
  }

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
      id: `session-${this.counter}`,
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

function makeCartPort(
  snapshot: CheckoutCartSnapshot = makeCartSnapshot(),
  onClear?: () => void,
): CheckoutCartPort {
  let current = snapshot;
  return {
    async getSnapshot() {
      return current;
    },
    async clearAfterCheckout() {
      current = { ...current, itemCount: 0, itemsSubtotal: 0, items: [] };
      onClear?.();
    },
  };
}

function makeCustomerPort(addresses: CheckoutAddress[] = [makeAddress()]): CheckoutCustomerPort {
  return {
    async listAddresses() {
      return addresses;
    },
  };
}

function makeShippingPort(options: ShippingOption[] = SHIPPING_OPTIONS): CheckoutShippingPort {
  return {
    async listOptions() {
      return options;
    },
  };
}

function makePaymentPort(
  methods: PaymentMethodOption[] = PAYMENT_METHODS,
): CheckoutPaymentMethodPort {
  return {
    async listMethods() {
      return methods;
    },
  };
}

function makeOrderPort(
  result: Awaited<ReturnType<CheckoutOrderPort["createOrderFromCheckout"]>> = {
    success: true,
    orderId: "order-1",
  },
): CheckoutOrderPort {
  return {
    async createOrderFromCheckout() {
      return result;
    },
  };
}

async function readySession(repo: InMemoryCheckoutRepository, customerId = "customer-1") {
  const prepared = await prepareCheckout(
    repo,
    makeCartPort(),
    makeCustomerPort(),
    makeShippingPort(),
    makePaymentPort(),
    customerId,
  );
  expect(prepared.success).toBe(true);
  if (!prepared.success) throw new Error("prepare failed");

  const shipping = await selectCheckoutShippingOption(
    repo,
    makeCustomerPort(),
    makeShippingPort(),
    { customerId, optionId: "stub-regular" },
  );
  expect(shipping.success).toBe(true);

  const payment = await selectCheckoutPaymentMethod(repo, makePaymentPort(), {
    customerId,
    method: "BANK_TRANSFER",
  });
  expect(payment.success).toBe(true);
  if (!payment.success) throw new Error("payment failed");
  return payment.data;
}

// ---------------------------------------------------------------------------
// Invariants
// ---------------------------------------------------------------------------

describe("checkout invariants", () => {
  it("requires non-empty cart", () => {
    expect(isCartNonEmpty(0)).toBe(false);
    expect(isCartNonEmpty(1)).toBe(true);
  });

  it("blocks edits after ORDER_PLACED", () => {
    expect(isCheckoutEditable("PAYMENT_METHOD_SELECTED")).toBe(true);
    expect(isCheckoutEditable("ORDER_PLACED")).toBe(false);
  });

  it("calculates grand total", () => {
    expect(calculateGrandTotal(100_000, 15_000)).toBe(115_000);
    expect(isValidMoneyAmount(-1)).toBe(false);
  });

  it("isReadyToPlaceOrder requires address + shipping + payment", () => {
    const base: CheckoutSession = {
      id: "s1",
      customerId: "c1",
      cartId: "cart-1",
      checkoutStatus: "PAYMENT_METHOD_SELECTED" as CheckoutStatus,
      selectedAddressId: "addr-1",
      selectedShippingOptionId: "stub-regular",
      selectedShippingServiceName: "Regular",
      selectedShippingFee: 15_000,
      selectedPaymentMethod: "BANK_TRANSFER",
      currency: "IDR",
      itemsSubtotal: 100_000,
      shippingFee: 15_000,
      grandTotal: 115_000,
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(isReadyToPlaceOrder(base)).toBe(true);
    expect(isReadyToPlaceOrder({ ...base, selectedPaymentMethod: null })).toBe(false);
    expect(isReadyToPlaceOrder({ ...base, checkoutStatus: "ORDER_PLACED" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prepareCheckout
// ---------------------------------------------------------------------------

describe("prepareCheckout", () => {
  it("fails when cart is empty", async () => {
    const result = await prepareCheckout(
      new InMemoryCheckoutRepository(),
      makeCartPort(makeCartSnapshot({ itemCount: 0, items: [], itemsSubtotal: 0 })),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("CART_EMPTY");
  });

  it("fails when customer has no address", async () => {
    const result = await prepareCheckout(
      new InMemoryCheckoutRepository(),
      makeCartPort(),
      makeCustomerPort([]),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ADDRESS_REQUIRED");
  });

  it("creates session with default address confirmed", async () => {
    const result = await prepareCheckout(
      new InMemoryCheckoutRepository(),
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.session.checkoutStatus).toBe("ADDRESS_CONFIRMED");
    expect(result.data.session.selectedAddressId).toBe("addr-1");
    expect(result.data.shippingOptions).toHaveLength(2);
    expect(result.data.paymentMethods).toHaveLength(2);
  });

  it("resets shipping and payment when selected address disappears", async () => {
    const repo = new InMemoryCheckoutRepository();
    await readySession(repo);

    const refreshed = await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort([makeAddress({ id: "addr-new", isDefault: true })]),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );

    expect(refreshed.success).toBe(true);
    if (!refreshed.success) return;
    expect(refreshed.data.session.selectedAddressId).toBe("addr-new");
    expect(refreshed.data.session.checkoutStatus).toBe("ADDRESS_CONFIRMED");
    expect(refreshed.data.session.selectedShippingOptionId).toBeNull();
    expect(refreshed.data.session.selectedPaymentMethod).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Selections
// ---------------------------------------------------------------------------

describe("checkout selections", () => {
  it("rejects invalid shipping option", async () => {
    const repo = new InMemoryCheckoutRepository();
    await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );

    const result = await selectCheckoutShippingOption(
      repo,
      makeCustomerPort(),
      makeShippingPort(),
      { customerId: "customer-1", optionId: "not-real" },
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("SHIPPING_OPTION_INVALID");
  });

  it("rejects invalid payment method", async () => {
    const repo = new InMemoryCheckoutRepository();
    await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );
    await selectCheckoutShippingOption(repo, makeCustomerPort(), makeShippingPort(), {
      customerId: "customer-1",
      optionId: "stub-regular",
    });

    const result = await selectCheckoutPaymentMethod(repo, makePaymentPort(), {
      customerId: "customer-1",
      method: "CRYPTO",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("PAYMENT_METHOD_INVALID");
  });

  it("selects address owned by customer", async () => {
    const repo = new InMemoryCheckoutRepository();
    await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort([
        makeAddress({ id: "addr-1", isDefault: true }),
        makeAddress({ id: "addr-2", isDefault: false, street: "Jl. Sudirman" }),
      ]),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );

    const result = await selectCheckoutAddress(
      repo,
      makeCustomerPort([
        makeAddress({ id: "addr-1", isDefault: true }),
        makeAddress({ id: "addr-2", isDefault: false }),
      ]),
      { customerId: "customer-1", addressId: "addr-2" },
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.selectedAddressId).toBe("addr-2");
  });

  it("lists shipping options for prepared session", async () => {
    const repo = new InMemoryCheckoutRepository();
    await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );
    const result = await getShippingOptionsForCheckout(
      repo,
      makeCustomerPort(),
      makeShippingPort(),
      "customer-1",
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.options.map((o) => o.optionId)).toEqual([
      "stub-regular",
      "stub-express",
    ]);
  });
});

// ---------------------------------------------------------------------------
// placeOrder
// ---------------------------------------------------------------------------

describe("placeOrder", () => {
  it("rejects incomplete checkout", async () => {
    const repo = new InMemoryCheckoutRepository();
    await prepareCheckout(
      repo,
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      "customer-1",
    );

    const result = await placeOrder(
      repo,
      makeCartPort(),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      makeOrderPort(),
      { customerId: "customer-1" },
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("CHECKOUT_INCOMPLETE");
  });

  it("places order, stores snapshot, and clears cart", async () => {
    const repo = new InMemoryCheckoutRepository();
    await readySession(repo);

    let cleared = false;
    const result = await placeOrder(
      repo,
      makeCartPort(makeCartSnapshot(), () => {
        cleared = true;
      }),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      makeOrderPort({ success: true, orderId: "order-99" }),
      { customerId: "customer-1" },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.orderId).toBe("order-99");
    expect(result.data.snapshot.grandTotal).toBe(115_000);
    expect(result.data.snapshot.shipping.optionId).toBe("stub-regular");
    expect(result.data.snapshot.payment.method).toBe("BANK_TRANSFER");
    expect(cleared).toBe(true);

    const open = await repo.findOpenByCustomerId("customer-1");
    expect(open).toBeNull();
    const snapshot = await repo.findSnapshot(result.data.snapshot.sessionId);
    expect(snapshot?.grandTotal).toBe(115_000);
  });

  it("surfaces ORDER_MODULE_UNAVAILABLE without clearing cart", async () => {
    const repo = new InMemoryCheckoutRepository();
    await readySession(repo);

    let cleared = false;
    const result = await placeOrder(
      repo,
      makeCartPort(makeCartSnapshot(), () => {
        cleared = true;
      }),
      makeCustomerPort(),
      makeShippingPort(),
      makePaymentPort(),
      makeOrderPort({
        success: false,
        code: "ORDER_MODULE_UNAVAILABLE",
        message: "pending M7.2",
      }),
      { customerId: "customer-1" },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ORDER_MODULE_UNAVAILABLE");
    expect(cleared).toBe(false);
    const open = await repo.findOpenByCustomerId("customer-1");
    expect(open?.checkoutStatus).toBe("PAYMENT_METHOD_SELECTED");
  });
});
