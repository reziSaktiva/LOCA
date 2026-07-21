import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  customerDeleteAddress,
  customerUpdateAddress,
} from "@/modules/customer/public/customer-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ code: "INVALID_BODY", message: "Request body tidak valid." }, 400);
  }

  const { recipientName, phone, street, district, city, province, postalCode, isDefault } =
    body as Record<string, unknown>;

  const result = await customerUpdateAddress({
    customerId: guard.userId,
    addressId: id,
    ...(typeof recipientName === "string" && { recipientName }),
    ...(typeof phone === "string" && { phone }),
    ...(typeof street === "string" && { street }),
    ...(typeof district === "string" && { district }),
    ...(typeof city === "string" && { city }),
    ...(typeof province === "string" && { province }),
    ...(typeof postalCode === "string" && { postalCode }),
    ...(typeof isDefault === "boolean" && { isDefault }),
  });

  if (!result.success) {
    const status = result.error.code === "ADDRESS_NOT_FOUND" ? 404 : 422;
    return apiError({ code: result.error.code, message: result.error.message }, status);
  }

  return apiSuccess(result.data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const { id } = await context.params;

  const result = await customerDeleteAddress(id, guard.userId);

  if (!result.success) {
    return apiError({ code: result.error.code, message: result.error.message }, 404);
  }

  return new Response(null, { status: 204 });
}
