import type { CheckoutError } from "../domain/checkout-entities";

/** Maps domain checkout error codes to HTTP status for customer API routes. */
export function checkoutErrorStatus(error: CheckoutError): number {
  switch (error.code) {
    case "ADDRESS_NOT_FOUND":
    case "SESSION_NOT_FOUND":
      return 404;
    case "ORDER_CREATE_FAILED":
      return 409;
    case "ORDER_MODULE_UNAVAILABLE":
      return 503;
    case "CART_EMPTY":
    case "ADDRESS_REQUIRED":
    case "SESSION_NOT_EDITABLE":
    case "SHIPPING_OPTION_INVALID":
    case "PAYMENT_METHOD_INVALID":
    case "CHECKOUT_INCOMPLETE":
      return 400;
  }
}
