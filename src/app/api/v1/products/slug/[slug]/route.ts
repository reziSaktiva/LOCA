import { apiError, apiSuccess } from "@/modules/catalog/presentation/api-response";
import { getPublicProductBySlug } from "@/modules/catalog/public/catalog-public-service";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const product = await getPublicProductBySlug(slug);

    if (!product) {
      return apiError({ code: "NOT_FOUND", message: "Product tidak ditemukan." }, 404);
    }

    return apiSuccess(product);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch product detail" }, 500);
  }
}
