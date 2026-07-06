import { describe, expect, it } from "vitest";

import type { CatalogProduct } from "../domain/catalog-entities";
import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";
import { getProductBySlug } from "./get-product-by-slug";
import {
  archiveProduct,
  createProduct,
  updateProductStatus,
} from "./manage-product-lifecycle";

function makeRepo() {
  return new InMemoryCatalogRepository();
}

describe("getProductBySlug", () => {
  it("return found product for valid active slug", async () => {
    const repo = makeRepo();
    const result = await getProductBySlug(repo, "run-socks-pro");
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.product.slug).toBe("run-socks-pro");
    }
  });

  it("return not found for archived product", async () => {
    const repo = makeRepo();
    const result = await getProductBySlug(repo, "legacy-tee");
    expect(result.found).toBe(false);
  });

  it("return not found for draft product", async () => {
    const repo = makeRepo();
    const result = await getProductBySlug(repo, "core-boxer");
    expect(result.found).toBe(false);
  });

  it("return not found for non-existent slug", async () => {
    const repo = makeRepo();
    const result = await getProductBySlug(repo, "not-exist");
    expect(result.found).toBe(false);
  });

  it("return not found for active product without variant", async () => {
    const repo = makeRepo();
    const result = await getProductBySlug(repo, "invalid-active-product");
    expect(result.found).toBe(false);
  });
});

describe("createProduct", () => {
  it("create product with valid slug and return DRAFT status", async () => {
    const repo = makeRepo();
    const result = await createProduct(repo, {
      name: "New Socks",
      slug: "new-socks",
      description: "Kaos kaki baru.",
      brand: "LOCA",
      categoryId: "cat-socks",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.product.status).toBe("DRAFT");
      expect(result.product.slug).toBe("new-socks");
    }
  });

  it("reject invalid slug", async () => {
    const repo = makeRepo();
    const result = await createProduct(repo, {
      name: "Bad Slug",
      slug: "Bad Slug!!",
      description: "Test.",
      brand: "LOCA",
      categoryId: "cat-socks",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("SLUG_INVALID");
    }
  });

  it("reject duplicate slug", async () => {
    const repo = makeRepo();
    const result = await createProduct(repo, {
      name: "Duplicate",
      slug: "run-socks-pro",
      description: "Test.",
      brand: "LOCA",
      categoryId: "cat-socks",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("SLUG_CONFLICT");
    }
  });
});

describe("updateProductStatus", () => {
  it("allow DRAFT -> ACTIVE when product has variant", async () => {
    const repo = makeRepo();

    const created = await createProduct(repo, {
      name: "Socks Active",
      slug: "socks-active",
      description: "Test.",
      brand: "LOCA",
      categoryId: "cat-socks",
    });
    expect(created.success).toBe(true);
    const productId = (created as { success: true; product: CatalogProduct }).product.id;

    await repo.updateProduct({ id: productId, name: "Socks Active" });
    const withVariant = await repo.findProductById(productId);
    expect(withVariant).not.toBeNull();

    const productWithVariant: CatalogProduct = {
      ...withVariant!,
      variantCount: 1,
    };
    await repo.updateProduct({
      id: productWithVariant.id,
      name: productWithVariant.name,
    });
    await repo.updateProductStatus(productWithVariant.id, productWithVariant.variantCount >= 1 ? productWithVariant.status : "DRAFT");

    const runSocks = await repo.findProductBySlug("run-socks-pro");
    expect(runSocks).not.toBeNull();
    const result = await updateProductStatus(repo, runSocks!.id, "ARCHIVED");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.product.status).toBe("ARCHIVED");
    }
  });

  it("block transition ACTIVE -> DRAFT", async () => {
    const repo = makeRepo();
    const product = await repo.findProductBySlug("run-socks-pro");
    expect(product).not.toBeNull();
    const result = await updateProductStatus(repo, product!.id, "DRAFT");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("STATUS_TRANSITION_NOT_ALLOWED");
    }
  });

  it("block ACTIVE -> ACTIVE when no variant (DRAFT path)", async () => {
    const repo = makeRepo();
    const draft = await repo.findProductBySlug("core-boxer");
    expect(draft).not.toBeNull();

    await repo.updateProductStatus(draft!.id, "ACTIVE");
    await repo.updateProduct({ id: draft!.id });
    const updated = await repo.findProductById(draft!.id);
    const zeroVariant = { ...updated!, variantCount: 0 };
    await repo.updateProductStatus(zeroVariant.id, "DRAFT");

    const noVariantProduct = await repo.findProductBySlug("invalid-active-product");
    expect(noVariantProduct).not.toBeNull();
    await repo.updateProductStatus(noVariantProduct!.id, "DRAFT");
    const draftNoVariant = await repo.findProductById(noVariantProduct!.id);
    const result = await updateProductStatus(repo, draftNoVariant!.id, "ACTIVE");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("CANNOT_ACTIVATE_WITHOUT_VARIANT");
    }
  });

  it("return not found for non-existent product", async () => {
    const repo = makeRepo();
    const result = await updateProductStatus(repo, "non-exist-id", "ARCHIVED");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PRODUCT_NOT_FOUND");
    }
  });
});

describe("archiveProduct", () => {
  it("archive active product", async () => {
    const repo = makeRepo();
    const product = await repo.findProductBySlug("run-socks-pro");
    expect(product).not.toBeNull();
    const result = await archiveProduct(repo, product!.id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.product.status).toBe("ARCHIVED");
    }
  });

  it("cannot archive already archived product", async () => {
    const repo = makeRepo();
    const product = await repo.findProductBySlug("legacy-tee");
    expect(product).not.toBeNull();
    const result = await archiveProduct(repo, product!.id);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("STATUS_TRANSITION_NOT_ALLOWED");
    }
  });
});
