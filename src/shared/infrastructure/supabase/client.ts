"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "../env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(env.supabase.url, env.supabase.publishableKey);
}
