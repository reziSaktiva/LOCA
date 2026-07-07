export type { CategoryOperationResult } from "../application/manage-category";
export type { ProductLifecycleResult } from "../application/manage-product-lifecycle";
export type { VariantOperationResult } from "../application/manage-variant";
export type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
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
  createVariant,
  updateVariant,
  type VariantOperationResult,
} from "../application/manage-variant";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
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
