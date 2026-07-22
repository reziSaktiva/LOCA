import type { CheckoutSession, CheckoutSnapshot, CheckoutStatus } from "./checkout-entities";

export type CreateCheckoutSessionCommand = {
  customerId: string;
  cartId: string;
  currency: string;
  itemsSubtotal: number;
  selectedAddressId?: string | null;
  checkoutStatus?: CheckoutStatus;
};

export type UpdateCheckoutSessionCommand = {
  sessionId: string;
  checkoutStatus?: CheckoutStatus;
  selectedAddressId?: string | null;
  selectedShippingOptionId?: string | null;
  selectedShippingServiceName?: string | null;
  selectedShippingFee?: number | null;
  selectedPaymentMethod?: string | null;
  itemsSubtotal?: number;
  shippingFee?: number;
  grandTotal?: number;
  cartId?: string;
  orderId?: string | null;
  snapshot?: CheckoutSnapshot | null;
};

export interface CheckoutRepository {
  findById(sessionId: string): Promise<CheckoutSession | null>;
  /** Session terbuka (bukan ORDER_PLACED) milik customer. */
  findOpenByCustomerId(customerId: string): Promise<CheckoutSession | null>;
  create(command: CreateCheckoutSessionCommand): Promise<CheckoutSession>;
  update(command: UpdateCheckoutSessionCommand): Promise<CheckoutSession>;
  findSnapshot(sessionId: string): Promise<CheckoutSnapshot | null>;
}
