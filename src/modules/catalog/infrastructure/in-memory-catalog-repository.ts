import type { CatalogCategory, CatalogProduct } from "../domain/catalog-entities";
import type { CatalogRepository } from "../domain/catalog-repository";

const categories: CatalogCategory[] = [
  { id: "cat-socks", name: "Socks", slug: "socks", isActive: true },
  { id: "cat-shorts", name: "Shorts", slug: "shorts", isActive: true },
  { id: "cat-boxer", name: "Boxer", slug: "boxer", isActive: true },
  { id: "cat-archived", name: "Legacy", slug: "legacy", isActive: false },
];

const products: CatalogProduct[] = [
  {
    id: "prod-run-socks-pro",
    name: "Run Socks Pro",
    slug: "run-socks-pro",
    categoryId: "cat-socks",
    status: "ACTIVE",
    variantCount: 3,
    priceFrom: 89000,
    priceTo: 109000,
    thumbnailUrl: "/catalog/run-socks-pro.jpg",
    createdAt: new Date("2026-07-01T09:00:00.000Z"),
  },
  {
    id: "prod-performance-shorts",
    name: "Performance Shorts",
    slug: "performance-shorts",
    categoryId: "cat-shorts",
    status: "ACTIVE",
    variantCount: 2,
    priceFrom: 179000,
    priceTo: 219000,
    thumbnailUrl: "/catalog/performance-shorts.jpg",
    createdAt: new Date("2026-07-03T09:00:00.000Z"),
  },
  {
    id: "prod-core-boxer",
    name: "Core Boxer",
    slug: "core-boxer",
    categoryId: "cat-boxer",
    status: "DRAFT",
    variantCount: 2,
    priceFrom: 99000,
    priceTo: 119000,
    thumbnailUrl: "/catalog/core-boxer.jpg",
    createdAt: new Date("2026-07-04T09:00:00.000Z"),
  },
  {
    id: "prod-legacy-tee",
    name: "Legacy Tee",
    slug: "legacy-tee",
    categoryId: "cat-archived",
    status: "ARCHIVED",
    variantCount: 1,
    priceFrom: 150000,
    priceTo: 150000,
    thumbnailUrl: "/catalog/legacy-tee.jpg",
    createdAt: new Date("2026-06-20T09:00:00.000Z"),
  },
  {
    id: "prod-invalid-active",
    name: "Invalid Active Product",
    slug: "invalid-active-product",
    categoryId: "cat-socks",
    status: "ACTIVE",
    variantCount: 0,
    priceFrom: 50000,
    priceTo: 50000,
    thumbnailUrl: "/catalog/invalid.jpg",
    createdAt: new Date("2026-07-02T09:00:00.000Z"),
  },
];

export class InMemoryCatalogRepository implements CatalogRepository {
  async listCategories(): Promise<CatalogCategory[]> {
    return categories;
  }

  async listProducts(): Promise<CatalogProduct[]> {
    return products;
  }
}
