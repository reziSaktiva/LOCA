import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Produk tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Produk mungkin sudah diarsipkan atau URL tidak valid. Silakan kembali ke katalog.
      </p>
      <Button nativeButton={false} render={<Link href="/products" />}>
        Lihat katalog
      </Button>
    </Container>
  );
}
