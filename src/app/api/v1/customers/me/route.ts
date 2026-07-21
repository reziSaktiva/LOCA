import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  customerGetProfile,
  customerUpsertProfile,
} from "@/modules/customer/public/customer-service";

export async function GET() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  const result = await customerGetProfile(guard.userId);
  if (!result.success) {
    return apiError({ code: result.error.code, message: result.error.message }, 404);
  }

  return apiSuccess(result.data);
}

export async function PATCH(request: Request) {
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

  const { displayName, phone, avatarUrl } = body as Record<string, unknown>;

  if (typeof displayName !== "string" || typeof phone !== "string") {
    return apiError(
      { code: "VALIDATION_ERROR", message: "displayName dan phone wajib diisi." },
      422,
    );
  }

  const result = await customerUpsertProfile({
    customerId: guard.userId,
    displayName,
    phone,
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
  });

  if (!result.success) {
    return apiError({ code: result.error.code, message: result.error.message }, 422);
  }

  return apiSuccess(result.data);
}
