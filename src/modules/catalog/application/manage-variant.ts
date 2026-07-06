import type {
  CatalogVariant,
  CreateVariantCommand,
  UpdateVariantCommand,
} from "../domain/catalog-entities";
import {
  isValidSku,
  isVariantPriceValid,
} from "../domain/catalog-invariants";
import type { CatalogRepository } from "../domain/catalog-repository";

export type VariantOperationError =
  | { code: "PRODUCT_NOT_FOUND"; message: string }
  | { code: "VARIANT_NOT_FOUND"; message: string }
  | { code: "SKU_INVALID"; message: string }
  | { code: "SKU_CONFLICT"; message: string }
  | { code: "PRICE_INVALID"; message: string };

export type VariantOperationResult<T> =
  | { success: true; variant: T }
  | { success: false; error: VariantOperationError };

export async function createVariant(
  repository: CatalogRepository,
  command: CreateVariantCommand,
): Promise<VariantOperationResult<CatalogVariant>> {
  const product = await repository.findProductById(command.productId);
  if (!product) {
    return {
      success: false,
      error: {
        code: "PRODUCT_NOT_FOUND",
        message: `Product "${command.productId}" tidak ditemukan.`,
      },
    };
  }

  if (!isValidSku(command.sku)) {
    return {
      success: false,
      error: {
        code: "SKU_INVALID",
        message: "SKU tidak boleh kosong.",
      },
    };
  }

  const skuConflict = await repository.existsVariantWithSku(command.sku);
  if (skuConflict) {
    return {
      success: false,
      error: {
        code: "SKU_CONFLICT",
        message: `SKU "${command.sku}" sudah digunakan varian lain.`,
      },
    };
  }

  if (!isVariantPriceValid(command.price)) {
    return {
      success: false,
      error: {
        code: "PRICE_INVALID",
        message: "Harga variant tidak boleh negatif atau bukan angka valid.",
      },
    };
  }

  if (
    command.compareAtPrice !== undefined &&
    command.compareAtPrice !== null &&
    !isVariantPriceValid(command.compareAtPrice)
  ) {
    return {
      success: false,
      error: {
        code: "PRICE_INVALID",
        message: "compareAtPrice tidak boleh negatif atau bukan angka valid.",
      },
    };
  }

  const variant = await repository.createVariant(command);
  return { success: true, variant };
}

export async function updateVariant(
  repository: CatalogRepository,
  command: UpdateVariantCommand,
): Promise<VariantOperationResult<CatalogVariant>> {
  const existing = await repository.findVariantById(command.id);
  if (!existing) {
    return {
      success: false,
      error: {
        code: "VARIANT_NOT_FOUND",
        message: `Variant "${command.id}" tidak ditemukan.`,
      },
    };
  }

  if (command.sku !== undefined) {
    if (!isValidSku(command.sku)) {
      return {
        success: false,
        error: {
          code: "SKU_INVALID",
          message: "SKU tidak boleh kosong.",
        },
      };
    }

    const skuConflict = await repository.existsVariantWithSku(command.sku, command.id);
    if (skuConflict) {
      return {
        success: false,
        error: {
          code: "SKU_CONFLICT",
          message: `SKU "${command.sku}" sudah digunakan varian lain.`,
        },
      };
    }
  }

  if (command.price !== undefined && !isVariantPriceValid(command.price)) {
    return {
      success: false,
      error: {
        code: "PRICE_INVALID",
        message: "Harga variant tidak boleh negatif atau bukan angka valid.",
      },
    };
  }

  if (
    command.compareAtPrice !== undefined &&
    command.compareAtPrice !== null &&
    !isVariantPriceValid(command.compareAtPrice)
  ) {
    return {
      success: false,
      error: {
        code: "PRICE_INVALID",
        message: "compareAtPrice tidak boleh negatif atau bukan angka valid.",
      },
    };
  }

  const variant = await repository.updateVariant(command);
  return { success: true, variant };
}
