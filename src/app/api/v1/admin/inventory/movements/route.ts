import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import { inventoryListMovements } from "@/modules/inventory/public/inventory-service";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      {
        code: guard.reason,
        message:
          guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required",
      },
      status,
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const result = await inventoryListMovements({ variantId, page, limit });
    return apiSuccess(result);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch stock movements" }, 500);
  }
}
