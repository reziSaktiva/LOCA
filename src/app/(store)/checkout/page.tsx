import { redirect } from "next/navigation";

import {
  CheckoutAddressSummary,
  CheckoutEmptyState,
  CheckoutFlow,
} from "@/modules/checkout/presentation";
import { checkoutPrepare } from "@/modules/checkout/public/checkout-service";
import { cartGetCustomerView } from "@/modules/cart/public/cart-service";
import { customerListAddresses } from "@/modules/customer/public/customer-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { Container } from "@/shared/ui/container";

export const metadata = {
  title: "Checkout — LOCA",
  description: "Selesaikan pesananmu — pilih pengiriman, metode bayar, dan buat pesanan.",
};

export default async function CheckoutPage() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    redirect("/login?next=/checkout");
  }

  const prepareResult = await checkoutPrepare(guard.userId);

  if (!prepareResult.success) {
    const emptyState =
      prepareResult.error.code === "CART_EMPTY" ? (
        <CheckoutEmptyState
          title="Keranjang masih kosong"
          description="Belum ada produk untuk di-checkout. Jelajahi katalog dan tambahkan item favoritmu."
          actionLabel="Lihat katalog"
          actionHref="/products"
        />
      ) : prepareResult.error.code === "ADDRESS_REQUIRED" ? (
        <CheckoutEmptyState
          title="Belum ada alamat pengiriman"
          description="Tambahkan alamat pengiriman terlebih dahulu di halaman akun sebelum melanjutkan checkout."
          actionLabel="Tambah alamat"
          actionHref="/account"
        />
      ) : (
        <CheckoutEmptyState
          title="Checkout belum bisa dilanjutkan"
          description={prepareResult.error.message}
          actionLabel="Kembali ke keranjang"
          actionHref="/cart"
        />
      );

    return (
      <Container className="flex flex-col gap-8 py-8 md:py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
        </header>
        {emptyState}
      </Container>
    );
  }

  const { session, shippingOptions, paymentMethods } = prepareResult.data;

  const [addresses, cart] = await Promise.all([
    customerListAddresses(guard.userId),
    cartGetCustomerView(guard.userId),
  ]);

  const selectedAddress = addresses.find((address) => address.id === session.selectedAddressId);

  if (!selectedAddress) {
    return (
      <Container className="flex flex-col gap-8 py-8 md:py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
        </header>
        <CheckoutEmptyState
          title="Alamat pengiriman tidak ditemukan"
          description="Alamat yang digunakan sesi checkout tidak lagi tersedia. Perbarui alamat di halaman akun lalu coba lagi."
          actionLabel="Kelola alamat"
          actionHref="/account"
        />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Checkout
        </h1>
        <p className="text-sm text-muted-foreground">
          Selesaikan pesanan — periksa alamat, pilih pengiriman, dan metode pembayaran.
        </p>
      </header>

      <section aria-labelledby="address-heading" className="flex flex-col gap-3">
        <h2 id="address-heading" className="font-heading text-lg font-semibold text-foreground">
          Alamat pengiriman
        </h2>
        <CheckoutAddressSummary
          address={{
            recipientName: selectedAddress.recipientName,
            phone: selectedAddress.phone,
            street: selectedAddress.street,
            district: selectedAddress.district,
            city: selectedAddress.city,
            province: selectedAddress.province,
            postalCode: selectedAddress.postalCode,
            isDefault: selectedAddress.isDefault,
          }}
        />
      </section>

      <CheckoutFlow
        session={{
          selectedShippingOptionId: session.selectedShippingOptionId,
          selectedPaymentMethod: session.selectedPaymentMethod,
          itemsSubtotal: session.itemsSubtotal,
          shippingFee: session.shippingFee,
          grandTotal: session.grandTotal,
        }}
        shippingOptions={shippingOptions.map((option) => ({
          optionId: option.optionId,
          serviceName: option.serviceName,
          estimatedDays: option.estimatedDays,
          shippingFee: option.shippingFee,
        }))}
        paymentMethods={paymentMethods.map((method) => ({
          method: method.method,
          label: method.label,
        }))}
        items={cart.items.map((item) => ({
          itemId: item.itemId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
          lineSubtotal: item.lineSubtotal,
        }))}
      />
    </Container>
  );
}
