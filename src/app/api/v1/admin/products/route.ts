import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminCreateProduct,
  adminListProducts,
  type CreateProductCommand,
} from "@/modules/catalog/public/catalog-admin-service";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  try {
    const products = await adminListProducts();
    return apiSuccess(products);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch products" }, 500);
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  try {
    const body = (await request.json()) as Partial<CreateProductCommand>;
    const { name, slug, description, brand, categoryId } = body;

    if (!name || !slug || description === undefined || !brand || !categoryId) {
      return apiError({ code: "VALIDATION_ERROR", message: "name, slug, description, brand, categoryId are required" }, 400);
    }

    const result = await adminCreateProduct({ name, slug, description, brand, categoryId });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        SLUG_INVALID: 400,
        SLUG_CONFLICT: 409,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.product, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create product" }, 500);
  }
}
