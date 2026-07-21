import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import {
  homepageCreateBanner,
  homepageListAllBanners,
  type CreateBannerCommand,
} from "@/modules/homepage/public/homepage-service";

export async function GET() {
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
    const banners = await homepageListAllBanners();
    return apiSuccess(banners);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch banners" }, 500);
  }
}

export async function POST(request: Request) {
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
    const body = (await request.json()) as Partial<CreateBannerCommand>;
    const { title, mediaUrl, subtitle, ctaLabel, ctaLink, displayOrder, isActive } = body;

    if (!title || !mediaUrl) {
      return apiError({ code: "VALIDATION_ERROR", message: "title dan mediaUrl wajib diisi" }, 400);
    }

    const result = await homepageCreateBanner({
      title,
      mediaUrl,
      subtitle: subtitle ?? null,
      ctaLabel: ctaLabel ?? null,
      ctaLink: ctaLink ?? null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
      actorId: guard.userId,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        TITLE_INVALID: 422,
        MEDIA_URL_INVALID: 422,
      };
      return apiError(result.error, statusMap[result.error.code] ?? 422);
    }

    return apiSuccess(result.data, { status: 201 });
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create banner" }, 500);
  }
}
