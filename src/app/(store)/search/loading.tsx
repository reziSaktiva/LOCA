import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";

export default function SearchLoading() {
  return (
    <Container
      className="flex flex-col gap-8 py-8 md:py-12"
      aria-busy="true"
      aria-label="Memuat hasil pencarian"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Container>
  );
}
