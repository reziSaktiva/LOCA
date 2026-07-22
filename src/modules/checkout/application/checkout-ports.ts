import type {
  CheckoutSnapshot,
  PaymentMethodOption,
  ShippingOption,
} from "../domain/checkout-entities";

/** Cart snapshot minimal untuk checkout (dari cart public facade). */
export type CheckoutCartSnapshot = {
  cartId: string;
  currency: string;
  itemCount: number;
  itemsSubtotal: number;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPriceSnapshot: number;
    lineSubtotal: number;
  }>;
};

export type CheckoutCartPort = {
  getSnapshot(customerId: string): Promise<CheckoutCartSnapshot>;
  /** Dipanggil setelah place order sukses — kosongkan cart aktif. */
  clearAfterCheckout(customerId: string): Promise<void>;
};

export type CheckoutAddress = {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export type CheckoutCustomerPort = {
  listAddresses(customerId: string): Promise<CheckoutAddress[]>;
};

/** Decision 027 — stub hingga Phase 6 (Biteship). */
export type CheckoutShippingPort = {
  listOptions(input: {
    customerId: string;
    cartId: string;
    destinationPostalCode: string;
  }): Promise<ShippingOption[]>;
};

/** Decision 027 — stub hingga Phase 6 (Midtrans metadata). */
export type CheckoutPaymentMethodPort = {
  listMethods(): Promise<PaymentMethodOption[]>;
};

export type CreateOrderFromCheckoutResult =
  | { success: true; orderId: string }
  | { success: false; code: "ORDER_CREATE_FAILED" | "ORDER_MODULE_UNAVAILABLE"; message: string };

/** Di-wire ke order public facade (`createOrderFromCheckout`). */
export type CheckoutOrderPort = {
  createOrderFromCheckout(snapshot: CheckoutSnapshot): Promise<CreateOrderFromCheckoutResult>;
};
