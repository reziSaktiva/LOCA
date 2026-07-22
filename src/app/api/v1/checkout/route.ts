import { checkoutErrorStatus } from "@/modules/checkout/presentation/checkout-http";
import { checkoutPrepare } from "@/modules/checkout/public/checkout-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

/**
 * GET /api/v1/checkout — prepare / refresh checkout session view.
 * Auto-confirms default (or first) address when available.
 */
export async function GET() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    const result = await checkoutPrepare(guard.userId);
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        checkoutErrorStatus(result.error),
      );
    }
    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to prepare checkout" }, 500);
  }
}
