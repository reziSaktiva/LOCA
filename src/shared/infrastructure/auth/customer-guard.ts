import { createSupabaseServerClient } from "../supabase/server";

export type CustomerGuardResult =
  | { authorized: true; userId: string; email: string }
  | { authorized: false; reason: "UNAUTHORIZED" };

/**
 * Memverifikasi bahwa request berasal dari customer yang terautentikasi.
 * Menggunakan getUser() (bukan getSession()) untuk memastikan validasi JWT via Supabase server.
 *
 * Gunakan di awal setiap route handler yang membutuhkan customer session.
 */
export async function requireCustomer(): Promise<CustomerGuardResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, reason: "UNAUTHORIZED" };
  }

  return { authorized: true, userId: user.id, email: user.email! };
}
