import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export default function OrderNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Pesanan tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Pesanan mungkin tidak ada atau bukan milik akun ini. Periksa kembali riwayat pesananmu.
      </p>
      <Button nativeButton={false} render={<Link href="/orders" />}>
        Lihat riwayat pesanan
      </Button>
    </Container>
  );
}
