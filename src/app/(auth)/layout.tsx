import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let isAuthenticated = false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);
  } catch {
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex justify-center px-4 py-8">
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          LOCA
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
