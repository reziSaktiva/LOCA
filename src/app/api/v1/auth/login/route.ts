import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import { authLoginCustomer, type LoginCommand } from "@/modules/auth/public/customer-auth-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LoginCommand>;
    const { email, password } = body;

    if (!email || !password) {
      return apiError({ code: "VALIDATION_ERROR", message: "email dan password wajib diisi" }, 400);
    }

    const result = await authLoginCustomer({ email, password });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        EMAIL_INVALID: 400,
        INVALID_CREDENTIALS: 401,
        PROVIDER_ERROR: 500,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Login gagal" }, 500);
  }
}
