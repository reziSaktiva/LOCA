import { cartAddItem, cartGetCustomerView } from "@/modules/cart/public/cart-service";
import { cartErrorStatus } from "@/modules/cart/presentation/cart-http";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

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

  const { variantId, quantity } = body as Record<string, unknown>;

  if (typeof variantId !== "string" || variantId.trim() === "") {
    return apiError({ code: "VALIDATION_ERROR", message: "variantId wajib diisi." }, 422);
  }

  if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
    return apiError(
      { code: "VALIDATION_ERROR", message: "quantity wajib diisi sebagai angka." },
      422,
    );
  }

  try {
    const result = await cartAddItem(guard.userId, variantId, quantity);
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        cartErrorStatus(result.error),
      );
    }

    const view = await cartGetCustomerView(guard.userId);
    return apiSuccess(view, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to add cart item" }, 500);
  }
}
