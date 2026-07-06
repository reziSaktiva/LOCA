import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CreateProductCommand,
  UpdateProductCommand,
} from "./catalog-entities";

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
  findProductBySlug(slug: string): Promise<CatalogProduct | null>;
  findProductById(id: string): Promise<CatalogProduct | null>;
  existsProductWithSlug(slug: string, excludeId?: string): Promise<boolean>;
  createProduct(command: CreateProductCommand): Promise<CatalogProduct>;
  updateProduct(command: UpdateProductCommand): Promise<CatalogProduct>;
  updateProductStatus(id: string, status: CatalogProductStatus): Promise<CatalogProduct>;
}
