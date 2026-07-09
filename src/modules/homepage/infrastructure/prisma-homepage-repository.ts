import type { HomepageBanner as PrismaBanner } from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type {
  HomepageBanner,
  CreateBannerCommand,
  UpdateBannerCommand,
} from "../domain/homepage-entities";
import type { HomepageRepository } from "../domain/homepage-repository";

function toBanner(row: PrismaBanner): HomepageBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    mediaUrl: row.mediaUrl,
    ctaLabel: row.ctaLabel,
    ctaLink: row.ctaLink,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaHomepageRepository implements HomepageRepository {
  async listActiveBanners(): Promise<HomepageBanner[]> {
    const rows = await prisma.homepageBanner.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map(toBanner);
  }

  async listAllBanners(): Promise<HomepageBanner[]> {
    const rows = await prisma.homepageBanner.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: "asc" },
    });
    return rows.map(toBanner);
  }

  async findBannerById(id: string): Promise<HomepageBanner | null> {
    const row = await prisma.homepageBanner.findFirst({
      where: { id, isDeleted: false },
    });
    return row ? toBanner(row) : null;
  }

  async createBanner(command: CreateBannerCommand): Promise<HomepageBanner> {
    const row = await prisma.homepageBanner.create({
      data: {
        title: command.title,
        subtitle: command.subtitle ?? null,
        mediaUrl: command.mediaUrl,
        ctaLabel: command.ctaLabel ?? null,
        ctaLink: command.ctaLink ?? null,
        displayOrder: command.displayOrder ?? 0,
        isActive: command.isActive ?? true,
        createdBy: command.actorId,
        updatedBy: command.actorId,
      },
    });
    return toBanner(row);
  }

  async updateBanner(command: UpdateBannerCommand): Promise<HomepageBanner> {
    const row = await prisma.homepageBanner.update({
      where: { id: command.bannerId },
      data: {
        ...(command.title !== undefined && { title: command.title }),
        ...(command.subtitle !== undefined && { subtitle: command.subtitle }),
        ...(command.mediaUrl !== undefined && { mediaUrl: command.mediaUrl }),
        ...(command.ctaLabel !== undefined && { ctaLabel: command.ctaLabel }),
        ...(command.ctaLink !== undefined && { ctaLink: command.ctaLink }),
        ...(command.displayOrder !== undefined && { displayOrder: command.displayOrder }),
        ...(command.isActive !== undefined && { isActive: command.isActive }),
        updatedBy: command.actorId,
      },
    });
    return toBanner(row);
  }

  async softDeleteBanner(id: string, actorId: string): Promise<void> {
    await prisma.homepageBanner.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    });
  }
}
