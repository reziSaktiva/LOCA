import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import {
  adminAddProductMedia,
  adminListProductMedia,
} from "@/modules/catalog/public/catalog-admin-service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const result = await adminListProductMedia(id);

  if (!result.success) {
    const status = result.error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return apiError(result.error, status);
  }

  return apiSuccess(result.data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError({ code: "VALIDATION_ERROR", message: "Invalid JSON body" }, 400);
  }

  if (!body.url || typeof body.url !== "string") {
    return apiError({ code: "VALIDATION_ERROR", message: "url is required" }, 400);
  }

  const result = await adminAddProductMedia({
    ownerType: (body.ownerType as "PRODUCT" | "VARIANT") ?? "PRODUCT",
    ownerId: id,
    mediaType: (body.mediaType as "IMAGE" | "VIDEO" | "THREE_SIXTY" | "MANUAL_PDF") ?? "IMAGE",
    url: body.url,
    altText: typeof body.altText === "string" ? body.altText : undefined,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
  });

  if (!result.success) {
    const status = result.error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return apiError(result.error, status);
  }

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}
