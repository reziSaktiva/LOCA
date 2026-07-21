import Link from "next/link";

import { Container } from "@/shared/ui/container";
import { Separator } from "@/shared/ui/separator";

const QUICK_LINKS = [
  { name: "Produk", href: "/products" },
  { name: "Cari", href: "/search" },
  { name: "Akun", href: "/account" },
  { name: "Keranjang", href: "/cart" },
] as const;

const INFO_LINKS = [
  { name: "Tentang LOCA", href: "/#about" },
  { name: "FAQ", href: "/#faq" },
  { name: "Pengiriman", href: "/#shipping" },
  { name: "Pengembalian", href: "/#returns" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-lg font-bold tracking-tight">LOCA</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Simple. Comfortable. Confident. Sports apparel essentials untuk generasi yang bergerak.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Navigasi</p>
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold text-foreground">Info</p>
          <ul className="flex flex-col gap-2">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-sm text-muted-foreground">
            Ikuti kami: Instagram · TikTok · Shopee
          </p>
        </div>
      </Container>

      <Separator />
      <Container className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">© {year} LOCA. All rights reserved.</p>
        <p className="text-xs text-muted-foreground">Lifestyle Movement</p>
      </Container>
    </footer>
  );
}
