import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Homepage placeholder (M6.6).
 * Konten penuh (banner + featured/new arrival/best seller) diisi di M6.7.
 */
export default function StoreHomePage() {
  return (
    <Container className="flex flex-col gap-10 py-8 md:py-12">
      <section aria-label="Hero" className="flex flex-col gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-56 w-full rounded-xl md:h-80" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </section>

      <section aria-label="Featured products" className="flex flex-col gap-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Homepage LOCA — konten katalog akan tersedia di milestone berikutnya.
      </p>
    </Container>
  );
}
