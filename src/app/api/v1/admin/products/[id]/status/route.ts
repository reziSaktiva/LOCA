import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminUpdateProductStatus,
  CATALOG_PRODUCT_STATUSES,
  type CatalogProductStatus,
} from "@/modules/catalog/public/catalog-admin-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as { status?: string };

    if (!body.status || !CATALOG_PRODUCT_STATUSES.includes(body.status as CatalogProductStatus)) {
      return apiError(
        { code: "VALIDATION_ERROR", message: `status harus salah satu dari: ${CATALOG_PRODUCT_STATUSES.join(", ")}` },
        400,
      );
    }

    const result = await adminUpdateProductStatus(id, body.status as CatalogProductStatus);

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
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update product status" }, 500);
  }
}
