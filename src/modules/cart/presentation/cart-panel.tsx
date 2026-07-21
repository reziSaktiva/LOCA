"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

import { CartItemRow, type CartItemRowData } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

export type CartPanelData = {
  cartId: string;
  items: CartItemRowData[];
  subtotal: number;
  itemCount: number;
};

export type CartPanelProps = {
  cart: CartPanelData;
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export function CartPanel({ cart }: CartPanelProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateQuantity(itemId: string, quantity: number) {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (response.status === 401) {
        router.push("/login?next=/cart");
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Gagal mengubah jumlah.");
        return;
      }

      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function removeItem(itemId: string) {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/login?next=/cart");
        return;
      }

      if (!response.ok && response.status !== 204) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Gagal menghapus item.");
        return;
      }

      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center"
      >
        <h2 className="font-heading text-xl font-semibold text-foreground">Keranjang masih kosong</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Belum ada produk di keranjang. Jelajahi katalog dan tambahkan item favoritmu.
        </p>
        <Button nativeButton={false} render={<Link href="/products" />}>
          Lihat katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
      <section aria-label="Item keranjang" className="min-w-0">
        {error ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <ul className="flex flex-col">
          {cart.items.map((item) => (
            <li key={item.itemId}>
              <CartItemRow
                item={item}
                pending={pending}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            </li>
          ))}
        </ul>
      </section>

      <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
    </div>
  );
}
