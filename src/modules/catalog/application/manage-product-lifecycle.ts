import type {
  CatalogProduct,
  CatalogProductStatus,
  CreateProductCommand,
  UpdateProductCommand,
} from "../domain/catalog-entities";
import {
  canActivateProduct,
  isAllowedStatusTransition,
  isValidSlug,
} from "../domain/catalog-invariants";
import type { CatalogRepository } from "../domain/catalog-repository";

export type ProductLifecycleError =
  | { code: "SLUG_INVALID"; message: string }
  | { code: "SLUG_CONFLICT"; message: string }
  | { code: "PRODUCT_NOT_FOUND"; message: string }
  | { code: "STATUS_TRANSITION_NOT_ALLOWED"; message: string }
  | { code: "CANNOT_ACTIVATE_WITHOUT_VARIANT"; message: string };

export type ProductLifecycleResult<T> =
  | { success: true; product: T }
  | { success: false; error: ProductLifecycleError };

export async function createProduct(
  repository: CatalogRepository,
  command: CreateProductCommand,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  if (!isValidSlug(command.slug)) {
    return {
      success: false,
      error: {
        code: "SLUG_INVALID",
        message: `Slug "${command.slug}" tidak valid. Gunakan huruf kecil, angka, dan tanda hubung saja.`,
      },
    };
  }

  const slugExists = await repository.existsProductWithSlug(command.slug);
  if (slugExists) {
    return {
      success: false,
      error: {
        code: "SLUG_CONFLICT",
        message: `Slug "${command.slug}" sudah digunakan produk lain.`,
      },
    };
  }

  const product = await repository.createProduct(command);
  return { success: true, product };
}

export async function updateProduct(
  repository: CatalogRepository,
  command: UpdateProductCommand,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  const existing = await repository.findProductById(command.id);
  if (!existing) {
    return {
      success: false,
      error: { code: "PRODUCT_NOT_FOUND", message: `Product "${command.id}" tidak ditemukan.` },
    };
  }

  const product = await repository.updateProduct(command);
  return { success: true, product };
}

export async function updateProductStatus(
  repository: CatalogRepository,
  id: string,
  newStatus: CatalogProductStatus,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  const existing = await repository.findProductById(id);
  if (!existing) {
    return {
      success: false,
      error: { code: "PRODUCT_NOT_FOUND", message: `Product "${id}" tidak ditemukan.` },
    };
  }

  if (!isAllowedStatusTransition(existing.status, newStatus)) {
    return {
      success: false,
      error: {
        code: "STATUS_TRANSITION_NOT_ALLOWED",
        message: `Transisi status dari ${existing.status} ke ${newStatus} tidak diizinkan.`,
      },
    };
  }

  if (newStatus === "ACTIVE" && !canActivateProduct(existing)) {
    return {
      success: false,
      error: {
        code: "CANNOT_ACTIVATE_WITHOUT_VARIANT",
        message: "Product tidak bisa diaktifkan tanpa minimal 1 variant.",
      },
    };
  }

  const product = await repository.updateProductStatus(id, newStatus);
  return { success: true, product };
}

export async function archiveProduct(
  repository: CatalogRepository,
  id: string,
): Promise<ProductLifecycleResult<CatalogProduct>> {
  return updateProductStatus(repository, id, "ARCHIVED");
}
