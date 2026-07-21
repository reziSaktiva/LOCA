import { redirect } from "next/navigation";

import { requireAdmin } from "@/shared/infrastructure/auth/admin-guard";
import { AdminSidebar } from "@/shared/ui/layout/admin-sidebar";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const guard = await requireAdmin();
  if (!guard.authorized) {
    redirect(guard.reason === "UNAUTHORIZED" ? "/login" : "/");
  }

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border px-4 md:px-6">
          <p className="text-sm font-medium text-muted-foreground">Admin Console</p>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
