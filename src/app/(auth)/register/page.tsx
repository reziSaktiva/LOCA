import Link from "next/link";

/**
 * Register placeholder (M6.6). Form lengkap di M6.8.
 */
export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">Daftar</h1>
        <p className="text-sm text-muted-foreground">
          Form registrasi akan tersedia di milestone Auth UI berikutnya.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
