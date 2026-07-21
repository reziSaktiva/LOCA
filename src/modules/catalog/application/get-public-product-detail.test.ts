import { describe, expect, it } from "vitest";

import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";
import { getPublicProductDetail } from "./get-public-product-detail";

describe("getPublicProductDetail", () => {
  const repository = new InMemoryCatalogRepository();

  it("returns product with active variants and stock from inventory port", async () => {
    const detail = await getPublicProductDetail(
      repository,
      {
        async getAvailableQty(variantId) {
          return variantId === "var-run-socks-s" ? 0 : 5;
        },
      },
      "run-socks-pro",
    );

    expect(detail).not.toBeNull();
    expect(detail?.name).toBe("Run Socks Pro");
    expect(detail?.variants.length).toBeGreaterThan(0);
    expect(detail?.variants.every((variant) => typeof variant.inStock === "boolean")).toBe(true);

    const outOfStock = detail?.variants.find((variant) => variant.id === "var-run-socks-s");
    expect(outOfStock?.inStock).toBe(false);
    expect(outOfStock?.availableQty).toBe(0);
  });

  it("returns null for non-public product", async () => {
    const detail = await getPublicProductDetail(
      repository,
      { async getAvailableQty() { return 1; } },
      "core-boxer",
    );

    expect(detail).toBeNull();
  });

  it("falls back to thumbnail when media gallery empty", async () => {
    const detail = await getPublicProductDetail(
      repository,
      { async getAvailableQty() { return 2; } },
      "run-socks-pro",
    );

    expect(detail?.media.length).toBeGreaterThan(0);
    expect(detail?.media[0]?.url).toBe("/catalog/run-socks-pro.jpg");
  });
});
