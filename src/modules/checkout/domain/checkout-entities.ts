// ---------------------------------------------------------------------------
// Checkout Module — Domain Entities
// Sesuai docs/06-data-model.md §6.6 dan docs/05-domain-modules.md §10
// ---------------------------------------------------------------------------

export const CHECKOUT_STATUSES = [
  "STARTED",
  "ADDRESS_CONFIRMED",
  "SHIPPING_SELECTED",
  "PAYMENT_METHOD_SELECTED",
  "ORDER_PLACED",
] as const;

export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number];

/** Aggregate root: sesi checkout aktif milik satu customer. */
export type CheckoutSession = {
  id: string;
  customerId: string;
  cartId: string;
  checkoutStatus: CheckoutStatus;
  selectedAddressId: string | null;
  selectedShippingOptionId: string | null;
  selectedShippingServiceName: string | null;
  selectedShippingFee: number | null;
  selectedPaymentMethod: string | null;
  currency: string;
  itemsSubtotal: number;
  shippingFee: number;
  grandTotal: number;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CheckoutItemSnapshot = {
  variantId: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineSubtotal: number;
};

export type CheckoutAddressSnapshot = {
  addressId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
};

export type CheckoutShippingSnapshot = {
  optionId: string;
  provider: string;
  serviceCode: string;
  serviceName: string;
  estimatedDays: number | null;
  shippingFee: number;
};

export type CheckoutPaymentSnapshot = {
  method: string;
  label: string;
};

/**
 * Snapshot immutable saat place order.
 * Kontrak lintas module untuk `order` — jangan ubah shape tanpa menyesuaikan consumer.
 */
export type CheckoutSnapshot = {
  sessionId: string;
  customerId: string;
  cartId: string;
  currency: string;
  items: CheckoutItemSnapshot[];
  itemsSubtotal: number;
  shippingFee: number;
  grandTotal: number;
  address: CheckoutAddressSnapshot;
  shipping: CheckoutShippingSnapshot;
  payment: CheckoutPaymentSnapshot;
};

export type ShippingOption = {
  optionId: string;
  provider: string;
  serviceCode: string;
  serviceName: string;
  estimatedDays: number | null;
  shippingFee: number;
};

export type PaymentMethodOption = {
  method: string;
  label: string;
};

export type SelectAddressCommand = {
  customerId: string;
  addressId: string;
};

export type SelectShippingOptionCommand = {
  customerId: string;
  optionId: string;
};

export type SelectPaymentMethodCommand = {
  customerId: string;
  method: string;
};

export type PlaceOrderCommand = {
  customerId: string;
};

export type CheckoutError =
  | { code: "CART_EMPTY"; message: string }
  | { code: "ADDRESS_REQUIRED"; message: string }
  | { code: "ADDRESS_NOT_FOUND"; message: string }
  | { code: "SESSION_NOT_FOUND"; message: string }
  | { code: "SESSION_NOT_EDITABLE"; message: string }
  | { code: "SHIPPING_OPTION_INVALID"; message: string }
  | { code: "PAYMENT_METHOD_INVALID"; message: string }
  | { code: "CHECKOUT_INCOMPLETE"; message: string }
  | { code: "ORDER_CREATE_FAILED"; message: string }
  | { code: "ORDER_MODULE_UNAVAILABLE"; message: string };

export type CheckoutResult<T> =
  | { success: true; data: T }
  | { success: false; error: CheckoutError };
