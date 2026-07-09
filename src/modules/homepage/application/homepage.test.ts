import { describe, expect, it } from "vitest";
import type { HomepageBanner } from "../domain/homepage-entities";
import type { HomepageRepository } from "../domain/homepage-repository";
import { isValidBannerTitle, isValidMediaUrl } from "../domain/homepage-invariants";
import { createBanner, deleteBanner, listAllBanners, updateBanner } from "./manage-banner";
import { getHomepageData, type HomepageCatalogPort } from "./get-homepage-data";
import type { PublicProductCard } from "../../catalog/public/catalog-public-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBanner(override: Partial<HomepageBanner> = {}): HomepageBanner {
  return {
    id: "banner-1",
    title: "Summer Sale",
    subtitle: "Up to 50% off",
    mediaUrl: "https://cdn.example.com/banner.jpg",
    ctaLabel: "Shop Now",
    ctaLink: "/products",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeProductCard(id: string): PublicProductCard {
  return {
    id,
    name: `Product ${id}`,
    slug: `product-${id}`,
    categoryId: "cat-1",
    priceFrom: 100000,
    priceTo: 150000,
    thumbnailUrl: `https://cdn.example.com/${id}.jpg`,
  };
}

function makeRepository(banners: HomepageBanner[] = []): HomepageRepository {
  const store = [...banners];

  return {
    async listActiveBanners() {
      return store.filter((b) => b.isActive);
    },
    async listAllBanners() {
      return [...store];
    },
    async findBannerById(id) {
      return store.find((b) => b.id === id) ?? null;
    },
    async createBanner(command) {
      const banner: HomepageBanner = {
        id: `banner-${store.length + 1}`,
        title: command.title,
        subtitle: command.subtitle ?? null,
        mediaUrl: command.mediaUrl,
        ctaLabel: command.ctaLabel ?? null,
        ctaLink: command.ctaLink ?? null,
        displayOrder: command.displayOrder ?? 0,
        isActive: command.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.push(banner);
      return banner;
    },
    async updateBanner(command) {
      const idx = store.findIndex((b) => b.id === command.bannerId);
      if (idx < 0) throw new Error("Banner not found");
      const updated: HomepageBanner = {
        ...store[idx],
        title: command.title ?? store[idx].title,
        subtitle: command.subtitle !== undefined ? command.subtitle : store[idx].subtitle,
        mediaUrl: command.mediaUrl ?? store[idx].mediaUrl,
        ctaLabel: command.ctaLabel !== undefined ? command.ctaLabel : store[idx].ctaLabel,
        ctaLink: command.ctaLink !== undefined ? command.ctaLink : store[idx].ctaLink,
        displayOrder: command.displayOrder ?? store[idx].displayOrder,
        isActive: command.isActive ?? store[idx].isActive,
        updatedAt: new Date(),
      };
      store[idx] = updated;
      return updated;
    },
    async softDeleteBanner(id) {
      const idx = store.findIndex((b) => b.id === id);
      if (idx >= 0) store.splice(idx, 1);
    },
  };
}

function makeCatalogPort(cards: PublicProductCard[] = []): HomepageCatalogPort {
  return {
    async getFeaturedProducts(limit) {
      return cards.slice(0, limit);
    },
    async getNewArrivals(limit) {
      return cards.slice(0, limit);
    },
    async getBestSellers(limit) {
      return cards.slice(0, limit);
    },
  };
}

// ---------------------------------------------------------------------------
// Invariant tests
// ---------------------------------------------------------------------------

describe("isValidBannerTitle", () => {
  it("accepts valid titles", () => {
    expect(isValidBannerTitle("Summer Sale")).toBe(true);
    expect(isValidBannerTitle("AB")).toBe(true);
    expect(isValidBannerTitle("A".repeat(200))).toBe(true);
  });

  it("rejects too short or empty", () => {
    expect(isValidBannerTitle("A")).toBe(false);
    expect(isValidBannerTitle("")).toBe(false);
    expect(isValidBannerTitle("  ")).toBe(false);
  });

  it("rejects too long (>200 chars)", () => {
    expect(isValidBannerTitle("A".repeat(201))).toBe(false);
  });
});

describe("isValidMediaUrl", () => {
  it("accepts valid https/http URLs", () => {
    expect(isValidMediaUrl("https://cdn.example.com/banner.jpg")).toBe(true);
    expect(isValidMediaUrl("http://cdn.example.com/banner.jpg")).toBe(true);
  });

  it("rejects empty or non-URL strings", () => {
    expect(isValidMediaUrl("")).toBe(false);
    expect(isValidMediaUrl("not-a-url")).toBe(false);
    expect(isValidMediaUrl("/relative/path.jpg")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// manage-banner tests
// ---------------------------------------------------------------------------

describe("createBanner", () => {
  it("creates banner with valid data", async () => {
    const repo = makeRepository();
    const result = await createBanner(repo, {
      title: "Summer Sale",
      mediaUrl: "https://cdn.example.com/banner.jpg",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Summer Sale");
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects invalid title", async () => {
    const repo = makeRepository();
    const result = await createBanner(repo, {
      title: "A",
      mediaUrl: "https://cdn.example.com/banner.jpg",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("TITLE_INVALID");
  });

  it("rejects invalid mediaUrl", async () => {
    const repo = makeRepository();
    const result = await createBanner(repo, {
      title: "Valid Title",
      mediaUrl: "not-a-url",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("MEDIA_URL_INVALID");
  });
});

describe("updateBanner", () => {
  it("updates existing banner", async () => {
    const repo = makeRepository([makeBanner()]);
    const result = await updateBanner(repo, {
      bannerId: "banner-1",
      title: "New Title",
      actorId: "admin-1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("New Title");
  });

  it("returns BANNER_NOT_FOUND for unknown banner", async () => {
    const repo = makeRepository();
    const result = await updateBanner(repo, {
      bannerId: "nonexistent",
      title: "Any",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("BANNER_NOT_FOUND");
  });

  it("rejects invalid title on update", async () => {
    const repo = makeRepository([makeBanner()]);
    const result = await updateBanner(repo, {
      bannerId: "banner-1",
      title: "X",
      actorId: "admin-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("TITLE_INVALID");
  });
});

describe("deleteBanner", () => {
  it("deletes existing banner", async () => {
    const repo = makeRepository([makeBanner()]);
    const result = await deleteBanner(repo, "banner-1", "admin-1");
    expect(result.success).toBe(true);
    const all = await listAllBanners(repo);
    expect(all).toHaveLength(0);
  });

  it("returns BANNER_NOT_FOUND for unknown banner", async () => {
    const repo = makeRepository();
    const result = await deleteBanner(repo, "nonexistent", "admin-1");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("BANNER_NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// getHomepageData tests
// ---------------------------------------------------------------------------

describe("getHomepageData", () => {
  it("returns banners + product sections", async () => {
    const repo = makeRepository([makeBanner(), makeBanner({ id: "banner-2", isActive: false })]);
    const catalogPort = makeCatalogPort([makeProductCard("p1"), makeProductCard("p2")]);

    const data = await getHomepageData(repo, catalogPort);

    expect(data.banners).toHaveLength(1);
    expect(data.banners[0].id).toBe("banner-1");
    expect(data.featured).toHaveLength(2);
    expect(data.newArrivals).toHaveLength(2);
    expect(data.bestSellers).toHaveLength(2);
  });

  it("returns empty sections when no data", async () => {
    const repo = makeRepository();
    const catalogPort = makeCatalogPort();

    const data = await getHomepageData(repo, catalogPort);
    expect(data.banners).toHaveLength(0);
    expect(data.featured).toHaveLength(0);
    expect(data.newArrivals).toHaveLength(0);
    expect(data.bestSellers).toHaveLength(0);
  });
});
