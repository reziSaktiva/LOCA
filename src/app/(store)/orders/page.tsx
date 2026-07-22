import { redirect } from "next/navigation";

import { OrderEmptyState, OrderList, OrderListPagination } from "@/modules/order/presentation";
import { listCustomerOrders } from "@/modules/order/public/order-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { Container } from "@/shared/ui/container";

export const metadata = {
  title: "Pesanan Saya — LOCA",
  description: "Lihat riwayat dan status pesanan kamu di LOCA.",
};

type OrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    redirect("/login?next=/orders");
  }

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam);

  const result = await listCustomerOrders(guard.userId, {
    page: Number.isFinite(page) && page > 0 ? page : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  if (result.items.length === 0 && result.total > 0 && result.page > totalPages) {
    redirect(totalPages > 1 ? `/orders?page=${totalPages}` : "/orders");
  }

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Pesanan Saya
        </h1>
        <p className="text-sm text-muted-foreground">
          {result.total > 0
            ? `${result.total} pesanan tercatat di akun ini.`
            : "Riwayat pesanan kamu akan muncul di sini."}
        </p>
      </header>

      {result.items.length === 0 ? (
        <OrderEmptyState
          title="Belum ada pesanan"
          description="Kamu belum pernah membeli produk LOCA. Jelajahi katalog dan mulai belanja."
          actionLabel="Lihat katalog"
          actionHref="/products"
        />
      ) : (
        <>
          <OrderList
            orders={result.items.map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              createdAt: order.createdAt,
              orderStatus: order.orderStatus,
              grandTotal: order.grandTotal,
              shippingCity: order.shippingCity,
              shippingProvince: order.shippingProvince,
            }))}
          />
          <OrderListPagination page={result.page} totalPages={totalPages} />
        </>
      )}
    </Container>
  );
}
