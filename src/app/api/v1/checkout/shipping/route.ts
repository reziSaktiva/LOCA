import { checkoutErrorStatus } from "@/modules/checkout/presentation/checkout-http";
import { checkoutSelectShippingOption } from "@/modules/checkout/public/checkout-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

/**
 * POST /api/v1/checkout/shipping — select shipping option for open session.
 * Body: `{ optionId: string }`
 */
export async function POST(request: Request) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ code: "INVALID_BODY", message: "Request body tidak valid." }, 400);
  }

  const { optionId } = body as Record<string, unknown>;
  if (typeof optionId !== "string" || optionId.trim() === "") {
    return apiError({ code: "VALIDATION_ERROR", message: "optionId wajib diisi." }, 422);
  }

  try {
    const result = await checkoutSelectShippingOption(guard.userId, optionId.trim());
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        checkoutErrorStatus(result.error),
      );
    }
    return apiSuccess(result.data);
  } catch {
    return apiError(
      { code: "INTERNAL_ERROR", message: "Failed to select shipping option" },
      500,
    );
  }
}
