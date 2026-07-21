import { describe, expect, it } from "vitest";

import { listPublicCategories } from "./list-public-categories";
import { listPublicProducts } from "./list-public-products";
import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";

const repository = new InMemoryCatalogRepository();

describe("catalog public listing", () => {
  it("list only publicly listable products", async () => {
    const result = await listPublicProducts(repository, {
      page: 1,
      limit: 20,
      sort: "-createdAt",
    });

    const ids = result.items.map((product) => product.id);

    expect(ids).toContain("prod-run-socks-pro");
    expect(ids).toContain("prod-performance-shorts");
    expect(ids).not.toContain("prod-core-boxer");
    expect(ids).not.toContain("prod-legacy-tee");
    expect(ids).not.toContain("prod-invalid-active");
  });

  it("support category id and text filtering", async () => {
    const result = await listPublicProducts(repository, {
      page: 1,
      limit: 20,
      category: "cat-socks",
      q: "run",
      sort: "-createdAt",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe("prod-run-socks-pro");
  });

  it("support category slug filtering per API contract", async () => {
    const result = await listPublicProducts(repository, {
      page: 1,
      limit: 20,
      category: "socks",
      sort: "-createdAt",
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((product) => product.categoryId === "cat-socks")).toBe(true);
  });

  it("return empty when category slug is unknown", async () => {
    const result = await listPublicProducts(repository, {
      page: 1,
      limit: 20,
      category: "unknown-category",
      sort: "-createdAt",
    });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("list only active categories with public products", async () => {
    const result = await listPublicCategories(repository);
    const ids = result.map((category) => category.id);

    expect(ids).toContain("cat-socks");
    expect(ids).toContain("cat-shorts");
    expect(ids).not.toContain("cat-boxer");
    expect(ids).not.toContain("cat-archived");
  });
});
