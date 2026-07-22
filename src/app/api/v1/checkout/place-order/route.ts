import { checkoutErrorStatus } from "@/modules/checkout/presentation/checkout-http";
import { checkoutPlaceOrder } from "@/modules/checkout/public/checkout-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

/**
 * POST /api/v1/checkout/place-order — create order WAITING_PAYMENT from checkout session.
 */
export async function POST() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    const result = await checkoutPlaceOrder(guard.userId);
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        checkoutErrorStatus(result.error),
      );
    }

    return apiSuccess(
      {
        orderId: result.data.orderId,
        status: "WAITING_PAYMENT" as const,
        snapshot: result.data.snapshot,
      },
      { status: 201 },
    );
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to place order" }, 500);
  }
}
