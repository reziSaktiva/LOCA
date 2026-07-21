import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  homepageDeleteBanner,
  homepageUpdateBanner,
  type UpdateBannerCommand,
} from "@/modules/homepage/public/homepage-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const body = (await request.json()) as Partial<UpdateBannerCommand>;

    const result = await homepageUpdateBanner({
      bannerId: id,
      title: body.title,
      subtitle: body.subtitle,
      mediaUrl: body.mediaUrl,
      ctaLabel: body.ctaLabel,
      ctaLink: body.ctaLink,
      displayOrder: body.displayOrder,
      isActive: body.isActive,
      actorId: guard.userId,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        BANNER_NOT_FOUND: 404,
        TITLE_INVALID: 422,
        MEDIA_URL_INVALID: 422,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update banner" }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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
    const { id } = await context.params;

    const result = await homepageDeleteBanner(id, guard.userId);

    if (!result.success) {
      return apiError(result.error, result.error.code === "BANNER_NOT_FOUND" ? 404 : 422);
    }

    return new Response(null, { status: 204 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to delete banner" }, 500);
  }
}
