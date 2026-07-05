import type { CatalogCategory, CatalogProduct } from "./catalog-entities";

export type ListPublicProductsQuery = {
  page: number;
  limit: number;
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "createdAt" | "-createdAt" | "priceFrom" | "-priceFrom";
};

export type ListPublicProductsResult = {
  items: CatalogProduct[];
  total: number;
};

export interface CatalogRepository {
  listCategories(): Promise<CatalogCategory[]>;
  listProducts(): Promise<CatalogProduct[]>;
}
