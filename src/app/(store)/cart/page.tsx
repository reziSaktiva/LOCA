import { redirect } from "next/navigation";

import { CartPanel } from "@/modules/cart/presentation";
import { cartGetCustomerView } from "@/modules/cart/public/cart-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { Container } from "@/shared/ui/container";

export const metadata = {
  title: "Keranjang — LOCA",
  description: "Lihat dan kelola item di keranjang belanja LOCA.",
};

export default async function CartPage() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    redirect("/login?next=/cart");
  }

  const cart = await cartGetCustomerView(guard.userId);

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Keranjang
        </h1>
        <p className="text-sm text-muted-foreground">
          {cart.itemCount > 0
            ? `${cart.itemCount} item siap dicek ulang sebelum checkout.`
            : "Keranjang belanja kamu."}
        </p>
      </header>

      <CartPanel
        cart={{
          cartId: cart.cartId,
          items: cart.items.map((item) => ({
            itemId: item.itemId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            thumbnailUrl: item.thumbnailUrl,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineSubtotal: item.lineSubtotal,
          })),
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        }}
      />
    </Container>
  );
}
