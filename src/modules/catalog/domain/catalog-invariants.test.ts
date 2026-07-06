import { describe, expect, it } from "vitest";

import {
  canActivateProduct,
  isAllowedStatusTransition,
  isProductPubliclyListable,
  isValidSku,
  isValidSlug,
  isVariantPriceValid,
} from "./catalog-invariants";
import type { CatalogProduct } from "./catalog-entities";

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "p1",
    name: "Test Product",
    slug: "test-product",
    description: "Deskripsi produk.",
    brand: "LOCA",
    categoryId: "cat-socks",
    status: "ACTIVE",
    variantCount: 1,
    priceFrom: 89000,
    priceTo: 109000,
    thumbnailUrl: "/x.png",
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("isProductPubliclyListable", () => {
  it("allow active product with at least one variant", () => {
    expect(isProductPubliclyListable(makeProduct())).toBe(true);
  });

  it("reject active product without variant", () => {
    expect(isProductPubliclyListable(makeProduct({ variantCount: 0 }))).toBe(false);
  });

  it("reject archived product", () => {
    expect(isProductPubliclyListable(makeProduct({ status: "ARCHIVED", variantCount: 2 }))).toBe(
      false,
    );
  });

  it("reject draft product", () => {
    expect(isProductPubliclyListable(makeProduct({ status: "DRAFT" }))).toBe(false);
  });
});

describe("canActivateProduct", () => {
  it("allow activation when product has at least one variant", () => {
    expect(canActivateProduct(makeProduct({ variantCount: 1 }))).toBe(true);
  });

  it("block activation when product has no variant", () => {
    expect(canActivateProduct(makeProduct({ variantCount: 0 }))).toBe(false);
  });
});

describe("isAllowedStatusTransition", () => {
  it("allow DRAFT -> ACTIVE", () => {
    expect(isAllowedStatusTransition("DRAFT", "ACTIVE")).toBe(true);
  });

  it("allow DRAFT -> ARCHIVED", () => {
    expect(isAllowedStatusTransition("DRAFT", "ARCHIVED")).toBe(true);
  });

  it("allow ACTIVE -> OUT_OF_STOCK", () => {
    expect(isAllowedStatusTransition("ACTIVE", "OUT_OF_STOCK")).toBe(true);
  });

  it("allow ACTIVE -> ARCHIVED", () => {
    expect(isAllowedStatusTransition("ACTIVE", "ARCHIVED")).toBe(true);
  });

  it("allow OUT_OF_STOCK -> ACTIVE", () => {
    expect(isAllowedStatusTransition("OUT_OF_STOCK", "ACTIVE")).toBe(true);
  });

  it("block ARCHIVED -> any status (final state)", () => {
    expect(isAllowedStatusTransition("ARCHIVED", "ACTIVE")).toBe(false);
    expect(isAllowedStatusTransition("ARCHIVED", "DRAFT")).toBe(false);
  });

  it("block ACTIVE -> DRAFT (no backward transition)", () => {
    expect(isAllowedStatusTransition("ACTIVE", "DRAFT")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("accept valid slug", () => {
    expect(isValidSlug("run-socks-pro")).toBe(true);
    expect(isValidSlug("product123")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
  });

  it("reject slug with uppercase", () => {
    expect(isValidSlug("Run-Socks")).toBe(false);
  });

  it("reject slug with spaces", () => {
    expect(isValidSlug("run socks")).toBe(false);
  });

  it("reject slug with leading/trailing hyphen", () => {
    expect(isValidSlug("-run-socks")).toBe(false);
    expect(isValidSlug("run-socks-")).toBe(false);
  });

  it("reject empty slug", () => {
    expect(isValidSlug("")).toBe(false);
  });
});

describe("isVariantPriceValid", () => {
  it("accept zero price", () => {
    expect(isVariantPriceValid(0)).toBe(true);
  });

  it("accept positive price", () => {
    expect(isVariantPriceValid(89000)).toBe(true);
    expect(isVariantPriceValid(0.01)).toBe(true);
  });

  it("reject negative price", () => {
    expect(isVariantPriceValid(-1)).toBe(false);
    expect(isVariantPriceValid(-89000)).toBe(false);
  });

  it("reject NaN", () => {
    expect(isVariantPriceValid(NaN)).toBe(false);
  });

  it("reject Infinity", () => {
    expect(isVariantPriceValid(Infinity)).toBe(false);
    expect(isVariantPriceValid(-Infinity)).toBe(false);
  });
});

describe("isValidSku", () => {
  it("accept non-empty SKU", () => {
    expect(isValidSku("LOCA-RSP-S")).toBe(true);
    expect(isValidSku("SKU001")).toBe(true);
    expect(isValidSku("a")).toBe(true);
  });

  it("reject empty string", () => {
    expect(isValidSku("")).toBe(false);
  });

  it("reject whitespace-only string", () => {
    expect(isValidSku("   ")).toBe(false);
    expect(isValidSku("\t")).toBe(false);
  });
});
