import type { CheckoutSession, CheckoutStatus } from "./checkout-entities";

/**
 * Checkout hanya valid jika cart memiliki minimal satu item.
 * docs/05-domain-modules.md §10
 */
export function isCartNonEmpty(itemCount: number): boolean {
  return Number.isInteger(itemCount) && itemCount >= 1;
}

/**
 * Session masih boleh diubah sebelum order ditempatkan.
 */
export function isCheckoutEditable(status: CheckoutStatus): boolean {
  return status !== "ORDER_PLACED";
}

/**
 * Alamat, shipping option, dan payment method wajib dipilih sebelum place order.
 */
export function isReadyToPlaceOrder(session: CheckoutSession): boolean {
  return (
    isCheckoutEditable(session.checkoutStatus) &&
    session.selectedAddressId !== null &&
    session.selectedShippingOptionId !== null &&
    session.selectedShippingFee !== null &&
    session.selectedPaymentMethod !== null
  );
}

/**
 * Grand total = items subtotal + shipping fee. Tidak boleh negatif.
 */
export function calculateGrandTotal(itemsSubtotal: number, shippingFee: number): number {
  return itemsSubtotal + shippingFee;
}

export function isValidMoneyAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0;
}

/**
 * Setelah ADDRESS_CONFIRMED, status tidak boleh mundur ke STARTED via update selection.
 * Re-select shipping/payment tetap diizinkan selama editable.
 */
export function nextStatusAfterAddress(): CheckoutStatus {
  return "ADDRESS_CONFIRMED";
}

export function nextStatusAfterShipping(current: CheckoutStatus): CheckoutStatus {
  if (current === "PAYMENT_METHOD_SELECTED") {
    return "PAYMENT_METHOD_SELECTED";
  }
  return "SHIPPING_SELECTED";
}

export function nextStatusAfterPayment(): CheckoutStatus {
  return "PAYMENT_METHOD_SELECTED";
}
