import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "../env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabase.url, env.supabase.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components tidak bisa menulis cookies.
          // Middleware (Proxy) yang menangani refresh dan penulisan cookies.
        }
      },
    },
  });
}
