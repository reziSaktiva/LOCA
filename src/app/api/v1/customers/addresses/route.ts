import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  customerCreateAddress,
  customerListAddresses,
} from "@/modules/customer/public/customer-service";

export async function GET() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const addresses = await customerListAddresses(guard.userId);
  return apiSuccess(addresses);
}

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

  const { recipientName, phone, street, district, city, province, postalCode, isDefault } =
    body as Record<string, unknown>;

  if (
    typeof recipientName !== "string" ||
    typeof phone !== "string" ||
    typeof street !== "string" ||
    typeof district !== "string" ||
    typeof city !== "string" ||
    typeof province !== "string" ||
    typeof postalCode !== "string"
  ) {
    return apiError(
      {
        code: "VALIDATION_ERROR",
        message: "recipientName, phone, street, district, city, province, postalCode wajib diisi.",
      },
      422,
    );
  }

  const result = await customerCreateAddress({
    customerId: guard.userId,
    recipientName,
    phone,
    street,
    district,
    city,
    province,
    postalCode,
    isDefault: isDefault === true,
  });

  if (!result.success) {
    return apiError({ code: result.error.code, message: result.error.message }, 422);
  }

  return apiSuccess(result.data, { status: 201 });
}
