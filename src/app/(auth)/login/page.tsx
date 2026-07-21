import { LoginForm, safeRedirectPath } from "@/modules/auth/presentation";

export const metadata = {
  title: "Masuk — LOCA",
  description: "Masuk ke akun LOCA untuk belanja dan kelola profil.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[]; registered?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(firstParam(params.next));
  const justRegistered = firstParam(params.registered) === "1";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      {justRegistered ? (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Akun berhasil dibuat. Silakan masuk.
        </p>
      ) : null}
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
