import { parseOrderListQuery } from "@/modules/order/presentation/order-http";
import { listCustomerOrders } from "@/modules/order/public/order-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

/**
 * GET /api/v1/orders — list orders owned by the authenticated customer.
 */
export async function GET(request: Request) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const result = await listCustomerOrders(guard.userId, parseOrderListQuery(searchParams));
    return apiSuccess(result);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to list orders" }, 500);
  }
}
