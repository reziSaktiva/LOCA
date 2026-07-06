import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateProductCommand,
  CreateVariantCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  VariantSnapshot,
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
  // --- Product ---
  listCategories(): Promise<CatalogCategory[]>;
  listProducts(): Promise<CatalogProduct[]>;
  findProductBySlug(slug: string): Promise<CatalogProduct | null>;
  findProductById(id: string): Promise<CatalogProduct | null>;
  existsProductWithSlug(slug: string, excludeId?: string): Promise<boolean>;
  createProduct(command: CreateProductCommand): Promise<CatalogProduct>;
  updateProduct(command: UpdateProductCommand): Promise<CatalogProduct>;
  updateProductStatus(id: string, status: CatalogProductStatus): Promise<CatalogProduct>;

  // --- Variant ---
  findVariantsByProductId(productId: string): Promise<CatalogVariant[]>;
  findVariantById(id: string): Promise<CatalogVariant | null>;
  existsVariantWithSku(sku: string, excludeId?: string): Promise<boolean>;
  createVariant(command: CreateVariantCommand): Promise<CatalogVariant>;
  updateVariant(command: UpdateVariantCommand): Promise<CatalogVariant>;

  /**
   * Mengambil snapshot varian untuk consumer lain (mis. cart).
   * Menggabungkan data varian + produk induknya menjadi satu kontrak baca-only.
   */
  getVariantSnapshot(variantId: string): Promise<VariantSnapshot | null>;
}
