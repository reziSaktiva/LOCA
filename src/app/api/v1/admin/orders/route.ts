import { parseOrderListQuery } from "@/modules/order/presentation/order-http";
import { listOrdersForAdmin } from "@/modules/order/public/order-service";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

/**
 * GET /api/v1/admin/orders — list all orders (optional status/page/limit filters).
 */
export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const result = await listOrdersForAdmin(parseOrderListQuery(searchParams));
    return apiSuccess(result);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to list orders" }, 500);
  }
}
