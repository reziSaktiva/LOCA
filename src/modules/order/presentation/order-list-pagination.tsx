import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";

export type OrderListPaginationProps = {
  page: number;
  totalPages: number;
};

function buildPageHref(page: number): string {
  return page <= 1 ? "/orders" : `/orders?page=${page}`;
}

function pageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
    previous = page;
  }
  return result;
}

export function OrderListPagination({ page, totalPages }: OrderListPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = pageWindow(page, totalPages);

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? buildPageHref(page - 1) : undefined}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            text="Sebelumnya"
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={buildPageHref(item)} isActive={item === page}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? buildPageHref(page + 1) : undefined}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            text="Berikutnya"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
