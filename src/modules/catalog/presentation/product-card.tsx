import Image from "next/image";
import Link from "next/link";

import type { PublicProductCard } from "@/modules/catalog/public/catalog-public-service";
import { cn } from "@/shared/ui/utils";

import { PriceDisplay } from "./price-display";

export type ProductCardProps = {
  product: PublicProductCard;
  className?: string;
};

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function ProductThumbnail({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden
        className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground"
      >
        LOCA
      </div>
    );
  }

  if (isRemoteUrl(src)) {
    return (
      // Remote media URL dari admin (host bervariasi) — next/image butuh remotePatterns per host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <article className={cn("group flex flex-col gap-2", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <ProductThumbnail src={product.thumbnailUrl} alt={product.name} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-brand-accent">
            {product.name}
          </h3>
          <PriceDisplay priceFrom={product.priceFrom} priceTo={product.priceTo} />
        </div>
      </Link>
    </article>
  );
}
