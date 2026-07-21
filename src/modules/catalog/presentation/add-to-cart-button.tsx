"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

export type AddToCartButtonProps = {
  variantId: string | null;
  productSlug: string;
  disabled?: boolean;
  quantity?: number;
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export function AddToCartButton({
  variantId,
  productSlug,
  disabled = false,
  quantity = 1,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    if (!variantId || pending) {
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/products/${productSlug}`)}`);
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setMessage(body?.error?.message ?? "Gagal menambahkan ke keranjang.");
        return;
      }

      setMessage("Ditambahkan ke keranjang.");
      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        disabled={disabled || !variantId || pending}
        onClick={handleAdd}
      >
        {pending ? "Menambahkan…" : "Tambah ke keranjang"}
      </Button>
      {message ? (
        <p
          role="status"
          className={
            message.includes("Ditambahkan")
              ? "text-sm text-success"
              : "text-sm text-destructive"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
