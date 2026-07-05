import { describe, expect, it } from "vitest";

import { isProductPubliclyListable } from "./catalog-invariants";

describe("catalog invariants", () => {
  it("allow active product with at least one variant", () => {
    expect(
      isProductPubliclyListable({
        id: "p1",
        name: "Run Socks Pro",
        slug: "run-socks-pro",
        categoryId: "cat-socks",
        status: "ACTIVE",
        variantCount: 1,
        priceFrom: 89000,
        priceTo: 109000,
        thumbnailUrl: "/x.png",
        createdAt: new Date("2026-01-01"),
      }),
    ).toBe(true);
  });

  it("reject active product without variant", () => {
    expect(
      isProductPubliclyListable({
        id: "p1",
        name: "Invalid Product",
        slug: "invalid-product",
        categoryId: "cat-socks",
        status: "ACTIVE",
        variantCount: 0,
        priceFrom: 89000,
        priceTo: 109000,
        thumbnailUrl: "/x.png",
        createdAt: new Date("2026-01-01"),
      }),
    ).toBe(false);
  });

  it("reject archived product", () => {
    expect(
      isProductPubliclyListable({
        id: "p1",
        name: "Legacy Tee",
        slug: "legacy-tee",
        categoryId: "cat-legacy",
        status: "ARCHIVED",
        variantCount: 2,
        priceFrom: 89000,
        priceTo: 109000,
        thumbnailUrl: "/x.png",
        createdAt: new Date("2026-01-01"),
      }),
    ).toBe(false);
  });
});
