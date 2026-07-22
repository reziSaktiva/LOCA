"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export type ProfileFormValues = {
  displayName: string;
  phone: string;
};

export type ProfileFormProps = {
  email: string;
  initialValues: ProfileFormValues;
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export function ProfileForm({ email, initialValues }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialValues.displayName);
  const [phone, setPhone] = useState(initialValues.phone);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/v1/customers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          phone: phone.trim(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error?.message ?? "Gagal menyimpan profil.");
        return;
      }

      setSuccess("Profil berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-email" className="text-xs font-medium text-muted-foreground">
          Email
        </label>
        <Input id="profile-email" type="email" value={email} disabled readOnly />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-display-name" className="text-xs font-medium text-muted-foreground">
          Nama tampilan
        </label>
        <Input
          id="profile-display-name"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          disabled={pending}
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-phone" className="text-xs font-medium text-muted-foreground">
          Nomor telepon
        </label>
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder="08xxxxxxxxxx"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={pending}
          aria-invalid={Boolean(error)}
        />
        <p className="text-xs text-muted-foreground">Format: 08xxxx, +62xxxx, atau 62xxxx.</p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-success">
          {success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Menyimpan…" : "Simpan profil"}
      </Button>
    </form>
  );
}
