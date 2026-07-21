"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

export type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("Logout gagal. Coba lagi.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? "Keluar…" : "Keluar"}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
