import { describe, expect, it } from "vitest";
import type { CheckoutError } from "../domain/checkout-entities";
import { checkoutErrorStatus } from "./checkout-http";

describe("checkoutErrorStatus", () => {
  it("maps not-found errors to 404", () => {
    const notFound: CheckoutError[] = [
      { code: "ADDRESS_NOT_FOUND", message: "x" },
      { code: "SESSION_NOT_FOUND", message: "x" },
    ];
    for (const error of notFound) {
      expect(checkoutErrorStatus(error)).toBe(404);
    }
  });

  it("maps conflict and unavailable order errors", () => {
    expect(
      checkoutErrorStatus({ code: "ORDER_CREATE_FAILED", message: "x" }),
    ).toBe(409);
    expect(
      checkoutErrorStatus({ code: "ORDER_MODULE_UNAVAILABLE", message: "x" }),
    ).toBe(503);
  });

  it("maps validation and state errors to 400", () => {
    const badRequest: CheckoutError[] = [
      { code: "CART_EMPTY", message: "x" },
      { code: "ADDRESS_REQUIRED", message: "x" },
      { code: "SESSION_NOT_EDITABLE", message: "x" },
      { code: "SHIPPING_OPTION_INVALID", message: "x" },
      { code: "PAYMENT_METHOD_INVALID", message: "x" },
      { code: "CHECKOUT_INCOMPLETE", message: "x" },
    ];
    for (const error of badRequest) {
      expect(checkoutErrorStatus(error)).toBe(400);
    }
  });
});
