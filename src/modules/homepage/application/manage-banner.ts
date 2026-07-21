import type {
  HomepageBanner,
  HomepageResult,
  CreateBannerCommand,
  UpdateBannerCommand,
} from "../domain/homepage-entities";
import { isValidBannerTitle, isValidMediaUrl } from "../domain/homepage-invariants";
import type { HomepageRepository } from "../domain/homepage-repository";

export async function listAllBanners(repository: HomepageRepository): Promise<HomepageBanner[]> {
  return repository.listAllBanners();
}

export async function createBanner(
  repository: HomepageRepository,
  command: CreateBannerCommand,
): Promise<HomepageResult<HomepageBanner>> {
  if (!isValidBannerTitle(command.title)) {
    return {
      success: false,
      error: { code: "TITLE_INVALID", message: "Judul banner harus antara 2–200 karakter." },
    };
  }

  if (!isValidMediaUrl(command.mediaUrl)) {
    return {
      success: false,
      error: {
        code: "MEDIA_URL_INVALID",
        message: "URL media tidak valid. Harus berupa URL http/https yang valid.",
      },
    };
  }

  const banner = await repository.createBanner(command);
  return { success: true, data: banner };
}

export async function updateBanner(
  repository: HomepageRepository,
  command: UpdateBannerCommand,
): Promise<HomepageResult<HomepageBanner>> {
  const existing = await repository.findBannerById(command.bannerId);
  if (!existing) {
    return {
      success: false,
      error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." },
    };
  }

  if (command.title !== undefined && !isValidBannerTitle(command.title)) {
    return {
      success: false,
      error: { code: "TITLE_INVALID", message: "Judul banner harus antara 2–200 karakter." },
    };
  }

  if (command.mediaUrl !== undefined && !isValidMediaUrl(command.mediaUrl)) {
    return {
      success: false,
      error: {
        code: "MEDIA_URL_INVALID",
        message: "URL media tidak valid. Harus berupa URL http/https yang valid.",
      },
    };
  }

  const banner = await repository.updateBanner(command);
  return { success: true, data: banner };
}

export async function deleteBanner(
  repository: HomepageRepository,
  bannerId: string,
  actorId: string,
): Promise<HomepageResult<void>> {
  const existing = await repository.findBannerById(bannerId);
  if (!existing) {
    return {
      success: false,
      error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." },
    };
  }

  await repository.softDeleteBanner(bannerId, actorId);
  return { success: true, data: undefined };
}
