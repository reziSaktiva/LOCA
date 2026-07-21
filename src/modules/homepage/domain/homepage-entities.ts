export type HomepageBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  mediaUrl: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBannerCommand = {
  title: string;
  subtitle?: string | null;
  mediaUrl: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  actorId: string;
};

export type UpdateBannerCommand = {
  bannerId: string;
  title?: string;
  subtitle?: string | null;
  mediaUrl?: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  actorId: string;
};

export type HomepageError =
  | { code: "BANNER_NOT_FOUND"; message: string }
  | { code: "TITLE_INVALID"; message: string }
  | { code: "MEDIA_URL_INVALID"; message: string };

export type HomepageResult<T> =
  { success: true; data: T } | { success: false; error: HomepageError };
