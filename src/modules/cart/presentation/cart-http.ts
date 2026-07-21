import type { CartError } from "../domain/cart-entities";

/** Maps domain cart error codes to HTTP status for customer API routes. */
export function cartErrorStatus(error: CartError): number {
  switch (error.code) {
    case "ITEM_NOT_FOUND":
    case "VARIANT_NOT_FOUND":
      return 404;
    case "INSUFFICIENT_STOCK":
    case "INVALID_QUANTITY":
    case "VARIANT_INACTIVE":
    case "DUPLICATE_VARIANT":
      return 400;
  }
}
