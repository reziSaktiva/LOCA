import type { PaymentMethodOption } from "../domain/checkout-entities";
import type { CheckoutPaymentMethodPort } from "./checkout-ports";

/**
 * Decision 027 — stub payment methods untuk Phase 5.
 * Phase 6 mengganti metadata ini dengan channel Midtrans yang tersedia.
 */
const STUB_PAYMENT_METHODS: PaymentMethodOption[] = [
  { method: "BANK_TRANSFER", label: "Transfer Bank" },
  { method: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
];

export function createStubPaymentMethodPort(): CheckoutPaymentMethodPort {
  return {
    async listMethods() {
      return STUB_PAYMENT_METHODS;
    },
  };
}
