import { orderErrorStatus } from "@/modules/order/presentation/order-http";
import { cancelOrderForActor } from "@/modules/order/public/order-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/orders/{id}/cancel — cancel own order (WAITING_PAYMENT / PENDING).
 * Body: `{ reason?: string }` — defaults to "Cancelled by customer".
 */
export async function POST(request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const { id } = await context.params;

  let reason = "Cancelled by customer";
  try {
    const body = (await request.json()) as { reason?: unknown };
    if (typeof body.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim();
    }
  } catch {
    // empty / non-JSON body → default reason
  }

  try {
    const result = await cancelOrderForActor({
      orderId: id,
      actor: { actorId: guard.userId, actorRole: "CUSTOMER" },
      reason,
    });

    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        orderErrorStatus(result.error),
      );
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to cancel order" }, 500);
  }
}
