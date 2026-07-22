import { orderErrorStatus } from "@/modules/order/presentation/order-http";
import { getOrder } from "@/modules/order/public/order-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/orders/{id} — order detail for the owning customer.
 * Non-owners receive ORDER_NOT_FOUND (no existence leak).
 */
export async function GET(_request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
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

    if (result.data.order.customerId !== guard.userId) {
      return apiError(
        { code: "ORDER_NOT_FOUND", message: `Order ${id} was not found.` },
        404,
      );
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch order" }, 500);
  }
}
