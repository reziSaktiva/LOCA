"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export type AddressCardData = {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export type AddressCardProps = {
  address: AddressCardData;
  pending?: boolean;
  onEdit: (address: AddressCardData) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
};

export function AddressCard({
  address,
  pending = false,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground">{address.recipientName}</h3>
          <p className="text-sm text-muted-foreground">{address.phone}</p>
        </div>
        {address.isDefault ? <Badge variant="secondary">Utama</Badge> : null}
      </div>

      <p className="text-sm text-foreground">
        {address.street}
        <br />
        {address.district}, {address.city}
        <br />
        {address.province} {address.postalCode}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onEdit(address)}
        >
          Edit
        </Button>
        {!address.isDefault ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onSetDefault(address.id)}
          >
            Jadikan utama
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => onDelete(address.id)}
        >
          Hapus
        </Button>
      </div>
    </article>
  );
}
