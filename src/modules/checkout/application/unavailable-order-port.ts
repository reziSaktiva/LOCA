import type { CheckoutOrderPort } from "./checkout-ports";

/**
 * Placeholder hingga M7.2 Order Domain Foundation.
 * Validasi checkout + snapshot tetap diuji; create order di-wire setelah order module siap.
 */
export function createUnavailableOrderPort(): CheckoutOrderPort {
  return {
    async createOrderFromCheckout() {
      return {
        success: false,
        code: "ORDER_MODULE_UNAVAILABLE",
        message: "Order module is not available yet (pending M7.2).",
      };
    },
  };
}
