import {
  cartChangeItemVariant,
  cartGetCustomerView,
  cartRemoveItem,
  cartUpdateItemQuantity,
} from "@/modules/cart/public/cart-service";
import { cartErrorStatus } from "@/modules/cart/presentation/cart-http";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const { id: itemId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ code: "INVALID_BODY", message: "Request body tidak valid." }, 400);
  }

  const { quantity, variantId } = body as Record<string, unknown>;
  const hasQuantity = typeof quantity === "number" && Number.isFinite(quantity);
  const hasVariantId = typeof variantId === "string" && variantId.trim() !== "";

  if (!hasQuantity && !hasVariantId) {
    return apiError(
      { code: "VALIDATION_ERROR", message: "quantity atau variantId wajib diisi." },
      422,
    );
  }

  try {
    if (hasVariantId) {
      const result = await cartChangeItemVariant(guard.userId, itemId, variantId);
      if (!result.success) {
        return apiError(
          { code: result.error.code, message: result.error.message },
          cartErrorStatus(result.error),
        );
      }
    }

    if (hasQuantity) {
      const result = await cartUpdateItemQuantity(guard.userId, itemId, quantity);
      if (!result.success) {
        return apiError(
          { code: result.error.code, message: result.error.message },
          cartErrorStatus(result.error),
        );
      }
    }

    const view = await cartGetCustomerView(guard.userId);
    return apiSuccess(view);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update cart item" }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const { id: itemId } = await context.params;

  try {
    const result = await cartRemoveItem(guard.userId, itemId);
    if (!result.success) {
      return apiError(
        { code: result.error.code, message: result.error.message },
        cartErrorStatus(result.error),
      );
    }
    return new Response(null, { status: 204 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove cart item" }, 500);
  }
}
