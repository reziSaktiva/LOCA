import { NextRequest } from "next/server";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminGetProductSeo,
  adminUpsertProductSeo,
} from "@/modules/catalog/public/catalog-admin-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      { code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" },
      status,
    );
  }

  const { id } = await params;
  const result = await adminGetProductSeo(id);

  if (!result.success) {
    const status = result.error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return apiError(result.error, status);
  }

  return apiSuccess(result.data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      { code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" },
      status,
    );
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError({ code: "VALIDATION_ERROR", message: "Invalid JSON body" }, 400);
  }

  const result = await adminUpsertProductSeo({
    productId: id,
    metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : "",
    metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : "",
    canonicalUrl: typeof body.canonicalUrl === "string" ? body.canonicalUrl : "",
  });

  if (!result.success) {
    const status = result.error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return apiError(result.error, status);
  }

  return apiSuccess(result.data);
}
