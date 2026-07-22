import { orderErrorStatus } from "@/modules/order/presentation/order-http";
import { getOrder } from "@/modules/order/public/order-service";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/admin/orders/{id} — order detail for admin.
 */
export async function GET(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    const result = await getOrder(id);
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        orderErrorStatus(result.error),
      );
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch order" }, 500);
  }
}
