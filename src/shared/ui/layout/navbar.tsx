import Link from "next/link";
import { SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { NavbarMobileMenu, type NavCategoryLink } from "@/shared/ui/layout/navbar-mobile-menu";

export type NavbarProps = {
  categories: NavCategoryLink[];
  cartCount: number;
};

export function Navbar({ categories, cartCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <Container className="flex h-14 items-center justify-between gap-4 md:h-16">
        <div className="flex items-center gap-2">
          <NavbarMobileMenu categories={categories} cartCount={cartCount} />
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-xl"
          >
            LOCA
          </Link>
        </div>

        <nav aria-label="Kategori" className="hidden items-center gap-1 md:flex">
          {categories.map((category) => (
            <Link
              key={category.href + category.name}
              href={category.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href="/search" aria-label="Cari produk" />}
          >
            <SearchIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            nativeButton={false}
            render={
              <Link
                href="/cart"
                aria-label={`Keranjang${cartCount > 0 ? `, ${cartCount} item` : ""}`}
              />
            }
          >
            <ShoppingBagIcon />
            {cartCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-semibold text-brand-accent-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/account" aria-label="Akun" />}
          >
            <UserIcon />
          </Button>
        </div>
      </Container>
    </header>
  );
}
