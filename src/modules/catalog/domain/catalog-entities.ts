export const CATALOG_PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"] as const;

export type CatalogProductStatus = (typeof CATALOG_PRODUCT_STATUSES)[number];

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  status: CatalogProductStatus;
  variantCount: number;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
  createdAt: Date;
};
