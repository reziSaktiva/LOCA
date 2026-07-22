import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/modules/auth/presentation";
import { AddressSection, ProfileForm, type AddressCardData } from "@/modules/customer/presentation";
import {
  customerGetProfile,
  customerListAddresses,
} from "@/modules/customer/public/customer-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export const metadata = {
  title: "Akun — LOCA",
  description: "Kelola profil dan alamat pengiriman akun LOCA.",
};

export default async function AccountPage() {
  const guard = await requireCustomer();
  if (!guard.authorized) {
    redirect("/login?next=/account");
  }

  const [profileResult, addresses] = await Promise.all([
    customerGetProfile(guard.userId),
    customerListAddresses(guard.userId),
  ]);

  const profileValues = profileResult.success
    ? {
        displayName: profileResult.data.displayName,
        phone: profileResult.data.phone,
      }
    : { displayName: "", phone: "" };

  const addressCards: AddressCardData[] = addresses.map((address) => ({
    id: address.id,
    recipientName: address.recipientName,
    phone: address.phone,
    street: address.street,
    district: address.district,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  }));

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Akun
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola profil dan alamat pengiriman untuk pengalaman belanja yang lebih mudah.
          </p>
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/orders" />}>
          Pesanan Saya
        </Button>
      </header>

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="addresses">Alamat</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex flex-col gap-8">
          <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
            <h2 id="profile-heading" className="font-heading text-lg font-semibold text-foreground">
              Profil
            </h2>
            <ProfileForm email={guard.email} initialValues={profileValues} />
          </section>

          <Separator />

          <section aria-labelledby="logout-heading" className="flex flex-col gap-3">
            <h2 id="logout-heading" className="font-heading text-lg font-semibold text-foreground">
              Sesi
            </h2>
            <p className="text-sm text-muted-foreground">
              Keluar dari akun ini di perangkat yang sedang dipakai.
            </p>
            <LogoutButton />
          </section>
        </TabsContent>

        <TabsContent value="addresses">
          <section aria-labelledby="addresses-heading" className="flex flex-col gap-4">
            <h2
              id="addresses-heading"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Alamat pengiriman
            </h2>
            <AddressSection initialAddresses={addressCards} />
          </section>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
