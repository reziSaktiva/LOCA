import { createSupabaseServerClient } from "../supabase/server";

export type AdminGuardResult =
  | { authorized: true; userId: string }
  | { authorized: false; reason: "UNAUTHORIZED" | "FORBIDDEN" };

/**
 * Memverifikasi bahwa request berasal dari user yang terautentikasi dengan role admin.
 * Role admin disimpan di `app_metadata.role` oleh Supabase (hanya bisa diset via service role).
 *
 * Gunakan di awal setiap route handler admin sebelum memproses request.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, reason: "UNAUTHORIZED" };
  }

  const role = (user.app_metadata as Record<string, unknown>)?.role;
  if (role !== "admin") {
    return { authorized: false, reason: "FORBIDDEN" };
  }

  return { authorized: true, userId: user.id };
}
