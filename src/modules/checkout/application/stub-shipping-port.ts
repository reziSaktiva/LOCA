import type { ShippingOption } from "../domain/checkout-entities";
import type { CheckoutShippingPort } from "./checkout-ports";

/**
 * Decision 027 — stub shipping options untuk Phase 5.
 * Phase 6 mengganti implementasi ini dengan Biteship adapter.
 */
const STUB_SHIPPING_OPTIONS: ShippingOption[] = [
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

export function createStubShippingPort(): CheckoutShippingPort {
  return {
    async listOptions() {
      return STUB_SHIPPING_OPTIONS;
    },
  };
}
