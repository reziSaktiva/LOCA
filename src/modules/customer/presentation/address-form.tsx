"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export type AddressFormValues = {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export type AddressFormProps = {
  initialValues?: AddressFormValues;
  submitLabel: string;
  pending?: boolean;
  error?: string | null;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

const EMPTY_VALUES: AddressFormValues = {
  recipientName: "",
  phone: "",
  street: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export function AddressForm({
  initialValues = EMPTY_VALUES,
  submitLabel,
  pending = false,
  error = null,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>(initialValues);

  function updateField<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    await onSubmit({
      ...values,
      recipientName: values.recipientName.trim(),
      phone: values.phone.trim(),
      street: values.street.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
      province: values.province.trim(),
      postalCode: values.postalCode.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address-recipient" className="text-xs font-medium text-muted-foreground">
          Nama penerima
        </label>
        <Input
          id="address-recipient"
          required
          value={values.recipientName}
          onChange={(event) => updateField("recipientName", event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address-phone" className="text-xs font-medium text-muted-foreground">
          Telepon
        </label>
        <Input
          id="address-phone"
          type="tel"
          inputMode="tel"
          required
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address-street" className="text-xs font-medium text-muted-foreground">
          Alamat lengkap
        </label>
        <Textarea
          id="address-street"
          required
          rows={3}
          value={values.street}
          onChange={(event) => updateField("street", event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address-district" className="text-xs font-medium text-muted-foreground">
            Kecamatan
          </label>
          <Input
            id="address-district"
            required
            value={values.district}
            onChange={(event) => updateField("district", event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address-city" className="text-xs font-medium text-muted-foreground">
            Kota/Kabupaten
          </label>
          <Input
            id="address-city"
            required
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address-province" className="text-xs font-medium text-muted-foreground">
            Provinsi
          </label>
          <Input
            id="address-province"
            required
            value={values.province}
            onChange={(event) => updateField("province", event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address-postal" className="text-xs font-medium text-muted-foreground">
            Kode pos
          </label>
          <Input
            id="address-postal"
            required
            inputMode="numeric"
            value={values.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={values.isDefault}
          onCheckedChange={(checked) => updateField("isDefault", checked === true)}
          disabled={pending}
        />
        Jadikan alamat utama
      </label>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Batal
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
