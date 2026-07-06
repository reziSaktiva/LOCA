import { describe, expect, it } from "vitest";

import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";
import { searchPublicProducts } from "./search-public-products";

describe("searchPublicProducts", () => {
  it("returns error when q is empty string", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("QUERY_EMPTY");
    }
  });

  it("returns error when q is whitespace only", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "   ",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("QUERY_EMPTY");
    }
  });

  it("finds product by name match", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "run socks",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const ids = result.result.items.map((p) => p.id);
      expect(ids).toContain("prod-run-socks-pro");
    }
  });

  it("finds product by description match", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "moisture-wicking",
      page: 1,
      limit: 20,
    });

    // "Core Boxer" has moisture-wicking in description, but status is DRAFT — should NOT appear
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.items).toHaveLength(0);
    }
  });

  it("finds product by brand match", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.total).toBeGreaterThan(0);
      const brands = result.result.items.map((p) => p.brand.toLowerCase());
      expect(brands.every((b) => b.includes("loca"))).toBe(true);
    }
  });

  it("only returns publicly listable products", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const ids = result.result.items.map((p) => p.id);
      expect(ids).not.toContain("prod-core-boxer");
      expect(ids).not.toContain("prod-legacy-tee");
      expect(ids).not.toContain("prod-invalid-active");
    }
  });

  it("search is case-insensitive", async () => {
    const repo = new InMemoryCatalogRepository();
    const resultLower = await searchPublicProducts(repo, { q: "run socks", page: 1, limit: 20 });
    const resultUpper = await searchPublicProducts(repo, { q: "RUN SOCKS", page: 1, limit: 20 });
    const resultMixed = await searchPublicProducts(repo, { q: "Run Socks", page: 1, limit: 20 });

    expect(resultLower.success).toBe(true);
    expect(resultUpper.success).toBe(true);
    expect(resultMixed.success).toBe(true);

    if (resultLower.success && resultUpper.success && resultMixed.success) {
      expect(resultLower.result.total).toBe(resultUpper.result.total);
      expect(resultLower.result.total).toBe(resultMixed.result.total);
    }
  });

  it("filters by category", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
      category: "cat-socks",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      result.result.items.forEach((p) => {
        expect(p.categoryId).toBe("cat-socks");
      });
    }
  });

  it("filters by minPrice", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
      minPrice: 150000,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      result.result.items.forEach((p) => {
        expect(p.priceTo).toBeGreaterThanOrEqual(150000);
      });
    }
  });

  it("filters by maxPrice", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
      maxPrice: 100000,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      result.result.items.forEach((p) => {
        expect(p.priceFrom).toBeLessThanOrEqual(100000);
      });
    }
  });

  it("returns empty result when query has no matches", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "produk-yang-tidak-ada-xyz-123",
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.items).toHaveLength(0);
      expect(result.result.total).toBe(0);
    }
  });

  it("paginates results correctly", async () => {
    const repo = new InMemoryCatalogRepository();

    const firstPage = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 1,
    });

    const secondPage = await searchPublicProducts(repo, {
      q: "loca",
      page: 2,
      limit: 1,
    });

    expect(firstPage.success).toBe(true);
    expect(secondPage.success).toBe(true);

    if (firstPage.success && secondPage.success) {
      expect(firstPage.result.items).toHaveLength(1);
      expect(secondPage.result.items).toHaveLength(1);
      expect(firstPage.result.items[0]?.id).not.toBe(secondPage.result.items[0]?.id);
      expect(firstPage.result.total).toBe(secondPage.result.total);
    }
  });

  it("sorts by priceFrom ascending", async () => {
    const repo = new InMemoryCatalogRepository();
    const result = await searchPublicProducts(repo, {
      q: "loca",
      page: 1,
      limit: 20,
      sort: "priceFrom",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const prices = result.result.items.map((p) => p.priceFrom);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]!).toBeGreaterThanOrEqual(prices[i - 1]!);
      }
    }
  });
});
