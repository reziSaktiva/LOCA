import { listActiveProductsForHomepage } from "../../catalog/public/catalog-public-service";
import {
  createBanner,
  deleteBanner,
  listAllBanners,
  updateBanner,
} from "../application/manage-banner";
import {
  getHomepageData,
  HOMEPAGE_PRODUCT_LIMIT,
  type HomepageCatalogPort,
  type HomepageData,
} from "../application/get-homepage-data";
import type {
  HomepageBanner,
  HomepageResult,
  CreateBannerCommand,
  UpdateBannerCommand,
} from "../domain/homepage-entities";
import { PrismaHomepageRepository } from "../infrastructure/prisma-homepage-repository";

export type {
  HomepageBanner,
  HomepageError,
  HomepageResult,
  CreateBannerCommand,
  UpdateBannerCommand,
} from "../domain/homepage-entities";

export type { HomepageData } from "../application/get-homepage-data";

const repository = new PrismaHomepageRepository();

function makeCatalogPort(): HomepageCatalogPort {
  return {
    getFeaturedProducts: (limit) => listActiveProductsForHomepage(limit),
    getNewArrivals: (limit) => listActiveProductsForHomepage(limit),
    // Best seller fallback ke newest aktif sampai order module memberikan data penjualan.
    getBestSellers: (limit) => listActiveProductsForHomepage(limit),
  };
}

export async function homepageGetData(): Promise<HomepageData> {
  return getHomepageData(repository, makeCatalogPort());
}

export async function homepageListAllBanners(): Promise<HomepageBanner[]> {
  return listAllBanners(repository);
}

export async function homepageCreateBanner(
  command: CreateBannerCommand,
): Promise<HomepageResult<HomepageBanner>> {
  return createBanner(repository, command);
}

export async function homepageUpdateBanner(
  command: UpdateBannerCommand,
): Promise<HomepageResult<HomepageBanner>> {
  return updateBanner(repository, command);
}

export async function homepageDeleteBanner(
  bannerId: string,
  actorId: string,
): Promise<HomepageResult<void>> {
  return deleteBanner(repository, bannerId, actorId);
}

export { HOMEPAGE_PRODUCT_LIMIT };
