import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import { listPublicCategoriesForCatalog } from "@/modules/catalog/public/catalog-public-service";

export async function GET() {
  try {
    const categories = await listPublicCategoriesForCatalog();
    return apiSuccess(categories);
  } catch {
    return apiError(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch product categories",
      },
      500,
    );
  }
}
