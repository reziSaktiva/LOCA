import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  authRegisterCustomer,
  type RegisterCustomerCommand,
} from "@/modules/auth/public/customer-auth-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RegisterCustomerCommand>;
    const { email, password } = body;

    if (!email || !password) {
      return apiError({ code: "VALIDATION_ERROR", message: "email dan password wajib diisi" }, 400);
    }

    const result = await authRegisterCustomer({ email, password });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        EMAIL_INVALID: 400,
        PASSWORD_TOO_SHORT: 400,
        EMAIL_ALREADY_EXISTS: 409,
        PROVIDER_ERROR: 500,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.data, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Registrasi gagal" }, 500);
  }
}
