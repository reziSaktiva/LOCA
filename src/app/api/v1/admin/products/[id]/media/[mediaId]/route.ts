import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError } from "@/modules/catalog/presentation/api-response";
import { adminRemoveProductMedia } from "@/modules/catalog/public/catalog-admin-service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    const status = guard.reason === "UNAUTHORIZED" ? 401 : 403;
    return apiError(
      { code: guard.reason, message: guard.reason === "UNAUTHORIZED" ? "Authentication required" : "Admin access required" },
      status,
    );
  }

  const { mediaId } = await params;
  const result = await adminRemoveProductMedia(mediaId);

  if (!result.success) {
    return apiError(result.error, 400);
  }

  return new NextResponse(null, { status: 204 });
}
