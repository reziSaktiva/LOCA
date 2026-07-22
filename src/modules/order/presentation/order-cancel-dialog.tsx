"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export type OrderCancelDialogProps = {
  orderId: string;
};

type ApiErrorBody = {
  error?: { message?: string };
};

export function OrderCancelDialog({ orderId }: OrderCancelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, { method: "POST" });

      if (response.status === 401) {
        router.push(`/login?next=/orders/${orderId}`);
        return;
      }

      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Gagal membatalkan pesanan.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>Batalkan Pesanan</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan pesanan ini?</DialogTitle>
          <DialogDescription>
            Stok yang sudah dipesan akan dilepas kembali. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={pending} />}>Kembali</DialogClose>
          <Button variant="destructive" disabled={pending} onClick={handleCancel}>
            {pending ? "Membatalkan..." : "Ya, batalkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
