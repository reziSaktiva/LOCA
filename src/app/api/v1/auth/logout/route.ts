import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import { authLogoutCustomer } from "@/modules/auth/public/customer-auth-service";

export async function POST() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    return apiError({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
  }

  try {
    await authLogoutCustomer();
    return apiSuccess({ message: "Logout berhasil" });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Logout gagal" }, 500);
  }
}
