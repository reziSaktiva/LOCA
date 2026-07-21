import Link from "next/link";

import type { HomepageBanner } from "@/modules/homepage/public/homepage-service";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { cn } from "@/shared/ui/utils";

export type HeroBannerProps = {
  banners: HomepageBanner[];
  className?: string;
};

function HeroMedia({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return <div aria-hidden className="absolute inset-0 bg-primary" />;
  }

  return (
    // Media URL dari admin — host tidak selalu terdaftar di next/image remotePatterns.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-cover"
      fetchPriority="high"
    />
  );
}

function FallbackHero({ className }: { className?: string }) {
  return (
    <section
      aria-label="Hero"
      className={cn(
        "relative overflow-hidden bg-primary text-primary-foreground",
        "bg-[radial-gradient(ellipse_at_top_right,oklch(0.47_0.23_265/0.35),transparent_55%),linear-gradient(160deg,#0A0A0A_0%,#171717_55%,#0A0A0A_100%)]",
        className,
      )}
    >
      <Container className="relative flex min-h-[min(70vh,36rem)] flex-col justify-end gap-4 py-12 md:min-h-112 md:py-16">
        <p className="font-heading text-5xl font-bold tracking-tight md:text-6xl">LOCA</p>
        <p className="max-w-md text-base text-primary-foreground/80 md:text-lg">
          Sports apparel essentials untuk gerakan harianmu.
        </p>
        <div>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Jelajahi koleksi
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function HeroBanner({ banners, className }: HeroBannerProps) {
  const banner = banners[0];

  if (!banner) {
    return <FallbackHero className={className} />;
  }

  const ctaHref = banner.ctaLink || "/products";
  const ctaLabel = banner.ctaLabel || "Jelajahi koleksi";

  return (
    <section aria-label="Hero" className={cn("relative overflow-hidden bg-primary", className)}>
      <div className="relative min-h-[min(70vh,36rem)] md:min-h-112">
        <HeroMedia src={banner.mediaUrl} alt={banner.title} />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20"
        />
        <Container className="relative flex min-h-[min(70vh,36rem)] flex-col justify-end gap-3 py-12 text-white md:min-h-112 md:gap-4 md:py-16">
          <p className="font-heading text-sm font-semibold tracking-[0.2em] text-white/80 uppercase">
            LOCA
          </p>
          <h1 className="max-w-2xl font-heading text-3xl font-bold tracking-tight md:text-5xl">
            {banner.title}
          </h1>
          {banner.subtitle ? (
            <p className="max-w-lg text-base text-white/85 md:text-lg">{banner.subtitle}</p>
          ) : null}
          <div>
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={<Link href={ctaHref} />}
            >
              {ctaLabel}
            </Button>
          </div>
        </Container>
      </div>
    </section>
  );
}
