import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import { searchPublicProductsFromSearchParams } from "@/modules/catalog/public/catalog-public-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await searchPublicProductsFromSearchParams(searchParams);

    if (!result.success) {
      return apiError({ code: result.error.code, message: result.error.message }, 400);
    }

    return apiSuccess(result);
  } catch {
    return apiError(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to search products",
      },
      500,
    );
  }
}
