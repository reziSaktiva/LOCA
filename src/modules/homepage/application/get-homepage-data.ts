import type { PublicProductCard } from "../../catalog/public/catalog-public-service";
import type { HomepageBanner } from "../domain/homepage-entities";
import type { HomepageRepository } from "../domain/homepage-repository";

export const HOMEPAGE_PRODUCT_LIMIT = 8;

export type HomepageData = {
  banners: HomepageBanner[];
  featured: PublicProductCard[];
  newArrivals: PublicProductCard[];
  bestSellers: PublicProductCard[];
};

export type HomepageCatalogPort = {
  getFeaturedProducts(limit: number): Promise<PublicProductCard[]>;
  getNewArrivals(limit: number): Promise<PublicProductCard[]>;
  getBestSellers(limit: number): Promise<PublicProductCard[]>;
};

export async function getHomepageData(
  repository: HomepageRepository,
  catalogPort: HomepageCatalogPort,
): Promise<HomepageData> {
  const [banners, featured, newArrivals, bestSellers] = await Promise.all([
    repository.listActiveBanners(),
    catalogPort.getFeaturedProducts(HOMEPAGE_PRODUCT_LIMIT),
    catalogPort.getNewArrivals(HOMEPAGE_PRODUCT_LIMIT),
    catalogPort.getBestSellers(HOMEPAGE_PRODUCT_LIMIT),
  ]);

  return { banners, featured, newArrivals, bestSellers };
}
