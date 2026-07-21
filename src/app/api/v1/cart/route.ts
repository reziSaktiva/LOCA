import { cartClear, cartGetCustomerView } from "@/modules/cart/public/cart-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

export async function GET() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    const view = await cartGetCustomerView(guard.userId);
    return apiSuccess(view);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch cart" }, 500);
  }
}

export async function DELETE() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    const result = await cartClear(guard.userId);
    if (!result.success) {
      return apiError({ code: result.error.code, message: result.error.message }, 400);
    }
    return new Response(null, { status: 204 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to clear cart" }, 500);
  }
}
