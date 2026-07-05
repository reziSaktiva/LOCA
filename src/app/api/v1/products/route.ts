import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import { listPublicProductsFromSearchParams } from "@/modules/catalog/public/catalog-public-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listPublicProductsFromSearchParams(searchParams);

    return apiSuccess(result);
  } catch {
    return apiError(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch product listing",
      },
      500,
    );
  }
}
