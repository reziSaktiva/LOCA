import type { HomepageBanner, CreateBannerCommand, UpdateBannerCommand } from "./homepage-entities";

export interface HomepageRepository {
  listActiveBanners(): Promise<HomepageBanner[]>;
  listAllBanners(): Promise<HomepageBanner[]>;
  findBannerById(id: string): Promise<HomepageBanner | null>;
  createBanner(command: CreateBannerCommand): Promise<HomepageBanner>;
  updateBanner(command: UpdateBannerCommand): Promise<HomepageBanner>;
  softDeleteBanner(id: string, actorId: string): Promise<void>;
}
