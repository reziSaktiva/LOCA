import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminArchiveProduct,
  adminGetProductById,
  adminUpdateProduct,
  type UpdateProductCommand,
} from "@/modules/catalog/public/catalog-admin-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  const { id } = await params;

  try {
    const product = await adminGetProductById(id);
    if (!product) {
      return apiError({ code: "NOT_FOUND", message: `Product "${id}" tidak ditemukan.` }, 404);
    }
    return apiSuccess(product);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch product" }, 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as Partial<Omit<UpdateProductCommand, "id">>;
    const result = await adminUpdateProduct({ id, ...body });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        PRODUCT_NOT_FOUND: 404,
        SLUG_INVALID: 400,
        SLUG_CONFLICT: 409,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.product);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update product" }, 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  const { id } = await params;

  try {
    const result = await adminArchiveProduct(id);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        PRODUCT_NOT_FOUND: 404,
        STATUS_TRANSITION_NOT_ALLOWED: 422,
        CANNOT_ACTIVATE_WITHOUT_VARIANT: 422,
        SLUG_INVALID: 400,
        SLUG_CONFLICT: 409,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.product);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to archive product" }, 500);
  }
}
