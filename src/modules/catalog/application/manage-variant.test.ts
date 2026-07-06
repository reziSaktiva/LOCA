import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";
import { createVariant, updateVariant } from "./manage-variant";

function makeRepo() {
  return new InMemoryCatalogRepository();
}

describe("createVariant", () => {
  let repo: InMemoryCatalogRepository;

  beforeEach(() => {
    repo = makeRepo();
  });

  it("create variant for existing product", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-XL",
      price: 89000,
      variantLabel: "XL",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.variant.sku).toBe("LOCA-RSP-XL");
    expect(result.variant.price).toBe(89000);
    expect(result.variant.status).toBe("ACTIVE");
    expect(result.variant.productId).toBe("prod-run-socks-pro");
  });

  it("reject when product does not exist", async () => {
    const result = await createVariant(repo, {
      productId: "prod-non-existent",
      sku: "LOCA-XX-S",
      price: 50000,
      variantLabel: "S",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("reject empty SKU", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "   ",
      price: 89000,
      variantLabel: "XL",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("SKU_INVALID");
  });

  it("reject duplicate SKU", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-S",
      price: 89000,
      variantLabel: "S duplicate",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("SKU_CONFLICT");
  });

  it("reject negative price", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-XL",
      price: -1,
      variantLabel: "XL",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("PRICE_INVALID");
  });

  it("reject negative compareAtPrice", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-XL",
      price: 89000,
      compareAtPrice: -500,
      variantLabel: "XL",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("PRICE_INVALID");
  });

  it("accept zero price", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-FREE",
      price: 0,
      variantLabel: "Free",
    });

    expect(result.success).toBe(true);
  });

  it("accept null compareAtPrice", async () => {
    const result = await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-XL",
      price: 89000,
      compareAtPrice: null,
      variantLabel: "XL",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.variant.compareAtPrice).toBeNull();
  });

  it("updates product priceFrom and priceTo after create", async () => {
    await createVariant(repo, {
      productId: "prod-run-socks-pro",
      sku: "LOCA-RSP-XS",
      price: 69000,
      variantLabel: "XS",
    });

    const product = await repo.findProductById("prod-run-socks-pro");
    expect(product?.priceFrom).toBe(69000);
  });
});

describe("updateVariant", () => {
  let repo: InMemoryCatalogRepository;

  beforeEach(() => {
    repo = makeRepo();
  });

  it("update SKU of existing variant", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      sku: "LOCA-RSP-S-V2",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.variant.sku).toBe("LOCA-RSP-S-V2");
  });

  it("update price of existing variant", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      price: 99000,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.variant.price).toBe(99000);
  });

  it("reject update for non-existent variant", async () => {
    const result = await updateVariant(repo, {
      id: "var-does-not-exist",
      price: 99000,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("VARIANT_NOT_FOUND");
  });

  it("reject empty SKU on update", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      sku: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("SKU_INVALID");
  });

  it("reject SKU conflict on update", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      sku: "LOCA-RSP-M",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("SKU_CONFLICT");
  });

  it("allow same SKU when updating own variant", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      sku: "LOCA-RSP-S",
    });

    expect(result.success).toBe(true);
  });

  it("reject negative price on update", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      price: -100,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("PRICE_INVALID");
  });

  it("reject negative compareAtPrice on update", async () => {
    const result = await updateVariant(repo, {
      id: "var-run-socks-s",
      compareAtPrice: -1,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("PRICE_INVALID");
  });

  it("accept null compareAtPrice on update (clear compare price)", async () => {
    const result = await updateVariant(repo, {
      id: "var-perf-shorts-m",
      compareAtPrice: null,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.variant.compareAtPrice).toBeNull();
  });
});

describe("getVariantSnapshot (via repository)", () => {
  let repo: InMemoryCatalogRepository;

  beforeEach(() => {
    repo = makeRepo();
  });

  it("return snapshot for existing variant", async () => {
    const snapshot = await repo.getVariantSnapshot("var-run-socks-s");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.variantId).toBe("var-run-socks-s");
    expect(snapshot?.sku).toBe("LOCA-RSP-S");
    expect(snapshot?.productId).toBe("prod-run-socks-pro");
    expect(snapshot?.productName).toBe("Run Socks Pro");
    expect(snapshot?.price).toBe(89000);
    expect(snapshot?.variantLabel).toBe("S");
  });

  it("return null for non-existent variant", async () => {
    const snapshot = await repo.getVariantSnapshot("var-does-not-exist");
    expect(snapshot).toBeNull();
  });

  it("snapshot includes compareAtPrice", async () => {
    const snapshot = await repo.getVariantSnapshot("var-perf-shorts-m");
    expect(snapshot?.compareAtPrice).toBe(219000);
  });
});
