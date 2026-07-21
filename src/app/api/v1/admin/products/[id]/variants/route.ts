import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminCreateVariant,
  adminGetVariantsByProduct,
  type CreateVariantCommand,
} from "@/modules/catalog/public/catalog-admin-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
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

  const { id: productId } = await params;

  try {
    const variants = await adminGetVariantsByProduct(productId);
    return apiSuccess(variants);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch variants" }, 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

  const { id: productId } = await params;

  try {
    const body = (await request.json()) as Partial<Omit<CreateVariantCommand, "productId">>;
    const { sku, price, compareAtPrice, variantLabel } = body;

    if (!sku || price === undefined || !variantLabel) {
      return apiError(
        { code: "VALIDATION_ERROR", message: "sku, price, variantLabel are required" },
        400,
      );
    }

    const result = await adminCreateVariant({
      productId,
      sku,
      price,
      compareAtPrice,
      variantLabel,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        PRODUCT_NOT_FOUND: 404,
        SKU_INVALID: 400,
        SKU_CONFLICT: 409,
        PRICE_INVALID: 400,
        VARIANT_NOT_FOUND: 404,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.variant, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create variant" }, 500);
  }
}
