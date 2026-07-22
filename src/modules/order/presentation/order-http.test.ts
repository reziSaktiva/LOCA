import { describe, expect, it } from "vitest";
import type { OrderError } from "../domain/order-entities";
import { isOrderStatus, orderErrorStatus, parseOrderListQuery } from "./order-http";

describe("orderErrorStatus", () => {
  it("maps not-found errors to 404", () => {
    const notFound: OrderError[] = [
      { code: "ORDER_NOT_FOUND", message: "x" },
      { code: "VARIANT_NOT_FOUND", message: "x" },
    ];
    for (const error of notFound) {
      expect(orderErrorStatus(error)).toBe(404);
    }
  });

  it("maps forbidden to 403", () => {
    expect(orderErrorStatus({ code: "FORBIDDEN", message: "x" })).toBe(403);
  });

  it("maps conflict-style domain errors to 409", () => {
    const conflict: OrderError[] = [
      { code: "ILLEGAL_STATUS_TRANSITION", message: "x" },
      { code: "ORDER_NOT_CANCELLABLE", message: "x" },
      { code: "INSUFFICIENT_STOCK", message: "x" },
      { code: "STOCK_RESERVE_FAILED", message: "x" },
      { code: "ORDER_CREATE_FAILED", message: "x" },
    ];
    for (const error of conflict) {
      expect(orderErrorStatus(error)).toBe(409);
    }
  });

  it("maps validation errors to 400", () => {
    const badRequest: OrderError[] = [
      { code: "EMPTY_ORDER", message: "x" },
      { code: "INVALID_TOTAL", message: "x" },
      { code: "CURRENCY_MISMATCH", message: "x" },
    ];
    for (const error of badRequest) {
      expect(orderErrorStatus(error)).toBe(400);
    }
  });
});

describe("isOrderStatus", () => {
  it("accepts known statuses", () => {
    expect(isOrderStatus("WAITING_PAYMENT")).toBe(true);
    expect(isOrderStatus("CANCELLED")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isOrderStatus("UNKNOWN")).toBe(false);
    expect(isOrderStatus(null)).toBe(false);
  });
});

describe("parseOrderListQuery", () => {
  it("parses page, limit, and status", () => {
    const query = parseOrderListQuery(
      new URLSearchParams("page=2&limit=10&status=PAID"),
    );
    expect(query).toEqual({ page: 2, limit: 10, status: "PAID" });
  });

  it("ignores invalid status and non-numeric paging", () => {
    const query = parseOrderListQuery(
      new URLSearchParams("page=abc&limit=xyz&status=NOPE"),
    );
    expect(query).toEqual({});
  });
});
