import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";

export default function StoreLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman">
      <Skeleton className="h-[min(70vh,36rem)] w-full rounded-none md:h-[28rem]" />
      <Container className="flex flex-col gap-10 py-10 md:py-14">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
