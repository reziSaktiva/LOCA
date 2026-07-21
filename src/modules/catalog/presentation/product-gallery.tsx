"use client";

import { useState } from "react";

import type { PublicProductDetailMedia } from "@/modules/catalog/public/catalog-public-service";
import { cn } from "@/shared/ui/utils";

export type ProductGalleryProps = {
  media: PublicProductDetailMedia[];
  productName: string;
  className?: string;
};

function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex size-full items-center justify-center bg-muted text-sm text-muted-foreground",
          className,
        )}
      >
        LOCA
      </div>
    );
  }

  return (
    // Media URL dari admin — host bervariasi.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("size-full object-cover", className)} />
  );
}

export function ProductGallery({ media, productName, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = media.length > 0 ? media : [];
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground",
          className,
        )}
      >
        Tidak ada gambar
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <GalleryImage
          src={active.url}
          alt={active.altText || productName}
          className="transition-opacity duration-200"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex list-none gap-2 overflow-x-auto pb-1" aria-label="Galeri produk">
          {images.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Lihat gambar ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === activeIndex
                    ? "border-brand-accent"
                    : "border-transparent hover:border-border",
                )}
              >
                <GalleryImage src={item.url} alt={item.altText || `${productName} ${index + 1}`} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
