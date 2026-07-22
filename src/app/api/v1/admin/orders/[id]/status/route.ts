import {
  isOrderStatus,
  orderErrorStatus,
} from "@/modules/order/presentation/order-http";
import {
  ORDER_STATUSES,
  transitionOrderStatusForActor,
} from "@/modules/order/public/order-service";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/v1/admin/orders/{id}/status — transition order status via state machine.
 * Body: `{ status: OrderStatus, reason?: string }`
 */
export async function PATCH(request: Request, context: RouteContext) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ code: "VALIDATION_ERROR", message: "Request body tidak valid." }, 400);
  }

  const { status: nextStatus, reason } = body as {
    status?: unknown;
    reason?: unknown;
  };

  if (!isOrderStatus(nextStatus)) {
    return apiError(
      {
        code: "VALIDATION_ERROR",
        message: `status harus salah satu dari: ${ORDER_STATUSES.join(", ")}`,
      },
      400,
    );
  }

  try {
    const result = await transitionOrderStatusForActor({
      orderId: id,
      nextStatus,
      actor: { actorId: guard.userId, actorRole: "ADMIN" },
      ...(typeof reason === "string" ? { reason } : {}),
    });

    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        orderErrorStatus(result.error),
      );
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update order status" }, 500);
  }
}
