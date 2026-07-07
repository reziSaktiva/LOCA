export type { CategoryOperationResult } from "../application/manage-category";
export type { ProductLifecycleResult } from "../application/manage-product-lifecycle";
export type { ProductMediaResult } from "../application/manage-product-media";
export type { VariantOperationResult } from "../application/manage-variant";
export type {
  AddProductMediaCommand,
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  ProductMedia,
  ProductSeo,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  UpsertProductSeoCommand,
} from "../domain/catalog-entities";
export { CATALOG_PRODUCT_STATUSES } from "../domain/catalog-entities";

import {
  createCategory,
  updateCategory,
  type CategoryOperationResult,
} from "../application/manage-category";
import {
  archiveProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  type ProductLifecycleResult,
} from "../application/manage-product-lifecycle";
import {
  addProductMedia,
  getProductSeo,
  listProductMedia,
  removeProductMedia,
  upsertProductSeo,
  type ProductMediaResult,
} from "../application/manage-product-media";
import {
  createVariant,
  updateVariant,
  type VariantOperationResult,
} from "../application/manage-variant";
import type {
  AddProductMediaCommand,
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  ProductMedia,
  ProductSeo,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  UpsertProductSeoCommand,
} from "../domain/catalog-entities";
import { PrismaCatalogRepository } from "../infrastructure/prisma-catalog-repository";

const repository = new PrismaCatalogRepository();

// ---- Products ---------------------------------------------------------------

export async function adminListProducts(): Promise<CatalogProduct[]> {
  return repository.listProducts();
}

export async function adminGetProductById(id: string): Promise<CatalogProduct | null> {
  return repository.findProductById(id);
}

export async function adminCreateProduct(
  command: CreateProductCommand,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  return createProduct(repository, command);
}

export async function adminUpdateProduct(
  command: UpdateProductCommand,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  return updateProduct(repository, command);
}

export async function adminUpdateProductStatus(
  id: string,
  status: CatalogProductStatus,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  return updateProductStatus(repository, id, status);
}

export async function adminArchiveProduct(
  id: string,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  return archiveProduct(repository, id);
}

// ---- Variants ---------------------------------------------------------------

export async function adminGetVariantsByProduct(productId: string): Promise<CatalogVariant[]> {
  return repository.findVariantsByProductId(productId);
}

export async function adminCreateVariant(
  command: CreateVariantCommand,
): Promise<VariantOperationResult<CatalogVariant>> {
  return createVariant(repository, command);
}

export async function adminUpdateVariant(
  command: UpdateVariantCommand,
): Promise<VariantOperationResult<CatalogVariant>> {
  return updateVariant(repository, command);
}

// ---- Media ------------------------------------------------------------------

export async function adminListProductMedia(
  productId: string,
): Promise<ProductMediaResult<ProductMedia[]>> {
  return listProductMedia(repository, productId);
}

export async function adminAddProductMedia(
  command: AddProductMediaCommand,
): Promise<ProductMediaResult<ProductMedia>> {
  return addProductMedia(repository, command);
}

export async function adminRemoveProductMedia(
  mediaId: string,
): Promise<ProductMediaResult<void>> {
  return removeProductMedia(repository, mediaId);
}

// ---- SEO --------------------------------------------------------------------

export async function adminGetProductSeo(
  productId: string,
): Promise<ProductMediaResult<ProductSeo | null>> {
  return getProductSeo(repository, productId);
}

export async function adminUpsertProductSeo(
  command: UpsertProductSeoCommand,
): Promise<ProductMediaResult<ProductSeo>> {
  return upsertProductSeo(repository, command);
}

// ---- Categories -------------------------------------------------------------

export async function adminListCategories(): Promise<CatalogCategory[]> {
  return repository.listCategories();
}

export async function adminGetCategoryById(id: string): Promise<CatalogCategory | null> {
  return repository.findCategoryById(id);
}

export async function adminCreateCategory(
  command: CreateCategoryCommand,
): Promise<CategoryOperationResult<CatalogCategory>> {
  return createCategory(repository, command);
}

export async function adminUpdateCategory(
  command: UpdateCategoryCommand,
): Promise<CategoryOperationResult<CatalogCategory>> {
  return updateCategory(repository, command);
}
