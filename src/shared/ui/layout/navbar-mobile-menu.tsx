"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

export type NavCategoryLink = {
  name: string;
  href: string;
};

type NavbarMobileMenuProps = {
  categories: NavCategoryLink[];
  cartCount: number;
};

export function NavbarMobileMenu({ categories, cartCount }: NavbarMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Buka menu navigasi"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)]">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg font-bold tracking-tight">LOCA</SheetTitle>
        </SheetHeader>
        <nav aria-label="Menu mobile" className="flex flex-col gap-1 px-4 pb-6">
          <SheetClose
            render={
              <Link
                href="/products"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Semua Produk
          </SheetClose>
          {categories.map((category) => (
            <SheetClose
              key={category.href}
              render={
                <Link
                  href={category.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                />
              }
            >
              {category.name}
            </SheetClose>
          ))}
          <div className="my-2 h-px bg-border" />
          <SheetClose
            render={
              <Link
                href="/search"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Cari
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/cart"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Keranjang{cartCount > 0 ? ` (${cartCount})` : ""}
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/account"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Akun
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/login"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Masuk
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
