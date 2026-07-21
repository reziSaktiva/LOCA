import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminCreateCategory,
  adminListCategories,
  type CreateCategoryCommand,
} from "@/modules/catalog/public/catalog-admin-service";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      {
        code: guard.reason,
        message:
          guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required",
      },
      status,
    );
  }

  try {
    const categories = await adminListCategories();
    return apiSuccess(categories);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch categories" }, 500);
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      {
        code: guard.reason,
        message:
          guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required",
      },
      status,
    );
  }

  try {
    const body = (await request.json()) as Partial<CreateCategoryCommand>;
    const { name, slug } = body;

    if (!name || !slug) {
      return apiError({ code: "VALIDATION_ERROR", message: "name dan slug wajib diisi" }, 400);
    }

    const result = await adminCreateCategory({ name, slug });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        SLUG_INVALID: 400,
        SLUG_CONFLICT: 409,
        CATEGORY_NOT_FOUND: 404,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.category, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create category" }, 500);
  }
}
