"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/ui/utils";

export type SearchFormProps = {
  initialQuery?: string;
  className?: string;
  /** Debounce navigasi otomatis saat mengetik (ms). 0 = hanya submit manual. */
  debounceMs?: number;
};

export function SearchForm({
  initialQuery = "",
  className,
  debounceMs = 400,
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const lastNavigatedQuery = useRef(initialQuery.trim());

  useEffect(() => {
    if (debounceMs <= 0) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed === lastNavigatedQuery.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastNavigatedQuery.current = trimmed;
      startTransition(() => {
        if (!trimmed) {
          router.replace("/search");
          return;
        }
        router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
      });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [query, debounceMs, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    lastNavigatedQuery.current = trimmed;
    startTransition(() => {
      if (!trimmed) {
        router.push("/search");
        return;
      }
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-end", className)}
      role="search"
      aria-label="Cari produk"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor="catalog-search-q" className="text-xs font-medium text-muted-foreground">
          Kata kunci
        </label>
        <Input
          id="catalog-search-q"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, brand, atau deskripsi…"
          autoComplete="off"
          aria-busy={isPending}
        />
      </div>
      <Button type="submit" size="default" disabled={isPending} className="sm:mb-0">
        Cari
      </Button>
    </form>
  );
}
