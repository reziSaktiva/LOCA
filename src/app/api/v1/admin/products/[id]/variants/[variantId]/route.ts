import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminUpdateVariant,
  type UpdateVariantCommand,
} from "@/modules/catalog/public/catalog-admin-service";

type RouteParams = { params: Promise<{ id: string; variantId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError({ code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" }, status);
  }

  const { variantId } = await params;

  try {
    const body = (await request.json()) as Partial<Omit<UpdateVariantCommand, "id">>;
    const result = await adminUpdateVariant({ id: variantId, ...body });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        VARIANT_NOT_FOUND: 404,
        SKU_INVALID: 400,
        SKU_CONFLICT: 409,
        PRICE_INVALID: 400,
        PRODUCT_NOT_FOUND: 404,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.variant);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update variant" }, 500);
  }
}
