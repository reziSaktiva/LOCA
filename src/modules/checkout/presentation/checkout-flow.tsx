"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatIdr } from "@/shared/kernel/format-idr";
import { Button } from "@/shared/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/ui/utils";

import { CheckoutOrderSummary, type CheckoutOrderItemData } from "./checkout-order-summary";

export type CheckoutFlowShippingOption = {
  optionId: string;
  serviceName: string;
  estimatedDays: number | null;
  shippingFee: number;
};

export type CheckoutFlowPaymentMethod = {
  method: string;
  label: string;
};

export type CheckoutFlowSession = {
  selectedShippingOptionId: string | null;
  selectedPaymentMethod: string | null;
  itemsSubtotal: number;
  shippingFee: number;
  grandTotal: number;
};

export type CheckoutFlowProps = {
  session: CheckoutFlowSession;
  shippingOptions: CheckoutFlowShippingOption[];
  paymentMethods: CheckoutFlowPaymentMethod[];
  items: CheckoutOrderItemData[];
};

type ApiErrorBody = {
  error?: { message?: string };
};

type SelectionResponse = {
  data: {
    selectedShippingOptionId: string | null;
    selectedPaymentMethod: string | null;
    itemsSubtotal: number;
    shippingFee: number;
    grandTotal: number;
  };
};

type PlaceOrderResponse = {
  data: {
    orderId: string;
    snapshot: {
      grandTotal: number;
      address: { recipientName: string; city: string; province: string };
      shipping: { serviceName: string };
      payment: { label: string };
    };
  };
};

type PlacedOrder = {
  orderId: string;
  grandTotal: number;
  shippingServiceName: string;
  paymentLabel: string;
  recipientName: string;
  destination: string;
};

const LOGIN_REDIRECT = "/login?next=/checkout";

export function CheckoutFlow({ session, shippingOptions, paymentMethods, items }: CheckoutFlowProps) {
  const router = useRouter();
  const [current, setCurrent] = useState<CheckoutFlowSession>(session);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  async function selectShipping(optionId: string) {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/checkout/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (response.status === 401) {
        router.push(LOGIN_REDIRECT);
        return;
      }

      const body = (await response.json().catch(() => null)) as
        | SelectionResponse
        | ApiErrorBody
        | null;

      if (!response.ok) {
        setError((body as ApiErrorBody | null)?.error?.message ?? "Gagal memilih pengiriman.");
        return;
      }

      setCurrent((prev) => ({ ...prev, ...(body as SelectionResponse).data }));
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function selectPayment(method: string) {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/checkout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });

      if (response.status === 401) {
        router.push(LOGIN_REDIRECT);
        return;
      }

      const body = (await response.json().catch(() => null)) as
        | SelectionResponse
        | ApiErrorBody
        | null;

      if (!response.ok) {
        setError(
          (body as ApiErrorBody | null)?.error?.message ?? "Gagal memilih metode pembayaran.",
        );
        return;
      }

      setCurrent((prev) => ({ ...prev, ...(body as SelectionResponse).data }));
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function placeOrder() {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/checkout/place-order", { method: "POST" });

      if (response.status === 401) {
        router.push(LOGIN_REDIRECT);
        return;
      }

      const body = (await response.json().catch(() => null)) as
        | PlaceOrderResponse
        | ApiErrorBody
        | null;

      if (!response.ok) {
        setError((body as ApiErrorBody | null)?.error?.message ?? "Gagal membuat pesanan.");
        return;
      }

      const { data } = body as PlaceOrderResponse;
      setPlacedOrder({
        orderId: data.orderId,
        grandTotal: data.snapshot.grandTotal,
        shippingServiceName: data.snapshot.shipping.serviceName,
        paymentLabel: data.snapshot.payment.label,
        recipientName: data.snapshot.address.recipientName,
        destination: `${data.snapshot.address.city}, ${data.snapshot.address.province}`,
      });
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  if (placedOrder) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-xl border border-border px-6 py-12 text-center"
      >
        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          Pesanan berhasil dibuat
        </span>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Terima kasih!</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Pesanan kamu sudah kami terima dan menunggu pembayaran. Kami akan mengirim ke{" "}
          <span className="font-medium text-foreground">{placedOrder.recipientName}</span>,{" "}
          {placedOrder.destination}.
        </p>

        <dl className="flex w-full max-w-sm flex-col gap-2 rounded-lg border border-border p-4 text-left text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Nomor pesanan</dt>
            <dd className="font-medium text-foreground">{placedOrder.orderId}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Pengiriman</dt>
            <dd className="font-medium text-foreground">{placedOrder.shippingServiceName}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Pembayaran</dt>
            <dd className="font-medium text-foreground">{placedOrder.paymentLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
            <dt className="font-medium text-foreground">Total dibayar</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatIdr(placedOrder.grandTotal)}
            </dd>
          </div>
        </dl>

        <Button nativeButton={false} render={<Link href="/products" />}>
          Lanjut belanja
        </Button>
      </div>
    );
  }

  const canPlaceOrder = Boolean(current.selectedShippingOptionId) && Boolean(current.selectedPaymentMethod);

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-col gap-8">
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section aria-labelledby="shipping-heading" className="flex flex-col gap-3">
          <h2 id="shipping-heading" className="font-heading text-lg font-semibold text-foreground">
            Pilih pengiriman
          </h2>
          <RadioGroup
            value={current.selectedShippingOptionId ?? undefined}
            onValueChange={(value) => selectShipping(value as string)}
            className="flex flex-col gap-2"
          >
            {shippingOptions.map((option) => {
              const isSelected = option.optionId === current.selectedShippingOptionId;
              return (
                <label
                  key={option.optionId}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                    isSelected ? "border-primary" : "border-border",
                    pending && "opacity-60",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value={option.optionId} disabled={pending} />
                    <span className="flex flex-col">
                      <span className="font-medium text-foreground">{option.serviceName}</span>
                      <span className="text-sm text-muted-foreground">
                        {option.estimatedDays != null
                          ? `Estimasi ${option.estimatedDays} hari`
                          : "Estimasi tidak tersedia"}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                    {formatIdr(option.shippingFee)}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </section>

        <section aria-labelledby="payment-heading" className="flex flex-col gap-3">
          <h2 id="payment-heading" className="font-heading text-lg font-semibold text-foreground">
            Metode pembayaran
          </h2>
          <RadioGroup
            value={current.selectedPaymentMethod ?? undefined}
            onValueChange={(value) => selectPayment(value as string)}
            className="flex flex-col gap-2"
          >
            {paymentMethods.map((method) => {
              const isSelected = method.method === current.selectedPaymentMethod;
              return (
                <label
                  key={method.method}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                    isSelected ? "border-primary" : "border-border",
                    pending && "opacity-60",
                  )}
                >
                  <RadioGroupItem value={method.method} disabled={pending} />
                  <span className="font-medium text-foreground">{method.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <CheckoutOrderSummary
          items={items}
          itemsSubtotal={current.itemsSubtotal}
          shippingFee={current.selectedShippingOptionId ? current.shippingFee : null}
          grandTotal={current.grandTotal}
        />
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canPlaceOrder || pending}
          onClick={placeOrder}
        >
          {pending ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </div>
    </div>
  );
}
