import type {
  CatalogCategory,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from "../domain/catalog-entities";
import { isValidSlug } from "../domain/catalog-invariants";
import type { CatalogRepository } from "../domain/catalog-repository";

export type CategoryOperationError =
  | { code: "CATEGORY_NOT_FOUND"; message: string }
  | { code: "SLUG_INVALID"; message: string }
  | { code: "SLUG_CONFLICT"; message: string };

export type CategoryOperationResult<T> =
  { success: true; category: T } | { success: false; error: CategoryOperationError };

export async function createCategory(
  repository: CatalogRepository,
  command: CreateCategoryCommand,
): Promise<CategoryOperationResult<CatalogCategory>> {
  if (!isValidSlug(command.slug)) {
    return {
      success: false,
      error: {
        code: "SLUG_INVALID",
        message: `Slug "${command.slug}" tidak valid. Gunakan huruf kecil, angka, dan tanda hubung saja.`,
      },
    };
  }

  const slugExists = await repository.existsCategoryWithSlug(command.slug);
  if (slugExists) {
    return {
      success: false,
      error: {
        code: "SLUG_CONFLICT",
        message: `Slug "${command.slug}" sudah digunakan kategori lain.`,
      },
    };
  }

  const category = await repository.createCategory(command);
  return { success: true, category };
}

export async function updateCategory(
  repository: CatalogRepository,
  command: UpdateCategoryCommand,
): Promise<CategoryOperationResult<CatalogCategory>> {
  const existing = await repository.findCategoryById(command.id);
  if (!existing) {
    return {
      success: false,
      error: {
        code: "CATEGORY_NOT_FOUND",
        message: `Category "${command.id}" tidak ditemukan.`,
      },
    };
  }

  if (command.slug !== undefined) {
    if (!isValidSlug(command.slug)) {
      return {
        success: false,
        error: {
          code: "SLUG_INVALID",
          message: `Slug "${command.slug}" tidak valid. Gunakan huruf kecil, angka, dan tanda hubung saja.`,
        },
      };
    }

    const slugExists = await repository.existsCategoryWithSlug(command.slug, command.id);
    if (slugExists) {
      return {
        success: false,
        error: {
          code: "SLUG_CONFLICT",
          message: `Slug "${command.slug}" sudah digunakan kategori lain.`,
        },
      };
    }
  }

  const category = await repository.updateCategory(command);
  return { success: true, category };
}
