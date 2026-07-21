"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { AddressCard, type AddressCardData } from "./address-card";
import { AddressForm, type AddressFormValues } from "./address-form";

export type AddressSectionProps = {
  initialAddresses: AddressCardData[];
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

type DialogMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; address: AddressCardData };

export function AddressSection({ initialAddresses }: AddressSectionProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogMode>({ type: "closed" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  function closeDialog() {
    setDialog({ type: "closed" });
    setError(null);
  }

  async function handleCreate(values: AddressFormValues) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/customers/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Gagal menambah alamat.");
        return;
      }

      closeDialog();
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(addressId: string, values: AddressFormValues) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Gagal mengubah alamat.");
        return;
      }

      closeDialog();
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!window.confirm("Hapus alamat ini?")) {
      return;
    }

    setPending(true);
    setListError(null);

    try {
      const response = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setListError(body?.error?.message ?? "Gagal menghapus alamat.");
        return;
      }

      router.refresh();
    } catch {
      setListError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleSetDefault(addressId: string) {
    setPending(true);
    setListError(null);

    try {
      const response = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setListError(body?.error?.message ?? "Gagal mengatur alamat utama.");
        return;
      }

      router.refresh();
    } catch {
      setListError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const dialogOpen = dialog.type !== "closed";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {initialAddresses.length > 0
            ? `${initialAddresses.length} alamat tersimpan`
            : "Belum ada alamat pengiriman."}
        </p>
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setDialog({ type: "create" });
          }}
          disabled={pending}
        >
          Tambah alamat
        </Button>
      </div>

      {listError ? (
        <p role="alert" className="text-sm text-destructive">
          {listError}
        </p>
      ) : null}

      {initialAddresses.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-dashed border-border px-6 py-10 text-center"
        >
          <p className="font-medium text-foreground">Belum ada alamat</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan alamat pengiriman untuk mempermudah checkout nanti.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {initialAddresses.map((address) => (
            <li key={address.id}>
              <AddressCard
                address={address}
                pending={pending}
                onEdit={(selected) => {
                  setError(null);
                  setDialog({ type: "edit", address: selected });
                }}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog.type === "edit" ? "Edit alamat" : "Tambah alamat"}
            </DialogTitle>
            <DialogDescription>
              Isi data pengiriman dengan lengkap agar pesanan dapat dikirim dengan benar.
            </DialogDescription>
          </DialogHeader>

          {dialog.type === "create" ? (
            <AddressForm
              submitLabel="Simpan alamat"
              pending={pending}
              error={error}
              onCancel={closeDialog}
              onSubmit={handleCreate}
            />
          ) : null}

          {dialog.type === "edit" ? (
            <AddressForm
              key={dialog.address.id}
              initialValues={{
                recipientName: dialog.address.recipientName,
                phone: dialog.address.phone,
                street: dialog.address.street,
                district: dialog.address.district,
                city: dialog.address.city,
                province: dialog.address.province,
                postalCode: dialog.address.postalCode,
                isDefault: dialog.address.isDefault,
              }}
              submitLabel="Simpan perubahan"
              pending={pending}
              error={error}
              onCancel={closeDialog}
              onSubmit={(values) => handleUpdate(dialog.address.id, values)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
