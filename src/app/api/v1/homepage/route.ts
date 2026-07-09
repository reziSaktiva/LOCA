import { apiError, apiSuccess } from "@/shared/kernel/api-response";
import { homepageGetData } from "@/modules/homepage/public/homepage-service";

export async function GET() {
  try {
    const data = await homepageGetData();
    return apiSuccess(data);
  } catch {
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to fetch homepage data" }, 500);
  }
}
