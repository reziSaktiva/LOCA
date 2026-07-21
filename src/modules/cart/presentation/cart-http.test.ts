import { describe, expect, it } from "vitest";
import type { CartError } from "../domain/cart-entities";
import { cartErrorStatus } from "./cart-http";

describe("cartErrorStatus", () => {
  it("maps not-found errors to 404", () => {
    const notFound: CartError[] = [
      { code: "ITEM_NOT_FOUND", message: "x" },
      { code: "VARIANT_NOT_FOUND", message: "x" },
    ];
    for (const error of notFound) {
      expect(cartErrorStatus(error)).toBe(404);
    }
  });

  it("maps validation and stock errors to 400", () => {
    const badRequest: CartError[] = [
      { code: "INSUFFICIENT_STOCK", message: "x" },
      { code: "INVALID_QUANTITY", message: "x" },
      { code: "VARIANT_INACTIVE", message: "x" },
      { code: "DUPLICATE_VARIANT", message: "x" },
    ];
    for (const error of badRequest) {
      expect(cartErrorStatus(error)).toBe(400);
    }
  });
});
