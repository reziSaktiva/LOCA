import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import { inventoryUpsertStock } from "@/modules/inventory/public/inventory-service";

type RouteParams = { params: Promise<{ variantId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
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

  const { variantId } = await params;

  try {
    const body = (await request.json()) as Partial<{ newQty: number; reason: string }>;
    const { newQty, reason } = body;

    if (newQty === undefined || !reason) {
      return apiError({ code: "VALIDATION_ERROR", message: "newQty dan reason wajib diisi" }, 400);
    }

    const result = await inventoryUpsertStock({ variantId, newQty, reason, actorId: guard.userId });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        INVALID_QUANTITY: 422,
        STOCK_NOT_FOUND: 404,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to adjust stock" }, 500);
  }
}
